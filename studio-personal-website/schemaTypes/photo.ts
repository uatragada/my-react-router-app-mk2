import { defineField, defineType } from "sanity";

export const photo = defineType({
  name: "photo",
  title: "Photo",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "sortOrder",
      title: "Sort order",
      type: "number",
    }),
    defineField({
      name: "sourceFilename",
      title: "Source filename",
      type: "string",
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "caption",
      media: "image",
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || "Untitled photo",
        subtitle,
        media,
      };
    },
  },
});
