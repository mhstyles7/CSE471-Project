const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all destinations
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const rawDestinations = await db.collection('destinations').find().toArray();

        // Ensure every destination has a slug
        const destinations = rawDestinations.map(d => ({
            ...d,
            slug: d.slug || d.name.toLowerCase().replace(/ /g, '-').replace(/'/g, '')
        }));
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

// TEMP: Seed missing destinations
router.post('/seed', async (req, res) => {
    try {
        const db = getDb();
        const collection = db.collection('destinations');

        const newDestinations = [
            {
                slug: "sajekvalley",
                name: "Sajek Valley",
                district: "Rangamati",
                description: "The Queen of Hills, known for stunning cloud-covered landscapes.",
                risk_level: "Medium",
                eco_score: 92,
                comfort_score: 65,
                weather: { temp: "18°C", condition: "Cloudy" },
                coordinates: { lat: 23.3819, lng: 92.2938 },
                news: ["Tourist season at peak.", "New eco-resorts opened."],
                landmarks: [{ name: "Konglak Para" }, { name: "Ruilui Para" }],
                images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Sajek_Valley_2.jpg/1024px-Sajek_Valley_2.jpg"]
            },
            {
                slug: "sundarbans",
                name: "Sundarbans",
                district: "Khulna",
                description: "The largest mangrove forest, home to the Royal Bengal Tiger.",
                risk_level: "Medium",
                eco_score: 98,
                comfort_score: 50,
                weather: { temp: "28°C", condition: "Humid" },
                coordinates: { lat: 21.9497, lng: 89.1833 },
                news: ["Wildlife tours operational.", "Conservation efforts launched."],
                landmarks: [{ name: "Katka Beach" }, { name: "Hiron Point" }],
                images: ["https://media.istockphoto.com/id/1137892510/photo/narrow-creeks-with-river-stream-flowing-into-deep-mangrove-jungle-consisting-of-mainly.jpg?s=612x612&w=0&k=20&c=U9ZLD01pt1ErYGUym1X9bQpG6Zsh1N2bKa5J17fufok="]
            },
            {
                slug: "bandarban",
                name: "Bandarban",
                district: "Bandarban",
                description: "Home to the highest peaks in Bangladesh.",
                risk_level: "Low",
                eco_score: 95,
                comfort_score: 70,
                weather: { temp: "22°C", condition: "Pleasant" },
                coordinates: { lat: 22.1953, lng: 92.2184 },
                news: ["Trekking routes reopened.", "Handicraft festival announced."],
                landmarks: [{ name: "Nilgiri Hills" }, { name: "Golden Temple" }],
                images: ["https://t4.ftcdn.net/jpg/05/17/23/99/360_F_517239905_MzDgpNvaS32i0XXmK4d1pnvWgmin4oAJ.jpg"]
            },
            {
                slug: "coxsbazar",
                name: "Cox's Bazar",
                district: "Cox's Bazar",
                description: "The longest natural sea beach in the world.",
                risk_level: "Low",
                eco_score: 85,
                comfort_score: 80,
                weather: {
                    temp: "26°C",
                    condition: "Sunny"
                },
                coordinates: {
                    lat: 21.4272,
                    lng: 91.9858
                },
                news: [
                    "Beach tourism at all-time high.",
                    "New marine drive extension completed."
                ],
                landmarks: [
                    { name: "Inani Beach" },
                    { name: "Himchari National Park" }
                ],
                images: [
                    "https://images.unsplash.com/photo-1608958435020-e8a7109ba809?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y294JTIwYmF6YXIlMjBzZWElMjBiZWFjaHxlbnwwfHwwfHx8MA%3D%3D"
                ]
            }
        ];

        const results = [];
        for (const dest of newDestinations) {
            const existing = await collection.findOne({ slug: dest.slug });
            if (existing) {
                results.push({ slug: dest.slug, status: 'skipped' });
            } else {
                await collection.insertOne(dest);
                results.push({ slug: dest.slug, status: 'added' });
            }
        }

        res.json({ message: 'Seed complete', results });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
