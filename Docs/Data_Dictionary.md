# พจนานุกรมข้อมูล (Data Dictionary)

เอกสารนี้รวบรวมคำอธิบายโครงสร้างของแต่ละตารางในฐานข้อมูล MySQL ที่ใช้ในระบบ Wae Jer Logistic

---

## 1. Table: `admins`
ตารางเก็บข้อมูลผู้ดูแลระบบและรหัสผ่านสำหรับเข้าสู่ระบบ Admin Dashboard

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | รหัสประจำตัวแอดมิน |
| `username` | VARCHAR(255) | UNIQUE, NOT NULL | ชื่อผู้ใช้สำหรับล็อกอิน |
| `password` | VARCHAR(255) | NOT NULL | รหัสผ่านที่เข้ารหัสด้วย SHA-256 |
| `name` | VARCHAR(255) | NOT NULL | ชื่อแสดงผลของแอดมิน |

## 2. Table: `categories`
หมวดหมู่สินค้าหลัก

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | รหัสหมวดหมู่ |
| `name` | VARCHAR(255) | NOT NULL | ชื่อหมวดหมู่ (เช่น เครื่องดื่ม, ของใช้) |

## 3. Table: `products`
ตารางข้อมูลสินค้า (Master Products)

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | รหัสสินค้า |
| `code` | VARCHAR(255) | UNIQUE, NOT NULL | รหัสสินค้าจากระบบ MOC (เช่น MOC-001) |
| `name` | VARCHAR(255) | NOT NULL | ชื่อสินค้า |
| `category_id` | INT | FK | อ้างอิงตาราง categories(id) |
| `price` | DECIMAL(10,2) | NOT NULL | ราคาขายปกติ |
| `image_url` | TEXT | | ลิงก์รูปภาพสินค้า |

## 4. Table: `vehicles`
ตารางข้อมูลรถที่ใช้สำหรับกระจายสินค้า

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(50) | PK | รหัสรถ (เช่น V-01) |
| `plate_number` | VARCHAR(100) | NOT NULL | ทะเบียนรถ |
| `code` | VARCHAR(100) | | รหัสเรียกขานรถ (เช่น VAN-01) |
| `status` | VARCHAR(50) | DEFAULT 'ACTIVE' | สถานะของรถ (ACTIVE / MAINTENANCE) |

## 5. Table: `drivers`
ข้อมูลพนักงานขับรถหรือหน่วยขาย

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | รหัสพนักงาน |
| `name` | VARCHAR(255) | NOT NULL | ชื่อ-นามสกุลพนักงาน |
| `phone` | VARCHAR(50) | | เบอร์โทรศัพท์ |
| `work_status` | VARCHAR(50) | DEFAULT 'OFF_DUTY' | สถานะการทำงาน (ON_DUTY / OFF_DUTY) |
| `line_user_id` | VARCHAR(255) | UNIQUE | รหัส LINE UID สำหรับใช้ยืนยันตัวตนผ่าน LIFF |
| `vehicle_id` | VARCHAR(50) | FK | อ้างอิงรถที่ขับในปัจจุบัน vehicles(id) |

## 6. Table: `stores`
ฐานข้อมูลร้านค้าย่อยในพื้นที่

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | รหัสร้านค้า |
| `name` | VARCHAR(255) | NOT NULL | ชื่อร้านค้า |
| `lat` | DECIMAL(10,8) | | ละติจูด |
| `lng` | DECIMAL(11,8) | | ลองจิจูด |
| `type` | VARCHAR(100) | | ประเภทร้านค้า (เช่น โชห่วย, ร้านอาหาร) |
| `status` | VARCHAR(50) | DEFAULT 'PENDING' | สถานะการเยี่ยม (PENDING / SURVEYED / SUCCESS) |
| `photo_url` | LONGTEXT | | ภาพหน้าร้าน (มักเก็บเป็น Base64) |
| `last_visited` | DATETIME | | เวลาล่าสุดที่มีพนักงานไปเยี่ยมร้าน |

## 7. Table: `inventory`
ตารางสต็อกสินค้าทั้งหมด เป็นการเก็บสต็อกแยกตามตำแหน่งที่อยู่ (Location)

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `product_id` | INT | PK, FK | อ้างอิง products(id) |
| `location_id` | VARCHAR(50) | PK | รหัสสถานที่ ('MASTER' สำหรับคลังหลัก, หรือ 'V-01' สำหรับรถ) |
| `location_type` | VARCHAR(50) | NOT NULL | 'MASTER' หรือ 'VAN' |
| `quantity` | INT | DEFAULT 0 | จำนวนสินค้าคงเหลือ ณ สถานที่นั้น |

## 8. Table: `stock_transactions`
บันทึกประวัติการเปลี่ยนแปลงสต็อก (Audit Log สำหรับสต็อก)

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | รหัสรายการ |
| `product_id` | INT | FK | อ้างอิง products(id) |
| `from_location` | VARCHAR(50) | | ต้นทาง (เช่น MASTER) |
| `to_location` | VARCHAR(50) | | ปลายทาง (เช่น V-01) |
| `quantity` | INT | NOT NULL | จำนวนที่โอนย้าย/เพิ่ม/ลด |
| `transaction_type`| VARCHAR(50) | NOT NULL | ประเภท (REFILL / SALE / RETURN) |
| `created_at` | DATETIME | DEFAULT NOW() | วันเวลาที่ทำรายการ |

## 9. Table: `sales` และ `sale_items`
ตารางเก็บข้อมูลบิลขาย

**sales**
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | รหัสบิลขาย |
| `store_id` | INT | FK | อ้างอิงร้านค้าที่ซื้อ stores(id) |
| `driver_id` | INT | FK | อ้างอิงพนักงานขับรถที่ขาย drivers(id) |
| `total_amount` | DECIMAL(10,2) | NOT NULL | ยอดขายรวมทั้งบิล |
| `created_at` | DATETIME | DEFAULT NOW() | วันเวลาที่ขาย |

**sale_items**
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | รหัสรายการย่อย |
| `sale_id` | INT | FK | อ้างอิง sales(id) |
| `product_id` | INT | FK | อ้างอิง products(id) |
| `quantity` | INT | NOT NULL | จำนวนที่ขาย |
| `price` | DECIMAL(10,2) | NOT NULL | ราคาต่อชิ้น ณ ตอนขาย |
| `total` | DECIMAL(10,2) | NOT NULL | ยอดรวมของสินค้านี้ (qty * price) |

## 10. Table: `visits`
เก็บประวัติการบันทึกข้อมูลการเยี่ยมร้านของพนักงาน (Store Survey Log)

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | รหัสรายการเยี่ยมร้าน |
| `store_id` | INT | FK | ร้านที่เยี่ยม |
| `driver_id` | INT | FK | พนักงานที่เยี่ยม |
| `status` | VARCHAR(50) | | สถานะที่พนักงานรายงาน (เช่น CLOSED, ACTIVE) |
| `photo_url` | LONGTEXT | | ภาพหลักฐานการเยี่ยมร้าน |
| `notes` | TEXT | | บันทึกเพิ่มเติมจากพนักงาน |
| `visited_at` | DATETIME | DEFAULT NOW() | เวลาที่เช็คอิน |
