import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: LucideIcon;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'info';
}

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ className, label, icon: Icon, variant = 'primary', ...props }, ref) => {
    
    const variantColors = {
      primary: 'bg-[hsl(var(--fab-navy))]',
      secondary: 'bg-[hsl(var(--secondary))]',
      accent: 'bg-[hsl(var(--fab-amber))]',
      success: 'bg-[hsl(var(--fab-success))]',
      info: 'bg-[hsl(var(--fab-info))]',
    };

    const textColors = {
      primary: 'text-white',
      secondary: 'text-[hsl(var(--secondary-foreground))]',
      accent: 'text-white',
      success: 'text-white',
      info: 'text-white',
    };

    const iconColors = {
        primary: 'text-[hsl(var(--fab-navy))]',
        secondary: 'text-[hsl(var(--secondary-foreground))]',
        accent: 'text-[hsl(var(--fab-amber))]',
        success: 'text-[hsl(var(--fab-success))]',
        info: 'text-[hsl(var(--fab-info))]',
    }

    return (
      <button
        ref={ref}
        className={cn(
          "group relative flex items-center h-14 min-w-[200px] rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-xl active:scale-[0.98] border-none outline-none",
          className
        )}
        {...props}
      >
        {/* Left colored part */}
        <div className={cn(
          "flex-[3] h-full flex items-center justify-center pl-6 pr-6 transition-colors",
          variantColors[variant]
        )}>
          <span className={cn("font-bold text-sm tracking-[0.15em] uppercase whitespace-nowrap pl-2", textColors[variant])}>
            {label}
          </span>
        </div>

        {/* Right white part with curved separator */}
        <div className="flex-1 h-full bg-white relative flex items-center justify-center min-w-[40px] pr-2 pl-6">
          {/* The concave curve overlay */}
          <div className={cn(
            "absolute top-0 -left-6 w-10 h-full rounded-full transition-colors scale-y-110",
            variantColors[variant]
          )} />
          
          <Icon className={cn("w-5 h-5 relative z-10", iconColors[variant])} />
        </div>
      </button>
    );
  }
);

ActionButton.displayName = "ActionButton";

export { ActionButton };
