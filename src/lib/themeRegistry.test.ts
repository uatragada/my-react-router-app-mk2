import { afterEach, describe, expect, it } from "vitest";
import {
  defaultPortfolioThemeId,
  initializePortfolioTheme,
  portfolioThemeStorageKey,
} from "./themeRegistry";

describe("initializePortfolioTheme", () => {
  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-portfolio-theme");
    document.documentElement.removeAttribute("class");
  });

  it("applies the stored portfolio theme without overwriting the legacy color-mode key", () => {
    window.localStorage.setItem(portfolioThemeStorageKey, "mission-crt");
    window.localStorage.setItem("theme", "light");

    const theme = initializePortfolioTheme();

    expect(theme.id).toBe("mission-crt");
    expect(document.documentElement.dataset.portfolioTheme).toBe("mission-crt");
    expect(window.localStorage.getItem("theme")).toBe("light");
  });

  it("falls back to the default portfolio theme when no stored theme exists", () => {
    const theme = initializePortfolioTheme();

    expect(theme.id).toBe(defaultPortfolioThemeId);
    expect(document.documentElement.dataset.portfolioTheme).toBe(defaultPortfolioThemeId);
  });
});
