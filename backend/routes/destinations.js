const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all destinations
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const destinations = await db.collection('destinations').find().toArray();
        res.json(destinations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get destination by ID
router.get('/:id', async (req, res) => {
    try {
        const db = getDb();
        const destination = await db.collection('destinations').findOne({ _id: new ObjectId(req.params.id) });
        if (!destination) return res.status(404).json({ message: 'Destination not found' });
        res.json(destination);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
