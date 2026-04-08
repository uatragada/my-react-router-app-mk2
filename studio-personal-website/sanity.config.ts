import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";

export default defineConfig({
  name: "personal-website",
  title: "Personal Website",
  projectId: "pwlv2v22",
  dataset: "production",
  plugins: [
    structureTool({
      name: "structure",
      title: "Content",
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
