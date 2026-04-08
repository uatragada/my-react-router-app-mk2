import { createReadStream } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-04-08" });
const photosDir = resolve(process.cwd(), "../src/assets/photography");
const extensions = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

function titleFromFilename(filename) {
  return basename(filename, extname(filename))
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function idFromFilename(filename) {
  const slug = basename(filename, extname(filename))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `photo-${slug}`;
}

const files = (await readdir(photosDir))
  .filter((filename) => extensions.has(extname(filename).toLowerCase()))
  .sort((a, b) => a.localeCompare(b));

console.log(`Found ${files.length} photos in ${photosDir}`);

for (const [index, filename] of files.entries()) {
  const documentId = idFromFilename(filename);
  const filePath = join(photosDir, filename);
  const existing = await client.getDocument(documentId);

  if (existing) {
    console.log(`Skipping ${filename}; ${documentId} already exists.`);
    continue;
  }

  const fileInfo = await stat(filePath);
  const title = titleFromFilename(filename);
  console.log(`Uploading ${filename} (${(fileInfo.size / 1024 / 1024).toFixed(2)} MB)...`);

  const asset = await client.assets.upload("image", createReadStream(filePath), {
    filename,
    title,
  });

  await client.create({
    _id: documentId,
    _type: "photo",
    title,
    caption: "",
    sortOrder: index + 1,
    sourceFilename: filename,
    image: {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: asset._id,
      },
      alt: title,
    },
  });

  console.log(`Created ${documentId}`);
}

console.log("Photo import complete.");
