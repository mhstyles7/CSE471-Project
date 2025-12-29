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

// Add Points (Manual/System Action)
router.post('/add-points', async (req, res) => {
    try {
        const db = getDb();
        const { userId, points, reason } = req.body;
        const { ObjectId } = require('mongodb');

        if (!userId || !points) {
            return res.status(400).json({ message: "userId and points are required" });
        }

        let user = null;
        try {
            user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        } catch (e) {
            // Invalid ObjectId format, ignore
        }

        if (!user) {
            // Try as string
            user = await db.collection('users').findOne({ _id: userId });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calculate new points and tier
        const currentPoints = user.points || 0;
        const newPoints = currentPoints + parseInt(points);

        let newTier = 'Bronze';
        if (newPoints >= 1000) {
            newTier = 'Gold';
        } else if (newPoints >= 500) {
            newTier = 'Silver';
        }

        // Check for Tier Upgrade
        let tierUpgraded = false;
        if (newTier !== (user.tier || 'Bronze')) {
            tierUpgraded = true;
        }

        // Update User
        await db.collection('users').updateOne(
            { _id: user._id },
            {
                $set: {
                    points: newPoints,
                    tier: newTier
                }
            }
        );

        // Optionally log the activity (implied for future use)
        console.log(`User ${userId} earned ${points} points for: ${reason}`);

        res.json({
            message: `Successfully added ${points} points`,
            newTotal: newPoints,
            tierUpgraded: tierUpgraded,
            newTier: newTier
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
