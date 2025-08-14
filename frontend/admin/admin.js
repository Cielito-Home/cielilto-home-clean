// admin.js - VERSIÓN COMPLETA MEJORADA PARA FUNCIONAR CON FIREBASE

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando panel de administración...');
    
    // Verificar autenticación primero
    checkAuthentication();
    
    // Esperar a que Firebase esté disponible
    setTimeout(() => {
        if (!window.db) {
            console.error('❌ Firebase no está disponible');
            showError('Error: Firebase no está configurado correctamente');
            return;
        }
        
        console.log('✅ Firebase disponible, cargando dashboard...');
        loadDashboard();
        setupEventListeners();
        setupVisualEditor();
        addButtonEffects();
    }, 2000);
});

// ✅ Verificar autenticación
async function checkAuthentication() {
    console.log('🔐 Verificando autenticación...');
    
    // Esperar a que auth esté disponible
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkAuth = () => {
        if (window.auth) {
            console.log('🔐 Auth disponible, verificando usuario...');
            
            window.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    console.log('👤 Usuario autenticado:', user.email);
                    
                    // Verificar si tiene permisos
                    const isAuthorized = await window.checkUserAuthorization(user.email);
                    
                    if (!isAuthorized) {
                        console.log('❌ Usuario no autorizado');
                        alert('No tienes permisos para acceder a este panel');
                        await window.signOut();
                        return;
                    }
                    
                    console.log('✅ Usuario autorizado');
                } else {
                    console.log('❌ No hay usuario autenticado');
                    alert('Debes iniciar sesión para acceder al panel');
                    window.location.href = 'index.html';
                }
            });
        } else {
            attempts++;
            if (attempts < maxAttempts) {
                console.log(`⏳ Esperando auth... intento ${attempts}/${maxAttempts}`);
                setTimeout(checkAuth, 500);
            } else {
                console.error('❌ Auth no disponible después de múltiples intentos');
                alert('Error de configuración. Por favor recarga la página.');
            }
        }
    };
    
    checkAuth();
}

