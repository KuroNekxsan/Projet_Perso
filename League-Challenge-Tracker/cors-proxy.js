/**
 * Zero-dependency local Web Server & CORS Proxy for the Hextech Challenges application.
 * Serves the web app and forwards Riot API requests with CORS headers.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// Static files that can be served, and the only hosts the proxy may call
const PUBLIC_FILES = new Set(['index.html', 'aram.html', 'app.js', 'config.js', 'data-mock.js', 'styles.css']);
const ALLOWED_HOSTS = /^([a-z0-9-]+\.)?api\.riotgames\.com$/;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Add CORS headers to all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Riot-Token, Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Extract target URL from request path
    let targetUrlStr = req.url.startsWith('/') ? req.url.slice(1) : req.url;

    // Handle potential double slash issues or proxy path patterns
    if (targetUrlStr.startsWith('http:/') && !targetUrlStr.startsWith('http://')) {
        targetUrlStr = targetUrlStr.replace('http:/', 'http://');
    } else if (targetUrlStr.startsWith('https:/') && !targetUrlStr.startsWith('https://')) {
        targetUrlStr = targetUrlStr.replace('https:/', 'https://');
    }

    // 1. If request is NOT for proxying external HTTP(S) URL, serve local static web files
    if (!targetUrlStr.startsWith('http://') && !targetUrlStr.startsWith('https://')) {
        let cleanPath = targetUrlStr.split('?')[0];
        if (!cleanPath || cleanPath === '') {
            cleanPath = 'index.html';
        }

        // Only the website files are public (never cors-proxy.js or other files)
        const safePath = path.normalize(cleanPath);
        const filePath = path.join(__dirname, safePath);

        if (PUBLIC_FILES.has(safePath) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            fs.createReadStream(filePath).pipe(res);
            return;
        }

        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 - Not Found');
        return;
    }

    // 2. Otherwise, proxy request to external Riot Games API
    try {
        const targetUrl = new URL(targetUrlStr);

        // Security: only forward requests to the official Riot Games API hosts
        if (targetUrl.protocol !== 'https:' || !ALLOWED_HOSTS.test(targetUrl.hostname)) {
            res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Forbidden: this proxy only forwards requests to api.riotgames.com');
            return;
        }

        // Clean up headers to mimic a server-to-server request and avoid gateway/Cloudflare blocks
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['origin'];
        delete headers['referer'];

        // Remove browser security/metadata headers starting with 'sec-'
        for (const key in headers) {
            if (key.startsWith('sec-')) {
                delete headers[key];
            }
        }

        const options = {
            method: req.method,
            headers: {
                ...headers,
                host: targetUrl.host,
            }
        };

        console.log(`[CORS Proxy] Forwarding: ${req.method} ${targetUrlStr}`);

        const proxyReq = https.request(targetUrl, options, (proxyRes) => {
            console.log(`[CORS Proxy] Status ${proxyRes.statusCode} from ${targetUrl.host}`);

            const headers = { ...proxyRes.headers };
            delete headers['access-control-allow-origin'];
            delete headers['access-control-allow-methods'];
            delete headers['access-control-allow-headers'];

            res.writeHead(proxyRes.statusCode, {
                ...headers,
                'Access-Control-Allow-Origin': '*'
            });

            proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
            console.error(`[CORS Proxy] Error requesting ${targetUrlStr}:`, err);
            res.writeHead(502, { 'Content-Type': 'text/plain' });
            res.end(`CORS Proxy Error: ${err.message}`);
        });

        req.pipe(proxyReq);

    } catch (err) {
        console.error('[CORS Proxy] URL parse error:', err);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end(`CORS Proxy Invalid URL: ${err.message}`);
    }
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`========================================================`);
    console.log(`   Hextech Challenges App & Proxy running at:`);
    console.log(`   --> http://localhost:${PORT}/`);
    console.log(`   ARAM Mode available at:`);
    console.log(`   --> http://localhost:${PORT}/aram.html`);
    console.log(`========================================================`);
});
