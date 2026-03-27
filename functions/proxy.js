export async function onRequestGet(context) {
  // Get the 'url' query parameter from the request
  const requestUrl = new URL(context.request.url);
  const targetUrl = requestUrl.searchParams.get('url');

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
    
    // Check if the upstream request was successful
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
    
    // Return the data directly to the frontend with CORS headers
    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    // Return error if fetch to upstream fails (e.g., network timeout or invalid URL)
    return new Response(JSON.stringify({ error: "Failed to connect to upstream API: " + error.message }), {
      status: 502,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
