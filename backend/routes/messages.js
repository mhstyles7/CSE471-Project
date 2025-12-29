const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get conversation between two users
router.get('/:userId/:friendId', async (req, res) => {
    try {
        const db = getDb();
        const { userId, friendId } = req.params;

        const messages = await db.collection('messages').find({
            $or: [
                { fromUserId: userId, toUserId: friendId },
                { fromUserId: friendId, toUserId: userId }
            ]
        }).sort({ createdAt: 1 }).toArray();

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Send a message
router.post('/', async (req, res) => {
    try {
        const db = getDb();
        const { fromUserId, toUserId, text, fromUserName, fromUserImage } = req.body;

        if (!text || !toUserId) {
            return res.status(400).json({ message: "Message text and recipient mandatory" });
        }

        const newMessage = {
            fromUserId,
            toUserId,
            text,
            fromUserName,
            fromUserImage,
            createdAt: new Date().toISOString(),
            read: false
        };

        const result = await db.collection('messages').insertOne(newMessage);
        res.status(201).json({ ...newMessage, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
