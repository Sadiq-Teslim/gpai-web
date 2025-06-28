import React from "react";

const WhyGPAi = () => {
  return (
    <section id="why-gpai" className="bg-background py-20 px-4">
      <div className="container mx-auto max-w-7xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          Why Choose GPAi?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-2xl font-bold mb-2">No-Stress Calculation</h3>
            <p>
              A clean, simple interface for instant and accurate GPA results.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-5xl mb-4">🧠</div>
            <h3 className="text-2xl font-bold mb-2">Smart AI Suggestions</h3>
            <p>
              Upcoming AI insights to help you improve and plan your academic
              journey.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-5xl mb-4">📈</div>
            <h3 className="text-2xl font-bold mb-2">Track Your Progress</h3>
            <p>
              Our future WhatsApp bot will save history and track your GPA
              semesterly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default WhyGPAi;
