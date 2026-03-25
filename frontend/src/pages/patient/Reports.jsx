import GlassCard from '../../components/ui/GlassCard';

const Reports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">Medical Reports</h1>
        <p className="text-textSecondary">View and download your lab results and documents.</p>
      </div>
      <GlassCard className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <h2 className="text-xl font-semibold mb-2">No Recent Reports</h2>
        <p className="text-textSecondary">Your latest medical reports will appear here once uploaded by your doctor.</p>
      </GlassCard>
    </div>
  );
};

export default Reports;
