const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all posts (can filter by type or userRole)
router.get('/', async (req, res) => {
    try {
        const { type, role } = req.query;
        const db = getDb();
        const query = {};
        if (type) query.type = type;
        if (role) query.userRole = role;

        const posts = await db.collection('posts').find(query).toArray();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a post
router.post('/', async (req, res) => {
    try {
        const db = getDb();
        const newPost = req.body;
        newPost.createdAt = new Date().toISOString();
        newPost.likes = 0;
        newPost.comments = [];

        const result = await db.collection('posts').insertOne(newPost);

        // Award Points to User
        if (newPost.userId) {
            const pointsToAdd = 10;
            const usersCollection = db.collection('users');

            // Fetch current user to determine new tier
            const user = await usersCollection.findOne({ _id: new ObjectId(newPost.userId) });

            if (user) {
                const newPoints = (user.points || 0) + pointsToAdd;
                let newTier = 'Bronze';
                if (newPoints >= 1000) newTier = 'Gold';
                else if (newPoints >= 500) newTier = 'Silver';

                await usersCollection.updateOne(
                    { _id: new ObjectId(newPost.userId) },
                    { $set: { points: newPoints, tier: newTier } }
                );
            }
        }

        res.status(201).json({ ...newPost, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a comment to a post
router.post('/:id/comments', async (req, res) => {
    try {
        const db = getDb();
        const { user, text, userId, userImage } = req.body;
        const comment = {
            _id: new ObjectId(), // Generate distinct ID
            userId,
            author: user, // user name
            authorImage: userImage || 'U',
            text,
            date: new Date().toISOString(),
            likes: 0,
            replies: []
        };

        await db.collection('posts').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $push: { comments: comment } }
        );

        res.status(200).json(comment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reply to a comment
router.post('/:id/comments/:commentId/replies', async (req, res) => {
    try {
        const db = getDb();
        const { user, text, userId, userImage } = req.body;
        const reply = {
            id: new ObjectId(),
            userId,
            author: user,
            authorImage: userImage || 'U',
            text,
            time: new Date().toISOString(),
            likes: 0
        };

        await db.collection('posts').updateOne(
            { _id: new ObjectId(req.params.id), "comments._id": new ObjectId(req.params.commentId) },
            { $push: { "comments.$.replies": reply } }
        );

        res.status(200).json(reply);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// React to a post
router.post('/:id/react', async (req, res) => {
    try {
        const db = getDb();
        const { userId, type } = req.body;

        const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
        if (!post) return res.status(404).json({ message: 'Post not found' });

        let reactions = post.reactions || [];
        // Remove existing reaction from this user if any
        const existingIndex = reactions.findIndex(r => r.userId === userId);
        let action = 'added';

        if (existingIndex > -1) {
            if (reactions[existingIndex].type === type) {
                // Toggle off
                reactions.splice(existingIndex, 1);
                action = 'removed';
            } else {
                // Change reaction
                reactions[existingIndex].type = type;
                action = 'updated';
            }
        } else {
            reactions.push({ userId, type });
        }

        await db.collection('posts').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { reactions: reactions } }
        );

        res.status(200).json({ reactions, action });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
