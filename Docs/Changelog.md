# บันทึกการเปลี่ยนแปลง (Changelog)

สรุปความเปลี่ยนแปลงหลักของระบบ Wae Jer Logistic เทียบกับเอกสารชุดแรก (29 เม.ย. 2569)

---

## เวอร์ชัน 1.2.x — ส.ค. 2569 (POS Integration & VPS)

- **นำเข้าแคตตาล็อกจาก POS เป็นคลังสินค้าหลัก** (`5795660`) — `POST /api/products/sync-from-pos` ดึงสินค้าจาก `pos.products` มาสร้าง/อัปเดต `products`, `categories`, `inventory` MASTER; idempotent ด้วย `pos_product_id`
- **แท็บอ้างอิงสต็อก POS แบบอ่านอย่างเดียว** ในหน้า Inventory (`506b770`) — `GET /api/pos-products` (search + paging)
- **ย้าย backend จาก Render → VPS self-hosted** `152.42.227.103` (`111249d`)
- เพิ่มคอลัมน์ `products`: `wholesale_price`, `unit`, `image`, `barcode`, `pos_product_id`
- หน้า Inventory ปรับเป็น 4 แท็บ: สต็อกรถ / คลังหลัก / แคตตาล็อก / อ้างอิง POS

---

## เวอร์ชัน 1.1.x — พ.ค. 2569 (Fleet Tracking & Territory)

- **ระบบติดตาม GPS** — ตาราง `driver_locations` (ตำแหน่งล่าสุด, upsert รายคน) และ `gps_tracks` (เส้นทางย้อนหลังรายวัน)
  - `POST /api/driver-location`, `GET /api/driver-locations`
  - `POST /api/gps-track`, `GET /api/gps-track/:driver_id`, `GET /api/gps-tracks`
  - `DriverLayout` ping ตำแหน่งทุก 30 วินาที; `CheckInMap` บันทึก trail
- **Map Overview เขียนใหม่** (987 บรรทัด) — GeoJSON ขอบเขตอำเภอโคราช, หมุดร้านตามสถานะ, geofence, ตำแหน่งรถเรียลไทม์, เส้นทางย้อนหลัง, Get Directions
- **Survey Targets (Geofence)** — ตาราง `survey_targets`, `GET/POST/DELETE /api/survey-targets`
- **ข้อมูลพื้นที่รายอำเภอ/ตำบล** — ตาราง `zones` seed จาก `korat_zones.json`; `stores` เพิ่ม `sub_district`, `district`, `sub_district_id`, `sales_zone`; มี data-healing
- **แยกสถานะร้าน 2 มิติ** — `stores.status` (UNSURVEYED/SUCCESS/NOT_FOUND) แยกจาก `verification_status` (PENDING/APPROVED/REJECTED)
- **หน้า SurveyAudit** — Approve/Reject ผลสำรวจ
- **SalesReports** — เปรียบเทียบผลงานพนักงาน, ตัวกรองช่วงเวลา, ลบบิลแล้วคืนสต็อก
- **AdminDashboard** — ความคืบหน้าการสำรวจรายอำเภอ
- แก้ชื่อพนักงาน cascade ไป `stores.created_by`

---

## เวอร์ชัน 1.0.x — เม.ย.–พ.ค. 2569 (Auth & Media)

- **Driver auth เปลี่ยนเป็น LINE LIFF + bind บัญชี** — `LineAuthContext`, `POST /api/drivers/auth-line`, `POST /api/drivers/bind-line`; เพิ่มคอลัมน์ `drivers.line_user_id`, `line_display_name`, `line_picture_url`; bypass เป็น `dev_user` บน localhost
- **Admin auth เป็น `AdminAuthContext`** — เก็บ session ใน `localStorage`; `AdminLayout` เป็น guard
- **อัปโหลดรูปขึ้น Cloudinary** — `src/utils/cloudinary.ts` พร้อม fallback บีบอัด Base64 (800px, q60)
- **PK เป็น VARCHAR** — `stores` (`st_…`), `sales` (`sl_…`), `drivers` (`d1…`), `survey_targets` (`trg_…`)
- **โอนสต็อก endpoint เปลี่ยนชื่อ** `/api/inventory/refill` → `/api/inventory/transfer` + ตาราง `stock_transactions`
- **`/api/sales` บังคับ `vehicle_id`** และทำงานในทรานแซกชัน (sales + sale_items + ตัด inventory + visit + อัปเดต store)
- **คู่มือในแอป (ManualEbook)** — flipbook ด้วย `react-pageflip`
- Frontend dev server ย้ายพอร์ต `5173` → `3000`
- `initDB()` ทำ auto-heal เพิ่มคอลัมน์ที่ขาดทีละตัวเมื่อบูต

---

## รายการที่ยังค้าง / หนี้ทางเทคนิค (Known Gaps)

- `FleetTracking.tsx` ยังใช้ `mockData` — ยังไม่เชื่อม API จริง
- ไม่มี middleware ตรวจ token ฝั่ง backend (token เป็นค่าจำลอง)
- ตาราง `trips` มีสคีมาแต่ยังไม่มี endpoint
- `.env.example` ยังเป็นเทมเพลตเก่า (`GEMINI_API_KEY`, `APP_URL`)
- ไม่มีชุดทดสอบอัตโนมัติ
- ไม่มี job ล้างข้อมูล `gps_tracks` ที่โตเร็ว
