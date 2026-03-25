import GlassCard from '../../components/ui/GlassCard';

const MentalHealth = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">Mental Health & Wellness</h1>
        <p className="text-textSecondary">Track mood and mindfulness resources.</p>
      </div>
      <GlassCard className="p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-2">Mood Tracker Coming Soon</h2>
        <p className="text-textSecondary max-w-md mx-auto">We are building specialized tools to help you track your mental wellbeing over time.</p>
      </GlassCard>
    </div>
  );
};

export default MentalHealth;
