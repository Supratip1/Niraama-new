import React, { useState, useEffect } from 'react';
import { Brain, X, MessageSquare } from 'lucide-react';
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
  onChatSelect: (chatId: string) => void;
  currentChatId: string | null;
}

const Navbar: React.FC<NavbarProps> = ({
  onUserSignIn,
  onUserSignOut,
  onChatSelect,
  currentChatId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setChatHistory([]);
      onUserSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
          {chatHistory.length > 0 ? (
            chatHistory.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`w-full px-3 py-2 text-left rounded-lg transition-colors ${
                  currentChatId === chat.id
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="truncate">{chat.title || 'New Chat'}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="px-2 py-2 text-sm text-gray-400">
              No previous chats
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto space-y-2">
        {!isLoggedIn ? (
          <button
            onClick={handleGoogleSignIn}
            className="w-full text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors px-4 py-2 rounded-lg"
          >
            Sign in with Google
          </button>
        ) : (
          <button
            onClick={handleSignOut}
            className="w-full text-sm bg-gray-800 hover:bg-gray-700 text-white transition-colors px-4 py-2 rounded-lg"
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
                health and well-being with a level of empathy and insight that
                feels human.
              </p>
              <p className="mb-4">
                Created by Supratip Bhattacharya, Niraama combines cutting-edge AI
                technology with mental health expertise to provide personalized
                support and guidance.
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