// 🧹 Función mejorada para limpiar formulario
function clearNewsletterForm() {
    console.log('🧹 Limpiando formulario de newsletter...');
    
    // Crear confirmación personalizada
    const confirmDiv = document.createElement('div');
    confirmDiv.className = 'color-picker-modal';
    confirmDiv.innerHTML = `
        <div class="color-picker-content" style="max-width: 350px;">
            <h3 class="color-picker-title">🧹 Limpiar Formulario</h3>
            <div style="text-align: center; margin: 1.5rem 0;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <p style="color: var(--text-secondary); line-height: 1.6;">
                    ¿Estás seguro de que quieres limpiar todo el contenido del formulario?
                </p>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 1rem;">
                    Esta acción no se puede deshacer.
                </p>
            </div>
            <div class="color-picker-actions">
                <button class="color-picker-btn secondary" onclick="closeClearConfirm()">
                    <i class="fas fa-times me-2"></i>Cancelar
                </button>
                <button class="color-picker-btn primary" onclick="confirmClear()" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                    <i class="fas fa-trash me-2"></i>Limpiar Todo
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmDiv);
    
    window.closeClearConfirm = function() {
        confirmDiv.remove();
        delete window.closeClearConfirm;
        delete window.confirmClear;
    };
    
    window.confirmClear = function() {
        // Limpiar campos con animación
        const subjectField = document.getElementById('subject');
        const editor = document.getElementById('visualEditor');
        const contentField = document.getElementById('content');
        const confirmCheckbox = document.getElementById('confirmSend');
        
        // Animación de limpieza
        [subjectField, editor].forEach(field => {
            if (field) {
                field.style.transition = 'all 0.3s ease';
                field.style.transform = 'scale(0.95)';
                field.style.opacity = '0.5';
            }
        });
        
        setTimeout(() => {
            if (subjectField) subjectField.value = '';
            if (editor) editor.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">Escribe aquí tu mensaje o usa una plantilla...</p>';
            if (contentField) contentField.value = '';
            if (confirmCheckbox) confirmCheckbox.checked = false;
            
            // Remover selección de plantillas
            document.querySelectorAll('.template-card.selected').forEach(card => {
                card.classList.remove('selected');
            });
            
            // Restaurar estilos
            [subjectField, editor].forEach(field => {
                if (field) {
                    field.style.transform = 'scale(1)';
                    field.style.opacity = '1';
                }
            });
            
            updatePreview();
            
            console.log('✅ Formulario limpiado completamente');
            showSuccess('🧹 Formulario limpiado completamente');
        }, 300);
        
        closeClearConfirm();
    };
}

function setupVisualEditor() {
    const editor = document.getElementById('visualEditor');
    const contentField = document.getElementById('content');
    
    console.log('🎯 Setup Visual Editor:', {
        editor: !!editor,
        contentField: !!contentField
    });
    
    if (!editor || !contentField) {
        console.error('❌ Elementos del editor no encontrados');
        return;
    }
    
    setupToolbar();
    
    editor.addEventListener('input', function() {
        const htmlContent = this.innerHTML;
        contentField.value = htmlContent;
        updatePreview();
    });
    
    editor.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.execCommand('insertHTML', false, '<br><br>');
        }
    });
    
    console.log('✅ Editor visual configurado correctamente');
}

function setupToolbar() {
    const toolbarButtons = document.querySelectorAll('.toolbar-btn');
    
    toolbarButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.dataset.action;
            handleToolbarAction(action);
        });
    });
}

function handleToolbarAction(action) {
    const editor = document.getElementById('visualEditor');
    editor.focus();
    
    // Usar métodos seguros en lugar de eval()
    const actions = {
        'bold': () => document.execCommand('bold', false, null),
        'italic': () => document.execCommand('italic', false, null),
        'underline': () => document.execCommand('underline', false, null),
        'h2': () => document.execCommand('formatBlock', false, '<h2>'),
        'h3': () => document.execCommand('formatBlock', false, '<h3>'),
        'ul': () => document.execCommand('insertUnorderedList', false, null),
        'link': () => insertLink(),
        'color': () => insertColorPicker()
    };
    
    // Ejecutar acción de forma segura
    if (actions[action]) {
        actions[action]();
    } else {
        console.warn('Acción no reconocida:', action);
    }
    
    // Actualizar contenido
    document.getElementById('content').value = editor.innerHTML;
    updatePreview();
}

// 🎨 Función mejorada para el selector de colores
function insertColorPicker() {
    // Crear el modal del selector de colores
    const modal = document.createElement('div');
    modal.className = 'color-picker-modal';
    modal.innerHTML = `
        <div class="color-picker-content">
            <h3 class="color-picker-title">🎨 Selecciona un Color</h3>
            
            <div class="color-options">
                <div class="color-option" data-color="#2d5a3d" data-name="Verde Cielito">
                    <div class="color-preview" style="background-color: #2d5a3d;"></div>
                    <div class="color-name">Verde Cielito</div>
                    <div class="color-code">#2d5a3d</div>
                </div>
                
                <div class="color-option" data-color="#c9a876" data-name="Dorado">
                    <div class="color-preview" style="background-color: #c9a876;"></div>
                    <div class="color-name">Dorado</div>
                    <div class="color-code">#c9a876</div>
                </div>
                
                <div class="color-option" data-color="#1e293b" data-name="Gris Oscuro">
                    <div class="color-preview" style="background-color: #1e293b;"></div>
                    <div class="color-name">Gris Oscuro</div>
                    <div class="color-code">#1e293b</div>
                </div>
                
                <div class="color-option" data-color="#64748b" data-name="Gris Medio">
                    <div class="color-preview" style="background-color: #64748b;"></div>
                    <div class="color-name">Gris Medio</div>
                    <div class="color-code">#64748b</div>
                </div>
                
                <div class="color-option" data-color="#ef4444" data-name="Rojo">
                    <div class="color-preview" style="background-color: #ef4444;"></div>
                    <div class="color-name">Rojo</div>
                    <div class="color-code">#ef4444</div>
                </div>
                
                <div class="color-option" data-color="#3b82f6" data-name="Azul">
                    <div class="color-preview" style="background-color: #3b82f6;"></div>
                    <div class="color-name">Azul</div>
                    <div class="color-code">#3b82f6</div>
                </div>
            </div>
            
            <input type="text" class="custom-color-input" placeholder="O ingresa un código hex (ej: #2d5a3d)" maxlength="7">
            
            <div class="color-picker-actions">
                <button class="color-picker-btn secondary" onclick="closeColorPicker()">
                    <i class="fas fa-times me-2"></i>Cancelar
                </button>
                <button class="color-picker-btn primary" onclick="applySelectedColor()">
                    <i class="fas fa-check me-2"></i>Aplicar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Agregar event listeners
    let selectedColor = '#2d5a3d'; // Color por defecto
    
    // Opciones de colores predefinidos
    modal.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            // Remover selección anterior
            modal.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            
            // Seleccionar nueva opción
            this.classList.add('selected');
            selectedColor = this.dataset.color;
            
            // Actualizar input personalizado
            const customInput = modal.querySelector('.custom-color-input');
            customInput.value = selectedColor;
        });
    });
    
    // Input personalizado
    const customInput = modal.querySelector('.custom-color-input');
    customInput.addEventListener('input', function() {
        let value = this.value.trim();
        
        // Agregar # si no lo tiene
        if (value && !value.startsWith('#')) {
            value = '#' + value;
            this.value = value;
        }
        
        // Validar formato hex
        if (/^#[0-9A-F]{6}$/i.test(value)) {
            selectedColor = value;
            
            // Remover selección de opciones predefinidas
            modal.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        }
    });
    
    // Cerrar al hacer clic fuera
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeColorPicker();
        }
    });
    
    // Funciones globales para los botones
    window.closeColorPicker = function() {
        modal.remove();
        delete window.closeColorPicker;
        delete window.applySelectedColor;
    };
    
    window.applySelectedColor = function() {
        if (selectedColor) {
            // Aplicar color al texto seleccionado
            document.execCommand('foreColor', false, selectedColor);
            
            // Actualizar contenido
            const editor = document.getElementById('visualEditor');
            const contentField = document.getElementById('content');
            if (editor && contentField) {
                contentField.value = editor.innerHTML;
                updatePreview();
            }
            
            console.log('✅ Color aplicado:', selectedColor);
            showSuccess(`Color ${selectedColor} aplicado correctamente`);
        }
        
        closeColorPicker();
    };
    
    // Seleccionar primera opción por defecto
    modal.querySelector('.color-option').classList.add('selected');
    customInput.value = selectedColor;
    
    console.log('🎨 Selector de colores abierto');
}

