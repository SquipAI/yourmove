import type { APIRoute } from "astro";
import { getOgEntries } from "@lib/og/entries";
import { renderOgPng } from "@lib/og/render";

export const prerender = true;

export async function getStaticPaths() {
  const entries = await getOgEntries();
  return entries.map((e) => ({
    params: { route: e.route },
    props: { title: e.title },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgPng((props as { title: string }).title);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
