import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Explorer from './pages/Explorer';
import TemperatureProfile from './pages/TemperatureProfile';
import OceanXRay from './pages/OceanXRay';
import Anomalies from './pages/Anomalies';
import Validation from './pages/Validation';
import Pipeline from './pages/Pipeline';
import System from './pages/System';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="explorer" element={<Explorer />} />
          <Route path="profile" element={<TemperatureProfile />} />
          <Route path="ocean-xray" element={<OceanXRay />} />
          <Route path="anomalies" element={<Anomalies />} />
          <Route path="validation" element={<Validation />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="system" element={<System />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