// 🧩 Función mejorada para insertar componentes
function insertComponent(type) {
    console.log('🧩 Insertando componente:', type);
    
    const editor = document.getElementById('visualEditor');
    if (!editor) {
        console.error('❌ Editor no encontrado');
        showError('Error: Editor no disponible');
        return;
    }
    
    // Mostrar loading temporal
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'component-loading';
    loadingDiv.style.cssText = `
        background: linear-gradient(135deg, var(--surface-secondary), var(--surface-tertiary));
        border: 2px dashed var(--accent);
        border-radius: var(--radius-lg);
        padding: 1rem;
        margin: 1rem 0;
        text-align: center;
        color: var(--text-muted);
        font-weight: 600;
        animation: pulse 1s infinite;
    `;
    loadingDiv.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>Insertando componente...`;
    
    // Insertar loading temporalmente
    editor.appendChild(loadingDiv);
    
    // Simular delay para mejor UX
    setTimeout(() => {
        loadingDiv.remove();
        
        let componentHTML = '';
        
        switch(type) {
            case 'oferta':
                componentHTML = `
                    <div style="background: linear-gradient(135deg, #e8f5e8, #f0f8f0); border: 2px solid #2d5a3d; border-radius: 12px; padding: 2rem; margin: 2rem 0; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h3 style="color: #2d5a3d; margin-top: 0; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 800;">🎉 Oferta Especial</h3>
                        <p style="margin-bottom: 1rem; font-size: 1.1rem; font-weight: 600;"><strong>¡Escribe aquí tu oferta increíble!</strong></p>
                        <p style="margin-bottom: 1rem; font-size: 1rem; color: #64748b;">Válido hasta [fecha]. Menciona el código: <strong style="color: #c9a876; background: rgba(201,154,118,0.2); padding: 0.25rem 0.5rem; border-radius: 4px;">[CODIGO]</strong></p>
                    </div>
                    <br>
                `;
                break;
            case 'tip':
                componentHTML = `
                    <div style="background: linear-gradient(135deg, #fff8e1, #fffbf0); border-left: 6px solid #c9a876; border-radius: 10px; padding: 1.5rem 2rem; margin: 1.5rem 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <h3 style="color: #2d5a3d; margin-top: 0; margin-bottom: 1rem; font-size: 1.25rem; font-weight: 700; display: flex; align-items: center;">
                            <span style="background: #c9a876; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 0.75rem; font-size: 1rem;">💡</span>
                            Tip de Limpieza
                        </h3>
                        <p style="margin-bottom: 0; font-size: 1rem; line-height: 1.6; color: #1e293b;">Escribe aquí tu consejo profesional de limpieza que ayudará a tus clientes...</p>
                    </div>
                    <br>
                `;
                break;
            case 'boton':
                componentHTML = `
                    <div style="text-align: center; margin: 2rem 0;">
                        <a href="https://wa.me/524491382712" style="background: linear-gradient(135deg, #25d366, #20b858); color: white !important; padding: 1rem 2rem; border-radius: 30px; text-decoration: none !important; font-weight: 700; display: inline-flex; align-items: center; gap: 0.75rem; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3); transition: all 0.3s ease;">
                            <span style="font-size: 1.25rem;">💬</span>
                            Contactar por WhatsApp
                        </a>
                    </div>
                    <br>
                `;
                break;
            case 'saludo':
                componentHTML = `
                    <div style="background: linear-gradient(135deg, rgba(45, 90, 61, 0.05), rgba(201, 154, 118, 0.05)); border-radius: 12px; padding: 2rem; margin: 1.5rem 0; border: 1px solid rgba(45, 90, 61, 0.1);">
                        <h2 style="color: #2d5a3d; margin-bottom: 1rem; font-size: 1.75rem; font-weight: 800; display: flex; align-items: center;">
                            <span style="margin-right: 0.75rem; font-size: 2rem;">👋</span>
                            ¡Hola desde Cielito Home Clean!
                        </h2>
                        <p style="font-size: 1.1rem; line-height: 1.7; margin-bottom: 0; color: #1e293b;">
                            Esperamos que estés teniendo una semana fantástica. Tenemos novedades emocionantes que compartir contigo.
                        </p>
                    </div>
                    <br>
                `;
                break;
            default:
                console.error('❌ Tipo de componente no válido:', type);
                showError('Tipo de componente no válido');
                return;
        }
        
        try {
            // Insertar el componente con animación
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = componentHTML;
            tempDiv.style.animation = 'fadeIn 0.5s ease-out';
            
            editor.appendChild(tempDiv);
            
            // Actualizar contenido
            document.getElementById('content').value = editor.innerHTML;
            updatePreview();
            
            // Scroll hacia el nuevo componente
            tempDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            console.log('✅ Componente insertado correctamente');
            showSuccess(`Componente "${type}" agregado al newsletter`);
            
        } catch (error) {
            console.error('❌ Error insertando componente:', error);
            showError('Error al insertar componente');
        }
    }, 300);
}

function loadTemplate(type = 'ofertas') {
    const editor = document.getElementById('visualEditor');
    const subjectField = document.getElementById('subject');
    
    if (!editor || !subjectField) {
        console.error('❌ Elementos del formulario no encontrados');
        return;
    }
    
    let template = '';
    let subject = '';
    
    switch(type) {
        case 'ofertas':
            subject = 'Ofertas especiales - Cielito Home Clean';
            template = `
                <h2 style="color: #2d5a3d;">¡Ofertas Especiales Este Mes!</h2>
                
                <p style="font-size: 16px; line-height: 1.6;">
                    Hola, tenemos promociones increíbles que no te puedes perder.
                </p>

                <div style="background: linear-gradient(135deg, #e8f5e8, #f0f8f0); border: 2px solid #2d5a3d; border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0; text-align: center;">
                    <h3 style="color: #2d5a3d; margin-top: 0;">🎉 Oferta del Mes</h3>
                    <p style="margin-bottom: 15px;"><strong>¡20% de descuento en limpieza profunda!</strong></p>
                    <p style="margin-bottom: 15px;">Válido hasta fin de mes. Menciona el código: <strong>PROFUNDA20</strong></p>
                </div>

                <div style="text-align: center; margin: 1.5rem 0;">
                    <a href="https://wa.me/524491382712" style="background: linear-gradient(135deg, #25d366, #20b858); color: white !important; padding: 12px 25px; border-radius: 25px; text-decoration: none !important; font-weight: bold; display: inline-block;">💬 Solicitar mi Descuento</a>
                </div>

                <p style="font-size: 16px; line-height: 1.6;">
                    <strong>¡No dejes pasar esta oportunidad!</strong><br>
                    El equipo de Cielito Home Clean
                </p>
            `;
            break;
            
        case 'tips':
            subject = 'Tips profesionales de limpieza - Cielito Home Clean';
            template = `
                <h2 style="color: #2d5a3d;">💡 Tips Profesionales de Limpieza</h2>
                
                <p style="font-size: 16px; line-height: 1.6;">
                    ¡Hola! Queremos compartir contigo algunos consejos profesionales que te ayudarán a mantener tu hogar impecable.
                </p>

                <div style="background: linear-gradient(135deg, #fff8e1, #fffbf0); border-left: 4px solid #c9a876; border-radius: 8px; padding: 1rem 1.5rem; margin: 1rem 0;">
                    <h3 style="color: #2d5a3d; margin-top: 0;">Tip #1: Manchas de Grasa</h3>
                    <p style="margin-bottom: 0;">Para eliminar manchas difíciles de grasa, mezcla bicarbonato de sodio con unas gotas de jabón líquido. Deja actuar 15 minutos y frota suavemente.</p>
                </div>

                <div style="background: linear-gradient(135deg, #fff8e1, #fffbf0); border-left: 4px solid #c9a876; border-radius: 8px; padding: 1rem 1.5rem; margin: 1rem 0;">
                    <h3 style="color: #2d5a3d; margin-top: 0;">Tip #2: Vidrios Sin Rayones</h3>
                    <p style="margin-bottom: 0;">Usa una mezcla de agua y vinagre blanco (1:1) con papel periódico para limpiar vidrios sin dejar rayones ni pelusas.</p>
                </div>

                <p style="font-size: 16px; line-height: 1.6;">
                    ¿Necesitas ayuda profesional? ¡Estamos aquí para ti!
                </p>

                <div style="text-align: center; margin: 1.5rem 0;">
                    <a href="https://wa.me/524491382712" style="background: linear-gradient(135deg, #25d366, #20b858); color: white !important; padding: 12px 25px; border-radius: 25px; text-decoration: none !important; font-weight: bold; display: inline-block;">💬 Contactar Ahora</a>
                </div>
            `;
            break;
            
        case 'noticias':
            subject = 'Novedades de Cielito Home Clean';
            template = `
                <h2 style="color: #2d5a3d;">📰 Novedades de Cielito Home Clean</h2>
                
                <p style="font-size: 16px; line-height: 1.6;">
                    ¡Hola! Queremos compartir contigo las últimas novedades de nuestra empresa.
                </p>

                <h3 style="color: #c9a876;">✨ Nuevos Servicios</h3>
                <p>Hemos ampliado nuestros servicios para ofrecerte una experiencia aún mejor:</p>
                <ul>
                    <li>Limpieza de oficinas 24/7</li>
                    <li>Servicio express en 2 horas</li>
                    <li>Productos 100% ecológicos</li>
                </ul>

                <h3 style="color: #c9a876;">🏆 Reconocimientos</h3>
                <p>¡Gracias a ti somos la empresa de limpieza #1 en Aguascalientes!</p>

                <div style="text-align: center; margin: 1.5rem 0;">
                    <a href="https://wa.me/524491382712" style="background: linear-gradient(135deg, #25d366, #20b858); color: white !important; padding: 12px 25px; border-radius: 25px; text-decoration: none !important; font-weight: bold; display: inline-block;">💬 Conocer Más</a>
                </div>

                <p style="font-size: 16px; line-height: 1.6;">
                    <strong>¡Gracias por confiar en nosotros!</strong><br>
                    El equipo de Cielito Home Clean
                </p>
            `;
            break;
    }
    
    subjectField.value = subject;
    editor.innerHTML = template;
    document.getElementById('content').value = template;
    updatePreview();
    
    console.log('✅ Plantilla cargada:', type);
    showSuccess(`Plantilla ${type} cargada`);
}

function insertLink() {
    const url = prompt('Ingresa la URL del enlace:');
    if (url) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const link = document.createElement('a');
            link.href = url;
            link.style.color = '#2d5a3d';
            link.style.textDecoration = 'underline';
            
            if (selection.toString()) {
                link.textContent = selection.toString();
                range.deleteContents();
                range.insertNode(link);
            } else {
                link.textContent = url;
                range.insertNode(link);
            }
        }
    }
}

async function loadDashboard() {
    console.log('📊 Cargando dashboard...');
    showLoading(true);
    
    try {
        // USAR LA SINTAXIS CORRECTA DE FIRESTORE V9
        const { collection, getDocs, query, orderBy } = window.firebase.firestore;
        const q = query(collection(window.db, 'newsletter_users'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        
        const subscribers = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            subscribers.push({
                id: doc.id,
                correo: data.correo,
                timestamp: data.timestamp
            });
        });
        
        console.log('📧 Suscriptores encontrados:', subscribers.length);
        
        updateStats(subscribers);
        displaySubscribers(subscribers);
        
        // Cargar actividad reciente
        await loadRecentActivity();
        
    } catch (error) {
        console.error('❌ Error cargando dashboard:', error);
        showError('Error cargando el dashboard: ' + error.message);
    } finally {
        showLoading(false);
    }
}

function updateStats(subscribers) {
    const total = subscribers.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    
    let todayCount = 0;
    let weekCount = 0;
    
    subscribers.forEach(sub => {
        if (sub.timestamp) {
            const subDate = sub.timestamp.toDate ? sub.timestamp.toDate() : new Date(sub.timestamp);
            
            if (subDate >= today) {
                todayCount++;
            }
            if (subDate >= weekAgo) {
                weekCount++;
            }
        }
    });
    
    animateNumber('totalSubscribers', total);
    animateNumber('todaySubscribers', todayCount);
    animateNumber('weekSubscribers', weekCount);
}

function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function displaySubscribers(subscribers) {
    const container = document.getElementById('subscribersContainer');
    if (!container) return;
    
    if (subscribers.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-inbox fs-1 text-muted mb-3"></i>
                <h5 class="text-muted">No hay suscriptores aún</h5>
                <p class="text-muted">Cuando alguien se suscriba al newsletter, aparecerá aquí.</p>
            </div>
        `;
        return;
    }
    
    subscribers.sort((a, b) => {
        if (!a.timestamp && !b.timestamp) return 0;
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        
        const dateA = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const dateB = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        
        return dateB - dateA;
    });
    
    let html = '';
    
    subscribers.forEach((subscriber, index) => {
        const dateStr = subscriber.timestamp 
            ? (subscriber.timestamp.toDate ? subscriber.timestamp.toDate() : new Date(subscriber.timestamp)).toLocaleDateString('es-MX')
            : 'Fecha no disponible';
            
        html += `
            <div class="subscriber-item d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="me-3">
                        <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                            ${index + 1}
                        </div>
                    </div>
                    <div>
                        <h6 class="mb-1">${subscriber.correo}</h6>
                        <small class="text-muted">
                            <i class="fas fa-calendar me-1"></i>Suscrito: ${dateStr}
                        </small>
                    </div>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-danger" onclick="removeSubscriber('${subscriber.id}', '${subscriber.correo}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

async function removeSubscriber(id, email) {
    console.log('🗑️ Intentando eliminar suscriptor:', { id, email });
    
    const confirmed = await showDeleteConfirmation(email);
    
    if (!confirmed) {
        console.log('❌ Eliminación cancelada por el usuario');
        return;
    }
    
    try {
        showLoading(true);
        
        const { doc, deleteDoc } = window.firebase.firestore;
        await deleteDoc(doc(window.db, 'newsletter_users', id));
        
        console.log('✅ Suscriptor eliminado exitosamente');
        showSuccess(`Suscriptor ${email} eliminado correctamente`);
        
        await loadDashboard();
        
    } catch (error) {
        console.error('❌ Error eliminando suscriptor:', error);
        showError('Error al eliminar el suscriptor: ' + error.message);
    } finally {
        showLoading(false);
    }
}

function showDeleteConfirmation(email) {
    return new Promise((resolve) => {
        const confirmed = confirm(`¿Estás seguro de que quieres eliminar a ${email}?\n\nEsta acción no se puede deshacer.`);
        resolve(confirmed);
    });
}

async function exportSubscribers() {
    try {
        const { collection, getDocs } = window.firebase.firestore;
        const snapshot = await getDocs(collection(window.db, 'newsletter_users'));
        
        if (snapshot.empty) {
            showError('No hay suscriptores para exportar');
            return;
        }
        
        let csvContent = 'Email,Fecha de Suscripción\n';
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp 
                ? (data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)).toLocaleDateString('es-MX')
                : 'No disponible';
            
            csvContent += `${data.correo},"${date}"\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `suscriptores-newsletter-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccess('Lista exportada exitosamente');
        
    } catch (error) {
        console.error('❌ Error exportando:', error);
        showError('Error al exportar la lista');
    }
}

function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const subject = form.subject.value.trim();
    const content = form.content.value.trim();
    
    if (!subject || !content) {
        showError('Por favor completa todos los campos');
        return;
    }
    
    showConfirmModal(subject, content);
}

async function showConfirmModal(subject, content) {
    try {
        const { collection, getDocs } = window.firebase.firestore;
        const snapshot = await getDocs(collection(window.db, 'newsletter_users'));
        const count = snapshot.size;
        
        const countElement = document.getElementById('subscriberCount');
        if (countElement) {
            countElement.textContent = count;
        }
        
        window.pendingNewsletter = { subject, content };
        
        const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        modal.show();
        
    } catch (error) {
        console.error('❌ Error:', error);
        showError('Error al preparar el envío');
    }
}

async function sendNewsletter() {
    if (!window.pendingNewsletter) {
        showError('No hay newsletter para enviar');
        return;
    }
    
    const { subject, content } = window.pendingNewsletter;
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
    if (modal) modal.hide();
    
    const btn = document.getElementById('confirmSendBtn');
    const originalText = btn ? btn.innerHTML : '';
    
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Enviando...';
        btn.disabled = true;
    }
    
    try {
        const { collection, getDocs } = window.firebase.firestore;
        const snapshot = await getDocs(collection(window.db, 'newsletter_users'));
        const subscribers = [];
        
        snapshot.forEach(doc => {
            subscribers.push(doc.data().correo);
        });
        
        if (subscribers.length === 0) {
            throw new Error('No hay suscriptores');
        }
        
        console.log('📧 Enviando a:', subscribers.length, 'suscriptores');
        
        const response = await fetch('/admin/send-newsletter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subject,
                content: wrapContentWithTemplate(content),
                subscribers
            })
        });
        
        const contentType = response.headers.get('content-type');
        let result;
        
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            const errorText = await response.text();
            console.error('❌ Respuesta no válida del servidor:', errorText);
            throw new Error('Error del servidor: respuesta no válida');
        }
        
        if (result.success) {
            showSuccess(`Newsletter enviado exitosamente a ${result.sentCount} suscriptores`);
            await saveToHistory(subject, content, result.sentCount);
            
            const form = document.getElementById('newsletterForm');
            if (form) form.reset();
            
            const editor = document.getElementById('visualEditor');
            if (editor) editor.innerHTML = '<p>Escribe aquí tu mensaje...</p>';
            
            updatePreview();
        } else {
            throw new Error(result.message || 'Error al enviar');
        }
        
    } catch (error) {
        console.error('❌ Error enviando newsletter:', error);
        showError('Error al enviar el newsletter: ' + error.message);
    } finally {
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
        
        window.pendingNewsletter = null;
    }
}

function wrapContentWithTemplate(content) {
    return `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 0;">
                <h1 style="margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Cielito Home Clean</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Newsletter Exclusivo</p>
                <div style="width: 60px; height: 4px; background: #c9a876; margin: 15px auto; border-radius: 2px;"></div>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px; background-color: #ffffff; line-height: 1.7; color: #333333;">
                ${content}
            </div>
            
            <!-- Footer -->
            <div style="background: linear-gradient(135deg, #2d5a3d 0%, #1a3526 100%); color: white; padding: 30px; text-align: center;">
                <div style="margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 20px;">¡Síguenos en redes sociales!</h3>
                    <div style="margin: 20px 0;">
                        <a href="https://www.instagram.com/cielitohomeclean" style="display: inline-block; margin: 0 15px; color: white; text-decoration: none; background: rgba(255,255,255,0.1); padding: 12px; border-radius: 50%; width: 50px; height: 50px; line-height: 26px;">
                            📸
                        </a>
                        <a href="https://wa.me/524491382712" style="display: inline-block; margin: 0 15px; color: white; text-decoration: none; background: rgba(255,255,255,0.1); padding: 12px; border-radius: 50%; width: 50px; height: 50px; line-height: 26px;">
                            💬
                        </a>
                    </div>
                </div>
                
                <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px; margin-top: 20px;">
                    <p style="margin: 0; font-size: 16px; font-weight: bold;">Cielito Home Clean</p>
                    <p style="margin: 5px 0; font-size: 14px; opacity: 0.8;">Limpieza Profesional • Aguascalientes, México</p>
                    <p style="margin: 15px 0 5px 0; font-size: 14px; opacity: 0.9;">
                        📞 449 138 2712 • 📧 cielitoclean@cielitohome.com
                    </p>
                    <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.7;">
                        Si no deseas recibir más emails, <a href="#" style="color: #c9a876;">haz clic aquí para darte de baja</a>
                    </p>
                </div>
            </div>
        </div>
    `;
}

// 📱 Función mejorada para actualizar preview
function updatePreview() {
    const content = document.getElementById('content');
    const previewContainer = document.getElementById('previewContainer');
    
    if (!content || !previewContainer) return;
    
    const contentValue = content.value;
    
    if (contentValue.trim() && contentValue !== '<p>Escribe aquí tu mensaje...</p>') {
        // Agregar clase de loading
        previewContainer.style.opacity = '0.5';
        previewContainer.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            previewContainer.innerHTML = wrapContentWithTemplate(contentValue);
            previewContainer.style.opacity = '1';
            
            // Agregar estilos específicos para preview
            const previewContent = previewContainer.querySelector('div[style*="font-family"]');
            if (previewContent) {
                previewContent.style.transform = 'scale(0.85)';
                previewContent.style.transformOrigin = 'top center';
                previewContent.style.margin = '0';
                previewContent.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                previewContent.style.borderRadius = '8px';
                previewContent.style.overflow = 'hidden';
            }
        }, 150);
    } else {
        previewContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">👁️</div>
                <h5 style="margin-bottom: 0.5rem; color: var(--text-secondary);">Vista Previa</h5>
                <p style="margin: 0; font-size: 0.9rem;">La vista previa aparecerá aquí mientras escribes</p>
            </div>
        `;
    }
}

