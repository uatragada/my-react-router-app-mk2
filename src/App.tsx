import { Routes, Route, useLocation } from "react-router-dom";
import Welcome from "./pages/welcome"; // adjust if your path is different
import About from "./pages/about"; // adjust if your path is different
import Projects from "./pages/projects"; // adjust if your path is different
import Blog from "./pages/blog"; // adjust if your path is different
import PostDetailPage from "./pages/post-detail";
import AIPongPlay from "./pages/ai-pong-play";
import Photography from "./pages/photography"; // adjust if your path is different
import Contact from "./pages/contact"; // adjust if your path is different
import ThemePrototypes from "./pages/theme-prototypes";
import NavDropdown from "./components/Nav-Dropdown";
import "./styles/enter-animation.css";
import { useEffect } from "react";
import { applyStoredPortfolioTheme } from "./lib/themeRegistry";
function App() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    localStorage.setItem("theme", "dark");
    applyStoredPortfolioTheme();

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
      {!isHome && (
        <div className="nav-dropdown-container animate-from-left">
          <NavDropdown />
        </div>
      )}
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<PostDetailPage section="projects" basePath="/projects" backLabel="projects" />} />
        <Route path="/projects/ai-pong-self-play/play" element={<AIPongPlay />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<PostDetailPage section="blog" basePath="/blog" backLabel="blog" />} />
        <Route path="/photography" element={<Photography />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/theme" element={<ThemePrototypes />} />
        <Route path="/theme-prototypes" element={<ThemePrototypes />} />
      </Routes>
    </div>
  );
}

export default App;
