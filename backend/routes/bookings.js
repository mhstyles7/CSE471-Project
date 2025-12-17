const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');
const { sendGuideBookingConfirmation } = require('../utils/email');

// Get bookings (filter by guideEmail or travelerEmail)
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const { guideEmail, travelerEmail } = req.query;

        const query = {};
        if (guideEmail) query.guideEmail = guideEmail;
        if (travelerEmail) query.travelerEmail = travelerEmail;

        const bookings = await db.collection('bookings').find(query).sort({ createdAt: -1 }).toArray();
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a booking
router.post('/', async (req, res) => {
    try {
        const db = getDb();
        const {
            type,
            guideName,
            guideEmail,
            travelerName,
            travelerEmail,
            amount,
            postId
        } = req.body;

        const booking = {
            type: type || 'guide_booking',
            guideName,
            guideEmail,
            travelerName,
            travelerEmail,
            amount: amount || 400,
            postId,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        const result = await db.collection('bookings').insertOne(booking);
        res.status(201).json({ ...booking, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update booking status (accept/reject/complete)
router.put('/:id', async (req, res) => {
    try {
        const db = getDb();
        const { status } = req.body; // 'accepted', 'rejected', 'completed'

        const booking = await db.collection('bookings').findOne({ _id: new ObjectId(req.params.id) });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        await db.collection('bookings').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status, updatedAt: new Date().toISOString() } }
        );

        // Send confirmation email when booking is accepted
        if (status === 'accepted' && booking.travelerEmail) {
            sendGuideBookingConfirmation(booking.travelerEmail, booking);
        }

        // If completed, increment guide's trip count
        if (status === 'completed') {
            await db.collection('users').updateOne(
                { email: booking.guideEmail },
                { $inc: { trips: 1 } }
            );
        }

        res.json({ message: `Booking ${status}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
