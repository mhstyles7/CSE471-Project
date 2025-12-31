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
        newOrder.status = newOrder.status || 'pending';

        const result = await db.collection('orders').insertOne(newOrder);

        // If this is a membership purchase, upgrade the user to premium
        if (newOrder.type === 'membership' && newOrder.userId) {
            await db.collection('users').updateOne(
                { _id: new ObjectId(newOrder.userId) },
                { $set: { isPremium: true, premiumSince: new Date().toISOString() } }
            );
            console.log('✨ User upgraded to Premium:', newOrder.userId);
        }

        res.status(201).json({ ...newOrder, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update order status (for agency)
router.put('/:id', async (req, res) => {
    try {
        const db = getDb();
        const { status, amount } = req.body;

        const order = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Build update object
        const updateData = {
            status,
            updatedAt: new Date().toISOString()
        };

        // If amount is provided (for custom orders), save it
        if (amount !== undefined && amount !== null) {
            updateData.amount = parseFloat(amount);
        }

        await db.collection('orders').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData }
        );

        // Send confirmation email when order is accepted/confirmed
        const confirmedStatuses = ['accepted', 'Confirmed', 'confirmed'];
        const recipientEmail = order.travelerEmail || order.customerEmail;

        if (confirmedStatuses.includes(status) && recipientEmail) {
            const emailData = {
                travelerName: order.travelerName || order.customerName,
                packageTitle: order.packageTitle || order.package,
                agencyName: order.agencyName,
                proposedPrice: amount || order.amount, // Use new amount if provided
                numberOfTravelers: order.numberOfTravelers || order.quantity || 1,
                preferredDates: order.preferredDates,
                specialRequests: order.specialRequests
            };
            sendBookingConfirmation(recipientEmail, emailData);
            console.log('📧 Confirmation email triggered for order:', req.params.id, 'to:', recipientEmail, 'amount:', amount || order.amount);
        }

        res.json({ message: `Order ${status}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;
