import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatWindow from './components/ChatWindow';
import { auth } from './Auth';
import { onAuthStateChanged } from 'firebase/auth';

const App = () => {
  const [userPhotoURL, setUserPhotoURL] = useState<string>('');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserPhotoURL(user.photoURL || '');
      } else {
        setUserPhotoURL('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUserSignIn = (photoURL: string) => {
    setUserPhotoURL(photoURL);
  };

  const handleUserSignOut = () => {
    setUserPhotoURL('');
    setCurrentChatId(null);
  };

  const handleChatSelect = (chatId: string | null) => {
    setCurrentChatId(chatId);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Navbar 
        onUserSignIn={handleUserSignIn} 
        onUserSignOut={handleUserSignOut}
        onChatSelect={handleChatSelect}
        currentChatId={currentChatId}
      />
      <div className="w-px bg-gray-200"></div>
      <div className="flex-1">
        <ChatWindow 
          userPhotoURL={userPhotoURL}
          chatId={currentChatId}
          onNewChat={(chatId) => setCurrentChatId(chatId)}
        />
      </div>
    </div>
  );
};

export default App;