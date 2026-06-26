import React from 'react';

interface ToggleOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ToggleGroupProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ToggleGroup({ 
  options, 
  value, 
  onChange,
  className = '',
  size = 'md'
}: ToggleGroupProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <div className={`
      inline-flex bg-muted/50 backdrop-blur-sm rounded-xl p-1.5 shadow-inner border border-border/50
      ${className}
    `}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              relative flex items-center gap-2 font-medium transition-all duration-300 rounded-xl
              ${sizeClasses[size]}
              ${isActive
                ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-md scale-[1.02]'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }
            `}
          >
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl" />
            )}
            {option.icon && <span className="relative z-10">{option.icon}</span>}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
