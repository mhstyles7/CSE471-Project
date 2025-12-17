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

  useEffect(() => {
    async function fetchRoute() {
      if (start && end) {
        try {
          // OSRM expects lon,lat
          const startCoords = `${start.lng},${start.lat}`;
          const endCoords = `${end.lng},${end.lat}`;
          const url = `https://router.project-osrm.org/route/v1/driving/${startCoords};${endCoords}?overview=full&geometries=geojson`;

          const response = await fetch(url);
          const data = await response.json();

          if (data.routes && data.routes.length > 0) {
            // GeoJSON returns [lon, lat], Leaflet needs [lat, lon]
            const coordinates = data.routes[0].geometry.coordinates.map(
              (coord) => [coord[1], coord[0]]
            );
            setRoutePath(coordinates);
          }
        } catch (error) {
          console.error("Error fetching route:", error);
          // Fallback to straight line if API fails
          setRoutePath([
            [start.lat, start.lng],
            [end.lat, end.lng],
          ]);
        }
      } else {
        setRoutePath(null);
      }
    }

    fetchRoute();
  }, [start, end]);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={7}
      style={{ height: "100%", width: "100%", borderRadius: "16px", zIndex: 0 }}
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
            color: "blue",
            weight: 5,
            opacity: 0.7,
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      )}
    </MapContainer>
  );
}
