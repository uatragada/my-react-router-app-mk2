import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-04-08" });

const photos = await client.fetch(`
  *[_type == "photo" && _id match "photo.*" && defined(sourceFilename)] {
    ...
  }
`);

console.log(`Found ${photos.length} generated photo documents with private dotted IDs.`);

for (const photo of photos) {
  const nextId = photo._id.replace(/^photo\./, "photo-");
  const existing = await client.getDocument(nextId);

  if (!existing) {
    const nextPhoto = {
      ...photo,
      _id: nextId,
    };

    delete nextPhoto._rev;
    delete nextPhoto._createdAt;
    delete nextPhoto._updatedAt;

    await client.create(nextPhoto);
    console.log(`Created ${nextId}`);
  } else {
    console.log(`Skipping create for ${nextId}; it already exists.`);
  }

  await client.delete(photo._id);
  console.log(`Deleted ${photo._id}`);
}

console.log("Photo ID migration complete.");
