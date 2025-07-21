import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import "leaflet/dist/leaflet.css";

// ✅ Fix Leaflet default icon bug
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ✅ Orange icon for user marker
const brightOrangeIcon = new L.Icon({
  iconUrl:
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [30, 48], // slightly larger
  iconAnchor: [15, 48],
  popupAnchor: [0, -40],
  shadowSize: [48, 48],
});



function UserLocationSetter({ setUserLocation }) {
  const map = useMap();
  const hasRequestedRef = useRef(false); // ✅ prevent double prompts

  useEffect(() => {
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;

    const askPermission = () => {
      const allow = window.confirm(
        "Allow access to your location for better map experience?"
      );
      if (allow && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            map.setView([userLat, userLng], 14); // center map
            setUserLocation([userLat, userLng]);
          },
          (error) => {
            console.warn("Geolocation error:", error);
            alert("Could not access your location.");
          }
        );
      }
    };

    askPermission();
  }, [map, setUserLocation]);

  return null;
}

export default function ReportMap() {
  const [reports, setReports] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  // 🔄 Fetch reports from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "reports"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(data);
      },
      (error) => {
        console.error("Firestore error:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <div
      style={{
        height: "500px",
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={[27.7172, 85.324]} // Default to Kathmandu
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 🧭 Center to user location */}
        <UserLocationSetter setUserLocation={setUserLocation} />

        {/* 🟠 User location marker */}
        {userLocation && (
          <Marker position={userLocation} icon={brightOrangeIcon}>
            <Popup>Your location</Popup>
          </Marker>
        )}

        {/* 📍 Report markers from Firestore */}
        {reports.map((report) => {
          const {
            id,
            coordinates,
            district,
            cityDetails,
            description,
            imageURL,
          } = report;

          if (!coordinates || !coordinates.includes(",")) return null;

          const [latStr, lngStr] = coordinates.split(",");
          const lat = parseFloat(latStr?.trim());
          const lng = parseFloat(lngStr?.trim());

          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker key={id} position={[lat, lng]}>
              <Popup>
                <div className="max-w-xs">
                  <strong>{district}</strong>
                  <br />
                  {cityDetails}
                  <br />
                  {description && (
                    <>
                      <br />
                      <em>{description}</em>
                    </>
                  )}
                  {imageURL && (
                    <div
                      style={{
                        marginTop: "8px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        border: "1px solid #ddd",
                      }}
                    >
                      <img
                        src={imageURL}
                        alt="Report"
                        className="w-full sm:w-32 h-32 object-cover rounded-lg block"
                      />
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
