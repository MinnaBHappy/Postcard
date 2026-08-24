"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type LatLng = { lat: number; lng: number };

function emojiIcon(emoji: string, size: number) {
  return L.divIcon({
    html: `<div style="font-size:${size}px;line-height:1">${emoji}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length >= 2) {
      map.fitBounds(points, { padding: [40, 40] });
    }
  }, [map, points]);

  return null;
}

type PigeonMapProps = {
  sender: LatLng;
  receiver: LatLng;
  pigeon: LatLng;
};

export default function PigeonMap({ sender, receiver, pigeon }: PigeonMapProps) {
  const points: [number, number][] = [
    [sender.lat, sender.lng],
    [receiver.lat, receiver.lng],
  ];

  return (
    <MapContainer
      center={[pigeon.lat, pigeon.lng]}
      zoom={4}
      style={{ height: "320px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />
      <Polyline positions={points} pathOptions={{ color: "#8a8a8a", dashArray: "6 6" }} />
      <Marker position={[sender.lat, sender.lng]} icon={emojiIcon("📮", 20)} />
      <Marker position={[receiver.lat, receiver.lng]} icon={emojiIcon("🏠", 20)} />
      <Marker position={[pigeon.lat, pigeon.lng]} icon={emojiIcon("🕊️", 26)} />
    </MapContainer>
  );
}
