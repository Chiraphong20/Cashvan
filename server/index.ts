import express from 'express';
import cors from 'cors';
import { db, initDB } from './db';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize DB and Seed Data
const bootstrap = async () => {
    await initDB();
    await seedZones();
    await seedProducts();
};

const seedZones = async () => {
    try {
        const [rows] = await db.query('SELECT count(*) as count FROM zones') as any;
        if (rows[0].count === 0) {
            console.log('Seeding zones from JSON...');
            const jsonPath = path.resolve('korat_zones.json');
            if (fs.existsSync(jsonPath)) {
                const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

                const connection = await db.getConnection();
                await connection.beginTransaction();
                try {
                    for (const d of data.districts) {
                        await connection.execute('INSERT INTO zones (id, name_th, parent_id) VALUES (?, ?, ?)', [d.id, d.name_th, d.parent_id]);
                    }
                    for (const sd of data.subDistricts) {
                        await connection.execute('INSERT INTO zones (id, name_th, parent_id) VALUES (?, ?, ?)', [sd.id + 10000, sd.name_th, sd.parent_id]);
                    }
                    await connection.commit();
                    console.log('Zones seeded successfully.');
                } catch (err) {
                    await connection.rollback();
                    throw err;
                } finally {
                    connection.release();
                }
            }
        }
    } catch (err) {
        console.error('Error seeding zones:', err);
    }
};

const seedProducts = async () => {
    try {
        const [rows] = await db.query('SELECT count(*) as count FROM categories') as any;
        if (rows[0].count === 0) {
            console.log('Seeding products and categories...');
            const initCategories = [
                { id: 1, name: 'เครื่องดื่ม' },
                { id: 2, name: 'ขนมขบเคี้ยว' },
                { id: 3, name: 'ของใช้ส่วนตัว' }
            ];
            const initProducts = [
                { id: 101, name: 'น้ำดื่ม 600ml', sku: 'DR-001', category_id: 1, price: 10 },
                { id: 102, name: 'น้ำอัดลม 325ml', sku: 'DR-002', category_id: 1, price: 15 },
                { id: 201, name: 'มันฝรั่งทอดกรอบ', sku: 'SN-001', category_id: 2, price: 20 },
                { id: 202, name: 'ถั่วลิสงอบเกลือ', sku: 'SN-002', category_id: 2, price: 10 },
                { id: 301, name: 'สบู่ก้อน', sku: 'PC-001', category_id: 3, price: 15 },
                { id: 302, name: 'ยาสีฟัน', sku: 'PC-002', category_id: 3, price: 35 }
            ];

            const connection = await db.getConnection();
            await connection.beginTransaction();
            try {
                for (const c of initCategories) {
                    await connection.execute('INSERT INTO categories (id, name) VALUES (?, ?)', [c.id, c.name]);
                }
                for (const p of initProducts) {
                    await connection.execute('INSERT INTO products (id, name, sku, category_id, price) VALUES (?, ?, ?, ?, ?)', [p.id, p.name, p.sku, p.category_id, p.price]);
                }
                await connection.commit();
                console.log('Products seeded successfully.');
            } catch (err) {
                await connection.rollback();
                throw err;
            } finally {
                connection.release();
            }
        }
    } catch (err) {
        console.error('Error seeding products:', err);
    }
};

bootstrap();

// --- API Routes ---

