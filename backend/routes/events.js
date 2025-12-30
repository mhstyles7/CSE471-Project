const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all events
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const events = await db.collection('events').find().sort({ date: 1 }).toArray();
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create Event
router.post('/', async (req, res) => {
    try {
        const db = getDb();
        const { name, date, location, description, maxParticipants, organizer, organizerId } = req.body;

        const newEvent = {
            name, date, location, description, maxParticipants: parseInt(maxParticipants),
            organizer, organizerId,
            participants: [{
                userId: organizerId,
                name: organizer,
                image: 'U', // Default or fetch from user
                joinedAt: new Date()
            }],
            status: 'open',
            itinerary: [],
            discussion: [],
            tasks: [],
            polls: [],
            invitedFriends: [], // List of userIds invited
            createdAt: new Date()
        };

        const result = await db.collection('events').insertOne(newEvent);
        res.status(201).json({ ...newEvent, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Join Event
router.put('/:id/join', async (req, res) => {
    try {
        const db = getDb();
        const { userId, userName, userImage } = req.body;
        const participant = { userId, name: userName, image: userImage || 'U', joinedAt: new Date() };

        const event = await db.collection('events').findOne({ _id: new ObjectId(req.params.id) });
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.participants.length >= event.maxParticipants) {
            return res.status(400).json({ message: 'Event is full' });
        }

        // Check if already joined
        const exists = event.participants.some(p => p.userId === userId);
        if (exists) return res.status(400).json({ message: 'Already joined' });

        await db.collection('events').updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $push: { participants: participant },
                // If now full, update status? (Optional logic)
            }
        );

        res.json({ message: 'Joined successfully', participant });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Leave Event
router.put('/:id/leave', async (req, res) => {
    try {
        const db = getDb();
        const { userId } = req.body;

        await db.collection('events').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $pull: { participants: { userId: userId } } }
        );

        res.json({ message: 'Left event' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ------------------------------------------------------------------
// FEATURES 4.3 (Itinerary) & 4.4/4.5 (Collaboration)
// ------------------------------------------------------------------

// Add Itinerary Item
router.post('/:id/itinerary', async (req, res) => {
    try {
        const db = getDb();
        const item = { ...req.body, id: new ObjectId() }; // Generate ID for item

        await db.collection('events').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $push: { itinerary: item } }
        );
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add Discussion Message
router.post('/:id/discussion', async (req, res) => {
    try {
        const db = getDb();
        const message = {
            id: new ObjectId(),
            ...req.body,
            time: new Date().toISOString()
        };

        await db.collection('events').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $push: { discussion: message } }
        );
        res.json(message);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add Task
router.post('/:id/tasks', async (req, res) => {
    try {
        const db = getDb();
        const task = {
            id: new ObjectId(),
            ...req.body,
            completed: false
        };

        await db.collection('events').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $push: { tasks: task } }
        );
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Toggle Task
router.put('/:id/tasks/:taskId', async (req, res) => {
    try {
        const db = getDb();
        // MongoDB array update is tricky for toggle, so we might need find then update or use aggregation pipeline
        // Simplest: Find, modify in memory, save. Or use $set with arrayFilters if strictly atomic preferred.
        // Let's use arrayFilters for correctness

        // However, standard simplistic toggle:
        const event = await db.collection('events').findOne({
            _id: new ObjectId(req.params.id),
            "tasks.id": new ObjectId(req.params.taskId)
        });

        if (event) {
            const task = event.tasks.find(t => t.id.toString() === req.params.taskId);
            const newStatus = !task.completed;

            await db.collection('events').updateOne(
                { _id: new ObjectId(req.params.id), "tasks.id": new ObjectId(req.params.taskId) },
                { $set: { "tasks.$.completed": newStatus } }
            );
            res.json({ completed: newStatus });
        } else {
            res.status(404).json({ message: "Task not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add Poll
router.post('/:id/polls', async (req, res) => {
    try {
        const db = getDb();
        const poll = {
            id: new ObjectId(),
            ...req.body, // question, options: [{id, text, votes}]
            userVotes: {} // Map userId -> optionId
        };

        await db.collection('events').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $push: { polls: poll } }
        );
        res.json(poll);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Vote Poll
router.put('/:id/polls/:pollId/vote', async (req, res) => {
    try {
        const db = getDb();
        const { userId, optionId } = req.body;

        const event = await db.collection('events').findOne({ _id: new ObjectId(req.params.id) });
        const poll = event.polls.find(p => p.id.toString() === req.params.pollId);

        if (!poll) return res.status(404).json({ message: "Poll not found" });

        // Logic to update votes
        // userVotes: { "userId123": "optionA" }
        const oldVote = poll.userVotes ? poll.userVotes[userId] : null;

        // Update poll options counts
        poll.options = poll.options.map(opt => {
            let change = 0;
            if (opt.id === oldVote) change--;
            if (opt.id === optionId) change++;
            return { ...opt, votes: (opt.votes || 0) + change };
        });

        // Update user vote
        if (!poll.userVotes) poll.userVotes = {};
        poll.userVotes[userId] = optionId;

        await db.collection('events').updateOne(
            { _id: new ObjectId(req.params.id), "polls.id": new ObjectId(req.params.pollId) },
            { $set: { "polls.$.options": poll.options, "polls.$.userVotes": poll.userVotes } }
        );

        res.json(poll);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// ------------------------------------------------------------------
// INVITATIONS (4.2)
// ------------------------------------------------------------------

// Send Invitation
router.post('/:id/invite', async (req, res) => {
    try {
        const db = getDb();
        const { invitedUserId, invitedByUserId, invitedByUserName, invitedByUserImage } = req.body;

        // Check if already invited
        const existing = await db.collection('event_invitations').findOne({
            eventId: new ObjectId(req.params.id),
            toUserId: typeof invitedUserId === 'string' ? invitedUserId : invitedUserId.toString()
        });

        if (existing) return res.status(400).json({ message: 'Already invited' });

        const event = await db.collection('events').findOne({ _id: new ObjectId(req.params.id) });

        const invite = {
            eventId: new ObjectId(req.params.id),
            eventName: event.name,
            eventDate: event.date,
            eventLocation: event.location,
            toUserId: invitedUserId, // String mainly
            fromUserId: invitedByUserId,
            fromUserName: invitedByUserName,
            fromUserImage: invitedByUserImage,
            status: 'pending', // 'accepted', 'declined'
            createdAt: new Date()
        };

        await db.collection('event_invitations').insertOne(invite);

        // Also track in event for easier checking
        await db.collection('events').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $addToSet: { invitedFriends: invitedUserId } }
        );

        res.json({ message: 'Invitation sent' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get User Invitations
router.get('/invitations/:userId', async (req, res) => {
    try {
        const db = getDb();
        const invites = await db.collection('event_invitations').find({
            toUserId: req.params.userId,
            status: 'pending'
        }).toArray();
        res.json(invites);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Respond to invitation
router.put('/invitations/:inviteId', async (req, res) => {
    try {
        const db = getDb();
        const { status } = req.body; // 'accepted' or 'declined'

        await db.collection('event_invitations').updateOne(
            { _id: new ObjectId(req.params.inviteId) },
            { $set: { status: status } }
        );

        res.json({ message: `Invitation ${status}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
