# การติดตามยานพาหนะและ GPS (Fleet Tracking & GPS)

เอกสารนี้อธิบายระบบติดตามตำแหน่งพนักงาน/รถ ซึ่งเป็นฟีเจอร์ที่เพิ่มเข้ามาหลังเอกสารชุดแรก

---

## 1. องค์ประกอบ 2 ส่วน

| ส่วน | ตาราง | จุดประสงค์ | ความถี่ |
| :--- | :--- | :--- | :--- |
| **ตำแหน่งล่าสุด (Realtime Location)** | `driver_locations` | แสดงหมุด "ตอนนี้พนักงานอยู่ไหน" บนแผนที่ Admin | upsert 1 แถว/คน ทุก 30 วินาที |
| **เส้นทางย้อนหลัง (GPS Trail / Breadcrumb)** | `gps_tracks` | วาดเส้นทางการเดินทางทั้งวันของพนักงาน | batch insert จุดพิกัด (distanceFilter 5 เมตร) |

---

## 2. ฝั่ง Driver (การเก็บข้อมูล)

### 2.1 Realtime Location ping — `DriverLayout.tsx`
```
ขณะ currentDriver มีค่า:
  ทุก 30 วินาที → navigator.geolocation.getCurrentPosition()
  → POST /api/driver-location { driver_id, lat, lng, accuracy }
  (enableHighAccuracy, timeout 8s, maximumAge 15s)
```

### 2.2 GPS Trail — `CheckInMap.tsx`
```
เมื่อเปิดหน้าแผนที่:
  1. GET /api/gps-track/:driver_id?date=today → โหลด trail ที่มีอยู่
  2. navigator.geolocation.watchPosition({ enableHighAccuracy, distanceFilter: 5 })
     - อัปเดตเส้น trail บนแผนที่ (state)
     - สะสมจุดใน pendingPoints ref
  3. ส่ง pendingPoints เป็น batch → POST /api/gps-track { driver_id, points[] }
```

### 2.3 การจัดการข้อผิดพลาด GPS (เพิ่มล่าสุด — ยังไม่ commit)
เมื่อ `watchPosition` error หรือเบราว์เซอร์ไม่รองรับ geolocation จะแสดง banner สีแดง พร้อมข้อความภาษาไทยตาม error code:

| error.code | ข้อความ |
| :---: | :--- |
| 1 (PERMISSION_DENIED) | ถูกปฏิเสธสิทธิ์ GPS — กรุณาอนุญาตตำแหน่งในเบราว์เซอร์แล้วรีโหลด |
| 2 (POSITION_UNAVAILABLE) | ไม่พบสัญญาณ GPS — ลองออกไปที่โล่งแจ้ง |
| 3 (TIMEOUT) | GPS หมดเวลา — ตรวจสอบสัญญาณและลองใหม่ |
| ไม่รองรับ | เบราว์เซอร์นี้ไม่รองรับ GPS — กรุณาเปิดในโทรศัพท์มือถือ |

---

## 3. ฝั่ง Admin (การแสดงผล) — `MapOverview.tsx`

- **StoreContext** poll `GET /api/driver-locations` ทุก 30 วินาที → state `driverLocations`
- หน้าแผนที่ดึง `GET /api/gps-tracks?date=<เลือกได้>` → วาด `<Polyline>` เส้นทางของแต่ละพนักงาน
- Layer อื่น ๆ บนแผนที่เดียวกัน:
  - GeoJSON ขอบเขตอำเภอโคราช (`korat_geojson.json`) ระบายสีแยกตามรหัสอำเภอ
  - หมุดร้านค้า — สีเขียว (`SUCCESS`) / สีแดง (อื่น ๆ)
  - `<Circle>` คลังสินค้า (จุดคงที่) และ `<Circle>` เป้าหมายสำรวจ (`survey_targets`)
  - `<Polyline>` เส้นทางนำทางไปยังร้าน (route mode / Get Directions)

---

## 4. API ที่เกี่ยวข้อง

| Method | Endpoint | Body / Query | หมายเหตุ |
| :--- | :--- | :--- | :--- |
| POST | `/api/driver-location` | `{ driver_id, lat, lng, accuracy? }` | `INSERT ... ON DUPLICATE KEY UPDATE` (unique `driver_id`) |
| GET | `/api/driver-locations` | — | ทุกคน เรียงตาม `updated_at` |
| POST | `/api/gps-track` | `{ driver_id, points: [{lat,lng,recorded_at?}] }` | batch `INSERT INTO gps_tracks VALUES ?` |
| GET | `/api/gps-track/:driver_id` | `?date=YYYY-MM-DD` | คนเดียว เรียงตามเวลา |
| GET | `/api/gps-tracks` | `?date=YYYY-MM-DD` | ทุกคนในวันนั้น |

---

## 5. ข้อควรระวัง / แนวทางพัฒนาต่อ

- ข้อมูล `gps_tracks` โตเร็ว (จุดจำนวนมากต่อวันต่อคน) — ควรมี job ล้างข้อมูลเก่า หรือย้ายเข้าตาราง archive
- ยังไม่มีการ downsample/simplify เส้นทางก่อนแสดงผล — วันที่มีจุดมากอาจเรนเดอร์ช้า
- `driver_locations` ไม่มีประวัติ (เก็บแค่จุดล่าสุด) — ถ้าต้องการ replay ย้อนหลังให้ใช้ `gps_tracks`
- ตาราง `trips` เตรียมไว้สำหรับผูกเส้นทาง/ยอดขายกับ "รอบเดินรถ" แต่ยังไม่มี endpoint เปิดใช้งาน
