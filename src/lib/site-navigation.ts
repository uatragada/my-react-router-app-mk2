export type NavigationChannel = {
  id: string;
  label: string;
  detail: string;
  to: string;
};

export const primaryNavigationChannels: NavigationChannel[] = [
  { id: "01", label: "Programs", detail: "Project dossiers", to: "/projects" },
  { id: "02", label: "About", detail: "Profile and method", to: "/about" },
  { id: "03", label: "Communications", detail: "Writing and updates", to: "/blog" },
  { id: "04", label: "Photo Archive", detail: "Visual research", to: "/photography" },
  { id: "05", label: "Contact", detail: "External channels", to: "/contact" },
];