// Zones
app.get('/api/zones', async (req, res) => {
    try {
        const [zones] = await db.query('SELECT * FROM zones');
        res.json(zones);
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.get('/api/stores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT s.*, 
                   COALESCE(s.sub_district, sd.name_th) as sub_district_name, 
                   COALESCE(s.district, d.name_th) as district_name 
            FROM stores s
            LEFT JOIN zones sd ON s.sub_district_id = sd.id
            LEFT JOIN zones d ON sd.parent_id = d.id
            WHERE s.id = ?
        `, [id]) as [any[], any];

        if (rows.length === 0) return res.status(404).json({ message: 'Store not found' });
        res.json(rows[0]);
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Products & Categories
app.get('/api/categories', async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories');
        res.json(categories);
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products');
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.post('/api/products', async (req, res) => {
    const p = req.body;
    try {
        await db.execute('INSERT INTO products (name, sku, category_id, price) VALUES (?, ?, ?, ?)', [p.name, p.sku, p.category_id, p.price]);
        res.json({ status: 'success' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, sku, category_id, price } = req.body;
    try {
        await db.execute('UPDATE products SET name = ?, sku = ?, category_id = ?, price = ? WHERE id = ?', [name, sku, category_id, price, id]);
        res.json({ status: 'success' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM products WHERE id = ?', [id]);
        res.json({ status: 'success' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Stores
app.get('/api/stores', async (req, res) => {
    try {
        const { sub_district_id } = req.query;

        // 1. Fetch all zones for potential matching/healing
        const [zones] = await db.query('SELECT * FROM zones') as [any[], any];

        let query = `
            SELECT s.id, s.name, s.address, s.lat, s.lng, s.type, s.status, 
                   s.is_customer, s.phone, s.created_at, s.created_by, s.assigned_driver_id,
                   s.verification_status, s.sub_district_id, s.sales_zone,
                   COALESCE(s.sub_district, sd.name_th) as sub_district_name, 
                   COALESCE(s.district, d.name_th) as district_name 
            FROM stores s
            LEFT JOIN zones sd ON s.sub_district_id = sd.id
            LEFT JOIN zones d ON sd.parent_id = d.id
        `;
        const params: any[] = [];

        if (sub_district_id) {
            query += ' WHERE s.sub_district_id = ?';
            params.push(sub_district_id);
        }

        const [stores] = await db.query(query, params) as [any[], any];

        // 2. Data Healing: Populate sub_district, district, and translate type to Thai if needed
        const typeMap: Record<string, string> = {
            'grocery': 'โชห่วย / ร้านค้าปลีก',
            'wholesale': 'ร้านค้าส่ง',
            'restaurant': 'ร้านอาหาร / คาเฟ่',
            'minimart': 'มินิมาร์ท'
        };

        for (const store of stores) {
            let updated = false;
            let subDistStr = store.sub_district || '';
            let districtStr = store.district || '';
            let currentType = store.type || '';

            // Heal type to Thai if it's in English
            if (typeMap[currentType.toLowerCase()]) {
                const thaiType = typeMap[currentType.toLowerCase()];
                console.log(`🩹 Translating type for store ${store.id}: ${currentType} -> ${thaiType}`);
                await db.query('UPDATE stores SET type = ? WHERE id = ?', [thaiType, store.id]);
                store.type = thaiType;
            }

            // Heal columns
            if (!subDistStr && !districtStr) {
                if (store.sub_district_id) {
                    const foundZone = zones.find(z => z.id === store.sub_district_id);
                    if (foundZone) {
                        subDistStr = foundZone.name_th;
                        const parentZone = zones.find(z => z.id === foundZone.parent_id);
                        if (parentZone) districtStr = parentZone.name_th;
                        updated = true;
                    }
                } else if (store.address) {
                    // Try to find "ต.[ชื่อตำบล]" pattern and clean up the address
                    let cleanAddress = store.address;
                    const match = store.address.match(/ต\.\s?([^\s\d]+)/);
                    if (match) {
                        const rawName = match[1].trim();
                        const foundZone = zones.find(z => z.name_th.includes(rawName) || rawName.includes(z.name_th));
                        
                        if (foundZone) {
                            subDistStr = foundZone.name_th;
                            const parentZone = zones.find(z => z.id === foundZone.parent_id);
                            if (parentZone) districtStr = parentZone.name_th;
                            
                            // 🩹 ALSO STRIP from address string
                            cleanAddress = cleanAddress.replace(/ต\.\s?[^\s\d]+/g, '').replace(/อ\.\s?[^\s\d]+/g, '').replace(/จ\.\s?นครราชสีมา/g, '').replace(/\s+/g, ' ').trim();
                            
                            // Update ID too
                            db.query('UPDATE stores SET sub_district_id = ? WHERE id = ?', [foundZone.id, store.id]);
                            updated = true;
                        }
                    }
                    if (updated) store.address = cleanAddress; // Update local object
                }

                if (updated) {
                    console.log(`🩹 Auto-healing text columns for store ${store.id}: ${subDistStr}, ${districtStr}. Address cleaned: ${store.address}`);
                    await db.query('UPDATE stores SET sub_district = ?, district = ?, address = ? WHERE id = ?', [subDistStr, districtStr, store.address, store.id]);
                    store.sub_district_name = subDistStr;
                    store.district_name = districtStr;
                }
            }
        }

        res.json(stores);
    } catch (error: any) {
        console.error('❌ Error in GET /api/stores:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            sql: error.sql,
            sqlMessage: error.sqlMessage
        });
    }
});

app.post('/api/stores', async (req, res) => {
    const store = req.body;
    console.log('📥 POST /api/stores - Received data:', store);
    try {
        const id = store.id || `st_${Date.now()}`;
        await db.execute(`
            INSERT INTO stores (
                id, name, address, sub_district, district, lat, lng, type, status, 
                sub_district_id, created_by, additional_info, photo_url, 
                discrepancy_reason, verification_status, is_customer, phone, sales_zone, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            store.name || 'Unknown Store',
            store.address || null,
            store.sub_district || null,
            store.district || null,
            store.lat || null,
            store.lng || null,
            store.type || 'grocery',
            store.status || 'UNSURVEYED',
            store.sub_district_id || null,
            store.created_by || null,
            store.additional_info || null,
            store.photo_url || null,
            store.discrepancy_reason || null,
            store.verification_status || 'PENDING',
            store.is_customer ? 1 : 0,
            store.phone || null,
            store.sales_zone || null,
            store.created_at || new Date().toISOString().slice(0, 19).replace('T', ' ')
        ]);
        res.json({ status: 'success', id });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.put('/api/stores', async (req, res) => {
    const { id, ...fields } = req.body;
    console.log(`📥 PUT /api/stores/${id} - Field updates:`, fields);
    const keys = Object.keys(fields);
    if (keys.length === 0) return res.status(400).json({ error: 'No fields to update' });

    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const params = [...Object.values(fields), id];

    try {
        await db.query(`UPDATE stores SET ${setClause} WHERE id = ?`, params);
        res.json({ status: 'success' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.delete('/api/stores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Delete associated sales items and sales
        await db.execute('DELETE FROM sale_items WHERE sale_id IN (SELECT id FROM sales WHERE store_id = ?)', [id]);
        await db.execute('DELETE FROM sales WHERE store_id = ?', [id]);

        // 2. Delete associated visits
        await db.execute('DELETE FROM visits WHERE store_id = ?', [id]);

        // 3. Finally delete the store
        const [result] = await db.execute('DELETE FROM stores WHERE id = ?', [id]);

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Store not found' });
        }

        res.json({ status: 'success', message: 'Store and related data deleted successfully' });
    } catch (error: any) {
        console.error('❌ Error deleting store:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Visits
app.get('/api/visits', async (req, res) => {
    try {
        const { driver_id } = req.query;
        let query = 'SELECT * FROM visits';
        const params: any[] = [];

        if (driver_id) {
            query += ' WHERE driver_id = ?';
            params.push(driver_id);
        }
        query += ' ORDER BY created_at DESC';

        const [visits] = await db.query(query, params);
        res.json(visits);
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.post('/api/visits', async (req, res) => {
    const visit = req.body;
    try {
        await db.execute(`
            INSERT INTO visits (store_id, driver_id, status, photo_url, notes)
            VALUES (?, ?, ?, ?, ?)
        `, [
            visit.store_id,
            visit.driver_id,
            visit.status,
            visit.photo_url,
            visit.notes
        ]);
        res.json({ status: 'success' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Inventory
app.get('/api/inventory', async (req, res) => {
    try {
        const { driver_id, vehicle_id } = req.query;
        const location_id = vehicle_id || driver_id;
        let query = 'SELECT * FROM inventory';
        const params: any[] = [];

        if (location_id) {
            query += ' WHERE location_id = ?';
            params.push(location_id);
        } else {
            query += ' WHERE location_type = "MASTER"';
        }

        const [items] = await db.query(query, params);
        res.json(items);
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.put('/api/inventory', async (req, res) => {
    const { product_id, location_id, quantity, location_type } = req.body;
    try {
        const [existing] = await db.query(
            'SELECT id FROM inventory WHERE product_id = ? AND location_id = ?', 
            [product_id, location_id || '']
        ) as any;

        if (existing.length > 0) {
            await db.execute(
                'UPDATE inventory SET quantity = ? WHERE id = ?',
                [quantity, existing[0].id]
            );
        } else {
            await db.execute(
                'INSERT INTO inventory (product_id, quantity, location_type, location_id) VALUES (?, ?, ?, ?)',
                [product_id, quantity, location_type || (location_id ? 'VEHICLE' : 'MASTER'), location_id || '']
            );
        }
        res.json({ status: 'success' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Sales & Order Recording
app.delete('/api/sales/:id', async (req, res) => {
    const saleId = req.params.id;
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // 1. Get the sale to find the vehicle_id
        const [sales] = await connection.query('SELECT vehicle_id FROM sales WHERE id = ?', [saleId]) as any;
        if (!sales || sales.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Sale not found' });
        }
        const vehicle_id = sales[0].vehicle_id;

        // 2. Get sale items
        const [items] = await connection.query('SELECT product_id, quantity FROM sale_items WHERE sale_id = ?', [saleId]) as any;

        // 3. Refund inventory
        if (vehicle_id) {
            for (const item of items) {
                await connection.execute(
                    'UPDATE inventory SET quantity = quantity + ? WHERE product_id = ? AND location_id = ?',
                    [item.quantity, item.product_id, vehicle_id]
                );
            }
        }

        // 4. Delete items and sale
        await connection.execute('DELETE FROM sale_items WHERE sale_id = ?', [saleId]);
        await connection.execute('DELETE FROM sales WHERE id = ?', [saleId]);
        
        await connection.commit();
        res.json({ status: 'success' });
    } catch (err: any) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/sales', async (req, res) => {
    try {
        // Fetch all sales first
        const [sales] = await db.query('SELECT * FROM sales ORDER BY created_at DESC') as any;
        
        // Fetch items for each sale and attach them
        const enhancedSales = await Promise.all(sales.map(async (sale: any) => {
            const [items] = await db.query(`
                SELECT si.*, p.name as product_name 
                FROM sale_items si
                JOIN products p ON si.product_id = p.id
                WHERE si.sale_id = ?
            `, [sale.id]) as any;
            return { ...sale, items };
        }));

        res.json(enhancedSales);
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.post('/api/sales', async (req, res) => {
    const { store_id, driver_id, vehicle_id, total_amount, items } = req.body;
    console.log(`📥 [SALES] New request: Store=${store_id}, Driver=${driver_id}, Vehicle=${vehicle_id}, Total=${total_amount}`);
    
    if (!vehicle_id) {
        console.error('❌ [SALES] Error: No vehicle_id provided');
        return res.status(400).json({ error: 'Please select a vehicle before recording a sale.' });
    }

    const saleId = `sl_${Date.now()}`;
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        console.log(`📡 [SALES] Starting transaction for ${saleId}...`);

        // 1. Insert Master Sale
        await connection.execute(
            'INSERT INTO sales (id, store_id, driver_id, vehicle_id, total_amount) VALUES (?, ?, ?, ?, ?)', 
            [saleId, store_id, driver_id, vehicle_id, total_amount || 0]
        );

        // 2. Process Items and Inventory
        for (const item of items) {
            console.log(`   📦 Processing item: PID=${item.product_id}, Qty=${item.quantity}`);
            
            // Insert Sale Item
            await connection.execute(
                'INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', 
                [saleId, item.product_id, item.quantity, item.price]
            );

            // Update/Check Inventory for this specific vehicle
            const [existing] = await connection.query(
                'SELECT id FROM inventory WHERE product_id = ? AND location_id = ?', 
                [item.product_id, vehicle_id]
            ) as any;

            if (existing.length > 0) {
                await connection.execute(
                    'UPDATE inventory SET quantity = quantity - ? WHERE id = ?', 
                    [item.quantity, existing[0].id]
                );
            } else {
                console.warn(`   ⚠️ Warning: Product ${item.product_id} not in inventory for vehicle ${vehicle_id}. Creating fallback entry.`);
                await connection.execute(
                    'INSERT INTO inventory (product_id, quantity, location_type, location_id) VALUES (?, ?, ?, ?)', 
                    [item.product_id, -item.quantity, 'VEHICLE', vehicle_id]
                );
            }
        }

        // 3. Create Visit Record
        await connection.execute(
            'INSERT INTO visits (store_id, driver_id, status, notes) VALUES (?, ?, "SUCCESS", ?)', 
            [store_id, driver_id, `ขายสินค้าสำเร็จ: ฿${total_amount}`]
        );

        // 4. Update Store Status
        await connection.execute('UPDATE stores SET status = "SUCCESS" WHERE id = ?', [store_id]);

        await connection.commit();
        console.log(`✅ [SALES] Successfully recorded sale: ${saleId}`);
        res.json({ status: 'success', id: saleId });

    } catch (error: any) {
        await connection.rollback();
        console.error('❌ [SALES] FATAL TRANSACTION ERROR:', error);
        res.status(500).json({ 
            status: 'error', 
            message: error.message,
            sqlMessage: error.sqlMessage, // ส่งข้อความจาก MySQL กลับไปดู
            code: error.code
        });
    } finally {
        if (connection) connection.release();
    }
});

app.post('/api/inventory/transfer', async (req, res) => {
    const { location_id, location_type, items } = req.body;
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        for (const item of items) {
            // 1. Decrement from MASTER
            await connection.execute(
                'UPDATE inventory SET quantity = quantity - ? WHERE product_id = ? AND location_type = "MASTER"',
                [item.quantity, item.product_id]
            );

            // 2. Increment/Insert to Target (VEHICLE)
            const [existing] = await connection.query(
                'SELECT id FROM inventory WHERE product_id = ? AND location_id = ?', 
                [item.product_id, location_id]
            ) as any;

            if (existing.length > 0) {
                await connection.execute(
                    'UPDATE inventory SET quantity = quantity + ? WHERE id = ?',
                    [item.quantity, existing[0].id]
                );
            } else {
                await connection.execute(
                    'INSERT INTO inventory (product_id, quantity, location_type, location_id) VALUES (?, ?, ?, ?)',
                    [item.product_id, item.quantity, location_type || 'VEHICLE', location_id]
                );
            }

            // 3. Log the transaction
            await connection.execute(
                'INSERT INTO stock_transactions (product_id, quantity, source_location, target_location, transaction_type) VALUES (?, ?, "MASTER", ?, "TRANSFER")',
                [item.product_id, item.quantity, location_id]
            );
        }
        await connection.commit();
        res.json({ status: 'success' });
    } catch (error: any) {
        await connection.rollback();
        console.error('❌ Transfer Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    } finally {
        connection.release();
    }
});

app.post('/api/inventory/return', async (req, res) => {
    const { driver_id } = req.body;
    try {
        await db.execute('DELETE FROM inventory WHERE location_type = "VAN" AND location_id = ?', [driver_id]);
        res.json({ status: 'success' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.post('/api/reconciliation', async (req, res) => {
    const { driver_id, report } = req.body;
    try {
        console.log(`Reconciliation saved for driver ${driver_id}`);
        await db.execute('DELETE FROM inventory WHERE location_type = "VAN" AND location_id = ?', [driver_id]);
        res.json({ status: 'success', report });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Drivers Management
app.get('/api/drivers', async (req, res) => {
    try {
        const [drivers] = await db.query('SELECT * FROM drivers ORDER BY id ASC');
        res.json(drivers);
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.post('/api/drivers/auth-line', async (req, res) => {
    const { line_user_id } = req.body;
    try {
        const [drivers] = await db.query('SELECT * FROM drivers WHERE line_user_id = ?', [line_user_id]) as any;
        if (drivers.length > 0) {
            res.json({ status: 'success', driver: drivers[0] });
        } else {
            res.json({ status: 'not_found' });
        }
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.post('/api/drivers/bind-line', async (req, res) => {
    const { driver_id, line_user_id, line_display_name, line_picture_url } = req.body;
    try {
        await db.execute(
            'UPDATE drivers SET line_user_id = ?, line_display_name = ?, line_picture_url = ? WHERE id = ?',
            [line_user_id, line_display_name, line_picture_url, driver_id]
        );
        const [drivers] = await db.query('SELECT * FROM drivers WHERE id = ?', [driver_id]) as any;
        res.json({ status: 'success', driver: drivers[0] });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.get('/api/vehicles', async (req, res) => {
    try {
        const [vehicles] = await db.query('SELECT * FROM vehicles ORDER BY id ASC');
        res.json(vehicles);
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.post('/api/drivers', async (req, res) => {
    const driver = req.body;
    try {
        await db.execute(`
            INSERT INTO drivers (id, name, phone, vehicle_plate, vehicle_code, assigned_zone, work_status, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            driver.id,
            driver.name,
            driver.phone || null,
            driver.vehicle_plate || null,
            driver.vehicle_code || null,
            driver.assigned_zone || null,
            driver.work_status || 'OFFLINE',
            driver.avatar_url || `https://i.pravatar.cc/100?u=${driver.id}`
        ]);
        res.json({ status: 'success' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.put('/api/drivers/:id', async (req, res) => {
    const { id } = req.params;
    const rawFields = req.body;

    // Whitelist only columns that exist in the drivers table
    const ALLOWED_DRIVER_FIELDS = ['name', 'phone', 'work_status', 'vehicle_plate', 'vehicle_code', 'assigned_zone', 'avatar_url', 'line_user_id', 'line_display_name', 'line_picture_url'];
    const fields: Record<string, any> = {};
    for (const key of Object.keys(rawFields)) {
        if (ALLOWED_DRIVER_FIELDS.includes(key)) {
            fields[key] = rawFields[key];
        }
    }

    const keys = Object.keys(fields);
    if (keys.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    try {
        // 1. Fetch old name BEFORE updating (for cascade update)
        const [oldRows] = await db.query('SELECT name FROM drivers WHERE id = ?', [id]) as any;
        const oldName = oldRows?.[0]?.name || null;
        const newName = fields['name'] || null;

        // 2. Update the driver record
        const setClause = keys.map(key => `\`${key}\` = ?`).join(', ');
        const params = [...Object.values(fields), id];
        await db.query(`UPDATE drivers SET ${setClause} WHERE id = ?`, params);

        // 3. Cascade: If name changed, update stores.created_by (which stores driver name as string)
        if (newName && oldName && newName !== oldName) {
            console.log(`🔄 Cascading name change: "${oldName}" → "${newName}" in stores.created_by`);
            await db.query(
                'UPDATE stores SET created_by = ? WHERE created_by = ?',
                [newName, oldName]
            );
        }

        res.json({ status: 'success' });
    } catch (error: any) {
        console.error('❌ PUT /api/drivers error:', error.sqlMessage || error.message);
        res.status(500).json({ status: 'error', message: error.sqlMessage || error.message });
    }
});

app.delete('/api/drivers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM drivers WHERE id = ?', [id]);
        res.json({ status: 'success' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Stats
app.get('/api/stats', async (req, res) => {
    try {
        const [totalStores] = await db.query('SELECT count(*) as count FROM stores') as any;
        const [surveyedStores] = await db.query("SELECT count(*) as count FROM stores WHERE status = 'SURVEYED'") as any;
        const [recentVisits] = await db.query('SELECT count(*) as count FROM visits WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)') as any;

        const ts = totalStores[0].count;
        const ss = surveyedStores[0].count;
        const rv = recentVisits[0].count;

        res.json({
            total_stores: ts,
            surveyed_stores: ss,
            recent_activity: rv,
            completion_rate: ts > 0 ? (ss / ts) * 100 : 0
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Survey Targets (Zones)
app.get('/api/survey-targets', async (req, res) => {
    try {
        const [targets] = await db.query('SELECT * FROM survey_targets WHERE status = "ACTIVE" ORDER BY created_at DESC');
        res.json(targets);
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.post('/api/survey-targets', async (req, res) => {
    const target = req.body;
    try {
        const id = target.id || `trg_${Date.now()}`;
        await db.execute(`
            INSERT INTO survey_targets (id, name, lat, lng, radius, color, assigned_driver_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            target.name || 'Unhappy Target',
            target.lat,
            target.lng,
            target.radius || 500,
            target.color || '#3b82f6',
            target.assigned_driver_id || null,
            target.status || 'ACTIVE'
        ]);
        res.json({ status: 'success', id });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.delete('/api/survey-targets/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('UPDATE survey_targets SET status = "ARCHIVED" WHERE id = ?', [id]);
        res.json({ status: 'success' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Admin Auth & Profile
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [admins] = await db.query('SELECT * FROM admins WHERE username = ?', [username]) as any;
        if (admins.length === 0) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        
        const crypto = await import('crypto');
        const hashedPwd = crypto.createHash('sha256').update(password).digest('hex');
        
        if (admins[0].password !== hashedPwd) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }
        
        // Return without password
        const { password: _, ...adminData } = admins[0];
        res.json({ status: 'success', admin: adminData, token: `fake-jwt-token-${admins[0].id}` });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.get('/api/admin/profile', async (req, res) => {
    const { id } = req.query;
    try {
        const [admins] = await db.query('SELECT id, username, name FROM admins WHERE id = ?', [id]) as any;
        if (admins.length === 0) return res.status(404).json({ status: 'error', message: 'Admin not found' });
        res.json({ status: 'success', admin: admins[0] });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.put('/api/admin/profile', async (req, res) => {
    const { id, name, newPassword } = req.body;
    try {
        if (newPassword) {
            const crypto = await import('crypto');
            const hashedPwd = crypto.createHash('sha256').update(newPassword).digest('hex');
            await db.query('UPDATE admins SET name = ?, password = ? WHERE id = ?', [name, hashedPwd, id]);
        } else {
            await db.query('UPDATE admins SET name = ? WHERE id = ?', [name, id]);
        }
        
        const [admins] = await db.query('SELECT id, username, name FROM admins WHERE id = ?', [id]) as any;
        res.json({ status: 'success', admin: admins[0] });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Setup static file serving for Production (Render)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start Server after Bootstrap
bootstrap().then(() => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
});
