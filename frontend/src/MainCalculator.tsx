import Navbar from "./components/Navbar";
import Calculator from "./components/Calculator";
import Footer from "./components/Footer";

function MainCalculator() {
  return (
    <div>
      <Navbar />
      <main>
        <Calculator />
      </main>
      <Footer />
    </div>
  );
}

export default MainCalculator;
