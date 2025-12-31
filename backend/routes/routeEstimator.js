const express = require('express');
const router = express.Router();

// Haversine formula to calculate distance between two coordinates in km
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Helper to generate a random fluctuation factor (e.g., 0.9 to 1.1)
function getDynamicFactor() {
    // Slightly wider range for pricing realism in BD context
    return 0.9 + Math.random() * 0.2;
}

router.post('/estimate', (req, res) => {
    try {
        const { start, end } = req.body;

        if (!start || !end || !start.lat || !start.lng || !end.lat || !end.lng) {
            return res.status(400).json({ message: 'Invalid start or end coordinates' });
        }

        const distance = calculateDistance(start.lat, start.lng, end.lat, end.lng);

        // Dynamic factors based on REAL TIME (Server Time)
        // This replaces "dummy random" with "time-based dynamic" logic
        const now = new Date();
        const hour = now.getHours(); // 0-23
        const day = now.getDay(); // 0 (Sun) - 6 (Sat)

        let trafficFactor = 1.0;
        let demandFactor = 1.0;

        // Peak Hours (8-11 AM and 5-8 PM)
        const isRushHour = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 20);
        // Weekend (Friday/Saturday in BD context typically)
        const isWeekend = (day === 5 || day === 6);

        if (isRushHour) {
            trafficFactor = 1.5; // 50% slower
            demandFactor = 1.3; // 30% surge price
        } else if (hour >= 23 || hour <= 5) {
            trafficFactor = 0.8; // Fast roads
            demandFactor = 0.9; // Night discount (rare, but let's say less traffic waste)
        }

        if (isWeekend) {
            // Leisure travel spike
            demandFactor *= 1.1;
        }

        // Bangladesh Context Base Rates (Approximate BDT)
        // Bus: 2.5 BDT/km
        // Train: 1.5 BDT/km
        // Car: 40 BDT/km (Rental + Fuel)
        // Flight: ~20 BDT/km + Base Fare (e.g., 3000 BDT)
        // CNG: 25 BDT/km + Base

        const modes = [
            {
                id: 'bus',
                name: 'Bus',
                avgSpeed: 40, // Dhaka traffic is slow
                baseRatePerKm: 2.5,
                baseFare: 50, // Minimum fare
                emissionPerKm: 27,
                comfort: 5,
                icon: 'bus'
            },
            {
                id: 'train',
                name: 'Train',
                avgSpeed: 60, // BD Trains are moderate speed
                baseRatePerKm: 1.8,
                baseFare: 100,
                emissionPerKm: 6,
                comfort: 7,
                icon: 'train'
            },
            {
                id: 'cng',
                name: 'CNG (Auto-rickshaw)',
                avgSpeed: 45,
                baseRatePerKm: 25.0,
                baseFare: 60,
                emissionPerKm: 65, // 2-stroke/4-stroke mix
                comfort: 4,
                icon: '🛺' // Using car icon for now, fallback
            },
            {
                id: 'car',
                name: 'Private Car / Uber',
                avgSpeed: 60,
                baseRatePerKm: 45.0, // Premium pricing
                baseFare: 200, // Base charge
                emissionPerKm: 170,
                comfort: 9,
                icon: 'car'
            },
            {
                id: 'flight',
                name: 'Domestic Flight',
                avgSpeed: 600,
                baseRatePerKm: 18.0,
                baseFare: 3500, // Airport taxes etc
                emissionPerKm: 250,
                comfort: 8,
                icon: 'plane'
            }
        ];

        const minimumDistanceForFlight = 100; // km
        const minimumDistanceForTrain = 20; // km - Trains aren't for intra-city typically
        const maximumDistanceForCNG = 50; // km - CNGs usually don't go inter-district long haul

        const estimates = modes
            .filter(mode => {
                if (mode.id === 'flight' && distance < minimumDistanceForFlight) return false;
                if (mode.id === 'train' && distance < minimumDistanceForTrain) return false;
                if (mode.id === 'cng' && distance > maximumDistanceForCNG) return false;
                return true;
            })
            .map(mode => {
                // Calculation Logic
                let durationHours = distance / mode.avgSpeed;

                // Traffic impact mostly on Road
                if (mode.id === 'car' || mode.id === 'bus' || mode.id === 'cng') {
                    durationHours *= trafficFactor;
                }

                // Cost: (Dist * Rate) + Base
                let estimatedCost = (distance * mode.baseRatePerKm * demandFactor) + mode.baseFare;

                // Calculate Emissions
                const totalEmissions = distance * mode.emissionPerKm;

                return {
                    mode: mode.id,
                    name: mode.name,
                    icon: mode.icon,
                    distance: Math.round(distance),
                    duration: durationHours, // in hours
                    cost: Math.round(estimatedCost),
                    currency: '৳', // BDT Symbol
                    code: 'BDT',
                    emissions: Math.round(totalEmissions / 1000), // kg CO2
                    comfortRating: mode.comfort,
                };
            });

        // AI Recommendation Logic: Best Travel Time with respect to Eco Score
        // The user wants a recommendation that balances Time and Eco Score.
        // We will calculate a specific 'Efficiency Score' for each mode.
        // Metric = (Time * Weight_T) * (Emissions * Weight_E) -> We want to MINIMIZE this product.
        // Actually, let's use a weighted score where lower is better.
        // Score = (Duration_Hours * 10) + (Emissions_kg); 
        // Example: 
        // Flight: 0.5hr * 10 = 5 + 50kg = 55
        // Train: 5hr * 10 = 50 + 2kg = 52  <- Winner (Slower but much cleaner)
        // Car: 4hr * 10 = 40 + 40kg = 80

        let bestScore = Infinity; // We are minimizing "Cost/Penalty"
        let recommendedModeId = null;

        estimates.forEach(est => {
            // Ensure values aren't zero to avoid weird math, though addition is safe.
            const t = est.duration;
            const e = est.emissions;

            // Heuristic formulation: Cost of Time vs Cost of Emissions
            // Let's say 1 hour of time is 'worth' roughly 10 kg of CO2 in terms of "badness" for this specific eco-conscious profile.
            // This is tunable.

            const penaltyScore = (t * 20) + (e * 1);

            if (penaltyScore < bestScore) {
                bestScore = penaltyScore;
                recommendedModeId = est.mode;
            }
        });

        // Add "recommended" flag
        estimates.forEach(est => {
            est.isRecommended = (est.mode === recommendedModeId);
        });

        res.json({
            origin: start,
            destination: end,
            distanceKm: Math.round(distance),
            estimates: estimates,
            meta: {
                timestamp: new Date().toISOString()
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error calculating route estimates' });
    }
});

module.exports = router;
