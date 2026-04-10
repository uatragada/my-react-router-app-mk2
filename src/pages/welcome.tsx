import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import worldMap from "../assets/BlankMap-World.svg";
import { getThemeById, readStoredPortfolioThemeId } from "../lib/themeRegistry";
import "../styles/welcome.css";

type WeatherStatus = "loading" | "ready" | "error";

type WeatherTelemetry = {
  status: WeatherStatus;
  condition: string;
  latencyMs?: number;
  temperature?: number;
  apparentTemperature?: number;
  windSpeed?: number;
  windDirection?: number;
  cloudCover?: number;
  precipitation?: number;
  observedAt?: string;
  sunrise?: string;
  sunset?: string;
};

type OpenMeteoResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    precipitation?: number;
    weather_code?: number;
    cloud_cover?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
  };
  daily?: {
    sunrise?: string[];
    sunset?: string[];
  };
};

type GithubTelemetryStatus = "loading" | "ready" | "error";

type GithubPublicEvent = {
  type?: string;
  created_at?: string;
  repo?: {
    name?: string;
  };
  payload?: {
    action?: string;
    ref?: string;
    ref_type?: string;
    commits?: {
      sha?: string;
      message?: string;
    }[];
    pull_request?: {
      title?: string;
    };
    issue?: {
      title?: string;
    };
  };
};

type GithubPublicEventsResponse = GithubPublicEvent[];

type GithubTelemetry = {
  status: GithubTelemetryStatus;
  latestActivity: string;
  repoName: string;
  eventType: string;
  eventTime?: string;
  commitsToday: number;
  activeRepos7d: number;
  lastPushAt?: string;
  lastPullRequestAt?: string;
  lastIssueAt?: string;
  eventRate: string;
  latencyMs?: number;
};

type SiteStatus = {
  status: "loading" | "online" | "degraded";
  httpStatus?: number;
  latencyMs?: number;
  checkedAt?: string;
};

type SignalTileTone = "nominal" | "active" | "acquiring" | "degraded" | "quiet" | "blue";

type SignalTileData = {
  id: string;
  label: string;
  tone: SignalTileTone;
  pulse?: boolean;
  delaySeconds?: number;
  durationSeconds?: number;
};

type SignalTileStyle = CSSProperties & {
  "--signal-delay": string;
  "--signal-duration": string;
};

const station = {
  label: "SCARBOROUGH_ME",
  latitude: "43.5901",
  longitude: "-70.3345",
  timeZone: "America/New_York",
};

const githubProfile = {
  username: "uatragada",
};

const operationsCardCount = 3;
const siteCheckPeriodSeconds = 60;

type StationMapStyle = CSSProperties & {
  "--station-x": string;
  "--station-y": string;
};

