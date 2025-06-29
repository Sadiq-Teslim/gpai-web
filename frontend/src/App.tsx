import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Calculator from "./components/calculators/OneTimeCalculator";
import WhyGPAi from "./components/WhyGPAi";
import SneakPeek from "./components/SneakPeek";
import Footer from "./components/Footer";

function App() {
  return (
    <div>
      <Navbar />
      <main>
        <Hero />
        <Calculator />
        <WhyGPAi />
        <SneakPeek />
      </main>
      <Footer />
    </div>
  );
}

export default App;
