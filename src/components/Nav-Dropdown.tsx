import React, { useEffect, useState } from "react";
import "../styles/nav-dropdown.css";

function NavDropdown() {
  return (
    <div className="dropdown" title="dropdown navigation">
      <input type="checkbox" id="dropdown-toggle" className="dropdown-toggle" />
      <div className="dropdown-square"></div>
      <div className="dropdown-content">
        <ul className="dropdown-list">
          <li className="dropdown-item">
            <a href="#about">About</a>
          </li>
          <li className="dropdown-item">
            <a href="#projects">Projects</a>
          </li>
          <li className="dropdown-item">
            <a href="#contact">Contact</a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default NavDropdown;
