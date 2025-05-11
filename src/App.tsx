import { Routes, Route, useLocation } from "react-router-dom";
import Welcome from "./pages/welcome"; // adjust if your path is different
import About from "./pages/about"; // adjust if your path is different
import Projects from "./pages/projects"; // adjust if your path is different
import Blog from "./pages/blog"; // adjust if your path is different
import Photography from "./pages/photography"; // adjust if your path is different
import Contact from "./pages/contact"; // adjust if your path is different
import NavDropdown from "./components/Nav-Dropdown";
import DarkModeToggle from "./components/Toggle";
import "../public/enter-animation.css";
import { useEffect } from "react";
function App() {

  useEffect(() => {
    // Add the "loaded" class to <html> and <body> after the page loads
    const handleLoad = () => {
      document.documentElement.classList.add("loaded");
      document.body.classList.add("loaded");
    };

    // Trigger the animation on page load
    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      console.log("Page not loaded yet");
    }

    // Cleanup event listener
    return () => {
      window.removeEventListener("load", handleLoad);
      console.log("Page loaded");
    };
  }, []);
  return (
    <div>
      <div className="nav-dropdown-container animate-from-left">
        <NavDropdown />
      </div>
      {location.pathname !== "/" && (
        <div className="dark-mode-toggle-container animate-from-bottom">
          <DarkModeToggle />
        </div>
      )}
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
