import { useState, useEffect } from "react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-purple-500/10 border-b border-purple-100/20"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <a href="#" className="group flex items-center">
          <div className="relative">
            <span
              className={`text-3xl font-bold font-poppins transition-colors duration-300 ${
                isScrolled ? "text-slate-800" : "text-white"
              }`}
            >
              GPA
            </span>
            <span className="text-3xl font-bold font-poppins bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              i
            </span>
            {/* Animated dot */}
            <div className="absolute -top-1 -right-2 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
          </div>
          <div
            className={`ml-3 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
              isScrolled
                ? "bg-purple-100 text-purple-700"
                : "bg-white/20 text-white/90 backdrop-blur-sm"
            }`}
          >
            AI-Powered
          </div>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a
            href="#calculator"
            className={`relative font-medium duration-300 hover:scale-105 group transition-transform ${
              isScrolled
                ? "text-slate-600 hover:text-purple-600"
                : "text-white/80 hover:text-white"
            }`}
          >
            Calculator
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a
            href="#why-gpai"
            className={`relative font-medium transition-all duration-300 hover:scale-105 group ${
              isScrolled
                ? "text-slate-600 hover:text-purple-600"
                : "text-white/80 hover:text-white"
            }`}
          >
            Why GPAi
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a
            href="#sneak-peek"
            className={`relative font-medium transition-all duration-300 hover:scale-105 group ${
              isScrolled
                ? "text-slate-600 hover:text-purple-600"
                : "text-white/80 hover:text-white"
            }`}
          >
            <span className="flex items-center">
              Coming Soon
              <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs rounded-full animate-pulse">
                New
              </span>
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            isScrolled
              ? "text-slate-600 hover:bg-purple-50"
              : "text-white hover:bg-white/10"
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* CTA Button */}
        <div className="hidden md:block">
          <a
            href="#calculator"
            className="group relative inline-flex items-center px-6 py-3 font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center">
              Get Started
              <svg
                className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </a>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border-t border-purple-100/20 px-4 py-6 space-y-4">
          <a
            href="#calculator"
            className="block text-slate-600 hover:text-purple-600 font-medium py-2 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Calculator
          </a>
          <a
            href="#why-gpai"
            className="block text-slate-600 hover:text-purple-600 font-medium py-2 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Why GPAi
          </a>
          <a
            href="#sneak-peek"
            className="block text-slate-600 hover:text-purple-600 font-medium py-2 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="flex items-center">
              Coming Soon
              <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs rounded-full">
                New
              </span>
            </span>
          </a>
          <a
            href="#calculator"
            className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium px-6 py-3 rounded-xl mt-4 hover:shadow-lg transition-all"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