const robinsonProjectionTable = [
  { latitude: 0, x: 1, y: 0 },
  { latitude: 5, x: 0.9986, y: 0.062 },
  { latitude: 10, x: 0.9954, y: 0.124 },
  { latitude: 15, x: 0.99, y: 0.186 },
  { latitude: 20, x: 0.9822, y: 0.248 },
  { latitude: 25, x: 0.973, y: 0.31 },
  { latitude: 30, x: 0.96, y: 0.372 },
  { latitude: 35, x: 0.9427, y: 0.434 },
  { latitude: 40, x: 0.9216, y: 0.4958 },
  { latitude: 45, x: 0.8962, y: 0.5571 },
  { latitude: 50, x: 0.8679, y: 0.6176 },
  { latitude: 55, x: 0.835, y: 0.6769 },
  { latitude: 60, x: 0.7986, y: 0.7346 },
  { latitude: 65, x: 0.7597, y: 0.7903 },
  { latitude: 70, x: 0.7186, y: 0.8435 },
  { latitude: 75, x: 0.6732, y: 0.8936 },
  { latitude: 80, x: 0.6213, y: 0.9394 },
  { latitude: 85, x: 0.5722, y: 0.9761 },
  { latitude: 90, x: 0.5322, y: 1 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function interpolateRobinson(latitude: number) {
  const absoluteLatitude = Math.abs(latitude);
  const lowerIndex = Math.min(
    Math.floor(absoluteLatitude / 5),
    robinsonProjectionTable.length - 2,
  );
  const lower = robinsonProjectionTable[lowerIndex];
  const upper = robinsonProjectionTable[lowerIndex + 1];
  const progress = (absoluteLatitude - lower.latitude) / (upper.latitude - lower.latitude);

  return {
    x: lower.x + (upper.x - lower.x) * progress,
    y: lower.y + (upper.y - lower.y) * progress,
  };
}

function getStationMapStyle(): StationMapStyle {
  const latitude = clamp(Number(station.latitude), -90, 90);
  const longitude = clamp(Number(station.longitude), -180, 180);
  const projection = interpolateRobinson(latitude);
  const x = ((longitude + 180) / 360) * 100;
  const y = 50 - Math.sign(latitude) * projection.y * 50;

  return {
    "--station-x": `${clamp(x, 0, 100)}%`,
    "--station-y": `${clamp(y, 0, 100)}%`,
  };
}

const navChannels = [
  { id: "01", label: "Programs", detail: "Select projects", to: "/projects", action: "VIEW" },
  { id: "02", label: "About", detail: "Profile and method", to: "/about", action: "READ" },
  { id: "03", label: "Communications", detail: "Writing and updates", to: "/blog", action: "OPEN" },
  { id: "04", label: "Photo Archive", detail: "Image studies", to: "/photography", action: "SCAN" },
  { id: "05", label: "Contact", detail: "External channels", to: "/contact", action: "LINK" },
];

const projectChannels = [
  ["MindWeaver", "Source-backed learning system", "LIVE"],
  ["IntelliWarm", "Heating optimization control logic", "LAB"],
  ["AI Pong", "Simulation and agent self-play", "LAB"],
];

const capabilityChannels = [
  ["01", "System Architecture", "Scalable modular systems from first principles"],
  ["02", "AI Pipeline Design", "Hybrid LLM and deterministic system integration"],
  ["03", "Optimization Systems", "Constraint-based decision engines"],
  ["04", "Simulation Engineering", "Physics-based and agent-driven environments"],
  ["05", "Full-Stack Integration", "Frontend, backend, and infrastructure cohesion"],
];

const stationFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: station.timeZone,
});

const utcFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "2-digit",
  year: "numeric",
  timeZone: station.timeZone,
});

const weatherCodeLabels: Record<number, string> = {
  0: "CLEAR",
  1: "MOSTLY CLEAR",
  2: "PART CLOUD",
  3: "OVERCAST",
  45: "FOG",
  48: "RIME FOG",
  51: "LIGHT DRIZZLE",
  53: "DRIZZLE",
  55: "DENSE DRIZZLE",
  56: "FREEZE DRIZZLE",
  57: "FREEZE DRIZZLE",
  61: "LIGHT RAIN",
  63: "RAIN",
  65: "HEAVY RAIN",
  66: "FREEZE RAIN",
  67: "FREEZE RAIN",
  71: "LIGHT SNOW",
  73: "SNOW",
  75: "HEAVY SNOW",
  77: "SNOW GRAINS",
  80: "RAIN SHOWERS",
  81: "RAIN SHOWERS",
  82: "HEAVY SHOWERS",
  85: "SNOW SHOWERS",
  86: "SNOW SHOWERS",
  95: "THUNDERSTORM",
  96: "STORM HAIL",
  99: "STORM HAIL",
};

function buildWeatherUrl() {
  const params = new URLSearchParams({
    latitude: station.latitude,
    longitude: station.longitude,
    current:
      "temperature_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m",
    daily: "sunrise,sunset",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    timezone: station.timeZone,
    forecast_days: "1",
  });

  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

function formatNumber(value?: number, suffix = "") {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "NO DATA";
  }

  return `${Math.round(value)}${suffix}`;
}

function formatFixed(value?: number, suffix = "") {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "NO DATA";
  }

  return `${value.toFixed(2)}${suffix}`;
}

function formatCount(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "NO DATA";
  }

  return value.toString().padStart(2, "0");
}

function formatLatency(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "NO DATA";
  }

  return `${Math.round(value)}MS`;
}

function formatStationTime(value?: string) {
  if (!value || value.length < 16) {
    return "NO DATA";
  }

  return `${value.slice(11, 16)} ET`;
}

function formatRelativeTime(value: string | undefined, now: Date) {
  if (!value) {
    return "NO DATA";
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "NO DATA";
  }

  const seconds = Math.max(0, Math.floor((now.getTime() - timestamp) / 1000));
  const units = [
    ["Y", 31536000],
    ["D", 86400],
    ["H", 3600],
    ["M", 60],
  ] as const;

  for (const [unit, size] of units) {
    if (seconds >= size) {
      return `${Math.floor(seconds / size)}${unit} AGO`;
    }
  }

  return "JUST NOW";
}

