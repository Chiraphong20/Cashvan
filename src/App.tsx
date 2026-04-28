import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Smartphone, Monitor } from 'lucide-react';
import { StoreProvider } from './store/StoreContext';
import { LineAuthProvider } from './store/LineAuthContext';
import DriverLogin from './pages/driver/DriverLogin';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import DriverLayout from './layouts/DriverLayout';

// Admin Pages
import MapOverview from './pages/admin/MapOverview';
import FleetTracking from './pages/admin/FleetTracking';
import SalesReports from './pages/admin/SalesReports';
import Inventory from './pages/admin/Inventory';
import StoreSurvey from './pages/admin/StoreSurvey';
import AdminDashboard from './pages/admin/AdminDashboard';
import SurveyAudit from './pages/admin/SurveyAudit';
import EmployeeManagementPage from './pages/admin/EmployeeManagementPage';
import ProductManagement from './pages/admin/ProductManagement';
import DigitalCatalog from './pages/driver/DigitalCatalog';
import VisitHistory from './pages/driver/VisitHistory';

// Driver Pages
import CheckInMap from './pages/driver/CheckInMap';
import CheckInPage from './pages/driver/CheckInPage';
import DriverStock from './pages/driver/DriverStock';
import DriverStoreList from './pages/driver/DriverStoreList';
import CloseDay from './pages/driver/CloseDay';
import SalesRecord from './pages/driver/SalesRecord';

function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">ระบบ Cashvan & Survey Management</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            ระบบจัดการร้านค้าและพนักงานลงพื้นที่ (Frontend - LINE LIFF / Backend - PHP MySQL)
          </p>
        </div>
        
        <div className="p-8 grid md:grid-cols-2 gap-6">
          <Link 
            to="/driver" 
            className="group flex flex-col items-center p-8 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
          >
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Smartphone size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">แอปพนักงาน (Driver)</h2>
            <p className="text-center text-gray-500">
              สำหรับพนักงานลงพื้นที่ ปักหมุดร้านค้าใหม่ เช็คอิน และถ่ายรูปส่งข้อมูลผ่าน LINE
            </p>
            <span className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-full font-medium group-hover:bg-blue-700">
              เปิดหน้าแอปพนักงาน
            </span>
          </Link>

          <Link 
            to="/admin" 
            className="group flex flex-col items-center p-8 border-2 border-gray-100 rounded-xl hover:border-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <div className="w-20 h-20 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Monitor size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">หน้าจัดการ (Admin)</h2>
            <p className="text-center text-gray-500">
              สำหรับผู้ดูแลระบบ ดูแผนที่สรุปภาพรวม สถิติรายวัน และจัดการพื้นที่ในนครราชสีมา
            </p>
            <span className="mt-6 inline-block px-6 py-2 bg-slate-800 text-white rounded-full font-medium group-hover:bg-slate-900">
              เปิดระบบหลังบ้าน
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          
          <Route path="/driver" element={
            <LineAuthProvider>
              <DriverLayout />
            </LineAuthProvider>
          }>
            <Route index element={<CheckInMap />} />
            <Route path="login" element={<DriverLogin />} />
            <Route path="map" element={<Navigate to="/driver" replace />} />
            <Route path="check-in" element={<CheckInPage />} />
            <Route path="history" element={<VisitHistory />} />
            <Route path="close-day" element={<CloseDay />} />
            <Route path="sales" element={<SalesRecord />} />
            <Route path="catalog" element={<DigitalCatalog />} />
            <Route path="stores" element={<DriverStoreList />} />
            <Route path="stock" element={<DriverStock />} />
          </Route>
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="map" element={<MapOverview />} />
            <Route path="fleet" element={<FleetTracking />} />
            <Route path="employees" element={<EmployeeManagementPage />} />
            <Route path="stores" element={<StoreSurvey />} />
            <Route path="sales" element={<SalesReports />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="audit" element={<SurveyAudit />} />
            <Route path="catalog" element={<DigitalCatalog />} />
            <Route path="history" element={<VisitHistory />} />
          </Route>
        </Routes>
      </Router>
    </StoreProvider>
  );
}
