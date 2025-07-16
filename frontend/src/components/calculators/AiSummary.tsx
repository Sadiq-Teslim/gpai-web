type Props = {
  summary: string | null;
  isLoading: boolean;
};

const AiSummary = ({ summary, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 text-center">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-4 border-t-primary border-gray-200 rounded-full animate-spin mr-3"></div>
          <p className="font-medium text-light-text">GPAi is analyzing your results...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null; // Don't render anything if there's no summary or loading
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg border border-white/50 animate-fade-in">
      <h3 className="text-xl font-bold font-poppins text-dark-text mb-3 flex items-center">
        🤖 GPAi's Analysis
      </h3>
      <p className="text-light-text leading-relaxed">{summary}</p>
    </div>
  );
};

export default AiSummary;