import nameLogo from "../assets/name-logo.svg";
import React, { useRef, useEffect, useState } from "react";
import DarkModeToggle from "../components/Toggle";
import NavDropdown from "../components/Nav-Dropdown";
import "../styles/welcome.css";

export function Welcome() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [className, setClassName] = useState<string>("theme-dark");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!containerRef.current) return;

    const svgElement = containerRef.current.querySelector("svg"); // Get the <svg> element
    if (!svgElement) return;

    const rect = svgElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Get all paths in the SVG
    const paths = svgElement.querySelectorAll("path");

    paths.forEach((path) => {
      const isHovered = isPointNearPath(x, y, path);
      path.setAttribute("data-hover", isHovered ? "true" : "false");
    });
  };

  const isPointNearPath = (
    x: number,
    y: number,
    path: SVGPathElement
  ): boolean => {
    const point = path.ownerSVGElement?.createSVGPoint();
    if (!point) return false;

    point.x = x;
    point.y = y;

    // Check if the point is near the stroke of the path
    return path.isPointInStroke(point);
  };

  return (
    <main className="welcome-container flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-8 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[800px] max-w-[300vw] p-4">
            <img
              src={nameLogo}
              alt="Uday Atragada"
              className="block w-full dark:invert"
              loading="lazy"
            />
          </div>
        </header>
        <div className="max-w-[400px] w-full space-y-6 px-4 ">
          <nav className="">
            <ul className="flex flex-row gap-12 justify-center items-center">
              {resources.map(({ href, icon }) => (
                <li
                  key={href}
                  className="w-16 h-16 flex items-center justify-center linkIcon"
                >
                  <a
                    className="w-full h-full flex items-center justify-center"
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {icon}
                  </a>
                </li>
              ))}
              <li className="flex items-center justify-center">
                <DarkModeToggle/>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </main>
  );
}

const resources = [
  {
    href: "https://github.com/uatragada",
    text: "Github",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 98 96"
        fill="black"
        width="100%"
        height="100%"
        className="stroke-black fill-black dark:stroke-white dark:fill-white hover-animate"
      >
        <path
          d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
        />
      </svg>
    ),
  },
  {
    href: "https://www.linkedin.com/in/uday-atragada/",
    text: "LinkedIn",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 72 72"
        width="100%"
        height="100%"
        fill="none"
        className="stroke-black fill-black dark:stroke-white dark:fill-white hover-animate"
      >
        <path
          d="M62,62 L51.315625,62 L51.315625,43.8021149 C51.315625,38.8127542 49.4197917,36.0245323 45.4707031,36.0245323 C41.1746094,36.0245323 38.9300781,38.9261103 38.9300781,43.8021149 L38.9300781,62 L28.6333333,62 L28.6333333,27.3333333 L38.9300781,27.3333333 L38.9300781,32.0029283 C38.9300781,32.0029283 42.0260417,26.2742151 49.3825521,26.2742151 C56.7356771,26.2742151 62,30.7644705 62,40.051212 L62,62 Z M16.349349,22.7940133 C12.8420573,22.7940133 10,19.9296567 10,16.3970067 C10,12.8643566 12.8420573,10 16.349349,10 C19.8566406,10 22.6970052,12.8643566 22.6970052,16.3970067 C22.6970052,19.9296567 19.8566406,22.7940133 16.349349,22.7940133 Z M11.0325521,62 L21.769401,62 L21.769401,27.3333333 L11.0325521,27.3333333 L11.0325521,62 Z"
        />
      </svg>
    ),
  }
];
export default Welcome;