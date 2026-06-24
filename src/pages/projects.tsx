import { ContentRegisterConsole } from "../components/content-register-console";

export default function Projects() {
  return (
    <ContentRegisterConsole
      section="projects"
      copy={{
        pageClassName: "projects-page",
        centerLabel: "PROGRAM REGISTER / DOSSIER INDEX",
        metaLabel: "LIVE ROUTE / VIEWER MODE",
        footerCountLabel: "REGISTER COUNT",
        footerEnd: "MODE / DOSSIER REGISTER",
        gridLabel: "Programs console",
        kicker: ["Technical", "Programs", "Index"],
        title: "Programs",
        summary: "A full-register view for project dossiers, experiments, and deployed systems.",
        countLabel: "Indexed Entries",
        modeLabel: "Current Mode",
        modeValue: "Viewer",
        scopeCopy:
          "Browse the active body of project work as a clean dossier index, then inspect each program in the local viewer without leaving the surface.",
        primaryRoute: "/projects",
        sourceFeed: "Sanity / Projects",
        stateLabel: "Index State",
        registerLabel: "Program register",
        registerMetaLabel: "Program Register",
        loadingMessage: "Synchronizing program index...",
        errorMessage: "Program register unavailable right now.",
        emptyMessage: "No program dossiers are currently published.",
        entryPrefix: "PRG",
        registerFooter: "SELECT A DOSSIER TO LOAD ITS BRIEF INTO THE VIEWER BAY.",
        signalsLabel: "Programs status summary",
        signalsHeading: "Index Signals",
        windowLabel: "Focus Window",
        windowReadySuffix: "entries",
        busLabel: "Viewer Bus",
        busReady: "Locked",
        busLoading: "Syncing",
        featureEmpty: "Featured slots populate from the live project feed.",
        viewerLabel: "Selected program dossier",
        viewerHeading: "Viewer Bay",
        viewerMetaPrefix: "PRG",
        detailErrorMessage: "Selected dossier is unavailable right now.",
        idleMessage: "Select a program entry to open the local brief.",
        selectedLoadingLabel: "Syncing dossier",
        selectedReadyLabel: "Local brief loaded",
        canonicalSectionLabel: "Programs",
        bodyBlocksEmpty: "No data",
        fallbackCopy: "System notes and implementation details are available inside the full dossier.",
        bodyFallback: "Full narrative blocks will appear here once the published dossier includes body copy.",
        plateTitle: "Program Plate",
      }}
    />
  );
}
