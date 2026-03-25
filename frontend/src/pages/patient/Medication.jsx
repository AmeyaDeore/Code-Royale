import GlassCard from '../../components/ui/GlassCard';
import { Pill } from 'lucide-react';

const Medication = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">Medication Schedule</h1>
        <p className="text-textSecondary">Track your active prescriptions.</p>
      </div>
      <GlassCard className="p-6">
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/5">
          <div className="p-3 bg-primary/10 text-primary rounded-lg text-xl flex items-center justify-center">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Amoxicillin (500mg)</h3>
            <p className="text-textSecondary text-sm">Take 1 pill every 12 hours for 7 days.</p>
          </div>
        </div>
        <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-textPrimary transition-colors text-sm font-medium">
          Mark as Taken
        </button>
      </GlassCard>
    </div>
  );
};

export default Medication;
