
import React from 'react';

interface HexagramIconProps {
  binary: string; // 6 bits from bottom to top
  size?: 'sm' | 'md' | 'lg' | 'xl';
  highlightIndex?: number;
  className?: string;
}

const HexagramIcon: React.FC<HexagramIconProps> = ({ binary, size = 'md', highlightIndex, className = '' }) => {
  // Binary is bottom to top. We render top down.
  const lines = binary.split('').reverse();
  
  const sizeClasses = {
    sm: 'w-8 h-8 gap-1',
    md: 'w-16 h-16 gap-1.5',
    lg: 'w-32 h-32 gap-3',
    xl: 'w-48 h-48 gap-4'
  };

  const lineHeight = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2.5',
    xl: 'h-4'
  };

  const COLOR_INK = '#1F1F1F';
  const COLOR_VERMILLION = '#9A2B2B';

  return (
    <div className={`flex flex-col justify-center items-center ${sizeClasses[size]} ${className}`}>
      {lines.map((bit, idx) => {
        const isYang = bit === '1';
        const isHighlighted = (5 - idx) === highlightIndex;
        const color = isHighlighted ? COLOR_VERMILLION : COLOR_INK;
        
        return (
          <div key={idx} className={`w-full flex justify-between items-center ${lineHeight[size]}`}>
            {isYang ? (
              <div 
                style={{ backgroundColor: color }} 
                className="h-full w-full rounded-[1px] shadow-sm" 
              />
            ) : (
              <>
                <div 
                  style={{ backgroundColor: color }} 
                  className="h-full w-[46%] rounded-[1px] shadow-sm" 
                />
                <div 
                  style={{ backgroundColor: color }} 
                  className="h-full w-[46%] rounded-[1px] shadow-sm" 
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default HexagramIcon;
