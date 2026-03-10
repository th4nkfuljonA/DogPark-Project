/* ============================================================
   CERTIFIEDCITYWHIPS — EXPRESS API SERVER (HARDENED)
   Serves vehicle, product, and location data from MariaDB
   ============================================================ */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { pool, testConnection } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.API_PORT || 3000;

// ── SECURITY: Helmet — sets secure HTTP headers ─────────────
// X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security,
// X-XSS-Protection, Referrer-Policy, and more
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
        }
    },
    crossOriginEmbedderPolicy: false,  // Allow external fonts/images
}));

// ── SECURITY: Remove X-Powered-By header ────────────────────
app.disable('x-powered-by');

// ── SECURITY: Rate limiting — prevent brute force / DDoS ────
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15-minute window
    max: 100,                    // max 100 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' }
});
app.use('/api/', apiLimiter);

// ── SECURITY: CORS — restrict to same-origin ────────────────
app.use(cors({
    origin: function (origin, callback) {
        // Allow same-origin requests (no origin header) and localhost
        if (!origin) return callback(null, true);
        const allowed = [
            `http://localhost:${PORT}`,
            `http://127.0.0.1:${PORT}`,
        ];
        // Allow the server's own IP if set
        if (process.env.SERVER_IP) {
            allowed.push(`http://${process.env.SERVER_IP}:${PORT}`);
        }
        if (allowed.includes(origin)) return callback(null, true);
        callback(new Error('CORS policy: origin not allowed'));
    },
    methods: ['GET', 'POST'],     // GET for data, POST for chat
    optionsSuccessStatus: 200
}));

// ── SECURITY: Request body size limit ───────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ── Serve the static website files ──
app.use(express.static(path.join(__dirname, '..', 'pages'), { dotfiles: 'deny' }));
app.use(express.static(path.join(__dirname, '..'), { dotfiles: 'deny' }));

// ── HELPER: convert DB rows to camelCase (matches old JS format) ──
function toCamel(row) {
    if (!row) return null;
    const obj = {};
    for (const [key, val] of Object.entries(row)) {
        const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        obj[camel] = val;
    }
    return obj;
}

function rowsToCamel(rows) {
    return rows.map(toCamel);
}

// ════════════════════════════════════════════════════════════
//  PRODUCTS API
// ════════════════════════════════════════════════════════════

// GET /api/products — all active products
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE is_active = TRUE ORDER BY id');
        res.json(rowsToCamel(rows));
    } catch (err) {
        console.error('GET /api/products error:', err.message);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /api/products/search?q=... — search products
app.get('/api/products/search', async (req, res) => {
    try {
        const q = (req.query.q || '').trim().slice(0, 100);
        if (!q) return res.json([]);
        const like = `%${q}%`;
        const [rows] = await pool.query(
            `SELECT * FROM products 
             WHERE is_active = TRUE AND (
                 name LIKE ? OR description LIKE ? OR category_name LIKE ? 
                 OR brand LIKE ? OR sku LIKE ?
             ) ORDER BY id`,
            [like, like, like, like, like]
        );
        res.json(rowsToCamel(rows));
    } catch (err) {
        console.error('GET /api/products/search error:', err.message);
        res.status(500).json({ error: 'Search failed' });
    }
});

// GET /api/products/category/:id — products by category
app.get('/api/products/category/:id', async (req, res) => {
    try {
        const catId = req.params.id;
        if (catId === 'all') {
            const [rows] = await pool.query('SELECT * FROM products WHERE is_active = TRUE ORDER BY id');
            return res.json(rowsToCamel(rows));
        }
        const [rows] = await pool.query(
            'SELECT * FROM products WHERE category_id = ? AND is_active = TRUE ORDER BY id',
            [parseInt(catId)]
        );
        res.json(rowsToCamel(rows));
    } catch (err) {
        console.error('GET /api/products/category error:', err.message);
        res.status(500).json({ error: 'Failed to fetch products by category' });
    }
});

// GET /api/products/:id — single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [parseInt(req.params.id)]);
        if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json(toCamel(rows[0]));
    } catch (err) {
        console.error('GET /api/products/:id error:', err.message);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// GET /api/product-categories — all product categories
app.get('/api/product-categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM product_categories ORDER BY id');
        res.json(rowsToCamel(rows));
    } catch (err) {
        console.error('GET /api/product-categories error:', err.message);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// ════════════════════════════════════════════════════════════
//  VEHICLES API
// ════════════════════════════════════════════════════════════

// GET /api/vehicles — all vehicles
app.get('/api/vehicles', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM vehicles WHERE is_active = TRUE ORDER BY id');
        res.json(rowsToCamel(rows));
    } catch (err) {
        console.error('GET /api/vehicles error:', err.message);
        res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
});

