export const prerender = false;

export const POST = async () => {
  const hookUrl = import.meta.env.SANITY_DEPLOY_HOOK;
  if (!hookUrl) {
    return Response.json({ ok: false, error: "Deploy hook not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(hookUrl, { method: "POST" });
    if (!res.ok) {
      return Response.json({ ok: false, error: `HTTP ${res.status}` }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 502 });
  }
};
