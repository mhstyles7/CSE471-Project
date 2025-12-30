import React, { useState, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Heatmap.css";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map as MapIcon,
  MapPin,
  Calendar,
  Shield,
  Leaf,
  Smile,
  CloudSun,
  Newspaper,
  Navigation,
  Globe,
  Sparkles,
  Scale,
  X,
  Check,
} from "lucide-react";
import {
  getAIInsights,
  getAIRecommendations,
  getCoordinates,
} from "../../services/travelAIService";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Custom Icons
const customIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="
    background-color: #3b82f6; 
    width: 24px; 
    height: 24px; 
    border-radius: 50%; 
    border: 3px solid white; 
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <div style="background-color: white; width: 8px; height: 8px; border-radius: 50%;"></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const discoveryIcon = L.divIcon({
  className: "custom-marker-discovery",
  html: `<div style="
    background-color: #10b981; 
    width: 20px; 
    height: 20px; 
    border-radius: 50%; 
    border: 2px solid white; 
    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
  ">
    <div style="background-color: white; width: 6px; height: 6px; border-radius: 50%;"></div>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
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

function AIInsight({ district }) {
  const [insight, setInsight] = useState(null);

  useEffect(() => {
    let active = true;
    if (district) {
      setInsight(null); // Reset
      getAIInsights(district).then((data) => {
        if (active) setInsight(data);
      });
    }
    return () => {
      active = false;
    };
  }, [district]);

  if (!insight) {
    return (
      <div
        style={{
          padding: "16px",
          marginBottom: "12px",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          background: "#f8fafc",
        }}
      >
        <div style={{ fontSize: "12px", color: "#64748b" }}>
          Generating AI Travel Assessment...
        </div>
      </div>
    );
  }

  const assessmentText =
    insight.assessment || insight.message || "Assessment unavailable.";

  return (
    <div
      className="ai-insight"
      style={{
        padding: "16px",
        background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
        borderRadius: "12px",
        marginBottom: "16px",
        boxShadow: "0 4px 6px -1px rgba(109, 40, 217, 0.2)",
        color: "white",
      }}
    >
      <div
        className="ai-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          paddingBottom: "8px",
        }}
      >
        <Sparkles size={18} color="#fbbf24" style={{ fill: "#fbbf24" }} />
        <h4
          className="ai-title"
          style={{
            margin: 0,
            fontWeight: "bold",
            fontSize: "14px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          AI Travel Assessment
        </h4>
      </div>
      <p
        className="ai-message"
        style={{
          fontSize: "14px",
          lineHeight: "1.5",
          marginBottom: "12px",
          opacity: 0.95,
        }}
      >
        {assessmentText}
      </p>
      <div
        className="ai-score"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
          fontWeight: "600",
          background: "rgba(255,255,255,0.1)",
          padding: "6px 12px",
          borderRadius: "20px",
        }}
      >
        <span className="score-label" style={{ opacity: 0.8 }}>
          SAFETY CONFIDENCE
        </span>
        <span
          className="score-value"
          style={{ fontSize: "14px", color: "#fbbf24" }}
        >
          {insight.score}%
        </span>
      </div>
    </div>
  );
}

function DistrictPanel({ district, onClose, onAddToCompare }) {
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    console.log("[DistrictPanel] Fetching AI insights for", district.name);

    getAIInsights(district)
      .then((data) => {
        if (mounted) {
          console.log("[DistrictPanel] Received data:", data);
          setAiData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("[DistrictPanel] AI fetch failed:", err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [district]);

  // Fail-safe data merging
  const safeData = {
    riskLevel: aiData?.riskLevel || district.risk || "Unknown",
    ecoScore: aiData?.ecoScore || district.eco || "N/A",
    comfortLevel: aiData?.comfortLevel || district.comfort || "N/A",
    weather: {
      temp: aiData?.weather?.temp || district.weather?.temp || "--",
      condition:
        aiData?.weather?.condition || district.weather?.condition || "",
    },
    news: aiData?.news || district.news || [],
    landmarks: aiData?.landmarks || district.landmarks || [],
  };

  const riskColor =
    safeData.riskLevel === "High"
      ? "#fee2e2"
      : safeData.riskLevel === "Medium"
      ? "#fef3c7"
      : "#f0fdf4";
  const riskTextColor =
    safeData.riskLevel === "High"
      ? "#991b1b"
      : safeData.riskLevel === "Medium"
      ? "#92400e"
      : "#166534";

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "400px",
        height: "100%",
        backgroundColor: "white",
        boxShadow: "-4px 0 15px rgba(0,0,0,0.1)",
        zIndex: 50,
        padding: "24px",
        overflowY: "auto",
        borderLeft: "1px solid #e2e8f0",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px",
          borderRadius: "50%",
          backgroundColor: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={20} color="#64748b" />
      </button>

      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "#0f172a",
            marginBottom: "8px",
            letterSpacing: "-0.02em",
          }}
        >
          {district.name}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MapPin size={16} color="#64748b" />
          <span style={{ color: "#64748b", fontSize: "14px" }}>
            {district.coordinates.lat.toFixed(4)},{" "}
            {district.coordinates.lng.toFixed(4)}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <button
          onClick={() => onAddToCompare(district)}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)",
          }}
          disabled={loading}
        >
          {loading ? (
            "AI Analyzing..."
          ) : (
            <>
              <Scale size={16} /> Compare {district.name}
            </>
          )}
        </button>
      </div>

      <div className="mb-6" style={{ marginBottom: "24px" }}>
        <AIInsight district={district} />
      </div>

      {/* 4.4 Risk/Eco/Comfort Analysis */}
      <div
        className="stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
          marginBottom: "24px",
        }}
      >
        <div
          className="stat-box risk"
          style={{
            padding: "12px 8px",
            borderRadius: "8px",
            backgroundColor: riskColor,
            textAlign: "center",
            border: `1px solid ${riskColor}`,
          }}
        >
          <Shield
            className="stat-icon"
            size={18}
            color={riskTextColor}
            style={{ margin: "0 auto 6px" }}
          />
          <div
            className="stat-label"
            style={{
              fontSize: "10px",
              color: riskTextColor,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Risk Level
          </div>
          <div
            className="stat-value"
            style={{
              fontWeight: "bold",
              color: riskTextColor,
              fontSize: "13px",
            }}
          >
            {safeData.riskLevel}
          </div>
        </div>
        <div
          className="stat-box eco"
          style={{
            padding: "12px 8px",
            borderRadius: "8px",
            backgroundColor: "#f0fdf4",
            textAlign: "center",
            border: "1px solid #dcfce7",
          }}
        >
          <Leaf
            className="stat-icon"
            size={18}
            color="#22c55e"
            style={{ margin: "0 auto 6px" }}
          />
          <div
            className="stat-label"
            style={{
              fontSize: "10px",
              color: "#166534",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Eco Score
          </div>
          <div
            className="stat-value"
            style={{ fontWeight: "bold", color: "#14532d", fontSize: "13px" }}
          >
            {safeData.ecoScore}
          </div>
        </div>
        <div
          className="stat-box comfort"
          style={{
            padding: "12px 8px",
            borderRadius: "8px",
            backgroundColor: "#fff7ed",
            textAlign: "center",
            border: "1px solid #ffedd5",
          }}
        >
          <Smile
            className="stat-icon"
            size={18}
            color="#f97316"
            style={{ margin: "0 auto 6px" }}
          />
          <div
            className="stat-label"
            style={{
              fontSize: "10px",
              color: "#9a3412",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Comfort
          </div>
          <div
            className="stat-value"
            style={{ fontWeight: "bold", color: "#7c2d12", fontSize: "13px" }}
          >
            {safeData.comfortLevel}
          </div>
        </div>
      </div>

      {/* 4.5 Live Weather (AI Guess) */}
      <div className="mb-6" style={{ marginBottom: "24px" }}>
        <h3
          className="section-title"
          style={{
            fontWeight: "bold",
            color: "#334155",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
          }}
        >
          <CloudSun size={18} /> Live Weather Forecast (AI)
        </h3>
        <div
          className="weather-box"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px",
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{ fontSize: "24px", fontWeight: "bold", color: "#0ea5e9" }}
            >
              {safeData.weather.temp}
            </span>
            <span style={{ fontSize: "14px", color: "#64748b" }}>
              {safeData.weather.condition}
            </span>
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>Updated now</div>
        </div>
      </div>

      {/* 4.5 Local News */}
      <div>
        <h3
          className="section-title"
          style={{
            fontWeight: "bold",
            color: "#334155",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
          }}
        >
          <Newspaper size={18} /> Situation Updates
        </h3>
        <ul className="news-list" style={{ listStyle: "none", padding: 0 }}>
          {safeData.news && safeData.news.length > 0 ? (
            safeData.news.map((item, i) => (
              <li
                key={i}
                className="news-item"
                style={{
                  fontSize: "13px",
                  color: "#475569",
                  marginBottom: "10px",
                  paddingLeft: "12px",
                  borderLeft: "3px solid #cbd5e1",
                  lineHeight: "1.4",
                }}
              >
                {item}
              </li>
            ))
          ) : (
            <li
              style={{
                fontSize: "13px",
                color: "#94a3b8",
                fontStyle: "italic",
              }}
            >
              No specific updates available.
            </li>
          )}
        </ul>
      </div>

      {/* 4.2 Key Landmarks */}
      <div className="mt-6" style={{ marginTop: "24px" }}>
        <h3
          className="section-title"
          style={{
            fontWeight: "bold",
            color: "#334155",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
          }}
        >
          <MapIcon size={18} /> Explore Landmarks (AI)
        </h3>
        <div
          className="landmarks-list"
          style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
        >
          {loading ? (
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              Finding places...
            </span>
          ) : (
            safeData.landmarks.map((l, i) => (
              <span
                key={i}
                className="landmark-tag"
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#f1f5f9",
                  borderRadius: "16px",
                  fontSize: "12px",
                  color: "#475569",
                  border: "1px solid #e2e8f0",
                }}
              >
                {l.name || l}
              </span>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

// 4.7 Comparison Modal
function ComparisonModal({ items, onClose, onRemove }) {
  if (items.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        zIndex: 3000,
        width: "90%",
        maxWidth: "600px",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            fontWeight: "bold",
            color: "#1e293b",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Scale size={20} className="text-blue-600" /> District Comparison
        </h3>
        <button
          onClick={onClose}
          style={{ border: "none", background: "none", cursor: "pointer" }}
        >
          <X size={20} color="#64748b" />
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${items.length}, 1fr)`,
          gap: "16px",
        }}
      >
        {items.map((district) => (
          <div
            key={district._id}
            style={{
              border: "1px solid #f1f5f9",
              borderRadius: "12px",
              padding: "16px",
              backgroundColor: "#f8fafc",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "12px",
              }}
            >
              <h4
                style={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  color: "#0f172a",
                }}
              >
                {district.name}
              </h4>
              <button
                onClick={() => onRemove(district._id)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#ef4444",
                }}
              >
                <X size={14} />
              </button>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "#64748b" }}>Risk:</span>
                <span
                  style={{
                    fontWeight: "600",
                    color: district.risk === "Low" ? "#166534" : "#991b1b",
                  }}
                >
                  {district.risk}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "#64748b" }}>Comfort:</span>
                <span style={{ fontWeight: "600", color: "#d97706" }}>
                  {district.comfort}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "#64748b" }}>Eco:</span>
                <span style={{ fontWeight: "600", color: "#059669" }}>
                  {district.eco}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "#64748b" }}>Temp:</span>
                <span style={{ fontWeight: "600", color: "#0ea5e9" }}>
                  {district.weather?.temp}
                </span>
              </div>
            </div>
          </div>
        ))}
        {items.length < 2 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px dashed #cbd5e1",
              borderRadius: "12px",
              color: "#94a3b8",
              fontSize: "13px",
              fontStyle: "italic",
            }}
          >
            Add another to compare
          </div>
        )}
      </div>
    </div>
  );
}

