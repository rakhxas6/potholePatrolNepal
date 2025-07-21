import React, { useState, useEffect } from "react";
import { FaMapPin, FaInfoCircle, FaUpload, FaTimes } from "react-icons/fa";
import { db } from "../firebase/config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from "react-hot-toast";
import locationData from "../nepal_location.json";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import UploadToCloudinary from "../cloudinary/UploadToCloudinary";
import ResponsiblePartyModal from "../components/ResponsiblePartyModal";
import "leaflet/dist/leaflet.css";

// Leaflet icon fix
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
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [showResponsibleModal, setShowResponsibleModal] = useState(false);
  const [responsibleParty, setResponsibleParty] = useState(null);

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
        imageURL,
        responsibleParty,
        createdAt: serverTimestamp(),
      });

      toast.success("Report submitted successfully!");
      setSelectedProvince("");
      setSelectedDistrict("");
      setSelectedMunicipality("");
      setCityDetails("");
      setDescription("");
      setCoordinates("");
      setFile(null);
      setMarkerPosition(null);
      setResponsibleParty(null);
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
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 max-w-2xl mx-auto relative z-10">
        <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
          <FaInfoCircle className="text-primary" /> Submit a Pothole Report
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Province */}
          <div>
            <label className="font-semibold">Province *</label>
            <select
              value={selectedProvince}
              onChange={handleProvinceChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
              placeholder="e.g. Itahari-4, Dharan Road"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold">Description</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Click 'Pick from map' or enter manually"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="font-semibold">Upload Image / Video</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-orange-600 transition"
            />
          </div>

          {/* Responsible Party */}
          <div>
            <label className="font-semibold">Responsible Party</label>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">
                {responsibleParty?.name || "No details added"}
              </span>
              <button
                type="button"
                onClick={() => setShowResponsibleModal(true)}
                className="text-blue-600 text-sm hover:underline"
              >
                {responsibleParty ? "Edit" : "Add"}
              </button>
            </div>
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

      {/* Fullscreen Map */}
      {showMap && (
        <div className="fixed top-0 left-0 w-full h-full z-50 bg-white">
          <button
            className="absolute top-4 right-4 text-white bg-red-500 rounded-full p-2 z-50 shadow"
            onClick={() => setShowMap(false)}
          >
            <FaTimes />
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

      {/* Responsible Party Modal */}
      <ResponsiblePartyModal
        isOpen={showResponsibleModal}
        onClose={() => setShowResponsibleModal(false)}
        onSave={(data) => setResponsibleParty(data)}
        initialData={responsibleParty}
      />
    </div>
  );
}
