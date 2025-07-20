import React from 'react';

const Logo = () => (
  <div className="flex items-center space-x-3 cursor-pointer">
    {/* 
      This <img> tag now correctly points to your SVG file 
      located in the public directory.
    */}
    <img
      src="public/whale-logo.svg"
      alt="Marine Learning Hub Logo"
      className="w-12 h-12" // Control the size of the logo here
    />

    {/* App Title. Hides on small screens to save space. */}
    <span className="text-xl font-bold text-gray-800 hidden sm:inline">
      Marine Learning Hub
    </span>
  </div>
);

export default Logo;