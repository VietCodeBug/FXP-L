const UPSTREAM_URL = 'http://35.239.159.234.sslip.io:8000/dashboard';

export default async function handler(req) {
  try {
    const res = await fetch(UPSTREAM_URL, {
      method: 'GET',
      headers: {
        'User-Agent': req.headers.get('user-agent') || 'Mozilla/5.0',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const body = await res.text();

    return new Response(body, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: `Failed to connect to upstream API: ${error.message}`,
    }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
