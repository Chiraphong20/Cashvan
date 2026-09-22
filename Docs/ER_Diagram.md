# โครงสร้างฐานข้อมูล (Entity-Relationship Diagram)

เอกสารนี้แสดงโครงสร้างฐานข้อมูล MySQL (`WH_logistic`) ของระบบ Wae Jer Logistic ตามที่นิยามใน `server/db.ts` และใช้งานจริงใน `server/index.ts`

> ระบบยังอ่านข้อมูลจากฐานข้อมูล **`pos`** (ระบบ line-commerce) บนเซิร์ฟเวอร์ MySQL เดียวกัน โดยเฉพาะตาราง `pos.products` — เป็นการอ่านอย่างเดียว ไม่มี Foreign Key ข้ามฐานข้อมูล

---

## 1. ER Diagram

```mermaid
erDiagram
    admins {
        int id PK
        varchar username "UNIQUE"
        varchar password "SHA-256"
        varchar name
    }

    zones {
        int id PK "subdistrict = จริง + 10000"
        text name_th
        int parent_id "อำเภอที่สังกัด"
    }

    categories {
        int id PK
        text name
    }

    products {
        int id PK
        text name
        varchar sku "UNIQUE"
        int category_id FK
        decimal price
        decimal wholesale_price
        varchar unit
        longtext image
        varchar barcode
        varchar pos_product_id "UNIQUE, อ้างอิง pos.products.id"
    }

    vehicles {
        varchar id PK "เช่น V-01"
        varchar plate_number
        varchar code
        varchar status "AVAILABLE / MAINTENANCE"
    }

    drivers {
        varchar id PK "เช่น d1"
        varchar name
        varchar phone
        varchar work_status "ONLINE / OFFLINE"
        varchar vehicle_plate
        varchar vehicle_code
        varchar assigned_zone
        text avatar_url
        varchar line_user_id
        varchar line_display_name
        text line_picture_url
    }

    stores {
        varchar id PK "เช่น st_1699999999"
        varchar name
        text address
        varchar sub_district
        varchar district
        int sub_district_id FK
        double lat
        double lng
        varchar type
        varchar status "UNSURVEYED / SUCCESS / NOT_FOUND"
        varchar verification_status "PENDING / APPROVED / REJECTED"
        longtext photo_url
        varchar created_by "ชื่อพนักงาน"
        boolean is_customer
        varchar phone
        varchar sales_zone
        varchar assigned_driver_id
        datetime created_at
    }

    inventory {
        int id PK
        int product_id FK
        int quantity
        varchar location_id "'' = MASTER, หรือรหัสรถ V-01"
        varchar location_type "MASTER / VEHICLE"
    }

    stock_transactions {
        int id PK
        int product_id FK
        int quantity
        varchar source_location
        varchar target_location
        varchar transaction_type "TRANSFER / SALE / RETURN"
        datetime created_at
    }

    sales {
        varchar id PK "เช่น sl_1699999999"
        varchar store_id FK
        varchar driver_id FK
        varchar vehicle_id FK
        decimal total_amount
        datetime created_at
    }

    sale_items {
        int id PK
        varchar sale_id FK
        int product_id FK
        int quantity
        decimal price
    }

    visits {
        int id PK
        varchar store_id FK
        varchar driver_id FK
        varchar status "SUCCESS / FAILED / CLOSED"
        longtext photo_url
        text notes
        datetime visited_at
    }

    survey_targets {
        varchar id PK "เช่น trg_1699999999"
        varchar name
        double lat
        double lng
        int radius "เมตร"
        varchar color
        varchar assigned_driver_id FK
        varchar status "ACTIVE / ARCHIVED"
    }

    driver_locations {
        int id PK
        varchar driver_id "UNIQUE (upsert รายคน)"
        double lat
        double lng
        float accuracy
        datetime updated_at
    }

    gps_tracks {
        int id PK
        varchar driver_id "INDEX (driver_id, recorded_at)"
        double lat
        double lng
        datetime recorded_at
    }

    trips {
        varchar id PK
        varchar driver_id
        varchar vehicle_id
        varchar vehicle_plate
        int crew_count
        text crew_names
        datetime departure_time
        datetime return_time
        varchar status "ACTIVE"
        int planned_store_count
        text notes
        datetime created_at
    }

    zones ||--o{ zones : "อำเภอ→ตำบล (parent_id)"
    zones ||--o{ stores : "sub_district_id"
    categories ||--o{ products : "has"
    products ||--o{ inventory : "stocked as"
    products ||--o{ stock_transactions : "logged in"
    products ||--o{ sale_items : "sold as"
    sales ||--o{ sale_items : "contains"
    stores ||--o{ sales : "purchases"
    drivers ||--o{ sales : "makes"
    vehicles ||--o{ sales : "from"
    stores ||--o{ visits : "receives"
    drivers ||--o{ visits : "conducts"
    drivers ||--o{ driver_locations : "last position"
    drivers ||--o{ gps_tracks : "trail points"
    drivers ||--o{ trips : "runs"
    drivers ||--o{ survey_targets : "assigned to"
```

---

## 2. หมายเหตุการออกแบบที่สำคัญ

- **Primary Key เป็น VARCHAR** สำหรับ `stores` (`st_<timestamp>`), `sales` (`sl_<timestamp>`), `drivers` (`d1`, ...), `vehicles` (`V-01`), `survey_targets` (`trg_<timestamp>`) — สร้างจากฝั่งแอปพลิเคชัน ไม่ใช่ AUTO_INCREMENT
- **`inventory` ไม่มี composite key** — ใช้ `id` AUTO_INCREMENT และค้นด้วยคู่ (`product_id`, `location_id`); MASTER คือ `location_type = 'MASTER'` และ `location_id = ''`
- **`zones`** เก็บทั้งอำเภอและตำบลในตารางเดียว: ตำบลใช้ `id` = ค่าจริง + 10000 และ `parent_id` ชี้ไปที่อำเภอ (seed จาก `korat_zones.json`)
- **สถานะร้าน 2 มิติ:** `stores.status` (ความคืบหน้าการเยี่ยม) แยกจาก `stores.verification_status` (ผลการตรวจสอบโดยแอดมิน)
- **`sale_items` ไม่มีคอลัมน์ `total`** — คำนวณ `quantity * price` ตอนแสดงผล
- **`pos_product_id`** เชื่อม `products` กับ `pos.products` แบบ logical (มี UNIQUE index) ใช้ตอน sync แคตตาล็อก
- **การลบร้าน** เป็น cascade ที่ระดับแอปพลิเคชัน (ลบ `sale_items` → `sales` → `visits` → `stores`)
- ตาราง `trips` มีอยู่ในสคีมาเพื่อรองรับฟีเจอร์บันทึกรอบเดินรถ/ทีมงาน แต่ยังไม่มี API endpoint ใช้งานเต็มรูปแบบในปัจจุบัน
