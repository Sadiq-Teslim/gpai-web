import React from "react";
import Hero from "./components/Hero";
import Calculator from './components/Calculator';
import WhyGPAi from './components/WhyGPAi';
import SneakPeek from './components/SneakPeek';
import Footer from './components/footer';

// Define the styles based on your style guide
const styles: { [key: string]: React.CSSProperties } = {
  app: {
    fontFamily: "'Inter', sans-serif", // Default body font
    backgroundColor: "#F5F5F5", // Soft Light Grey background
    color: "#757575", // Light Text for body
    minHeight: "100vh",
  },
};

function App() {
  return (
    <div style={styles.app}>
      <main>
        {/* Hero Section: The first thing users see */}
        <Hero />

        {/* 
          The rest of your page sections will go here.
          The Calculator section needs an id="calculator" for the Hero button to work.
        */}
        <Calculator />
        <WhyGPAi />
        <SneakPeek />
      </main>
      <Footer />
    </div>
  );
}

export default App;
