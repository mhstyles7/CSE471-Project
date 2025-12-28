const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// ============================================
// REVIEWS
// ============================================

// Get all reviews for a destination
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const { destinationId } = req.query;

        if (!destinationId) {
            return res.status(400).json({ message: 'Destination ID is required' });
        }

        const reviews = await db.collection('reviews')
            .find({ destinationId })
            .sort({ createdAt: -1 })
            .toArray();

        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get review statistics for a destination
router.get('/stats', async (req, res) => {
    try {
        const db = getDb();
        const { destinationId } = req.query;

        if (!destinationId) {
            return res.status(400).json({ message: 'Destination ID is required' });
        }

        const stats = await db.collection('reviews').aggregate([
            { $match: { destinationId } },
            {
                $group: {
                    _id: '$destinationId',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $count: {} },
                    ratingCounts: {
                        $push: '$rating'
                    }
                }
            }
        ]).toArray();

        if (stats.length === 0) {
            return res.json({ averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
        }

        const result = stats[0];
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        result.ratingCounts.forEach(r => distribution[r] = (distribution[r] || 0) + 1);

        res.json({
            averageRating: parseFloat(result.averageRating.toFixed(1)),
            totalReviews: result.totalReviews,
            distribution
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Submit a new review
router.post('/', async (req, res) => {
    try {
        const db = getDb();
        console.log('POST /api/reviews body:', req.body);
        const { userId, userName, userAvatar, destinationId, destinationName, rating, comment } = req.body;

        if (!userId || !destinationId || !rating) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if user already reviewed this destination
        const existingReview = await db.collection('reviews').findOne({ userId, destinationId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this destination' });
        }

        const newReview = {
            userId,
            userName,
            userAvatar,
            destinationId,
            destinationName,
            rating: Number(rating),
            comment,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('reviews').insertOne(newReview);

        // Log activity
        await db.collection('user_activities').insertOne({
            userId,
            type: 'review_posted',
            description: `Reviewed ${destinationName}`,
            relatedId: result.insertedId,
            createdAt: new Date()
        });

        res.status(201).json({ ...newReview, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a review
router.put('/:reviewId', async (req, res) => {
    try {
        const db = getDb();
        const { reviewId } = req.params;
        const { rating, comment, userId } = req.body;

        const review = await db.collection('reviews').findOne({ _id: new ObjectId(reviewId) });

        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (review.userId !== userId) return res.status(403).json({ message: 'Not authorized' });

        await db.collection('reviews').updateOne(
            { _id: new ObjectId(reviewId) },
            {
                $set: {
                    rating: Number(rating),
                    comment,
                    updatedAt: new Date()
                }
            }
        );

        res.json({ message: 'Review updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a review
router.delete('/:reviewId', async (req, res) => {
    try {
        const db = getDb();
        const { reviewId } = req.params;
        const { userId } = req.query; // Pass userId as query param for delete

        const review = await db.collection('reviews').findOne({ _id: new ObjectId(reviewId) });

        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (review.userId !== userId) return res.status(403).json({ message: 'Not authorized' });

        await db.collection('reviews').deleteOne({ _id: new ObjectId(reviewId) });

        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
