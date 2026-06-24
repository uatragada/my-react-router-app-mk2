import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
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
import { initializePortfolioTheme } from "./lib/themeRegistry";

function App() {
  useEffect(() => {
    initializePortfolioTheme();
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
      <Analytics />
    </div>
  );
}

export default App;
