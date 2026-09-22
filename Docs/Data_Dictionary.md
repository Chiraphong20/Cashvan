# พจนานุกรมข้อมูล (Data Dictionary)

โครงสร้างตารางในฐานข้อมูล MySQL `WH_logistic` ตามที่นิยามและ auto-heal ใน `server/db.ts`
(ประเภทข้อมูลบางส่วนถูกเพิ่มภายหลังผ่านกลไก `safeAlter` จึงระบุ default ตามโค้ด)

---

## 1. `admins`
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| id | INT | PK, AUTO_INCREMENT | รหัสแอดมิน |
| username | VARCHAR(50) | UNIQUE | ชื่อผู้ใช้ |
| password | VARCHAR(255) | | รหัสผ่าน SHA-256 |
| name | VARCHAR(255) | | ชื่อแสดงผล |

ค่าเริ่มต้น: `admin` / `password123`

## 2. `zones`
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| id | INT | PK | อำเภอ = id จริง, ตำบล = id จริง + 10000 |
| name_th | TEXT | NOT NULL | ชื่อภาษาไทย |
| parent_id | INT | | อำเภอที่ตำบลสังกัด (null สำหรับอำเภอ) |

Seed จาก `korat_zones.json` (`districts` + `subDistricts`)

## 3. `categories`
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| id | INT | PK, AUTO_INCREMENT | รหัสหมวดหมู่ |
| name | TEXT | NOT NULL | ชื่อหมวดหมู่ |

## 4. `products`
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| id | INT | PK, AUTO_INCREMENT | รหัสสินค้า |
| name | TEXT | NOT NULL | ชื่อสินค้า |
| sku | VARCHAR(50) | UNIQUE, NOT NULL | รหัส SKU (เมื่อ sync จาก POS จะใช้ `pos.products.id`) |
| category_id | INT | | อ้างอิง `categories(id)` |
| price | DECIMAL(10,2) | NOT NULL | ราคาขายปลีก |
| wholesale_price | DECIMAL(10,2) | DEFAULT 0 | ราคาส่ง (patch) |
| unit | VARCHAR(20) | DEFAULT 'ชิ้น' | หน่วยนับ (patch) |
| image | LONGTEXT | | URL หรือ Base64 รูปสินค้า (patch) |
| barcode | VARCHAR(100) | | บาร์โค้ด (patch) |
| pos_product_id | VARCHAR(50) | UNIQUE index | อ้างอิง `pos.products.id` (patch) |

## 5. `vehicles`
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| id | VARCHAR(50) | PK | รหัสรถ เช่น `V-01` |
| plate_number | VARCHAR(20) | NOT NULL | ทะเบียนรถ |
| code | VARCHAR(20) | | รหัสเรียกขาน เช่น `VAN-01` |
| status | VARCHAR(20) | DEFAULT 'AVAILABLE' | AVAILABLE / MAINTENANCE |

## 6. `drivers`
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| id | VARCHAR(50) | PK | รหัสพนักงาน เช่น `d1` |
| name | VARCHAR(255) | NOT NULL | ชื่อ-นามสกุล |
| phone | VARCHAR(20) | | เบอร์โทร |
| work_status | VARCHAR(20) | DEFAULT 'OFFLINE' | ONLINE / OFFLINE |
| vehicle_plate | VARCHAR(50) | | ทะเบียนรถที่ขับ |
| vehicle_code | VARCHAR(50) | | รหัสรถที่ขับ |
| assigned_zone | VARCHAR(100) | | พื้นที่รับผิดชอบ |
| avatar_url | TEXT | | รูปโปรไฟล์ (default pravatar) |
| line_user_id | VARCHAR(100) | | LINE UID (patch) — ใช้ยืนยันตัวตน |
| line_display_name | VARCHAR(255) | | ชื่อ LINE (patch) |
| line_picture_url | TEXT | | รูปโปรไฟล์ LINE (patch) |

## 7. `stores`
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| id | VARCHAR(50) | PK | เช่น `st_1699999999` |
| name | VARCHAR(255) | NOT NULL | ชื่อร้าน |
| address | TEXT | | ที่อยู่ (ระบบพยายาม clean คำนำหน้า ต./อ./จ.) |
| sub_district | VARCHAR(100) | patch | ชื่อตำบล (heal จาก zones/address) |
| district | VARCHAR(100) | patch | ชื่ออำเภอ |
| sub_district_id | INT | patch | อ้างอิง `zones(id)` ของตำบล |
| lat / lng | DOUBLE | | พิกัด |
| type | VARCHAR(50) | | ประเภทร้าน (heal จาก eng → ไทย) |
| status | VARCHAR(50) | DEFAULT 'UNSURVEYED' | UNSURVEYED / SUCCESS / NOT_FOUND |
| verification_status | VARCHAR(50) | DEFAULT 'PENDING' | PENDING / APPROVED / REJECTED (patch) |
| photo_url | LONGTEXT | patch | รูปหน้าร้าน (Cloudinary URL หรือ Base64) |
| created_by | VARCHAR(50) | patch | ชื่อพนักงานที่เพิ่มร้าน |
| additional_info | — | (ส่งผ่าน API) | รายละเอียดเพิ่มเติม |
| discrepancy_reason | — | (ส่งผ่าน API) | เหตุผลกรณีข้อมูลไม่ตรง |
| is_customer | BOOLEAN | DEFAULT false (patch) | เป็นลูกค้าแล้วหรือยัง |
| phone | VARCHAR(50) | patch | เบอร์โทรร้าน |
| sales_zone | VARCHAR(100) | patch | โซนการขาย |
| assigned_driver_id | VARCHAR(50) | patch | พนักงานที่รับผิดชอบ |
| created_at | DATETIME | | เวลาสร้าง |

