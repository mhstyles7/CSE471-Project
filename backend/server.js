const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 1306;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/guide', require('./routes/guide'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/events', require('./routes/events'));
app.use('/api/foods', require('./routes/foods'));
app.use('/api/custom-bookings', require('./routes/custom-bookings'));

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
