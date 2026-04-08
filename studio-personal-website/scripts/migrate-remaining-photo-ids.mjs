import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-04-08" });
const ids = ["photo.15", "photo.20210917-dsc-0263"];

for (const id of ids) {
  const photo = await client.getDocument(id);
  if (!photo) {
    console.log(`Missing ${id}`);
    continue;
  }

  const nextId = id.replace("photo.", "photo-");
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
  }

  await client.delete(id);
  console.log(`Deleted ${id}`);
}
