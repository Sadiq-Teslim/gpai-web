import React from "react";

const Hero = () => {
  return (
    <section id="hero" className="bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center py-28">
        <h1 className="text-4xl md:text-6xl font-bold font-poppins max-w-4xl mx-auto mb-4">
          Your Smart GPA Calculator —{" "}
          <span className="text-primary">Powered by AI</span>
        </h1>
        <p className="text-lg md:text-xl text-light-text max-w-2xl mx-auto mb-8">
          GPA tracking made effortless. Instantly calculate your GPA without the
          stress.
        </p>
        <a
          href="#calculator"
          className="inline-block bg-primary text-white font-poppins font-medium text-lg px-8 py-4 rounded-lg hover:bg-blue-700 transition-transform hover:-translate-y-1"
        >
          Start Calculating Now
        </a>
      </div>
    </section>
  );
};

export default Hero;
