import { useState, type ReactNode } from "react";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Popup({ isOpen, onClose, children }: PopupProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose} // click outside closes popup
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 transition-opacity" />

      {/* Popup box */}
      <div
        className="relative bg-gray-500 rounded-2xl shadow-lg p-6 w-[300px] max-w-full"
        onClick={(e) => e.stopPropagation()} // stop click from closing when inside
      >
        {children}
      </div>
    </div>
  );
}

// Add a Tailwind animation (in your global CSS or tailwind.config.js)
{
  /* 
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  @keyframes popup {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-popup {
    animation: popup 0.2s ease-out forwards;
  }
}
*/
}
