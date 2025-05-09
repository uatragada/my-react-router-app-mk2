export function setTheme(themeName: string, setClassName: (name: string) => void): void {
  localStorage.setItem('theme', themeName);
  setClassName(themeName);
}

export function keepTheme(setClassName: (name: string) => void): void {
  const theme = localStorage.getItem('theme');
  if (theme) {
    setTheme(theme, setClassName);
    return;
  }

  const prefersLightTheme = window.matchMedia('(prefers-color-scheme: light)');
  if (prefersLightTheme.matches) {
    setTheme('theme-light', setClassName);
    return;
  }

  setTheme('theme-dark', setClassName);
}