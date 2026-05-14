import { defineArrayMember, defineField, defineType } from "sanity";
import { type ComponentType } from "react";
import { LockIcon, DocumentTextIcon } from "@sanity/icons";
import { linkAnnotation, seoMetaFields, standardGroups } from "../shared";

function makeLegalPage(name: string, title: string, icon: ComponentType) {
  return defineType({
    name,
    title,
    type: "document",
    icon,
    __experimental_omnisearch_visibility: false,
    groups: standardGroups,
    fields: [
      defineField({
        name: "h1",
        type: "string",
        title: "Page heading (H1)",
        group: "content",
        validation: (r) => r.required(),
      }),
      defineField({
        name: "body",
        type: "array",
        group: "content",
        of: [
          defineArrayMember({
            type: "block",
            styles: [
              { title: "Normal", value: "normal" },
              { title: "H2", value: "h2" },
              { title: "H3", value: "h3" },
              { title: "H4", value: "h4" },
            ],
            lists: [
              { title: "Bullet", value: "bullet" },
              { title: "Numbered", value: "number" },
            ],
            marks: {
              decorators: [
                { title: "Bold", value: "strong" },
                { title: "Italic", value: "em" },
              ],
              annotations: [linkAnnotation()],
            },
          }),
        ],
      }),
      ...seoMetaFields,
    ],
    preview: {
      select: { title: "h1" },
      prepare: ({ title }) => ({ title: title ?? name }),
    },
  });
}

export const privacy = makeLegalPage("privacy", "Privacy Policy", LockIcon);
export const terms = makeLegalPage("terms", "Terms of Use", DocumentTextIcon);
