import React from "react";
import "../styles/about.css"; // Import your CSS file

export default function About() {
  return (
    <main className="about-container flex items-center justify-center pt-32 pb-4">
      <div className="flex-1 flex flex-col items-center gap-8 min-h-64">
        <header className="about-header flex flex-col items-center gap-8">
          <div className="w-[800px] max-w-[300vw] p-4">
            <h1>About</h1>
          </div>
        </header>
        <section className="about-content flex flex-col items-center gap-4">
          <div className="about-text w-[800px] max-w-[300vw] p-4">
            <p>
              I am a Computer Science graduate from the <i>University of Pittsburgh</i> with a passion for solving problems. I have a strong foundation in programming languages such as Python, Java, and C. 
            </p>
            <br/>
            <p>
              The goal of this website is to share my personal projects and just play around with web development. Like a sandbox.
            </p>
            <br/>
            <p>
              Currently the site is a work in progress and there are plenty of features I have yet to implement. It is using React, Tailwind CSS and Vite for the frontend. Have not yet decided on the backend, but it is coming soon as I develop a blog for myself.
            </p>
            <br/>
            <p className = "italic">
              Stay tuned...
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
