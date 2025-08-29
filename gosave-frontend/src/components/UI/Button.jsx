import { cn } from "../../lib/utils";

const Button = ({
  children,
  className,
  variant = "primary",
  size = "default",
  disabled = false,
  asChild = false,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-320 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "btn-primary focus:ring-royal-gold",
    secondary: "btn-secondary focus:ring-royal-blue",
    ghost: "btn-ghost focus:ring-royal-blue",
    outline:
      "bg-transparent text-royal-blue border border-royal-blue hover:bg-royal-blue hover:text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    default: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const classes = cn(baseClasses, variants[variant], sizes[size], className);

  if (asChild) {
    // If asChild is true, we expect children to be a single React element
    // and we'll clone it with our classes
    const child = children;
    if (child && child.props) {
      return {
        ...child,
        props: {
          ...child.props,
          className: cn(classes, child.props.className),
          ...props,
        },
      };
    }
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export default Button;
