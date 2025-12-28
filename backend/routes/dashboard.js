const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// ============================================
// DASHBOARD OVERVIEW
// ============================================

// Get complete dashboard data for a user
router.get('/:userId', async (req, res) => {
    try {
        const db = getDb();
        const userId = req.params.userId;

        // Get user info
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Get travel history (completed trips)
        const travelHistory = await db.collection('travel_history')
            .find({ userId })
            .sort({ endDate: -1 })
            .limit(10)
            .toArray();

        // Get saved places
        const savedPlaces = await db.collection('saved_places')
            .find({ userId })
            .sort({ savedAt: -1 })
            .limit(10)
            .toArray();

        // Get recent activities
        const activities = await db.collection('user_activities')
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();

        // Calculate statistics
        const totalTrips = await db.collection('travel_history').countDocuments({ userId });
        const totalSavedPlaces = await db.collection('saved_places').countDocuments({ userId });

        // Get unique destinations visited
        const uniqueDestinations = await db.collection('travel_history').distinct('destination', { userId });

        const stats = {
            totalTrips,
            totalSavedPlaces,
            destinationsVisited: uniqueDestinations.length,
            memberSince: user.createdAt || user.registeredAt || new Date(),
            travelPoints: user.points || 0
        };

        // Remove password from user data
        const { password, ...safeUser } = user;

        res.json({
            user: safeUser,
            stats,
            travelHistory,
            savedPlaces,
            activities
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ============================================
// TRAVEL HISTORY (Completed Journeys)
// ============================================

// Get all travel history for a user
router.get('/:userId/travel-history', async (req, res) => {
    try {
        const db = getDb();
        const userId = req.params.userId;

        const history = await db.collection('travel_history')
            .find({ userId })
            .sort({ endDate: -1 })
            .toArray();

        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new trip to travel history
router.post('/:userId/travel-history', async (req, res) => {
    try {
        const db = getDb();
        const userId = req.params.userId;
        const { destination, startDate, endDate, notes, photos, rating, category } = req.body;

        const newTrip = {
            userId,
            destination,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            notes: notes || '',
            photos: photos || [],
            rating: rating || 0,
            category: category || 'leisure',
            createdAt: new Date()
        };

        const result = await db.collection('travel_history').insertOne(newTrip);

        // Add activity log
        await db.collection('user_activities').insertOne({
            userId,
            type: 'trip_completed',
            description: `Completed trip to ${destination}`,
            relatedId: result.insertedId.toString(),
            createdAt: new Date()
        });

        // Award travel points
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $inc: { points: 50 } }
        );

        res.status(201).json({ _id: result.insertedId, ...newTrip });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a trip in travel history
router.put('/:userId/travel-history/:tripId', async (req, res) => {
    try {
        const db = getDb();
        const { tripId } = req.params;
        const { destination, startDate, endDate, notes, photos, rating, category } = req.body;

        const updateFields = { updatedAt: new Date() };
        if (destination) updateFields.destination = destination;
        if (startDate) updateFields.startDate = new Date(startDate);
        if (endDate) updateFields.endDate = new Date(endDate);
        if (notes !== undefined) updateFields.notes = notes;
        if (photos) updateFields.photos = photos;
        if (rating !== undefined) updateFields.rating = rating;
        if (category) updateFields.category = category;

        const result = await db.collection('travel_history').findOneAndUpdate(
            { _id: new ObjectId(tripId) },
            { $set: updateFields },
            { returnDocument: 'after' }
        );

        if (!result) return res.status(404).json({ message: 'Trip not found' });
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a trip from travel history
router.delete('/:userId/travel-history/:tripId', async (req, res) => {
    try {
        const db = getDb();
        const { tripId } = req.params;

        const result = await db.collection('travel_history').deleteOne({ _id: new ObjectId(tripId) });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Trip not found' });

        res.json({ message: 'Trip deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ============================================
// SAVED PLACES
// ============================================

// Get all saved places for a user
router.get('/:userId/saved-places', async (req, res) => {
    try {
        const db = getDb();
        const userId = req.params.userId;

        const places = await db.collection('saved_places')
            .find({ userId })
            .sort({ savedAt: -1 })
            .toArray();

        res.json(places);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Save a new place
router.post('/:userId/saved-places', async (req, res) => {
    try {
        const db = getDb();
        const userId = req.params.userId;
        const { name, location, category, notes, image, coordinates } = req.body;

        const newPlace = {
            userId,
            name,
            location,
            category: category || 'general',
            notes: notes || '',
            image: image || null,
            coordinates: coordinates || null,
            savedAt: new Date()
        };

        const result = await db.collection('saved_places').insertOne(newPlace);

        // Add activity log
        await db.collection('user_activities').insertOne({
            userId,
            type: 'place_saved',
            description: `Saved ${name} to favorites`,
            relatedId: result.insertedId.toString(),
            createdAt: new Date()
        });

        res.status(201).json({ _id: result.insertedId, ...newPlace });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Remove a saved place
router.delete('/:userId/saved-places/:placeId', async (req, res) => {
    try {
        const db = getDb();
        const { placeId } = req.params;

        const result = await db.collection('saved_places').deleteOne({ _id: new ObjectId(placeId) });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Place not found' });

        res.json({ message: 'Place removed from saved' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ============================================
// USER ACTIVITIES
// ============================================

// Get recent activities for a user
router.get('/:userId/activities', async (req, res) => {
    try {
        const db = getDb();
        const userId = req.params.userId;
        const limit = parseInt(req.query.limit) || 20;

        const activities = await db.collection('user_activities')
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray();

        res.json(activities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add an activity (can be called from other parts of the app)
router.post('/:userId/activities', async (req, res) => {
    try {
        const db = getDb();
        const userId = req.params.userId;
        const { type, description, relatedId } = req.body;

        const newActivity = {
            userId,
            type,
            description,
            relatedId: relatedId || null,
            createdAt: new Date()
        };

        const result = await db.collection('user_activities').insertOne(newActivity);
        res.status(201).json({ _id: result.insertedId, ...newActivity });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ============================================
// TRAVEL STATISTICS
// ============================================

// Get detailed travel statistics for a user
router.get('/:userId/stats', async (req, res) => {
    try {
        const db = getDb();
        const userId = req.params.userId;

        // Total trips
        const totalTrips = await db.collection('travel_history').countDocuments({ userId });

        // Unique destinations
        const uniqueDestinations = await db.collection('travel_history').distinct('destination', { userId });

        // Trips by category
        const tripsByCategory = await db.collection('travel_history').aggregate([
            { $match: { userId } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]).toArray();

        // Trips by month (last 12 months)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const tripsByMonth = await db.collection('travel_history').aggregate([
            { $match: { userId, endDate: { $gte: oneYearAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$endDate' },
                        month: { $month: '$endDate' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]).toArray();

        // Average trip rating
        const avgRating = await db.collection('travel_history').aggregate([
            { $match: { userId, rating: { $gt: 0 } } },
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]).toArray();

        // Total saved places
        const totalSavedPlaces = await db.collection('saved_places').countDocuments({ userId });

        // Get user points
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

        res.json({
            totalTrips,
            destinationsVisited: uniqueDestinations.length,
            destinations: uniqueDestinations,
            tripsByCategory,
            tripsByMonth,
            averageRating: avgRating[0]?.avgRating || 0,
            totalSavedPlaces,
            travelPoints: user?.points || 0,
            memberSince: user?.createdAt || user?.registeredAt
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
