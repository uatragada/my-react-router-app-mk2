import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import worldMap from "../assets/BlankMap-World.svg";
import "../styles/welcome.css";

type WeatherStatus = "loading" | "ready" | "error";

type WeatherTelemetry = {
  status: WeatherStatus;
  condition: string;
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

const station = {
  label: "SCARBOROUGH_STATION",
  latitude: "43.5901",
  longitude: "-70.3345",
  timeZone: "America/New_York",
};

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
  ["IntelliWarm", "Heating optimization control logic", "STDBY"],
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

function formatStationTime(value?: string) {
  if (!value || value.length < 16) {
    return "NO DATA";
  }

  return `${value.slice(11, 16)} ET`;
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
        });
      }
    }

    loadWeather();

    return () => controller.abort();
  }, []);

  return weather;
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

export function Welcome() {
  const clock = useClock();
  const weather = useWeatherTelemetry();
  const stationMapStyle = useMemo(() => getStationMapStyle(), []);

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
            <div className="cell-heading">Control Mode</div>
            <p className="status-copy">
              <span>ALL STATIONS OPERATIONAL. SYSTEMS ARE NOMINAL. NO ANOMALIES DETECTED.</span>
              <span>STANDING BY FOR MISSION SEQUENCE.</span>
            </p>
          </section>

          <section className="console-cell reserved-cell" aria-label="Reserved module bay">
            <div className="cell-heading">Payload Bay</div>
            <div className="reserved-bay">
              <span>MODULE SLOT RESERVED</span>
              <span>AWAITING SPECIAL INSERT</span>
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
                    <span className="channel-action">{channel.action}</span>
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
                  <span>{status}</span>
                </div>
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
          <span>NO TRACKING PROMPT / FIXED STATION READOUT</span>
          <span>STATUS / NOMINAL</span>
        </footer>
      </div>
    </main>
  );
}

export default Welcome;
