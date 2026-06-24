import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import worldMap from "../assets/BlankMap-World.svg";
import { getThemeById, readStoredPortfolioThemeId } from "../lib/themeRegistry";
import {
  capabilityChannels,
  expandSignalTiles,
  formatCount,
  formatFixed,
  formatLatency,
  formatNumber,
  formatRelativeTime,
  getAvailability,
  getLatencyBand,
  getLatencyTone,
  getProgramStatusClass,
  getResponseClass,
  getSignalTileClass,
  getSignalTileStyle,
  getSignalTone,
  getSiteSignal,
  getStationMapStyle,
  getTelemetrySignal,
  isRecent,
  navChannels,
  operationsCardCount,
  projectChannels,
  siteCheckPeriodSeconds,
  station,
  useClock,
  useGithubTelemetry,
  useSiteStatus,
  useWeatherTelemetry,
  type SignalTileData,
} from "../lib/welcomeTelemetry";
import "../styles/welcome.css";

const moduleShaderPresetId = "0fdc4bfb-7d5d-489b-aad1-bf9ecad51d14";
const ModuleShaderPreview = lazy(() =>
  import("shaders/react").then(({ Preview }) => ({ default: Preview })),
);

function ReadoutRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={`readout-row${accent ? " readout-row-accent" : ""}`}>
      <span className="readout-label">{label}</span>
      <span className="readout-leader" aria-hidden="true" />
      <span className="readout-value">{value}</span>
    </div>
  );
}

function ExternalLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a className="external-link" href={href} target="_blank" rel="noreferrer">
      <span>{label}</span>
      <span>OPEN</span>
    </a>
  );
}

function SelectorIndicator() {
  return (
    <span className="selector-bracket" aria-hidden="true">
      <span className="selector-rotor">
        <span>|</span>
        <span>/</span>
        <span>-</span>
        <span>{"\\"}</span>
      </span>
    </span>
  );
}

function ModuleShaderSlot() {
  return (
    <Suspense fallback={<div className="module-shader-fallback" aria-hidden="true" />}>
      <ModuleShaderPreview
        presetId={moduleShaderPresetId}
        watermarkText=""
        className="module-shader-preview"
        aria-hidden="true"
      />
    </Suspense>
  );
}

