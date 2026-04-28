import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
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



export default function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/driver" replace />} />
          
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
