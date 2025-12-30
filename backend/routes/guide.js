const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all guide posts (with guide trip counts for trusted badge)
router.get('/posts', async (req, res) => {
    try {
        const db = getDb();
        const posts = await db.collection('guide_posts').find().sort({ createdAt: -1 }).toArray();

        // Get all approved guides to populate trip counts
        const guides = await db.collection('users').find({ guideStatus: 'approved' }).toArray();
        const guideTripsMap = {};
        guides.forEach(g => {
            guideTripsMap[g.email] = g.trips || 0;
        });

        // Add guideTrips to each post for trusted badge display
        const postsWithTrips = posts.map(post => ({
            ...post,
            guideTrips: guideTripsMap[post.guideEmail] || 0
        }));

        res.json(postsWithTrips);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a guide post
router.post('/posts', async (req, res) => {
    try {
        const db = getDb();
        const newPost = {
            ...req.body,
            createdAt: new Date().toISOString(),
            comments: []
        };
        const result = await db.collection('guide_posts').insertOne(newPost);
        res.status(201).json({ ...newPost, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a comment to a guide post
router.post('/posts/:id/comments', async (req, res) => {
    try {
        const db = getDb();
        const { user, text, userEmail } = req.body;
        const comment = {
            user,
            text,
            userEmail,
            date: new Date().toISOString(),
            replies: []
        };

        await db.collection('guide_posts').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $push: { comments: comment } }
        );

        res.status(200).json({ message: 'Comment added', comment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reply to a comment on a guide post
router.post('/posts/:postId/comments/:commentIndex/reply', async (req, res) => {
    try {
        const db = getDb();
        const { postId, commentIndex } = req.params;
        const { user, text, userEmail } = req.body;

        const reply = {
            user,
            text,
            userEmail,
            date: new Date().toISOString()
        };

        // Get the post first
        const post = await db.collection('guide_posts').findOne({ _id: new ObjectId(postId) });
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Add reply to the specific comment
        const idx = parseInt(commentIndex);
        if (post.comments && post.comments[idx]) {
            if (!post.comments[idx].replies) {
                post.comments[idx].replies = [];
            }
            post.comments[idx].replies.push(reply);

            await db.collection('guide_posts').updateOne(
                { _id: new ObjectId(postId) },
                { $set: { comments: post.comments } }
            );

            res.status(200).json({ message: 'Reply added', reply });
        } else {
            res.status(404).json({ message: 'Comment not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Request to become a guide
router.post('/request', async (req, res) => {
    try {
        const db = getDb();
        const { userId, userName, userEmail, reason } = req.body;

        // Check if already requested
        const existing = await db.collection('guide_requests').findOne({
            userEmail,
            status: 'pending'
        });

        if (existing) {
            return res.status(400).json({ message: 'You already have a pending request' });
        }

        const request = {
            userId,
            userName,
            userEmail,
            reason,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        const result = await db.collection('guide_requests').insertOne(request);

        // Also update user's guideStatus to 'pending'
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { guideStatus: 'pending' } }
        );

        res.status(201).json({ ...request, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get pending guide requests (for admin)
router.get('/requests', async (req, res) => {
    try {
        const db = getDb();
        const requests = await db.collection('guide_requests').find({ status: 'pending' }).toArray();
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Approve/Reject guide request (admin)
router.put('/requests/:id', async (req, res) => {
    try {
        const db = getDb();
        const { status } = req.body; // 'approved' or 'rejected'

        const request = await db.collection('guide_requests').findOne({ _id: new ObjectId(req.params.id) });
        if (!request) return res.status(404).json({ message: 'Request not found' });

        // Update request status
        await db.collection('guide_requests').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status, updatedAt: new Date().toISOString() } }
        );

        // Update user's guide status
        await db.collection('users').updateOne(
            { email: request.userEmail },
            { $set: { guideStatus: status } }
        );

        res.json({ message: `Guide request ${status}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
