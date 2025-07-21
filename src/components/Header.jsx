import { FaMapMarkedAlt } from "react-icons/fa";

export default function Header() {
  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-50">
      <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
        <FaMapMarkedAlt className="text-primary" />
        Pothole Patrol Nepal
      </h1>
      <button className="bg-primary text-white px-4 py-2 rounded-lg hover:scale-105 transition">
        Submit Report
      </button>
    </header>
  );
}
