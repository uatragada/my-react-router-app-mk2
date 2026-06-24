import { ContentRegisterConsole } from "../components/content-register-console";

export default function Blog() {
  return (
    <ContentRegisterConsole
      section="blog"
      copy={{
        pageClassName: "blog-page",
        centerLabel: "COMMUNICATIONS INDEX / TRANSMISSION LOG",
        metaLabel: "LIVE ROUTE / READER MODE",
        footerCountLabel: "ENTRY COUNT",
        footerEnd: "MODE / TRANSMISSION REGISTER",
        gridLabel: "Communications console",
        kicker: ["Field", "Notes", "Index"],
        title: "Communications",
        summary: "Short-form writeups, engineering notes, and public-facing transmissions tied to the work on this site.",
        countLabel: "Published Entries",
        modeLabel: "Current Mode",
        modeValue: "Reader",
        scopeCopy:
          "A live register for writing, update notes, and technical reflections. Select an entry to inspect the brief locally, then open the full post when you want the full thread.",
        primaryRoute: "/blog",
        sourceFeed: "Sanity / Blog",
        stateLabel: "Channel State",
        registerLabel: "Communications register",
        registerMetaLabel: "Transmission Register",
        loadingMessage: "Synchronizing communication log...",
        errorMessage: "Communications are unavailable right now.",
        emptyMessage: "No transmissions are currently published.",
        entryPrefix: "COM",
        registerFooter: "SELECT A TRANSMISSION TO LOAD ITS BRIEF INTO THE READER BAY.",
        signalsLabel: "Communications status summary",
        signalsHeading: "Channel Signals",
        windowLabel: "Open Window",
        windowReadySuffix: "visible",
        busLabel: "Reader Bus",
        busReady: "Locked",
        busLoading: "Syncing",
        featureEmpty: "Featured slots populate from the live blog feed.",
        viewerLabel: "Selected communication dossier",
        viewerHeading: "Reader Bay",
        viewerMetaPrefix: "COM",
        detailErrorMessage: "Selected transmission is unavailable right now.",
        idleMessage: "Select a transmission to open the local brief.",
        selectedLoadingLabel: "Syncing transmission",
        selectedReadyLabel: "Local brief loaded",
        canonicalSectionLabel: "Communications",
        bodyBlocksEmpty: "No data",
        fallbackCopy: "Transmission summary is pending publication in the long-form entry.",
        bodyFallback: "Full narrative blocks will appear here once the published entry includes body copy.",
        plateTitle: "Transmission Plate",
      }}
    />
  );
}
