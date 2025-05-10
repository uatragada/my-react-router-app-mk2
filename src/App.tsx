import { Routes, Route } from "react-router-dom";
import Welcome from "./pages/welcome"; // adjust if your path is different
import About from "./pages/about"; // adjust if your path is different
import Projects from "./pages/projects"; // adjust if your path is different
import Blog from "./pages/blog"; // adjust if your path is different
import Photography from "./pages/photography"; // adjust if your path is different
import Contact from "./pages/contact"; // adjust if your path is different
import NavDropdown from "./components/Nav-Dropdown";
import DarkModeToggle from "./components/Toggle";

function App() {
  return (
    <div>
      <div className="nav-dropdown-container">
        <NavDropdown />
      </div>
      <div className="dark-mode-toggle-container">
        <DarkModeToggle />
      </div>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/photography" element={<Photography />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
}

export default App;