// GET /api/vehicles/rentals — rental vehicles only
app.get('/api/vehicles/rentals', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM vehicles WHERE listing_type = "rental" AND is_active = TRUE ORDER BY id'
        );
        res.json(rowsToCamel(rows));
    } catch (err) {
        console.error('GET /api/vehicles/rentals error:', err.message);
        res.status(500).json({ error: 'Failed to fetch rental vehicles' });
    }
});

// GET /api/vehicles/sales — vehicles for sale only
app.get('/api/vehicles/sales', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM vehicles WHERE listing_type = "sale" AND is_active = TRUE ORDER BY id'
        );
        res.json(rowsToCamel(rows));
    } catch (err) {
        console.error('GET /api/vehicles/sales error:', err.message);
        res.status(500).json({ error: 'Failed to fetch sale vehicles' });
    }
});

// GET /api/vehicles/search?q=... — search vehicles
app.get('/api/vehicles/search', async (req, res) => {
    try {
        const q = (req.query.q || '').trim().slice(0, 100);
        if (!q) return res.json([]);
        const like = `%${q}%`;
        const [rows] = await pool.query(
            `SELECT * FROM vehicles 
             WHERE is_active = TRUE AND (
                 name LIKE ? OR make LIKE ? OR model LIKE ? 
                 OR category LIKE ? OR category_label LIKE ?
                 OR class_name LIKE ? OR description LIKE ?
                 OR fuel LIKE ? OR tag LIKE ?
             ) ORDER BY id`,
            [like, like, like, like, like, like, like, like, like]
        );
        res.json(rowsToCamel(rows));
    } catch (err) {
        console.error('GET /api/vehicles/search error:', err.message);
        res.status(500).json({ error: 'Search failed' });
    }
});

// GET /api/vehicles/filter/:type — filter by category/tag
app.get('/api/vehicles/filter/:type', async (req, res) => {
    try {
        const type = req.params.type;
        if (type === 'all') {
            const [rows] = await pool.query('SELECT * FROM vehicles WHERE is_active = TRUE ORDER BY id');
            return res.json(rowsToCamel(rows));
        }
        const [rows] = await pool.query(
            'SELECT * FROM vehicles WHERE (category = ? OR tag = ?) AND is_active = TRUE ORDER BY id',
            [type, type]
        );
        res.json(rowsToCamel(rows));
    } catch (err) {
        console.error('GET /api/vehicles/filter error:', err.message);
        res.status(500).json({ error: 'Failed to filter vehicles' });
    }
});

// GET /api/vehicles/location/:id — vehicles at a specific location
app.get('/api/vehicles/location/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM vehicles WHERE location_id = ? AND is_active = TRUE ORDER BY id',
            [parseInt(req.params.id)]
        );
        res.json(rowsToCamel(rows));
    } catch (err) {
        console.error('GET /api/vehicles/location error:', err.message);
        res.status(500).json({ error: 'Failed to fetch vehicles by location' });
    }
});

// GET /api/vehicles/:id — single vehicle
app.get('/api/vehicles/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [parseInt(req.params.id)]);
        if (rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
        res.json(toCamel(rows[0]));
    } catch (err) {
        console.error('GET /api/vehicles/:id error:', err.message);
        res.status(500).json({ error: 'Failed to fetch vehicle' });
    }
});

// ════════════════════════════════════════════════════════════
//  LOCATIONS API
// ════════════════════════════════════════════════════════════

