import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { 
  Home, 
  Activity, 
  Calendar, 
  Video, 
  FileText, 
  Users, 
  Pill,
  Brain,
  CloudSun,
  BarChart
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  
  const doctorLinks = [
    { name: 'Dashboard', path: '/doctor', icon: Home },
    { name: 'Patients', path: '/doctor/patients', icon: Users },
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'Consultation', path: '/doctor/consultation', icon: Video },
    { name: 'Prescriptions', path: '/doctor/prescriptions', icon: Pill },
    { name: 'Analytics', path: '/doctor/analytics', icon: BarChart },
    { name: 'Weather Alerts', path: '/doctor/weather', icon: CloudSun },
  ];

  const patientLinks = [
    { name: 'Dashboard', path: '/patient', icon: Home },
    { name: 'AI Assistant', path: '/patient/assistant', icon: Brain },
    { name: 'Health Monitor', path: '/patient/health', icon: Activity },
    { name: 'Appointments', path: '/patient/appointments', icon: Calendar },
    { name: 'Telemedicine', path: '/patient/telemedicine', icon: Video },
    { name: 'Medication', path: '/patient/medication', icon: Pill },
    { name: 'Reports', path: '/patient/reports', icon: FileText },
    { name: 'Mental Health', path: '/patient/mental-health', icon: Brain },
    { name: 'Weather Tracker', path: '/patient/weather', icon: CloudSun },
  ];

  const links = user?.role === 'doctor' ? doctorLinks : patientLinks;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B0F19] border-r border-white/10 transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          HealthSphere
        </span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === `/${user?.role}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-textSecondary hover:bg-white/5 hover:text-textPrimary'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full px-4 py-2 text-sm font-medium text-danger bg-danger/10 rounded-lg hover:bg-danger/20 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
