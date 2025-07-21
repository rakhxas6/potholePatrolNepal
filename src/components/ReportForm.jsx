import React, { useState, useEffect, useRef } from "react";
import { FaMapPin, FaInfoCircle, FaTimes, FaUserShield } from "react-icons/fa";
import { db } from "../firebase/config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import locationData from "../nepal_location.json";
import UploadToCloudinary from "../cloudinary/UploadToCloudinary";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { toast ,Toaster} from "react-hot-toast";
import ResponsiblePartyModal from "./ResponsiblePartyModal";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function ReportForm() {
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [cityDetails, setCityDetails] = useState("");
  const [description, setDescription] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [responsibleParty, setResponsibleParty] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showMap, setShowMap] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    setProvinces(locationData.provinceList);
  }, []);

  const handleProvinceChange = (e) => {
    const provName = e.target.value;
    setSelectedProvince(provName);
    setSelectedDistrict("");
    setSelectedMunicipality("");
    const province = provinces.find((p) => p.name === provName);
    setDistricts(province ? province.districtList : []);
  };

  const handleDistrictChange = (e) => {
    const distName = e.target.value;
    setSelectedDistrict(distName);
    setSelectedMunicipality("");
    const district = districts.find((d) => d.name === distName);
    setMunicipalities(district ? district.municipalityList : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !selectedProvince ||
      !selectedDistrict ||
      !selectedMunicipality ||
      !cityDetails
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    

    setLoading(true);
    let imageURL = "";

    try {
      if (file) {
        imageURL = await UploadToCloudinary(file);
      }

      await addDoc(collection(db, "reports"), {
        province: selectedProvince,
        district: selectedDistrict,
        municipality: selectedMunicipality,
        cityDetails,
        description,
        coordinates,
        responsibleParty,
        imageURL,
        createdAt: serverTimestamp(),
      });

      toast.success("Report submitted successfully!");

      // Reset state
      setSelectedProvince("");
      setSelectedDistrict("");
      setSelectedMunicipality("");
      setCityDetails("");
      setDescription("");
      setCoordinates("");
      setResponsibleParty(null);
      setFile(null);
      fileInputRef.current.value = "";
      setMarkerPosition(null);
    } catch (err) {
      toast.error("Error submitting report. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  function LocationSelectorMap() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        const coordStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setCoordinates(coordStr);
        setMarkerPosition([lat, lng]);
        toast.success("Location selected");
      },
    });
    return null;
  }

  return (
    <div className="relative">
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Default options for all toasts
          className: "rounded-xl bg-gray-900 text-white shadow-lg",
          style: {
            padding: "14px 20px",
            fontWeight: "600",
            fontSize: "14px",
          },
          success: {
            duration: 4000,
            style: {
              background: "#22c55e", // Tailwind green-500
              color: "white",
            },
            iconTheme: {
              primary: "#ffffff",
              secondary: "#22c55e",
            },
          },
          error: {
            duration: 6000,
            style: {
              background: "#ef4444", // Tailwind red-500
              color: "white",
            },
            iconTheme: {
              primary: "#ffffff",
              secondary: "#ef4444",
            },
          },
        }}
      />

      {/* Form */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 max-w-2xl mx-auto relative z-10">
        <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
          <FaInfoCircle className="text-primary" />
          Submit a Pothole Report
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Province */}
          <div>
            <label className="font-semibold">Province *</label>
            <select
              value={selectedProvince}
              onChange={handleProvinceChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-3"
              required
            >
              <option value="">Choose a province</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          {districts.length > 0 && (
            <div>
              <label className="font-semibold">District *</label>
              <select
                value={selectedDistrict}
                onChange={handleDistrictChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-3"
                required
              >
                <option value="">Choose a district</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Municipality */}
          {municipalities.length > 0 && (
            <div>
              <label className="font-semibold">Municipality *</label>
              <select
                value={selectedMunicipality}
                onChange={(e) => setSelectedMunicipality(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-3"
                required
              >
                <option value="">Choose a municipality</option>
                {municipalities.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* City Details */}
          <div>
            <label className="font-semibold">City, Road, Ward *</label>
            <input
              type="text"
              value={cityDetails}
              onChange={(e) => setCityDetails(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-3"
              required
              placeholder="e.g. Itahari-4, Dharan Road"
            />
          </div>

          {/* Responsible Party Button */}
          <div>
            <label className="font-semibold flex justify-between items-center">
              Responsible Party (Optional)
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
              >
                <FaUserShield /> {responsibleParty ? "Edit" : "Add"}
              </button>
            </label>

            {responsibleParty && (
              <div className="bg-orange-50 p-4 rounded-xl mt-4 shadow-sm border border-orange-200">
                <div className="space-y-1 text-sm text-gray-800">
                  <p>
                    <span className="font-medium text-gray-600">👤 Name:</span>{" "}
                    {responsibleParty.name}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">🎯 Role:</span>{" "}
                    {responsibleParty.role}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">
                      📞 Contact:
                    </span>{" "}
                    {responsibleParty.contact}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold">Description</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-3"
              placeholder="Describe the pothole..."
            />
          </div>

          {/* Coordinates */}
          <div>
            <label className="font-semibold flex justify-between items-center">
              <span>
                <FaMapPin className="inline mr-1 text-primary" />
                GPS Coordinates
              </span>
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="text-blue-600 hover:underline text-sm"
              >
                Pick from map
              </button>
            </label>
            <input
              type="text"
              value={coordinates}
              onChange={(e) => setCoordinates(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-3"
              placeholder="Click 'Pick from map' or enter manually "
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="font-semibold ">Upload Image / Video</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files[0])}
              ref={fileInputRef}
              className="w-full text-sm text-gray-700 file:mr-4 mt-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-orange-600 transition"
            />
            {file && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: {file.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-orange-600 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>

      {/* Map Overlay */}
      {showMap && (
        <div className="fixed top-0 left-0 w-full h-full z-50 bg-white">
          <button
            className="absolute top-4 right-10 text-white bg-red-600 hover:bg-red-700 rounded-full p-3 z-[9999]"
            onClick={() => setShowMap(false)}
          >
            <FaTimes className="text-xl" />
          </button>
          <MapContainer
            center={[27.7172, 85.324]}
            zoom={8}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            />
            <LocationSelectorMap />
            {markerPosition && <Marker position={markerPosition} />}
          </MapContainer>
        </div>
      )}

      {/* Modal for Responsible Party */}
      <ResponsiblePartyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={(data) => {
          setResponsibleParty(data);
        }}
        initialData={responsibleParty}
      />
    </div>
  );
}
