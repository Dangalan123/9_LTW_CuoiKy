import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import LandlordDashboard from '../pages/LandlordDashboard';
import TenantDashboard from '../pages/TenantDashboard';
import NotFound from '../pages/NotFound';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/landlord-dashboard" element={<LandlordDashboard />} />
        <Route path="/tenant-dashboard" element={<TenantDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}