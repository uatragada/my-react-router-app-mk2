import { SystemPage, UplinkDirectory } from "../components/system-chrome";
import "../styles/info-console.css";

export default function About() {
  return (
    <SystemPage
      pageClassName="about-page"
      centerLabel="PROFILE BRIEF"
      metaLabel="LIVE ROUTE / PROFILE MODE"
      footerStart="PROFILE / SYSTEM OVERVIEW"
      footerEnd="MODE / PERSONNEL DOSSIER"
    >
      <section className="info-console-grid" aria-label="About page console">
        <article className="info-console-identity">
          <div className="info-console-kicker">
            <span>Profile</span>
            <span>Brief</span>
            <span>About</span>
          </div>
          <div className="info-console-title">
            <span>About</span>
          </div>
          <p className="info-console-summary">
            Systems-minded engineer focused on building practical software, sharpening messy workflows, and turning
            ideas into reliable products.
          </p>
          <div className="info-console-readouts">
            <div>
              <span>Role</span>
              <span>Software Engineer</span>
            </div>
            <div>
              <span>Base</span>
              <span>Scarborough - Maine</span>
            </div>
            <div>
              <span>Focus</span>
              <span>Systems + Product</span>
            </div>
          </div>
        </article>

        <article className="info-console-brief">
          <div className="info-console-panel-heading">Mission Profile</div>
          <p className="info-console-brief-copy">
            I build by reducing ambiguity. The work usually starts with problem framing, moves into architecture, and
            ends with something operational enough to survive real use instead of a neat demo.
          </p>
        </article>

        <aside className="info-console-status">
          <div className="info-console-panel-heading">Operator Status</div>
          <div className="info-console-stat-list">
            <div className="info-console-stat-row">
              <span>Default Mode</span>
              <span>Build + Refine</span>
            </div>
            <div className="info-console-stat-row">
              <span>Bias</span>
              <span>Structure First</span>
            </div>
            <div className="info-console-stat-row">
              <span>Working Surface</span>
              <span>Web + Systems</span>
            </div>
          </div>
        </aside>

        <div className="info-console-navwrap">
          <UplinkDirectory />
          <aside className="info-console-supplemental">
            <div className="info-console-panel-heading">Current Interests</div>
            <div className="info-console-supplemental-list">
              <div>
                <span>AI Systems</span>
                <span>Active</span>
              </div>
              <div>
                <span>Optimization</span>
                <span>Active</span>
              </div>
              <div>
                <span>Interfaces</span>
                <span>Active</span>
              </div>
            </div>
          </aside>
        </div>

        <section className="info-console-main">
          <div className="info-console-panel-heading">Working Pattern</div>
          <ul className="info-console-list">
            <li>
              <strong>Problem framing</strong>
              Start by finding the actual constraint instead of decorating the symptom.
            </li>
            <li>
              <strong>Execution</strong>
              Build clear systems, not just features, so the work holds up under real use.
            </li>
            <li>
              <strong>Iteration</strong>
              Treat each project as a chance to refine process, craft, and judgment.
            </li>
          </ul>

          <div className="info-console-panel-heading">Site Notes</div>
          <div className="info-console-copy">
            <p>
              This site is a working archive. It collects projects, experiments, and ideas I&apos;ve spent real time
              building through.
            </p>
            <p>
              Some work here is polished, some of it is still evolving, but everything on the site reflects something
              I&apos;ve actively explored, tested, or shipped.
            </p>
          </div>
        </section>

        <aside className="info-console-side">
          <div className="info-console-panel-heading">Field Notes</div>
          <div className="info-console-copy">
            <p>
              My default approach is to break a problem down, understand what is really happening underneath, and then
              design something cleaner and more dependable.
            </p>
            <p>
              Outside of programming, I gravitate toward hobbies that reward experimentation. Photography sharpens
              composition, games keep me thinking about systems, and cooking is another way to make something tangible
              through iteration.
            </p>
          </div>

          <div className="info-console-panel-heading">Operating Bias</div>
          <p className="info-console-note">
            Practical systems, clear interfaces, and architecture that makes the next decision easier.
          </p>
        </aside>
      </section>
    </SystemPage>
  );
}
