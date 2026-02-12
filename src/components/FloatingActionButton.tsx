import React from 'react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-14 h-14 bg-shelbypink text-white rounded-full shadow-lg hover:bg-pink-600 transition-all duration-300 flex items-center justify-center cursor-pointer z-50 group hover:scale-110"
      aria-label="Upload Files"
    >
      <svg 
        className="w-8 h-8 transition-transform duration-300 group-hover:rotate-90" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
}
