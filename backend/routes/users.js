const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all users (Admin only ideally, but public for now based on requirements)
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const users = await db.collection('users').find().toArray();
        // Remove passwords
        const safeUsers = users.map(user => {
            const { password, ...rest } = user;
            return rest;
        });
        res.json(safeUsers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const db = getDb();
        const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { password, ...safeUser } = user;
        res.json(safeUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update user profile
// Update user profile (Specific fields)
router.put('/:id/profile', async (req, res) => {
    try {
        const db = getDb();
        const userId = req.params.id;
        const { name, bio, avatar, coverImage, isPremium, freeGuideBookingUsed } = req.body;

        // Build update object with only provided fields
        const updateFields = { updatedAt: new Date() };
        if (name !== undefined) updateFields.name = name;
        if (bio !== undefined) updateFields.bio = bio;
        if (avatar !== undefined) updateFields.avatar = avatar;
        if (coverImage !== undefined) updateFields.coverImage = coverImage;
        if (isPremium !== undefined) updateFields.isPremium = isPremium;
        if (freeGuideBookingUsed !== undefined) updateFields.freeGuideBookingUsed = freeGuideBookingUsed;

        const result = await db.collection('users').findOneAndUpdate(
            { _id: new ObjectId(userId) },
            { $set: updateFields },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { password, ...safeUser } = result;
        res.json(safeUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update user (Generic - Admin or internal use)
router.put('/:id', async (req, res) => {
    try {
        const db = getDb();
        const updates = req.body;

        // Remove sensitive fields that shouldn't be updated this way
        delete updates.password;
        delete updates._id;

        await db.collection('users').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updates }
        );

        const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
        const { password, ...safeUser } = updatedUser;
        res.json(safeUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Send Friend Request
router.post('/request', async (req, res) => {
    try {
        const db = getDb();
        const { fromUserId, toUserId } = req.body;

        if (fromUserId === toUserId) {
            return res.status(400).json({ message: "Cannot send request to yourself" });
        }

        // Check if already friends
        const fromUser = await db.collection('users').findOne({ _id: new ObjectId(fromUserId) });
        if (fromUser.friends && fromUser.friends.includes(toUserId)) {
            return res.status(400).json({ message: "Already friends" });
        }

        // Check for existing pending request
        const existingRequest = await db.collection('friend_requests').findOne({
            fromUserId: new ObjectId(fromUserId),
            toUserId: new ObjectId(toUserId),
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Request already sent" });
        }

        // Check for reverse request (if B sent to A already)
        const reverseRequest = await db.collection('friend_requests').findOne({
            fromUserId: new ObjectId(toUserId),
            toUserId: new ObjectId(fromUserId),
            status: 'pending'
        });

        if (reverseRequest) {
            return res.status(400).json({ message: "This user already sent you a request. Check your inbox!" });
        }

        // Create Request
        await db.collection('friend_requests').insertOne({
            fromUserId: new ObjectId(fromUserId),
            toUserId: new ObjectId(toUserId),
            status: 'pending',
            createdAt: new Date()
        });

        res.json({ message: "Friend request sent successfully!" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Pending Requests (Incoming)
router.get('/:userId/requests', async (req, res) => {
    try {
        const db = getDb();
        const requests = await db.collection('friend_requests').find({
            toUserId: new ObjectId(req.params.userId),
            status: 'pending'
        }).toArray();

        // Enrich with User Details
        const enrichedRequests = await Promise.all(requests.map(async (req) => {
            const fromUser = await db.collection('users').findOne({ _id: req.fromUserId });
            return {
                id: req._id,
                fromUser: {
                    _id: fromUser._id,
                    name: fromUser.name,
                    avatar: fromUser.avatar,
                    role: fromUser.role
                },
                createdAt: req.createdAt
            };
        }));

        res.json(enrichedRequests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Handle Request (Accept/Reject)
router.put('/request/:requestId', async (req, res) => {
    try {
        const db = getDb();
        const { status } = req.body; // 'accepted' or 'rejected'
        const requestId = req.params.requestId;

        const request = await db.collection('friend_requests').findOne({ _id: new ObjectId(requestId) });
        if (!request) return res.status(404).json({ message: "Request not found" });

        if (status === 'accepted') {
            // Update Request Status
            await db.collection('friend_requests').updateOne(
                { _id: new ObjectId(requestId) },
                { $set: { status: 'accepted' } }
            );

            // Add to BOTH users' friend lists
            await db.collection('users').updateOne(
                { _id: request.fromUserId },
                { $addToSet: { friends: request.toUserId.toString() } }
            );
            await db.collection('users').updateOne(
                { _id: request.toUserId },
                { $addToSet: { friends: request.fromUserId.toString() } }
            );

            res.json({ message: "Friend request accepted!" });
        } else if (status === 'rejected') {
            await db.collection('friend_requests').updateOne(
                { _id: new ObjectId(requestId) },
                { $set: { status: 'rejected' } }
            );
            res.json({ message: "Friend request rejected." });
        } else {
            res.status(400).json({ message: "Invalid status" });
        }

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Cancel (Delete) Friend Request
router.delete('/request/:requestId', async (req, res) => {
    try {
        const db = getDb();
        const requestId = req.params.requestId;

        const result = await db.collection('friend_requests').deleteOne({
            _id: new ObjectId(requestId)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Request not found" });
        }

        res.json({ message: "Request cancelled successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Remove a friend
router.delete('/:id/friends/:friendId', async (req, res) => {
    try {
        const db = getDb();
        const { id, friendId } = req.params;

        await db.collection('users').updateOne(
            { _id: new ObjectId(id) },
            { $pull: { friends: friendId } }
        );

        res.json({ message: "Friend removed successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user's friend list
router.get('/:id/friends', async (req, res) => {
    try {
        const db = getDb();
        const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });

        if (!user || !user.friends) {
            return res.json([]);
        }

        // Fetch friend details
        const friendIds = user.friends.map(id => new ObjectId(id));
        const friends = await db.collection('users').find({ _id: { $in: friendIds } }).toArray();

        // Safe return
        const safeFriends = friends.map(f => {
            const { password, ...rest } = f;
            return rest;
        });

        res.json(safeFriends);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Check Sent Requests (For UI state)
router.get('/:userId/sent-requests', async (req, res) => {
    try {
        const db = getDb();
        const requests = await db.collection('friend_requests').find({
            fromUserId: new ObjectId(req.params.userId),
            status: 'pending'
        }).toArray();

        // Enrich with User Details
        const enrichedRequests = await Promise.all(requests.map(async (req) => {
            const toUser = await db.collection('users').findOne({ _id: req.toUserId });
            if (!toUser) return null; // Skip if user not found

            return {
                id: req._id, // Request ID
                toUser: {
                    _id: toUser._id,
                    name: toUser.name,
                    avatar: toUser.avatar,
                    role: toUser.role
                },
                createdAt: req.createdAt
            };
        }));

        res.json(enrichedRequests.filter(req => req !== null));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user profile stats (for profile page - real-time MongoDB data)
router.get('/:id/stats', async (req, res) => {
    try {
        const db = getDb();
        const userId = req.params.id;

        // Get user basic info
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Count reviews written by this user
        const reviewsCount = await db.collection('reviews').countDocuments({ userId: userId });

        // Count trips completed (from bookings or saved_trip_plans)
        const tripsCompleted = await db.collection('bookings').countDocuments({
            userId: userId,
            status: { $in: ['confirmed', 'completed'] }
        });

        // Friends count from user.friends array
        const friendsCount = (user.friends && Array.isArray(user.friends)) ? user.friends.length : 0;

        // Travel points from user document
        const points = user.points || 0;

        // Compute badges dynamically based on achievements
        const badges = [
            {
                id: 1,
                name: 'Explorer',
                icon: '🌍',
                unlocked: tripsCompleted >= 3,
                description: 'Completed 3 or more trips'
            },
            {
                id: 2,
                name: 'Photographer',
                icon: '📸',
                unlocked: points >= 200,
                description: 'Earned 200+ travel points'
            },
            {
                id: 3,
                name: 'Social Butterfly',
                icon: '🦋',
                unlocked: friendsCount >= 5,
                description: 'Made 5 or more friends'
            },
            {
                id: 4,
                name: 'Reviewer',
                icon: '✍️',
                unlocked: reviewsCount >= 5,
                description: 'Wrote 5 or more reviews'
            },
            {
                id: 5,
                name: 'Mountaineer',
                icon: '🏔️',
                unlocked: tripsCompleted >= 5,
                description: 'Completed 5 or more trips'
            }
        ];

        // Get recent activities from user_activities collection
        const recentActivity = await db.collection('user_activities')
            .find({ userId: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        // Format activities for frontend
        const formattedActivity = recentActivity.map((activity, index) => {
            // Calculate relative time
            const now = new Date();
            const activityDate = new Date(activity.createdAt);
            const diffMs = now - activityDate;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            let dateStr;
            if (diffDays === 0) dateStr = 'Today';
            else if (diffDays === 1) dateStr = 'Yesterday';
            else if (diffDays < 7) dateStr = `${diffDays} days ago`;
            else dateStr = `${Math.floor(diffDays / 7)} week(s) ago`;

            // Determine points based on activity type
            let pointsStr = '+10';
            if (activity.type === 'review_posted') pointsStr = '+50';
            else if (activity.type === 'trip_completed') pointsStr = '+100';
            else if (activity.type === 'badge_earned') pointsStr = 'Badge';

            return {
                id: index + 1,
                action: activity.description || activity.type,
                date: dateStr,
                points: pointsStr
            };
        });

        res.json({
            tripsCompleted,
            friendsCount,
            points,
            reviewsCount,
            tier: user.tier || 'Bronze',
            badges,
            recentActivity: formattedActivity
        });

    } catch (err) {
        console.error('Error fetching user stats:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
