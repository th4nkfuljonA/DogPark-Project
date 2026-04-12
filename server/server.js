/* ============================================================
   CERTIFIEDCITYWHIPS — EXPRESS API SERVER
   Serves vehicle, product, location data from MariaDB
   + Auth, Reservations, Orders, Profile
   ============================================================ */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { pool, testConnection } = require('./db');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendOrderConfirmation, sendAdminNotification } = require('./email');

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'pages')));
app.use(express.static(path.join(__dirname, '..')));

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
//  AUTH API
// ════════════════════════════════════════════════════════════

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
        }
        const emailLower = email.toLowerCase().trim();
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [emailLower]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [name.trim(), emailLower, passwordHash]
        );
        console.log(`New user registered: ${emailLower} (ID: ${result.insertId})`);
        res.json({
            success: true,
            user: { userId: result.insertId, name: name.trim(), email: emailLower }
        });
    } catch (err) {
        console.error('POST /api/auth/signup error:', err.message);
        res.status(500).json({ success: false, error: 'Server error. Please try again.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required.' });
        }
        const emailLower = email.toLowerCase().trim();
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [emailLower]);
        if (rows.length === 0) {
            return res.status(401).json({ success: false, error: 'No account found with this email.' });
        }
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
        }
        console.log(`User logged in: ${emailLower} (ID: ${user.id})`);
        res.json({
            success: true,
            user: { userId: user.id, name: user.name, email: user.email }
        });
    } catch (err) {
        console.error('POST /api/auth/login error:', err.message);
        res.status(500).json({ success: false, error: 'Server error. Please try again.' });
    }
});

// ════════════════════════════════════════════════════════════
//  USER PROFILE API
// ════════════════════════════════════════════════════════════

// GET /api/profile/:id — get user profile
app.get('/api/profile/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, name, email, phone, address, city, state, zip, created_at FROM users WHERE id = ?',
            [parseInt(req.params.id)]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(toCamel(rows[0]));
    } catch (err) {
        console.error('GET /api/profile error:', err.message);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /api/profile/:id — update user profile
app.put('/api/profile/:id', async (req, res) => {
    try {
        const { name, phone, address, city, state, zip } = req.body;
        const userId = parseInt(req.params.id);
        await pool.query(
            'UPDATE users SET name = ?, phone = ?, address = ?, city = ?, state = ?, zip = ? WHERE id = ?',
            [name, phone || null, address || null, city || null, state || null, zip || null, userId]
        );
        console.log(`Profile updated for user ID: ${userId}`);
        res.json({ success: true, message: 'Profile updated successfully.' });
    } catch (err) {
        console.error('PUT /api/profile error:', err.message);
        res.status(500).json({ success: false, error: 'Failed to update profile.' });
    }
});

// ════════════════════════════════════════════════════════════
//  RESERVATIONS API
// ════════════════════════════════════════════════════════════

// POST /api/reservations — create a new reservation
app.post('/api/reservations', async (req, res) => {
    try {
        const { userId, vehicleId, pickupLocation, returnLocation, pickupDate, returnDate, dailyRate, totalCost } = req.body;
        if (!userId || !vehicleId || !pickupDate || !returnDate) {
            return res.status(400).json({ success: false, error: 'Missing required reservation fields.' });
        }
        const [result] = await pool.query(
            `INSERT INTO reservations (user_id, vehicle_id, pickup_location, return_location, pickup_date, return_date, daily_rate, total_cost)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, vehicleId, pickupLocation || 1, returnLocation || pickupLocation || 1, pickupDate, returnDate, dailyRate, totalCost]
        );
        console.log(`New reservation #${result.insertId} by user ${userId} for vehicle ${vehicleId}`);

        // Fetch user info for email
        const [userRows] = await pool.query('SELECT email, name FROM users WHERE id = ?', [userId]);
        if (userRows.length > 0) {
            const userObj = userRows[0];
            const baseUrl = req.protocol + '://' + req.get('host');
            sendOrderConfirmation(userObj, result.insertId, 'rental', baseUrl).catch(console.error);
            sendAdminNotification(userObj, result.insertId, 'rental', totalCost).catch(console.error);
        }

        res.json({
            success: true,
            reservationId: result.insertId,
            message: 'Reservation created successfully!'
        });
    } catch (err) {
        console.error('POST /api/reservations error:', err.message);
        res.status(500).json({ success: false, error: 'Failed to create reservation.' });
    }
});

// GET /api/reservations/user/:userId — get all reservations for a user
app.get('/api/reservations/user/:userId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT r.*, v.name AS vehicle_name, v.make, v.model, v.year, v.image_url,
                    lp.name AS pickup_location_name, lr.name AS return_location_name
             FROM reservations r
             JOIN vehicles v ON r.vehicle_id = v.id
             JOIN locations lp ON r.pickup_location = lp.id
             JOIN locations lr ON r.return_location = lr.id
             WHERE r.user_id = ?
             ORDER BY r.created_at DESC`,
            [parseInt(req.params.userId)]
        );
        res.json(rowsToCamel(rows));
    } catch (err) {
        console.error('GET /api/reservations/user error:', err.message);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
});

// PUT /api/reservations/:id/cancel — cancel a reservation
app.put('/api/reservations/:id/cancel', async (req, res) => {
    try {
        await pool.query('UPDATE reservations SET status = "cancelled" WHERE id = ?', [parseInt(req.params.id)]);
        console.log(`Reservation #${req.params.id} cancelled`);
        res.json({ success: true, message: 'Reservation cancelled.' });
    } catch (err) {
        console.error('PUT /api/reservations/cancel error:', err.message);
        res.status(500).json({ success: false, error: 'Failed to cancel reservation.' });
    }
});

