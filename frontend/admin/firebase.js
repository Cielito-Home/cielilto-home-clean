// Firebase.js - OPTIMIZADO PARA RAILWAY/PRODUCCIÓN

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBQxxfctZoCFH4JwEybLU8fxIbhi11_uTs",
  authDomain: "clean-ceebe.firebaseapp.com",
  projectId: "clean-ceebe",
  storageBucket: "clean-ceebe.appspot.com",
  messagingSenderId: "204280927649",
  appId: "1:204280927649:web:64074548b5f1f0469827e0",
  measurementId: "G-4NEW8NX8Q8"
};

// Detectar entorno
const isProduction = window.location.hostname !== 'localhost' && 
                    window.location.hostname !== '127.0.0.1' &&
                    window.location.protocol === 'https:';

const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';

const isRailway = window.location.hostname.includes('railway.app') ||
                 window.location.hostname.includes('up.railway.app');

console.log('🌐 Entorno detectado:', {
    isProduction,
    isLocalhost,
    isRailway,
    hostname: window.location.hostname,
    protocol: window.location.protocol
});

// Inicializar Firebase
let app, db, auth;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('🔥 Firebase inicializado correctamente');
} catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
    showInitError('Error de configuración de Firebase');
}

// Configurar proveedor de Google según el entorno
const googleProvider = new GoogleAuthProvider();

if (isProduction || isRailway) {
    // Configuración optimizada para producción
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    googleProvider.setCustomParameters({
        prompt: 'select_account',
        include_granted_scopes: true
    });
    console.log('🚀 Configuración de producción aplicada');
} else {
    // Configuración básica para desarrollo
    googleProvider.setCustomParameters({
        prompt: 'select_account'
    });
    console.log('🔧 Configuración de desarrollo aplicada');
}

let loginInProgress = false;

// Función para mostrar errores de inicialización
function showInitError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #fee, #fdd);
        color: #c53030;
        padding: 1rem 2rem;
        border-radius: 12px;
        border: 1px solid #fc8181;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle me-2"></i>
        ${message}
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 10000);
}

// ✅ FUNCIÓN PRINCIPAL DE LOGIN - OPTIMIZADA POR ENTORNO
export async function signInWithGoogle() {
    if (loginInProgress) {
        console.log('⚠️ Login ya en progreso...');
        return { success: false, error: 'Login ya en proceso' };
    }

    if (!auth) {
        return { success: false, error: 'Firebase Auth no está disponible' };
    }

    loginInProgress = true;
    console.log('🚀 Iniciando autenticación en entorno:', isProduction ? 'Producción' : 'Desarrollo');

    try {
        // Paso 1: Verificar resultado de redirect
        console.log('🔄 Verificando redirect result...');
        
        try {
            const redirectResult = await getRedirectResult(auth);
            
            if (redirectResult && redirectResult.user) {
                console.log('✅ Usuario autenticado via redirect:', redirectResult.user.email);
                
                const isAuthorized = await checkUserAuthorization(redirectResult.user.email);
                
                if (isAuthorized) {
                    console.log('✅ Usuario autorizado');
                    return { 
                        success: true, 
                        user: redirectResult.user,
                        message: 'Login exitoso'
                    };
                } else {
                    console.log('❌ Usuario no autorizado');
                    await firebaseSignOut(auth);
                    return { 
                        success: false, 
                        error: 'Tu cuenta no tiene permisos de administrador.' 
                    };
                }
            }
        } catch (redirectError) {
            console.log('⚠️ Error verificando redirect:', redirectError.code);
        }

        // Paso 2: Estrategia según entorno
        if (isProduction || isRailway) {
            // En producción, popup funciona mejor
            console.log('🪟 Usando popup para producción...');
            
            try {
                const result = await signInWithPopup(auth, googleProvider);
                console.log('✅ Popup exitoso:', result.user.email);
                
                const isAuthorized = await checkUserAuthorization(result.user.email);
                
                if (isAuthorized) {
                    console.log('✅ Usuario autorizado');
                    return { 
                        success: true, 
                        user: result.user,
                        message: 'Login exitoso'
                    };
                } else {
                    console.log('❌ Usuario no autorizado');
                    await firebaseSignOut(auth);
                    return { 
                        success: false, 
                        error: 'Tu cuenta no tiene permisos de administrador.' 
                    };
                }
                
            } catch (popupError) {
                console.log('⚠️ Popup falló, usando redirect:', popupError.code);
                
                // Fallback a redirect
                sessionStorage.setItem('auth_redirect_pending', 'true');
                sessionStorage.setItem('auth_redirect_timestamp', Date.now().toString());
                
                await signInWithRedirect(auth, googleProvider);
                
                return { 
                    success: true, 
                    message: 'Redirigiendo a Google...' 
                };
            }
            
        } else {
            // En desarrollo, usar redirect directamente
            console.log('🔄 Usando redirect para desarrollo...');
            
            sessionStorage.setItem('auth_redirect_pending', 'true');
            sessionStorage.setItem('auth_redirect_timestamp', Date.now().toString());
            
            await signInWithRedirect(auth, googleProvider);
            
            return { 
                success: true, 
                message: 'Redirigiendo a Google...' 
            };
        }
        
    } catch (error) {
        console.error('❌ Error general en login:', error);
        
        let errorMessage;
        
        switch (error.code) {
            case 'auth/network-request-failed':
                errorMessage = 'Sin conexión a internet. Verifica tu red.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Demasiados intentos. Espera 5 minutos.';
                break;
            case 'auth/unauthorized-domain':
                errorMessage = 'Dominio no autorizado en Firebase Console.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Login con Google no está habilitado.';
                break;
            case 'auth/popup-blocked':
                errorMessage = 'Popup bloqueado por el navegador.';
                break;
            case 'auth/cancelled-popup-request':
                errorMessage = 'Login cancelado por el usuario.';
                break;
            default:
                errorMessage = `Error: ${error.message}`;
        }
        
        return { 
            success: false, 
            error: errorMessage
        };
    } finally {
        loginInProgress = false;
    }
}