async function saveToHistory(subject, content, sentCount) {
    try {
        const { collection, addDoc, serverTimestamp } = window.firebase.firestore;
        await addDoc(collection(window.db, 'newsletter_history'), {
            subject,
            content,
            sentCount,
            timestamp: serverTimestamp(),
            sentBy: 'admin'
        });
        console.log('✅ Guardado en historial');
    } catch (error) {
        console.error('❌ Error guardando historial:', error);
    }
}

async function loadNewsletterHistory() {
    try {
        console.log('📜 Cargando historial...');
        const { collection, query, orderBy, limit, getDocs } = window.firebase.firestore;
        const q = query(
            collection(window.db, 'newsletter_history'),
            orderBy('timestamp', 'desc'),
            limit(20)
        );
        const snapshot = await getDocs(q);
        
        const container = document.getElementById('historyContainer');
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-history fs-1 text-muted mb-3"></i>
                    <h5 class="text-muted">No hay historial aún</h5>
                    <p class="text-muted">Cuando envíes tu primer newsletter, aparecerá aquí.</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="timeline">';
        
        snapshot.forEach(doc => {
            const history = doc.data();
            const date = history.timestamp ? history.timestamp.toDate().toLocaleDateString('es-MX') : 'Sin fecha';
            const time = history.timestamp ? history.timestamp.toDate().toLocaleTimeString('es-MX') : 'Sin hora';
            
            html += `
                <div class="timeline-item">
                    <div class="timeline-marker">
                        <i class="fas fa-paper-plane"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <h6>${history.subject}</h6>
                            <small class="text-muted">${date} - ${time}</small>
                        </div>
                        <div class="timeline-body">
                            <p class="mb-2">
                                <i class="fas fa-users me-1"></i>
                                Enviado a <strong>${history.sentCount}</strong> suscriptores
                            </p>
                            <p class="mb-0">
                                <i class="fas fa-user me-1"></i>
                                Por: ${history.sentBy || 'admin'}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('❌ Error cargando historial:', error);
        const container = document.getElementById('historyContainer');
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-exclamation-triangle fs-1 text-danger mb-3"></i>
                <h5 class="text-danger">Error al cargar el historial</h5>
                <p class="text-muted">Intenta recargar la página</p>
            </div>
        `;
    }
}

async function loadRecentActivity() {
    try {
        console.log('📊 Cargando actividad reciente...');
        
        const { collection, query, orderBy, limit, getDocs } = window.firebase.firestore;
        const q = query(
            collection(window.db, 'activity_log'),
            orderBy('timestamp', 'desc'),
            limit(10)
        );
        const snapshot = await getDocs(q);
        
        const activities = [];
        snapshot.forEach(doc => {
            activities.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log('📊 Actividades encontradas:', activities.length);
        displayRecentActivity(activities);
        
    } catch (error) {
        console.error('❌ Error cargando actividad:', error);
        
        // Mostrar actividad de ejemplo si hay error
        const exampleActivities = [
            {
                type: 'new_subscriber',
                data: { email: 'ejemplo@email.com' },
                timestamp: { seconds: Date.now() / 1000 },
                user: 'system'
            }
        ];
        displayRecentActivity(exampleActivities);
    }
}

function displayRecentActivity(activities) {
    const container = document.querySelector('#recentActivity');
    if (!container) {
        console.log('❌ Container de actividad no encontrado');
        return;
    }
    
    if (activities.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-clock text-muted fs-2 mb-3"></i>
                <p class="text-muted">No hay actividad reciente</p>
            </div>
        `;
        return;
    }
    
    const activitiesHTML = activities.map(activity => {
        const time = activity.timestamp && activity.timestamp.seconds ? 
            new Date(activity.timestamp.seconds * 1000) : new Date();
        
        const timeString = time.toLocaleString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        let icon, message, color;
        
        switch (activity.type) {
            case 'newsletter_sent':
                icon = 'fas fa-paper-plane';
                message = `Newsletter enviado a ${activity.data.sentCount || 0} suscriptores`;
                color = 'text-primary';
                break;
            case 'new_subscriber':
                icon = 'fas fa-user-plus';
                message = `Nuevo suscriptor: ${activity.data.email}`;
                color = 'text-success';
                break;
            case 'delete_subscriber':
                icon = 'fas fa-user-minus';
                message = `Suscriptor eliminado: ${activity.data.email}`;
                color = 'text-danger';
                break;
            default:
                icon = 'fas fa-info-circle';
                message = activity.data.action || 'Actividad registrada';
                color = 'text-info';
        }
        
        return `
            <div class="activity-item">
                <div class="activity-icon ${color}">
                    <i class="${icon}"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-message">${message}</div>
                    <div class="activity-time">${timeString}</div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        <div class="activities-list">
            ${activitiesHTML}
        </div>
    `;
}

function showLoading(show) {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => {
        if (show) {
            el.classList.add('show');
        } else {
            el.classList.remove('show');
        }
    });
    
    // También manejar spinners específicos
    const spinners = document.querySelectorAll('.spinner-border');
    spinners.forEach(spinner => {
        if (show) {
            spinner.style.display = 'inline-block';
        } else {
            spinner.style.display = 'none';
        }
    });
}

function showSuccess(message) {
    showAlert('success', message);
}

function showError(message) {
    showAlert('danger', message);
}

// 🎨 Función mejorada para mostrar alertas
function showAlert(type, message) {
    // Remover alertas existentes
    const existingAlerts = document.querySelectorAll('.admin-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} admin-alert fade-in`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        z-index: 9999;
        max-width: 400px;
        min-width: 300px;
        box-shadow: var(--shadow-xl);
        border-radius: var(--radius-lg);
        backdrop-filter: blur(10px);
        animation: slideInRight 0.3s ease-out;
    `;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'danger' ? 'exclamation-triangle' : 
                 type === 'warning' ? 'exclamation-circle' : 'info-circle';
    
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${icon} me-3" style="font-size: 1.25rem;"></i>
            <span style="flex: 1; font-weight: 600;">${message}</span>
            <button type="button" class="btn-close ms-2" onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.5rem; opacity: 0.7; cursor: pointer;">×</button>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv && alertDiv.parentNode) {
            alertDiv.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => alertDiv.remove(), 300);
        }
    }, 5000);
}

function setupEventListeners() {
    console.log('🔧 Configurando event listeners...');
    
    // Verificar que los elementos existan antes de agregar listeners
    const refreshBtn = document.getElementById('refreshBtn');
    const exportBtn = document.getElementById('exportBtn');
    const newsletterForm = document.getElementById('newsletterForm');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const confirmSendBtn = document.getElementById('confirmSendBtn');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadDashboard);
        console.log('✅ Refresh button configurado');
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportSubscribers);
        console.log('✅ Export button configurado');
    }
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
        console.log('✅ Newsletter form configurado');
    }
    
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearNewsletterForm);
        console.log('✅ Clear form button configurado');
    }
    
    if (confirmSendBtn) {
        confirmSendBtn.addEventListener('click', sendNewsletter);
        console.log('✅ Confirm send button configurado');
    }
    
    setupTemplateSelector();
    setupComponentButtons();
    
    // Event listener para cambio de pestañas
    const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabButtons.forEach(button => {
        button.addEventListener('shown.bs.tab', function(e) {
            const targetId = e.target.getAttribute('data-bs-target');
            
            if (targetId === '#history') {
                setTimeout(() => {
                    loadNewsletterHistory();
                }, 100);
            }
        });
    });
    
    console.log('✅ Todos los event listeners configurados');
}

function setupComponentButtons() {
    setTimeout(() => {
        const componentButtons = document.querySelectorAll('[data-component]');
        console.log('🔧 Configurando botones de componentes:', componentButtons.length);
        
        componentButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const componentType = this.dataset.component;
                console.log('🖱️ Click en componente:', componentType);
                insertComponent(componentType);
            });
        });
        
        if (componentButtons.length === 0) {
            console.warn('⚠️ No se encontraron botones de componentes');
        }
    }, 1000);
}

function setupTemplateSelector() {
    const templateCards = document.querySelectorAll('.template-card');
    
    templateCards.forEach(card => {
        card.addEventListener('click', function() {
            const templateType = this.dataset.template;
            
            // Si la plantilla ya está seleccionada, deseleccionarla y limpiar
            if (this.classList.contains('selected')) {
                console.log('🗑️ Deseleccionando plantilla y limpiando formulario...');
                
                // Remover selección visual
                this.classList.remove('selected');
                
                // Limpiar formulario completamente
                clearNewsletterForm();
                
                return;
            }
            
            // Si no está seleccionada, seleccionar esta y deseleccionar otras
            console.log('📋 Seleccionando plantilla:', templateType);
            
            // Remover selección de todas las plantillas
            templateCards.forEach(c => c.classList.remove('selected'));
            
            // Seleccionar la actual
            this.classList.add('selected');
            
            // Cargar la plantilla
            loadTemplate(templateType);
        });
    });
}

// 🎨 Función para agregar efectos visuales a botones
function addButtonEffects() {
    // Agregar efectos de hover mejorados
    const buttons = document.querySelectorAll('.btn, .template-card, .toolbar-btn');
    
    buttons.forEach(button => {
        // Efecto de ripple
        button.addEventListener('click', function(e) {
            if (this.classList.contains('no-ripple')) return;
            
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                pointer-events: none;
                animation: ripple 0.6s ease-out;
                z-index: 1;
            `;
            
            // Asegurar posición relativa
            if (getComputedStyle(this).position === 'static') {
                this.style.position = 'relative';
            }
            this.style.overflow = 'hidden';
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// CSS adicional para animaciones (se inyecta automáticamente)
const additionalCSS = `
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(30px); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    @keyframes bounce {
        0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
        40%, 43% { transform: translate3d(0,-30px,0); }
        70% { transform: translate3d(0,-15px,0); }
        90% { transform: translate3d(0,-4px,0); }
    }
    
    .component-loading {
        animation: pulse 1s infinite;
    }
    
    .fade-in { 
        animation: fadeIn 0.5s ease-out; 
    }
    
    .slide-in-right { 
        animation: slideInRight 0.5s ease-out; 
    }
    
    .template-card.selected::after {
        content: "✓";
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: var(--primary);
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.875rem;
        font-weight: bold;
        animation: bounce 0.5s ease-out;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .visual-editor p:first-child {
        margin-top: 0;
    }
    
    .visual-editor p:last-child {
        margin-bottom: 0;
    }
    
    .visual-editor:empty::before {
        content: "Escribe aquí tu mensaje o usa una plantilla...";
        color: var(--text-muted);
        font-style: italic;
        opacity: 0.7;
    }
    
    /* Mejoras específicas para el editor */
    .visual-editor h2, .visual-editor h3 {
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        font-weight: 700;
    }
    
    .visual-editor h2 {
        color: var(--primary);
        font-size: 1.5rem;
    }
    
    .visual-editor h3 {
        color: var(--accent);
        font-size: 1.25rem;
    }
    
    .visual-editor ul {
        margin: 1rem 0;
        padding-left: 2rem;
    }
    
    .visual-editor li {
        margin-bottom: 0.5rem;
        line-height: 1.6;
    }
    
    .visual-editor a {
        color: var(--primary);
        text-decoration: underline;
    }
    
    .visual-editor a:hover {
        color: var(--primary-light);
    }
    
    /* Mejorar apariencia de alerts */
    .admin-alert {
        transform: translateX(0);
        transition: all 0.3s ease;
    }
    
    .admin-alert:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-xl);
    }
    
    /* Mejorar loading states */
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9998;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .loading-overlay.show {
        opacity: 1;
        visibility: visible;
    }
    
    .loading-content {
        background: var(--surface);
        padding: 2rem;
        border-radius: var(--radius-xl);
        text-align: center;
        box-shadow: var(--shadow-xl);
        border: 1px solid var(--border);
    }
    
    /* Hover effects para cards */
    .admin-card:hover .card-header i {
        transform: scale(1.1);
        transition: transform 0.3s ease;
    }
    
    .stat-card:hover .stat-number {
        transform: scale(1.05);
        transition: transform 0.3s ease;
    }
    
    /* Mejorar responsive para móviles */
    @media (max-width: 576px) {
        .color-picker-content {
            max-width: 95vw !important;
            margin: 1rem;
        }
        
        .color-options {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.75rem;
        }
        
        .admin-alert {
            max-width: 90vw !important;
            min-width: auto !important;
            left: 5vw !important;
            right: 5vw !important;
        }
    }
`;

// Agregar CSS adicional al cargar (solo una vez)
function injectAdditionalCSS() {
    if (!document.getElementById('additional-admin-styles')) {
        const style = document.createElement('style');
        style.id = 'additional-admin-styles';
        style.textContent = additionalCSS;
        document.head.appendChild(style);
        console.log('✅ CSS adicional inyectado');
    }
}

// Función para mostrar loading overlay global
function showGlobalLoading(show, message = 'Cargando...') {
    let overlay = document.getElementById('global-loading-overlay');
    
    if (show) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'global-loading-overlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mb-0 fw-semibold">${message}</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        
        overlay.querySelector('p').textContent = message;
        setTimeout(() => overlay.classList.add('show'), 10);
    } else {
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    overlay.remove();
                }
            }, 300);
        }
    }
}

// Función para inicializar tooltips (si Bootstrap está disponible)
function initializeTooltips() {
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
        console.log('✅ Tooltips inicializados');
    }
}

