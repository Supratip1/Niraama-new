import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatWindow from './components/ChatWindow';
import { auth } from './Auth';
import { onAuthStateChanged, setPersistence, signOut, browserSessionPersistence } from 'firebase/auth';
import BackgroundMusic from '../src/components/BackgroundMusic';

const App = () => {
  const [userPhotoURL, setUserPhotoURL] = useState<string>(''); // Default empty to reflect signed-out state
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  useEffect(() => {
    // Set persistence to "none" to prevent session persistence across page loads
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        // Sign out the user once on initial load to ensure signed-out mode
        return signOut(auth);
      })
      .catch((error) => {
        console.error('Error setting persistence:', error);
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserPhotoURL(user.photoURL || ''); // Sets user photo if signed in
      } else {
        setUserPhotoURL(''); // Keeps as empty string if no user is signed in
        setCurrentChatId(null); // Clears current chat on sign-out
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUserSignIn = (photoURL: string) => {
    setUserPhotoURL(photoURL); // Updates user photo URL on sign-in
  };

  const handleUserSignOut = () => {
    setUserPhotoURL(''); // Clears user photo URL on sign-out
    setCurrentChatId(null); // Clears current chat on sign-out
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
        <BackgroundMusic />
      </div>
    </div>
  );
};

export default App;
