import React from 'react';

const TypingAnimation: React.FC = () => {
  return (
    <div className="flex space-x-2 p-3 bg-white rounded-lg shadow-sm">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
    </div>
  );
};

export default TypingAnimation;