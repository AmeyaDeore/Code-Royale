import GlassCard from '../../components/ui/GlassCard';
import ChartCard from '../../components/ui/ChartCard';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const data = [
    { name: 'Cardiology', value: 400 },
    { name: 'General', value: 300 },
    { name: 'Pediatrics', value: 300 },
    { name: 'Orthopedics', value: 200 },
  ];

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">Practice Analytics</h1>
        <p className="text-textSecondary">Deep insights into your clinical practice.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <ChartCard title="Cases by Category">
           <ResponsiveContainer width="100%" height={300}>
             <PieChart>
               <Pie
                 data={data}
                 cx="50%"
                 cy="50%"
                 innerRadius={60}
                 outerRadius={100}
                 fill="#8884d8"
                 paddingAngle={5}
                 dataKey="value"
               >
                 {data.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                 ))}
               </Pie>
               <Tooltip 
                 contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                 itemStyle={{ color: '#F8FAFC' }}
               />
             </PieChart>
           </ResponsiveContainer>
         </ChartCard>

         <GlassCard className="p-6 flex flex-col justify-center items-center text-center">
             <h2 className="text-xl font-semibold mb-2">More Analytics Coming Soon</h2>
             <p className="text-textSecondary">We are aggregating data to provide you with comprehensive revenue and patient outcome reports.</p>
         </GlassCard>
      </div>
    </div>
  );
};

export default Analytics;