## 8. `inventory`
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| id | INT | PK, AUTO_INCREMENT | |
| product_id | INT | NOT NULL | อ้างอิง `products(id)` |
| quantity | INT | DEFAULT 0 | จำนวนคงเหลือ (ติดลบได้กรณี fallback) |
| location_id | VARCHAR(50) | patch | `''` = คลังหลัก, หรือรหัสรถ เช่น `V-01` |
| location_type | VARCHAR(50) | patch | `MASTER` / `VEHICLE` |

## 9. `stock_transactions`
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| id | INT | PK, AUTO_INCREMENT | |
| product_id | INT | | สินค้า |
| quantity | INT | | จำนวนที่เคลื่อนไหว |
| source_location | VARCHAR(50) | | ต้นทาง เช่น `MASTER` |
| target_location | VARCHAR(50) | | ปลายทาง เช่น `V-01` |
| transaction_type | VARCHAR(20) | | `TRANSFER` / `SALE` / `RETURN` |
| created_at | DATETIME | DEFAULT NOW | |

## 10. `sales`
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| id | VARCHAR(50) | PK | เช่น `sl_1699999999` |
| store_id | VARCHAR(50) | | อ้างอิงร้าน |
| driver_id | VARCHAR(50) | | อ้างอิงพนักงาน |
| vehicle_id | VARCHAR(50) | patch | รถที่ตัดสต็อก (บังคับต้องมีตอนบันทึกขาย) |
| total_amount | DECIMAL(10,2) | | ยอดรวมบิล |
| created_at | DATETIME | DEFAULT NOW | |

## 11. `sale_items`
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| id | INT | PK, AUTO_INCREMENT | |
| sale_id | VARCHAR(50) | | อ้างอิง `sales(id)` |
| product_id | INT | | อ้างอิง `products(id)` |
| quantity | INT | | จำนวน |
| price | DECIMAL(10,2) | | ราคาต่อหน่วย ณ เวลาขาย |

## 12. `visits`
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| id | INT | PK, AUTO_INCREMENT | |
| store_id | VARCHAR(50) | | ร้านที่เยี่ยม |
| driver_id | VARCHAR(50) | patch | พนักงานที่เยี่ยม |
| status | VARCHAR(50) | | SUCCESS / FAILED / CLOSED |
| photo_url | LONGTEXT | | รูปหลักฐาน |
| notes | TEXT | patch | หมายเหตุ |
| visited_at | DATETIME | DEFAULT NOW (patch) | เวลาเช็คอิน |

## 13. `survey_targets`
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| id | VARCHAR(50) | PK | เช่น `trg_1699999999` |
| name | VARCHAR(255) | NOT NULL | ชื่อเป้าหมาย |
| lat / lng | DOUBLE | | จุดศูนย์กลาง geofence |
| radius | INT | | รัศมี (เมตร, default 500) |
| color | VARCHAR(20) | | สีวงกลม (default `#3b82f6`) |
| assigned_driver_id | VARCHAR(50) | patch | พนักงานที่มอบหมาย |
| status | VARCHAR(20) | DEFAULT 'ACTIVE' | ACTIVE / ARCHIVED |

## 14. `driver_locations` (ตำแหน่งเรียลไทม์)
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| id | INT | PK, AUTO_INCREMENT | |
| driver_id | VARCHAR(50) | UNIQUE KEY | 1 แถวต่อพนักงาน (upsert) |
| lat / lng | DOUBLE | NOT NULL | ตำแหน่งล่าสุด |
| accuracy | FLOAT | | ความแม่นยำ (เมตร) |
| updated_at | DATETIME | ON UPDATE NOW | เวลาปรับปรุงล่าสุด |

## 15. `gps_tracks` (เส้นทางย้อนหลัง)
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| id | INT | PK, AUTO_INCREMENT | |
| driver_id | VARCHAR(50) | INDEX (driver_id, recorded_at) | พนักงาน |
| lat / lng | DOUBLE | NOT NULL | จุดพิกัด |
| recorded_at | DATETIME | DEFAULT NOW | เวลาที่บันทึกจุด |

## 16. `trips` (รอบเดินรถ — สคีมาพร้อม, ยังไม่เปิดใช้เต็มรูปแบบ)
| Column | Type | Description |
| :--- | :--- | :--- |
| id | VARCHAR(50) PK | รหัสรอบ |
| driver_id / vehicle_id / vehicle_plate | VARCHAR | พนักงาน/รถ |
| crew_count / crew_names | INT / TEXT | จำนวนและรายชื่อผู้ช่วย |
| departure_time / return_time | DATETIME | เวลาออก/กลับ |
| status | VARCHAR(20) | ACTIVE |
| planned_store_count | INT | จำนวนร้านที่วางแผน |
| notes | TEXT | หมายเหตุ |
| created_at | DATETIME | |

---

## 17. ตารางภายนอก: `pos.products` (อ่านอย่างเดียว)
ฟิลด์ที่ระบบ Cashvan ใช้: `id`, `barcode`, `name`, `category`, `retailPrice`, `wholesalePrice`, `unit`, `stock`, `image`
ใช้โดย `GET /api/pos-products` และ `POST /api/products/sync-from-pos`
