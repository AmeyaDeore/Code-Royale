import { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import { Video, Calendar as CalendarIcon, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments');
        setAppointments(res.data.data);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const displayAppointments = appointments.length > 0 ? appointments : [
    {
      _id: '1',
      patientId: { name: 'John Doe', email: 'john@example.com' },
      date: new Date().toISOString(),
      timeSlot: '14:00 PM - 14:30 PM',
      status: 'scheduled',
      notes: 'Follow up on hypertension medication',
      meetingLink: 'https://meet.healthsphere.com/mock'
    },
    {
      _id: '2',
      patientId: { name: 'Jane Smith', email: 'jane@example.com' },
      date: new Date(Date.now() + 86400000).toISOString(),
      timeSlot: '10:00 AM - 10:30 AM',
      status: 'scheduled',
      notes: 'Initial consultation',
      meetingLink: 'https://meet.healthsphere.com/mock2'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled': return 'text-primary bg-primary/10 border-primary/20';
      case 'completed': return 'text-success bg-success/10 border-success/20';
      case 'cancelled': return 'text-danger bg-danger/10 border-danger/20';
      default: return 'text-textSecondary bg-white/5 border-white/10';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Schedule</h1>
          <p className="text-textSecondary">Manage your upcoming patient consultations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayAppointments.map((app) => (
          <GlassCard key={app._id} className="p-6 flex flex-col h-full hover:border-white/20 transition-colors">
             <div className="flex justify-between items-start mb-4 pb-4 border-b border-white/5">
               <div>
                 <h3 className="font-semibold text-lg text-textPrimary">{app.patientId.name}</h3>
                 <span className={`inline-block px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                   {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                 </span>
               </div>
               <div className="flex gap-2">
                 <button className="text-success hover:bg-success/10 p-1.5 rounded-md transition-colors">
                   <CheckCircle className="w-5 h-5" />
                 </button>
                 <button className="text-danger hover:bg-danger/10 p-1.5 rounded-md transition-colors">
                   <XCircle className="w-5 h-5" />
                 </button>
               </div>
             </div>
             
             <div className="space-y-3 flex-1">
               <div className="flex items-center gap-3 text-sm text-textSecondary">
                 <CalendarIcon className="w-4 h-4 text-primary" />
                 <span className="text-textPrimary font-medium">{format(new Date(app.date), 'EEEE, MMM dd, yyyy')}</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-textSecondary">
                 <Clock className="w-4 h-4 text-primary" />
                 <span className="text-textPrimary font-medium">{app.timeSlot}</span>
               </div>
               {app.notes && (
                 <div className="mt-3 p-3 bg-white/5 rounded-lg text-sm text-textSecondary italic">
                   "{app.notes}"
                 </div>
               )}
             </div>

             <div className="mt-6 pt-4 border-t border-white/5">
               <a 
                 href={`/doctor/consultation?id=${app._id}`}
                 className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors font-medium"
               >
                 <Video className="w-5 h-5" />
                 Join Consultation
               </a>
             </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default Appointments;