// ✅ Verificar autorización del usuario
export async function checkUserAuthorization(email) {
    try {
        console.log('🔍 Verificando autorización para:', email);
        
        const authorizedEmails = [
            'sistemas16ch@gmail.com',
            'sistemas16cielitohome@gmail.com',
            'leticia@cielitohome.com',
            'sistemas@cielitohome.com',
            'admin@cielitohome.com',
            'cielitoclean@cielitohome.com'
        ];
        
        const isDirectlyAuthorized = authorizedEmails.includes(email.toLowerCase());
        
        if (isDirectlyAuthorized) {
            console.log('✅ Email autorizado directamente');
            return true;
        }
        
        // Verificar en Firestore si está disponible
        if (db) {
            try {
                const q = query(
                    collection(db, 'admin_users'),
                    where('email', '==', email),
                    limit(1)
                );
                
                const snapshot = await getDocs(q);
                const isInFirestore = !snapshot.empty;
                
                console.log('🔍 Usuario en Firestore:', isInFirestore);
                return isInFirestore;
                
            } catch (firestoreError) {
                console.warn('⚠️ Error verificando Firestore:', firestoreError.message);
                return isDirectlyAuthorized;
            }
        }
        
        return isDirectlyAuthorized;
        
    } catch (error) {
        console.error('❌ Error verificando autorización:', error);
        return false;
    }
}

// ✅ Logout
export async function signOut() {
    try {
        if (auth) {
            await firebaseSignOut(auth);
        }
        console.log('✅ Sesión cerrada');
        
        sessionStorage.clear();
        localStorage.clear();
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
        
    } catch (error) {
        console.error('❌ Error cerrando sesión:', error);
        window.location.href = 'index.html';
    }
}

// ✅ Función para redirect directo
export async function initiateSignInWithRedirect() {
    try {
        if (!auth) {
            throw new Error('Auth no disponible');
        }
        
        console.log('🔄 Iniciando redirect a Google...');
        
        sessionStorage.setItem('auth_redirect_pending', 'true');
        sessionStorage.setItem('auth_redirect_timestamp', Date.now().toString());
        
        await signInWithRedirect(auth, googleProvider);
        
    } catch (error) {
        console.error('❌ Error en redirect:', error);
        throw error;
    }
}

