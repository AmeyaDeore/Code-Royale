import { useState } from 'react';
import GlassCard from '../../../components/ui/GlassCard';
import ChartCard from '../../../components/ui/ChartCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HealthMonitoring = () => {
  const [activeTab, setActiveTab] = useState('heartRate');

  // Multi-dimensional mock data
  const data = [
    { name: 'Mon', heartRate: 72, bpSystolic: 120, bpDiastolic: 80, sleep: 7.5, sugar: 95 },
    { name: 'Tue', heartRate: 75, bpSystolic: 122, bpDiastolic: 82, sleep: 6.8, sugar: 92 },
    { name: 'Wed', heartRate: 71, bpSystolic: 118, bpDiastolic: 79, sleep: 8.1, sugar: 98 },
    { name: 'Thu', heartRate: 80, bpSystolic: 125, bpDiastolic: 85, sleep: 6.0, sugar: 105 },
    { name: 'Fri', heartRate: 74, bpSystolic: 121, bpDiastolic: 81, sleep: 7.2, sugar: 94 },
    { name: 'Sat', heartRate: 70, bpSystolic: 119, bpDiastolic: 78, sleep: 8.5, sugar: 90 },
    { name: 'Sun', heartRate: 73, bpSystolic: 120, bpDiastolic: 80, sleep: 7.8, sugar: 96 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">Health Monitoring</h1>
        <p className="text-textSecondary">Deep dive into your vital trends.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {['heartRate', 'bloodPressure', 'sleep', 'bloodSugar'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'bg-primary text-white' 
                : 'bg-white/5 text-textSecondary hover:bg-white/10'
            }`}
          >
            {tab.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </button>
        ))}
      </div>

      <GlassCard className="p-6">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(255,255,255,0.1)' }}
                itemStyle={{ color: '#F8FAFC' }}
              />
              
              {activeTab === 'heartRate' && (
                <Line type="monotone" dataKey="heartRate" stroke="#EF4444" strokeWidth={3} dot={{ fill: '#EF4444', strokeWidth: 2 }} />
              )}
              {activeTab === 'bloodPressure' && (
                <>
                  <Line type="monotone" dataKey="bpSystolic" name="Systolic" stroke="#3B82F6" strokeWidth={3} />
                  <Line type="monotone" dataKey="bpDiastolic" name="Diastolic" stroke="#8B5CF6" strokeWidth={3} />
                </>
              )}
              {activeTab === 'sleep' && (
                <Line type="monotone" dataKey="sleep" stroke="#10B981" strokeWidth={3} />
              )}
              {activeTab === 'bloodSugar' && (
                <Line type="monotone" dataKey="sugar" stroke="#F59E0B" strokeWidth={3} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="flex justify-end">
        <button className="px-6 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors">
          Add Manual Entry
        </button>
      </div>
    </div>
  );
};

export default HealthMonitoring;
