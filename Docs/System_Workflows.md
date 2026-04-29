# กระบวนการทำงานของระบบ (System Workflows)

เอกสารส่วนนี้อธิบาย Flow การทำงานหลักๆ ของระบบ Wae Jer Logistic ตั้งแต่เริ่มวันทำงาน ไปจนถึงการเติมสต็อกและการตรวจสอบข้อมูลโดยแอดมิน

---

## 1. การเติมสต็อกเข้าสู่รถ (Van Refill Workflow)
ก่อนที่พนักงานขับรถจะออกเดินทาง แอดมินต้องทำการโอนย้ายสินค้าจากคลังหลัก (Master) เข้าสู่รถ (Van)

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend as Admin Dashboard
    participant Backend as API Server
    participant DB as MySQL Database

    Admin->>Frontend: เข้าเมนู "สต็อกสินค้าและคลัง" (Inventory)
    Admin->>Frontend: เลือก "เติมของให้รถ (Refill)"
    Frontend->>Backend: GET /api/inventory?type=master
    Backend-->>Frontend: ส่งรายการสินค้าในคลังหลัก
    Admin->>Frontend: เลือกสินค้า จำนวน และ เลือกรถเป้าหมาย (Van)
    Admin->>Frontend: กดบันทึก (Confirm Refill)
    Frontend->>Backend: POST /api/inventory/refill (product_id, qty, vehicle_id)
    Backend->>DB: ลดจำนวนสต็อก Master
    Backend->>DB: เพิ่มจำนวนสต็อก Van
    Backend->>DB: บันทึกลง stock_transactions
    Backend-->>Frontend: ส่งสถานะ Success
    Frontend-->>Admin: แสดงข้อความยืนยันการทำรายการ
```

---

## 2. การลงพื้นที่และการสำรวจร้านค้า (Check-in & Survey Workflow)
กระบวนการที่พนักงานขับรถใช้เมื่อเดินทางไปถึงร้านค้าเป้าหมาย

```mermaid
sequenceDiagram
    actor Driver
    participant LIFF as LINE LIFF (Auth)
    participant FE as Driver Web App
    participant BE as API Server
    participant DB as MySQL Database

    Driver->>LIFF: เปิดหน้าแอปผ่าน LINE
    LIFF-->>FE: ส่งข้อมูล Profile (line_user_id)
    FE->>BE: ตรวจสอบพนักงาน (Login)
    BE-->>FE: ส่งข้อมูลพนักงาน (Driver Info)
    
    Driver->>FE: เข้าเมนู "แผนที่ร้านค้า (CheckInMap)"
    FE->>BE: GET /api/stores
    BE-->>FE: ส่งพิกัดร้านค้าทั้งหมด
    
    Driver->>FE: เลือกจุดบนแผนที่และกด "Check-in"
    FE->>FE: ดึง GPS (Geolocation API) เพื่อตรวจสอบระยะ
    Driver->>FE: กรอกข้อมูลสถานะร้าน ถ่ายภาพ (อัปโหลด)
    Driver->>FE: กดบันทึก (Submit Survey)
    
    FE->>BE: POST /api/visits
    BE->>DB: บันทึกข้อมูลการเข้าเยี่ยม (visits table)
    BE-->>FE: ส่งสถานะ Success
```

---

## 3. การสร้างออเดอร์และการขายสินค้า (Sales Workflow)
เมื่อพนักงานอยู่หน้าร้านและทำการเสนอขายสินค้า

```mermaid
sequenceDiagram
    actor Driver
    participant FE as Driver Web App
    participant BE as API Server
    participant DB as MySQL Database

    Driver->>FE: เปิด "รายการสินค้า (Digital Catalog)"
    FE->>BE: GET /api/inventory?type=van&location_id={vehicle_id}
    BE-->>FE: ส่งรายการสต็อกที่มีอยู่บนรถ
    
    Driver->>FE: เลือกสินค้าและจำนวน ใส่ตะกร้า
    Driver->>FE: ยืนยันการสั่งซื้อ
    FE->>BE: POST /api/sales
    
    Note right of BE: Transaction Start
    BE->>DB: Insert in `sales` table (Total Amount)
    BE->>DB: Insert in `sale_items` table (Items detail)
    BE->>DB: Update `inventory` (Deduct from Van Stock)
    Note right of BE: Transaction Commit
    
    BE-->>FE: ส่งใบเสร็จหรือผลการทำงาน Success
```

---

## 4. การดูภาพรวมและพิกัดพนักงาน (Fleet Tracking Workflow)
กระบวนการของแอดมินในการตรวจสอบพนักงานบนแผนที่

```mermaid
sequenceDiagram
    actor Admin
    participant FE as Admin Dashboard
    participant BE as API Server
    participant DB as MySQL Database

    Admin->>FE: เข้าเมนู "Map Overview / Fleet Tracking"
    FE->>BE: GET /api/stores (ดึงร้านค้า)
    FE->>BE: GET /api/visits/today (ดึงประวัติเยี่ยมร้านของวันนี้)
    BE-->>FE: ส่งข้อมูลทั้งหมด
    
    FE->>FE: Render พิกัดแผนที่ (Leaflet) 
    Note over FE: แสดงหมุดสีเขียวสำหรับร้านที่เช็คอินแล้ว<br/>และสีเทาสำหรับร้านที่ยังไม่ไป
```
