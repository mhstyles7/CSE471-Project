const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const bcrypt = require('bcrypt');
<<<<<<< HEAD
const { ObjectId } = require('mongodb');

// Helper: Generate random token
const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
=======
>>>>>>> origin/Tashu

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
<<<<<<< HEAD
            joinedDate: new Date().toISOString(),
            authProvider: 'local',
            createdAt: new Date(),
            updatedAt: new Date()
=======
            joinedDate: new Date().toISOString()
>>>>>>> origin/Tashu
        };

        const result = await users.insertOne(newUser);
        const { password: _, ...userWithoutPassword } = newUser;
        userWithoutPassword._id = result.insertedId;
<<<<<<< HEAD
        userWithoutPassword.loginTime = new Date().toISOString();
=======
>>>>>>> origin/Tashu

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

<<<<<<< HEAD
        // Check if user registered with social login
        if (user.authProvider === 'google' && !user.password) {
            return res.status(400).json({ message: 'Please login with Google' });
        }

=======
>>>>>>> origin/Tashu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

<<<<<<< HEAD
        // Update last login time
        await users.updateOne(
            { _id: user._id },
            { $set: { lastLogin: new Date() } }
        );

        const { password: _, ...userWithoutPassword } = user;
        userWithoutPassword.loginTime = new Date().toISOString();
=======
        const { password: _, ...userWithoutPassword } = user;
>>>>>>> origin/Tashu
        res.json(userWithoutPassword);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

<<<<<<< HEAD
// Google OAuth Login/Register
router.post('/google', async (req, res) => {
    try {
        const { email, name, googleId, avatar } = req.body;

        if (!email || !googleId) {
            return res.status(400).json({ message: 'Email and Google ID are required' });
        }

        const db = getDb();
        const users = db.collection('users');

        // Check if user exists
        let user = await users.findOne({ $or: [{ email }, { googleId }] });

        if (user) {
            // User exists - update Google ID if not set and login
            if (!user.googleId) {
                await users.updateOne(
                    { _id: user._id },
                    { $set: { googleId, authProvider: 'google', lastLogin: new Date() } }
                );
            } else {
                await users.updateOne(
                    { _id: user._id },
                    { $set: { lastLogin: new Date() } }
                );
            }

            const { password: _, ...userWithoutPassword } = user;
            userWithoutPassword.loginTime = new Date().toISOString();
            return res.json(userWithoutPassword);
        }

        // Create new user with Google
        const newUser = {
            name: name || email.split('@')[0],
            email,
            googleId,
            authProvider: 'google',
            role: 'traveler',
            points: 0,
            tier: 'Bronze',
            isPremium: false,
            avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || email}`,
            joinedDate: new Date().toISOString(),
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLogin: new Date()
        };

        const result = await users.insertOne(newUser);
        newUser._id = result.insertedId;
        newUser.loginTime = new Date().toISOString();

        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Forgot Password - Request reset token
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const db = getDb();
        const users = db.collection('users');

        const user = await users.findOne({ email });
        if (!user) {
            // Don't reveal if email exists or not for security
            return res.json({ message: 'If this email exists, a reset link has been sent.' });
        }

        // Check if user registered with Google only
        if (user.authProvider === 'google' && !user.password) {
            return res.status(400).json({ message: 'This account uses Google login. Please sign in with Google.' });
        }

        // Generate reset token
        const resetToken = generateToken();
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

        // Store reset token in database
        await db.collection('password_resets').deleteMany({ email }); // Remove old tokens
        await db.collection('password_resets').insertOne({
            email,
            token: resetToken,
            expiresAt: resetTokenExpiry,
            createdAt: new Date()
        });

        // In production, send email. For now, log the token
        console.log(`\n========== PASSWORD RESET ==========`);
        console.log(`Email: ${email}`);
        console.log(`Reset Token: ${resetToken}`);
        console.log(`Reset URL: http://localhost:3000/reset-password?token=${resetToken}`);
        console.log(`====================================\n`);

        res.json({
            message: 'If this email exists, a reset link has been sent.',
            // For demo purposes, include token in response (remove in production)
            token: resetToken
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reset Password - Verify token and set new password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const db = getDb();

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Find valid reset token
        const resetRecord = await db.collection('password_resets').findOne({
            token,
            expiresAt: { $gt: new Date() }
        });

        if (!resetRecord) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        await db.collection('users').updateOne(
            { email: resetRecord.email },
            {
                $set: {
                    password: hashedPassword,
                    updatedAt: new Date()
                }
            }
        );

        // Delete used token
        await db.collection('password_resets').deleteOne({ token });

        res.json({ message: 'Password reset successful. You can now login with your new password.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Validate Session - Check if session is still valid (24 hours)
router.post('/validate-session', async (req, res) => {
    try {
        const { userId, loginTime } = req.body;
        const db = getDb();

        if (!userId || !loginTime) {
            return res.status(400).json({ valid: false, message: 'Missing session data' });
        }

        // Check if session is within 24 hours
        const loginDate = new Date(loginTime);
        const now = new Date();
        const hoursDiff = (now - loginDate) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
            return res.json({ valid: false, message: 'Session expired' });
        }

        // Verify user still exists
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.json({ valid: false, message: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json({ valid: true, user: userWithoutPassword });
    } catch (err) {
        res.status(500).json({ valid: false, message: err.message });
=======
// Get user profile (for refreshing user data)
router.get('/profile/:email', async (req, res) => {
    try {
        const db = getDb();
        const user = await db.collection('users').findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (err) {
        res.status(500).json({ message: err.message });
>>>>>>> origin/Tashu
    }
});

module.exports = router;
<<<<<<< HEAD

=======
>>>>>>> origin/Tashu
