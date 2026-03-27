import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const upstreamOrigin = 'http://35.239.159.234:8000'

const devApiProxyPlugin = () => ({
  name: 'dev-api-proxy',
  configureServer(server) {
    server.middlewares.use('/api/proxy', async (req, res, next) => {
      if (!req.url) {
        next()
        return
      }

      const requestUrl = new URL(req.url, 'http://localhost')
      const targetUrl = requestUrl.searchParams.get('url')

      if (!targetUrl) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: "Missing 'url' query parameter" }))
        return
      }

      try {
        const upstreamResponse = await fetch(targetUrl, {
          method: req.method || 'GET',
          headers: {
            'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        })

        const responseBody = await upstreamResponse.text()

        res.statusCode = upstreamResponse.status
        res.setHeader('Content-Type', upstreamResponse.headers.get('content-type') || 'application/json')
        res.end(responseBody)
      } catch (error) {
        res.statusCode = 502
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: `Proxy Error: ${error.message}` }))
      }
    })
  },
})

export default defineConfig({
  plugins: [react(), tailwindcss(), devApiProxyPlugin()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/dashboard': {
        target: upstreamOrigin,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
})
