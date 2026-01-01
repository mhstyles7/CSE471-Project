// ============================================
// AI TRAVEL SERVICE (Dedicated Map Features)
// Uses Official Google Generative AI SDK
// ============================================

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = 'AIzaSyA0XUQG0gzhju4JeFGys4evTD0j66gXb24';

// Initialize the API Client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Use Gemini 2.5 Flash (Standard)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Client-side cache to prevent quota drain
const insightCache = new Map();

// Helper to get/set localStorage cache
const CACHE_KEY = 'ai_insights_cache';
const getStoredCache = () => {
    try {
        const stored = localStorage.getItem(CACHE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        return {};
    }
};
const setStoredCache = (key, data) => {
    try {
        const cache = getStoredCache();
        cache[key] = { data, timestamp: Date.now() };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.warn('Failed to save to localStorage');
    }
};

export const getCachedInsight = (districtName) => {
    // Check memory
    if (insightCache.has(districtName)) return insightCache.get(districtName);

    // Check localStorage
    const storedCache = getStoredCache();
    if (storedCache[districtName]) {
        const data = storedCache[districtName].data;
        insightCache.set(districtName, data); // Hydrate memory
        return data;
    }
    return null;
};

// Export raw cache for bulk UI updates (e.g. Timeline)
export const getAllCachedInsights = () => {
    const stored = getStoredCache();
    // Simplify structure: { "Dhaka": { data... }, ... } -> { "Dhaka": data ... }
    const result = {};
    Object.keys(stored).forEach(key => {
        result[key] = stored[key].data;
    });
    return result;
};

const getMockData = (district) => {
    const isSafe = (district.risk_level || district.risk || "Low") === "Low";
    const temp = Math.floor(Math.random() * (32 - 24) + 24);
    return {
        assessment: isSafe
            ? `AI (Offline Mode): ${district.name} maintains a high safety rating. Perfect for visitation now.`
            : `AI (Offline Mode): Exercise increased caution in ${district.name} due to regional alerts.`,
        score: isSafe ? 92 : 65,
        riskLevel: district.risk || "Low",
        ecoScore: district.eco || "Good",
        comfortLevel: district.comfort || "High",
        weather: { temp: `${temp}°C`, condition: isSafe ? "Sunny" : "Cloudy" },
        news: [`Local tourism in ${district.name} is operating normally.`, "Annual cultural festival dates announced."],
        landmarks: [{ name: `${district.name} Museum` }, { name: "Central Park" }, { name: "Old Town Market" }]
    };
};

export const getAIInsights = async (district, forceRefresh = false) => {
    if (!district) return { message: "Analysis unavailable.", score: 50 };

    if (!forceRefresh) {
        const cached = getCachedInsight(district.name);
        if (cached) return cached;
    }

    const prompt = `Analyze the travel suitability of ${district.name} for right now (Real-time).
    Provide a structured JSON response with the following keys:
    - assessment: Short 2-sentence safe travel advice.
    - riskLevel: "Low", "Medium", or "High" (based on real safety).
    - ecoScore: "Excellent", "Good", "Moderate", or "Low".
    - comfortLevel: "High", "Medium", or "Low".
    - score: Integer 0-100 (Safety confidence).
    - weather: { "temp": "12°C", "condition": "Partly Cloudy" } (Use Google Search to find current weather).
    - news: Array of 2 short "situation updates" or specific local alerts.
    - landmarks: Array of 3 objects { "name": "Name" } of top places to visit there.

    RETURN ONLY JSON. No markdown formatting.`;

    try {


        // 2. Updated Call: Use 'googleSearch' instead of 'googleSearchRetrieval'
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            tools: [
                {
                    googleSearch: {},
                },
            ],
        });

        const response = await result.response;
        const text = response.text();

        let data;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            data = JSON.parse(jsonMatch[0]);

            // Format check for news
            if (Array.isArray(data.news)) {
                data.news = data.news.map(item =>
                    (typeof item === 'object' && item !== null) ? (item.headline || JSON.stringify(item)) : String(item)
                );
            }
        } else {
            throw new Error("Failed to parse JSON");
        }

        insightCache.set(district.name, data);
        setStoredCache(district.name, data);
        return data;

    } catch (error) {
        console.warn("AI Insight Error:", error);
        return getMockData(district);
    }
};

