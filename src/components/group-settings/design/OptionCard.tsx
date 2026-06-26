import React from 'react';

interface OptionCardProps {
  title: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  gradient?: string;
}

export default function OptionCard({ 
  title, 
  description, 
  isSelected, 
  onClick, 
  icon,
  children,
  className = '',
  gradient
}: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative p-5 rounded-xl border-2 transition-all duration-300 text-left w-full overflow-hidden
        ${isSelected 
          ? 'border-primary shadow-lg scale-[1.02]' 
          : 'border-border hover:border-primary/40 hover:shadow-md hover:scale-[1.01]'
        }
        ${className}
      `}
    >
      {/* Gradient background when selected */}
      {isSelected && gradient && (
        <div className={`absolute inset-0 opacity-5 ${gradient}`} />
      )}
      
      {/* Selection indicator */}
      <div className={`
        absolute top-0 right-0 w-16 h-16 rounded-bl-full transition-all duration-300
        ${isSelected ? 'bg-primary/10' : 'bg-transparent'}
      `}>
        <div className={`
          absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
          ${isSelected 
            ? 'border-primary bg-primary' 
            : 'border-muted-foreground/30'
          }
        `}>
          {isSelected && (
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      <div className="flex items-start gap-4 relative z-10">
        {icon && (
          <div className={`
            p-2.5 rounded-xl transition-all duration-300
            ${isSelected 
              ? 'bg-primary/10 text-primary' 
              : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary/70'
            }
          `}>
            {icon}
          </div>
        )}
        <div className="flex-1 pr-8">
          <div className={`
            font-semibold text-base mb-1.5 transition-colors duration-300
            ${isSelected ? 'text-primary' : 'text-foreground'}
          `}>
            {title}
          </div>
          {description && (
            <div className="text-sm text-muted-foreground leading-relaxed">{description}</div>
          )}
          {children}
        </div>
      </div>
    </button>
  );
}
