import { type CSSProperties, useEffect, useMemo, useState } from "react";
import {
  applyPortfolioTheme,
  getDefaultPortfolioTheme,
  getThemeById,
  readStoredPortfolioThemeId,
  themePrototypes,
  type ThemePrototype,
} from "../lib/themeRegistry";
import "../styles/theme-prototypes.css";

type ThemeStyle = CSSProperties & {
  "--theme-bg": string;
  "--theme-panel": string;
  "--theme-fg": string;
  "--theme-muted": string;
  "--theme-line": string;
  "--theme-live": string;
  "--theme-warn": string;
  "--theme-data": string;
  "--theme-fault": string;
};

function getThemeStyle(theme: ThemePrototype): ThemeStyle {
  return {
    "--theme-bg": theme.colors[0].value,
    "--theme-panel": theme.colors[1].value,
    "--theme-fg": theme.colors[2].value,
    "--theme-line": theme.colors[3].value,
    "--theme-live": theme.colors[4].value,
    "--theme-warn": theme.colors[5].value,
    "--theme-data": theme.colors[6].value,
    "--theme-fault": theme.colors[7].value,
    "--theme-muted": theme.id === "current-console" ? "#3F4F44" : theme.colors[3].value,
  };
}

export default function ThemePrototypes() {
  const [activeThemeId, setActiveThemeId] = useState(() => readStoredPortfolioThemeId());
  const activeTheme = useMemo(() => getThemeById(activeThemeId), [activeThemeId]);

  useEffect(() => {
    setActiveThemeId(readStoredPortfolioThemeId());
  }, []);

  function handleThemeSelect(themeId: string) {
    const selectedTheme = applyPortfolioTheme(themeId);
    setActiveThemeId(selectedTheme.id);
  }

  function handleResetTheme() {
    const defaultTheme = getDefaultPortfolioTheme();
    handleThemeSelect(defaultTheme.id);
  }

  return (
    <main className="theme-lab" style={getThemeStyle(activeTheme)}>
      <section className="theme-lab-console" aria-labelledby="theme-lab-title">
        <header className="theme-lab-header">
          <div>
            <p>Theme Control</p>
            <h1 id="theme-lab-title">{activeTheme.name}</h1>
          </div>
          <div className="theme-lab-code">{activeTheme.code}</div>
        </header>

        <section className="theme-lab-preview" aria-label="Theme preview">
          <div className="theme-preview-primary">
            <p>Mission Interface</p>
            <strong>UA-01</strong>
            <span>{activeTheme.note}</span>
          </div>
          <div className="theme-preview-readouts">
            <span>LIVE</span>
            <span>STDBY</span>
            <span>LAB</span>
            <span>FAULT</span>
          </div>
          <div className="theme-preview-grid" aria-hidden="true">
            {Array.from({ length: 48 }, (_, index) => (
              <span key={index} className={`theme-preview-cell cell-${index % 7}`} />
            ))}
          </div>
        </section>
      </section>

      <footer className="theme-palette-footer" aria-label="Theme palette selector">
        <div className="theme-footer-row">
          <div className="theme-footer-label">Theme Strips / Click To Apply Site Theme</div>
          <button type="button" className="theme-reset-button" onClick={handleResetTheme}>
            Reset To Current
          </button>
        </div>
        <div className="theme-strip-rail">
          {themePrototypes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`theme-strip-button${theme.id === activeTheme.id ? " is-active" : ""}`}
              onClick={() => handleThemeSelect(theme.id)}
            >
              <span className="theme-strip-meta">
                <span>{theme.code}</span>
                <span>{theme.name}</span>
              </span>
              <span className="theme-strip" aria-hidden="true">
                {theme.colors.map((color) => (
                  <span
                    key={`${theme.id}-${color.label}`}
                    className="theme-strip-slice"
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </span>
            </button>
          ))}
        </div>
      </footer>
    </main>
  );
}
