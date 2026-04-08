import "../styles/nav-dropdown.css";
import { useEffect, useState } from "react";

function NavDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isClosing) return;

    const timeout = window.setTimeout(() => {
      setIsClosing(false);
    }, 850);

    return () => window.clearTimeout(timeout);
  }, [isClosing]);

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsClosing(true);
      return;
    }

    setIsClosing(false);
    setIsOpen(true);
  };

  return (
    <div className={`dropdown${isClosing ? " is-closing" : ""}`} title="dropdown navigation">
      <input
        type="checkbox"
        id="dropdown-toggle"
        className="dropdown-toggle"
        checked={isOpen}
        onChange={handleToggle}
      />
      <div className="dropdown-square"></div>
      <div className="dropdown-content">
        <ul className="dropdown-list">
          <li className="dropdown-item">
            <a href="/">/home</a>
          </li>
          <li className="dropdown-item">
            <a href="/about">/about</a>
          </li>
          <li className="dropdown-item">
            <a href="/projects">/projects</a>
          </li>
          <li className="dropdown-item">
            <a href="/blog">/blog</a>
          </li>
          <li className="dropdown-item">
            <a href="/photography">/photography</a>
          </li>
          <li className="dropdown-item">
            <a href="/contact">/contact</a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default NavDropdown;
