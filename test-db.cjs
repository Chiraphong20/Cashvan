const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'WH_logistic',
            port: parseInt(process.env.DB_PORT || '3306')
        });

        console.log("Testing connection...");
        const [rows] = await pool.query("SELECT 1 as test");
        console.log("Connection successful:", rows);

        // testing some query that would fail
        const [stores] = await pool.query('SELECT * FROM stores LIMIT 1');
        console.log("Stores successful");
        process.exit(0);
    } catch (e) {
        console.error("DB Error:", e);
        process.exit(1);
    }
})();