function getFirstLine(value?: string) {
  return value?.split("\n")[0].trim() || "NO DATA";
}

function normalizeGithubEventType(type?: string) {
  return type?.replace(/Event$/, "").replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase() || "NO EVENT";
}

function getEventTime(event?: GithubPublicEvent) {
  return event?.created_at;
}

function isSameLocalDay(value: string | undefined, date: Date) {
  if (!value) {
    return false;
  }

  return new Date(value).toDateString() === date.toDateString();
}

function isWithinDays(value: string | undefined, days: number, now: Date) {
  if (!value) {
    return false;
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return false;
  }

  return now.getTime() - timestamp <= days * 86400000;
}

function getResponseClass(status?: number) {
  if (typeof status !== "number") {
    return "NO DATA";
  }

  return `${Math.floor(status / 100)}XX`;
}

function getAvailability(status: SiteStatus["status"]) {
  if (status === "online") {
    return "ONLINE";
  }

  if (status === "loading") {
    return "CHECKING";
  }

  return "DEGRADED";
}

function getLatencyBand(latencyMs?: number) {
  if (typeof latencyMs !== "number" || Number.isNaN(latencyMs)) {
    return "NO DATA";
  }

  if (latencyMs <= 250) {
    return "NOMINAL";
  }

  if (latencyMs <= 800) {
    return "SLOW";
  }

  return "DEGRADED";
}

function getLatencyTone(latencyMs?: number): SignalTileTone {
  const latencyBand = getLatencyBand(latencyMs);

  if (latencyBand === "NOMINAL") {
    return "nominal";
  }

  if (latencyBand === "SLOW") {
    return "acquiring";
  }

  if (latencyBand === "DEGRADED") {
    return "degraded";
  }

  return "quiet";
}

function getSignalTone(signal: string): SignalTileTone {
  if (signal === "NOMINAL" || signal === "STABLE" || signal === "ONLINE") {
    return "nominal";
  }

  if (signal === "ACTIVE") {
    return "active";
  }

  if (signal === "ACQUIRING" || signal === "CHECKING" || signal === "SLOW") {
    return "acquiring";
  }

  if (signal === "DEGRADED" || signal === "SIGNAL LOST") {
    return "degraded";
  }

  return "quiet";
}

function getTelemetrySignal(status: "loading" | "ready" | "error") {
  if (status === "ready") {
    return "NOMINAL";
  }

  if (status === "loading") {
    return "ACQUIRING";
  }

  return "SIGNAL LOST";
}

function getSiteSignal(status: SiteStatus["status"]) {
  if (status === "online") {
    return "NOMINAL";
  }

  if (status === "loading") {
    return "ACQUIRING";
  }

  return "DEGRADED";
}

function isRecent(value: string | undefined, now: Date, hours: number) {
  if (!value) {
    return false;
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return false;
  }

  return now.getTime() - timestamp <= hours * 3600000;
}

function getSignalTileClass(tile: SignalTileData) {
  return `signal-tile signal-${tile.tone}${tile.tone !== "quiet" && tile.pulse ? " signal-pulse" : ""}`;
}

function getSignalTileStyle(tile: SignalTileData): SignalTileStyle {
  return {
    "--signal-delay": `${tile.delaySeconds ?? 0}s`,
    "--signal-duration": `${tile.durationSeconds ?? 8}s`,
  };
}

function expandSignalTiles(baseTiles: SignalTileData[], totalCount: number) {
  return Array.from({ length: totalCount }, (_, index) => {
    const source = baseTiles[index % baseTiles.length];
    const quietMask = source.tone !== "degraded" && index % 11 === 0;
    const tone = quietMask ? "quiet" : source.tone;

    return {
      ...source,
      id: `${source.id}-${index.toString().padStart(2, "0")}`,
      label: `${source.label} channel ${index.toString().padStart(2, "0")}`,
      tone,
      pulse: tone !== "quiet",
      delaySeconds: -1 * ((index * 0.73) % 9),
      durationSeconds: tone === "degraded" ? 4.8 : 7 + (index % 7) * 0.65,
    };
  });
}

function describeGithubEvent(event: GithubPublicEvent) {
  const payload = event.payload;

  switch (event.type) {
    case "PushEvent":
      return getFirstLine(payload?.commits?.[payload.commits.length - 1]?.message);
    case "PullRequestEvent":
      return `${payload?.action?.toUpperCase() ?? "PR"}: ${getFirstLine(payload?.pull_request?.title)}`;
    case "IssuesEvent":
      return `${payload?.action?.toUpperCase() ?? "ISSUE"}: ${getFirstLine(payload?.issue?.title)}`;
    case "CreateEvent":
      return `CREATED ${payload?.ref_type?.toUpperCase() ?? "REF"} ${payload?.ref ?? ""}`.trim();
    case "DeleteEvent":
      return `DELETED ${payload?.ref_type?.toUpperCase() ?? "REF"} ${payload?.ref ?? ""}`.trim();
    default:
      return normalizeGithubEventType(event.type);
  }
}

