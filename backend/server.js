
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
// connectDB call moved to bottom

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/events', require('./routes/events'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/route-estimator', require('./routes/routeEstimator'));
app.use('/api/heatmap', require('./routes/heatmap'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/trip-plans', require('./routes/tripPlans'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/guide', require('./routes/guide'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/foods', require('./routes/foods'));
app.use('/api/custom-bookings', require('./routes/custom-bookings'));

// Serve static files from 'uploads' directory
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('Server is running');
});

const { getDb } = require('./config/db');

// Connect to Database and Start Server
connectDB().then(async () => {
    // Auto-fix images on startup
    try {
        const db = getDb();
        console.log("Running Auto-Fix for Images...");
        await db.collection('destinations').updateOne({ slug: 'coxsbazar' }, { $set: { images: ["https://images.unsplash.com/photo-1594191494411-bd56a81bf6d7?auto=format&fit=crop&w=800"] } });
        await db.collection('destinations').updateOne({ slug: 'sylhet' }, { $set: { images: ["https://images.unsplash.com/photo-1599407335272-b7a48dbe559d?auto=format&fit=crop&w=800"] } });
        await db.collection('destinations').updateOne({ slug: 'dhaka' }, { $set: { images: ["https://images.unsplash.com/photo-1606216065532-618451996720?auto=format&fit=crop&w=800"] } });
        await db.collection('destinations').updateOne({ slug: 'chittagong' }, { $set: { images: ["https://images.unsplash.com/photo-1587216694668-3058a97e682e?auto=format&fit=crop&w=800"] } });
        console.log("Images Fixed!");
    } catch (err) {
        console.error("Auto-Fix Failed:", err);
    }

    app.listen(port, () => {
        console.log(`Server running on port: ${port} `);
    });
}).catch(err => {
    console.error("Failed to connect to Database", err);
    process.exit(1);
});

app.get('/health', (req, res) => {
    try {
        const { getDb } = require('./config/db');
        const db = getDb();
        res.json({ status: 'ok', database: 'connected', dbName: db.databaseName });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

