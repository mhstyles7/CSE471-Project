const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all trip plans with filtering
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const { destination, style } = req.query;

        const query = {};
        if (destination) {
            query.destinationName = { $regex: destination, $options: 'i' };
        }
        if (style) {
            query.style = style.toLowerCase();
        }

        let plans = await db.collection('trip_plans').find(query).toArray();

        // If no plans exist, insert some mock data (for development)
        if (plans.length === 0 && !destination && !style) {
            const mockPlans = [
                {
                    title: "Cultural Heritage of Dhaka",
                    destinationName: "Dhaka",
                    duration: "1 Day",
                    cost: "$50",
                    style: "cultural",
                    image: "https://images.unsplash.com/photo-1628662993427-046647244584?w=800&q=80",
                    highlights: ["Lalbagh Fort", "Ahsan Manzil", "Dhakeshwari Temple"],
                    timeline: [
                        { time: "09:00 AM", activity: "Lalbagh Fort", description: "Explore the 17th-century Mughal fort complex." },
                        { time: "11:30 AM", activity: "Dhakeshwari Temple", description: "Visit the national temple of Bangladesh." },
                        { time: "01:00 PM", activity: "Lunch", description: "Traditional Bengali lunch in Old Dhaka." },
                        { time: "02:30 PM", activity: "Ahsan Manzil", description: "Tour the Pink Palace, former seat of the Nawab of Dhaka." }
                    ]
                },
                {
                    title: "Sylhet Tea Gardens Escape",
                    destinationName: "Sylhet",
                    duration: "1 Day",
                    cost: "$40",
                    style: "leisure",
                    image: "https://images.unsplash.com/photo-1598556688689-5324546522c7?w=800&q=80",
                    highlights: ["Ratargul Swamp Forest", "Tea Gardens", "Jaflong"],
                    timeline: [
                        { time: "08:00 AM", activity: "Ratargul Swamp Forest", description: "Boat ride through the freshwater swamp forest." },
                        { time: "11:00 AM", activity: "Tea Gardens", description: "Walk through the lush green tea estates." },
                        { time: "01:00 PM", activity: "Lunch", description: "Local cuisine with Seven Layer Tea." },
                        { time: "03:00 PM", activity: "Jaflong", description: "Visit the zero point and enjoy the view of hills." }
                    ]
                },
                {
                    title: "Cox's Bazar Beach Adventure",
                    destinationName: "Cox's Bazar",
                    duration: "1 Day",
                    cost: "$60",
                    style: "adventure",
                    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
                    highlights: ["Parasailing", "Himchari", "Inani Beach"],
                    timeline: [
                        { time: "09:00 AM", activity: "Beach Activities", description: "Parasailing and jet skiing at Sugandha Beach." },
                        { time: "12:00 PM", activity: "Himchari", description: "Drive along the marine drive to Himchari National Park." },
                        { time: "02:00 PM", activity: "Lunch", description: "Seafood lunch by the beach." },
                        { time: "04:00 PM", activity: "Inani Beach", description: "Sunset view at the coral beach." }
                    ]
                }
            ];

            if (await db.collection('trip_plans').countDocuments() === 0) {
                await db.collection('trip_plans').insertMany(mockPlans);
                plans = mockPlans;
            }
        }

        res.json(plans);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get saved plans for a user
router.get('/saved/:userId', async (req, res) => {
    try {
        const db = getDb();
        const { userId } = req.params;

        const savedPlans = await db.collection('saved_trip_plans')
            .find({ userId })
            .toArray();

        res.json(savedPlans);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Save a plan
router.post('/save', async (req, res) => {
    try {
        const db = getDb();
        const { userId, planId } = req.body;

        if (!userId || !planId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        await db.collection('saved_trip_plans').updateOne(
            { userId, planId },
            { $set: { userId, planId, savedAt: new Date() } },
            { upsert: true }
        );

        res.json({ message: 'Plan saved successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Unsave a plan
router.delete('/unsave/:userId/:planId', async (req, res) => {
    try {
        const db = getDb();
        const { userId, planId } = req.params;

        await db.collection('saved_trip_plans').deleteOne({ userId, planId });

        res.json({ message: 'Plan removed from saved' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
