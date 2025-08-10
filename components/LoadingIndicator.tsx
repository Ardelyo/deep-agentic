import React from 'react';

export const LoadingIndicator = () => {
  return (
    <div className="flex items-end gap-2.5 w-full flex-row">
      <div className="rounded-2xl p-4 px-5 bg-white">
        <div className="flex items-center justify-center w-16 h-6">
          <div className="h-2.5 w-2.5 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="h-2.5 w-2.5 bg-blue-300 rounded-full animate-pulse mx-2.5" style={{ animationDelay: '200ms' }}></div>
          <div className="h-2.5 w-2.5 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
        </div>
      </div>
    </div>
  );
};
