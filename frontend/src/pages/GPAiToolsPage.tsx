import { useState } from "react";
import Navbar from "../components/Navbar"; // Your existing Navbar
import CalculationModeModal from "../components/modals/CalculationModeModals";
import OneTimeCalculator from "../components/calculators/OneTimeCalculator";
import SemesterCalculator from "../components/calculators/SemesterCalculator";
import YearCalculator from "../components/calculators/YearCalculator";

export type Mode = "one-time" | "semester" | "year" | null;

const GPAToolsPage = () => {
  const [mode, setMode] = useState<Mode>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Function to be passed to the modal
  const handleSelectMode = (selectedMode: Mode) => {
    setMode(selectedMode);
    setIsModalOpen(false);
  };

  // Function for the "Change Mode" button
  const handleChangeMode = () => {
    setIsModalOpen(true);
    setMode(null); // Reset mode to show the modal again
  };

  const renderCalculator = () => {
    switch (mode) {
      case "one-time":
        // For now, we'll use a placeholder, but you can swap this with your real calculator
        return <OneTimeCalculator />;
      case "semester":
        return <SemesterCalculator />;
      case "year":
        return <YearCalculator />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* Background Elements from your design */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      <Navbar variant="light"/> {/* Using your existing Navbar component */}
      {isModalOpen && <CalculationModeModal onSelectMode={handleSelectMode} />}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-12">
        {mode && (
          <div className="max-w-4xl mx-auto animate-fadeIn">
            {/* Header for the tools section */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  GPAi Tools
                </h1>
                <button
                  onClick={handleChangeMode}
                  className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300"
                >
                  Change Mode
                </button>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                You're using the{" "}
                <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent capitalize">
                  {mode?.replace("-", " ")}
                </span>{" "}
                mode. Let's get calculating!
              </p>
            </div>

            {/* Render the selected calculator */}
            {renderCalculator()}
          </div>
        )}
      </main>
      {/* Add keyframes to index.css if not already there */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default GPAToolsPage;
