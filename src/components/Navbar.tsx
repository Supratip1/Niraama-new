import React, { useState, useEffect } from 'react';
import { Brain, Plus, Trash2, MessageSquare, X } from 'lucide-react';
import { auth } from '../Auth';
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { getChats, ChatSession } from '../utils/ChatStorage';

interface NavbarProps {
  onUserSignIn: (photoURL: string) => void;
  onUserSignOut: () => void;
  onChatSelect: (chatId: string | null) => void;
  currentChatId: string | null;
}

const Navbar: React.FC<NavbarProps> = ({
  onUserSignIn,
  onUserSignOut,
  onChatSelect,
  currentChatId,
}) => {
  const [isAboutModal, setIsAboutModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        onUserSignIn(user.photoURL || '');
        loadChatHistory(user.uid);
      } else {
        setIsLoggedIn(false);
        onUserSignOut();
        setChatHistory([]);
      }
    });

    return () => unsubscribe();
  }, [onUserSignIn, onUserSignOut]);

  const loadChatHistory = async (userId: string) => {
    const chats = await getChats(userId);
    setChatHistory(chats);
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      onUserSignIn(result.user.photoURL || '');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const truncateTitle = (title: string) => {
    const words = title.split(' ');
    return words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : '');
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      onUserSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    const storedChats = localStorage.getItem('niraama_chats');
    if (!storedChats) return;

    const chats: ChatSession[] = JSON.parse(storedChats);
    const updatedChats = chats.filter((chat) => chat.id !== chatId);
    localStorage.setItem('niraama_chats', JSON.stringify(updatedChats));

    if (auth.currentUser) {
      loadChatHistory(auth.currentUser.uid);
    }

    if (currentChatId === chatId) {
      onChatSelect(null);
    }
  };

  const handleNewChat = () => {
    onChatSelect(null);
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-full p-4 flex flex-col">
      <div className="flex items-center gap-3 mb-6 px-2">
        <Brain className="w-8 h-8 text-blue-400" />
        <span className="text-xl font-semibold">Niraama</span>
      </div>

      <button
        onClick={handleNewChat}
        className="w-full mb-4 flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2.5 rounded-lg"
      >
        <Plus className="w-4 h-4" />
        New Chat
      </button>

      <div className="flex-1 overflow-y-auto navbar-scrollbar">
        <div className="space-y-1">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-center justify-between p-2 rounded-lg ${
                currentChatId === chat.id ? 'bg-gray-800' : 'hover:bg-gray-800'
              } transition-colors`}
            >
              <button
                onClick={() => onChatSelect(chat.id)}
                className="flex-1 flex items-center gap-2 text-left min-w-0" // Allow truncation
                style={{ minWidth: '0' }} // Ensures it can shrink properly
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-sm" title={chat.title || 'New Chat'}>
                  {truncateTitle(chat.title || 'New Chat')}
                </span>
              </button>
              <button
                onClick={() => handleDeleteChat(chat.id)}
                className="ml-2 p-1 rounded text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Delete chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto space-y-2 pt-4 border-t border-gray-800">
        {!isLoggedIn ? (
          <button
            onClick={handleGoogleSignIn}
            className="w-full text-sm bg-gray-800 hover:bg-gray-700 transition-colors px-4 py-2 rounded-lg"
          >
            Sign in with Google
          </button>
        ) : (
          <button
            onClick={handleSignOut}
            className="w-full text-sm bg-gray-800 hover:bg-gray-700 transition-colors px-4 py-2 rounded-lg"
          >
            Sign Out
          </button>
        )}

        <button
          onClick={() => setIsAboutModal(true)}
          className="w-full text-sm text-gray-400 hover:text-white transition-colors px-2 py-2 rounded-lg hover:bg-gray-800"
        >
          About Niraama
        </button>
      </div>

      {isAboutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white text-gray-800 p-6 rounded-lg max-w-md relative">
            <button
              onClick={() => setIsAboutModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-semibold mb-4">About Niraama</h2>
              <p className="mb-4">
                Niraama is an advanced AI-powered tool designed to enhance mental
                health and well-being with a level of empathy and insight that feels human.
              </p>
              <p className="mb-4">
                Created by Supratip Bhattacharya, Niraama combines cutting-edge AI
                technology with mental health expertise to provide personalized support and guidance.
              </p>
              <button
                onClick={() => setIsAboutModal(false)}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;