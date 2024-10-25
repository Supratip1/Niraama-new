import React, { useState } from 'react';
import Navbar from '../src/components/Navbar';
import ChatWindow from '../src/components/ChatWindow';
import { Message } from '../src/components/ChatWindow';

const App: React.FC = () => {
  const [userPhotoURL, setUserPhotoURL] = useState<string>(''); // State to hold user photo URL

  const handleUserSignIn = (photoURL: string) => {
    setUserPhotoURL(photoURL); // Update user photo URL on sign-in
  };

  const handleUserSignOut = () => {
    setUserPhotoURL(''); // Reset photo URL on sign-out to show default icon
  };

  const handleNewChat = (firstMessage: Message) => {
    console.log('New chat started with message:', firstMessage);
  };

  return (
    <div className="flex h-screen">
      <Navbar
        onUserSignIn={handleUserSignIn}
        onUserSignOut={handleUserSignOut} // Pass the sign-out handler
      />
      <ChatWindow onNewChat={handleNewChat} userPhotoURL={userPhotoURL} />
    </div>
  );
};

export default App;
