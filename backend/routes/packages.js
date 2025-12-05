const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all packages
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const packages = await db.collection('packages').find().toArray();
        res.json(packages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a package (Agency only)
router.post('/', async (req, res) => {
    try {
        const db = getDb();
        const newPackage = req.body;
        newPackage.createdAt = new Date().toISOString();

        const result = await db.collection('packages').insertOne(newPackage);
        res.status(201).json({ ...newPackage, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
