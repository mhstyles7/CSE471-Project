const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');
const { sendBookingConfirmation } = require('../utils/email');

// Get orders (filter by agencyEmail for agency dashboard)
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const { agencyEmail } = req.query;
        const query = agencyEmail ? { agencyEmail } : {};
        const orders = await db.collection('orders').find(query).sort({ date: -1 }).toArray();

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

// Update order status (for agency)
router.put('/:id', async (req, res) => {
    try {
        const db = getDb();
        const { status } = req.body;

        const order = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        await db.collection('orders').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status, updatedAt: new Date().toISOString() } }
        );

        // Send confirmation email when order is accepted/confirmed
        if (status === 'accepted' && order.travelerEmail) {
            const emailData = {
                travelerName: order.travelerName || order.customerName,
                packageTitle: order.packageTitle || order.package,
                agencyName: order.agencyName,  // Use actual agency name from order
                proposedPrice: order.amount
            };
            sendBookingConfirmation(order.travelerEmail, emailData);
            console.log('📧 Confirmation email triggered for order:', req.params.id);
        }

        res.json({ message: `Order ${status}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;
