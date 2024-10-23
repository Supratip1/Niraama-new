import React, { useState } from 'react';
import { Brain, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-64 bg-gray-900 text-white h-full p-4 flex flex-col">
      <div className="flex items-center gap-3 mb-8 px-2">
        <Brain className="w-8 h-8 text-blue-400" />
        <span className="text-xl font-semibold">Niraama</span>
      </div>

      <div className="flex-1">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 px-2 text-gray-400">
          Chat History
        </h2>
        <div className="space-y-2">
          <div className="px-2 py-2 text-sm text-gray-400">
            No previous chats
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-auto text-sm text-gray-400 hover:text-white transition-colors px-2 py-2 rounded-lg hover:bg-gray-800"
      >
        About Niraama
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white text-gray-800 p-6 rounded-lg max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-semibold mb-4">About Niraama</h2>
            <p className="mb-4">
              Niraama is an advanced AI-powered tool designed to enhance mental health and well-being 
              with a level of empathy and insight that feels human.
            </p>
            <p className="mb-4">
              Created by Supratip Bhattacharya, Niraama combines cutting-edge AI technology with 
              mental health expertise to provide personalized support and guidance.
            </p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;