export async function onRequestGet() {
  try {
    const res = await fetch("http://35.239.159.234:8000/dashboard");
    
    // Check if the upstream request was successful
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Upstream returned " + res.status }), {
        status: res.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const data = await res.json();
    
    // Return the data directly to the frontend with CORS headers
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch {
    // Return error if fetch to upstream fails (e.g. network timeout)
    return new Response(JSON.stringify({ error: "Failed to connect to upstream API" }), {
      status: 502,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
