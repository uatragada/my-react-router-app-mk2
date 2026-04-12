import { useState, type FormEvent } from "react";

import { SystemPage, UplinkDirectory } from "../components/system-chrome";
import "../styles/info-console.css";

type FormStatus = {
  tone: "idle" | "success" | "error";
  message: string;
};

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>({
    tone: "idle",
    message: "Direct server relay. Your message submits without leaving the page.",
  });

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      subject: String(formData.get("subject") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
    };

    setIsSubmitting(true);
    setFormStatus({
      tone: "idle",
      message: "Routing message through the server relay.",
    });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as { error?: string; ok?: boolean } | null;

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error ?? "Message routing failed.");
      }

      form.reset();
      setFormStatus({
        tone: "success",
        message: "Message sent. Thanks for reaching out.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Message routing failed.";
      setFormStatus({
        tone: "error",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SystemPage
      pageClassName="contact-page"
      centerLabel="CONTACT ROUTING / EXTERNAL CHANNELS"
      metaLabel="LIVE ROUTE / UPLINK MODE"
      footerStart="CHANNELS / EXTERNAL ONLY"
      footerEnd="MODE / CONTACT DIRECTORY"
    >
      <section className="info-console-grid" aria-label="Contact page console">
        <article className="info-console-identity">
          <div className="info-console-kicker">
            <span>Communications</span>
            <span>External</span>
            <span>Contact</span>
          </div>
          <div className="info-console-title">
            <span>Contact</span>
          </div>
          <p className="info-console-summary">
            Best for project discussions, collaboration, and general outreach related to the work shown on this site.
          </p>
          <div className="info-console-readouts">
            <div>
              <span>Primary</span>
              <span>LinkedIn</span>
            </div>
            <div>
              <span>Secondary</span>
              <span>GitHub</span>
            </div>
            <div>
              <span>Response</span>
              <span>As Available</span>
            </div>
          </div>
        </article>

        <article className="info-console-brief">
          <div className="info-console-panel-heading">Transmission Policy</div>
          <p className="info-console-brief-copy">
            PRIORITY TRAFFIC ACCEPTED. INCLUDE CLEAR SUBJECT, REPLY CHANNEL, AND MISSION CONTEXT. CONCISE, LEGIBLE
            MESSAGES ROUTE FASTEST.
          </p>
        </article>

        <aside className="info-console-status">
          <div className="info-console-panel-heading">Channel Status</div>
          <div className="info-console-stat-list">
            <div className="info-console-stat-row">
              <span>LinkedIn</span>
              <span>Open</span>
            </div>
            <div className="info-console-stat-row">
              <span>GitHub</span>
              <span>Open</span>
            </div>
            <div className="info-console-stat-row">
              <span>Form Surface</span>
              <span>Server Relay</span>
            </div>
          </div>
        </aside>

        <div className="info-console-navwrap">
          <UplinkDirectory />
          <aside className="info-console-supplemental">
            <div className="info-console-panel-heading">Best Fit</div>
            <div className="info-console-supplemental-list">
              <div>
                <span>Project Inquiry</span>
                <span>Yes</span>
              </div>
              <div>
                <span>Collaboration</span>
                <span>Yes</span>
              </div>
              <div>
                <span>Quick Ping</span>
                <span>Yes</span>
              </div>
            </div>
          </aside>
        </div>

        <section className="info-console-main">
          <section className="info-console-form-section" aria-labelledby="contact-form-heading">
            <div className="info-console-panel-heading" id="contact-form-heading">
              Direct Message Form
            </div>
            <p className="info-console-form-intro">
              Send a project note, collaboration idea, or question here. This route submits directly through the site.
            </p>

            <form className="info-console-form" onSubmit={handleContactSubmit}>
              <div className="info-console-form-grid">
                <label className="info-console-field">
                  <span>Name</span>
                  <input
                    autoComplete="name"
                    className="info-console-input"
                    maxLength={80}
                    name="name"
                    required
                    type="text"
                  />
                </label>

                <label className="info-console-field">
                  <span>Email</span>
                  <input
                    autoComplete="email"
                    className="info-console-input"
                    maxLength={120}
                    name="email"
                    required
                    type="email"
                  />
                </label>

                <label className="info-console-field info-console-field-full">
                  <span>Subject</span>
                  <input
                    className="info-console-input"
                    maxLength={120}
                    name="subject"
                    required
                    type="text"
                  />
                </label>

                <label className="info-console-field info-console-field-full">
                  <span>Message</span>
                  <textarea
                    className="info-console-input info-console-textarea"
                    maxLength={2400}
                    name="message"
                    required
                    rows={7}
                  />
                </label>
              </div>

              <div className="info-console-form-actions">
                <button className="info-console-button" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
                <p
                  aria-atomic="true"
                  aria-live="polite"
                  className={`info-console-form-note info-console-form-note-${formStatus.tone}`}
                  role="status"
                >
                  {formStatus.message}
                </p>
              </div>
            </form>
          </section>

          <div className="info-console-panel-heading">External Channels</div>
          <div className="info-console-link-list">
            <a
              className="info-console-link-item"
              href="https://www.linkedin.com/in/uday-atragada/"
              rel="noreferrer"
              target="_blank"
            >
              <div>
                <strong>LinkedIn</strong>
                Professional profile and the best place for direct outreach.
              </div>
              <span>OPEN</span>
            </a>

            <a
              className="info-console-link-item"
              href="https://github.com/uatragada"
              rel="noreferrer"
              target="_blank"
            >
              <div>
                <strong>GitHub</strong>
                Code, experiments, and active technical work.
              </div>
              <span>OPEN</span>
            </a>
          </div>
        </section>

        <aside className="info-console-side">
          <div className="info-console-panel-heading">Good Reasons To Reach Out</div>
          <ul className="info-console-list">
            <li>
              <strong>Project inquiries</strong>
              Reach out about software builds, product ideas, or systems-focused work.
            </li>
            <li>
              <strong>Collaboration</strong>
              Good fit for technical partnerships, experimentation, and shipping ideas.
            </li>
            <li>
              <strong>General contact</strong>
              If it relates to work on this site, LinkedIn is the best starting point.
            </li>
          </ul>

          <div className="info-console-panel-heading">Routing Note</div>
          <p className="info-console-note">
            The form above routes through the site server. If you prefer direct channels or need to send references,
            LinkedIn remains the cleanest fallback.
          </p>
        </aside>
      </section>
    </SystemPage>
  );
}
