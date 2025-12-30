<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { getTrendAnalysis } from "../../services/travelAIService";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Heatmap.css";
import L from "leaflet";
import { Navigation, TrendingUp, Map } from "lucide-react";
=======
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
>>>>>>> origin/Tashu

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
<<<<<<< HEAD
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function Heatmap() {
  const [mapCenter, setMapCenter] = useState([23.685, 90.3563]); // Bangladesh center
  const [mapZoom, setMapZoom] = useState(7);

  // Dynamic Data States
  const [districts, setDistricts] = useState({});
  const [loading, setLoading] = useState(true);

  // Filter States
  const [timeFilter, setTimeFilter] = useState("month"); // week, month, year
  const [typeFilter, setTypeFilter] = useState("all"); // all, trips, posts

  // Heatmap Data
  const [heatmapData, setHeatmapData] = useState({});
  const [insights, setInsights] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Destinations (Districts)
        const distRes = await fetch("http://localhost:5000/api/destinations");
        const distData = await distRes.json();
        const distMap = {};
        distData.forEach((d) => {
          if (d.slug) distMap[d.slug] = d;
        });
        setDistricts(distMap);

        // 2. Fetch Heatmap Analytics
        const heatRes = await fetch(
          `http://localhost:5000/api/heatmap?period=${timeFilter}&type=${typeFilter}`
        );
        const heatData = await heatRes.json();
        setHeatmapData(heatData.heatmap || {});
        // setInsights(heatData.insights || []); // SKIP STATIC BACKEND DATA

        setLoading(false);

        // 3. Generate AI Trends (Client-Side)
        setLoadingAI(true);
        const rawScores = heatData.rawScores || {};
        const topDistricts = Object.entries(rawScores)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([slug, score], idx) => ({
            district: slug,
            score,
            rank: idx + 1,
          }));

        if (topDistricts.length > 0) {
          const aiTrends = await getTrendAnalysis(topDistricts);
          const finalInsights = topDistricts.map((d) => {
            const ai = aiTrends.find(
              (t) => t.district.toLowerCase() === d.district.toLowerCase()
            );
            return {
              ...d,
              message: ai ? ai.message : "Trending now.",
            };
          });
          setInsights(finalInsights);
        } else {
          setInsights([]);
        }
        setLoadingAI(false);
      } catch (error) {
        console.error("Error fetching heatmap data:", error);
        setLoading(false);
        setLoadingAI(false);
      }
    };

    fetchData();

    // Auto-refresh interval
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [timeFilter, typeFilter]);

  // Helper to get color based on score
  const getHeatColor = (score) => {
    if (score >= 80) return "#ef4444"; // Red
    if (score >= 50) return "#eab308"; // Yellow
    return "#22c55e"; // Green
  };

  // Helper to get radius based on score
  const getHeatRadius = (score) => {
    // Base 10, max 30
    return 10 + (score / 100) * 20;
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100%",
          backgroundColor: "#f8fafc",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              border: "4px solid #3b82f6",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          ></div>
          <p style={{ color: "#475569", fontWeight: "500" }}>
            Loading Activity Data...
          </p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: "sans-serif",
        backgroundColor: "#f8fafc",
      }}
    >
      {/* Top Bar: Filters */}
      <div
        style={{
          backgroundColor: "white",
          padding: "16px 24px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: 0,
            }}
          >
            <Navigation size={20} color="#2563eb" />
            Community Activity Heatmap
          </h1>
          <p
            style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0" }}
          >
            Visualize trending locations based on user activity.
          </p>
        </div>

        <div style={{ display: "flex", gap: "32px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "#94a3b8",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Time Period
            </label>
            <div
              style={{
                display: "flex",
                backgroundColor: "#f1f5f9",
                borderRadius: "8px",
                padding: "4px",
                gap: "4px",
              }}
            >
              {["week", "month", "year"].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeFilter(period)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor:
                      timeFilter === period ? "white" : "transparent",
                    color: timeFilter === period ? "#2563eb" : "#64748b",
                    boxShadow:
                      timeFilter === period
                        ? "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                        : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "#94a3b8",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Activity Type
            </label>
            <div
              style={{
                display: "flex",
                backgroundColor: "#f1f5f9",
                borderRadius: "8px",
                padding: "4px",
                gap: "4px",
              }}
            >
              {["all", "trips", "posts"].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor:
                      typeFilter === type ? "white" : "transparent",
                    color: typeFilter === type ? "#059669" : "#64748b",
                    boxShadow:
                      typeFilter === type
                        ? "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                        : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Map Area */}
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          display: "flex",
        }}
      >
        <MapContainer
          center={[23.685, 90.3563]}
          zoom={7}
          style={{ flex: 1, width: "100%", height: "100%", zIndex: 0 }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController center={mapCenter} zoom={mapZoom} />

          {/* Heatmap Circles */}
          {Object.entries(districts).map(([key, district]) => {
            const score = heatmapData[key] || 0;
            if (!district.coordinates || score === 0) return null;

            return (
              <CircleMarker
                key={`heat-${key}`}
                center={[district.coordinates.lat, district.coordinates.lng]}
                radius={getHeatRadius(score)}
                pathOptions={{
                  color: getHeatColor(score),
                  fillColor: getHeatColor(score),
                  fillOpacity: 0.4,
                  weight: 1,
                }}
              >
                <Popup>
                  <div style={{ textAlign: "center" }}>
                    <strong style={{ display: "block", fontSize: "18px" }}>
                      {district.name}
                    </strong>
                    <span
                      style={{ color: getHeatColor(score), fontWeight: "bold" }}
                    >
                      Activity:{" "}
                      {score > 80 ? "High" : score > 50 ? "Medium" : "Low"}
                    </span>
                    <br />
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      Score: {score}/100
                    </span>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Regular Markers for basic context */}
          {Object.entries(districts).map(
            ([key, district]) =>
              district.coordinates && (
                <Marker
                  key={key}
                  position={[
                    district.coordinates.lat,
                    district.coordinates.lng,
                  ]}
                  opacity={0.5}
                ></Marker>
              )
          )}
        </MapContainer>
      </div>

      {/* Bottom Bar: AI Trends */}
      <div
        style={{
          backgroundColor: "white",
          borderTop: "1px solid #e2e8f0",
          padding: "16px",
          zIndex: 20,
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
              color: "#4338ca",
            }}
          >
            <TrendingUp size={20} />
            <h3 style={{ fontWeight: "bold", fontSize: "16px", margin: 0 }}>
              AI Trends & Insights
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
            }}
          >
            {insights.length > 0 ? (
              insights.map((insight, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#eef2ff",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid #e0e7ff",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "white",
                      padding: "8px",
                      borderRadius: "9999px",
                      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                      color: "#4f46e5",
                      fontWeight: "bold",
                      fontSize: "12px",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    #{insight.rank}
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "bold",
                          color: "#312e81",
                          textTransform: "capitalize",
                          fontSize: "14px",
                        }}
                      >
                        {insight.district}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#4338ca",
                        lineHeight: "1.4",
                        margin: 0,
                      }}
                    >
                      {insight.message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "16px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px dashed #cbd5e1",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    fontStyle: "italic",
                    margin: 0,
                  }}
                >
                  {loadingAI
                    ? "Consulting AI for market trends..."
                    : "Gathering sufficient live data to generate insights..."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
=======
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
>>>>>>> origin/Tashu
}
