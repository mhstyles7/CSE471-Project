const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');

// Get all routes
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const routes = await db.collection('routes').find().toArray();
        res.json(routes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
