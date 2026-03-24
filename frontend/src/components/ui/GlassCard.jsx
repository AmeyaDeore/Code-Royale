import { cn } from '../../utils/cn'; // Assuming I will need a generic cn utility
// Since I haven't created a cn utility, I'll use clsx and twMerge directly here, or I can create it. Let's create it in utils or just use clsx/tailwind-merge inline.
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const GlassCard = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
export { cn }; // Exporting cn here for convenience, though usually it goes in a utils file
