import { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import { Search, Activity, FileText, ChevronRight } from 'lucide-react';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/doctor/patients');
        setPatients(res.data.data);
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const displayPatients = patients.length > 0 ? patients : [
    { _id: '1', name: 'John Doe', email: 'john@example.com', lastVisit: '2023-10-15', status: 'Stable' },
    { _id: '2', name: 'Jane Smith', email: 'jane@example.com', lastVisit: '2023-11-02', status: 'Needs Follow-up' }
  ];

  const filtered = displayPatients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Patient Roster</h1>
          <p className="text-textSecondary">Manage and monitor all your authorized patients.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
          <input 
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full sm:w-64 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-primary text-textPrimary"
          />
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/5">
                <th className="px-6 py-4 text-xs font-semibold text-textSecondary uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-textSecondary uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-textSecondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-textSecondary uppercase tracking-wider">Last Visit</th>
                <th className="px-6 py-4 text-xs font-semibold text-textSecondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(patient => (
                <tr key={patient._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-textPrimary group-hover:text-primary transition-colors">
                      {patient.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                    {patient.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      patient.status === 'Stable' 
                        ? 'bg-success/10 text-success border-success/20' 
                        : 'bg-warning/10 text-warning border-warning/20'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                    {patient.lastVisit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 text-textSecondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors tooltip-trigger" title="View Trends">
                         <Activity className="w-5 h-5" />
                       </button>
                       <button className="p-2 text-textSecondary hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors tooltip-trigger" title="Medical Records">
                         <FileText className="w-5 h-5" />
                       </button>
                       <button className="p-2 text-textSecondary hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                         <ChevronRight className="w-5 h-5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-textSecondary">
                    No patients found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Patients;
