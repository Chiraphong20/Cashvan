# สภาพแวดล้อมและเครื่องมือในการพัฒนา (Development Environment)

เอกสารฉบับนี้อธิบายชุดเครื่องมือ เทคโนโลยี และสภาพแวดล้อมที่จำเป็นสำหรับนักพัฒนาที่ต้องการแก้ไข ปรับปรุง หรือสานต่อโครงการ Wae Jer Logistic

---

## 1. Stack ที่ใช้ (Technology Stack)

| Component | Technology | Version / Notes |
| :--- | :--- | :--- |
| **Frontend Framework** | React | 19.x (Functional Components + Hooks) |
| **Build Tool** | Vite | เร็วกว่า Webpack, รองรับ HMR ได้ดีเยี่ยม |
| **Programming Language** | TypeScript | Type Safety |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Routing** | React Router DOM | v6 (ใช้ `BrowserRouter` หรือ `HashRouter`) |
| **Maps & Geolocation** | Leaflet + React-Leaflet | แผนที่ Open Source แบบเบา |
| **Backend Framework**| Node.js + Express.js | รันบน TypeScript ผ่าน `tsx` |
| **Database Driver** | `mysql2` | Promise-based Node.js Driver for MySQL |
| **Database Server** | MySQL | v8.0 ขึ้นไป |

## 2. โครงสร้างโปรเจกต์ (Project Structure)

โปรเจกต์ถูกจัดเก็บรวมกัน (Monorepo-style) โดยมีทั้ง Frontend (Vite) และ Backend (Express) อยู่ในโฟลเดอร์เดียวกันเพื่อความสะดวกในการจัดการ

```
Cashvan/
├── Docs/                    # โฟลเดอร์เก็บเอกสารโปรเจกต์ (Markdown)
├── server/                  # Backend Node.js
│   ├── index.ts             # ไฟล์รันเซิร์ฟเวอร์ และ API Endpoints
│   └── db.ts                # ไฟล์คอนฟิก DB และทำ Data Seeding
├── src/                     # Frontend React (Vite)
│   ├── components/          # UI Components ย่อย (เช่น Sidebar, Cards)
│   ├── layouts/             # โครงสร้างหน้า (AdminLayout, DriverLayout)
│   ├── pages/               # หน้าจอต่างๆ (admin/, driver/)
│   ├── store/               # Context API (StoreContext, AdminAuthContext)
│   ├── index.css            # Tailwind Configuration & CSS Variables
│   └── App.tsx              # หน้าต่างหลักของ React (Router)
├── .env                     # ตั้งค่า Environment Variables (DB Host, Port)
├── package.json             # รวบรวม Dependencies
├── tailwind.config.js       # ตั้งค่าโทนสี และฟอนต์สำหรับ Tailwind
└── vite.config.ts           # ตั้งค่า Vite (เช่น Proxy Server ไปหาพอร์ต 3001)
```

## 3. เครื่องมือสำหรับนักพัฒนา (Developer Tools)

เพื่อความสะดวกในการพัฒนา แนะนำให้ติดตั้งเครื่องมือดังนี้:
1. **VS Code**: Editor หลัก
2. **Extensions แนะนำใน VS Code**:
   - `Tailwind CSS IntelliSense`: ช่วย Auto-complete คลาสของ Tailwind
   - `ESLint` / `Prettier`: ฟอร์แมตโค้ดอัตโนมัติ
   - `Markdown Preview Enhanced`: ใช้สำหรับดูเอกสารในโฟลเดอร์ Docs
3. **Database Client**: `DBeaver` หรือ `MySQL Workbench` สำหรับเปิดดูข้อมูลในตาราง

## 4. โทนสีและ Design System (UI/UX)
ระบบ Wae Jer Logistic ถูกปรับโทนสีหลักเป็น **สีส้ม (Orange)** ตามความต้องการของแบรนด์:
- `--color-primary`: `#ea580c` (สีส้มหลัก)
- `--color-primary-container`: `#ffedd5` (สีส้มอ่อนสำหรับพื้นหลัง Card)
- การตั้งค่าสีทั้งหมดอยู่ใน `src/index.css` ที่ส่วนของ `:root`

## 5. การจัดการสคริปต์ (NPM Scripts)

คำสั่งสำคัญที่อยู่ใน `package.json`

- `npm run dev`: สตาร์ทเซิร์ฟเวอร์ Frontend (Vite) ปกติอยู่ที่พอร์ต `5173`
- `npm run server`: สตาร์ทเซิร์ฟเวอร์ Backend (Express) ด้วย `tsx watch` ที่พอร์ต `3001`
- `npm run build`: ทำการ Compile และ Minify Frontend โค้ดเตรียมขึ้น Production