function summarizeGithubEvents(events: GithubPublicEventsResponse, latencyMs: number): GithubTelemetry {
  const now = new Date();
  const latestEvent = events[0];
  const lastPushEvent = events.find((event) => event.type === "PushEvent");
  const lastPullRequestEvent = events.find((event) => event.type === "PullRequestEvent");
  const lastIssueEvent = events.find((event) => event.type === "IssuesEvent");
  const events7d = events.filter((event) => isWithinDays(event.created_at, 7, now));
  const activeRepos7d = new Set(
    events7d.map((event) => event.repo?.name).filter((name): name is string => Boolean(name)),
  ).size;
  const commitsToday = events.reduce((total, event) => {
    if (event.type !== "PushEvent" || !isSameLocalDay(event.created_at, now)) {
      return total;
    }

    return total + (event.payload?.commits?.length ?? 0);
  }, 0);

  return {
    status: "ready",
    latestActivity: describeGithubEvent(latestEvent),
    repoName: latestEvent.repo?.name ?? "NO REPO",
    eventType: normalizeGithubEventType(latestEvent.type),
    eventTime: latestEvent.created_at,
    commitsToday,
    activeRepos7d,
    lastPushAt: getEventTime(lastPushEvent),
    lastPullRequestAt: getEventTime(lastPullRequestEvent),
    lastIssueAt: getEventTime(lastIssueEvent),
    eventRate: events7d.length >= 3 ? "ACTIVE" : events7d.length > 0 ? "QUIET" : "IDLE",
    latencyMs,
  };
}

function getProgramStatusClass(status: string) {
  return `project-status project-status-${status.toLowerCase()}`;
}

function getWeatherLabel(code?: number) {
  if (typeof code !== "number") {
    return "NO SIGNAL";
  }

  return weatherCodeLabels[code] ?? `CODE ${code}`;
}

function getDayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return useMemo(
    () => ({
      now,
      stationTime: stationFormatter.format(now),
      utcTime: utcFormatter.format(now),
      stationDate: dateFormatter.format(now),
      dayOfYear: getDayOfYear(now).toString().padStart(3, "0"),
    }),
    [now]
  );
}

