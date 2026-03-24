import { useState } from 'react';
import api from '../../../services/api';
import GlassCard from '../../../components/ui/GlassCard';
import { Pill, Plus, Search } from 'lucide-react';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, patient: 'John Doe', medication: 'Lisinopril', dosage: '10mg', date: '2023-11-20', status: 'Active' },
    { id: 2, patient: 'Jane Smith', medication: 'Amoxicillin', dosage: '500mg', date: '2023-11-18', status: 'Completed' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Prescription Management</h1>
          <p className="text-textSecondary">Issue and track patient medications.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>New Prescription</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
            <input 
              type="text"
              placeholder="Search prescriptions by patient or medication..."
              className="pl-10 pr-4 py-3 w-full bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-primary text-textPrimary"
            />
          </div>

          {prescriptions.map(p => (
            <GlassCard key={p.id} className="p-5 flex items-center justify-between hover:border-white/20 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-textPrimary">{p.medication} {p.dosage}</h3>
                  <p className="text-sm text-textSecondary">Patient: <span className="text-textPrimary">{p.patient}</span> • Issued: {p.date}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                p.status === 'Active' ? 'bg-success/10 text-success border-success/20' : 'bg-white/5 text-textSecondary border-white/10'
              }`}>
                {p.status}
              </span>
            </GlassCard>
          ))}
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">Quick Refill Requests</h3>
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-textSecondary text-sm">No pending refill requests.</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;