// 4.8 Recommendation Panel
function RecommendationPanel({ districts, onSelect, onClose }) {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAIRecommendations(districts).then((names) => {
      const matched = [];
      // Basic filtering if we want to ensure we have data objects
      names.forEach((name) => {
        const found = Object.values(districts).find(
          (d) => d.name.toLowerCase() === name.toLowerCase()
        );
        if (found) matched.push(found);
      });
      // If AI hallucinates unavailable districts, fallback to logic
      if (matched.length === 0) {
        const fallback = Object.values(districts)
          .filter(
            (d) =>
              (d.risk === "Low" || d.risk === "Medium") &&
              (d.comfort === "High" || d.comfort === "Medium")
          )
          .slice(0, 3);
        setRecs(fallback);
      } else {
        setRecs(matched);
      }
      setLoading(false);
    });
  }, [districts]);

  return (
    <div
      style={{
        position: "absolute",
        top: "80px",
        right: "20px",
        width: "300px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        zIndex: 2000,
        padding: "16px",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <h3
          style={{
            fontWeight: "bold",
            fontSize: "16px",
            color: "#4338ca",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Sparkles size={18} /> Top Picks For You
        </h3>
        <button
          onClick={onClose}
          style={{ border: "none", background: "none", cursor: "pointer" }}
        >
          <X size={16} color="#64748b" />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {loading ? (
          <p style={{ fontSize: "13px", color: "#64748b" }}>
            Asking AI for suggestions...
          </p>
        ) : (
          recs.map((place) => (
            <div
              key={place._id}
              onClick={() => onSelect(place.slug)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                backgroundColor: "#eff6ff",
                border: "1px solid #dbeafe",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontWeight: "600",
                    color: "#1e40af",
                    fontSize: "14px",
                  }}
                >
                  {place.name}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 6px",
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    borderRadius: "99px",
                  }}
                >
                  Recommended
                </span>
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#60a5fa",
                  margin: "4px 0 0 0",
                }}
              >
                Safe & Comfortable • {place.weather?.temp}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Timeline({ trips, onSelectTrip, selectedTripId, districts }) {
  return (
    <div
      className="timeline-container"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div
        className="timeline-header"
        style={{
          flexShrink: 0,
          backgroundColor: "white",
          padding: "24px 16px 12px 16px",
          borderBottom: "1px solid #f1f5f9",
          zIndex: 20,
        }}
      >
        <h3
          className="timeline-title"
          style={{
            fontSize: "15px",
            fontWeight: "bold",
            color: "#475569",
            textTransform: "uppercase",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            letterSpacing: "0.05em",
          }}
        >
          <Globe size={16} /> Exploration Timeline
        </h3>
      </div>

      <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
        {trips.length === 0 ? (
          <p
            style={{
              color: "#94a3b8",
              fontStyle: "italic",
              fontSize: "14px",
              textAlign: "center",
              marginTop: "40px",
            }}
          >
            No upcoming trips found.
          </p>
        ) : (
          <div
            className="timeline-items"
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {trips.map((trip) => {
              const fromName = districts[trip.from]?.name || trip.from;
              const toName = districts[trip.to]?.name || trip.to;
              return (
                <div
                  key={trip.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelectTrip(trip);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "16px",
                    backgroundColor:
                      selectedTripId === trip.id ? "#f0f9ff" : "white",
                    border:
                      selectedTripId === trip.id
                        ? "2px solid #3b82f6"
                        : "1px solid #e2e8f0",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* 4.3 Trip Sequences */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "4px",
                      height: "100%",
                      backgroundColor:
                        selectedTripId === trip.id ? "#3b82f6" : "transparent",
                    }}
                  ></div>

                  <div
                    className="trip-date"
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "8px",
                      fontWeight: "500",
                    }}
                  >
                    <Calendar size={14} />
                    {trip.date}
                  </div>
                  <div
                    className="trip-route"
                    style={{
                      fontWeight: "700",
                      color: "#0f172a",
                      fontSize: "15px",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {fromName}{" "}
                    <Navigation size={14} className="text-blue-500" /> {toName}
                  </div>
                  {/* 4.4 Trip Analysis */}
                  <div
                    className="trip-stats"
                    style={{ display: "flex", gap: "8px" }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        backgroundColor: trip.risk > 5 ? "#fef2f2" : "#f0fdf4",
                        color: trip.risk > 5 ? "#991b1b" : "#166534",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Shield size={10} /> Risk: {trip.risk}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        backgroundColor: "#fff7ed",
                        color: "#9a3412",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Smile size={10} /> Comfort: {trip.comfort}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InteractiveMap() {
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [mapCenter, setMapCenter] = useState([23.685, 90.3563]); // Bangladesh center
  const [mapZoom, setMapZoom] = useState(7);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // 4.7 Comparison State
  const [compareList, setCompareList] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  // 4.8 Recommendation State
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Dynamic Data States
  const [districts, setDistricts] = useState({});
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("[Map] Fetching initial data...");
        setLoading(true);
        // 1. Fetch Destinations (Districts)
        const distRes = await fetch("http://localhost:5000/api/destinations");
        const distData = await distRes.json();
        const distMap = {};
        distData.forEach((d) => {
          if (d.slug) distMap[d.slug] = d;
        });
        setDistricts(distMap);

        // 3. Fetch Routes (Trips)
        const routeRes = await fetch("http://localhost:5000/api/routes");
        const routeData = await routeRes.json();
        console.log(`[Map] Found ${routeData.length} trips.`);

        // 3a. Check for Missing Coordinates & Fetch Dynamically
        const missingSlugs = new Set();
        routeData.forEach((trip) => {
          if (!distMap[trip.from]) missingSlugs.add(trip.from);
          if (!distMap[trip.to]) missingSlugs.add(trip.to);
        });

        if (missingSlugs.size > 0) {
          console.log("[Map] Missing coordinates for:", [...missingSlugs]);
          // Import helper dynamically or assume it's imported at top.
          // Better to iterate and fetch.
          // Note: getCoordinates uses "Place Name" prompt. Slug might be "sajek-valley".
          // Convert slug to name for better AI prompt.
          const slugToName = (slug) =>
            slug
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");

          await Promise.all(
            [...missingSlugs].map(async (slug) => {
              try {
                const name = slugToName(slug);
                const coords = await getCoordinates(name); // From travelAIService
                if (coords) {
                  distMap[slug] = {
                    _id: `dynamic-${slug}`,
                    name: name,
                    slug: slug,
                    coordinates: coords,
                    risk: "Low", // Default fallback
                    eco: "Good",
                    comfort: "Medium",
                  };
                  console.log(
                    `[Map] Dynamically fetched coords for ${name}:`,
                    coords
                  );
                }
              } catch (e) {
                console.warn(`[Map] Failed to fetch coords for ${slug}`, e);
              }
            })
          );

          // Re-update districts state
          setDistricts({ ...distMap });
        }

        // 3b. Initial "Fast" Render - Straight Lines
        const initialTrips = routeData.map((trip) => {
          const fromDist = distMap[trip.from];
          const toDist = distMap[trip.to];
          let fallbackPath = [];
          if (fromDist?.coordinates && toDist?.coordinates) {
            fallbackPath = [
              [fromDist.coordinates.lat, fromDist.coordinates.lng],
              [toDist.coordinates.lat, toDist.coordinates.lng],
            ];
          }
          return { ...trip, path: fallbackPath };
        });

        console.log(
          "[Map] Setting initial trips (straight lines)",
          initialTrips
        );
        setTrips(initialTrips);
        setLoading(false); // <--- UNBLOCK UI HERE

        // 3b. Background "Slow" Update - OSRM Paths (Sequential to avoid 429 Rate Limit)
        const backgroundUpdate = async () => {
          console.log(
            "[Map] Starting background OSRM path updates (Sequential)..."
          );

          // We'll update state incrementally or in chunks if needed,
          // but for now, let's just mutate a local copy and update state periodically or at the end.
          // To see progress live, we can update state per successful fetch, but that causes re-renders.
          // Better: Fetch all sequentially, then update? Or batches.

          // Let's do strict sequential for stability
          const newTrips = [...initialTrips];

          for (let i = 0; i < newTrips.length; i++) {
            const trip = newTrips[i];
            const fromDist = distMap[trip.from];
            const toDist = distMap[trip.to];

            if (fromDist?.coordinates && toDist?.coordinates) {
              try {
                // 1. Check if we already have a complex path (more than 2 points)
                if (trip.path && trip.path.length > 2) continue;

                const startCoords = `${fromDist.coordinates.lng},${fromDist.coordinates.lat}`;
                const endCoords = `${toDist.coordinates.lng},${toDist.coordinates.lat}`;
                const url = `https://router.project-osrm.org/route/v1/driving/${startCoords};${endCoords}?overview=full&geometries=geojson`;

                // Request
                const osrmRes = await fetch(url);
                if (osrmRes.ok) {
                  const osrmData = await osrmRes.json();
                  if (osrmData.routes?.[0]?.geometry?.coordinates) {
                    const path = osrmData.routes[0].geometry.coordinates.map(
                      (c) => [c[1], c[0]]
                    );
                    newTrips[i] = { ...trip, path };
                    // Optional: Update state every X items to show progress?
                    // For now, let's update every 1 item to make it feel "active" even if slow
                    setTrips((prev) => {
                      const next = [...prev];
                      next[i] = { ...trip, path };
                      return next;
                    });
                  }
                }
                // Small delay to be nice to the API
                await new Promise((r) => setTimeout(r, 800));
              } catch (err) {
                console.warn(`[Map] OSRM fail for ${trip.id}`, err);
              }
            }
          }
          console.log("[Map] All background updates finished.");
        };

        backgroundUpdate();
      } catch (error) {
        console.error("[Map] Error fetching map data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Effect: Prioritize Selected Trip
  // Effect: Prioritize Selected Trip
  useEffect(() => {
    // If user selects a trip that is still a straight line, FORCE fetch it now.
    if (!selectedTrip) return;

    // Check if current trip in state has a real path
    const currentTripState = trips.find((t) => t.id === selectedTrip.id);
    if (
      currentTripState &&
      currentTripState.path &&
      currentTripState.path.length > 2
    ) {
      console.log(
        `[Map] Trip ${selectedTrip.id} already has detailed path. No fetch needed.`
      );
      return; // Already has detailed path
    }

    const controller = new AbortController();
    const loadSelectedPath = async () => {
      const fromDist = districts[selectedTrip.from];
      const toDist = districts[selectedTrip.to];
      if (!fromDist || !toDist) return;

      console.log(
        `[Map] Priority fetching for selected trip: ${selectedTrip.id}`
      );
      setIsOptimizing(true);
      console.log("[Map] isOptimizing set to TRUE");
      const startTime = Date.now();

      try {
        const startCoords = `${fromDist.coordinates.lng},${fromDist.coordinates.lat}`;
        const endCoords = `${toDist.coordinates.lng},${toDist.coordinates.lat}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${startCoords};${endCoords}?overview=full&geometries=geojson`;

        // 120s timeout
        const timeoutId = setTimeout(() => controller.abort(), 120000);

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        // Enforce minimum visibility time (e.g., 800ms)
        const elapsed = Date.now() - startTime;
        if (elapsed < 800) {
          await new Promise((resolve) => setTimeout(resolve, 800 - elapsed));
        }

        if (res.ok) {
          const data = await res.json();
          if (data.routes?.[0]?.geometry?.coordinates) {
            const path = data.routes[0].geometry.coordinates.map((c) => [
              c[1],
              c[0],
            ]);
            // Update global state immediately
            setTrips((prev) =>
              prev.map((t) => (t.id === selectedTrip.id ? { ...t, path } : t))
            );
          }
        }
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("[Map] Priority fetch aborted.");
        } else {
          console.error("[Map] Priority fetch failed", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsOptimizing(false);
          console.log("[Map] isOptimizing set to FALSE");
        }
      }
    };

    loadSelectedPath();

    return () => {
      console.log("[Map] Cleaning up selected trip effect");
      controller.abort();
      setIsOptimizing(false);
    };
  }, [selectedTrip, districts, trips]); // Re-run if selection changes or districts load, or trips array itself changes

  const handleDistrictClick = (key) => {
    const district = districts[key];
    if (!district) return;

    setSelectedDistrict(district);
    // Ensure coords are valid before flying
    if (district.coordinates?.lat && district.coordinates?.lng) {
      setMapCenter([district.coordinates.lat, district.coordinates.lng]);
      setMapZoom(10);
    }
    setSelectedTrip(null);
  };

  const handleTripSelect = (trip) => {
    console.log("Selected trip:", trip);
    setSelectedTrip(trip);
    setSelectedDistrict(null);

    const fromDist = districts[trip.from];
    const toDist = districts[trip.to];

    if (fromDist && toDist) {
      const from = [fromDist.coordinates.lat, fromDist.coordinates.lng];
      const to = [toDist.coordinates.lat, toDist.coordinates.lng];
      const centerLat = (from[0] + to[0]) / 2;
      const centerLng = (from[1] + to[1]) / 2;
      console.log("Centering map to:", centerLat, centerLng);
      setMapCenter([centerLat, centerLng]);
      setMapZoom(9);
    } else {
      console.warn(
        "Cannot center map: missing district data for",
        trip.from,
        "or",
        trip.to
      );
    }
  };

  const handleAddToCompare = (district) => {
    if (compareList.find((d) => d._id === district._id)) return;
    if (compareList.length >= 2) {
      // Replace second one usually, or just alert? Let's just create a rolling list of 2
      setCompareList([compareList[1], district]);
    } else {
      setCompareList([...compareList, district]);
    }
    setShowComparison(true);
  };

  const removeFromCompare = (id) => {
    setCompareList(compareList.filter((d) => d._id !== id));
    if (compareList.length <= 1) setShowComparison(false); // Hide if empty
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
              border: "4px solid #059669",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          ></div>
          <p style={{ color: "#475569", fontWeight: "500" }}>
            Loading Travel Data...
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
      {/* Header */}
      <div
        style={{
          backgroundColor: "white",
          padding: "16px 32px",
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
              fontSize: "24px",
              fontWeight: "bold",
              color: "#0f172a",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              margin: 0,
            }}
          >
            <Globe size={24} color="#059669" />
            Interactive Travel Map
          </h1>
          <p
            style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}
          >
            Plan, Analyze, and Discover.
          </p>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          {selectedTrip && (
            <div
              style={{
                padding: "8px 16px",
                backgroundColor: "#e0f2fe",
                borderRadius: "8px",
                color: "#0369a1",
                fontSize: "13px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>
                Selected: {trips.find((t) => t.id === selectedTrip.id)?.from} →{" "}
                {trips.find((t) => t.id === selectedTrip.id)?.to}
              </span>
              <button
                onClick={() => {
                  setSelectedTrip(null);
                  setMapZoom(7);
                  setMapCenter([23.685, 90.3563]);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  color: "#0369a1",
                }}
                title="Clear Selection"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#bae6fd")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <X size={14} />
              </button>
            </div>
          )}
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              backgroundColor: showRecommendations ? "#4f46e5" : "#eef2ff",
              color: showRecommendations ? "white" : "#4f46e5",
              border: "none",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Sparkles size={18} />
            AI Recommendations
          </button>
          <div
            style={{
              padding: "8px 16px",
              backgroundColor: "#f0fdf4",
              borderRadius: "8px",
              color: "#166534",
              fontSize: "13px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
            }}
          >
            Active Journeys: {trips.length}
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
        {/* Timeline Sidebar (4.1, 4.3) */}
        <div
          style={{
            width: "340px",
            height: "100%",
            borderRight: "1px solid #e2e8f0",
            backgroundColor: "white",
            zIndex: 10,
          }}
        >
          <Timeline
            trips={trips}
            onSelectTrip={handleTripSelect}
            selectedTripId={selectedTrip?.id}
            districts={districts}
          />
        </div>

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

          {/* District Markers - DYNAMICALLY STYLED */}
          {Object.values(districts).map((dist) => {
            const isTripPoint = trips.some(
              (t) => t.from === dist.slug || t.to === dist.slug
            );

            return (
              <Marker
                key={dist._id}
                position={[dist.coordinates.lat, dist.coordinates.lng]}
                icon={isTripPoint ? customIcon : discoveryIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedDistrict(dist);
                    setMapZoom(10);
                  },
                }}
              >
                <Popup className="custom-popup">
                  <div style={{ textAlign: "center" }}>
                    <h3
                      style={{
                        margin: "0 0 4px 0",
                        color: isTripPoint ? "#0f172a" : "#059669",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      {dist.name}
                    </h3>
                    <div
                      style={{
                        fontSize: "11px",
                        color: isTripPoint ? "#3b82f6" : "#10b981",
                        marginBottom: "6px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      {isTripPoint ? "Journey Point" : "Discovery Location"}
                    </div>
                    {/* Minified details */}
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        justifyContent: "center",
                        fontSize: "10px",
                      }}
                    >
                      <span
                        style={{
                          padding: "2px 6px",
                          backgroundColor: "#f1f5f9",
                          borderRadius: "4px",
                        }}
                      >
                        Risk: {dist.risk || "Low"}
                      </span>
                      <span
                        style={{
                          padding: "2px 6px",
                          backgroundColor: "#f0fdf4",
                          borderRadius: "4px",
                        }}
                      >
                        Eco: {dist.eco || "Good"}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {selectedTrip && districts[selectedTrip.from] && (
            <Marker
              position={[
                districts[selectedTrip.from].coordinates.lat,
                districts[selectedTrip.from].coordinates.lng,
              ]}
              zIndexOffset={1000}
              icon={customIcon}
            >
              <Popup>
                <strong>Start: {districts[selectedTrip.from].name}</strong>
              </Popup>
            </Marker>
          )}
          {selectedTrip && districts[selectedTrip.to] && (
            <Marker
              position={[
                districts[selectedTrip.to].coordinates.lat,
                districts[selectedTrip.to].coordinates.lng,
              ]}
              zIndexOffset={1000}
              icon={customIcon}
            >
              <Popup>
                <strong>End: {districts[selectedTrip.to].name}</strong>
              </Popup>
            </Marker>
          )}

          {/* 4.1 Trip Paths - Background/Context */}
          {trips.map((trip) => (
            <Polyline
              key={`bg-${trip.id}`}
              positions={trip.path}
              pathOptions={{
                color: "#94a3b8",
                weight: 3,
                opacity: 0.3,
                dashArray: "5, 10",
              }}
            />
          ))}

          {/* Selected Trip - DEDICATED OVERLAY */}
          {selectedTrip &&
            (() => {
              // Find current version of trip to get updated path
              const activeTrip =
                trips.find((t) => t.id === selectedTrip.id) || selectedTrip;
              return (
                activeTrip.path && (
                  <Polyline
                    key={`selected-${activeTrip.id}`}
                    positions={activeTrip.path}
                    pathOptions={{
                      color: isOptimizing ? "#94a3b8" : "#2563eb",
                      weight: 8,
                      opacity: 1,
                      lineCap: "round",
                      lineJoin: "round",
                      dashArray: isOptimizing ? "15, 15" : null,
                    }}
                  />
                )
              );
            })()}
        </MapContainer>

        {/* Route Loading Popup */}
        {isOptimizing && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              backgroundColor: "white",
              padding: "12px 16px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              animation: "fadeIn 0.3s ease-in-out",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                border: "3px solid #3b82f6",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#1e293b",
              }}
            >
              Finding best route...
            </span>
          </div>
        )}
      </div>

      {/* Feature Panels */}
      <AnimatePresence>
        {selectedDistrict && (
          <DistrictPanel
            district={selectedDistrict}
            onClose={() => setSelectedDistrict(null)}
            onAddToCompare={handleAddToCompare}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showComparison && (
          <ComparisonModal
            items={compareList}
            onClose={() => setShowComparison(false)}
            onRemove={removeFromCompare}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRecommendations && (
          <RecommendationPanel
            districts={districts}
            onSelect={(slug) => {
              handleDistrictClick(slug);
              setShowRecommendations(false);
            }}
            onClose={() => setShowRecommendations(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
