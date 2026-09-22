# API Documentation (เอกสาร API)

REST API ทั้งหมดอยู่ใน `server/index.ts` (Express.js) รันบนพอร์ต **3001**
ฝั่ง Frontend (Vite, พอร์ต 3000) เรียกผ่าน proxy `"/api" → http://127.0.0.1:3001`
Payload limit = 50MB, CORS เปิดทั้งหมด, timezone `+07:00`

รูปแบบ response ทั่วไป: สำเร็จ `{ "status": "success", ... }` หรือคืน array/object ตรง ๆ; ผิดพลาด `{ "status": "error", "message": "..." }`

---

## 1. Admin Authentication & Profile

| Method | Endpoint | รายละเอียด |
| :--- | :--- | :--- |
| POST | `/api/admin/login` | body `{ username, password }` → ตรวจ SHA-256, คืน `{ status, admin, token: "fake-jwt-token-<id>" }` (401 ถ้าไม่ผ่าน) |
| GET | `/api/admin/profile?id=1` | คืน `{ status, admin: { id, username, name } }` |
| PUT | `/api/admin/profile` | body `{ id, name, newPassword? }` — อัปเดตชื่อ และรหัสผ่านถ้าส่งมา |

## 2. Zones

| Method | Endpoint | รายละเอียด |
| :--- | :--- | :--- |
| GET | `/api/zones` | คืนทุกแถวใน `zones` (อำเภอ + ตำบล) |

## 3. Stores & Survey

| Method | Endpoint | รายละเอียด |
| :--- | :--- | :--- |
| GET | `/api/stores` | query `sub_district_id?` — คืนร้านทั้งหมดพร้อม `sub_district_name`, `district_name` (join `zones`); มี data-healing ประเภทร้าน/ตำบล/ที่อยู่ |
| GET | `/api/stores/:id` | คืนร้านรายตัวพร้อม `photo_url` เต็ม |
| POST | `/api/stores` | สร้างร้านใหม่ (id = `st_<timestamp>` ถ้าไม่ส่ง); ฟิลด์: name, address, sub_district(_id), district, lat, lng, type, status, created_by, phone, is_customer, sales_zone, verification_status(default PENDING) |
| PUT | `/api/stores` | body `{ id, ...fields }` — dynamic update เฉพาะฟิลด์ที่ส่ง |
| DELETE | `/api/stores/:id` | ลบแบบ cascade: `sale_items` → `sales` → `visits` → `stores` |

## 4. Visits

| Method | Endpoint | รายละเอียด |
| :--- | :--- | :--- |
| GET | `/api/visits` | query `driver_id?` — เรียงจากใหม่ไปเก่า |
| POST | `/api/visits` | body `{ store_id, driver_id, status, photo_url, notes }` |

## 5. Products & Categories

| Method | Endpoint | รายละเอียด |
| :--- | :--- | :--- |
| GET | `/api/categories` | รายการหมวดหมู่ |
| GET | `/api/products` | รายการสินค้าทั้งหมด |
| POST | `/api/products` | body `{ name, sku, category_id, price }` |
| PUT | `/api/products/:id` | body `{ name, sku, category_id, price }` |
| DELETE | `/api/products/:id` | ลบสินค้า |
| POST | `/api/products/sync-from-pos` | นำเข้าแคตตาล็อกจาก `pos.products` → สร้าง/อัปเดต `categories`, `products`, และ `inventory` MASTER สำหรับสินค้าใหม่; ปลอดภัยเมื่อรันซ้ำ (จับคู่ `pos_product_id`); คืน `{ status, newProducts, updatedProducts, total }` |

## 6. Inventory

| Method | Endpoint | รายละเอียด |
| :--- | :--- | :--- |
| GET | `/api/inventory` | query `vehicle_id?` หรือ `driver_id?` = location_id; ถ้าไม่ส่ง คืนสต็อก `location_type = 'MASTER'` |
| PUT | `/api/inventory` | body `{ product_id, location_id, quantity, location_type? }` — upsert ตามคู่ (product_id, location_id) |
| POST | `/api/inventory/transfer` | body `{ location_id, location_type: 'VEHICLE', items: [{ product_id, quantity }] }` — ลด MASTER, เพิ่ม/สร้างที่รถ, บันทึก `stock_transactions` (TRANSFER) ในทรานแซกชัน |
| POST | `/api/inventory/return` | body `{ driver_id }` — ลบสต็อก VAN ของพนักงาน (ใช้ตอนคืนของ) |
| POST | `/api/reconciliation` | body `{ driver_id, report }` — บันทึกผลนับสต็อกปลายวันและล้างสต็อก VAN |
| GET | `/api/pos-products` | query `search?`, `limit?`(≤200, def 50), `offset?` — คืน `{ items, total }` จาก `pos.products` (อ่านอย่างเดียว) |

