const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');

// Get Leaderboard (Top 10 users by points)
router.get('/leaderboard', async (req, res) => {
    try {
        const db = getDb();
        const leaderboard = await db.collection('users')
            .find({}, { projection: { password: 0 } }) // Exclude password
            .sort({ points: -1 }) // Descending order
            .limit(10)
            .toArray();
        res.json(leaderboard);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Redeem Points (Mock)
router.post('/redeem', async (req, res) => {
    try {
        const db = getDb();
        const { userId, cost, rewardTitle } = req.body;
        const { ObjectId } = require('mongodb');

        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.points < cost) {
            return res.status(400).json({ message: 'Insufficient points' });
        }

        // Deduct points
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $inc: { points: -cost } }
        );

        res.json({ message: `Successfully redeemed ${rewardTitle}`, remainingPoints: user.points - cost });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
