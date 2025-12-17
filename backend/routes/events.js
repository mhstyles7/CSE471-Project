const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all events
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const events = await db.collection('events').find().sort({ date: 1 }).toArray();
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a sponsored event (agency only)
router.post('/', async (req, res) => {
    try {
        const db = getDb();
        const { sponsor, agencyEmail, ...eventData } = req.body;

        // Mark as sponsored if created by an agency
        const isSponsored = !!(sponsor || agencyEmail);

        const newEvent = {
            ...eventData,
            sponsor: sponsor || null,
            agencyEmail: agencyEmail || null,
            isSponsored,
            createdAt: new Date().toISOString(),
            attendees: []
        };

        const result = await db.collection('events').insertOne(newEvent);
        res.status(201).json({ ...newEvent, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Join an event
router.post('/:id/join', async (req, res) => {
    try {
        const db = getDb();
        const { userName, userEmail } = req.body;

        await db.collection('events').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $addToSet: { attendees: { userName, userEmail, joinedAt: new Date().toISOString() } } }
        );

        res.json({ message: 'Joined event successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
