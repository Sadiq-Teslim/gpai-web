import type { Mode } from "../../pages/GPAiToolsPage"; // Import the type from the parent page

type Props = {
  onSelectMode: (mode: Mode) => void;
};

const modeOptions = [
  {
    id: "one-time",
    title: "One-Time Calculation",
    description: "Quick GPA calculation for current courses.",
    icon: "⚡",
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-50 to-teal-50",
    borderColor: "border-emerald-200",
    features: [
      "Instant results",
      "No history tracking",
      "Perfect for quick checks",
    ],
  },
  {
    id: "semester",
    title: "Semester Tracking",
    description: "Calculate and track your semester GPA.",
    icon: "📚",
    gradient: "from-blue-500 to-indigo-600",
    bgGradient: "from-blue-50 to-indigo-50",
    borderColor: "border-blue-200",
    features: ["Semester history", "Progress tracking", "Detailed analytics"],
  },
  {
    id: "year",
    title: "Yearly Overview",
    description: "Complete academic year GPA management.",
    icon: "🎓",
    gradient: "from-purple-500 to-pink-600",
    bgGradient: "from-purple-50 to-pink-50",
    borderColor: "border-purple-200",
    features: ["Multi-semester view", "Cumulative GPA", "Academic planning"],
  },
];

const CalculationModeModal = ({ onSelectMode }: Props) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Choose Your Calculation Mode
          </h2>
          <p className="text-gray-600 text-lg">
            Select the perfect tool for your GPA calculation needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {modeOptions.map((option, index) => (
            <div
              key={option.id}
              onClick={() => onSelectMode(option.id as Mode)}
              className="group relative bg-white rounded-3xl p-6 border transition-all duration-500 hover:-translate-y-2 overflow-hidden cursor-pointer animate-fadeInUp"
              style={{
                animationDelay: `${index * 100}ms`,
                borderColor: "var(--border-color, #E5E7EB)",
              }}
              onMouseEnter={(e) =>
                e.currentTarget.style.setProperty(
                  "--border-color",
                  "rgba(196, 181, 253, 0.5)"
                )
              }
              onMouseLeave={(e) =>
                e.currentTarget.style.setProperty("--border-color", "#E5E7EB")
              }
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${option.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}
              ></div>
              <div className="relative z-10">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4`}
                >
                  <span className="text-2xl">{option.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {option.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {option.description}
                </p>
                <ul className="space-y-2 border-t border-gray-200 pt-4 mt-4">
                  {option.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center text-sm text-gray-500"
                    >
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full mt-6 py-3 px-4 bg-gradient-to-r ${option.gradient} text-white font-semibold rounded-xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300`}
                >
                  Select This Mode
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalculationModeModal;
