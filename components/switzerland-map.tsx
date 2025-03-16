"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import type { City } from "@/types/game";

// Importiere die Leaflet CSS-Datei korrekt
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false }
);

// Import the MapEvents component
import MapEvents from "./map-events";

// Importiere die benötigten Leaflet-Typen
import type { DivIcon } from "leaflet";

// Define types but initialize them later
let LeafletDivIcon: typeof DivIcon;

interface MapProps {
  onSelectPoint: (latlng: [number, number]) => void;
  selectedPoint: [number, number] | null;
  actualCity: City | null;
  onError?: () => void; // Add this line
}

export default function SwitzerlandMap({
  onSelectPoint,
  selectedPoint,
  actualCity,
  onError,
}: MapProps) {
  // Initialize Leaflet only on client side
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Importiere Leaflet und setze die Variable
    import("leaflet")
      .then((L) => {
        LeafletDivIcon = L.DivIcon;
      })
      .catch((error) => {
        console.error("Failed to load Leaflet:", error);
        setHasError(true);
        if (onError) onError();
      });
  }, [onError]);

  // Move these icon definitions inside the component after the useEffect
  const [markerIcon, setMarkerIcon] = useState<any>(null);
  const [targetIcon, setTargetIcon] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && LeafletDivIcon) {
      setMarkerIcon(
        new LeafletDivIcon({
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
            background-color: #1e90ff;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 1px 5px rgba(0,0,0,0.3);
          "></div>
        </div>
      `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          popupAnchor: [0, -10],
          className: "",
        })
      );

      setTargetIcon(
        new LeafletDivIcon({
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
            background-color: #ff40b4;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 1px 5px rgba(0,0,0,0.3);
          "></div>
        </div>
      `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          popupAnchor: [0, -10],
          className: "",
        })
      );
    }
  }, [LeafletDivIcon]);

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

  const handleMapClick = (e: any) => {
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

  // Add this before the return statement
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="h-full w-full">
      <div className="w-full h-full cursor-crosshair">
        {isClient && markerIcon && targetIcon ? (
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
            whenReady={() => {
              // Force a resize event after map creation
              setTimeout(() => {
                if (mapRef.current) {
                  mapRef.current.invalidateSize();
                }
              }, 100);
            }}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              attribution="&copy; <a href='https://arcgisonline.com/'>Arcgisonline</a>"
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
                color="#7a2db8" // Kräftiges Rot
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
                    color="#ff40b4"
                    fillColor="#105699"
                    fillOpacity={0.1}
                  />
                )}
              </>
            )}

            <MapEvents onClick={handleMapClick} />
          </MapContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            Loading map...
          </div>
        )}

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
  );
}