// ════════════════════════════════════════════════════════════
//  ORDERS API (product purchases)
// ════════════════════════════════════════════════════════════

// POST /api/orders — create a new order
app.post('/api/orders', async (req, res) => {
    try {
        const { userId, items, totalAmount, shipping } = req.body;
        if (!userId || !items || items.length === 0) {
            return res.status(400).json({ success: false, error: 'Missing required order fields.' });
        }

        // Create the order
        const [orderResult] = await pool.query(
            `INSERT INTO orders (user_id, total_amount, status, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_zip)
             VALUES (?, ?, 'confirmed', ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, totalAmount,
                shipping?.name || null, shipping?.email || null, shipping?.phone || null,
                shipping?.address || null, shipping?.city || null, shipping?.state || null, shipping?.zip || null
            ]
        );

        const orderId = orderResult.insertId;

        // Insert each order item
        for (const item of items) {
            await pool.query(
                `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [orderId, item.productId, item.name, item.quantity, item.unitPrice, item.totalPrice]
            );
        }

        console.log(`New order #${orderId} by user ${userId} — $${totalAmount} — ${items.length} items`);

        // Fetch user info for email
        const [userRows] = await pool.query('SELECT email, name FROM users WHERE id = ?', [userId]);
        if (userRows.length > 0) {
            const userObj = userRows[0];
            const baseUrl = req.protocol + '://' + req.get('host');
            sendOrderConfirmation(userObj, orderId, 'order', baseUrl).catch(console.error);
            sendAdminNotification(userObj, orderId, 'order', totalAmount).catch(console.error);
        }

        res.json({
            success: true,
            orderId: orderId,
            message: 'Order placed successfully!'
        });
    } catch (err) {
        console.error('POST /api/orders error:', err.message);
        res.status(500).json({ success: false, error: 'Failed to place order.' });
    }
});

