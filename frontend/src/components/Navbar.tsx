import React from "react";

const Navbar = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <a href="#" className="text-2xl font-bold font-poppins text-dark-text">
          GPA<span className="text-primary">i</span>
        </a>

        {/* Nav Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a
            href="#calculator"
            className="text-light-text hover:text-primary transition-colors"
          >
            Calculator
          </a>
          <a
            href="#why-gpai"
            className="text-light-text hover:text-primary transition-colors"
          >
            Why GPAi
          </a>
          <a
            href="#sneak-peek"
            className="text-light-text hover:text-primary transition-colors"
          >
            Coming Soon
          </a>
        </div>

        {/* CTA Button */}
        <a
          href="#calculator"
          className="bg-primary text-white font-poppins font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          Get Started
        </a>
      </nav>
    </header>
  );
};

export default Navbar;
