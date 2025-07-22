import { useState,useEffect } from "react";

export default function ResponsiblePartyModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}) {
  // initialData can be used to prefill form (edit mode)
 const [name, setName] = useState("");
 const [role, setRole] = useState("");
 const [contact, setContact] = useState("");


 // Reset fields when initialData changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setRole(initialData.role || "");
      setContact(initialData.contact || "");
    } else {
      setName("");
      setRole("");
      setContact("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ name, role, contact });
    onClose();
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative animate-fadeIn">
          <h2 className="text-xl font-semibold mb-4">
            Responsible Party Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Contractor ABC"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Role</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                placeholder="e.g. Contractor / MLA"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Contact Info</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Phone, email, or address"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded bg-primary text-white hover:bg-orange-600 transition"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 