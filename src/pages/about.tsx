import React from "react";
import DarkModeToggle from "../components/Toggle";


export default function About() {
  return (
    <main className="about-container flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-8 min-h-64">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[800px] max-w-[300vw] p-4">
            <h1>About</h1>
          </div>
        </header>
      </div>
    </main>
  );
}
