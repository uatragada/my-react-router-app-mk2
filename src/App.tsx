import { Routes, Route } from "react-router-dom";
import Welcome from "./pages/welcome"; // adjust if your path is different
import About from "./pages/about"; // adjust if your path is different
import Projects from "./pages/projects"; // adjust if your path is different
import Blog from "./pages/blog"; // adjust if your path is different
import PostDetailPage from "./pages/post-detail";
import AIPongPlay from "./pages/ai-pong-play";
import Photography from "./pages/photography"; // adjust if your path is different
import Contact from "./pages/contact"; // adjust if your path is different
import ThemePrototypes from "./pages/theme-prototypes";
import "./styles/enter-animation.css";
import { useEffect } from "react";
import { applyStoredPortfolioTheme } from "./lib/themeRegistry";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    localStorage.setItem("theme", "dark");
    applyStoredPortfolioTheme();
  }, []);

  return (
    <div>
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
      <SpeedInsights />
    </div>
  );
}

export default App;
