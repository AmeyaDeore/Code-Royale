import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import useAuth from '../hooks/useAuth';

// Layout
import DashboardLayout from '../components/layout/DashboardLayout';

// Public Pages
import Landing from '../pages/landing/Landing';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Patient Pages
import PatientDashboard from '../pages/patient/Dashboard';
import AIAssistant from '../pages/patient/AIAssistant';
import HealthMonitoring from '../pages/patient/HealthMonitoring';
import PatientAppointments from '../pages/patient/Appointments';
import PatientTelemedicine from '../pages/patient/Telemedicine';
import PatientReports from '../pages/patient/Reports';
import Medication from '../pages/patient/Medication';
import MentalHealth from '../pages/patient/MentalHealth';
import PatientWeather from '../pages/patient/Weather';
import SmartDevice from '../pages/patient/SmartDevice';

// Doctor Pages
import DoctorDashboard from '../pages/doctor/Dashboard';
import DoctorAppointments from '../pages/doctor/Appointments';
import Patients from '../pages/doctor/Patients';
import Consultation from '../pages/doctor/Consultation';
import Prescriptions from '../pages/doctor/Prescriptions';
import Analytics from '../pages/doctor/Analytics';
import DoctorWeather from '../pages/doctor/Weather';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={user ? <Navigate to={`/${user.role}`} /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}`} /> : <Register />} />

      {/* Patient Routes */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientDashboard />} />
        <Route path="smart-device" element={<SmartDevice />} />
        <Route path="assistant" element={<AIAssistant />} />
        <Route path="health" element={<HealthMonitoring />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="telemedicine" element={<PatientTelemedicine />} />
        <Route path="reports" element={<PatientReports />} />
        <Route path="medication" element={<Medication />} />
        <Route path="mental-health" element={<MentalHealth />} />
        <Route path="weather" element={<PatientWeather />} />
      </Route>

      {/* Doctor Routes */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DoctorDashboard />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="patients" element={<Patients />} />
        <Route path="consultation" element={<Consultation />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="weather" element={<DoctorWeather />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
