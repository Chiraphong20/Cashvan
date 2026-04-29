# คู่มือการติดตั้งและเปิดใช้งาน (Setup & Deployment Guide)

เอกสารนี้อธิบายขั้นตอนการติดตั้งระบบลงบนเครื่อง Local (สำหรับการพัฒนา) และคำแนะนำในการนำขึ้น Production

---

## 1. ความต้องการของระบบ (Prerequisites)
1. **Node.js** เวอร์ชัน 18.x หรือ 20.x ขึ้นไป
2. **NPM** หรือ **Yarn**
3. **MySQL Server** (หรือใช้งานผ่าน MySQL Hosting เช่น Aiven, PlanetScale, Hostinger)
4. **Git** สำหรับโคลนโปรเจกต์

## 2. การติดตั้งแบบ Local (Local Development)

### 2.1 โคลนซอร์สโค้ดและติดตั้งแพ็กเกจ
```bash
git clone https://your-repo-url/cashvan.git
cd cashvan
npm install
```

### 2.2 การตั้งค่า Environment Variables
ใน Root Folder ให้สร้างไฟล์ `.env` (หากไม่มี) และใส่ข้อมูลดังนี้

```env
# ตั้งค่าฐานข้อมูล (ตัวอย่าง)
DB_HOST=152.42.227.103
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_database_name
DB_PORT=3306
```

### 2.3 การรันเซิร์ฟเวอร์
ระบบนี้มี 2 ส่วนหลักที่ต้องรันคู่กัน (เนื่องจาก Vite proxy API ไปหา Express)

**Terminal ที่ 1: รัน Backend API**
```bash
npm run server
```
*หมายเหตุ: เซิร์ฟเวอร์จะรันที่ `http://localhost:3001` และจะทำการ Patching Table / Seeding ข้อมูลที่หายไปให้อัตโนมัติในครั้งแรก*

**Terminal ที่ 2: รัน Frontend Web App**
```bash
npm run dev
```
*เข้าใช้งานผ่านเบราว์เซอร์ที่ `http://localhost:5173`*

---

## 3. การเข้าใช้งานระบบครั้งแรก

### ระบบผู้ดูแล (Admin Dashboard)
- **URL**: `http://localhost:5173/admin`
- **Username เริ่มต้น**: `admin`
- **Password เริ่มต้น**: `password123`
*(แนะนำให้เข้าไปที่เมนู "Profile" ด้านซ้ายล่างสุดเพื่อเปลี่ยนรหัสผ่านทันที)*

### ระบบพนักงานขับรถ (Driver App)
- **URL**: `http://localhost:5173/driver`
*(ในโหมด Local อาจจะข้ามการยืนยันตัวตน LINE LIFF หรือต้อง Mock ข้อมูล LIFF เพื่อให้แสดงผลได้)*

---

## 4. คำแนะนำสำหรับการ Deploy ขึ้น Production

### 4.1 การ Deploy Backend (Node.js)
1. นำโค้ดขึ้น Server (เช่น DigitalOcean, AWS EC2, หรือ Render)
2. ติดตั้ง `pm2` เพื่อใช้รันเซอร์วิสแบบ Background
   ```bash
   npm install -g pm2
   npm run build-server # ถ้ามีการใช้ tsc เพื่อแปลงเป็น js ก่อน
   pm2 start server/index.js --name "cashvan-api"
   ```
3. ตั้งค่า Proxy ใน Nginx ชี้โดเมน เช่น `api.yourdomain.com` วิ่งเข้าพอร์ต `3001`

### 4.2 การ Deploy Frontend (Vite)
1. รันคำสั่ง Build
   ```bash
   npm run build
   ```
2. นำโฟลเดอร์ `dist/` ที่ได้จากการ Build ไปวางไว้ใน Hosting (เช่น Vercel, Netlify หรือโฟลเดอร์ของ Nginx)
3. ตรวจสอบให้แน่ใจว่า API Endpoint ชี้ไปที่ Backend โดเมนใหม่ (แทนที่จะเป็น localhost)

### 4.3 การจัดการฐานข้อมูล (Database)
- ตรวจสอบว่า Production DB อนุมัติให้ Backend Server สามารถเข้าถึงพอร์ต 3306 ได้
- หากเปลี่ยนฐานข้อมูลใหม่ ระบบ `server/db.ts` จะทำการสร้าง Table และ Seed ข้อมูลเบื้องต้นให้เองเมื่อรันเซิร์ฟเวอร์ครั้งแรก
