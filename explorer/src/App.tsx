import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Poh from "./pages/Poh.tsx";
import SDKDemo from "./pages/SDKDemo.tsx";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";

function App() {

  return (
    <Router>
      <header>
        <Navbar />
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sdk-demo" element={<SDKDemo />} />
        <Route path="/poh" element={<Poh />} />
      </Routes>
      <footer>
        <Footer />
      </footer>
    </Router>
  );
}

export default App;
