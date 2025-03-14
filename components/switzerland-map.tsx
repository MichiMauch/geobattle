"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  GeoJSON,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
} from "react-leaflet";
import { DivIcon as LeafletDivIcon, type LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { City } from "@/types/game";

// Import the MapEvents component
import MapEvents from "./map-events";

interface MapProps {
  onSelectPoint: (latlng: [number, number]) => void;
  selectedPoint: [number, number] | null;
  actualCity: City | null;
}

// Erstelle benutzerdefinierte Marker-Icons mit SVG
const markerIcon = new LeafletDivIcon({
  html: `
    <div style="
      position: relative;
      width: 20px;
      height: 20px;
    ">
      <div style="
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 20px;
        background-color: #2563eb;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 1px 5px rgba(0,0,0,0.3);
      "></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10], // Ankerpunkt genau in der Mitte des Kreises
  popupAnchor: [0, -10],
  className: "",
});

const targetIcon = new LeafletDivIcon({
  html: `
    <div style="
      position: relative;
      width: 20px;
      height: 20px;
    ">
      <div style="
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 20px;
        background-color: #16a34a;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 1px 5px rgba(0,0,0,0.3);
      "></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10], // Ankerpunkt genau in der Mitte des Kreises
  popupAnchor: [0, -10],
  className: "",
});

export default function SwitzerlandMap({
  onSelectPoint,
  selectedPoint,
  actualCity,
}: MapProps) {
  const [switzerlandGeoJSON, setSwitzerlandGeoJSON] = useState<any>(null);
  const mapRef = useRef<any>(null);

  // Stelle sicher, dass der Cursor als Fadenkreuz angezeigt wird
  useEffect(() => {
    // Füge CSS-Klasse zum Body hinzu
    document.body.classList.add("crosshair-cursor");

    // Bereinige beim Unmount
    return () => {
      document.body.classList.remove("crosshair-cursor");
    };
  }, []);

  const handleMapClick = (e: LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;

    // Prüfe, ob der Klick innerhalb der Schweiz liegt
    if (isPointInSwitzerland(lat, lng)) {
      onSelectPoint([lat, lng]);
    } else {
      // Optional: Feedback geben, dass der Klick außerhalb der Schweiz liegt
      console.log("Bitte wähle einen Punkt innerhalb der Schweiz");
    }
  };

  // Vereinfachte Funktion, um zu prüfen, ob ein Punkt innerhalb der Schweiz liegt
  // In einer vollständigen Implementierung würde man das GeoJSON verwenden
  const isPointInSwitzerland = (lat: number, lng: number): boolean => {
    // Grobe Grenzen der Schweiz
    return lat >= 45.7 && lat <= 48.1 && lng >= 5.7 && lng <= 10.6;
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <div className="w-4/5 h-4/5 relative">
        <div className="w-full h-full cursor-crosshair">
          <MapContainer
            center={[46.8, 8.2]} // Zentrum der Schweiz
            zoom={7.5} // Optimaler Zoom für die gesamte Schweiz
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
            zoomControl={false} // Zoom-Steuerelemente entfernen
            scrollWheelZoom={false} // Zoom mit Mausrad deaktivieren
            doubleClickZoom={false} // Doppelklick-Zoom deaktivieren
            touchZoom={false} // Touch-Zoom deaktivieren
            boxZoom={false} // Box-Zoom deaktivieren
            keyboard={false} // Tastatur-Navigation deaktivieren
            dragging={true} // Verschieben erlauben, aber mit Grenzen
            maxBounds={[
              [45.7, 5.7], // Südwestliche Ecke
              [48.1, 10.6], // Nordöstliche Ecke
            ]}
            maxBoundsViscosity={1.0} // Verhindert das Verschieben außerhalb der Grenzen
            className="cursor-crosshair"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
              attribution="&copy; <a href='https://carto.com/'>Carto</a>"
            />

            {switzerlandGeoJSON && (
              <GeoJSON
                data={switzerlandGeoJSON}
                style={() => ({
                  color: "transparent", // Umrisslinie unsichtbar machen
                  weight: 0, // Liniendicke auf 0 setzen
                  fillColor: "#f8f8f8",
                  fillOpacity: 0.3,
                })}
              />
            )}

            {selectedPoint && actualCity && (
              // Verbindungslinie zwischen Schätzung und tatsächlichem Standort
              <Polyline
                positions={[selectedPoint, [actualCity.lat, actualCity.lng]]}
                color="#ef4444" // Kräftiges Rot
                weight={3} // Dickere Linie
                opacity={0.8} // Leicht transparent
              />
            )}

            {selectedPoint && (
              <Marker position={selectedPoint} icon={markerIcon}>
                <Popup>Deine Schätzung</Popup>
              </Marker>
            )}

            {actualCity && (
              <>
                <Marker
                  position={[actualCity.lat, actualCity.lng]}
                  icon={targetIcon}
                >
                  <Popup>{actualCity.name}</Popup>
                </Marker>

                {selectedPoint && (
                  // Kreis um den tatsächlichen Standort
                  <Circle
                    center={[actualCity.lat, actualCity.lng]}
                    radius={5000} // 5km
                    color="green"
                    fillColor="green"
                    fillOpacity={0.1}
                  />
                )}
              </>
            )}

            <MapEvents onClick={handleMapClick} />
          </MapContainer>

          {/* CSS für Leaflet-Container, um sicherzustellen, dass der Cursor auch innerhalb der Karte ein Fadenkreuz ist */}
          <style jsx global>{`
            .leaflet-container {
              cursor: crosshair !important;
            }

            .cursor-crosshair,
            .cursor-crosshair * {
              cursor: crosshair !important;
            }

            .crosshair-cursor .leaflet-container,
            .crosshair-cursor .leaflet-interactive {
              cursor: crosshair !important;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
