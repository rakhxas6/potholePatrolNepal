import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-white py-6 mt-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()}{" "}
          <span className="font-semibold">Pothole Patrol Nepal</span>. All
          rights reserved.
        </p>
        <p className="text-sm text-gray-400">Crafted by Sudhan Kandel</p>
      </div>
    </footer>
  );
}
