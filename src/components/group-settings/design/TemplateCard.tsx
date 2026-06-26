import React from 'react';

interface TemplateCardProps {
  title: string;
  isSelected: boolean;
  onClick: () => void;
  preview: React.ReactNode;
  className?: string;
}

export default function TemplateCard({ 
  title, 
  isSelected, 
  onClick, 
  preview,
  className = ''
}: TemplateCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative rounded-xl border-2 transition-all duration-300 overflow-hidden
        ${isSelected 
          ? 'border-primary shadow-xl scale-[1.03]' 
          : 'border-border hover:border-primary/40 hover:shadow-lg hover:scale-[1.01]'
        }
        ${className}
      `}
    >
      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Preview area */}
      <div className={`
        aspect-video relative overflow-hidden
        ${isSelected ? 'bg-gradient-to-br from-primary/10 to-primary/5' : 'bg-gradient-to-br from-muted to-muted/50'}
      `}>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {preview}
        </div>
        
        {/* Selection overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px] flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-primary shadow-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      {/* Label */}
      <div className={`
        px-4 py-3 text-center font-semibold text-sm transition-all duration-300
        ${isSelected 
          ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground' 
          : 'bg-muted/30 text-foreground group-hover:bg-muted/50'
        }
      `}>
        {title}
      </div>
    </button>
  );
}