// GET /api/orders/user/:userId — get all orders for a user
app.get('/api/orders/user/:userId', async (req, res) => {
    try {
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [parseInt(req.params.userId)]
        );

        // Get items for each order
        for (let order of orders) {
            const [items] = await pool.query(
                'SELECT * FROM order_items WHERE order_id = ?',
                [order.id]
            );
            order.items = rowsToCamel(items);
        }

        res.json(rowsToCamel(orders));
    } catch (err) {
        console.error('GET /api/orders/user error:', err.message);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// ════════════════════════════════════════════════════════════
//  PRODUCTS API
// ════════════════════════════════════════════════════════════

app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE is_active = TRUE ORDER BY id');
        res.json(rowsToCamel(rows));
    } catch (err) {
        console.error('GET /api/products error:', err.message);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/api/products/search', async (req, res) => {
    try {
        const q = req.query.q;
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

app.get('/api/vehicles', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM vehicles WHERE is_active = TRUE ORDER BY id');
        res.json(rowsToCamel(rows));
    } catch (err) {
        console.error('GET /api/vehicles error:', err.message);
        res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
});

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

app.get('/api/vehicles/search', async (req, res) => {
    try {
        const q = req.query.q;
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
//  VEHICLE CLASSES & SERVICES API
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
//  STRIPE PAYMENT API
// ════════════════════════════════════════════════════════════

app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid payment amount.' });
        }
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert dollars to cents
            currency: 'usd',
            automatic_payment_methods: { enabled: true }
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error('POST /api/create-payment-intent error:', err.message);
        res.status(500).json({ error: 'Failed to create payment intent.' });
    }
});

// ════════════════════════════════════════════════════════════
//  AI CHATBOT API (Proxy to CSUSB local model)
// ════════════════════════════════════════════════════════════

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages) return res.status(400).json({ error: 'Messages required.' });
        
        const CSUSB_URL = 'https://ai.cyberlab.csusb.edu';
        const API_KEY = process.env.CSUSB_API_KEY || 'sk-eeea0492ff004f6f997d3f42eb90e2f0';
        
        // Temporarily bypass self-signed cert error for the local CSUSB server
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        // 1. Assign the requested model
        const modelId = "gpt-oss:latest";
        
        if (!modelId) {
            return res.status(500).json({ error: 'No AI models available on the CSUSB server.' });
        }

        // 2. Add System Prompt
        const systemPrompt = {
            role: 'system',
            content: 'You are the CCW AI Assistant for CertifiedCityWhips, a premium car rental platform in Southern California (Beverly Hills). Keep responses helpful, concise, and professional.'
        };
        const apiMessages = [systemPrompt, ...messages.filter(m => m.role && m.content)];

        // 3. Request Completion Stream
        const chatRes = await fetch(`${CSUSB_URL}/api/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream'
            },
            body: JSON.stringify({
                model: modelId,
                messages: apiMessages,
                stream: true
            })
        });

        // 4. Stream SSE back to client
        res.writeHead(chatRes.status, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        for await (const chunk of chatRes.body) {
            res.write(chunk);
        }
        res.end();

    } catch (err) {
        console.error('POST /api/chat error:', err.message);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to access AI proxy.' });
        } else {
            res.end();
        }
    }
});

// ════════════════════════════════════════════════════════════
//  HELP DESK & DECEPTION LAYER
// ════════════════════════════════════════════════════════════

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}
const authLogsPath = path.join(dataDir, 'security-logs.json');
const ticketsPath = path.join(dataDir, 'tickets.json');

if (!fs.existsSync(authLogsPath)) fs.writeFileSync(authLogsPath, JSON.stringify([]));
if (!fs.existsSync(ticketsPath)) fs.writeFileSync(ticketsPath, JSON.stringify([]));

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

const logHoneypot = (req, targetPath) => {
    const logs = readJson(authLogsPath);
    logs.push({
        timestamp: new Date().toISOString(),
        path: targetPath,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'Unknown'
    });
    writeJson(authLogsPath, logs);
    console.log(`[SECURITY] Suspicious activity logged on target: ${targetPath}`);
};

// Vanilla HTML frontend for Help Desk
app.get('/help-desk', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'pages', 'help-desk.html'));
});

// Admin UI (Hidden)
app.get('/assets/lib/legacy-v1-metrics', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'pages', 'legacy-v1-metrics.html'));
});

// AI Trap UI
app.get('/system-integrity-log', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'pages', 'system-integrity-log.html'));
});

// Honeypot endpoints
app.get('/config/db_backup.sql.gz', (req, res) => {
    logHoneypot(req, '/config/db_backup.sql.gz');
    res.set('Content-Type', 'application/gzip');
    res.status(200).send(Buffer.from([0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03]));
});

app.get('/api/v1/debug-mode', (req, res) => {
    logHoneypot(req, '/api/v1/debug-mode');
    res.status(200).json({ AWS_ACCESS_KEY: 'AKIAIOSFODNN7EXAMPLE', DB_PASS: 'super_secret123!', ENV_DEBUG: true });
});

app.get('/login.php', (req, res) => {
    logHoneypot(req, '/login.php');
    res.status(200).send('<html><body><form method="POST"><input type="text" name="user"><input type="password" name="pass"><button type="submit">Login</button></form></body></html>');
});

// Help Desk API
app.post('/api/tickets', (req, res) => {
    try {
        const { email, subject, description } = req.body;
        const tickets = readJson(ticketsPath);
        const newId = tickets.length > 0 ? Math.max(...tickets.map(t=>t.id)) + 1 : 1000;
        tickets.push({
            id: newId,
            email, subject, description,
            status: 'Open',
            createdAt: new Date().toISOString()
        });
        writeJson(ticketsPath, tickets);
        res.json({ success: true, ticketId: newId });
    } catch (e) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.get('/api/tickets/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const tickets = readJson(ticketsPath);
        const t = tickets.find(x => x.id === id);
        if (!t) return res.status(404).json({ error: 'Ticket not found' });
        
        // Mock a resolved example ticket if we want, but basically standard
        if (t.status === 'Resolved' && !t.resolutionTime) {
            t.resolutionTime = "24";
        }
        res.json(t);
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin Dashboard API
app.get('/api/admin/metrics', async (req, res) => {
    try {
        // Protect with simple gateway check matching frontend pass "Secur1ty!"
        const authHeader = req.headers.authorization;
        if (!authHeader || authHeader !== 'Bearer Secur1ty!') {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const type = req.query.type;
        if (type === 'logs') {
            const logs = readJson(authLogsPath);
            logs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
            res.json(logs);
        } else if (type === 'orders') {
            const [orders] = await pool.query(`
                SELECT o.id, u.email, o.status, o.total_amount, o.created_at
                FROM orders o
                JOIN users u ON o.user_id = u.id
                ORDER BY o.created_at DESC
                LIMIT 50
            `);
            res.json(orders);
        } else if (type === 'reservations') {
            const [reservations] = await pool.query(`
                SELECT r.id, u.email, r.status, r.total_cost as total_amount, r.created_at
                FROM reservations r
                JOIN users u ON r.user_id = u.id
                ORDER BY r.created_at DESC
                LIMIT 50
            `);
            res.json(reservations);
        } else if (type === 'tickets') {
            const tickets = readJson(ticketsPath);
            tickets.sort((a,b) => b.id - a.id);
            res.json(tickets);
        } else {
            res.status(400).json({ error: 'Invalid type' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
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
        res.status(503).json({ status: 'error', database: 'disconnected', error: err.message });
    }
});

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, async () => {
    console.log(`\n============================================`);
    console.log(`  CertifiedCityWhips API Server`);
    console.log(`  Running on http://localhost:${PORT}`);
    console.log(`============================================\n`);
    await testConnection();
});
