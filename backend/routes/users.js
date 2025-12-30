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

// Update user profile
<<<<<<< HEAD
router.put('/:id/profile', async (req, res) => {
    try {
        const db = getDb();
        const userId = req.params.id;
        const { name, bio, avatar, coverImage } = req.body;

        // Build update object with only provided fields
        const updateFields = { updatedAt: new Date() };
        if (name !== undefined) updateFields.name = name;
        if (bio !== undefined) updateFields.bio = bio;
        if (avatar !== undefined) updateFields.avatar = avatar;
        if (coverImage !== undefined) updateFields.coverImage = coverImage;

        const result = await db.collection('users').findOneAndUpdate(
            { _id: new ObjectId(userId) },
            { $set: updateFields },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { password, ...safeUser } = result;
=======
router.put('/:id', async (req, res) => {
    try {
        const db = getDb();
        const updates = req.body;

        // Remove sensitive fields that shouldn't be updated this way
        delete updates.password;
        delete updates._id;

        await db.collection('users').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updates }
        );

        const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
        const { password, ...safeUser } = updatedUser;
>>>>>>> origin/Tashu
        res.json(safeUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Send Friend Request
router.post('/request', async (req, res) => {
    try {
        const db = getDb();
        const { fromUserId, toUserId } = req.body;

        if (fromUserId === toUserId) {
            return res.status(400).json({ message: "Cannot send request to yourself" });
        }

        // Check if already friends
        const fromUser = await db.collection('users').findOne({ _id: new ObjectId(fromUserId) });
        if (fromUser.friends && fromUser.friends.includes(toUserId)) {
            return res.status(400).json({ message: "Already friends" });
        }

        // Check for existing pending request
        const existingRequest = await db.collection('friend_requests').findOne({
            fromUserId: new ObjectId(fromUserId),
            toUserId: new ObjectId(toUserId),
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Request already sent" });
        }

        // Check for reverse request (if B sent to A already)
        const reverseRequest = await db.collection('friend_requests').findOne({
            fromUserId: new ObjectId(toUserId),
            toUserId: new ObjectId(fromUserId),
            status: 'pending'
        });

        if (reverseRequest) {
            return res.status(400).json({ message: "This user already sent you a request. Check your inbox!" });
        }

        // Create Request
        await db.collection('friend_requests').insertOne({
            fromUserId: new ObjectId(fromUserId),
            toUserId: new ObjectId(toUserId),
            status: 'pending',
            createdAt: new Date()
        });

        res.json({ message: "Friend request sent successfully!" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Pending Requests (Incoming)
router.get('/:userId/requests', async (req, res) => {
    try {
        const db = getDb();
        const requests = await db.collection('friend_requests').find({
            toUserId: new ObjectId(req.params.userId),
            status: 'pending'
        }).toArray();

        // Enrich with User Details
        const enrichedRequests = await Promise.all(requests.map(async (req) => {
            const fromUser = await db.collection('users').findOne({ _id: req.fromUserId });
            return {
                id: req._id,
                fromUser: {
                    _id: fromUser._id,
                    name: fromUser.name,
                    avatar: fromUser.avatar,
                    role: fromUser.role
                },
                createdAt: req.createdAt
            };
        }));

        res.json(enrichedRequests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Handle Request (Accept/Reject)
router.put('/request/:requestId', async (req, res) => {
    try {
        const db = getDb();
        const { status } = req.body; // 'accepted' or 'rejected'
        const requestId = req.params.requestId;

        const request = await db.collection('friend_requests').findOne({ _id: new ObjectId(requestId) });
        if (!request) return res.status(404).json({ message: "Request not found" });

        if (status === 'accepted') {
            // Update Request Status
            await db.collection('friend_requests').updateOne(
                { _id: new ObjectId(requestId) },
                { $set: { status: 'accepted' } }
            );

            // Add to BOTH users' friend lists
            await db.collection('users').updateOne(
                { _id: request.fromUserId },
                { $addToSet: { friends: request.toUserId.toString() } }
            );
            await db.collection('users').updateOne(
                { _id: request.toUserId },
                { $addToSet: { friends: request.fromUserId.toString() } }
            );

            res.json({ message: "Friend request accepted!" });
        } else if (status === 'rejected') {
            await db.collection('friend_requests').updateOne(
                { _id: new ObjectId(requestId) },
                { $set: { status: 'rejected' } }
            );
            res.json({ message: "Friend request rejected." });
        } else {
            res.status(400).json({ message: "Invalid status" });
        }

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Remove a friend
router.delete('/:id/friends/:friendId', async (req, res) => {
    try {
        const db = getDb();
        const { id, friendId } = req.params;

        await db.collection('users').updateOne(
            { _id: new ObjectId(id) },
            { $pull: { friends: friendId } }
        );

        res.json({ message: "Friend removed successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user's friend list
router.get('/:id/friends', async (req, res) => {
    try {
        const db = getDb();
        const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });

        if (!user || !user.friends) {
            return res.json([]);
        }

        // Fetch friend details
        const friendIds = user.friends.map(id => new ObjectId(id));
        const friends = await db.collection('users').find({ _id: { $in: friendIds } }).toArray();

        // Safe return
        const safeFriends = friends.map(f => {
            const { password, ...rest } = f;
            return rest;
        });

        res.json(safeFriends);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Check Sent Requests (For UI state)
router.get('/:userId/sent-requests', async (req, res) => {
    try {
        const db = getDb();
        const requests = await db.collection('friend_requests').find({
            fromUserId: new ObjectId(req.params.userId),
            status: 'pending'
        }).toArray();
<<<<<<< HEAD

        // Enrich with User Details
        const enrichedRequests = await Promise.all(requests.map(async (req) => {
            const toUser = await db.collection('users').findOne({ _id: req.toUserId });
            if (!toUser) return null; // Skip if user not found

            return {
                id: req._id, // Request ID
                toUser: {
                    _id: toUser._id,
                    name: toUser.name,
                    avatar: toUser.avatar,
                    role: toUser.role
                },
                createdAt: req.createdAt
            };
        }));

        res.json(enrichedRequests.filter(req => req !== null));
=======
        res.json(requests.map(r => r.toUserId));
>>>>>>> origin/Tashu
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
