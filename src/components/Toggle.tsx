import React, { useEffect, useState } from "react";
import "../styles/toggle.css";
import { setTheme } from "../utils/themes";

function Toggle() {

  const darkLabel = "color mode toggle, dark mode";
  const lightLabel = "color mode toggle, light mode";

  const [active, setActive] = useState(false); // true = light, false = dark
  const [ariaLabel, setAriaLabel] = useState(darkLabel);

  const changeThemeAndToggle = () => {
    const html = document.documentElement;
    const isDark = html.classList.contains("dark");
    console.log("isDark", isDark);
    if (isDark) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setActive(true);
      setAriaLabel(lightLabel);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setActive(false);
      setAriaLabel(darkLabel);
    }
  };

  const handleOnClick = () => {
    changeThemeAndToggle();
  };

  const handleKeypress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter") {
      changeThemeAndToggle();
    }
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setActive(false);
      setAriaLabel(darkLabel);
    } else {
      document.documentElement.classList.remove("dark");
      setActive(true);
      setAriaLabel(lightLabel);
    }
  }, []);

  return (
    <div
      className="container--toggle w-16 h-16 flex items-center justify-center cursor-pointer"
      title="color mode toggle"
    >
      <input
        role="switch"
        aria-checked={!active}
        onKeyDown={handleKeypress}
        type="checkbox"
        id="toggle"
        className="toggle--checkbox"
        checked={active}
        onChange={handleOnClick}
      />
      <label htmlFor="toggle" className="toggle--label" aria-label={ariaLabel}>
        <span className="toggle--label-background"></span>
      </label>
      
    </div>
  );
}
console.log("Toggle component rendered with theme");
export default Toggle;
