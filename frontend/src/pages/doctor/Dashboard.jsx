import { useState, useEffect } from 'react';
import useAuth from '../../../hooks/useAuth';
import api from '../../../services/api';
import StatCard from '../../../components/ui/StatCard';
import InsightCard from '../../../components/ui/InsightCard';
import ChartCard from '../../../components/ui/ChartCard';
import { Users, CalendarCheck, FileBadge, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/doctor/analytics');
        setAnalytics(res.data.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const defaultData = {
    todayAppointments: 8,
    totalPatients: 142,
    prescriptionsIssued: 45,
    weeklyData: [
      { name: 'Mon', patients: 12 },
      { name: 'Tue', patients: 19 },
      { name: 'Wed', patients: 15 },
      { name: 'Thu', patients: 22 },
      { name: 'Fri', patients: 18 },
      { name: 'Sat', patients: 5 },
      { name: 'Sun', patients: 2 },
    ]
  };

  const data = analytics || defaultData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Dr. {user?.name}'s Workspace</h1>
          <p className="text-textSecondary mt-1">Here is your daily overview and active alerts.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition-colors flex items-center gap-2">
          <span>Start Next Consult</span>
          <span className="w-2 h-2 rounded-full bg-success"></span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Today's Appointments" 
          value={data.todayAppointments} 
          icon={CalendarCheck} 
        />
        <StatCard 
          title="Total Patients" 
          value={data.totalPatients} 
          icon={Users} 
          trend={{ value: 4, positive: true }} 
        />
        <StatCard 
          title="Prescriptions Issued" 
          value={data.prescriptionsIssued} 
          icon={FileBadge} 
        />
        <StatCard 
          title="Avg Consult Time" 
          value="18 min" 
          icon={Activity} 
          trend={{ value: 2, positive: false }} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartCard title="Weekly Patient Volume">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(255,255,255,0.1)' }}
                  itemStyle={{ color: '#F8FAFC' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar 
                  dataKey="patients" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-textPrimary">Priority Action Items</h3>
          <InsightCard 
            type="danger"
            message="Patient John Doe's latest remote HR reading shows sustained tachycardia (120+ bpm)."
            actionText="Review Telemetry"
          />
          <InsightCard 
            type="warning"
            message="You have 3 prescription refill requests pending approval."
            actionText="Review Requests"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
