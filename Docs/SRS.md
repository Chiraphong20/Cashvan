# Software Requirements Specification (SRS)

## 1. บทนำ

เอกสาร SRS ฉบับนี้กำหนดความต้องการทั้งหมดของระบบ Wae Jer Logistic (Cashvan & Survey Management) โดยปรับปรุงให้สอดคล้องกับซอร์สโค้ดปัจจุบัน (เวอร์ชัน 1.2.x)

---

## 2. ความต้องการเชิงฟังก์ชัน (Functional Requirements)

### 2.1 ระบบสำหรับพนักงาน (Driver / Cashvan Application)

| ID | Feature | Description |
| :--- | :--- | :--- |
| FR-D01 | **LINE LIFF Authentication** | เข้าระบบผ่าน LINE LIFF ดึงโปรไฟล์ (`userId`, `displayName`, `pictureUrl`) และเทียบกับ `drivers.line_user_id` ผ่าน `POST /api/drivers/auth-line` |
| FR-D02 | **Driver Binding** | ถ้ายังไม่ผูกบัญชี ให้เลือกชื่อพนักงานจากรายการแล้ว `POST /api/drivers/bind-line` เพื่อบันทึก `line_user_id`, `line_display_name`, `line_picture_url` |
| FR-D03 | **Realtime Location Ping** | ขณะล็อกอิน ระบบส่งพิกัดปัจจุบันเข้า `POST /api/driver-location` ทุก 30 วินาที (upsert รายคนใน `driver_locations`) |
| FR-D04 | **GPS Trail Recording** | ขณะเปิดหน้าแผนที่ ระบบเก็บจุดพิกัด (distanceFilter 5m) และส่งเป็น batch เข้า `POST /api/gps-track` เพื่อสร้างเส้นทางรายวัน (`gps_tracks`) |
| FR-D05 | **GPS Error Handling** | เมื่อสิทธิ์ GPS ถูกปฏิเสธ/ไม่มีสัญญาณ/หมดเวลา ต้องแสดง banner ข้อความภาษาไทยที่อธิบายวิธีแก้ |
| FR-D06 | **Store Map** | แสดงหมุดร้านค้าทั้งหมด สีของหมุดสื่อสถานะ (`SUCCESS` = เขียว, อื่น ๆ = แดง) พร้อมวงกลมเป้าหมายสำรวจ |
| FR-D07 | **Store List & Filter** | รายการร้าน กรองด้วยชื่อ/อำเภอ/ตำบล และแท็บ "ยังไม่ไป (status ≠ SUCCESS) / เสร็จแล้ว"; ซ่อน `is_admin_only` และ `NOT_FOUND` |
| FR-D08 | **Check-in & Geofence Distance** | ดึง GPS ปัจจุบัน คำนวณระยะห่างจากพิกัดร้าน (Haversine) เพื่อยืนยันว่าอยู่หน้าร้านจริง |
| FR-D09 | **Store Survey + Photo Upload** | อัปโหลดรูปหน้าร้านไป Cloudinary, เลือกสถานะ (SUCCESS / CLOSED / FAILED), กรอกหมายเหตุ; บันทึกลง `visits` ผ่าน `POST /api/visits` |
| FR-D10 | **Add New Store** | เพิ่มร้านใหม่ (`POST /api/stores`) พร้อม lat/lng, sub_district_id, type, phone, `created_by` = ชื่อพนักงาน, `verification_status = 'PENDING'` |
| FR-D11 | **Van Stock Viewer** | ดูสต็อกบนรถของคันที่เลือก (`GET /api/inventory?vehicle_id=V-01`) |
| FR-D12 | **Sales Recording (Cart)** | เลือกสินค้า/จำนวน คำนวณยอดรวม แล้ว `POST /api/sales` (ต้องมี `vehicle_id`) |
| FR-D13 | **Auto Stock Deduction** | เมื่อบันทึกการขาย ระบบตัด `inventory.quantity` ของรถคันนั้นในทรานแซกชันเดียว, สร้าง Visit `SUCCESS`, อัปเดต `stores.status = 'SUCCESS'` |
| FR-D14 | **Visit History** | ดูประวัติการเยี่ยมของตนเอง (`GET /api/visits?driver_id=...`) |
| FR-D15 | **Close Day / Stock Count** | นับสต็อกจริงเทียบยอดคาดหวัง แสดงผลต่างรายสินค้า และคืนสต็อก (`POST /api/inventory/return` หรือ `/api/reconciliation`) |

### 2.2 ระบบสำหรับผู้ดูแลระบบ (Admin Web Application)

