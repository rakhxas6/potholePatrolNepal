import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { toast, Toaster } from "react-hot-toast";
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
  const [requested, setRequested] = useState(false);

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser!");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 14);
        setUserLocation([latitude, longitude]);
        toast.success("Location found!");
        setRequested(true);
      },
      (err) => {
        toast.error(
          "Please enable location permissions!"
        );
      }
    );
  };

  if (requested) return null;

 return (
   <button
     onClick={handleRequestLocation}
     style={{
       position: "absolute",
       top: 10,
       right: 10,
       zIndex: 1000,
       background: "#fb923c", // softer orange
       color: "#fff",
       padding: "8px 14px",
       borderRadius: "10px",
       border: "none",
       cursor: "pointer",
       fontWeight: "bold",
       transition: "background-color 0.3s ease",
     }}
     onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f97316")} // slightly darker on hover
     onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fb923c")}
   >
     📍 Use My Location
   </button>
 );
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
      <Toaster
        position="top-center"
      />
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
            <Popup>
              <div
                style={{
                  padding: "10px 15px",
                  borderRadius: "12px",
                  backgroundColor: "#f97316", // bright orange matching marker
                  color: "white",
                  fontWeight: "600",
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(249, 115, 22, 0.6)",
                  minWidth: "140px",
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                }}
              >
                📍 <span>Your Location</span>
              </div>
            </Popup>
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
                <div
                  className="w-full max-w-xs sm:max-w-sm md:max-w-md h-auto p-2 overflow-hidden text-sm space-y-2"
                  style={{
                    minHeight: "180px",
                    maxWidth: "180px",
                  }}
                >
                  <strong className="block truncate text-base text-black">
                    {district}
                  </strong>

                  <p className="truncate text-gray-800">{cityDetails}</p>

                  {description && (
                    <p className="text-gray-700 line-clamp-3 overflow-hidden text-ellipsis text-xs">
                      <em>{description}</em>
                    </p>
                  )}

                  {imageURL && (
                    <div
                      className="mt-2 rounded-lg overflow-hidden border border-gray-300 shadow-sm"
                      style={{
                        width: "100%",
                        aspectRatio: "4 / 3",
                      }}
                    >
                      <img
                        src={imageURL}
                        alt="Report"
                        className="w-full h-full object-cover"
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
