export const prerender = false;

const ALLOWED_ORIGINS = [
  "https://yourmove.sanity.studio",
  "https://yourmove.damirakyan.workers.dev",
  "https://yourmove.ai",
  "http://localhost:4321",
];

function corsHeaders(origin: string | null): HeadersInit {
  const allowed =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-deploy-secret",
    Vary: "Origin",
  };
}

export const OPTIONS = async ({ request }: { request: Request }) => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
};

export const POST = async ({ request }: { request: Request }) => {
  const headers = corsHeaders(request.headers.get("origin"));

  // Shared-secret auth. CORS only gates whether a *browser* may read the response;
  // it does not stop a raw curl/script from reaching this endpoint and triggering a
  // rebuild. Require a secret header only the Studio deploy plugin sends. Fail closed
  // if the secret isn't configured server-side.
  const secret = import.meta.env.DEPLOY_SECRET;
  if (!secret || request.headers.get("x-deploy-secret") !== secret) {
    return Response.json(
      { ok: false, error: "Unauthorized" },
      { status: 401, headers },
    );
  }

  const hookUrl = import.meta.env.SANITY_DEPLOY_HOOK;
  if (!hookUrl) {
    return Response.json(
      { ok: false, error: "Deploy hook not configured" },
      { status: 500, headers },
    );
  }

  try {
    const res = await fetch(hookUrl, { method: "POST" });
    if (!res.ok) {
      return Response.json(
        { ok: false, error: `HTTP ${res.status}` },
        { status: 502, headers },
      );
    }
    return Response.json({ ok: true }, { headers });
  } catch (err) {
    return Response.json(
      { ok: false, error: String(err) },
      { status: 502, headers },
    );
  }
};
