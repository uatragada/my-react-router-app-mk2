import React from "react";

export default function Projects() {
  return (
    <main className="projects-container flex items-center justify-center pt-32 pb-4">
      <div className="flex-1 flex flex-col items-center gap-8 min-h-64">
        <header className="page-header flex flex-col items-center gap-8">
          <div className="w-[800px] max-w-[300vw] p-4">
            <h1>Projects</h1>
          </div>
        </header>
        <section className="projects-content flex flex-col items-center gap-4"></section>
      </div>
    </main>
  );
}
