import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function ReportList() {
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
    <div className="bg-white p-5 rounded-2xl shadow-md max-h-[350px] overflow-y-auto border border-gray-100">
      <h3 className="text-xl font-semibold mb-4 text-primary">
        🕵️ Live Reports
      </h3>

      {reports.length === 0 ? (
        <p className="text-sm text-gray-500">No reports submitted yet.</p>
      ) : (
        <ul className="space-y-4">
          {reports.map((report) => (
            <li
              key={report.id}
              className="flex gap-3 bg-gray-50 rounded-xl p-3 hover:shadow-sm transition"
            >
              {/* Show image if available */}
              {report.imageURL ? (
                <img
                  src={report.imageURL}
                  alt={report.district}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                  No Image
                </div>
              )}

              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-800">
                  📍 {report.district}, {report.cityDetails}
                </h4>
                <p className="text-sm text-gray-600">{report.description}</p>
                <span className="text-xs text-gray-400">
                  {report.createdAt?.toDate().toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
