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
    methods: ['GET'],            // Only allow GET requests (read-only API)
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
