# API Documentation (เอกสาร API)

REST API ทั้งหมดในระบบ Wae Jer Logistic ถูกออกแบบและทำงานผ่าน `server/index.ts` (Express.js) รันบนพอร์ต `3001` โดยมี Endpoint หลักๆ ดังนี้

---

## 1. Authentication & Admin Profile

### `POST /api/admin/login`
- **Description**: ยืนยันตัวตนแอดมินด้วย Username และ Password
- **Request Body**: `{ "username": "admin", "password": "password123" }`
- **Response**: `{ "status": "success", "admin": { "id": 1, "username": "admin", "name": "System Admin" }, "token": "fake-jwt-token-1" }`

### `GET /api/admin/profile?id=1`
- **Description**: ดึงข้อมูลโปรไฟล์ของแอดมิน

### `PUT /api/admin/profile`
- **Description**: อัปเดตข้อมูลส่วนตัว (ชื่อ และ/หรือ รหัสผ่าน)
- **Request Body**: `{ "id": 1, "name": "New Name", "newPassword": "newPassword" }`

---

## 2. Store & Survey (ร้านค้าและพิกัด)

### `GET /api/stores`
- **Description**: ดึงรายการร้านค้าทั้งหมดเพื่อใช้แสดงบนแผนที่ และตรวจสอบสถานะล่าสุด

### `POST /api/stores`
- **Description**: เพิ่มร้านค้าใหม่เข้าสู่ระบบ (มักใช้จากฝั่ง Driver เวลาเจอร้านใหม่)
- **Request Body**: `{ "name": "Store A", "lat": 14.9, "lng": 102.1, "type": "Retail" }`

### `POST /api/visits`
- **Description**: บันทึกการเข้าเยี่ยมร้าน (Store Survey)
- **Request Body**: `{ "storeId": 1, "driverId": 1, "status": "SURVEYED", "photoUrl": "data:image/jpeg;base64,...", "notes": "Shop is closed today" }`
- **Action**: บันทึกลงตาราง `visits` และอัปเดตตาราง `stores` คอลัมน์ `status` กับ `photo_url`

---

## 3. Inventory & Master Data

### `GET /api/inventory`
- **Description**: ดึงรายการสินค้าคงคลังทั้งหมด รองรับ Query String `?type=master` สำหรับคลังหลัก หรือ `?type=van&location_id=V-01` สำหรับดึงเฉพาะของบนรถคันนั้น
- **Response Format**: `[{ "id": 1, "product_id": 1, "name": "Product A", "quantity": 100, ... }]`

### `POST /api/inventory/refill`
- **Description**: โอนย้ายสต็อกสินค้าจากคลังหลัก เข้าสู่รถ (Van)
- **Request Body**: `{ "items": [{ "product_id": 1, "quantity": 10 }], "vehicle_id": "V-01" }`
- **Action**: ลดสต็อกจาก `MASTER`, เพิ่มสต็อกให้ `V-01`, และสร้าง Log ใน `stock_transactions`

### `GET /api/products`
- **Description**: ดึงรายการข้อมูลสินค้าหลัก (Master Products)

### `POST /api/products` / `PUT /api/products/:id` / `DELETE /api/products/:id`
- **Description**: จัดการข้อมูล Master Products (Admin Use Only)

---

## 4. Sales & Transactions

### `GET /api/sales`
- **Description**: ดึงรายการประวัติการขายทั้งหมด

### `POST /api/sales`
- **Description**: บันทึกการขายเมื่อพนักงานรับออเดอร์หน้าร้าน
- **Request Body**: 
  ```json
  {
    "store_id": 1,
    "driver_id": 1,
    "total_amount": 500.00,
    "items": [
      { "product_id": 1, "quantity": 2, "price": 100.00 },
      { "product_id": 2, "quantity": 1, "price": 300.00 }
    ],
    "vehicle_id": "V-01"
  }
  ```
- **Action**: สร้าง Order ใน `sales` และ `sale_items`, หักลบสต็อกที่ `location_id = 'V-01'` ในตาราง `inventory`

---

## 5. Drivers & Employees

### `GET /api/drivers`
- **Description**: ดึงรายการพนักงานขับรถทั้งหมด พร้อมรถที่ขับ (`vehicle_id`)

### `PUT /api/drivers/:id/status`
- **Description**: อัปเดตสถานะการทำงานของพนักงาน (เช่น กำลังวิ่งงาน, พัก)

*(หมายเหตุ: ระบบรับส่งภาพบางส่วนใช้การอัปโหลดแบบ Base64 ซึ่งรองรับใน Endpoint `POST /api/visits` โดยได้กำหนด limit payload ใน Express ไว้สูงถึง 50mb เรียบร้อยแล้ว)*
