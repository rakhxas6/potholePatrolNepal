import { useState } from "react";
import ReportForm from "../components/ReportForm";
import ReportMap from "../components/ReportMap";
import ReportList from "../components/ReportList";
import ResponsiblePartyModal from "../components/ResponsiblePartyModal";
import ReportFullPage from "../components/ReportFullPage";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveResponsibleParty = (data) => {
    console.log("Saved Responsible Party:", data);
    // You can store it in state or send it to Firebase
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 ">
      {/* Left: Map */}
      <div className="lg:col-span-2 h-[84vh] px-6 py-6 rounded-3xl bg-opacity-40">
        <ReportMap />
        <ReportFullPage />
      </div>

      {/* Right: Form + List + Modal Button */}
      <div className="lg:col-span-1 space-y-6">
        <ReportForm />

        {/* <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-primary text-white font-medium py-2 rounded-lg hover:bg-orange-600 transition"
        >
          Add Responsible Party
        </button> */}

        <ReportList />

        {/* Modal (only shows if open) */}
        {/* <ResponsiblePartyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveResponsibleParty}
        /> */}
      </div>
    </div>
  );
}
