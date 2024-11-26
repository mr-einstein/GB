import React, { useState } from 'react';
import { Info, HelpCircle } from 'lucide-react';

interface TooltipWrapperProps {
  text: string;
  hint?: string;
  children: React.ReactNode;
  icon?: string;
}

const TooltipWrapper: React.FC<TooltipWrapperProps> = ({ text, hint, children, icon }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const IconComponent = icon === '?' ? HelpCircle : Info;

  return (
    <div className="relative inline-block w-full">
      <div className="flex items-center gap-2">
        {children}
        <div
          className="relative inline-flex items-center"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
        >
          <IconComponent 
            size={16} 
            className="text-gray-400 hover:text-gray-600 cursor-help transition-colors"
          />
          {showTooltip && (
            <div className="absolute z-50 w-64 p-2 bg-white border border-gray-200 rounded-md shadow-lg -right-2 top-6">
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">{text}</p>
                {hint && <p className="text-gray-500 text-xs">{hint}</p>}
              </div>
              <div className="absolute -top-2 right-3 w-3 h-3 bg-white border-t border-l border-gray-200 transform rotate-45" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TooltipWrapper;
