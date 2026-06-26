import type { DocumentActionComponent } from "sanity";
import { useClient } from "sanity";

const API_VERSION = "2024-06-01";

/**
 * Wraps the default Publish action for `tool` documents so that publishing the
 * EN variant mirrors its `kind` (page template) onto the ES/DE siblings.
 *
 * `kind` is duplicated on every locale doc — the Studio `hidden` callbacks on
 * the hero/examples groups read `document.kind` synchronously, so each locale
 * needs its own value. It is `readOnly` on non-EN (edit on EN only), but had no
 * auto-sync, so editing it on EN left ES/DE stale in Studio. The frontend
 * already coalesces from EN, so this only fixes the editor-facing drift.
 *
 * Patches both the published sibling and any existing draft. readOnly is a
 * UI-only guard — programmatic patches via the client bypass it.
 */
export function wrapPublishWithKindSync(
  originalPublish: DocumentActionComponent,
): DocumentActionComponent {
  const Wrapped: DocumentActionComponent = (props) => {
    const original = originalPublish(props);
    const client = useClient({ apiVersion: API_VERSION });

    if (!original) return original;

    const lang = (props.draft ?? props.published)?.language;
    if (props.type !== "tool" || lang !== "en") return original;

    const kind = (props.draft ?? props.published)?.kind as string | undefined;
    const enId = props.id.replace(/^drafts\./, "");

    return {
      ...original,
      onHandle: async () => {
        // Run the real publish first.
        original.onHandle?.();

        if (!kind) return;
        try {
          const siblingIds: string[] = await client.fetch(
            `*[_type == "translation.metadata" && references($enId)][0]
              .translations[language != "en"].value._ref`,
            { enId },
          );
          const targets = (siblingIds ?? []).filter(Boolean);
          if (targets.length === 0) return;

          // Patch published + draft, but only ids that actually exist.
          const candidates = targets.flatMap((id) => [id, `drafts.${id}`]);
          const existing: string[] = await client.fetch(
            `*[_id in $ids]._id`,
            { ids: candidates },
          );
          if (existing.length === 0) return;

          let tx = client.transaction();
          for (const id of existing) tx = tx.patch(id, (p) => p.set({ kind }));
          await tx.commit({ visibility: "async" });
        } catch (err) {
          console.error("[syncToolKind] failed to mirror kind to siblings", err);
        }
      },
    };
  };

  // Preserve the original action identifier so Studio still recognises it.
  Wrapped.action = originalPublish.action;
  return Wrapped;
}
