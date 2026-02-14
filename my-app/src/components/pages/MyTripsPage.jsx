import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, TrendingUp, PlusCircle, Trash2, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";

export default function MyTripsPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTrip, setNewTrip] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    notes: "",
    category: "leisure",
  });

  // Fetch real travel history from database
  useEffect(() => {
    if (user?._id) {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/dashboard/${user._id}/travel-history`
      );
      const data = await response.json();
      setTrips(data);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add a new trip to the database
  const handleAddTrip = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to add trips!");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/dashboard/${user._id}/travel-history`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTrip),
        }
      );

      if (response.ok) {
        setNewTrip({
          destination: "",
          startDate: "",
          endDate: "",
          notes: "",
          category: "leisure",
        });
        setShowAddForm(false);
        fetchTrips(); // Refresh the list from DB
        alert("Trip added successfully! You earned 50 Travel Points! ✈️");
      } else {
        console.error("Failed to add trip");
      }
    } catch (error) {
      console.error("Error adding trip:", error);
    }
  };

  // Delete a trip from the database
  const handleDeleteTrip = async (tripId) => {
    try {
      await fetch(
        `${API_URL}/api/dashboard/${user._id}/travel-history/${tripId}`,
        { method: "DELETE" }
      );
      fetchTrips(); // Refresh the list from DB
    } catch (error) {
      console.error("Error deleting trip:", error);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getCategoryIcon = (category) => {
    const icons = {
      leisure: "🏖️",
      business: "💼",
      adventure: "🏔️",
      cultural: "🏛️",
      family: "👨‍👩‍👧‍👦",
    };
    return icons[category] || "✈️";
  };

  const getStatusFromDates = (startDate, endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const start = new Date(startDate);
    if (now > end) return "completed";
    if (now >= start && now <= end) return "ongoing";
    return "upcoming";
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <div style={{ textAlign: "center", color: "#6b7280" }}>
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>✈️</div>
          Loading your trips...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h2
          className="section-heading"
          style={{
            fontSize: "42px",
            fontWeight: "800",
            color: "#1f2937",
            marginBottom: "12px",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          My Travel History
        </h2>
        <p style={{ fontSize: "18px", color: "#6b7280" }}>
          Track your journeys and relive your adventures
        </p>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            marginTop: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            backgroundColor: "#059669",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "15px",
          }}
        >
          <PlusCircle size={18} />
          Add New Trip
        </button>
      </div>

      {/* Add Trip Form */}
      {showAddForm && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "20px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
            padding: "32px",
            marginBottom: "28px",
            border: "2px solid #bbf7d0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#1f2937",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Log a New Trip
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7280",
              }}
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleAddTrip}>
            <div
              className="form-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <input
                type="text"
                placeholder="Destination (e.g., Cox's Bazar)"
                value={newTrip.destination}
                onChange={(e) =>
                  setNewTrip({ ...newTrip, destination: e.target.value })
                }
                required
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "2px solid #e5e7eb",
                  fontSize: "15px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#059669")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <select
                value={newTrip.category}
                onChange={(e) =>
                  setNewTrip({ ...newTrip, category: e.target.value })
                }
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "2px solid #e5e7eb",
                  fontSize: "15px",
                  backgroundColor: "white",
                }}
              >
                <option value="leisure">🏖️ Leisure</option>
                <option value="business">💼 Business</option>
                <option value="adventure">🏔️ Adventure</option>
                <option value="cultural">🏛️ Cultural</option>
                <option value="family">👨‍👩‍👧‍👦 Family</option>
              </select>
              <input
                type="date"
                value={newTrip.startDate}
                onChange={(e) =>
                  setNewTrip({ ...newTrip, startDate: e.target.value })
                }
                required
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "2px solid #e5e7eb",
                  fontSize: "15px",
                }}
              />
              <input
                type="date"
                value={newTrip.endDate}
                onChange={(e) =>
                  setNewTrip({ ...newTrip, endDate: e.target.value })
                }
                required
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "2px solid #e5e7eb",
                  fontSize: "15px",
                }}
              />
            </div>
            <textarea
              placeholder="Notes (optional)"
              value={newTrip.notes}
              onChange={(e) =>
                setNewTrip({ ...newTrip, notes: e.target.value })
              }
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "2px solid #e5e7eb",
                fontSize: "15px",
                resize: "vertical",
                minHeight: "60px",
                marginBottom: "16px",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="submit"
                style={{
                  padding: "12px 28px",
                  backgroundColor: "#059669",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "15px",
                }}
              >
                Save Trip
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: "12px 28px",
                  backgroundColor: "#e5e7eb",
                  color: "#374151",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "15px",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trip List */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
          padding: "32px",
          marginBottom: "28px",
          border: "1px solid rgba(5, 150, 105, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            position: "relative",
          }}
        >
          {/* Timeline Line */}
          {trips.length > 0 && (
            <div
              style={{
                position: "absolute",
                left: "26px",
                top: "40px",
                bottom: "40px",
                width: "3px",
                background: "linear-gradient(to bottom, #059669, #0d9488)",
                borderRadius: "2px",
              }}
            />
          )}

          {trips.length > 0 ? (
            trips.map((trip, index) => {
              const status = getStatusFromDates(trip.startDate, trip.endDate);
              return (
                <div
                  key={trip._id}
                  style={{
                    position: "relative",
                    paddingLeft: "68px",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    animation: `slideUp 0.5s ease-out ${index * 0.15}s both`,
                  }}
                >
                  {/* Timeline Dot */}
                  <div
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "20px",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background:
                        status === "upcoming"
                          ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                          : status === "ongoing"
                            ? "linear-gradient(135deg, #f59e0b, #ef4444)"
                            : "linear-gradient(135deg, #059669, #0d9488)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow:
                        status === "upcoming"
                          ? "0 4px 12px rgba(59, 130, 246, 0.4)"
                          : "0 4px 12px rgba(5, 150, 105, 0.4)",
                      border: "4px solid white",
                      zIndex: 1,
                    }}
                  >
                    {status === "upcoming" ? (
                      <TrendingUp size={14} color="white" strokeWidth={3} />
                    ) : (
                      <Calendar size={14} color="white" strokeWidth={3} />
                    )}
                  </div>

                  <div
                    style={{
                      backgroundColor:
                        status === "upcoming" ? "#f0f9ff" : "#f0fdf4",
                      borderRadius: "16px",
                      padding: "20px 24px",
                      border: `2px solid ${status === "upcoming" ? "#bfdbfe" : "#bbf7d0"
                        }`,
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateX(8px)";
                      e.currentTarget.style.boxShadow =
                        status === "upcoming"
                          ? "0 8px 16px rgba(59, 130, 246, 0.15)"
                          : "0 8px 16px rgba(5, 150, 105, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h4
                          style={{
                            fontWeight: "700",
                            color: "#1f2937",
                            marginBottom: "12px",
                            fontSize: "20px",
                            fontFamily: "Poppins, sans-serif",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span>{getCategoryIcon(trip.category)}</span>
                          {trip.destination}
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            gap: "20px",
                            flexWrap: "wrap",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontSize: "14px",
                              color: "#6b7280",
                            }}
                          >
                            <div
                              style={{
                                padding: "6px",
                                borderRadius: "8px",
                                backgroundColor: "white",
                                display: "flex",
                              }}
                            >
                              <Calendar
                                size={16}
                                color={
                                  status === "upcoming"
                                    ? "#3b82f6"
                                    : "#059669"
                                }
                              />
                            </div>
                            {formatDate(trip.startDate)} -{" "}
                            {formatDate(trip.endDate)}
                          </div>
                        </div>
                        {trip.notes && (
                          <p
                            style={{
                              fontSize: "13px",
                              color: "#9ca3af",
                              marginTop: "8px",
                            }}
                          >
                            {trip.notes}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <div
                          style={{
                            padding: "6px 16px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: "700",
                            backgroundColor:
                              status === "upcoming"
                                ? "#3b82f6"
                                : status === "ongoing"
                                  ? "#f59e0b"
                                  : "#059669",
                            color: "white",
                            boxShadow:
                              status === "upcoming"
                                ? "0 4px 12px rgba(59, 130, 246, 0.3)"
                                : "0 4px 12px rgba(5, 150, 105, 0.3)",
                          }}
                        >
                          {status === "upcoming"
                            ? "Upcoming"
                            : status === "ongoing"
                              ? "Ongoing"
                              : "Completed"}
                        </div>
                        <button
                          onClick={() => handleDeleteTrip(trip._id)}
                          style={{
                            padding: "8px",
                            backgroundColor: "#fee2e2",
                            color: "#dc2626",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#9ca3af",
              }}
            >
              <MapPin
                size={48}
                style={{ marginBottom: "12px", opacity: 0.5 }}
              />
              <p>No trips logged yet. Add your first trip above!</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
          borderRadius: "20px",
          padding: "32px",
          border: "2px solid #bbf7d0",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(5, 150, 105, 0.1)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #059669, #0d9488)",
            marginBottom: "16px",
            boxShadow: "0 8px 16px rgba(5, 150, 105, 0.3)",
          }}
        >
          <MapPin size={32} color="white" strokeWidth={2.5} />
        </div>
        <h3
          style={{
            color: "#059669",
            fontWeight: "800",
            marginBottom: "8px",
            fontSize: "28px",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Total Trips: {trips.length}
        </h3>
        <p style={{ color: "#6b7280", fontSize: "15px", lineHeight: "1.6" }}>
          Keep exploring and add more destinations to your travel history!
        </p>
      </div>
    </div>
  );
}
