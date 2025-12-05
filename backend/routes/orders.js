const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all orders (for testing/admin)
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const orders = await db.collection('orders').find().toArray();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create an order
router.post('/', async (req, res) => {
    try {
        const db = getDb();
        const newOrder = req.body;
        newOrder.date = new Date().toISOString();
        newOrder.status = 'pending';

        const result = await db.collection('orders').insertOne(newOrder);
        res.status(201).json({ ...newOrder, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
