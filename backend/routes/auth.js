const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const bcrypt = require('bcrypt');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const db = getDb();
        const users = db.collection('users');

        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            name,
            email,
            password: hashedPassword,
            role: role || 'traveler',
            points: 0,
            tier: 'Bronze',
            isPremium: false,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
            joinedDate: new Date().toISOString()
        };

        const result = await users.insertOne(newUser);
        const { password: _, ...userWithoutPassword } = newUser;
        userWithoutPassword._id = result.insertedId;

        res.status(201).json(userWithoutPassword);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = getDb();
        const users = db.collection('users');

        const user = await users.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
