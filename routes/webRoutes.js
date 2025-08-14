const express = require('express');
const path = require('path');
const router = express.Router();

// Importar controladores
const contactController = require('../controllers/contactController');
const homeController = require('../controllers/homeController');
const aboutController = require('../controllers/aboutController');
const servicesController = require('../controllers/servicesController');

// Middleware para logging de rutas
router.use((req, res, next) => {
    console.log(`📍 Ruta: ${req.method} ${req.path}`);
    next();
});

// Ruta principal (página de inicio)
router.get('/', homeController.getHomePage);

// Ruta para "contact" que debe dirigir a contacto
router.get('/contact', (req, res) => {
    res.redirect(301, '/contacto.html');
});
router.get('/contact.html', (req, res) => {
    res.redirect(301, '/contacto.html');
});

// Rutas específicas para los archivos HTML existentes - RUTAS CORREGIDAS
router.get('/nosotros.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/nosotros.html'));
});

router.get('/servicios.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/servicios.html'));
});

router.get('/contacto.html', contactController.getContactPage);

router.get('/faq.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/faq.html'));
});

router.get('/terminos.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/terminos.html'));
});

router.get('/privacidad.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/privacidad.html'));
});

router.get('/admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login Admin - Cielito Home Clean</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
      <div class="container mt-5">
        <div class="card p-4 shadow" style="max-width:400px;margin:auto;">
          <h3 class="mb-3">Panel de Administración</h3>
          <p class="text-muted">Inicia sesión con Google</p>
          <button id="autoLoginBtn" class="btn btn-primary w-100 mb-2">Iniciar Sesión (Automático)</button>
          <button id="redirectLoginBtn" class="btn btn-success w-100">Usar Redirección Directa</button>
          <div id="message" class="alert mt-3 d-none"></div>
        </div>
      </div>
      <script type="module">
        import { signInWithGoogle, signInWithGoogleRedirect } from '/firebase/firebase.js';
        const msg = (type, text) => {
          const el = document.getElementById('message');
          el.className = 'alert mt-3 alert-' + (type==='error'?'danger':type);
          el.textContent = text; el.classList.remove('d-none');
        };
        document.getElementById('autoLoginBtn').addEventListener('click', async () => {
          const r = await signInWithGoogle();
          if (r.success) {
            if (!r.message || !r.message.includes('Redirigiendo')) location.href='/admin/dashboard';
            else msg('info', r.message);
          } else {
            msg('error', r.error || 'Error de autenticación');
          }
        });
        document.getElementById('redirectLoginBtn').addEventListener('click', async () => {
          const r = await signInWithGoogleRedirect();
          if (!r.success) msg('error', r.error || 'Error de redirección');
          else msg('info', r.message || 'Redirigiendo...');
        });
      </script>
    </body>
    </html>
  `);
});


router.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin/admin.html'));
});




// Ruta para enviar newsletter desde admin
router.post('/admin/send-newsletter', (req, res) => {
    console.log('📧 Petición recibida en /admin/send-newsletter');
    console.log('📊 Datos recibidos:', {
        hasSubject: !!req.body.subject,
        hasContent: !!req.body.content,
        hasSubscribers: !!req.body.subscribers,
        subscribersCount: req.body.subscribers ? req.body.subscribers.length : 0
    });
    
    // Verificar que viene del admin
    if (!req.body.subject || !req.body.content || !req.body.subscribers) {
        return res.status(400).json({
            success: false,
            message: 'Datos incompletos'
        });
    }
    
    // Importar y usar el controlador admin
    const adminController = require('../controllers/adminController');
    adminController.sendNewsletter(req, res);
});

router.get('/unsubscribe', async (req, res) => {
    const email = req.query.email;
    const token = req.query.token; // Opcional para seguridad
    
    if (!email) {
        return res.status(400).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error - Cielito Home Clean</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body { 
                        background: linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%);
                        font-family: 'Arial', sans-serif;
                    }
                    .unsubscribe-card {
                        background: white;
                        border-radius: 20px;
                        box-shadow: 0 15px 35px rgba(0,0,0,0.1);
                    }
                </style>
            </head>
            <body class="d-flex align-items-center min-vh-100">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-md-6">
                            <div class="unsubscribe-card p-5 text-center">
                                <h2 class="text-danger">❌ Error</h2>
                                <p>Email no válido para dar de baja.</p>
                                <a href="/" class="btn btn-primary">Volver al inicio</a>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `);
    }
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Gestión de Suscripción - Cielito Home Clean</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                body { 
                    background: linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%);
                    font-family: 'Arial', sans-serif;
                }
                .unsubscribe-card {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header-section {
                    background: linear-gradient(135deg, #c9a876 0%, #d4b886 100%);
                    padding: 2rem;
                    text-align: center;
                    color: #2d5a3d;
                }
                .btn-custom {
                    border-radius: 25px;
                    padding: 12px 30px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
                .btn-custom:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }
            </style>
        </head>
        <body class="d-flex align-items-center min-vh-100">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <div class="unsubscribe-card">
                            <div class="header-section">
                                <i class="fas fa-envelope-open-text fa-3x mb-3"></i>
                                <h2>Gestión de Suscripción</h2>
                                <p class="mb-0">Cielito Home Clean Newsletter</p>
                            </div>
                            <div class="p-4">
                                <div class="text-center mb-4">
                                    <h4>¿Qué deseas hacer?</h4>
                                    <p class="text-muted">Email: <strong>${email}</strong></p>
                                </div>
                                
                                <div class="d-grid gap-3">
                                    <button class="btn btn-danger btn-lg btn-custom" onclick="confirmUnsubscribe('${email}')">
                                        <i class="fas fa-user-minus me-2"></i>Darme de baja completamente
                                    </button>
                                    
                                    <button class="btn btn-warning btn-lg btn-custom" onclick="changeFrequency('${email}')">
                                        <i class="fas fa-clock me-2"></i>Cambiar frecuencia
                                    </button>
                                    
                                    <button class="btn btn-outline-primary btn-lg btn-custom" onclick="window.close()">
                                        <i class="fas fa-arrow-left me-2"></i>Mantener suscripción
                                    </button>
                                </div>
                                
                                <div class="mt-4 p-3 bg-light rounded">
                                    <h6><i class="fas fa-info-circle me-2"></i>¿Por qué recibes este email?</h6>
                                    <small class="text-muted">
                                        Te suscribiste a nuestro newsletter para recibir ofertas especiales y tips de limpieza. 
                                        Puedes ajustar tus preferencias o contactarnos en 
                                        <a href="https://wa.me/524491382712" target="_blank">WhatsApp</a> 
                                        si tienes dudas.
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                async function confirmUnsubscribe(email) {
                    if (confirm('¿Estás seguro de que quieres darte de baja del newsletter?\\n\\nYa no recibirás ofertas especiales ni tips de limpieza.')) {
                        await processUnsubscribe(email, 'complete');
                    }
                }
                
                async function changeFrequency(email) {
                    const frequencies = {
                        'weekly': 'Semanal (recomendado)',
                        'biweekly': 'Cada 2 semanas', 
                        'monthly': 'Mensual',
                        'quarterly': 'Trimestral'
                    };
                    
                    let options = '';
                    for (const [key, value] of Object.entries(frequencies)) {
                        options += \`<option value="\${key}">\${value}</option>\`;
                    }
                    
                    const frequencySelect = \`
                        <div class="unsubscribe-card p-4">
                            <h4 class="text-center mb-4">Cambiar Frecuencia</h4>
                            <div class="mb-3">
                                <label class="form-label">¿Con qué frecuencia quieres recibir emails?</label>
                                <select id="frequencySelect" class="form-select">
                                    \${options}
                                </select>
                            </div>
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary" onclick="saveFrequency('\${email}')">
                                    <i class="fas fa-save me-2"></i>Guardar Preferencia
                                </button>
                                <button class="btn btn-outline-secondary" onclick="location.reload()">
                                    <i class="fas fa-arrow-left me-2"></i>Volver
                                </button>
                            </div>
                        </div>
                    \`;
                    
                    document.querySelector('.unsubscribe-card').innerHTML = frequencySelect;
                }
                
                async function saveFrequency(email) {
                    const frequency = document.getElementById('frequencySelect').value;
                    await processUnsubscribe(email, 'frequency', frequency);
                }
                
                async function processUnsubscribe(email, type, frequency = null) {
                    try {
                        const response = await fetch('/unsubscribe/confirm', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, type, frequency })
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            let message = '';
                            let icon = '';
                            
                            if (type === 'complete') {
                                icon = '✅';
                                message = 'Te has dado de baja exitosamente del newsletter.<br>Ya no recibirás más emails promocionales.';
                            } else if (type === 'frequency') {
                                icon = '🔄';
                                message = \`Perfecto! Ahora recibirás emails con frecuencia: <strong>\${frequency}</strong>\`;
                            }
                            
                            document.body.innerHTML = \`
                                <div class="container">
                                    <div class="row justify-content-center align-items-center min-vh-100">
                                        <div class="col-md-6 text-center">
                                            <div class="unsubscribe-card p-5">
                                                <h2 class="text-success">\${icon} ¡Listo!</h2>
                                                <p>\${message}</p>
                                                <div class="mt-4">
                                                    <a href="/" class="btn btn-primary btn-custom">
                                                        <i class="fas fa-home me-2"></i>Volver al sitio
                                                    </a>
                                                </div>
                                                <div class="mt-3">
                                                    <small class="text-muted">
                                                        Si cambias de opinión, siempre puedes suscribirte nuevamente desde nuestro sitio web.
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            \`;
                        } else {
                            alert('Error: ' + result.message);
                        }
                    } catch (error) {
                        alert('Error de conexión. Intenta de nuevo.');
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// Ruta para confirmar la baja o cambio de preferencias
router.post('/unsubscribe/confirm', async (req, res) => {
    try {
        const { email, type, frequency } = req.body;
        
        if (!email || !type) {
            return res.status(400).json({
                success: false,
                message: 'Datos incompletos'
            });
        }
        
        console.log(`📧 Gestión de suscripción - Email: ${email}, Tipo: ${type}, Frecuencia: ${frequency}`);
        
        // Aquí integrarías con Firebase
        if (type === 'complete') {
            // Mover a unsubscribed y marcar como inactivo
            console.log(`🚫 Usuario dado de baja completamente: ${email}`);
        } else if (type === 'frequency') {
            // Actualizar preferencias
            console.log(`🔄 Frecuencia cambiada para ${email}: ${frequency}`);
        }
        
        res.json({
            success: true,
            message: 'Preferencias actualizadas exitosamente',
            type: type,
            frequency: frequency
        });
        
    } catch (error) {
        console.error('Error en unsubscribe:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});


// Rutas de procesamiento de formularios
router.post('/contact', contactController.handleContactForm);
router.post('/newsletter', contactController.handleNewsletter);

// Rutas de API (opcional) - mantener para compatibilidad
router.get('/api/team', aboutController.getTeamData);
router.get('/api/services', servicesController.getServicesList);

// Redirecciones comunes
router.get('/inicio', (req, res) => {
    res.redirect(301, '/');
});

router.get('/home', (req, res) => {
    res.redirect(301, '/');
});

// Agregar al final del archivo, antes de module.exports:

// Ruta para el panel admin con autenticación completa
router.get('/admin', (req, res) => {
    const password = req.query.password;
    const correctPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (password !== correctPassword) {
        return res.status(401).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Acceso Denegado</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
                    .error { color: #dc3545; }
                </style>
            </head>
            <body>
                <div class="error">
                    <h2>🔒 Acceso Denegado</h2>
                    <p>Necesitas la contraseña correcta para acceder al panel admin.</p>
                    <a href="/">← Volver al sitio</a>
                </div>
            </body>
            </html>
        `);
    }
    
    res.sendFile(path.join(__dirname, '../frontend/admin/admin.html'));
});

module.exports = router;