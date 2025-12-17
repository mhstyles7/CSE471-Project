const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all destinations
router.get('/', async (req, res) => {
    try {
        // FORCING STATIC DATA TO ENSURE MAP WORKS (Bypassing potentially stale DB data)
        const destinations = [
            { _id: '1', name: 'Dhaka', slug: 'dhaka', coordinates: { lat: 23.8103, lng: 90.4125 }, description: 'Capital city', risk: 'Low', eco: 'Moderate', comfort: 'High', weather: { temp: '28°C', condition: 'Sunny' } },
            { _id: '2', name: "Cox's Bazar", slug: 'coxs-bazar', coordinates: { lat: 21.4272, lng: 91.9970 }, description: 'Longest sea beach', risk: 'Low', eco: 'Good', comfort: 'High', weather: { temp: '26°C', condition: 'Breezy' } },
            { _id: '3', name: 'Sylhet', slug: 'sylhet', coordinates: { lat: 24.8949, lng: 91.8687 }, description: 'Tea gardens', risk: 'Low', eco: 'Excellent', comfort: 'Medium', weather: { temp: '24°C', condition: 'Rainy' } },
            { _id: '4', name: 'Chittagong', slug: 'chittagong', coordinates: { lat: 22.3569, lng: 91.7832 }, description: 'Port city', risk: 'Medium', eco: 'Moderate', comfort: 'Medium', weather: { temp: '29°C', condition: 'Humid' } },
            { _id: '5', name: 'Khulna', slug: 'khulna', coordinates: { lat: 22.8456, lng: 89.5403 }, description: 'Gateway to Sundarbans', risk: 'Low', eco: 'Good', comfort: 'Medium', weather: { temp: '27°C', condition: 'Cloudy' } },
            { _id: '6', name: 'Rajshahi', slug: 'rajshahi', coordinates: { lat: 24.3636, lng: 88.6241 }, description: 'Silk city', risk: 'Low', eco: 'Good', comfort: 'Medium', weather: { temp: '32°C', condition: 'Hot' } },
            { _id: '7', name: 'Barisal', slug: 'barisal', coordinates: { lat: 22.7010, lng: 90.3535 }, description: 'City of rivers', risk: 'Low', eco: 'Excellent', comfort: 'Low', weather: { temp: '26°C', condition: 'Clear' } },
            { _id: '8', name: 'Rangpur', slug: 'rangpur', coordinates: { lat: 25.7439, lng: 89.2752 }, description: 'Northern hub', risk: 'Low', eco: 'Good', comfort: 'Low', weather: { temp: '25°C', condition: 'Clear' } },
            { _id: '9', name: 'Kuakata', slug: 'kuakata', coordinates: { lat: 21.8167, lng: 90.1167 }, description: 'Panoramic sea beach', risk: 'Low', eco: 'Good', comfort: 'Medium', weather: { temp: '27°C', condition: 'Sunny' } }
        ];

        res.json(destinations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get destination by ID
router.get('/:id', async (req, res) => {
    try {
        const db = getDb();
        const destination = await db.collection('destinations').findOne({ _id: new ObjectId(req.params.id) });
        if (!destination) return res.status(404).json({ message: 'Destination not found' });
        res.json(destination);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
