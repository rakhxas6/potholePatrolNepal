import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function ReportFullPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(fetched);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-8 mt-32">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary">
          🕵️ Live Incident Reports
        </h1>
        <p className="text-gray-600 mt-2">
          Real-time updates from the field, streamed directly from our database.
        </p>
      </header>

      {/* Report List Section */}
      <section className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-10 border border-gray-100">
        {reports.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">
            No reports submitted yet.
          </p>
        ) : (
          <ul className="space-y-6">
            {reports.map((report) => (
              <li
                key={report.id}
                className="flex flex-col sm:flex-row gap-4 bg-gray-50 rounded-xl p-4 hover:shadow-sm transition"
              >
                {/* Image Display */}
                {report.imageURL ? (
                  <img
                    src={report.imageURL}
                    alt={report.district}
                    className="w-full sm:w-32 h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full sm:w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                    No Image
                  </div>
                )}

                {/* Report Details */}
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-800">
                    📍 {report.district}, {report.cityDetails}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {report.description}
                  </p>
                  <span className="text-xs text-gray-400 block mt-2">
                    {report.createdAt?.toDate().toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
