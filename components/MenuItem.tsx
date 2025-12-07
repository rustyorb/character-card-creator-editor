
import React from 'react';

interface MenuItemProps {
  onClick: () => void;
  label: string;
  active?: boolean;
  isExternal?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ onClick, label, active = false, isExternal = false }) => {
  const baseClasses = 'inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105 cursor-pointer shadow-md';
  const activeClasses = 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30';
  const inactiveClasses = 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white';
  const externalClasses = 'bg-teal-600 text-white hover:bg-teal-500';

  const appliedClasses = isExternal ? `${baseClasses} ${externalClasses}` : (active ? `${baseClasses} ${activeClasses}` : `${baseClasses} ${inactiveClasses}`);

  return (
    <div onClick={onClick} className={appliedClasses}>
      {label}
      {isExternal && (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
        </svg>
      )}
    </div>
  );
};

export default MenuItem;
