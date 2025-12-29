import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet marker icons not showing in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Child component to handle map movement/zoom when props change
function MapController({ start, end }) {
  const map = useMap();

  useEffect(() => {
    if (start && end) {
      const bounds = L.latLngBounds([
        [start.lat, start.lng],
        [end.lat, end.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (start) {
      map.flyTo([start.lat, start.lng], 12);
    } else if (end) {
      map.flyTo([end.lat, end.lng], 12);
    }
  }, [start, end, map]);

  return null;
}

export default function RouteMap({ start, end }) {
  // Default center (e.g., Dhaka) if nothing selected
  const defaultCenter = [23.8103, 90.4125];

  // State for the actual road path
  const [routePath, setRoutePath] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    async function fetchRoute() {
      if (start && end) {
        // 1. Instant Feedback: Show straight line immediately
        setRoutePath([
          [start.lat, start.lng],
          [end.lat, end.lng],
        ]);
        setIsOptimizing(true); // Mark as "refining"

        try {
          console.log("[RouteMap] Fetching refined route...");
          // OSRM expects lon,lat
          const startCoords = `${start.lng},${start.lat}`;
          const endCoords = `${end.lng},${end.lat}`;
          const url = `https://router.project-osrm.org/route/v1/driving/${startCoords};${endCoords}?overview=full&geometries=geojson`;

          // 2. Fetch with longer timeout (60s)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000);

          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data.routes && data.routes.length > 0) {
              // GeoJSON returns [lon, lat], Leaflet needs [lat, lon]
              const coordinates = data.routes[0].geometry.coordinates.map(
                (coord) => [coord[1], coord[0]]
              );
              setRoutePath(coordinates);
              console.log(
                `[RouteMap] Refined route found: ${coordinates.length} points`
              );
            }
          } else {
            console.warn(`[RouteMap] OSRM error: ${response.status}`);
          }
        } catch (error) {
          console.warn(
            "Route fetch failed/timed out, keeping straight line:",
            error
          );
        } finally {
          setIsOptimizing(false);
        }
      } else {
        setRoutePath(null);
        setIsOptimizing(false);
      }
    }

    fetchRoute();
  }, [start, end]);

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={7}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapController start={start} end={end} />

        {start && (
          <Marker position={[start.lat, start.lng]}>
            <Popup>Start: {start.label}</Popup>
          </Marker>
        )}

        {end && (
          <Marker position={[end.lat, end.lng]}>
            <Popup>Destination: {end.label}</Popup>
          </Marker>
        )}

        {routePath && (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: isOptimizing ? "#94a3b8" : "blue",
              weight: 5,
              opacity: 0.7,
              lineCap: "round",
              lineJoin: "round",
              dashArray: isOptimizing ? "10, 10" : null,
            }}
          />
        )}
      </MapContainer>

      {/* Loading Popup */}
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
              width: "16px",
              height: "16px",
              border: "2px solid #3b82f6",
              borderTop: "2px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <span
            style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}
          >
            Finding best route...
          </span>
          <style>
            {`
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}
          </style>
        </div>
      )}
    </div>
  );
}
