export type PaletteColor = {
  label: string;
  value: string;
};

export type ThemePrototype = {
  id: string;
  code: string;
  name: string;
  note: string;
  colors: PaletteColor[];
};

export const portfolioThemeStorageKey = "portfolio-theme-id";
export const defaultPortfolioThemeId = "current-console";

export const themePrototypes: ThemePrototype[] = [
  {
    id: "monochrome-flight",
    code: "THM-01",
    name: "Monochrome Flight",
    note: "Black field, white instrumentation, gray hierarchy, no color state.",
    colors: [
      { label: "Background", value: "#000000" },
      { label: "Panel", value: "#050505" },
      { label: "Text", value: "#FFFFFF" },
      { label: "Line", value: "#D8D8D8" },
      { label: "Live", value: "#F2F2F2" },
      { label: "Warn", value: "#9A9A9A" },
      { label: "Data", value: "#BFBFBF" },
      { label: "Fault", value: "#6F6F6F" },
    ],
  },
  {
    id: "current-console",
    code: "THM-02",
    name: "Current Console",
    note: "Current landing page color space: black field, white type, muted green-gray labels, mil-spec signal colors.",
    colors: [
      { label: "Background", value: "#020202" },
      { label: "Panel", value: "#050505" },
      { label: "Text", value: "#FFFFFF" },
      { label: "Line", value: "#F4F1EA" },
      { label: "Live", value: "#4DFF88" },
      { label: "Warn", value: "#FFD35A" },
      { label: "Data", value: "#65AAFF" },
      { label: "Fault", value: "#FF3B30" },
    ],
  },
  {
    id: "mission-crt",
    code: "THM-03",
    name: "Mission CRT",
    note: "Green monochrome base with amber alert and hard white type.",
    colors: [
      { label: "Background", value: "#000604" },
      { label: "Panel", value: "#03140D" },
      { label: "Text", value: "#FFFFFF" },
      { label: "Line", value: "#22C55E" },
      { label: "Live", value: "#73FF8E" },
      { label: "Warn", value: "#FFD000" },
      { label: "Data", value: "#00D18F" },
      { label: "Fault", value: "#FF4438" },
    ],
  },
  {
    id: "range-safety",
    code: "THM-04",
    name: "Range Safety",
    note: "High contrast launch range palette with red-orange authority.",
    colors: [
      { label: "Background", value: "#040404" },
      { label: "Panel", value: "#111111" },
      { label: "Text", value: "#FFFFFF" },
      { label: "Line", value: "#FF4A1C" },
      { label: "Live", value: "#49FF76" },
      { label: "Warn", value: "#FFC400" },
      { label: "Data", value: "#00A7FF" },
      { label: "Fault", value: "#FF1F1F" },
    ],
  },
  {
    id: "deep-space-lab",
    code: "THM-05",
    name: "Deep Space Lab",
    note: "Cold instrument blue with yellow state markers and red faults.",
    colors: [
      { label: "Background", value: "#000409" },
      { label: "Panel", value: "#03111C" },
      { label: "Text", value: "#FFFFFF" },
      { label: "Line", value: "#00B8FF" },
      { label: "Live", value: "#43FF8E" },
      { label: "Warn", value: "#FFD33D" },
      { label: "Data", value: "#37D7FF" },
      { label: "Fault", value: "#FF4B32" },
    ],
  },
  {
    id: "black-box-recorder",
    code: "THM-06",
    name: "Black Box Recorder",
    note: "Aviation orange, hard white labels, compact emergency color.",
    colors: [
      { label: "Background", value: "#030201" },
      { label: "Panel", value: "#130A03" },
      { label: "Text", value: "#FFFFFF" },
      { label: "Line", value: "#FF7A00" },
      { label: "Live", value: "#69FF47" },
      { label: "Warn", value: "#FFB000" },
      { label: "Data", value: "#14C8FF" },
      { label: "Fault", value: "#FF2D20" },
    ],
  },
  {
    id: "terrain-survey",
    code: "THM-07",
    name: "Terrain Survey",
    note: "Deep brown field, oxidized metal lines, moss live states, clay alerts.",
    colors: [
      { label: "Background", value: "#080403" },
      { label: "Panel", value: "#160D08" },
      { label: "Text", value: "#F4E6CF" },
      { label: "Line", value: "#9B6A3D" },
      { label: "Live", value: "#8DBA5A" },
      { label: "Warn", value: "#D69A3A" },
      { label: "Data", value: "#A77A52" },
      { label: "Fault", value: "#B65336" },
    ],
  },
];

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${r} ${g} ${b} / ${alpha}%)`;
}

export function getThemeById(themeId: string | null | undefined) {
  return themePrototypes.find((theme) => theme.id === themeId) ?? getDefaultPortfolioTheme();
}

export function getDefaultPortfolioTheme() {
  return themePrototypes.find((theme) => theme.id === defaultPortfolioThemeId) ?? themePrototypes[0];
}

export function readStoredPortfolioThemeId() {
  if (typeof window === "undefined") {
    return defaultPortfolioThemeId;
  }

  return window.localStorage.getItem(portfolioThemeStorageKey) ?? defaultPortfolioThemeId;
}

export function getThemeCssVariables(theme: ThemePrototype) {
  const [background, panel, text, line, live, warn, data, fault] = theme.colors;
  const muted = theme.id === "current-console" ? "#3F4F44" : line.value;

  return {
    "--color-bg": background.value,
    "--color-fg": text.value,
    "--color-checked": data.value,
    "--grid-dot": rgba(line.value, 12),
    "--grain": rgba(text.value, 5),
    "--site-bg": background.value,
    "--site-panel": panel.value,
    "--site-fg": text.value,
    "--site-muted": muted,
    "--site-dim": rgba(line.value, 36),
    "--site-line": rgba(line.value, 78),
    "--site-line-soft": rgba(line.value, 22),
    "--site-accent": data.value,
    "--site-emphasis": text.value,
    "--site-live": live.value,
    "--site-warn": warn.value,
    "--site-data": data.value,
    "--site-fault": fault.value,
  };
}

export function applyPortfolioTheme(themeId: string) {
  if (typeof document === "undefined") {
    return getThemeById(themeId);
  }

  const theme = getThemeById(themeId);
  const root = document.documentElement;

  Object.entries(getThemeCssVariables(theme)).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  root.dataset.portfolioTheme = theme.id;
  window.localStorage.setItem(portfolioThemeStorageKey, theme.id);

  return theme;
}

export function applyStoredPortfolioTheme() {
  return applyPortfolioTheme(readStoredPortfolioThemeId());
}
