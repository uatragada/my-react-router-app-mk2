import React from "react";
import DarkModeToggle from "../components/Toggle";


export default function About() {
  return (
    <main className="about-container flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-8 min-h-64">
        <header className="about-header flex flex-col items-center gap-8">
          <div className="w-[800px] max-w-[300vw] p-4">
            <h1>About</h1>
          </div>
        </header>
        <section className="about-content flex flex-col items-center gap-4">
          <div className="about-text w-[800px] max-w-[300vw] p-4">
            <p>
              I am recent Computer Science graduate with a passion for solving problems. I have a strong foundation in programming languages such as Python, Java, and C.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
