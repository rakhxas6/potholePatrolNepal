import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import "leaflet/dist/leaflet.css";

// ✅ Fix Leaflet icon bug
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function UserLocationSetter() {
  const map = useMap();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          map.setView([userLat, userLng], 14); // center and zoom
        },
        () => {
          console.warn("Failed to get user location.");
        }
      );
    }
  }, [map]);

  return null;
}

export default function ReportMap() {
  const [reports, setReports] = useState([]);

  // Fetch reports
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "reports"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(data);
    });
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
        center={[27.7172, 85.324]} // Kathmandu as default
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%",zIndex: 1}}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 🧭 Dynamically center to user location */}
        <UserLocationSetter />

        {/* 📍 Markers from Firestore */}
        {reports.map((report) => {
          const {
            id,
            coordinates,
            district,
            cityDetails,
            description,
            imageURL,
          } = report;

          if (!coordinates) return null;

          const [latStr, lngStr] = coordinates.split(",");
          const lat = parseFloat(latStr?.trim());
          const lng = parseFloat(lngStr?.trim());

          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker key={id} position={[lat, lng]}>
              <Popup>
                <div style={{ maxWidth: "200px" }}>
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
                    <div style={{ marginTop: "8px" }}>
                      <img
                        src={imageURL}
                        alt="Report"
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
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
