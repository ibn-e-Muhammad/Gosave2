import { cn } from "../../lib/utils";

const Container = ({ 
  children, 
  className, 
  size = "default",
  ...props 
}) => {
  const baseClasses = "mx-auto px-4 sm:px-6 lg:px-8";
  
  const sizes = {
    sm: "max-w-4xl",
    default: "max-w-7xl",
    lg: "max-w-8xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        baseClasses,
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