// ✅ Procesar redirect result
window.addEventListener('load', async () => {
    setTimeout(async () => {
        const redirectPending = sessionStorage.getItem('auth_redirect_pending');
        const redirectTimestamp = sessionStorage.getItem('auth_redirect_timestamp');
        
        const isRecentRedirect = redirectTimestamp && 
            (Date.now() - parseInt(redirectTimestamp)) < 300000;
        
        if (redirectPending === 'true' && isRecentRedirect && auth) {
            console.log('🔄 Procesando resultado de redirect...');
            
            try {
                const result = await getRedirectResult(auth);
                
                if (result && result.user) {
                    console.log('✅ Redirect exitoso:', result.user.email);
                    
                    const isAuthorized = await checkUserAuthorization(result.user.email);
                    
                    if (isAuthorized) {
                        console.log('✅ Usuario autorizado');
                        sessionStorage.removeItem('auth_redirect_pending');
                        sessionStorage.removeItem('auth_redirect_timestamp');
                        
                        if (window.location.pathname.includes('index.html') || 
                            window.location.pathname === '/') {
                            window.location.href = 'admin.html';
                        }
                    } else {
                        console.log('❌ Usuario no autorizado');
                        await firebaseSignOut(auth);
                        sessionStorage.clear();
                        alert('Tu cuenta no tiene permisos de administrador.');
                        window.location.href = 'index.html';
                    }
                } else {
                    console.log('⚠️ No se recibió usuario del redirect');
                    sessionStorage.removeItem('auth_redirect_pending');
                    sessionStorage.removeItem('auth_redirect_timestamp');
                }
            } catch (error) {
                console.error('❌ Error procesando redirect:', error);
                sessionStorage.clear();
            }
        } else if (redirectPending === 'true') {
            console.log('🧹 Limpiando redirect antiguo');
            sessionStorage.removeItem('auth_redirect_pending');
            sessionStorage.removeItem('auth_redirect_timestamp');
        }
    }, 1000);
});

// ✅ Observador de estado de autenticación
if (auth) {
    onAuthStateChanged(auth, async (user) => {
        console.log('👤 Estado de auth:', user ? user.email : 'Sin usuario');
        
        if (user) {
            if (window.location.pathname.includes('admin.html')) {
                const isAuthorized = await checkUserAuthorization(user.email);
                
                if (!isAuthorized) {
                    console.log('❌ Usuario no autorizado');
                    await signOut();
                    return;
                }
                
                console.log('✅ Usuario autorizado');
                showUserInfo(user);
            }
        } else {
            if (window.location.pathname.includes('admin.html')) {
                console.log('❌ Sin usuario, redirigiendo...');
                window.location.href = 'index.html';
            }
        }
    });
}

// ✅ Mostrar información del usuario
function showUserInfo(user) {
    const userInfoContainer = document.querySelector('.admin-header .col-md-6:last-child');
    
    if (userInfoContainer && !userInfoContainer.querySelector('.user-info')) {
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info me-3 d-inline-block';
        userInfo.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${user.photoURL || '/images/default-avatar.png'}" 
                     alt="Avatar" 
                     style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px; object-fit: cover; border: 2px solid rgba(255,255,255,0.3);">
                <div style="color: white;">
                    <div style="font-size: 0.9rem; font-weight: 600;">${user.displayName || 'Admin'}</div>
                    <div style="font-size: 0.75rem; opacity: 0.8;">${user.email}</div>
                </div>
                <button onclick="window.signOut()" class="btn btn-outline-light btn-sm ms-2" title="Cerrar sesión">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
        `;
        
        const firstBtn = userInfoContainer.querySelector('button');
        if (firstBtn) {
            userInfoContainer.insertBefore(userInfo, firstBtn);
        } else {
            userInfoContainer.appendChild(userInfo);
        }
    }
}

// ✅ Función de diagnóstico
function diagnoseProblem() {
    const diagnosis = {
        environment: isProduction ? 'Production' : 'Development',
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        isRailway: isRailway,
        firebase: {
            app: !!app,
            auth: !!auth,
            db: !!db
        },
        user: auth?.currentUser?.email || null,
        redirectPending: sessionStorage.getItem('auth_redirect_pending'),
        url: window.location.href
    };
    
    console.log('🔍 Diagnóstico completo:', diagnosis);
    return diagnosis;
}

// ✅ Exportar para uso global
if (typeof window !== 'undefined') {
    window.db = db;
    window.auth = auth;

    window.firebase = {
        firestore: {
            collection,
            doc,
            addDoc,
            getDocs,
            deleteDoc,
            query,
            where,
            orderBy,
            limit,
            serverTimestamp
        }
    };

    window.signInWithGoogle = signInWithGoogle;
    window.signInWithRedirect = initiateSignInWithRedirect;
    window.signOut = signOut;
    window.checkUserAuthorization = checkUserAuthorization;
    window.diagnoseProblem = diagnoseProblem;
}

console.log(`🔥 Firebase configurado para ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'} en ${isRailway ? 'Railway' : 'otro servidor'}`);