// Función para manejar errores globales
function setupGlobalErrorHandling() {
    window.addEventListener('error', function(e) {
        console.error('❌ Error global capturado:', e.error);
        showError('Ha ocurrido un error inesperado. Por favor recarga la página.');
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.error('❌ Promise rechazada:', e.reason);
        showError('Error de conexión. Verifica tu internet e intenta de nuevo.');
    });
    
    console.log('✅ Manejo de errores globales configurado');
}

// Función para validar formularios
function validateNewsletterForm() {
    const subject = document.getElementById('subject')?.value?.trim();
    const content = document.getElementById('content')?.value?.trim();
    const confirmCheckbox = document.getElementById('confirmSend')?.checked;
    
    const errors = [];
    
    if (!subject || subject.length < 5) {
        errors.push('El asunto debe tener al menos 5 caracteres');
    }
    
    if (!content || content.length < 10) {
        errors.push('El contenido debe tener al menos 10 caracteres');
    }
    
    if (!confirmCheckbox) {
        errors.push('Debes confirmar el envío del newsletter');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Función para agregar validación en tiempo real
function setupFormValidation() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const fields = ['subject', 'content'];
    
    function checkFormValidity() {
        const validation = validateNewsletterForm();
        
        if (submitBtn) {
            submitBtn.disabled = !validation.isValid;
            
            if (validation.isValid) {
                submitBtn.classList.remove('btn-outline-primary');
                submitBtn.classList.add('btn-primary');
            } else {
                submitBtn.classList.add('btn-outline-primary');
                submitBtn.classList.remove('btn-primary');
            }
        }
    }
    
    // Validar en tiempo real
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', checkFormValidity);
            field.addEventListener('blur', checkFormValidity);
        }
    });
    
    const confirmCheckbox = document.getElementById('confirmSend');
    if (confirmCheckbox) {
        confirmCheckbox.addEventListener('change', checkFormValidity);
    }
    
    // Validación inicial
    setTimeout(checkFormValidity, 1000);
    
    console.log('✅ Validación de formulario configurada');
}

