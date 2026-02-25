const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Get company settings
router.get('/', async (req, res) => {
    try {
        const settings = await db.settings.get();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update company settings
router.put('/', async (req, res) => {
    try {
        await db.settings.update(req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
