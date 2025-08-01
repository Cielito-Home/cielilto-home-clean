const express = require('express');
const router = express.Router();
const path = require('path');

// Importa TODOS los controladores necesarios
const homeController = require('../controllers/homeController');
const aboutController = require('../controllers/aboutController');
const servicesController = require('../controllers/servicesController');
const contactController = require('../controllers/contactController');

// Rutas principales - archivos HTML
router.get('/', homeController.getHomePage);
router.get('/index.html', homeController.getHomePage);

// Ruta para "about" que debe dirigir a nosotros
router.get('/about', (req, res) => {
    res.redirect(301, '/nosotros.html');
});
router.get('/about.html', (req, res) => {
    res.redirect(301, '/nosotros.html');
});

// Ruta para "services" que debe dirigir a servicios
router.get('/services', (req, res) => {
    res.redirect(301, '/servicios.html');
});
router.get('/services.html', (req, res) => {
    res.redirect(301, '/servicios.html');
});

// Ruta para "contact" que debe dirigir a contacto
router.get('/contact', (req, res) => {
    res.redirect(301, '/contacto.html');
});
router.get('/contact.html', (req, res) => {
    res.redirect(301, '/contacto.html');
});

// Rutas específicas para los archivos HTML existentes
router.get('/nosotros.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/nosotros.html'));
});

router.get('/servicios.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/servicios.html'));
});

router.get('/contacto.html', contactController.getContactPage);

router.get('/faq.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/faq.html'));
});

router.get('/terminos.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/terminos.html'));
});

router.get('/privacidad.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/privacidad.html'));
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

// ⚠️ REMOVER ESTE MIDDLEWARE 404 - Se maneja en app.js
// NO agregar middleware 404 aquí

module.exports = router;