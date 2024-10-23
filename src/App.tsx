import React from 'react';
import Navbar from './components/Navbar';
import ChatWindow from './components/ChatWindow';

const App = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Navbar />
      <div className="w-px bg-gray-200"></div>
      <div className="flex-1">
        <ChatWindow />
      </div>
    </div>
  );
};

export default App;