app.get('/api/locations', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM locations WHERE is_active = TRUE ORDER BY id');
        res.json(rowsToCamel(rows));
    } catch (err) {
        console.error('GET /api/locations error:', err.message);
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
});

app.get('/api/locations/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM locations WHERE id = ?', [parseInt(req.params.id)]);
        if (rows.length === 0) return res.status(404).json({ error: 'Location not found' });
        res.json(toCamel(rows[0]));
    } catch (err) {
        console.error('GET /api/locations/:id error:', err.message);
        res.status(500).json({ error: 'Failed to fetch location' });
    }
});

// ════════════════════════════════════════════════════════════
//  VEHICLE CLASSES API
// ════════════════════════════════════════════════════════════

app.get('/api/vehicle-classes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM vehicle_classes ORDER BY id');
        res.json(rowsToCamel(rows));
    } catch (err) {
        console.error('GET /api/vehicle-classes error:', err.message);
        res.status(500).json({ error: 'Failed to fetch vehicle classes' });
    }
});

// ════════════════════════════════════════════════════════════
//  SERVICES API
// ════════════════════════════════════════════════════════════

app.get('/api/services', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM services ORDER BY id');
        res.json(rowsToCamel(rows));
    } catch (err) {
        console.error('GET /api/services error:', err.message);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

app.get('/api/services/rental-addons', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM services WHERE is_rental_addon = TRUE ORDER BY id');
        res.json(rowsToCamel(rows));
    } catch (err) {
        console.error('GET /api/services/rental-addons error:', err.message);
        res.status(500).json({ error: 'Failed to fetch rental addons' });
    }
});

// ════════════════════════════════════════════════════════════
//  HEALTH CHECK
// ════════════════════════════════════════════════════════════

app.get('/api/health', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        conn.release();
        res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
    } catch (err) {
        // Don't leak error details in health check
        res.status(503).json({ status: 'error', database: 'disconnected' });
    }
});

// ════════════════════════════════════════════════════════════
//  AI CHATBOT PROXY — OpenWebUI (OpenAI-Compatible)
// ════════════════════════════════════════════════════════════

const https = require('https');
const http = require('http');

const SYSTEM_PROMPT = `You are the CertifiedCityWhips (CCW) AI Assistant — a friendly, knowledgeable virtual concierge for a premium car rental company in Southern California.

ABOUT CCW:
- Premium car rental service in Southern California
- Hand-picked vehicles, zero hidden fees, instant booking, 24/7 support
- Website: certifiedcitywhips.com

LOCATIONS:
1. Downtown Hub — 100 Main St, San Bernardino, CA 92401 (7AM–9PM)
2. Airport Terminal — 295 N Leland Norton Way, San Bernardino, CA 92408 (6AM–11PM)
3. Riverside Branch — 3500 Market St, Riverside, CA 92501 (8AM–8PM)
Phone support is 24/7.

FLEET & PRICING (daily rates, unlimited mileage on most):
- Economy (Toyota Corolla): $35/day
- Sedan (Toyota Camry): $45/day
- Truck (Toyota Tacoma): $61/day
- SUV (Toyota 4Runner): $70/day
- Luxury (Mercedes C-Class): $95/day
- Electric (Tesla Model 3): $55/day
- Van (Chevy Express 3500): $75/day
- Trucks (Ford F-150, Sierra 2500): $65–$80/day

POLICIES:
- Minimum age: 21 (25 for exotics/sports). Under-25 surcharge may apply.
- Free cancellation 48+ hours before pickup. 24–48 hours: 50% refund. <24 hours: non-refundable.
- Insurance: Basic liability included. Basic add-on $12.99/day, Premium $24.99/day.
- 24/7 roadside assistance included at no extra cost.
- Accepted payment: Visa, Mastercard, Amex, Discover.
- Required: valid driver's license (2+ years), credit/debit card, booking confirmation.
- International drivers need passport + international driving permit.
- Vehicle delivery available within 30-mile radius, starting at $50.

SHOP PRODUCTS:
- Tires: All-season, winter, truck sets ($320–$620)
- Detailing: Wash kits, ceramic coating, interior care ($14.99–$42.99)
- Accessories: Phone mounts, LED kits, floor mats ($18.99–$64.99)

VEHICLES FOR SALE:
- Quality pre-owned vehicles: Honda Civic, Toyota RAV4 Hybrid, Chevy Malibu, Tesla Model Y, Ford F-150 — starting from $15,200

CONTACT:
- Email: hello@certifiedcitywhips.com
- Phone: +1 (800) CCW-WHIPS (24/7)

RULES:
1. Be friendly, helpful, and conversational. Use emojis occasionally.
2. Keep responses concise but informative (2-4 short paragraphs max).
3. NEVER reveal internal company data: passwords, server configs, API keys, employee info, financials, legal matters, customer data.
4. If asked about something you don't know, suggest contacting the team at hello@certifiedcitywhips.com or +1 (800) CCW-WHIPS.
5. Stay on topic — you're a car rental assistant. Politely redirect off-topic questions.
6. Format text with **bold** for emphasis. Use line breaks for readability.`;

