import { useMemo, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { getThemeById, readStoredPortfolioThemeId } from "../lib/themeRegistry";
import { primaryNavigationChannels, type NavigationChannel } from "../lib/site-navigation";

type SystemPageProps = {
  centerLabel: string;
  metaLabel: string;
  footerStart: string;
  footerEnd: string;
  children: ReactNode;
  pageClassName?: string;
};

type UplinkDirectoryProps = {
  channels?: NavigationChannel[];
  heading?: string;
};

export function SystemPage({
  centerLabel,
  metaLabel,
  footerStart,
  footerEnd,
  children,
  pageClassName = "",
}: SystemPageProps) {
  const activeTheme = useMemo(() => getThemeById(readStoredPortfolioThemeId()), []);

  return (
    <main className={`system-page ${pageClassName}`.trim()}>
      <div className="system-frame">
        <header className="system-topbar">
          <Link to="/" className="system-wordmark" aria-label="Uday Atragada home">
            UDAY ATRAGADA
          </Link>
          <div className="system-topbar-center">{centerLabel}</div>
          <div className="system-topbar-meta">{metaLabel}</div>
        </header>

        {children}

        <footer className="system-footer">
          <span>{footerStart}</span>
          <Link className="system-theme-link" to="/theme" aria-label={`Change theme. Current theme ${activeTheme.name}`}>
            <span className="system-theme-strip" aria-hidden="true">
              {activeTheme.colors.map((color) => (
                <span
                  key={`${activeTheme.id}-${color.label}`}
                  className="system-theme-slice"
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </span>
            <span>
              {activeTheme.code} / {activeTheme.name}
            </span>
          </Link>
          <span>{footerEnd}</span>
        </footer>
      </div>
    </main>
  );
}

export function UplinkDirectory({ channels = primaryNavigationChannels, heading = "Uplink Directory" }: UplinkDirectoryProps) {
  return (
    <nav className="system-uplink" aria-label={heading}>
      <div className="system-panel-heading">{heading}</div>
      <div className="system-uplink-list">
        {channels.map((channel) => (
          <NavLink
            key={channel.id}
            to={channel.to}
            className={({ isActive }) => `system-channel-link${isActive ? " is-active" : ""}`}
            end={channel.to !== "/"}
          >
            <span className="system-channel-id">{channel.id}</span>
            <span className="system-channel-copy">
              <span>{channel.label}</span>
              <span>{channel.detail}</span>
            </span>
            <SelectorIndicator />
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function SelectorIndicator() {
  return (
    <span className="system-selector-bracket" aria-hidden="true">
      <span className="system-selector-rotor">
        <span>|</span>
        <span>/</span>
        <span>-</span>
        <span>{"\\"}</span>
      </span>
    </span>
  );
}