| ID | Feature | Description |
| :--- | :--- | :--- |
| FR-A01 | **Admin Login** | `POST /api/admin/login` ตรวจ SHA-256; สำเร็จคืน `admin` + token จำลอง เก็บใน localStorage |
| FR-A02 | **Route Guard** | `AdminLayout` ตรวจ `currentAdmin` จาก Context; ไม่มีให้ redirect ไป `/admin/login` |
| FR-A03 | **Dashboard** | สรุปจำนวนร้าน, ร้านที่สำรวจแล้ว, การเยี่ยมในช่วงเวลา (วันนี้/สัปดาห์/เดือน), ความคืบหน้ารายอำเภอ |
| FR-A04 | **Map Overview / Fleet Tracking** | Leaflet + GeoJSON ขอบเขตอำเภอ, หมุดร้านตามสถานะ, geofence, ตำแหน่งรถเรียลไทม์ (`GET /api/driver-locations` poll 30s), เส้นทาง GPS ย้อนหลัง (`GET /api/gps-tracks?date=`), ปุ่มขอเส้นทาง |
| FR-A05 | **Master Inventory** | ดู/แก้ไขจำนวนสินค้าในคลังหลัก (`PUT /api/inventory`) |
| FR-A06 | **Van Stock View** | ดูสต็อกคงเหลือแยกรายคัน |
| FR-A07 | **Stock Transfer (Refill)** | โอนสต็อก MASTER → รถ ผ่าน `POST /api/inventory/transfer` พร้อมบันทึก `stock_transactions` (type `TRANSFER`) |
| FR-A08 | **Product Management** | เพิ่ม/แก้ไข/ลบสินค้า (`POST/PUT/DELETE /api/products`) |
| FR-A09 | **POS Reference** | ดูสต็อกสดจาก `pos.products` (`GET /api/pos-products` — ค้นหา + แบ่งหน้า) แบบอ่านอย่างเดียว |
| FR-A10 | **POS Catalog Import** | นำเข้าแคตตาล็อกจาก POS (`POST /api/products/sync-from-pos`) — สร้างหมวดหมู่/สินค้าใหม่ + inventory MASTER; ของเดิม (จับคู่ `pos_product_id`) อัปเดตเฉพาะข้อมูลสินค้า ไม่แตะสต็อก |
| FR-A11 | **Employee Management** | เพิ่ม/แก้ไข/ลบพนักงาน (`POST/PUT/DELETE /api/drivers`); whitelist ฟิลด์; แก้ชื่อ cascade ไป `stores.created_by` |
| FR-A12 | **Survey Audit** | Approve/Reject ร้านที่ `status = 'SUCCESS'` โดยตั้ง `verification_status` |
| FR-A13 | **Sales Reports** | รายการบิลพร้อมรายละเอียดสินค้า, พื้นที่ (อำเภอ/ตำบล), เปรียบเทียบผลงานพนักงาน, ตัวกรองช่วงเวลา, ลบบิลแล้วคืนสต็อก (`DELETE /api/sales/:id`) |
| FR-A14 | **Survey Target Management** | เพิ่ม/ลบ geofence (`POST/DELETE /api/survey-targets`) — ลบคือตั้งสถานะ `ARCHIVED` |
| FR-A15 | **Admin Profile** | เปลี่ยนชื่อ/รหัสผ่าน (`PUT /api/admin/profile`) |

---

## 3. ความต้องการที่ไม่ใช่ฟังก์ชัน (Non-Functional Requirements)

### 3.1 ประสิทธิภาพ (Performance)
- **Response Time:** API งานทั่วไปตอบกลับภายใน ~2 วินาที
- **Payload Limit:** Express รองรับ JSON/urlencoded สูงสุด **50MB** ต่อคำขอ (รองรับรูป Base64 กรณี fallback)
- **Location Polling:** ฝั่ง Admin poll `driver_locations` ทุก 30 วินาที; ฝั่ง Driver ส่งพิกัดทุก 30 วินาที
- **POS Query:** `GET /api/pos-products` จำกัดสูงสุด 200 รายการต่อครั้ง (default 50) พร้อม offset paging

### 3.2 ความปลอดภัย (Security)
- รหัสผ่าน Admin เข้ารหัส **SHA-256** ไม่เก็บ plain text; API ไม่คืนฟิลด์ `password`
- หน้า Admin ถูก guard ที่ฝั่ง client ผ่าน `AdminLayout` + `AdminAuthContext`
- การเชื่อมต่อ POS เป็น **read-only** เท่านั้น
- `PUT /api/drivers/:id` ใช้ whitelist คอลัมน์ที่อนุญาต

> ข้อจำกัดที่ทราบ: token ปัจจุบันเป็นค่าจำลอง และ API ฝั่ง backend ยังไม่ตรวจสอบสิทธิ์รายคำขอ — ควรเพิ่ม JWT/middleware ในเฟสถัดไป

### 3.3 ความเข้ากันได้ (Compatibility)
- **Driver Web App:** หน้าจอแนวตั้ง (Portrait) บน Mobile Browser / LINE in-app browser; layout จำกัดความกว้าง `max-w-md`
- **Admin Dashboard:** Desktop/Laptop ความละเอียด 1024px ขึ้นไป

### 3.4 ความเสถียร (Reliability)
- `initDB()` ทำ **auto-heal**: `CREATE TABLE IF NOT EXISTS` + ตรวจเพิ่มคอลัมน์ที่ขาดทีละคอลัมน์เมื่อบูตเซิร์ฟเวอร์
- Seeding อัตโนมัติเมื่อฐานข้อมูลว่าง: หมวดหมู่/สินค้าตัวอย่าง, รถ `V-01`, บัญชี `admin`, และ zones จาก `korat_zones.json`
- การขาย/โอนสต็อก/ลบบิล ใช้ MySQL Transaction (commit/rollback)
- Backend ตั้ง timezone `+07:00` ทุก connection

### 3.5 การจัดเก็บรูปภาพ
- รูปหน้าร้านอัปโหลดไป **Cloudinary**; หากไม่ได้ตั้งค่าหรืออัปโหลดล้มเหลว จะ fallback บีบอัดภาพเป็น JPEG Base64 (สูงสุด 800px, คุณภาพ 60%)
- คอลัมน์ `photo_url` ใน `stores` และ `visits` เป็น `LONGTEXT`
