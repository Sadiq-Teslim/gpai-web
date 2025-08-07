type Props = {
  isOpen: boolean;
  onClose: () => void;
  gpa: string | null;
  aiSummary: string | null;
  isLoadingAi: boolean;
};

const ResultsModal = ({
  isOpen,
  onClose,
  gpa,
  aiSummary,
  isLoadingAi,
}: Props) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg text-center transform transition-all animate-fade-in scale-95">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold font-poppins text-dark-text mb-2">
          Calculation Complete!
        </h2>
        <p className="text-light-text mb-6">
          Here's a summary of your results.
        </p>

        {/* GPA Display */}
        {gpa && (
          <div className="mb-6">
            <p className="text-lg text-slate-600">Your GPA is</p>
            <p className="font-bold text-7xl text-primary my-2">{gpa}</p>
          </div>
        )}

        {/* AI Summary Display */}
        <div className="bg-slate-50 p-4 rounded-lg text-left">
          <h3 className="text-lg font-bold font-poppins text-dark-text mb-2 flex items-center">
            🤖 GPAi's Analysis
          </h3>
          {isLoadingAi ? (
            <div className="flex items-center text-slate-500">
              <div className="w-5 h-5 border-2 border-t-primary border-gray-200 rounded-full animate-spin mr-3"></div>
              Analyzing your results...
            </div>
          ) : (
            <p className="text-light-text leading-relaxed">
              {aiSummary || "AI analysis could not be generated at this time."}
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full mt-8 bg-primary text-white font-poppins font-medium text-lg px-8 py-3 rounded-lg hover:bg-blue-700 transition-transform hover:-translate-y-1"
        >
          View Full Breakdown
        </button>
      </div>
    </div>
  );
};

export default ResultsModal;
