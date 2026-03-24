import GlassCard from './GlassCard';

const StatCard = ({ title, value, icon: Icon, trend, className }) => {
  return (
    <GlassCard className={`p-6 flex flex-col gap-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-textSecondary">{title}</h3>
        {Icon && (
          <div className="p-2 bg-primary/20 text-primary rounded-lg">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-textPrimary">{value}</p>
        {trend && (
          <p className={`text-sm mt-1 ${trend.positive ? 'text-success' : 'text-danger'}`}>
            {trend.positive ? '+' : '-'}{Math.abs(trend.value)}% from last month
          </p>
        )}
      </div>
    </GlassCard>
  );
};

export default StatCard;
