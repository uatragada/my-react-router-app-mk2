import React from "react";
import "../styles/about.css"; // Import your CSS file

export default function About() {
  return (
    <main className="about-container flex items-center justify-center pt-32 pb-4">
      <div className="flex-1 flex flex-col items-center gap-8 min-h-64">
        <header className="page-header flex flex-col items-center gap-8">
          <div className="w-[800px] max-w-[300vw] p-4">
            <h1>about</h1>
          </div>
        </header>
        <section className="about-content flex flex-col items-center gap-4">
          <div className="about-text w-[800px] max-w-[300vw] p-4">
            <p>
              I’m a Computer Science graduate from the University of Pittsburgh. I like solving problems and building things that actually work.
            </p>
            <br/>
            <p>
              I usually approach problems by breaking them down and figuring out what’s actually going on under the hood. From there it’s just designing something better. I solve problems using web technologies, data analysis, and process development, depending on what the situation calls for.
            </p>
            <br/>
            <p>
              Outside of programming, I like hobbies that let me experiment in a different way. I play video games, take photos, and cook; games let me pick apart systems, photography gets me paying attention to composition, and cooking is a hands-on way to make something real.
            </p>
            <br/>
            <p>
              This site is where I publish my work. It’s a mix of projects, experiments, and things I’m currently building. Some stuff is polished, some isn’t—but everything here is something I’ve actually spent time thinking through and working on.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
