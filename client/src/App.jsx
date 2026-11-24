// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoomsPage } from './pages/GuestRoomsPage';
import { RoomDetailPage } from './pages/RoomDetailPage';
import { LoginPage } from './pages/LoginPage';
import { LandlordPage } from './pages/LandlordPage';
import { BillingPage } from './pages/BillingPage';
import { TenantPage } from './pages/TenantPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<GuestRoomsPage />} />
          <Route path="rooms/:id" element={<RoomDetailPage />} />
          <Route path="login" element={<LoginPage />} />

          <Route element={<ProtectedRoute allowedRoles={['landlord']} />}>
            <Route path="landlord" element={<LandlordPage />} />
            <Route path="landlord/billing" element={<BillingPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
            <Route path="tenant" element={<TenantPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;