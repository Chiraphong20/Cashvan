# กระบวนการทำงานของระบบ (System Workflows)

อธิบาย Flow การทำงานหลักของระบบ Wae Jer Logistic ตามการทำงานจริงของโค้ดปัจจุบัน

---

## 1. การนำเข้าแคตตาล็อกจาก POS และการโอนสต็อกขึ้นรถ

```mermaid
sequenceDiagram
    actor Admin
    participant FE as Admin Inventory
    participant BE as API Server
    participant WH as MySQL WH_logistic
    participant POS as MySQL pos

    Admin->>FE: แท็บ "อ้างอิง POS" → กด "นำเข้าจาก POS"
    FE->>BE: POST /api/products/sync-from-pos
    BE->>POS: SELECT id, barcode, name, category, retailPrice, ... FROM pos.products
    loop สินค้าแต่ละรายการ
        BE->>WH: upsert categories (ตามชื่อ)
        alt มี pos_product_id อยู่แล้ว
            BE->>WH: UPDATE products (ชื่อ/ราคา/หน่วย/รูป) — ไม่แตะสต็อก
        else สินค้าใหม่
            BE->>WH: INSERT products + INSERT inventory (MASTER, stock จาก POS)
        end
    end
    BE-->>FE: { newProducts, updatedProducts, total }

    Note over Admin,WH: จากนั้นทำ Van Transfer
    Admin->>FE: แท็บ "สต็อกรถ" → เลือกรถ + สินค้า + จำนวน → ยืนยัน
    FE->>BE: POST /api/inventory/transfer { location_id, items }
    BE->>WH: ลด MASTER, เพิ่ม/สร้างที่รถ, INSERT stock_transactions (TRANSFER)
    BE-->>FE: success
```

---

## 2. การเข้าระบบของพนักงานผ่าน LINE และการติดตาม GPS

```mermaid
sequenceDiagram
    actor Driver
    participant LIFF as LINE LIFF
    participant FE as Driver Web App
    participant BE as API Server
    participant WH as MySQL

    Driver->>LIFF: เปิดแอปผ่าน LINE (Rich Menu)
    LIFF-->>FE: liff.getProfile() → { userId, displayName, pictureUrl }
    FE->>BE: POST /api/drivers/auth-line { line_user_id }
    alt พบบัญชีที่ผูกแล้ว
        BE-->>FE: { status: success, driver }
    else ยังไม่ผูก
        BE-->>FE: { status: not_found }
        Driver->>FE: หน้า DriverLogin → เลือกชื่อพนักงาน
        FE->>BE: POST /api/drivers/bind-line { driver_id, line_user_id, ... }
        BE->>WH: UPDATE drivers SET line_user_id, line_display_name, line_picture_url
        BE-->>FE: { status: success, driver }
    end

    loop ทุก 30 วินาที (ขณะล็อกอิน)
        FE->>BE: POST /api/driver-location { driver_id, lat, lng, accuracy }
        BE->>WH: upsert driver_locations
    end
    loop ขณะเปิดหน้าแผนที่ (distanceFilter 5m)
        FE->>FE: เก็บจุดพิกัดสะสม
        FE->>BE: POST /api/gps-track { driver_id, points[] }
        BE->>WH: batch INSERT gps_tracks
    end
```

---

## 3. การเช็คอินและสำรวจร้านค้า

```mermaid
sequenceDiagram
    actor Driver
    participant FE as Driver Web App
    participant CLD as Cloudinary
    participant BE as API Server
    participant WH as MySQL

    Driver->>FE: เลือกร้านจากแผนที่/รายการ → หน้า CheckInPage
    FE->>FE: ดึง GPS ปัจจุบัน + คำนวณระยะห่างจากร้าน (Haversine)
    Driver->>FE: ถ่ายรูปหน้าร้าน
    FE->>CLD: uploadToCloudinary(file)
    CLD-->>FE: secure_url (หรือ fallback Base64)
    Driver->>FE: เลือกสถานะ (SUCCESS / CLOSED / FAILED) + หมายเหตุ → ยืนยัน
    FE->>BE: POST /api/visits { store_id, driver_id, status, photo_url, notes }
    BE->>WH: INSERT visits
    opt เพิ่มร้านใหม่
        Driver->>FE: กรอกข้อมูลร้าน + ปักหมุด
        FE->>BE: POST /api/stores (verification_status = PENDING, created_by = ชื่อพนักงาน)
    end
```

---

## 4. การบันทึกการขาย (Sales Workflow)

```mermaid
sequenceDiagram
    actor Driver
    participant FE as Driver Web App
    participant BE as API Server
    participant WH as MySQL

    Driver->>FE: เปิดแคตตาล็อกสต็อกบนรถ (เลือก vehicle)
    FE->>BE: GET /api/inventory?vehicle_id=V-01
    Driver->>FE: เลือกสินค้า/จำนวน → ยืนยันการขาย
    FE->>BE: POST /api/sales { store_id, driver_id, vehicle_id, total_amount, items[] }
    Note right of BE: ต้องมี vehicle_id ไม่งั้น 400
    Note right of BE: BEGIN TRANSACTION
    BE->>WH: INSERT sales + sale_items
    BE->>WH: UPDATE inventory (ตัดสต็อกรถ) — สร้าง fallback ติดลบถ้าไม่พบ
    BE->>WH: INSERT visits (status = SUCCESS)
    BE->>WH: UPDATE stores SET status = 'SUCCESS'
    Note right of BE: COMMIT
    BE-->>FE: { status: success, id: sl_... }
    FE->>BE: refetch inventory / sales / visits
```

---

## 5. การติดตามภาพรวมและตรวจสอบผลสำรวจ (Admin)

```mermaid
sequenceDiagram
    actor Admin
    participant FE as Admin Dashboard
    participant BE as API Server
    participant WH as MySQL

    Admin->>FE: เข้าเมนู "Map Overview"
    FE->>BE: GET /api/stores, GET /api/survey-targets
    FE->>BE: GET /api/driver-locations (poll ทุก 30s)
    FE->>BE: GET /api/gps-tracks?date=YYYY-MM-DD
    BE-->>FE: ข้อมูลทั้งหมด
    FE->>FE: render Leaflet — GeoJSON อำเภอ, หมุดร้าน, geofence, ตำแหน่งรถ, เส้นทาง

    Admin->>FE: เข้าเมนู "ตรวจสอบผลสำรวจ" (SurveyAudit)
    FE->>FE: กรองร้าน status = SUCCESS ตาม verification_status
    Admin->>FE: กด Approve / Reject
    FE->>BE: PUT /api/stores { id, verification_status, status }
```

---

## 6. การปิดยอดปลายวัน (Close Day)

```mermaid
sequenceDiagram
    actor Driver
    participant FE as Driver Web App
    participant BE as API Server
    participant WH as MySQL

    Driver->>FE: หน้า CloseDay — ระบบแสดงยอดคาดหวัง (inventory ของรถ)
    Driver->>FE: กรอกยอดนับจริงรายสินค้า
    FE->>FE: คำนวณผลต่าง (diff = actual - expected)
    Driver->>FE: ยืนยันปิดยอด
    FE->>BE: POST /api/reconciliation { driver_id, report }  (หรือ /api/inventory/return)
    BE->>WH: บันทึกผล + ล้างสต็อก VAN ของพนักงาน
    Driver->>Admin: ส่งเงินสด/สลิปให้แอดมินกระทบยอดกับ Sales Reports
```
