require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Detectar modo de desarrollo
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';

// Mostrar modo actual
if (isDevelopment) {
    console.log('🔧 MODO DESARROLLO - Rate limiting relajado');
} else {
    console.log('🔒 MODO PRODUCCIÓN - Rate limiting estricto');
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'","'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://fonts.googleapis.com"
      ],
      scriptSrc: [
        "'self'","'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://www.gstatic.com",
        "https://apis.google.com",
        "https://www.google.com",
        "https://www.googleapis.com"  
      ],
      imgSrc: [
        "'self'","data:","https:","blob:",
        "https://lh3.googleusercontent.com"
      ],
      fontSrc: [
        "'self'","https://fonts.gstatic.com","https://cdnjs.cloudflare.com"
      ],
      connectSrc: [
        "'self'",
        "https://firebase.googleapis.com",
        "https://firestore.googleapis.com",
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com",
        "https://www.googleapis.com",
        "https://oauth2.googleapis.com",
        "https://apis.google.com",
        "https://accounts.google.com" 
      ],
      frameSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://*.google.com",
        "https://*.gstatic.com",
        "https://*.firebaseapp.com",
        "https://*.firebaseio.com"
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting - CONFIGURACIÓN DINÁMICA SEGÚN EL MODO
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: isDevelopment ? 1000 : 100, // DESARROLLO: 1000, PRODUCCIÓN: 100
    message: {
        error: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: isDevelopment ? 100 : 5, // DESARROLLO: 100, PRODUCCIÓN: 5
    message: {
        success: false,
        error: isDevelopment 
            ? 'Límite de desarrollo alcanzado (100/hora). Reinicia el servidor si necesitas más.' 
            : 'Has enviado demasiados mensajes. Por favor espera una hora antes de enviar otro.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const newsletterLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: isDevelopment ? 50 : 3, // DESARROLLO: 50, PRODUCCIÓN: 3
    message: {
        success: false,
        error: isDevelopment 
            ? 'Límite de desarrollo alcanzado (50/hora). Reinicia el servidor si necesitas más.'
            : 'Has intentado suscribirte demasiadas veces. Por favor espera una hora.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Aplicar rate limiting general
app.use(generalLimiter);

// Configuración básica - RUTAS CORREGIDAS
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/admin', express.static(path.join(__dirname, 'frontend','admin')));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Middleware para logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`;
    
    // En desarrollo, mostrar menos logs para no saturar la consola
    if (isDevelopment && req.path.includes('.')) {
        // No mostrar requests de archivos estáticos en desarrollo
    } else {
        console.log(logMessage);
    }
    next();
});



// Middleware de debug para formularios
app.use('/contact', (req, res, next) => {
    if (isDevelopment) {
        console.log('🔍 Request a /contact:', {
            method: req.method,
            contentType: req.headers['content-type'],
            body: req.method === 'POST' ? req.body : 'N/A'
        });
    }
    next();
});

app.use('/newsletter', (req, res, next) => {
    if (isDevelopment) {
        console.log('🔍 Request a /newsletter:', {
            method: req.method,
            contentType: req.headers['content-type'],
            body: req.method === 'POST' ? req.body : 'N/A'
        });
    }
    next();
});

// Importar rutas
const webRoutes = require('./routes/webRoutes');

// Aplicar rate limiting específico a rutas sensibles
app.use('/contact', contactLimiter);
app.use('/newsletter', newsletterLimiter);

// Usar rutas
app.use('/', webRoutes);

// ⚠️ MIDDLEWARE 404 - DEBE IR AL FINAL DE TODAS LAS RUTAS
app.use('*', (req, res) => {
    console.log(`⚠️  404 - Página no encontrada: ${req.method} ${req.originalUrl}`);
    
    // Si es una petición AJAX/API, devolver JSON
    if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
        return res.status(404).json({
            success: false,
            error: 'Página no encontrada',
            message: 'La ruta que buscas no existe',
            code: 404,
            timestamp: new Date().toISOString()
        });
    }
    
    // Para peticiones normales, servir la página 404.html - RUTA CORREGIDA
    res.status(404).sendFile(path.join(__dirname, 'frontend/404.html'));
});

// Middleware para manejo de errores
app.use((error, req, res, next) => {
    console.error('💥 Error del servidor:', error.stack);
    
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            message: 'Datos de formulario inválidos'
        });
    }
    
    // Si es una petición AJAX/API, devolver JSON
    if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: 'Algo salió mal',
            code: 500,
            timestamp: new Date().toISOString()
        });
    }
    
    // Para peticiones normales, servir la página 404.html como fallback - RUTA CORREGIDA
    res.status(500).sendFile(path.join(__dirname, 'frontend/404.html'));
});

// Mostrar límites actuales al iniciar
function showCurrentLimits() {
    console.log('\n📊 LÍMITES ACTUALES:');
    console.log(`   • General: ${isDevelopment ? '1000' : '100'} requests / 15 min`);
    console.log(`   • Contacto: ${isDevelopment ? '100' : '5'} mensajes / hora`);
    console.log(`   • Newsletter: ${isDevelopment ? '50' : '3'} suscripciones / hora\n`);
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📧 Email configurado: ${process.env.EMAIL_USER || 'No configurado'}`);
    console.log(`🏢 Empresa: ${process.env.COMPANY_NAME || 'Cielito Home Clean'}`);
    console.log(`📱 WhatsApp: ${process.env.COMPANY_WHATSAPP || '524491382712'}`);
    console.log(`📄 Página 404 configurada correctamente`);
    showCurrentLimits();
});

module.exports = app;