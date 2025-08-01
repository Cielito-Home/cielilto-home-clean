const express = require('express');
const router = express.Router();
const {
    getTeamData,
    getServicesList
} = require('../controllers/aboutController');

// API Routes
router.get('/team', getTeamData);
router.get('/services', getServicesList);

module.exports = router;