import { cn } from "../../lib/utils";

const GlassCard = ({
  children,
  className,
  variant = "default",
  hover = false,
  ...props
}) => {
  const baseClasses = "rounded-3xl backdrop-blur-lg";

  const variants = {
    default: "bg-white/20 shadow-2xl shadow-black/10",
    blue: "bg-white/20 shadow-2xl shadow-black/10",
    solid: "bg-white border-white/30 shadow-2xl shadow-black/10",
  };

  const hoverClasses = hover ? "card-hover cursor-pointer" : "";

  return (
    <div
      className={cn(baseClasses, variants[variant], hoverClasses, className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
