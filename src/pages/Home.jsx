import ReportForm from "../components/ReportForm";
import ReportFullPage from "../components/ReportFullPage";
import ReportList from "../components/ReportList";
import ReportMap from "../components/ReportMap";

export default function Home() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 sm:p-6">
      {/* Left: Map + Full Report */}
      <div className="lg:col-span-2 ">
        <div className="h-[50vh] sm:h-[60vh] lg:h-[84vh] px-4 sm:px-6 py-4 sm:py-6 rounded-3xl bg-opacity-40">
          <ReportMap />
        </div>
        <div className="px-4 sm:px-6">
          <ReportFullPage />
        </div>
      </div>

      {/* Right: Form + List */}
      <div className="lg:col-span-1 space-y-6 px-4 sm:px-0">
        <ReportForm />
        <ReportList />
      </div>
    </div>
  );
}