function useWeatherTelemetry() {
  const [weather, setWeather] = useState<WeatherTelemetry>({
    status: "loading",
    condition: "ACQUIRING",
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadWeather() {
      const startedAt = performance.now();

      try {
        const response = await fetch(buildWeatherUrl(), {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Weather telemetry request failed.");
        }

        const data = (await response.json()) as OpenMeteoResponse;
        const current = data.current;

        if (!current) {
          throw new Error("Weather telemetry missing current conditions.");
        }

        setWeather({
          status: "ready",
          condition: getWeatherLabel(current.weather_code),
          latencyMs: Math.round(performance.now() - startedAt),
          temperature: current.temperature_2m,
          apparentTemperature: current.apparent_temperature,
          windSpeed: current.wind_speed_10m,
          windDirection: current.wind_direction_10m,
          cloudCover: current.cloud_cover,
          precipitation: current.precipitation,
          observedAt: formatStationTime(current.time),
          sunrise: formatStationTime(data.daily?.sunrise?.[0]),
          sunset: formatStationTime(data.daily?.sunset?.[0]),
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Failed to load weather telemetry", error);
        setWeather({
          status: "error",
          condition: "SIGNAL LOST",
          latencyMs: Math.round(performance.now() - startedAt),
        });
      }
    }

    loadWeather();
    const interval = window.setInterval(loadWeather, 300000);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  return weather;
}

function buildGithubActivityUrl() {
  return `https://api.github.com/users/${githubProfile.username}/events/public?per_page=30`;
}

function useGithubTelemetry() {
  const [github, setGithub] = useState<GithubTelemetry>({
    status: "loading",
    latestActivity: "ACQUIRING",
    repoName: "PROFILE FEED",
    eventType: "PENDING",
    commitsToday: 0,
    activeRepos7d: 0,
    eventRate: "ACQUIRING",
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadGithubTelemetry() {
      const startedAt = performance.now();

      try {
        const response = await fetch(buildGithubActivityUrl(), {
          headers: {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("GitHub telemetry request failed.");
        }

        const events = (await response.json()) as GithubPublicEventsResponse;
        const [latestEvent] = events;

        if (!latestEvent) {
          throw new Error("GitHub telemetry returned no public events.");
        }

        setGithub(summarizeGithubEvents(events, Math.round(performance.now() - startedAt)));
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Failed to load GitHub telemetry", error);
        setGithub({
          status: "error",
          latestActivity: "SIGNAL LOST",
          repoName: "NO DATA",
          eventType: "NO SIGNAL",
          commitsToday: 0,
          activeRepos7d: 0,
          eventRate: "NO SIGNAL",
          latencyMs: Math.round(performance.now() - startedAt),
        });
      }
    }

    loadGithubTelemetry();
    const interval = window.setInterval(loadGithubTelemetry, 300000);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  return github;
}

function useSiteStatus() {
  const [siteStatus, setSiteStatus] = useState<SiteStatus>({
    status: "loading",
  });

  useEffect(() => {
    const controller = new AbortController();

    async function checkSiteStatus() {
      const startedAt = performance.now();

      try {
        const response = await fetch(window.location.origin, {
          method: "HEAD",
          cache: "no-store",
          signal: controller.signal,
        });

        setSiteStatus({
          status: response.ok ? "online" : "degraded",
          httpStatus: response.status,
          latencyMs: Math.round(performance.now() - startedAt),
          checkedAt: new Date().toISOString(),
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Failed to load site status", error);
        setSiteStatus({
          status: "degraded",
          latencyMs: Math.round(performance.now() - startedAt),
          checkedAt: new Date().toISOString(),
        });
      }
    }

    checkSiteStatus();
    const interval = window.setInterval(checkSiteStatus, siteCheckPeriodSeconds * 1000);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  return siteStatus;
}

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
            ["Event Type", github.eventType],
            ["Repository", github.repoName],
            ["Event Age", formatRelativeTime(github.eventTime, clock.now)],
            ["Public Activity", github.status === "ready" ? "NOMINAL" : githubSignal],
            ["Commits Today", formatCount(github.commitsToday)],
            ["Active Repos 7D", formatCount(github.activeRepos7d)],
            ["Last Push", formatRelativeTime(github.lastPushAt, clock.now)],
            ["Last PR", formatRelativeTime(github.lastPullRequestAt, clock.now)],
            ["Last Issue", formatRelativeTime(github.lastIssueAt, clock.now)],
            ["Event Rate", github.eventRate],
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
            ["Latency", formatLatency(siteStatus.latencyMs)],
            ["Last Check", formatRelativeTime(siteStatus.checkedAt, clock.now)],
            ["Build Target", import.meta.env.MODE.toUpperCase()],
            ["Response Class", getResponseClass(siteStatus.httpStatus)],
            ["Availability", getAvailability(siteStatus.status)],
            ["Latency Band", getLatencyBand(siteStatus.latencyMs)],
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
            ["Weather Link", weatherSignal],
            ["GitHub API", githubSignal],
            ["Site Probe", siteSignal],
            ["Data Bus", dataBusStatus],
            ["Open-Meteo RTT", formatLatency(weather.latencyMs)],
            ["GitHub RTT", formatLatency(github.latencyMs)],
            ["Site Origin", formatLatency(siteStatus.latencyMs)],
            ["Dependency Count", `${formatCount(nominalDependencyCount)}/${formatCount(dependencySignals.length)}`],
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
              I build technical products and interfaces that turn messy systems into
              something structured, usable, and operational.
            </p>
          </section>

          <section className="console-cell focus-cell info-cell">
            <div className="cell-heading">Capability Index</div>
            <div className="capability-list">
              {capabilityChannels.map(([id, label, detail]) => (
                <div className="capability-channel" key={id}>
                  <span>[{id}]</span>
                  <span>{label}</span>
                  <span>{detail}</span>
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
                {activeOperationsCard.rows.map(([label, value]) => (
                  <ReadoutRow key={label} label={label} value={value} />
                ))}
              </div>
              <p className="operations-status">{activeOperationsCard.status}</p>
            </div>
          </section>

          <section className="console-cell reserved-cell" aria-label="Reserved module bay">
            <div className="cell-heading">TEST-MODULE-00</div>
            <div className="reserved-bay">
              <span>MODULE SLOT RESERVED</span>
              <span>AWAITING FURTHER DEVELOPMENT</span>
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
