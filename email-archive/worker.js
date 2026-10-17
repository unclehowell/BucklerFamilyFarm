const REPO_RAW = "https://raw.githubusercontent.com/unclehowell/BucklerFamilyFarm/email-archive/email-archive/";

const FILES = {
  "/": { file: "index.html", type: "text/html; charset=utf-8" },
  "/index.html": { file: "index.html", type: "text/html; charset=utf-8" },
  "/data/threads.json": { file: "data/threads.json", type: "application/json; charset=utf-8" },
  "/robots.txt": { file: "robots.txt", type: "text/plain; charset=utf-8" }
};

function responseHeaders(type, upstreamHeaders) {
  const headers = new Headers(upstreamHeaders || {});
  headers.set("content-type", type);
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  headers.set("content-security-policy", "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'self' https://greathousefarmwiki.wordpress.com https://*.wordpress.com");
  headers.set("cache-control", "public, max-age=30, s-maxage=60");
  return headers;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { "allow": "GET, HEAD", "content-type": "text/plain; charset=utf-8" } });
    }
    if (url.pathname === "/healthz") {
      return Response.json({ ok: true, service: "email-archive", source: "unclehowell/BucklerFamilyFarm@email-archive", mode: "public-read-only" }, {
        headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" }
      });
    }
    let entry = FILES[url.pathname];
    if (!entry && (url.pathname === "/about" || url.pathname.startsWith("/thread/"))) {
      entry = FILES["/"];
    }
    if (!entry) {
      return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8", "x-content-type-options": "nosniff" } });
    }

    try {
      const upstream = await fetch(REPO_RAW + entry.file, {
        headers: { "accept": entry.type.split(";")[0] + ", */*;q=0.8" },
        cf: { cacheTtl: 30, cacheEverything: true }
      });
      if (!upstream.ok) {
        return new Response("The public archive source could not be loaded. Please try again shortly.", {
          status: 502,
          headers: responseHeaders("text/plain; charset=utf-8")
        });
      }
      const headers = responseHeaders(entry.type, upstream.headers);
      return new Response(request.method === "HEAD" ? null : upstream.body, { status: 200, headers });
    } catch (error) {
      return new Response("The public archive is temporarily unavailable. Please try again shortly.", {
        status: 503,
        headers: responseHeaders("text/plain; charset=utf-8")
      });
    }
  }
};