export const getTrendAnalysis = async (ignoredDistricts = [], forceRefresh = false) => {
    // Global Trend Mode: We ignore input districts and find the ACTUAL trending places in BD.
    const cacheKey = `trends-global-bangladesh-v1`;

    if (!forceRefresh) {
        const cached = getCachedInsight(cacheKey);
        if (cached) return cached;
    }

    const prompt = `Identify the top 3 currently trending travel destinations in Bangladesh RIGHT NOW based on real-time news, weather, and social media buzz.
    Focus on specific places (e.g., "Sajek Valley", "Cox's Bazar", "Saint Martin's Island", "Tanguar Haor").
    Use Google Search to find what is popular this week.

    For EACH place, provide a short 1-sentence insight explaining the specific reason (e.g., "Camping season peak", "Music festival", "Clear water season").

    Return ONLY a JSON array of objects:
    [
      { "district": "Place Name", "message": "Reason..." },
      ...
    ]`;

    try {

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            tools: [{ googleSearch: {} }],
        });

        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);

        let data = [];
        if (jsonMatch) {
            data = JSON.parse(jsonMatch[0]);
            // Add a rank property if missing
            data = data.map((d, i) => ({ ...d, rank: i + 1 }));
        } else {
            data = [
                { district: "Cox's Bazar", message: "Always popular for beach activities." },
                { district: "Sajek Valley", message: "Trending for cloud tourism." },
                { district: "Sylhet", message: "Popular for tea gardens and swamps." }
            ];
        }

        // Cache the result
        insightCache.set(cacheKey, data);
        setStoredCache(cacheKey, data);
        return data;

    } catch (error) {
        console.warn("Trend Analysis Error:", error);
        return [
            { district: "Bangladesh", message: "Unable to fetch live trends. Exploring popular spots is recommended." }
        ];
    }
};

export const getAIRecommendations = async (districts) => {
    if (!districts) return [];
    const districtList = Object.values(districts).map(d => d.name).join(', ');
    const prompt = `From this list: ${districtList}. 
  Recommend 3 best districts for a balanced trip. 
  Return ONLY a JSON array of their names, e.g., ["Dhaka", "Sylhet"].`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Failed to parse JSON");
    } catch (error) {
        console.warn("Recommendation Error:", error);
        return ["Cox's Bazar", "Sylhet", "Chittagong"];
    }
};


export const getCoordinates = async (placeName) => {
    const lowerName = placeName.toLowerCase();

    // Hardcoded Fallbacks for Stability
    if (lowerName.includes('dhaka')) return { lat: 23.8103, lng: 90.4125 };
    if (lowerName.includes('sajek valley')) return { lat: 23.3819, lng: 92.2938 };
    if (lowerName.includes("cox's bazar")) return { lat: 21.4272, lng: 91.9858 };
    if (lowerName.includes('sylhet')) return { lat: 24.8949, lng: 91.8687 };
    if (lowerName.includes('chittagong') || lowerName.includes('chatta')) return { lat: 22.3569, lng: 91.7832 };

    const prompt = `What are the latitude and longitude of "${placeName}, Bangladesh"? Return ONLY a JSON object: { "lat": 23.8103, "lng": 90.4125 }.`;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        return null;
    } catch (e) {
        console.warn("AI Coordinate Fetch Error:", e);
        return null; // InteractiveMap will handle null
    }
};

export const getRouteRecommendation = async (origin, destination, estimates) => {
    const prompt = `
    I am planning a trip from ${origin.label} to ${destination.label}.
    Here are the available transport options:
    ${JSON.stringify(estimates.map(e => ({ mode: e.name, cost: e.cost, time: e.duration, co2: e.emissions })))}

    Acting as a Travel Expert AI, verify which option is the "Best Value" considering Cost, Time, and Eco-friendliness.
    Return a JSON object:
    {
        "recommendedMode": "Bus" (or "Train", "Flight", etc. matching the input names),
        "reason": "Short 1-sentence explanation why."
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Failed to parse JSON");
    } catch (error) {
        console.warn("AI Route Rec Error:", error);
        return null;
    }
};
