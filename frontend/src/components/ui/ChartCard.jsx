import GlassCard from './GlassCard';

const ChartCard = ({ title, children, className }) => {
  return (
    <GlassCard className={`p-6 flex flex-col h-full ${className}`}>
      {title && <h3 className="text-lg font-semibold text-textPrimary mb-4">{title}</h3>}
      <div className="flex-1 min-h-[300px] w-full relative">
        {children}
      </div>
    </GlassCard>
  );
};

export default ChartCard;