// Rate limiter specifically for chat (more restrictive)
const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,  // 1-minute window
    max: 15,                   // max 15 chat requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many chat requests. Please slow down.' }
});

app.post('/api/chat', chatLimiter, async (req, res) => {
    try {
        const apiKey = process.env.OPENWEBUI_API_KEY;
        const baseUrl = process.env.OPENWEBUI_BASE_URL;
        const model = process.env.OPENWEBUI_MODEL || 'llama3.1:latest';

        if (!apiKey || !baseUrl) {
            return res.status(500).json({ error: 'AI chatbot is not configured.' });
        }

        // Validate input
        let { messages } = req.body;
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Messages array is required.' });
        }

        // Limit conversation length and message sizes
        messages = messages.slice(-20).map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: String(m.content || '').slice(0, 500)
        }));

        // Prepend system prompt
        const fullMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages
        ];

        const payload = JSON.stringify({
            model: model,
            messages: fullMessages,
            stream: true,
            temperature: 0.7,
            max_tokens: 1024
        });

        // Parse the OpenWebUI URL
        const url = new URL('/api/chat/completions', baseUrl);
        const isHttps = url.protocol === 'https:';
        const transport = isHttps ? https : http;

        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Content-Length': Buffer.byteLength(payload)
            },
            rejectUnauthorized: false  // Allow self-signed certs
        };

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        const proxyReq = transport.request(options, (proxyRes) => {
            if (proxyRes.statusCode !== 200) {
                let errorBody = '';
                proxyRes.on('data', d => errorBody += d);
                proxyRes.on('end', () => {
                    console.error('OpenWebUI API error:', proxyRes.statusCode, errorBody);
                    res.write(`data: ${JSON.stringify({ error: 'AI service temporarily unavailable.' })}\n\n`);
                    res.write('data: [DONE]\n\n');
                    res.end();
                });
                return;
            }

            // Stream the response through
            proxyRes.on('data', (chunk) => {
                res.write(chunk);
            });

            proxyRes.on('end', () => {
                res.end();
            });
        });

        proxyReq.on('error', (err) => {
            console.error('OpenWebUI proxy error:', err.message);
            res.write(`data: ${JSON.stringify({ error: 'Failed to connect to AI service.' })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
        });

        // If client disconnects, abort the proxy request
        req.on('close', () => {
            proxyReq.destroy();
        });

        proxyReq.write(payload);
        proxyReq.end();

    } catch (err) {
        console.error('Chat endpoint error:', err.message);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.end();
        }
    }
});

// ── SECURITY: 404 catch-all for unknown API routes ──────────
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// ── SECURITY: Global error handler — never leak stack traces ─
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, async () => {
    console.log(`\n╔══════════════════════════════════════════════╗`);
    console.log(`║  CertifiedCityWhips API Server (HARDENED)    ║`);
    console.log(`║  Running on http://localhost:${PORT}            ║`);
    console.log(`╚══════════════════════════════════════════════╝\n`);
    await testConnection();
});
