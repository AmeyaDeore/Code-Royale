import GlassCard from './GlassCard';
import { Lightbulb } from 'lucide-react';

const InsightCard = ({ type = 'info', message, actionText, onAction, className }) => {
  const typeStyles = {
    info: 'border-primary/30 bg-primary/5',
    warning: 'border-warning/30 bg-warning/5',
    danger: 'border-danger/30 bg-danger/5',
    success: 'border-success/30 bg-success/5',
  };

  const iconColors = {
    info: 'text-primary',
    warning: 'text-warning',
    danger: 'text-danger',
    success: 'text-success',
  };

  return (
    <GlassCard className={`p-5 flex items-start gap-4 ${typeStyles[type]} ${className}`}>
      <div className={`mt-0.5 ${iconColors[type]}`}>
        <Lightbulb className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-textPrimary mb-1">AI Insight</h4>
        <p className="text-sm text-textSecondary leading-relaxed">{message}</p>
        {actionText && (
          <button
            onClick={onAction}
            className={`mt-3 text-sm font-medium hover:underline ${iconColors[type]}`}
          >
            {actionText}
          </button>
        )}
      </div>
    </GlassCard>
  );
};

export default InsightCard;
