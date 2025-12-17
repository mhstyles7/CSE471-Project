import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Heatmap.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Map as MapIcon,
    Calendar,
    Shield,
    Leaf,
    Smile,
    CloudSun,
    Newspaper,
    Navigation,
    TrendingUp
} from 'lucide-react';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// --- Mock Data ---

// --- Constants removed, data will be fetched from API ---

// --- Components ---

function MapController({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom, { duration: 1.5 });
        }
    }, [center, zoom, map]);
    return null;
}

function AIInsight({ district }) {
    const insights = useMemo(() => {
        const safe = district.risk === 'Low' || district.risk === 'Medium';
        return {
            message: safe
                ? `AI Analysis: It is a great time to visit ${district.name}. Weather is favorable and risk levels are manageable.`
                : `AI Analysis: Exercise caution when visiting ${district.name} due to current conditions.`,
            score: safe ? 92 : 65
        };
    }, [district]);

    return (
        <div className="ai-insight">
            <div className="ai-header">
                <Smile size={20} />
                <h4 className="ai-title">AI Travel Insight</h4>
            </div>
            <p className="ai-message">{insights.message}</p>
            <div className="ai-score">
                <span className="score-label">Confidence Score</span>
                <span className="score-value">{insights.score}%</span>
            </div>
        </div>
    );
}

function DistrictPanel({ district, onClose }) {
    if (!district) return null;

    return (
        <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="district-panel"
        >
            <button onClick={onClose} className="close-btn">✕</button>

            <h2 className="panel-title">{district.name}</h2>
            <p className="panel-desc">{district.description}</p>

            <AIInsight district={district} />

            <div className="stats-grid">
                <div className="stat-box risk">
                    <Shield className="stat-icon" />
                    <div className="stat-label">Risk</div>
                    <div className="stat-value">{district.risk}</div>
                </div>
                <div className="stat-box eco">
                    <Leaf className="stat-icon" />
                    <div className="stat-label">Eco</div>
                    <div className="stat-value">{district.eco}</div>
                </div>
                <div className="stat-box comfort">
                    <Smile className="stat-icon" />
                    <div className="stat-label">Comfort</div>
                    <div className="stat-value">{district.comfort}</div>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="section-title">
                    <CloudSun size={16} /> Live Weather
                </h3>
                <div className="weather-box">
                    <span className="weather-temp">{district.weather.temp}</span>
                    <span>{district.weather.condition}</span>
                </div>
            </div>

            <div>
                <h3 className="section-title">
                    <Newspaper size={16} /> Local Updates
                </h3>
                <ul className="news-list">
                    {district.news.map((item, i) => (
                        <li key={i} className="news-item">
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-6">
                <h3 className="section-title">
                    <MapIcon size={16} /> Key Landmarks
                </h3>
                <div className="landmarks-list">
                    {district.landmarks.map((l, i) => (
                        <span key={i} className="landmark-tag">
                            {l.name}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}


function Timeline({ trips, onSelectTrip, selectedTripId, districts }) {
    return (
        <div className="timeline-container">
            <h3 className="timeline-title">
                <TrendingUp size={16} /> Travel Timeline
            </h3>
            <div className="timeline-items">
                {trips.map((trip, index) => {
                    const fromName = districts[trip.from]?.name || trip.from;
                    const toName = districts[trip.to]?.name || trip.to;
                    return (
                        <button
                            key={trip.id}
                            onClick={() => onSelectTrip(trip)}
                            className={`trip-card ${selectedTripId === trip.id ? 'selected' : ''}`}
                        >
                            <div className="trip-date">
                                <Calendar size={12} />
                                {trip.date}
                            </div>
                            <div className="trip-route">
                                {fromName} → {toName}
                            </div>
                            <div className="trip-stats">
                                <span className={`trip-badge ${trip.risk > 5 ? 'badge-risk-high' : 'badge-risk-low'}`}>
                                    Risk: {trip.risk}/10
                                </span>
                                <span className="trip-badge badge-comfort">
                                    Comfort: {trip.comfort}/10
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function Heatmap() {
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [mapCenter, setMapCenter] = useState([23.6850, 90.3563]); // Bangladesh center
    const [mapZoom, setMapZoom] = useState(7);

    // Dynamic Data States
    const [districts, setDistricts] = useState({});
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch Destinations (Districts)
                const distRes = await fetch('http://localhost:1306/api/destinations');
                const distData = await distRes.json();

                // Transform array to object keyed by slug
                const distMap = {};
                distData.forEach(d => {
                    if (d.slug) distMap[d.slug] = d;
                });
                setDistricts(distMap);

                // Fetch Routes (Trips)
                const routeRes = await fetch('http://localhost:1306/api/routes');
                const routeData = await routeRes.json();
                setTrips(routeData);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching map data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDistrictClick = (key) => {
        const district = districts[key];
        if (!district) return;

        setSelectedDistrict(district);
        // Ensure coords are valid before flying
        if (district.coordinates && district.coordinates.lat && district.coordinates.lng) {
            setMapCenter([district.coordinates.lat, district.coordinates.lng]);
            setMapZoom(10);
        }
        setSelectedTrip(null);
    };

    const handleTripSelect = (trip) => {
        setSelectedTrip(trip);
        setSelectedDistrict(null);

        const fromDist = districts[trip.from];
        const toDist = districts[trip.to];

        if (fromDist && toDist) {
            const from = [fromDist.coordinates.lat, fromDist.coordinates.lng];
            const to = [toDist.coordinates.lat, toDist.coordinates.lng];
            const centerLat = (from[0] + to[0]) / 2;
            const centerLng = (from[1] + to[1]) / 2;
            setMapCenter([centerLat, centerLng]);
            setMapZoom(8);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading Map Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="heatmap-container">
            <Timeline
                trips={trips}
                onSelectTrip={handleTripSelect}
                selectedTripId={selectedTrip?.id}
                districts={districts}
            />

            <MapContainer
                center={[23.6850, 90.3563]}
                zoom={7}
                className="map-view"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController center={mapCenter} zoom={mapZoom} />

                {/* District Markers */}
                {Object.entries(districts).map(([key, district]) => (
                    district.coordinates && (
                        <Marker
                            key={key}
                            position={[district.coordinates.lat, district.coordinates.lng]}
                            eventHandlers={{
                                click: () => handleDistrictClick(key),
                            }}
                        >
                            <Popup>
                                <div style={{ textAlign: 'center' }}>
                                    <h3 style={{ fontWeight: 'bold', margin: '0' }}>{district.name}</h3>
                                    <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>Click for details</p>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}

                {/* Trip Paths */}
                {trips.map((trip) => (
                    <Polyline
                        key={trip.id}
                        positions={trip.path}
                        pathOptions={{
                            color: selectedTrip?.id === trip.id ? '#3b82f6' : '#94a3b8',
                            weight: selectedTrip?.id === trip.id ? 5 : 3,
                            opacity: selectedTrip?.id === trip.id ? 1 : 0.6,
                            dashArray: selectedTrip?.id === trip.id ? null : '5, 10'
                        }}
                    />
                ))}

            </MapContainer>

            {/* Overlays */}
            <div className="header-overlay">
                <div className="header-content">
                    <h1 className="header-title">
                        <Navigation size={20} color="#2563eb" />
                        Travel Explorer
                    </h1>
                    <p className="header-subtitle">Interactive Journey Map</p>
                </div>
            </div>

            <AnimatePresence>
                {selectedDistrict && (
                    <DistrictPanel
                        district={selectedDistrict}
                        onClose={() => {
                            setSelectedDistrict(null);
                            setMapZoom(7);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
