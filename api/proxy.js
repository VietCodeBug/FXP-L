const toReachableUrl = (rawUrl) => {
  try {
    const parsedUrl = new URL(rawUrl);

    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(parsedUrl.hostname)) {
      parsedUrl.hostname = `${parsedUrl.hostname}.sslip.io`;
      return parsedUrl.toString();
    }

    return rawUrl;
  } catch {
    return rawUrl;
  }
};

export default async function handler(req) {
  const urlParams = new URL(req.url);
  const targetUrl = urlParams.searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "Missing 'url' query parameter" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  try {
    const reachableUrl = toReachableUrl(targetUrl);

    // We must pass a standard User-Agent because some APIs (especially Python/FastAPI/Uvicorn or WAFs) 
    // block empty or "node-fetch" User-Agents with a 403 Forbidden.
    const res = await fetch(reachableUrl, {
      method: req.method,
      headers: {
        'User-Agent': req.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    
    // We log the status but we still return it so the frontend can handle it
    const data = await res.text();
    
    return new Response(data, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to connect to upstream API: " + error.message }), {
      status: 502,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
