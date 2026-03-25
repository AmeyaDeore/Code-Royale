import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import InsightCard from '../../components/ui/InsightCard';
import ChartCard from '../../components/ui/ChartCard';
import { Activity, Heart, Moon, Droplets } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const res = await api.get('/patient/health');
        setHealthData(res.data.data);
      } catch (error) {
        console.error('Error fetching health data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, []);

  // Mock data for charts if API is empty
  const chartData = healthData.length > 0 ? healthData : [
    { name: 'Mon', heartRate: 72 },
    { name: 'Tue', heartRate: 75 },
    { name: 'Wed', heartRate: 71 },
    { name: 'Thu', heartRate: 80 },
    { name: 'Fri', heartRate: 74 },
    { name: 'Sat', heartRate: 70 },
    { name: 'Sun', heartRate: 73 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Welcome back, {user?.name}</h1>
          <p className="text-textSecondary mt-1">Here's your health overview for today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Avg. Heart Rate" 
          value="72 bpm" 
          icon={Heart} 
          trend={{ value: 2, positive: false }} 
        />
        <StatCard 
          title="Blood Pressure" 
          value="120/80" 
          icon={Activity} 
          trend={{ value: 1, positive: true }} 
        />
        <StatCard 
          title="Sleep Quality" 
          value="7.5 hrs" 
          icon={Moon} 
          trend={{ value: 5, positive: true }} 
        />
        <StatCard 
          title="Hydration" 
          value="2.1 L" 
          icon={Droplets} 
          trend={{ value: 10, positive: true }} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartCard title="Heart Rate History">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHeartRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(255,255,255,0.1)' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Area type="monotone" dataKey="heartRate" stroke="#EF4444" fillOpacity={1} fill="url(#colorHeartRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-textPrimary">AI Insights</h3>
          <InsightCard 
            type="info"
            message="Your sleep pattern has improved over the last 3 days. Consistency is key to better recovery."
          />
          <InsightCard 
            type="warning"
            message="Your hydration levels are slightly below target. Consider increasing your water intake today."
            actionText="Log Water Intake"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
