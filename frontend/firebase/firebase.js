// ===============================================
// frontend/firebase/firebase.js
// Versión completa para Railway / producción
// - Inicializa Firebase con config explícita (sin /__/firebase/init.js)
// - Auth con signInWithPopup + persistencia local
// - Utilidades Firestore (CRUD genérico + helpers de colecciones comunes)
// ===============================================

/* ============================
 * IMPORTS (Firebase v10.x)
 * ============================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  getIdToken
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ============================
 * CONFIGURACIÓN DE FIREBASE
 * (Reemplaza con tu config real desde Firebase Console)
 * ============================ */
const firebaseConfig = {
  apiKey: "AIzaSyBQxxfctZoCFH4JwEybLU8fxIbhi11_uTs",
  authDomain: "clean-ceebe.firebaseapp.com",
  projectId: "clean-ceebe",
  storageBucket: "clean-ceebe.appspot.com",
  messagingSenderId: "204280927649",
  appId: "1:204280927649:web:64074548b5f1f0469827e0",
  measurementId: "G-4NEW8NX8Q8"
};

/* ============================
 * INICIALIZACIÓN
 * ============================ */
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const auth = getAuth(app);

// Persistencia local para que no te “regrese” al login al refrescar
await setPersistence(auth, browserLocalPersistence);

// Proveedor Google (puedes añadir más si usas Email/Password, etc.)
const googleProvider = new GoogleAuthProvider();

/* ============================
 * AUTH: HELPERS
 * ============================ */

/**
 * Inicia sesión con Google usando popup (evita /__/auth/handler).
 * Retorna { success, user | error }.
 */
export async function signInWithGoogle() {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return { success: true, user: res.user };
  } catch (err) {
    console.error("❌ Error al iniciar sesión:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Cierra sesión.
 */
export async function logOut() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (err) {
    console.error("❌ Error al cerrar sesión:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Observa el estado de autenticación.
 * Uso:
 *   onSessionChange((user) => { ... });
 */
export function onSessionChange(cb) {
  return onAuthStateChanged(auth, cb);
}

/**
 * Obtiene el ID Token actual (útil si lo vas a enviar a tu backend).
 */
export async function getCurrentIdToken(forceRefresh = false) {
  if (!auth.currentUser) return null;
  return getIdToken(auth.currentUser, forceRefresh);
}

/**
 * Verifica si el usuario autenticado está autorizado en la colección `usuarios`.
 * Se espera una colección `usuarios` con documentos { email: string, active: boolean }.
 * Retorna { allowed: boolean, reason?: string }.
 */
export async function checkPanelAccess(email) {
  try {
    if (!email) return { allowed: false, reason: "Sin email" };
    const q = query(
      collection(db, "usuarios"),
      where("email", "==", email),
      where("active", "==", true),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) return { allowed: true };
    return { allowed: false, reason: "No autorizado en colección usuarios" };
  } catch (err) {
    console.error("❌ Error al validar acceso:", err);
    return { allowed: false, reason: err?.message || String(err) };
  }
}

/* ============================
 * FIRESTORE: CRUD GENÉRICO
 * ============================ */

/**
 * Crea un documento en la colección indicada.
 */
export async function createDoc(collName, data = {}) {
  try {
    const ref = await addDoc(collection(db, collName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: ref.id };
  } catch (err) {
    console.error(`❌ Error al crear en ${collName}:`, err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Obtiene todos los documentos de una colección (opcional: ordenado por campo).
 */
export async function listDocs(collName, orderField = "createdAt", orderDir = "desc") {
  try {
    const q = query(collection(db, collName), orderBy(orderField, orderDir));
    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return { success: true, items };
  } catch (err) {
    console.error(`❌ Error al listar ${collName}:`, err);
    return { success: false, error: err?.message || String(err), items: [] };
  }
}

/**
 * Obtiene un documento por ID.
 */
export async function getDocById(collName, id) {
  try {
    const ref = doc(db, collName, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: "No existe" };
    return { success: true, item: { id: snap.id, ...snap.data() } };
  } catch (err) {
    console.error(`❌ Error al obtener ${collName}/${id}:`, err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Actualiza un documento por ID.
 */
export async function updateDocById(collName, id, data = {}) {
  try {
    const ref = doc(db, collName, id);
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (err) {
    console.error(`❌ Error al actualizar ${collName}/${id}:`, err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Elimina un documento por ID.
 */
export async function deleteDocById(collName, id) {
  try {
    const ref = doc(db, collName, id);
    await deleteDoc(ref);
    return { success: true };
  } catch (err) {
    console.error(`❌ Error al eliminar ${collName}/${id}:`, err);
    return { success: false, error: err?.message || String(err) };
  }
}

/* ============================
 * HELPERS ESPECÍFICOS (opcionales)
 * Ajusta los nombres de colección si usas otros
 * ============================ */

// Contacto (formulario)
export async function saveContacto(payload) {
  return createDoc("mensajesContacto", payload);
}

// Newsletter (suscriptores)
export async function saveNewsletter(payload) {
  return createDoc("newsletter_users", payload);
}

// Utilidad para listar mensajes de contacto
export async function listContacto() {
  return listDocs("mensajesContacto");
}

// Utilidad para listar suscriptores
export async function listNewsletter() {
  return listDocs("newsletter_users");
}

/* ============================
 * EXPORTS CRUZADOS (compatibilidad)
 * Si en otros módulos importas directamente funciones de Firebase,
 * también las exponemos para no romper tu código existente.
 * ============================ */
export {
  // Firebase bases
  app, db, auth,
  // Firestore base
  collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where, limit,
  // Auth base
  GoogleAuthProvider
};

// Asegura que exista el namespace
window.firebase = window.firebase || {};
window.firebase.firestore = {
  // Firestore v10 funciones que usas en admin.js
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  limit
};

// Exponer instancias para admin.js
window.app  = app;
window.db   = db;
window.auth = auth;

window.saveNewsletter = saveNewsletter;
window.saveContacto = saveContacto; // <-- AGREGA ESTA LÍNEA

// Puentes a tus helpers (admin.js llama “checkUserAuthorization” y “signOut”)
window.checkUserAuthorization = async (email) => {
  // normaliza por si acaso
  return (await checkPanelAccess(email.toLowerCase())).allowed === true;
};
window.signOut = logOut;
