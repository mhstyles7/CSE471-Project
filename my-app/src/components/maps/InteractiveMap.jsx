import React, { useState, useEffect } from "react";
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
  Globe,
  Sparkles,
  Scale,
  X,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  getAIInsights,
  getCoordinates,
  getCachedInsight,
  getAllCachedInsights,
  getAIRecommendations,
} from "../../services/travelAIService";
import { API_URL } from "../../config";

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

function MapController({ center, zoom, bounds }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    } else if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, bounds, map]);

  return null;
}

// AIInsight component - Now receives aiData as prop
function AIInsight({ district, aiData }) {
  const insight = aiData;

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
          No AI data available.
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

function DistrictPanel({ district, onClose, onAddToCompare, onInsightUpdate }) {
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false); // Start with false, no auto-fetch
  const [aiRequested, setAiRequested] = useState(false);

  // On-demand AI fetch - only when user clicks button
  const fetchAIInsights = async (forceRefresh = false) => {
    setLoading(true);
    setAiRequested(true);

    try {
      const data = await getAIInsights(district, forceRefresh);

      setAiData(data);
      if (onInsightUpdate) onInsightUpdate(district.name, data);
    } catch (err) {
      console.warn("[DistrictPanel] AI fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset or Load Cache when district changes
  useEffect(() => {
    setAiData(null);
    setAiRequested(false);

    // Check if we have cached data for this district
    const cached = getCachedInsight(district.name);
    if (cached) {
      setAiData(cached);
      setAiRequested(true); // Show it immediately if cached
      if (onInsightUpdate) onInsightUpdate(district.name, cached);
    }
  }, [district]);

  // Fail-safe data merging - using destination table field names
  const safeData = {
    riskLevel: aiData?.riskLevel || district.risk_level || "Low",
    ecoScore: aiData?.ecoScore || district.eco_score || "N/A",
    comfortLevel: aiData?.comfortLevel || district.comfort_score || "N/A",
    description: district.description || "",
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
        top: "128px",
        right: "35px",
        bottom: "45px",
        width: "350px",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
        padding: "24px",
        overflowY: "auto",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.5)",
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
        {/* Description from destination table */}
        {district.description && (
          <p
            style={{
              color: "#475569",
              fontSize: "14px",
              marginTop: "12px",
              lineHeight: "1.5",
            }}
          >
            {district.description}
          </p>
        )}
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

      {/* AI Analysis Section - On-demand */}
      <div style={{ marginBottom: "24px" }}>
        {!aiRequested ? (
          <button
            onClick={() => fetchAIInsights(false)}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#8b5cf6",
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
              boxShadow: "0 4px 6px -1px rgba(139, 92, 246, 0.3)",
            }}
          >
            <Sparkles size={16} />
            Get AI Analysis
          </button>
        ) : loading ? (
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              backgroundColor: "#f8fafc",
              borderRadius: "10px",
            }}
          >
            <span style={{ color: "#64748b" }}>🔄 AI Analyzing...</span>
          </div>
        ) : (
          <div>
            <AIInsight district={district} aiData={aiData} />
            <div style={{ textAlign: "right", marginTop: "4px" }}>
              <button
                onClick={() => fetchAIInsights(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#6d28d9",
                  fontSize: "12px", // Increased font size
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginLeft: "auto",
                  padding: "6px 10px", // Increased padding
                  borderRadius: "6px",
                  backgroundColor: "rgba(139, 92, 246, 0.1)", // Light background for visibility
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "rgba(139, 92, 246, 0.2)")
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = "rgba(139, 92, 246, 0.1)")
                }
              >
                <RefreshCw size={14} /> Regenerate Analysis
              </button>
            </div>
          </div>
        )}
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
                {typeof item === "object"
                  ? item.situationUpdate ||
                    item.description ||
                    JSON.stringify(item)
                  : item}
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
function ComparisonModal({ items, onClose, onRemove, aiInsightsMap }) {
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
        {items.map((district) => {
          const aiData = aiInsightsMap[district.name];
          const displayRisk = aiData?.riskLevel || district.risk || "Low";
          const displayComfort =
            aiData?.comfortLevel || district.comfort || "Medium";
          const displayEco = aiData?.ecoScore || district.eco_score || "Good";
          const displayTemp = aiData?.weather?.temp || "Unknown";

          return (
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
                      color:
                        displayRisk === "Low" ||
                        (typeof displayRisk === "number" && displayRisk < 4)
                          ? "#166534"
                          : "#991b1b",
                    }}
                  >
                    {displayRisk}
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
                    {displayComfort}
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
                    {displayEco}
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
                    {displayTemp}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
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

// 4.8 Recommendation Panel - Displays AI-suggested destinations
function RecommendationPanel({
  recommendations,
  loading,
  onSelect,
  onClose,
  onRefresh,
}) {
  // Pure display component now
  const recs = recommendations;

  return (
    <div
      style={{
        position: "absolute",
        top: "63px",
        right: "414px",
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {!loading && (
            <button
              onClick={onRefresh}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "#64748b",
              }}
              title="Refresh Recommendations"
            >
              <RefreshCw size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <X size={16} color="#64748b" />
          </button>
        </div>
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

function Timeline({
  trips,
  onSelectTrip,
  selectedTripId,
  districts,
  aiInsightsMap,
}) {
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
              const fromName =
                districts[trip.from]?.name ||
                trip.from
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ");
              const toName =
                districts[trip.to]?.name ||
                trip.to
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ");
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
                      fontSize: "14px",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flexWrap: "wrap", // Ensure long names wrap
                    }}
                  >
                    {fromName} <ArrowRight size={14} color="#3b82f6" /> {toName}
                  </div>
                  {/* 4.4 Trip Analysis */}
                  <div
                    className="trip-stats"
                    style={{ display: "flex", gap: "8px" }}
                  >
                    {(() => {
                      const dist = districts[trip.to];
                      const aiData = dist ? aiInsightsMap[dist.name] : null;

                      // Resolve Values (AI > DB > Default)
                      let riskVal = aiData?.riskLevel || trip.risk || "Low";
                      let comfortVal =
                        aiData?.comfortLevel || trip.comfort || "Medium";

                      // Helper for Color Logic
                      const isHighRisk =
                        riskVal === "High" ||
                        (typeof riskVal === "number" && riskVal > 5);
                      const isMedRisk = riskVal === "Medium";
                      const riskBg = isHighRisk
                        ? "#fef2f2"
                        : isMedRisk
                        ? "#fff7ed"
                        : "#f0fdf4";
                      const riskTx = isHighRisk
                        ? "#991b1b"
                        : isMedRisk
                        ? "#c2410c"
                        : "#166534";

                      const isHighComfort = comfortVal === "High";
                      const isMedComfort = comfortVal === "Medium";
                      const comfortBg = isHighComfort
                        ? "#f0fdf4"
                        : isMedComfort
                        ? "#fff7ed"
                        : "#fef2f2";
                      const comfortTx = isHighComfort
                        ? "#166534"
                        : isMedComfort
                        ? "#9a3412"
                        : "#991b1b";

                      return (
                        <>
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              backgroundColor: riskBg,
                              color: riskTx,
                              fontWeight: "600",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Shield size={10} /> Risk: {riskVal}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              backgroundColor: comfortBg,
                              color: comfortTx,
                              fontWeight: "600",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Smile size={10} /> Comfort: {comfortVal}
                          </span>
                        </>
                      );
                    })()}
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

// Persistent Storage Keys
const REC_CACHE_KEY = "ai_recommendations_cache";

export default function InteractiveMap() {
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [mapCenter, setMapCenter] = useState([23.685, 90.3563]); // Bangladesh center
  const [mapZoom, setMapZoom] = useState(7);
  const [mapBounds, setMapBounds] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // 4.7 Comparison State
  const [compareList, setCompareList] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  // 4.8 Recommendation State
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  // Dynamic Data States
  const [districts, setDistricts] = useState({});
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Global AI Insights Cache for Timeline
  const [aiInsightsMap, setAiInsightsMap] = useState({});

  useEffect(() => {
    // 1. Load initial cache for timeline
    const cachedInsights = getAllCachedInsights();
    setAiInsightsMap(cachedInsights);

    // 2. Load cached AI Recommendations
    try {
      const storedRecs = localStorage.getItem(REC_CACHE_KEY);
      if (storedRecs) {
        setAiRecommendations(JSON.parse(storedRecs));
      }
    } catch (e) {
      console.warn("Failed to load cached recommendations");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Destinations (Districts)
        const distRes = await fetch(`${API_URL}/api/destinations`);
        const distData = await distRes.json();
        const distMap = {};
        distData.forEach((d) => {
          if (d.slug) distMap[d.slug] = d;
        });
        setDistricts(distMap);

        // 3. Fetch Routes (Trips)
        const routeRes = await fetch(`${API_URL}/api/routes`);
        const routeData = await routeRes.json();

        // 3a. Check for Missing Coordinates & Fetch Dynamically
        const missingSlugs = new Set();
        routeData.forEach((trip) => {
          if (!distMap[trip.from]) missingSlugs.add(trip.from);
          if (!distMap[trip.to]) missingSlugs.add(trip.to);
        });

        if (missingSlugs.size > 0) {
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

        setTrips(initialTrips);
        setLoading(false); // <--- UNBLOCK UI HERE

        // 3b. Background "Slow" Update - OSRM Paths (Sequential to avoid 429 Rate Limit)
        const backgroundUpdate = async () => {
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
      return; // Already has detailed path
    }

    const controller = new AbortController();
    const loadSelectedPath = async () => {
      const fromDist = districts[selectedTrip.from];
      const toDist = districts[selectedTrip.to];
      if (!fromDist || !toDist) return;

      setIsOptimizing(true);

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
        } else {
          console.error("[Map] Priority fetch failed", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsOptimizing(false);
        }
      }
    };

    loadSelectedPath();

    return () => {
      controller.abort();
      setIsOptimizing(false);
    };
  }, [selectedTrip, districts, trips]); // Re-run if selection changes or districts load, or trips array itself changes

  const handleDistrictClick = (key) => {
    const district = districts[key];
    if (!district) return;

    setSelectedDistrict(district);
    setMapBounds(null); // Clear any active bounds
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

      // setMapCenter is less relevant if we use bounds, but keeping it for reference
      setMapCenter([centerLat, centerLng]);
      setMapBounds([from, to]);
      // Removed fixed setMapZoom(9)
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

  const handleToggleRecommendations = async (force = false) => {
    if (!showRecommendations || force) {
      setShowRecommendations(true);
      // Only fetch if we haven't already OR if forced
      if (aiRecommendations.length === 0 || force) {
        setRecLoading(true);
        try {
          // 1. Get List of Districts from AI - Passing live insights (weather/safety)
          const aiRecNames = await getAIRecommendations(
            districts,
            aiInsightsMap
          );

          // 2. Map Names back to Objects
          const districtValues = Object.values(districts);
          const matchedRecs = [];

          aiRecNames.forEach((name) => {
            const match = districtValues.find(
              (d) =>
                d.name.toLowerCase().includes(name.toLowerCase()) ||
                name.toLowerCase().includes(d.name.toLowerCase())
            );
            if (match) {
              // Merge live weather/safety for UI display
              const insight = aiInsightsMap[match.name];
              const enriched = {
                ...match,
                risk_level: insight?.riskLevel || match.risk_level,
                eco_score: insight?.ecoScore || match.eco_score,
                comfort_score: insight?.comfortLevel || match.comfort_score,
                weather: insight?.weather || match.weather,
              };
              matchedRecs.push(enriched);
            }
          });

          // 3. Fallback / Fill if AI returns fewer than 3
          if (matchedRecs.length < 3) {
            const sorted = districtValues
              .filter((d) => !matchedRecs.includes(d))
              .sort((a, b) => b.eco_score - a.eco_score);
            matchedRecs.push(...sorted.slice(0, 3 - matchedRecs.length));
          }

          const finalRecs = matchedRecs.slice(0, 3);
          setAiRecommendations(finalRecs);

          // Save to persistent cache
          try {
            localStorage.setItem(REC_CACHE_KEY, JSON.stringify(finalRecs));
          } catch (e) {
            console.warn("Failed to cache recommendations");
          }
        } catch (err) {
          console.warn("[Map] AI Rec Error:", err);
          // Fallback: Local Score
          const districtList = Object.values(districts).filter(
            (d) => d.coordinates
          );
          const scored = districtList.map((d) => {
            const eco = parseInt(d.eco_score) || 50;
            const comfort = parseInt(d.comfort_score) || 50;
            return { ...d, score: eco + comfort };
          });
          const finalFallback = scored.slice(0, 3);
          setAiRecommendations(finalFallback);
          try {
            localStorage.setItem(REC_CACHE_KEY, JSON.stringify(finalFallback));
          } catch (e) {
            console.warn("Failed to cache fallback recommendations");
          }
        }
        setRecLoading(false);
      }
    } else {
      setShowRecommendations(false);
    }
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
        height: "calc(100vh - 130px)", // Fit within viewport below navbar
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
                Selected:{" "}
                {districts[trips.find((t) => t.id === selectedTrip.id)?.from]
                  ?.name ||
                  trips.find((t) => t.id === selectedTrip.id)?.from}{" "}
                →{" "}
                {districts[trips.find((t) => t.id === selectedTrip.id)?.to]
                  ?.name || trips.find((t) => t.id === selectedTrip.id)?.to}
              </span>
              <button
                onClick={() => {
                  setSelectedTrip(null);
                  setMapZoom(7);
                  setMapCenter([23.685, 90.3563]);
                  setMapBounds(null);
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
            onClick={() => handleToggleRecommendations(false)}
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
            aiInsightsMap={aiInsightsMap}
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

          <MapController center={mapCenter} zoom={mapZoom} bounds={mapBounds} />

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
                  },
                }}
              >
                <Popup className="custom-popup">
                  <div style={{ textAlign: "center", padding: "4px" }}>
                    <strong style={{ fontSize: "14px" }}>
                      {dist.name ||
                        dist.slug
                          .split("-")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                    </strong>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      Click for details
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
            onInsightUpdate={(name, data) =>
              setAiInsightsMap((prev) => ({ ...prev, [name]: data }))
            }
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showComparison && (
          <ComparisonModal
            items={compareList}
            aiInsightsMap={aiInsightsMap}
            onClose={() => {
              setShowComparison(false);
              setCompareList([]);
            }}
            onRemove={removeFromCompare}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRecommendations && (
          <RecommendationPanel
            recommendations={aiRecommendations}
            loading={recLoading}
            onClose={() => setShowRecommendations(false)}
            onSelect={handleDistrictClick}
            onRefresh={() => handleToggleRecommendations(true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
