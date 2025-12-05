const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all users (Admin only ideally, but public for now based on requirements)
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const users = await db.collection('users').find().toArray();
        // Remove passwords
        const safeUsers = users.map(user => {
            const { password, ...rest } = user;
            return rest;
        });
        res.json(safeUsers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const db = getDb();
        const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { password, ...safeUser } = user;
        res.json(safeUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
