/* ============================================================
   DATABASE CONNECTION POOL
   Uses mysql2/promise for async MariaDB/MySQL access
   ============================================================ */

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'ccw_app',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'certifiedcitywhips',

    // Connection pool settings
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    // Parse JSON columns automatically
    typeCast: function (field, next) {
        if (field.type === 'JSON') {
            const val = field.string();
            return val ? JSON.parse(val) : null;
        }
        return next();
    }
});

// Test connection on startup
async function testConnection() {
    try {
        const conn = await pool.getConnection();
        console.log('✓ Connected to MariaDB at', process.env.DB_HOST || 'localhost');
        conn.release();
    } catch (err) {
        console.error('✗ Database connection failed:', err.message);
        console.error('  Check your .env file and ensure the Red Hat server is reachable.');
    }
}

module.exports = { pool, testConnection };
