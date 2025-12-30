import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Leaf,
  Trophy,
  ArrowRight,
  Activity,
  BarChart2,
} from "lucide-react";
import RouteMap from "./RouteMap";
import { searchLocation, getRouteEstimates } from "../../services/mapService";
import { getRouteRecommendation } from "../../services/travelAIService";

export default function RoutePlanner() {
  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [suggestions, setSuggestions] = useState({ start: [], end: [] });

  // { lat: number, lng: number, label: string }
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);

  const [estimates, setEstimates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Real-time polling reference
  const pollingRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (startQuery && !source) handleSearch(startQuery, "start");
    }, 800);
    return () => clearTimeout(timer);
  }, [startQuery, source]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (endQuery && !destination) handleSearch(endQuery, "end");
    }, 800);
    return () => clearTimeout(timer);
  }, [endQuery, destination]);

  const handleSearch = async (query, type) => {
    const results = await searchLocation(query);
    setSuggestions((prev) => ({ ...prev, [type]: results }));
  };

  const selectLocation = (location, type) => {
    const locData = {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      label: location.display_name.split(",")[0], // Short name
    };

    if (type === "start") {
      setSource(locData);
      setStartQuery(locData.label);
      setSuggestions((prev) => ({ ...prev, start: [] }));
    } else {
      setDestination(locData);
      setEndQuery(locData.label);
      setSuggestions((prev) => ({ ...prev, end: [] }));
    }
  };

  const [aiRecommendation, setAiRecommendation] = useState(null);

  const fetchEstimates = async () => {
    if (!source || !destination) return;
    setLoading(true);
    setError(null);
    setAiRecommendation(null); // Reset prev AI
    try {
      const data = await getRouteEstimates(source, destination);
      setEstimates(data);

      // Async fetch AI recommendation (doesn't block initial render)
      getRouteRecommendation(source, destination, data.estimates).then(
        (aiRes) => {
          if (aiRes) setAiRecommendation(aiRes);
        }
      );
    } catch (err) {
      setError("Failed to fetch route estimates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when both points set
  useEffect(() => {
    if (source && destination) {
      fetchEstimates();
      // Start Polling (every 30s)
      pollingRef.current = setInterval(fetchEstimates, 30000);
    } else {
      setEstimates(null);
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [source, destination]);

  const clearSelection = (type) => {
    if (type === "start") {
      setSource(null);
      setStartQuery("");
    } else {
      setDestination(null);
      setEndQuery("");
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(350px, 1fr) 2fr",
        gap: "32px",
        height: "calc(100vh - 100px)",
        padding: "0px",
      }}
    >
      {/* Left Panel: Inputs & Results */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          overflowY: "auto",
          paddingRight: "10px",
        }}
      >
        {/* Header */}
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "#064e3b",
              marginBottom: "8px",
            }}
          >
            Route & Cost Estimator
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Plan your trip with AI-powered insights on cost, time, and
            eco-impact.
          </p>
        </div>

        {/* Input Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            background: "white",
            padding: "24px",
            borderRadius: "24px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Start Input */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                border: "2px solid #e2e8f0",
                borderRadius: "12px",
                padding: "12px",
                transition: "all 0.2s",
              }}
            >
              <MapPin size={20} color="#059669" />
              <input
                type="text"
                placeholder="Starting Point"
                value={startQuery}
                onChange={(e) => {
                  setStartQuery(e.target.value);
                  if (source) setSource(null); // Reset selection on edit
                }}
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "15px",
                }}
              />
              {source && (
                <button
                  onClick={() => clearSelection("start")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            {/* Auto-complete dropdown */}
            {suggestions.start.length > 0 && !source && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  marginTop: "4px",
                  zIndex: 50,
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                }}
              >
                {suggestions.start.map((loc, idx) => (
                  <div
                    key={idx}
                    onClick={() => selectLocation(loc, "start")}
                    style={{
                      padding: "12px",
                      cursor: "pointer",
                      borderBottom:
                        idx !== suggestions.start.length - 1
                          ? "1px solid #f1f5f9"
                          : "none",
                      fontSize: "14px",
                    }}
                  >
                    {loc.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Destination Input */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                border: "2px solid #e2e8f0",
                borderRadius: "12px",
                padding: "12px",
                transition: "all 0.2s",
              }}
            >
              <MapPin size={20} color="#dc2626" />
              <input
                type="text"
                placeholder="Destination"
                value={endQuery}
                onChange={(e) => {
                  setEndQuery(e.target.value);
                  if (destination) setDestination(null);
                }}
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "15px",
                }}
              />
              {destination && (
                <button
                  onClick={() => clearSelection("end")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            {suggestions.end.length > 0 && !destination && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  marginTop: "4px",
                  zIndex: 50,
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                }}
              >
                {suggestions.end.map((loc, idx) => (
                  <div
                    key={idx}
                    onClick={() => selectLocation(loc, "end")}
                    style={{
                      padding: "12px",
                      cursor: "pointer",
                      borderBottom:
                        idx !== suggestions.end.length - 1
                          ? "1px solid #f1f5f9"
                          : "none",
                      fontSize: "14px",
                    }}
                  >
                    {loc.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={fetchEstimates}
            disabled={loading || !source || !destination}
            style={{
              background: loading ? "#94a3b8" : "#059669",
              color: "white",
              border: "none",
              padding: "14px",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {loading ? (
              "Calculating..."
            ) : (
              <>
                <Activity size={18} />
                Calculate Route
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {error && (
          <div
            style={{
              color: "#ef4444",
              padding: "12px",
              background: "#fef2f2",
              borderRadius: "12px",
            }}
          >
            {error}
          </div>
        )}

        {estimates && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#1e293b",
                }}
              >
                Transport Options
              </h2>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    background: "#22c55e",
                    borderRadius: "50%",
                    boxShadow: "0 0 0 2px #dcfce7",
                  }}
                ></div>
                Live Updates Active
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {estimates.estimates.map((est) => (
                <div
                  key={est.mode}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "20px",
                    border: est.isRecommended
                      ? "2px solid #059669"
                      : "1px solid #e2e8f0",
                    position: "relative",
                    boxShadow: est.isRecommended
                      ? "0 10px 15px -3px rgba(5, 150, 105, 0.1)"
                      : "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {/* Determine Recommendation: Prioritize AI, else Backend */}
                  {(aiRecommendation &&
                    est.mode ===
                      aiRecommendation.recommendedMode.toLowerCase()) ||
                  (!aiRecommendation && est.isRecommended) ? (
                    <div
                      style={{
                        position: "absolute",
                        top: "-12px",
                        left: "20px",
                        background: "#059669",
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "700",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        zIndex: 10,
                      }}
                    >
                      <Trophy size={12} />
                      AI Recommended
                    </div>
                  ) : null}

                  {/* Show AI Reason if THIS is the recommended one */}
                  {aiRecommendation &&
                    est.mode ===
                      aiRecommendation.recommendedMode.toLowerCase() && (
                      <div
                        style={{
                          marginBottom: "12px",
                          fontSize: "13px",
                          color: "#15803d",
                          backgroundColor: "#dcfce7",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "start",
                          gap: "6px",
                        }}
                      >
                        <span style={{ flexShrink: 0 }}>✨</span>
                        <span>{aiRecommendation.reason}</span>
                      </div>
                    )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          background: "#f0fdf4",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                        }}
                      >
                        {est.mode === "bus" && "🚌"}
                        {est.mode === "train" && "🚆"}
                        {est.mode === "car" && "🚗"}
                        {est.mode === "flight" && "✈️"}
                      </div>
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "18px",
                            fontWeight: "700",
                            color: "#0f172a",
                          }}
                        >
                          {est.name}
                        </h3>
                        <span style={{ fontSize: "13px", color: "#64748b" }}>
                          Comfort: {est.comfortRating}/10
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "800",
                          color: "#059669",
                        }}
                      >
                        {est.currency ? est.currency : "$"}
                        {est.cost}
                      </div>
                      <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                        approx.
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "#f8fafc",
                        padding: "10px",
                        borderRadius: "10px",
                      }}
                    >
                      <Clock size={16} color="#3b82f6" />
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#334155",
                        }}
                      >
                        {est.duration.toFixed(1)} hrs
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "#f8fafc",
                        padding: "10px",
                        borderRadius: "10px",
                      }}
                    >
                      <Leaf
                        size={16}
                        color={est.emissions > 50 ? "#eab308" : "#22c55e"}
                      />
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#334155",
                        }}
                      >
                        {est.emissions} kg CO₂
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right Panel: Map */}
      <div
        style={{
          background: "#e2e8f0",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
        }}
      >
        <RouteMap start={source} end={destination} />
      </div>
    </div>
  );

}
