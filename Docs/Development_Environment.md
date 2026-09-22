# สภาพแวดล้อมและเครื่องมือในการพัฒนา (Development Environment)

---

## 1. Technology Stack

| Component | Technology | หมายเหตุ |
| :--- | :--- | :--- |
| Frontend Framework | React 19 | Functional Components + Hooks |
| Build Tool | Vite 6 | dev server พอร์ต **3000** (`--host=0.0.0.0`) |
| Language | TypeScript ~5.8 | |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) | โทนสีหลักส้ม `#ea580c` |
| Routing | React Router DOM 7 | `BrowserRouter` |
| Maps | Leaflet 1.9 + React-Leaflet 5 | OpenStreetMap tiles + GeoJSON ขอบเขตอำเภอโคราช |
| Charts | Recharts 3 | รายงานยอดขาย |
| Animation / Icons | motion 12, lucide-react, Material Symbols | |
| Manual / E-book | react-pageflip | หน้า `ManualEbook` |
| Backend | Node.js + Express 4 | รันด้วย `tsx watch` |
| DB Driver | `mysql2/promise` | connection pool (limit 10), timezone `+07:00` |
| Database | MySQL 8.x | DB `WH_logistic` + อ่าน DB `pos` |
| Auth (Driver) | `@line/liff` 2.28 | LIFF ID จาก `VITE_LIFF_ID` |
| Image Hosting | Cloudinary | unsigned upload preset |

> แพ็กเกจที่ติดตั้งแต่ยังไม่ได้ใช้งานเป็นหลัก: `@react-google-maps/api`, `@google/genai` (มี `GEMINI_API_KEY` ใน define ของ Vite)

---

## 2. โครงสร้างโปรเจกต์

```
Cashvan/
├── Docs/                        # เอกสารโปรเจกต์ (Markdown)
├── server/
│   ├── index.ts                 # REST API endpoints ทั้งหมด + seed zones/products
│   └── db.ts                    # connection pool + initDB (auto-heal) + seed admin/vehicle
├── src/
│   ├── App.tsx                  # Providers + Routes
│   ├── layouts/
│   │   ├── AdminLayout.tsx       # Sidebar + guard (AdminAuthContext)
│   │   └── DriverLayout.tsx      # BottomNav + guard (LineAuthContext) + GPS ping
│   ├── pages/
│   │   ├── admin/               # AdminDashboard, MapOverview, Inventory, SalesReports,
│   │   │                        # EmployeeManagementPage, StoreSurvey, SurveyAudit,
│   │   │                        # AdminLogin, AdminProfile, FleetTracking, ProductManagement, FleetStock
│   │   ├── driver/              # CheckInMap, CheckInPage, DriverStoreList, DriverStock,
│   │   │                        # DigitalCatalog, SalesRecord, VisitHistory, CloseDay,
│   │   │                        # DriverLogin, VanStock
│   │   └── shared/ManualEbook.tsx
│   ├── components/
│   │   ├── admin/               # Sidebar, Header, FilterPanel
│   │   ├── driver/BottomNav.tsx
│   │   └── ui/ProgressBarLoader.tsx
│   ├── store/
│   │   ├── StoreContext.tsx     # Single source of truth (REST data)
│   │   ├── AdminAuthContext.tsx
│   │   ├── LineAuthContext.tsx
│   │   ├── mockData.ts
│   │   ├── korat_geojson.json
│   │   └── locations → src/constants/locations.ts
│   ├── utils/cloudinary.ts
│   ├── constants/locations.ts
│   └── types.ts
├── korat_zones.json             # ข้อมูลอำเภอ/ตำบล (seed zones)
├── .env                         # DB, Cloudinary, LIFF (ไม่ commit)
├── vite.config.ts               # proxy /api → 127.0.0.1:3001
├── vercel.json
└── package.json
```

---

## 3. Environment Variables (`.env`)

| ตัวแปร | ตัวอย่าง / คำอธิบาย |
| :--- | :--- |
| `DB_HOST` | `152.42.227.103` (VPS self-hosted) |
| `DB_USER` / `DB_PASSWORD` | บัญชี MySQL |
| `DB_NAME` | `WH_logistic` (default ในโค้ดถ้าไม่ตั้ง) |
| `DB_PORT` | `3306` |
| `PORT` | `3001` (backend) |
| `VITE_CLOUDINARY_CLOUD_NAME` | `dffqpiizc` |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `cashvan_preset` |
| `VITE_CLOUDINARY_URL` | `https://api.cloudinary.com/v1_1/<cloud>/image/upload` |
| `VITE_LIFF_ID` | `2009853780-z8zTuIji` |

> หมายเหตุ: `.env.example` ในโปรเจกต์ยังเป็นไฟล์เทมเพลตเก่าจาก AI Studio (`GEMINI_API_KEY`, `APP_URL`) — ควรอัปเดตให้ตรงกับตัวแปรจริงข้างต้น

---

## 4. NPM Scripts (`package.json`)

| คำสั่ง | การทำงาน |
| :--- | :--- |
| `npm run dev` | Vite dev server — `http://localhost:3000` |
| `npm run server` | Backend — `tsx watch server/index.ts` พอร์ต 3001 |
| `npm run start` | Backend แบบไม่ watch (`tsx server/index.ts`) — ใช้ตอน deploy |
| `npm run build` | build Frontend → `dist/` |
| `npm run build:all` | `npm install && npm run build` |
| `npm run lint` | `tsc --noEmit` |
| `npm run clean` | ลบ `dist/` |

---

## 5. เครื่องมือแนะนำ

1. **VS Code** + extensions: Tailwind CSS IntelliSense, ESLint/Prettier, Markdown Preview Enhanced
2. **Database client:** DBeaver / MySQL Workbench (เชื่อม `152.42.227.103:3306`)
3. **มือถือ + LINE** สำหรับทดสอบ LIFF (หรือทดสอบบน localhost ที่ระบบ bypass ให้เป็น `dev_user`)
