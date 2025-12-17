const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');

// Get all routes
router.get('/', async (req, res) => {
    try {
        // FORCING STATIC DATA (Bypassing DB)
        const routes = [
            { id: '101', from: 'dhaka', to: 'chittagong', date: '2023-10-25', risk: 3, comfort: 8, type: 'trip' },
            { id: '102', from: 'dhaka', to: 'sylhet', date: '2023-11-02', risk: 2, comfort: 9, type: 'trip' },
            { id: '103', from: 'khulna', to: 'dhaka', date: '2023-11-15', risk: 4, comfort: 7, type: 'trip' },
            { id: '104', from: 'coxs-bazar', to: 'chittagong', date: '2023-12-01', risk: 2, comfort: 9, type: 'trip' },
            { id: '105', from: 'rajshahi', to: 'dhaka', date: '2023-12-05', risk: 3, comfort: 8, type: 'trip' },
            { id: '106', from: 'barisal', to: 'kuakata', date: '2023-12-10', risk: 4, comfort: 6, type: 'trip' },
            { id: '107', from: 'sylhet', to: 'dhaka', date: '2023-12-12', risk: 2, comfort: 9, type: 'trip' }
        ];

        res.json(routes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
