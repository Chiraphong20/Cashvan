# Software Requirements Specification (SRS)

## 1. บทนำ (Introduction)
เอกสาร SRS ฉบับนี้กำหนดความต้องการ (Requirements) ทั้งหมดของระบบ Wae Jer Logistic (Cashvan & Survey Management) 

---

## 2. ความต้องการเชิงฟังก์ชัน (Functional Requirements)

### 2.1 ระบบสำหรับพนักงาน (Driver / Cashvan Application)

| ID | Feature | Description |
| :--- | :--- | :--- |
| FR-D01 | **LINE LIFF Authentication** | ระบบต้องสามารถให้พนักงานล็อกอินผ่าน LINE ได้โดยอัตโนมัติ โดยดึงข้อมูล Profile และเปรียบเทียบกับตาราง `drivers` |
| FR-D02 | **Check-in & Geolocation** | ระบบต้องสามารถดึงตำแหน่ง GPS ของมือถือพนักงานได้ เพื่อใช้ในการ Check-in เข้างาน และเยี่ยมร้านค้า |
| FR-D03 | **Store Check-in Map** | ระบบต้องแสดงแผนที่ (Map) พิกัดร้านค้าทั้งหมดที่พนักงานรับผิดชอบ พร้อมระบุสถานะด้วยสีของหมุด |
| FR-D04 | **Store Survey** | พนักงานต้องสามารถอัปโหลดรูปภาพสถานะหน้าร้าน และพิมพ์หมายเหตุลงในระบบได้ (ข้อมูลถูกเก็บลง `visits`) |
| FR-D05 | **Van Stock Viewer** | พนักงานต้องเห็นรายการสินค้าคงเหลือเฉพาะในรถของตัวเองเท่านั้น (`location_id` = vehicle) |
| FR-D06 | **Sales Recording (Cart)** | พนักงานต้องสามารถเลือกสินค้าที่ต้องการขาย ใส่จำนวน และระบบคำนวณราคารวมอัตโนมัติ |
| FR-D07 | **Stock Deduction** | เมื่อกดยืนยันการขาย ระบบต้องตัดจำนวนสต็อกของรถคันนั้นในฐานข้อมูลทันที แบบ Real-time |
| FR-D08 | **Visit History** | พนักงานสามารถดูประวัติการเข้าเยี่ยมร้าน และยอดขายของตนเองในวันนั้นๆ ได้ |

### 2.2 ระบบสำหรับผู้ดูแลระบบ (Admin Web Application)

| ID | Feature | Description |
| :--- | :--- | :--- |
| FR-A01 | **Admin Login** | แอดมินต้องล็อกอินด้วย Username และ Password เพื่อเข้าถึง Dashboard |
| FR-A02 | **Dashboard Analytics** | ระบบแสดงภาพรวมยอดขายรวม, จำนวนร้านค้าที่ถูกเยี่ยมในวันนี้ และกราฟสถิติเบื้องต้น |
| FR-A03 | **Fleet Tracking Map** | แอดมินต้องเห็นหมุดพิกัดของร้านค้าทั้งหมด และเห็นความเคลื่อนไหว (สถานะการเยี่ยม) ของแต่ละร้านบนแผนที่ |
| FR-A04 | **Master Inventory** | แอดมินต้องเห็นสต็อกรวมทั้งหมดใน Master Warehouse และสามารถแก้ไข/ปรับปรุงยอดได้ |
| FR-A05 | **Van Refill (Stock Transfer)** | แอดมินต้องสามารถทำรายการโอนสต็อกจาก Master ไปยัง Van (เลือกรถที่ต้องการ) ได้ |
| FR-A06 | **Employee Management** | แอดมินต้องสามารถเพิ่ม แก้ไข ข้อมูลพนักงานและจับคู่พนักงานกับรถ (Vehicle) ได้ |
| FR-A07 | **Survey Audit** | แอดมินตรวจสอบรูปภาพและข้อมูลที่พนักงานส่งมาจาก Survey เพื่อทำการ Approve หรือ Reject |
| FR-A08 | **Admin Profile** | แอดมินต้องสามารถเปลี่ยนชื่อผู้ใช้งานและรหัสผ่านตนเองได้ |

---

## 3. ความต้องการที่ไม่ใช่ฟังก์ชัน (Non-Functional Requirements)

### 3.1 ประสิทธิภาพ (Performance)
- **Response Time**: API ต้องตอบกลับภายในไม่เกิน 2 วินาที สำหรับการทำงานทั่วไป 
- **Map Rendering**: การเรนเดอร์แผนที่บนมือถือ ต้องใช้เวลาแสดงผลไม่เกิน 3 วินาที (หากอินเทอร์เน็ตปกติ)
- **Payload Limit**: รองรับการส่งข้อมูลรูปภาพ (Base64) ขนาดสูงสุด 50MB ต่อคำขอ เพื่อความละเอียดภาพที่ชัดเจน

### 3.2 ความปลอดภัย (Security)
- **Password Protection**: รหัสผ่านทั้งหมดของ Admin ต้องเข้ารหัสด้วย Hashing (SHA-256 หรือ Bcrypt) ไม่เก็บเป็น Plain text
- **Protected Routes**: หน้า Admin ทั้งหมดถูกปิดกั้น (Guard) หากไม่มี Context/Session ของการล็อกอิน จะต้อง Redirect กลับไปที่ `/admin/login`

### 3.3 ความเข้ากันได้ (Compatibility)
- **Driver Web App**: ออกแบบมาสำหรับแสดงผลหน้าจอแนวตั้ง (Portrait) บน Mobile Browser (Safari, Chrome, LINE in-app browser) 
- **Admin Dashboard**: ออกแบบมาสำหรับการแสดงผลแนวนอนบน Desktop / Laptop ความละเอียด 1024px ขึ้นไป

### 3.4 ความเสถียร (Reliability & Availability)
- **Stateless API**: Backend ต้องทำงานแบบ Stateless เพื่อให้ง่ายต่อการขยายตัว (Scale) ในกรณีที่ปริมาณผู้ใช้หรือข้อมูลร้านค้ามีจำนวนมหาศาล
