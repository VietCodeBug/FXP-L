export const config = {
  runtime: 'edge',
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
    const res = await fetch(targetUrl);
    
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Upstream API returned " + res.status }), {
        status: res.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const data = await res.text();
    
    return new Response(data, {
      status: 200,
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