## 7. Sales

| Method | Endpoint | รายละเอียด |
| :--- | :--- | :--- |
| GET | `/api/sales` | ทุกบิลเรียงใหม่→เก่า พร้อม `items[]` (join `products` → `product_name`) |
| POST | `/api/sales` | body `{ store_id, driver_id, vehicle_id, total_amount, items: [{ product_id, quantity, price }] }` — **บังคับ `vehicle_id`** (400 ถ้าไม่มี); ทรานแซกชัน: insert `sales` + `sale_items`, ตัด `inventory` ของรถ, insert `visits` (SUCCESS), `UPDATE stores SET status='SUCCESS'` |
| DELETE | `/api/sales/:id` | คืนสต็อกรถตาม `sale_items` แล้วลบบิล (ทรานแซกชัน) |

## 8. Drivers & Vehicles

| Method | Endpoint | รายละเอียด |
| :--- | :--- | :--- |
| GET | `/api/drivers` | รายชื่อพนักงานทั้งหมด |
| POST | `/api/drivers` | body `{ id, name, phone, vehicle_plate, vehicle_code, assigned_zone, work_status, avatar_url }` |
| PUT | `/api/drivers/:id` | อัปเดตเฉพาะฟิลด์ที่อยู่ใน whitelist; ถ้าเปลี่ยน `name` จะ cascade `UPDATE stores SET created_by` |
| DELETE | `/api/drivers/:id` | ลบพนักงาน |
| POST | `/api/drivers/auth-line` | body `{ line_user_id }` → `{ status: 'success', driver }` หรือ `{ status: 'not_found' }` |
| POST | `/api/drivers/bind-line` | body `{ driver_id, line_user_id, line_display_name, line_picture_url }` — ผูกบัญชี LINE เข้ากับพนักงาน |
| GET | `/api/vehicles` | รายการรถทั้งหมด |

## 9. GPS & Fleet Tracking

| Method | Endpoint | รายละเอียด |
| :--- | :--- | :--- |
| POST | `/api/driver-location` | body `{ driver_id, lat, lng, accuracy? }` — upsert 1 แถว/คน ใน `driver_locations` |
| GET | `/api/driver-locations` | ตำแหน่งล่าสุดของพนักงานทุกคน (Admin poll ทุก 30s) |
| POST | `/api/gps-track` | body `{ driver_id, points: [{ lat, lng, recorded_at? }] }` — batch insert ลง `gps_tracks` |
| GET | `/api/gps-track/:driver_id` | query `date?` (default วันนี้) — เส้นทางของพนักงานคนเดียว เรียงตามเวลา |
| GET | `/api/gps-tracks` | query `date?` — เส้นทางของพนักงานทุกคนในวันนั้น |

## 10. Survey Targets (Geofence)

| Method | Endpoint | รายละเอียด |
| :--- | :--- | :--- |
| GET | `/api/survey-targets` | เฉพาะ `status = 'ACTIVE'` |
| POST | `/api/survey-targets` | body `{ name, lat, lng, radius?, color?, assigned_driver_id? }` |
| DELETE | `/api/survey-targets/:id` | soft-delete → `status = 'ARCHIVED'` |

## 11. Stats

| Method | Endpoint | รายละเอียด |
| :--- | :--- | :--- |
| GET | `/api/stats` | `{ total_stores, surveyed_stores, recent_activity, completion_rate }` |

## 12. Static / SPA Fallback
- `express.static('../dist')` เสิร์ฟไฟล์ build ของ Frontend
- `GET *` ส่ง `dist/index.html` (รองรับ client-side routing)

---

### หมายเหตุ
- ยังไม่มี middleware ตรวจ token ที่ฝั่ง server — การป้องกันสิทธิ์ทำที่ฝั่ง client
- endpoint การขายเดิมชื่อ `/api/inventory/refill` ถูกแทนที่ด้วย `/api/inventory/transfer`
