# คู่มือการติดตั้งและเปิดใช้งาน (Setup & Deployment Guide)

---

## 1. ความต้องการของระบบ (Prerequisites)

1. **Node.js** 18.x หรือ 20.x ขึ้นไป
2. **NPM**
3. เข้าถึง **MySQL Server** ได้ (ปัจจุบันใช้ VPS `152.42.227.103:3306`, DB `WH_logistic`) — และ DB `pos` บนเซิร์ฟเวอร์เดียวกันสำหรับฟีเจอร์นำเข้าแคตตาล็อก
4. **Git**
5. บัญชี **Cloudinary** (สำหรับอัปโหลดรูป) และ **LINE LIFF app** (สำหรับ Driver auth)

---

## 2. การติดตั้งแบบ Local

### 2.1 โคลนและติดตั้งแพ็กเกจ
```bash
git clone <repo-url> Cashvan
cd Cashvan
npm install
```

### 2.2 สร้างไฟล์ `.env` ที่ root
```env
DB_HOST=152.42.227.103
DB_USER=<your_db_user>
DB_PASSWORD=<your_db_password>
DB_NAME=WH_logistic
DB_PORT=3306
PORT=3001

VITE_CLOUDINARY_CLOUD_NAME=dffqpiizc
VITE_CLOUDINARY_UPLOAD_PRESET=cashvan_preset
VITE_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/dffqpiizc/image/upload
VITE_LIFF_ID=2009853780-z8zTuIji
```

### 2.3 รันเซิร์ฟเวอร์ (ต้องรัน 2 ส่วนคู่กัน)

**Terminal 1 — Backend API**
```bash
npm run server
```
เซิร์ฟเวอร์รันที่ `http://localhost:3001` และตอนบูตครั้งแรกจะ:
- `initDB()` — `CREATE TABLE IF NOT EXISTS` ทุกตาราง + auto-heal เพิ่มคอลัมน์ที่ขาดทีละตัว
- seed: บัญชี `admin`, รถ `V-01`, หมวดหมู่/สินค้าตัวอย่าง, zones จาก `korat_zones.json`

**Terminal 2 — Frontend**
```bash
npm run dev
```
เข้าใช้งานที่ `http://localhost:3000` (Vite proxy `/api` ไป 3001)

---

## 3. การเข้าใช้งานครั้งแรก

### Admin Dashboard
- URL: `http://localhost:3000/admin`
- Username: `admin` — Password: `password123`
- แนะนำให้เปลี่ยนรหัสผ่านทันทีที่เมนูโปรไฟล์

### Driver App
- URL: `http://localhost:3000/driver`
- บน localhost ระบบ **bypass LIFF** เป็นผู้ใช้ `dev_user` อัตโนมัติ — ถ้ายังไม่มีพนักงานผูกกับ `dev_user` จะเด้งไปหน้า `/driver/login` ให้เลือกและผูกบัญชี
- บนมือถือจริง ต้องเปิดผ่าน LINE (LIFF) เพื่อให้ `liff.login()` ทำงาน

---

## 4. การนำเข้าข้อมูลสินค้าจาก POS (ครั้งแรก)

1. ล็อกอิน Admin → เมนู **คลังสินค้าและสินค้า** → แท็บ **อ้างอิง POS**
2. กดปุ่ม **นำเข้าจาก POS** → ระบบเรียก `POST /api/products/sync-from-pos`
3. ระบบจะสร้างหมวดหมู่/สินค้า และตั้งสต็อกคลังหลัก (MASTER) จากค่า `stock` ของ POS
4. รันซ้ำได้ทุกเมื่อ — สินค้าเดิม (จับคู่ `pos_product_id`) จะอัปเดตแค่ชื่อ/ราคา/หน่วย/รูป ไม่แตะสต็อก

---

## 5. การ Deploy ขึ้น Production

### 5.1 Build Frontend
```bash
npm run build      # ได้โฟลเดอร์ dist/
```

### 5.2 รัน Backend (เสิร์ฟ SPA ในตัว)
`server/index.ts` มี `express.static('../dist')` + SPA fallback อยู่แล้ว จึงรันเซิร์ฟเวอร์เดียวได้:
```bash
npm run build
npm run start          # tsx server/index.ts (พอร์ต 3001)
# หรือใช้ pm2:
pm2 start "npm run start" --name cashvan
```
ตั้ง Nginx reverse proxy โดเมน → พอร์ต 3001 และเปิด HTTPS

### 5.3 หมายเหตุการ Deploy
- โครงการเคยตั้งค่าให้ backend อยู่บน Render แต่ปัจจุบันชี้มาที่ **VPS self-hosted** (`152.42.227.103`) — ดู commit `111249d`
- มีไฟล์ `vercel.json` สำหรับ deploy ส่วน static บน Vercel (ต้องแยก API ไปโฮสต์ที่อื่น)
- ตรวจสอบว่า Production DB อนุญาต IP ของเซิร์ฟเวอร์ให้เข้าถึงพอร์ต 3306
- เมื่อชี้ DB ใหม่ ระบบจะสร้างตาราง + seed ให้อัตโนมัติเมื่อรันครั้งแรก

---

## 6. Troubleshooting

| อาการ | สาเหตุ / วิธีแก้ |
| :--- | :--- |
| `FATAL DATABASE ERROR` ตอนบูต | ตรวจ `.env` DB credentials / firewall พอร์ต 3306 (แอปจะไม่ crash แต่ API จะ error) |
| นำเข้า POS ไม่สำเร็จ | บัญชี MySQL ต้องมีสิทธิ์ `SELECT` บน DB `pos` |
| รูปอัปโหลดเป็น Base64 ยาว ๆ | Cloudinary preset ไม่ถูกต้อง — ระบบ fallback บีบอัด Base64 ให้ |
| Driver เด้งออกตลอด | ยังไม่ได้ผูก `line_user_id` กับพนักงาน — ไปหน้า `/driver/login` |
| GPS banner แดง | ผู้ใช้ต้องอนุญาตสิทธิ์ตำแหน่งในเบราว์เซอร์แล้วรีโหลด |
