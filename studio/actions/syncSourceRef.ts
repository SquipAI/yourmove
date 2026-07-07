import type { DocumentActionComponent } from "sanity";
import { useClient } from "sanity";

const API_VERSION = "2024-06-01";
const SYNCED_TYPES = ["post", "tool"];

/**
 * Wraps the default Publish action for `post`/`tool` documents so ES/DE
 * siblings keep a `sourceRef` pointing at their EN document.
 *
 * `sourceRef` exists purely so `preview.select` can pull the EN title/image
 * for ES/DE docs: the top-level Structure list only supports synchronous
 * schema previews (no custom async components), and the EN<->locale link
 * itself lives on a separate `translation.metadata` document, not a field on
 * post/tool — so `select` has nothing to dot into without this field.
 *
 * Runs both directions: publishing EN pushes its id onto existing siblings
 * (self-heals docs that predate this field), and publishing an ES/DE doc
 * resolves and sets its own `sourceRef` (covers newly created translations).
 */
export function wrapPublishWithSourceRefSync(
  originalPublish: DocumentActionComponent,
): DocumentActionComponent {
  const Wrapped: DocumentActionComponent = (props) => {
    const original = originalPublish(props);
    const client = useClient({ apiVersion: API_VERSION });

    if (!original) return original;
    if (!SYNCED_TYPES.includes(props.type)) return original;

    const lang = (props.draft ?? props.published)?.language as
      | string
      | undefined;
    const id = props.id.replace(/^drafts\./, "");

    return {
      ...original,
      onHandle: async () => {
        original.onHandle?.();

        try {
          if (lang === "en") {
            const siblingIds: string[] = await client.fetch(
              `*[_type == "translation.metadata" && references($id)][0]
                .translations[language != "en"].value._ref`,
              { id },
            );
            const targets = (siblingIds ?? []).filter(Boolean);
            if (targets.length === 0) return;

            const candidates = targets.flatMap((tid) => [tid, `drafts.${tid}`]);
            const existing: string[] = await client.fetch(`*[_id in $ids]._id`, {
              ids: candidates,
            });
            if (existing.length === 0) return;

            let tx = client.transaction();
            for (const tid of existing) {
              tx = tx.patch(tid, (p) =>
                p.set({ sourceRef: { _type: "reference", _ref: id, _weak: true } }),
              );
            }
            await tx.commit({ visibility: "async" });
          } else {
            const enId: string | null = await client.fetch(
              `*[_type == "translation.metadata" && references($id)][0]
                .translations[language == "en"][0].value._ref`,
              { id },
            );
            if (!enId) return;

            const candidates = [id, `drafts.${id}`];
            const existing: string[] = await client.fetch(`*[_id in $ids]._id`, {
              ids: candidates,
            });
            if (existing.length === 0) return;

            let tx = client.transaction();
            for (const cid of existing) {
              tx = tx.patch(cid, (p) =>
                p.set({ sourceRef: { _type: "reference", _ref: enId, _weak: true } }),
              );
            }
            await tx.commit({ visibility: "async" });
          }
        } catch (err) {
          console.error("[syncSourceRef] failed to sync sourceRef", err);
        }
      },
    };
  };

  Wrapped.action = originalPublish.action;
  return Wrapped;
}