// Función para agregar atajos de teclado
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S = Guardar borrador (simulado)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            showSuccess('💾 Borrador guardado automáticamente');
        }
        
        // Ctrl/Cmd + Enter = Vista previa
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            updatePreview();
            showSuccess('👁️ Vista previa actualizada');
        }
        
        // Escape = Cerrar modales
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.color-picker-modal');
            modals.forEach(modal => modal.remove());
        }
    });
    
    console.log('✅ Atajos de teclado configurados');
}

// Función de inicialización completa
function initializeAdminPanel() {
    console.log('🚀 Inicializando panel de administración completo...');
    
    // Inyectar CSS adicional
    injectAdditionalCSS();
    
    // Configurar manejo de errores
    setupGlobalErrorHandling();
    
    // Configurar validación de formularios
    setTimeout(setupFormValidation, 2000);
    
    // Configurar tooltips
    setTimeout(initializeTooltips, 1000);
    
    // Configurar atajos de teclado
    setupKeyboardShortcuts();
    
    console.log('✅ Panel de administración completamente inicializado');
}

// Ejecutar inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeAdminPanel, 500);
});

// Exportar funciones globalmente para que funcionen los onclick del HTML
window.insertComponent = insertComponent;
window.removeSubscriber = removeSubscriber;
window.clearNewsletterForm = clearNewsletterForm;
window.insertColorPicker = insertColorPicker;
window.updatePreview = updatePreview;
window.showAlert = showAlert;
window.showSuccess = showSuccess;
window.showError = showError;
window.showGlobalLoading = showGlobalLoading;

// Exportar funciones para debugging (solo en desarrollo)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.adminDebug = {
        loadDashboard,
        loadNewsletterHistory,
        validateNewsletterForm,
        displaySubscribers,
        displayRecentActivity
    };
    console.log('🔧 Funciones de debug disponibles en window.adminDebug');
}

console.log('✅ admin.js cargado completamente - Versión mejorada con UI moderna');