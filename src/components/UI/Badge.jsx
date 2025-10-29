import { cn } from "../../lib/utils";

const Badge = ({ children, className, variant = "basic", ...props }) => {
  const baseClasses =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";

  const variants = {
    basic: "bg-white/80 text-neutral-black border border-white/30",
    premium: "bg-royal-gold text-white shadow-glow animate-glow",
    success: "bg-validation-success text-white",
    error: "bg-validation-error text-white",
    info: "bg-royal-blue text-white",
  };

  return (
    <span className={cn(baseClasses, variants[variant], className)} {...props}>
      {children}
    </span>
  );
};

export default Badge;
