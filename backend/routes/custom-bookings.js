const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');
const { sendBookingConfirmation } = require('../utils/email');

// Get custom booking requests for an agency
router.get('/agency/:email', async (req, res) => {
    try {
        const db = getDb();
        const { email } = req.params;
        const requests = await db.collection('custom_bookings')
            .find({ agencyEmail: email })
            .sort({ createdAt: -1 })
            .toArray();
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a custom booking request (premium users only)
router.post('/', async (req, res) => {
    try {
        const db = getDb();
        const {
            packageId,
            packageTitle,
            agencyEmail,
            agencyName,
            travelerName,
            travelerEmail,
            isPremium,
            preferredDates,
            numberOfTravelers,
            specialRequests,
            budgetPreference
        } = req.body;

        // Verify user is premium
        if (!isPremium) {
            return res.status(403).json({ message: 'Custom bookings are only available for premium users' });
        }

        const customBooking = {
            packageId,
            packageTitle,
            agencyEmail,
            agencyName,
            travelerName,
            travelerEmail,
            preferredDates,
            numberOfTravelers: parseInt(numberOfTravelers) || 1,
            specialRequests,
            budgetPreference,
            status: 'pending', // pending, accepted, rejected, negotiating
            agencyResponse: null,
            createdAt: new Date().toISOString()
        };

        const result = await db.collection('custom_bookings').insertOne(customBooking);
        res.status(201).json({ ...customBooking, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update custom booking status (for agency)
router.put('/:id', async (req, res) => {
    try {
        const db = getDb();
        const { status, agencyResponse, proposedPrice } = req.body;

        await db.collection('custom_bookings').updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $set: {
                    status,
                    agencyResponse,
                    proposedPrice,
                    updatedAt: new Date().toISOString()
                }
            }
        );

        // Send confirmation email when booking is accepted
        if (status === 'accepted') {
            const booking = await db.collection('custom_bookings').findOne({ _id: new ObjectId(req.params.id) });
            if (booking && booking.travelerEmail) {
                // Include the agency response and proposed price in the email
                const emailData = {
                    ...booking,
                    agencyResponse,
                    proposedPrice
                };
                sendBookingConfirmation(booking.travelerEmail, emailData);
            }
        }

        res.json({ message: `Custom booking ${status}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get custom booking requests for a traveler
router.get('/traveler/:email', async (req, res) => {
    try {
        const db = getDb();
        const { email } = req.params;
        const requests = await db.collection('custom_bookings')
            .find({ travelerEmail: email })
            .sort({ createdAt: -1 })
            .toArray();
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
