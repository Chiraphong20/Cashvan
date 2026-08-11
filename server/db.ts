import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'WH_logistic',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000, // 10 seconds timeout
    timezone: '+07:00'
};

console.log(`🔌 Initializing database connection for ${dbConfig.host}...`);

const pool = mysql.createPool(dbConfig);

// บังคับให้ฐานข้อมูลใช้ Timezone ประเทศไทย (+07:00) ในทุกๆ Session
pool.on('connection', (connection) => {
    connection.query("SET time_zone = '+07:00';");
});

// Helper function to check if a column exists
async function columnExists(connection: any, table: string, column: string) {
    try {
        const [rows] = await connection.query(
            'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = ? AND TABLE_SCHEMA = DATABASE()',
            [table, column]
        ) as any;
        return rows.length > 0;
    } catch (e) {
        console.warn(`⚠️ Error checking if column ${column} exists in ${table}:`, e);
        return false;
    }
}

export const initDB = async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('✅ Remote Database Connected Successfully.');

        // 1. Create Tables Basic Structure
        const tableQueries = [
            `CREATE TABLE IF NOT EXISTS zones (id INT PRIMARY KEY, name_th TEXT NOT NULL, parent_id INT)`,
            `CREATE TABLE IF NOT EXISTS categories (id INT PRIMARY KEY AUTO_INCREMENT, name TEXT NOT NULL)`,
            `CREATE TABLE IF NOT EXISTS products (id INT PRIMARY KEY AUTO_INCREMENT, name TEXT NOT NULL, sku VARCHAR(50) NOT NULL UNIQUE, category_id INT, price DECIMAL(10,2) NOT NULL)`,
            `CREATE TABLE IF NOT EXISTS stores (id VARCHAR(50) PRIMARY KEY, name VARCHAR(255) NOT NULL, address TEXT, lat DOUBLE, lng DOUBLE, type VARCHAR(50), status VARCHAR(50) DEFAULT 'UNSURVEYED', photo_url LONGTEXT, assigned_driver_id VARCHAR(50))`,
            `CREATE TABLE IF NOT EXISTS inventory (id INT PRIMARY KEY AUTO_INCREMENT, product_id INT NOT NULL, quantity INT DEFAULT 0)`,
            `CREATE TABLE IF NOT EXISTS sales (id VARCHAR(50) PRIMARY KEY, store_id VARCHAR(50), driver_id VARCHAR(50), total_amount DECIMAL(10,2), created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
            `CREATE TABLE IF NOT EXISTS sale_items (id INT PRIMARY KEY AUTO_INCREMENT, sale_id VARCHAR(50), product_id INT, quantity INT, price DECIMAL(10,2))`,
            `CREATE TABLE IF NOT EXISTS visits (id INT PRIMARY KEY AUTO_INCREMENT, store_id VARCHAR(50), driver_id VARCHAR(50), status VARCHAR(50), photo_url LONGTEXT, notes TEXT, visited_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
            `CREATE TABLE IF NOT EXISTS drivers (id VARCHAR(50) PRIMARY KEY, name VARCHAR(255) NOT NULL, phone VARCHAR(20), work_status VARCHAR(20) DEFAULT 'OFFLINE', vehicle_plate VARCHAR(50), vehicle_code VARCHAR(50), assigned_zone VARCHAR(100), avatar_url TEXT)`,
            `CREATE TABLE IF NOT EXISTS vehicles (id VARCHAR(50) PRIMARY KEY, plate_number VARCHAR(20) NOT NULL, code VARCHAR(20), status VARCHAR(20) DEFAULT 'AVAILABLE')`,
            `CREATE TABLE IF NOT EXISTS survey_targets (id VARCHAR(50) PRIMARY KEY, name VARCHAR(255) NOT NULL, lat DOUBLE, lng DOUBLE, radius INT, color VARCHAR(20), assigned_driver_id VARCHAR(50), status VARCHAR(20) DEFAULT 'ACTIVE')`,
            `CREATE TABLE IF NOT EXISTS stock_transactions (id INT PRIMARY KEY AUTO_INCREMENT, product_id INT, quantity INT, source_location VARCHAR(50), target_location VARCHAR(50), transaction_type VARCHAR(20), created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
            `CREATE TABLE IF NOT EXISTS admins (id INT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(50) UNIQUE, password VARCHAR(255), name VARCHAR(255))`,
            `CREATE TABLE IF NOT EXISTS driver_locations (id INT PRIMARY KEY AUTO_INCREMENT, driver_id VARCHAR(50) NOT NULL, lat DOUBLE NOT NULL, lng DOUBLE NOT NULL, accuracy FLOAT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE KEY unique_driver (driver_id))`,
            `CREATE TABLE IF NOT EXISTS trips (id VARCHAR(50) PRIMARY KEY, driver_id VARCHAR(50) NOT NULL, vehicle_id VARCHAR(50), vehicle_plate VARCHAR(50), crew_count INT DEFAULT 1, crew_names TEXT, departure_time DATETIME NOT NULL, return_time DATETIME, status VARCHAR(20) DEFAULT 'ACTIVE', planned_store_count INT DEFAULT 0, notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
            `CREATE TABLE IF NOT EXISTS gps_tracks (id INT PRIMARY KEY AUTO_INCREMENT, driver_id VARCHAR(50) NOT NULL, lat DOUBLE NOT NULL, lng DOUBLE NOT NULL, recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP, INDEX idx_driver_date (driver_id, recorded_at))`
        ];

        for (const sql of tableQueries) {
            await connection.query(sql);
        }

        // 2. Safe Auto-Heal (Check column by column)
        console.log('🩺 Patching missing columns...');

        const safeAlter = async (table: string, column: string, type: string) => {
            try {
                if (!(await columnExists(connection, table, column))) {
                    await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${type}`);
                }
            } catch (err: any) {
                if (err.code !== 'ER_DUP_FIELDNAME') {
                    console.error(`❌ Error patching ${table}.${column}:`, err.message);
                }
            }
        };

        // Inventory Patches
        await safeAlter('inventory', 'location_id', 'VARCHAR(50)');
        await safeAlter('inventory', 'location_type', 'VARCHAR(50)');

        // Sales Patches
        await safeAlter('sales', 'vehicle_id', 'VARCHAR(50)');

        // Products Patches — support importing the real catalog from the line-commerce POS system (pos.products)
        await safeAlter('products', 'wholesale_price', 'DECIMAL(10,2) DEFAULT 0');
        await safeAlter('products', 'unit', 'VARCHAR(20) DEFAULT "ชิ้น"');
        await safeAlter('products', 'image', 'LONGTEXT');
        await safeAlter('products', 'barcode', 'VARCHAR(100)');
        await safeAlter('products', 'pos_product_id', 'VARCHAR(50)');
        try {
            await connection.query('ALTER TABLE products ADD UNIQUE INDEX idx_pos_product_id (pos_product_id)');
        } catch (e: any) {
            if (e.code !== 'ER_DUP_KEYNAME') console.warn('⚠️ Could not add idx_pos_product_id:', e.message);
        }

        // Stores Patches
        const storeColumns = [
            ['sub_district', 'VARCHAR(100)'],
            ['district', 'VARCHAR(100)'],
            ['sub_district_id', 'INT'],
            ['created_by', 'VARCHAR(50)'],
            ['photo_url', 'LONGTEXT'],
            ['verification_status', 'VARCHAR(50) DEFAULT "PENDING"'],
            ['is_customer', 'BOOLEAN DEFAULT false'],
            ['phone', 'VARCHAR(50)'],
            ['sales_zone', 'VARCHAR(100)'],
            ['assigned_driver_id', 'VARCHAR(50)']
        ];
        for (const [col, type] of storeColumns) {
            await safeAlter('stores', col, type);
        }

        // Survey Targets Patches
        await safeAlter('survey_targets', 'assigned_driver_id', 'VARCHAR(50)');

        // Driver schema update
        const driverColumns = [
            { col: 'phone', type: 'VARCHAR(20)' },
            { col: 'work_status', type: 'VARCHAR(20)' },
            { col: 'vehicle_plate', type: 'VARCHAR(50)' },
            { col: 'vehicle_code', type: 'VARCHAR(50)' },
            { col: 'assigned_zone', type: 'VARCHAR(100)' },
            { col: 'avatar_url', type: 'TEXT' },
            { col: 'line_user_id', type: 'VARCHAR(100)' },
            { col: 'line_display_name', type: 'VARCHAR(255)' },
            { col: 'line_picture_url', type: 'TEXT' }
        ];

        for (const { col, type } of driverColumns) {
            await safeAlter('drivers', col, type);
        }

        // Visits Patches
        await safeAlter('visits', 'visited_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
        await safeAlter('visits', 'notes', 'TEXT');
        await safeAlter('visits', 'driver_id', 'VARCHAR(50)');

        // Upgrade photo_url to LONGTEXT aggressively to prevent truncation of Base64 strings
        try {
            await connection.query('ALTER TABLE stores MODIFY photo_url LONGTEXT');
            await connection.query('ALTER TABLE visits MODIFY photo_url LONGTEXT');
        } catch (e) { }

        // Seeding initial data if empty
        const [prodCount] = await connection.query('SELECT COUNT(*) as count FROM products') as any;
        if (prodCount[0].count === 0) {
            console.log('🌱 Seeding initial database data...');
            await connection.query('INSERT INTO categories (name) VALUES ("เครื่องดื่ม"), ("ของขบเคี้ยว")');
            await connection.query('INSERT INTO vehicles (id, plate_number, code) VALUES ("V-01", "กข-1234", "VAN-01")');
        }

        const [adminCount] = await connection.query('SELECT COUNT(*) as count FROM admins') as any;
        if (adminCount[0].count === 0) {
            console.log('🌱 Seeding initial admin data...');
            const crypto = await import('crypto');
            const hashedPwd = crypto.default.createHash('sha256').update('password123').digest('hex');
            await connection.query('INSERT INTO admins (username, password, name) VALUES (?, ?, ?)', ['admin', hashedPwd, 'System Admin']);
        }

        console.log('🚀 All systems ready.');
    } catch (err: any) {
        console.error('❌ FATAL DATABASE ERROR:', err.message);
        // Don't throw, let the app try to survive
    } finally {
        if (connection) connection.release();
    }
};

export { pool as db };
export default pool;
