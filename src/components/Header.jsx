import { FaMapMarkedAlt } from "react-icons/fa";

export default function Header() {
  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-center items-center sticky top-0 z-50">
      <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
        <FaMapMarkedAlt className="text-primary" />
        Pothole Patrol Nepal
      </h1>
    </header>
  );
}
