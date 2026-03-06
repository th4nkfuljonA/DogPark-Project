/* ============================================================
   DATABASE CONNECTION POOL
   Uses mysql2/promise for async MariaDB access
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
    // MariaDB stores JSON as LONGTEXT, so we parse by field name
    typeCast: function (field, next) {
        if (field.type === 'JSON') {
            const val = field.string();
            return val ? JSON.parse(val) : null;
        }
        // MariaDB: JSON columns stored as LONGTEXT — parse known JSON fields by name
        if (field.name === 'features' && (field.type === 'BLOB' || field.type === 'VAR_STRING' || field.type === 'STRING')) {
            const val = field.string();
            if (!val) return null;
            try { return JSON.parse(val); } catch { return val; }
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
        console.error('  Check your .env file and ensure the MariaDB server is reachable.');
    }
}

module.exports = { pool, testConnection };
