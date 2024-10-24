import React, { useState, useEffect } from 'react';
import { Brain, X } from 'lucide-react';
import { auth } from '../Auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

interface NavbarProps {
  onUserSignIn: (photoURL: string) => void;  // Prop to handle user sign-in
  onUserSignOut: () => void;  // New prop to handle user sign-out
}

const Navbar: React.FC<NavbarProps> = ({ onUserSignIn, onUserSignOut }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAboutModal, setIsAboutModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // State to track login status

  useEffect(() => {
    // Track authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        onUserSignIn(user.photoURL || '');  // Pass the user's photoURL on sign-in
      } else {
        setIsLoggedIn(false);
        onUserSignOut();  // Reset state when user signs out
      }
    });

    // Cleanup the subscription on component unmount
    return () => unsubscribe();
  }, [onUserSignIn, onUserSignOut]);

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in:', email);
      const user = userCredential.user;
      onUserSignIn(user.photoURL || '');
      setIsModalOpen(false);  // Close modal after sign-in
    } catch (error) {
      console.error('Error signing in:', error);
      setErrorMessage(error.message);  // Display error message
    }
  };

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('User signed up:', email);
      setIsModalOpen(false);  // Close modal after sign-up
    } catch (error) {
      console.error('Error signing up:', error);
      setErrorMessage(error.message);  // Display error message
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('User signed in with Google:', result.user.email);
      onUserSignIn(result.user.photoURL || '');  // Pass Google user's photoURL
      setIsModalOpen(false);  // Close modal on successful sign-in
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setErrorMessage(error.message);  // Display error message
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);  // Update state to logged out
      console.log('User signed out');
      onUserSignOut();  // Reset the photo URL on sign-out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const openAboutModal = () => {
    setIsAboutModal(true);
    setIsModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsAboutModal(false);
    setErrorMessage('');  // Clear any error messages
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
          <div className="px-2 py-2 text-sm text-gray-400">No previous chats</div>
        </div>
      </div>

      <div className="mt-auto mb-4">
        {!isLoggedIn ? (
          <div className="flex justify-between mb-2">
            <button
              onClick={() => {
                setIsSignUpMode(false);
                setIsModalOpen(true);
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors px-2 py-2 rounded-lg"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignUpMode(true);
                setIsModalOpen(true);
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors px-2 py-2 rounded-lg"
            >
              Sign Up
            </button>
          </div>
        ) : (
          <div className="flex justify-between mb-2">
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-400 hover:text-white transition-colors px-2 py-2 rounded-lg"
            >
              Sign Out
            </button>
            <button
              onClick={() => {
                setIsSignUpMode(true);
                setIsModalOpen(true);
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors px-2 py-2 rounded-lg"
            >
              Sign Up
            </button>
          </div>
        )}

        <button
          onClick={openAboutModal}
          className="w-full text-sm text-gray-400 hover:text-white transition-colors px-2 py-2 rounded-lg hover:bg-gray-800"
        >
          About Niraama
        </button>
      </div>

      {(isModalOpen || isAboutModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white text-gray-800 p-6 rounded-lg max-w-md relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            {isAboutModal ? (
              <div>
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
                  onClick={closeModal}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-4">{isSignUpMode ? 'Sign Up' : 'Sign In'}</h2>

                {errorMessage && <p className="text-red-500">{errorMessage}</p>}

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 mb-2 border border-gray-300 rounded"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 mb-4 border border-gray-300 rounded"
                />
                {isSignUpMode ? (
                  <button
                    onClick={handleSignUp}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Sign Up
                  </button>
                ) : (
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Sign In with Google
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
