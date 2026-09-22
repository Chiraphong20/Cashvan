# เอกสารระบบ Wae Jer Logistic (Cashvan & Survey Management)

**ชื่อโครงการ:** Wae Jer Logistic (Cashvan & Survey Management)
**เวอร์ชันระบบ:** 1.2.x
**วันที่จัดทำเอกสารฉบับแรก:** 29 เมษายน 2569
**วันที่ปรับปรุงล่าสุด:** 2 กันยายน 2569
**พื้นที่ปฏิบัติงาน:** จังหวัดนครราชสีมา (โคราช)

---

## สารบัญเอกสาร

### ภาพรวมและข้อกำหนด
1. [Project Overview (ภาพรวมโครงการ)](./Project_Overview.md)
2. [Introduction (บทนำ + นิยามศัพท์)](./Introduction.md)
3. [Scope of Work (ขอบเขตการทำงาน)](./Scope_of_Work.md)
4. [Software Requirements Specification (SRS)](./SRS.md)

### กระบวนการทำงาน
5. [System Workflows (กระบวนการทำงานระบบ)](./System_Workflows.md)
6. [Workflow — Admin (กระบวนการฝั่งผู้ดูแล)](./Workflow_Admin.md)
7. [Workflow — Driver (กระบวนการฝั่งพนักงาน)](./Workflow_Driver.md)

### สถาปัตยกรรมและฐานข้อมูล
8. [ER Diagram (โครงสร้างฐานข้อมูล)](./ER_Diagram.md)
9. [Data Dictionary (พจนานุกรมข้อมูล)](./Data_Dictionary.md)
10. [API Documentation (เอกสาร API)](./API_Documentation.md)
11. [Class Diagram / Component Architecture](./Class_Diagram.md)
12. [Master Data (ข้อมูลอ้างอิงพื้นฐาน)](./Master_Data.md)

### ฟีเจอร์เฉพาะทาง
13. [Fleet Tracking & GPS (การติดตามยานพาหนะ)](./Fleet_Tracking_GPS.md)
14. [POS Integration (การเชื่อมต่อระบบ POS)](./POS_Integration.md)

### การพัฒนาและติดตั้ง
15. [Development Environment (สภาพแวดล้อมการพัฒนา)](./Development_Environment.md)
16. [Setup & Deployment Guide (คู่มือการติดตั้ง)](./Setup_Deployment_Guide.md)
17. [Test Cases (กรณีทดสอบระบบ)](./Test_Cases.md)

### คู่มือและอื่น ๆ
18. [User Manual (คู่มือการใช้งาน)](./User_Manual.md)
19. [Presentation Outline (โครงร่างนำเสนอ)](./Presentation_Outline.md)
20. [Changelog (บันทึกการเปลี่ยนแปลง)](./Changelog.md)

---

## สรุประบบโดยย่อ

ระบบบริหารจัดการทีมขายหน่วยรถ (Cashvan) และการสำรวจร้านค้าในจังหวัดนครราชสีมา แบ่งเป็น 2 ฝั่ง:

- **Driver (Mobile Web ผ่าน LINE LIFF):** เข้าระบบผ่าน LINE, ติดตาม GPS อัตโนมัติ, แผนที่/รายการร้านรายอำเภอ-ตำบล, เช็คอิน+สำรวจ+ถ่ายรูป, บันทึกการขายพร้อมตัดสต็อกรถ, ปิดยอด/นับสต็อก
- **Admin (Desktop Web):** Dashboard ความคืบหน้ารายอำเภอ, Fleet Tracking (ตำแหน่งรถเรียลไทม์ + เส้นทางย้อนหลัง), คลังสินค้า 4 แท็บ + นำเข้าแคตตาล็อกจาก POS, โอนสต็อกขึ้นรถ, ตรวจสอบผลสำรวจ, รายงานยอดขาย

**เทคโนโลยี:** React 19 + Vite + Tailwind / Node.js + Express / MySQL 8 (`WH_logistic` + อ่าน `pos`) / Leaflet + OpenStreetMap / Cloudinary / LINE LIFF
