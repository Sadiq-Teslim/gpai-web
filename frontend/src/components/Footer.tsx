import React from "react";

const Footer = () => {
  return (
    <footer className="bg-dark-text text-gray-400 text-center py-8">
      <p>© {new Date().getFullYear()} GPAi. All Rights Reserved.</p>
      <div className="mt-2">
        <a href="#hero" className="mx-3 hover:text-white transition-colors">
          Home
        </a>
        <a
          href="mailto:contact@gpai.com"
          className="mx-3 hover:text-white transition-colors"
        >
          Contact
        </a>
      </div>
    </footer>
  );
};
export default Footer;
