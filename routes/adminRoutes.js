const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const adminController = require('../controllers/adminController');


// Ruta para servir el panel admin
router.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/index.html'));
});

// Ruta para enviar newsletter desde admin
router.post('/admin/send-newsletter', adminController.sendNewsletter);

module.exports = router;