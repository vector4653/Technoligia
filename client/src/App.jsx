import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ShipperDashboard from './pages/ShipperDashboard';
import FleetDashboard from './pages/FleetDashboard';
import DriverDashboard from './pages/DriverDashboard';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute allowedRoles={['SHIPPER']} />}>
            <Route path="/shipper" element={<ShipperDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['FLEET']} />}>
            <Route path="/fleet" element={<FleetDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['DRIVER']} />}>
            <Route path="/driver" element={<DriverDashboard />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
