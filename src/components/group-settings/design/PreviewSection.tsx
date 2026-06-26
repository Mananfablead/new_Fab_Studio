import React from 'react';

interface PreviewSectionProps {
  colorMode: 'light' | 'dark';
  photoSize: 'large' | 'small';
  font: 'serif' | 'sans';
  padding: 'large' | 'small';
  template: 'cover' | 'gallery';
  layout: 'original' | 'bordered' | 'leftAligned' | 'label' | 'centralCard';
  className?: string;
}

export default function PreviewSection({ 
  colorMode,
  photoSize,
  font,
  padding,
  template,
  layout,
  className = ''
}: PreviewSectionProps) {
  const isDark = colorMode === 'dark';
  const isLargePhoto = photoSize === 'large';
  const isSerif = font === 'serif';
  const isLargePadding = padding === 'large';
  
  const bgClass = isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-white to-gray-50';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';
  const photoBgClass = isDark ? 'bg-gradient-to-br from-gray-700 to-gray-600' : 'bg-gradient-to-br from-gray-200 to-gray-100';
  const paddingClass = isLargePadding ? 'p-8' : 'p-4';
  const photoSizeClass = isLargePhoto ? 'h-36' : 'h-24';
  const fontFamilyClass = isSerif ? 'font-serif' : 'font-sans';
  const textPlaceholderClass = isDark ? 'bg-gray-600' : 'bg-gray-300';

  return (
    <div className={`
      rounded-xl border-2 ${borderClass} ${bgClass} ${paddingClass} ${fontFamilyClass} shadow-2xl
      ${className}
    `}>
      <div className={`${textClass}`}>
        {/* Preview Header */}
        <div className="mb-6 pb-4 border-b border-current opacity-20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold">Live Preview</h3>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
          </div>
          <p className="text-xs opacity-60">Real-time preview of your design settings</p>
        </div>

        {/* Template Content */}
        {template === 'cover' ? (
          <div className="space-y-5">
            {/* Cover Template */}
            <div className={`
              relative rounded-xl overflow-hidden shadow-lg 
              ${photoBgClass} 
              ${isLargePhoto ? 'h-48' : 'h-36'}
            `}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="text-3xl font-bold mb-2 opacity-80">Cover Photo</div>
                  <div className="text-sm opacity-60">Your main showcase image</div>
                </div>
              </div>
              {/* Decorative overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Supporting gallery */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className={`
                    rounded-xl shadow-md ${photoBgClass}
                    ${isLargePhoto ? 'h-28' : 'h-20'}
                  `} 
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Gallery Template */}
            {layout === 'original' && (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div 
                    key={i} 
                    className={`
                      rounded-xl shadow-md ${photoBgClass} ${photoSizeClass}
                      hover:scale-105 transition-transform
                    `} 
                  />
                ))}
              </div>
            )}
            
            {layout === 'bordered' && (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div 
                    key={i} 
                    className={`
                      rounded-xl shadow-md border-2 ${borderClass} ${photoBgClass} ${photoSizeClass}
                      hover:scale-105 transition-transform
                    `} 
                  />
                ))}
              </div>
            )}
            
            {layout === 'leftAligned' && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 p-3 rounded-xl bg-current opacity-5 hover:bg-opacity-10 transition-colors">
                    <div className={`w-1/3 rounded-xl shadow-md ${photoBgClass} ${photoSizeClass}`} />
                    <div className="flex-1 space-y-2 py-1">
                      <div className={`h-4 ${textPlaceholderClass} rounded w-3/4`} />
                      <div className={`h-3 ${textPlaceholderClass} rounded w-1/2`} />
                      <div className={`h-3 ${textPlaceholderClass} rounded w-2/3`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {layout === 'label' && (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="space-y-2">
                    <div className={`rounded-xl shadow-md ${photoBgClass} ${photoSizeClass}`} />
                    <div className={`h-3 ${textPlaceholderClass} rounded w-2/3 mx-auto`} />
                  </div>
                ))}
              </div>
            )}
            
            {layout === 'centralCard' && (
              <div className="flex justify-center py-4">
                <div className={`
                  w-3/4 rounded-xl shadow-xl ${photoBgClass} 
                  ${isLargePhoto ? 'h-52' : 'h-36'} 
                  flex items-center justify-center
                  border-4 border-white/20
                `}>
                  <div className="text-center">
                    <div className="text-lg font-bold mb-2 opacity-80">Central Card</div>
                    <div className="text-sm opacity-60">Featured photo</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Settings indicator */}
        <div className="mt-6 pt-4 border-t border-current opacity-20">
          <div className="grid grid-cols-2 gap-2 text-xs opacity-70">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-current" />
              <span>{isDark ? 'Dark' : 'Light'} Mode</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-current" />
              <span>{isLargePhoto ? 'Large' : 'Small'} Photos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-current" />
              <span>{isSerif ? 'Serif' : 'Sans'} Font</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-current" />
              <span>{template === 'cover' ? 'Cover' : 'Gallery'} Template</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
