import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center space-x-3">
      {/* Assuming whale-logo.svg is accessible from the public folder */}
      <img src="/whale-logo.svg" alt="Marine Learning Hub Logo" className="h-10 w-10" />
      <span className="font-bold text-xl text-gray-800 dark:text-gray-100">
        Marine Learning Hub
      </span>
    </div>
  );
};

export default Logo;