export function Welcome() {
  const clock = useClock();
  const weather = useWeatherTelemetry();
  const github = useGithubTelemetry();
  const siteStatus = useSiteStatus();
  const [activeThemeId] = useState(() => readStoredPortfolioThemeId());
  const activeTheme = useMemo(() => getThemeById(activeThemeId), [activeThemeId]);
  const [activeOperationsIndex, setActiveOperationsIndex] = useState(0);
  const stationMapStyle = useMemo(() => getStationMapStyle(), []);
  const operationsCards = useMemo(
    () => {
      const weatherSignal = getTelemetrySignal(weather.status);
      const githubSignal = getTelemetrySignal(github.status);
      const siteSignal = getSiteSignal(siteStatus.status);
      const dependencySignals = [weatherSignal, githubSignal, siteSignal];
      const nominalDependencyCount = dependencySignals.filter((signal) => signal === "NOMINAL").length;
      const faultCount = dependencySignals.filter(
        (signal) => signal === "DEGRADED" || signal === "SIGNAL LOST",
      ).length;
      const dataBusStatus =
        faultCount > 0
          ? "DEGRADED"
          : nominalDependencyCount === dependencySignals.length
            ? "STABLE"
            : "ACQUIRING";

      return [
        {
          code: "GIT-01",
          title: "GitHub Activity",
          rows: [
            ["Type", github.eventType],
            ["Repo", github.repoName],
            ["Age", formatRelativeTime(github.eventTime, clock.now)],
            ["Public", github.status === "ready" ? "NOMINAL" : githubSignal],
            ["Commits", formatCount(github.commitsToday)],
            ["Repos 7D", formatCount(github.activeRepos7d)],
            ["Push", formatRelativeTime(github.lastPushAt, clock.now)],
            ["PR", formatRelativeTime(github.lastPullRequestAt, clock.now)],
            ["Rate", github.eventRate],
          ],
          status:
            github.status === "ready"
              ? `Latest public GitHub activity: ${github.latestActivity}. Profile feed is reporting without auth.`
              : "Public GitHub profile telemetry is attempting to establish signal.",
        },
        {
          code: "SITE-02",
          title: "Site Status",
          rows: [
            ["HTTP Status", siteStatus.httpStatus?.toString() ?? "CHECKING"],
            ["Last Check", formatRelativeTime(siteStatus.checkedAt, clock.now)],
            ["Response Class", getResponseClass(siteStatus.httpStatus)],
            ["Latency Band", getLatencyBand(siteStatus.latencyMs)],
            ["Latency", formatLatency(siteStatus.latencyMs)],
            ["Build Target", import.meta.env.MODE.toUpperCase()],
            ["Availability", getAvailability(siteStatus.status)],
            ["Check Period", `${siteCheckPeriodSeconds}S`],
          ],
          status:
            siteStatus.status === "online"
              ? `Site origin is online with ${getLatencyBand(siteStatus.latencyMs).toLowerCase()} response latency.`
              : "The site health check is still resolving or reporting degraded service.",
        },
        {
          code: "SVC-03",
          title: "Service Telemetry",
          rows: [
            ["WX", weatherSignal],
            ["GitHub", githubSignal],
            ["Site", siteSignal],
            ["Bus", dataBusStatus],
            ["Open-Meteo RTT", formatLatency(weather.latencyMs)],
            ["GH RTT", formatLatency(github.latencyMs)],
            ["Origin", formatLatency(siteStatus.latencyMs)],
            ["Deps", `${formatCount(nominalDependencyCount)}/${formatCount(dependencySignals.length)}`],
            ["Faults", formatCount(faultCount)],
          ],
          status:
            dataBusStatus === "STABLE"
              ? "Core public dependencies are reachable and reporting normally."
              : "One or more dependency signals are still acquiring or degraded.",
        },
      ];
    },
    [clock.now, github, siteStatus, weather],
  );
  const signalTiles = useMemo<SignalTileData[]>(() => {
    const weatherSignal = getTelemetrySignal(weather.status);
    const githubSignal = getTelemetrySignal(github.status);
    const siteSignal = getSiteSignal(siteStatus.status);
    const dependencySignals = [weatherSignal, githubSignal, siteSignal];
    const faultCount = dependencySignals.filter(
      (signal) => signal === "DEGRADED" || signal === "SIGNAL LOST",
    ).length;
    const dataBusStatus =
      faultCount > 0
        ? "DEGRADED"
        : dependencySignals.every((signal) => signal === "NOMINAL")
          ? "STABLE"
          : "ACQUIRING";
    const precipitation = weather.precipitation ?? 0;
    const windSpeed = weather.windSpeed ?? 0;
    const cloudCover = weather.cloudCover ?? 0;
    const temperature = weather.temperature;

    const baseTiles: SignalTileData[] = [
      {
        id: "weather-status",
        label: `Weather link ${weatherSignal}`,
        tone: getSignalTone(weatherSignal),
        pulse: weather.status === "ready",
      },
      {
        id: "temperature-band",
        label: `Temperature ${formatNumber(temperature, " F")}`,
        tone: typeof temperature === "number" && temperature < 45 ? "blue" : "nominal",
      },
      {
        id: "wind-band",
        label: `Wind ${formatNumber(weather.windSpeed, " MPH")}`,
        tone: windSpeed >= 25 ? "acquiring" : windSpeed >= 12 ? "active" : "quiet",
        pulse: windSpeed >= 12,
      },
      {
        id: "cloud-cover",
        label: `Cloud cover ${formatNumber(weather.cloudCover, "%")}`,
        tone: cloudCover >= 80 ? "active" : cloudCover >= 40 ? "blue" : "quiet",
      },
      {
        id: "precipitation",
        label: `Precipitation ${formatFixed(weather.precipitation, " IN")}`,
        tone: precipitation > 0 ? "acquiring" : "quiet",
        pulse: precipitation > 0,
      },
      {
        id: "weather-latency",
        label: `Open-Meteo latency ${formatLatency(weather.latencyMs)}`,
        tone: getLatencyTone(weather.latencyMs),
      },
      {
        id: "github-status",
        label: `GitHub API ${githubSignal}`,
        tone: getSignalTone(githubSignal),
        pulse: github.status === "ready",
      },
      {
        id: "github-recency",
        label: `GitHub event age ${formatRelativeTime(github.eventTime, clock.now)}`,
        tone: isRecent(github.eventTime, clock.now, 24) ? "active" : "quiet",
        pulse: isRecent(github.eventTime, clock.now, 2),
      },
      {
        id: "github-commits",
        label: `Commits today ${formatCount(github.commitsToday)}`,
        tone: github.commitsToday > 0 ? "active" : "quiet",
        pulse: github.commitsToday > 0,
      },
      {
        id: "site-status",
        label: `Site probe ${siteSignal}`,
        tone: getSignalTone(siteSignal),
        pulse: siteStatus.status === "online",
      },
      {
        id: "site-latency",
        label: `Site latency ${formatLatency(siteStatus.latencyMs)}`,
        tone: getLatencyTone(siteStatus.latencyMs),
      },
      {
        id: "fault-count",
        label: `Fault count ${formatCount(faultCount)} data bus ${dataBusStatus}`,
        tone: faultCount > 0 ? "degraded" : getSignalTone(dataBusStatus),
        pulse: faultCount > 0,
      },
    ];

    return expandSignalTiles(baseTiles, 64);
  }, [clock.now, github, siteStatus, weather]);
  const activeOperationsCard = operationsCards[activeOperationsIndex % operationsCardCount];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveOperationsIndex((index) => (index + 1) % operationsCardCount);
    }, 5200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="welcome-console">
      <div className="console-frame">
        <header className="console-topbar">
          <Link to="/" className="console-wordmark" aria-label="Uday Atragada home">
            UDAY ATRAGADA
          </Link>
          <div className="console-topbar-center">PERSONAL OPERATIONS INTERFACE / UA-01</div>
        </header>

        <section className="console-grid" aria-label="Landing page operations console">
          <section className="console-cell identity-cell">
            <div className="identity-kicker">
              <span>Personal</span>
              <span>Operations</span>
              <span>Interface</span>
            </div>
            <div className="identity-mark">
              <h1>UA-01</h1>
            </div>
            <div className="identity-meta">
              <ReadoutRow label="Role" value="Software Engineer" />
              <ReadoutRow label="Focus" value="Systems + Optimization" />
              <ReadoutRow label="Mode" value={import.meta.env.MODE.toUpperCase()} accent />
            </div>
          </section>

          <section className="console-cell mission-cell info-cell">
            <div className="cell-heading">Mission Objective</div>
            <p>
              Use technology to learn quickly, understand hard problems, and build
              tools that make useful work easier for people.
            </p>
          </section>

          <section className="console-cell focus-cell info-cell">
            <div className="cell-heading">Capability Index</div>
            <div className="capability-list">
              {capabilityChannels.map(([id, label, detail]) => (
                <div className="capability-channel" key={id}>
                  <span className="capability-code">[{id}]</span>
                  <span className="capability-title">{label}</span>
                  <span className="capability-detail">{detail}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="console-cell mode-cell info-cell">
            <div className="cell-heading">Operations Watch</div>
            <div className="operations-card">
              <div className="operations-card-header">
                <span>{activeOperationsCard.code}</span>
                <span>
                  {(activeOperationsIndex + 1).toString().padStart(2, "0")}/
                  {operationsCardCount.toString().padStart(2, "0")}
                </span>
              </div>
              <div className="operations-card-title">{activeOperationsCard.title}</div>
              <div className="operations-readouts">
                {Array.from(
                  { length: Math.ceil(activeOperationsCard.rows.length / 4) },
                  (_, index) => activeOperationsCard.rows.slice(index * 4, index * 4 + 4),
                ).map((columnRows, columnIndex) => (
                  <div className="operations-readout-column" key={`${activeOperationsCard.code}-${columnIndex}`}>
                    {columnRows.map(([label, value]) => (
                      <ReadoutRow key={label} label={label} value={value} />
                    ))}
                  </div>
                ))}
              </div>
              <p className="operations-status">{activeOperationsCard.status}</p>
            </div>
          </section>

          <section className="console-cell reserved-cell" aria-label="Reserved module bay">
            <div className="cell-heading">TEST-MODULE-00</div>
            <div className="reserved-bay">
              <ModuleShaderSlot />
            </div>
          </section>

          <section className="console-cell telemetry-cell" aria-label="Live station telemetry">
            <div className="cell-heading">Station Telemetry</div>
            <div className="telemetry-stack">
              <ReadoutRow label="Station" value={station.label} />
              <ReadoutRow label="Date" value={clock.stationDate} />
              <ReadoutRow label="Local ET" value={clock.stationTime} accent />
              <ReadoutRow label="UTC" value={clock.utcTime} />
              <ReadoutRow label="Day" value={`T+${clock.dayOfYear}`} />
              <ReadoutRow label="Weather" value={weather.condition} accent={weather.status === "ready"} />
              <ReadoutRow label="Temp" value={formatNumber(weather.temperature, " F")} />
              <ReadoutRow label="Feels" value={formatNumber(weather.apparentTemperature, " F")} />
              <ReadoutRow label="Wind" value={formatNumber(weather.windSpeed, " MPH")} />
              <ReadoutRow label="Vector" value={formatNumber(weather.windDirection, " DEG")} />
              <ReadoutRow label="Cloud" value={formatNumber(weather.cloudCover, "%")} />
              <ReadoutRow label="Rain" value={formatFixed(weather.precipitation, " IN")} />
              <ReadoutRow label="Sunrise" value={weather.sunrise ?? "NO DATA"} />
              <ReadoutRow label="Sunset" value={weather.sunset ?? "NO DATA"} />
              <ReadoutRow label="Observed" value={weather.observedAt ?? weather.condition} />
            </div>
            <div className="telemetry-map" style={stationMapStyle}>
              <img src={worldMap} alt="World map" />
              <span className="telemetry-crosshair" aria-hidden="true">
                <span className="telemetry-crosshair-line telemetry-crosshair-line-x" />
                <span className="telemetry-crosshair-line telemetry-crosshair-line-y" />
                <span className="telemetry-crosshair-point" />
              </span>
            </div>
          </section>

          <section className="console-cell project-cell" aria-label="Active project channels">
            <nav className="directory-uplink" aria-label="Primary navigation">
              <div className="cell-heading">UPLINK DIRECTORY</div>
              <div className="channel-list">
                {navChannels.map((channel) => (
                  <Link key={channel.id} to={channel.to} className="channel-link">
                    <span className="channel-id">{channel.id}</span>
                    <span className="channel-copy">
                      <span>{channel.label}</span>
                      <span>{channel.detail}</span>
                    </span>
                    <span className="channel-action">
                      <SelectorIndicator />
                    </span>
                  </Link>
                ))}
              </div>
            </nav>

            <div className="programs-active cell-heading">ACTIVE PROGRAMS</div>
            <div className="project-channel-list">
              {projectChannels.map(([name, detail, status]) => (
                <div className="project-channel" key={name}>
                  <div>
                    <span>{name}</span>
                    <span>{detail}</span>
                  </div>
                  <span className={getProgramStatusClass(status)}>
                    <span>{status}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="signal-field" aria-label="Abstract live telemetry signal field">
              {signalTiles.map((tile) => (
                <span
                  key={tile.id}
                  className={getSignalTileClass(tile)}
                  style={getSignalTileStyle(tile)}
                  aria-label={tile.label}
                  title={tile.label}
                />
              ))}
            </div>
          </section>

          <section className="console-cell contact-cell" aria-label="External channels">
            <div className="cell-heading">External Links</div>
            <div className="external-link-list">
              <ExternalLink href="https://github.com/uatragada" label="GitHub" />
              <ExternalLink href="https://www.linkedin.com/in/uday-atragada/" label="LinkedIn" />
            </div>
          </section>
        </section>

        <footer className="console-footer">
          <span>WX SOURCE / OPEN-METEO</span>
          <Link className="console-theme-strip-link" to="/theme" aria-label={`Change theme. Current theme ${activeTheme.name}`}>
            <span className="console-theme-strip" aria-hidden="true">
              {activeTheme.colors.map((color) => (
                <span
                  key={`${activeTheme.id}-${color.label}`}
                  className="console-theme-strip-slice"
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </span>
            <span>{activeTheme.code} / {activeTheme.name}</span>
          </Link>
          <span>STATUS / NOMINAL</span>
        </footer>
      </div>
    </main>
  );
}

export default Welcome;
