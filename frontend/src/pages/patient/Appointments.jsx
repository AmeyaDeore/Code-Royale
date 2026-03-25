import { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import { Calendar as CalendarIcon, Clock, Video } from 'lucide-react';
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

  // Mock initial state if none exist
  const displayAppointments = appointments.length > 0 ? appointments : [
    {
      _id: '1',
      doctorId: { name: 'Dr. Sarah Connor', email: 'sarah@example.com' },
      date: new Date(Date.now() + 86400000).toISOString(),
      timeSlot: '10:00 AM - 10:30 AM',
      status: 'scheduled',
      meetingLink: 'https://meet.healthsphere.com/mock-link'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Appointments</h1>
          <p className="text-textSecondary">Manage your upcoming consultations.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition-colors">
          Book New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayAppointments.map((app) => (
          <GlassCard key={app._id} className="p-6 flex flex-col h-full">
             <div className="flex justify-between items-start mb-4">
               <div>
                 <h3 className="font-semibold text-lg text-textPrimary">{app.doctorId.name || 'Doctor'}</h3>
                 <p className="text-sm text-textSecondary">{app.status}</p>
               </div>
               <div className="p-2 bg-primary/20 text-primary rounded-lg">
                 <Video className="w-5 h-5" />
               </div>
             </div>
             
             <div className="space-y-3 flex-1">
               <div className="flex items-center gap-3 text-sm text-textSecondary">
                 <CalendarIcon className="w-4 h-4" />
                 <span>{format(new Date(app.date), 'MMM dd, yyyy')}</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-textSecondary">
                 <Clock className="w-4 h-4" />
                 <span>{app.timeSlot}</span>
               </div>
             </div>

             <div className="mt-6 pt-4 border-t border-white/10 flex justify-end gap-3">
               <button className="px-4 py-2 text-sm text-textSecondary hover:text-textPrimary transition-colors">
                 Reschedule
               </button>
               {app.meetingLink && (
                 <a 
                   href={`/patient/telemedicine?id=${app._id}`}
                   className="px-4 py-2 text-sm bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                 >
                   Join Call
                 </a>
               )}
             </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default Appointments;
