import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Edit2, User, Brain, Heart, Users, Coffee } from 'lucide-react';
import { auth } from '../Auth';
import TypingAnimation from './TypingAnimation';
import axios from 'axios';

import { Message, createChat, getChat, updateChat } from '../utils/ChatStorage';
import AnimatedBackground from './AnimatedBackground';
interface ChatWindowProps {
  userPhotoURL: string;
  chatId: string | null;
  onNewChat: (chatId: string) => void;
}

const WELCOME_MESSAGE: Message = {
  id: crypto.randomUUID(),
  type: 'text',
  content: 'Hi! I am Niraama, your mental health companion. How are you feeling today?',
  sender: 'bot',
  timestamp: Date.now(),
};

const RESOURCE_BUTTONS = [
  {
    icon: Brain,
    title: "Feeling Anxious?",
    description: "Let's explore coping strategies together",
  },
  {
    icon: Heart,
    title: "Need Support?",
    description: "Share what's on your mind",
  },
  {
    icon: Users,
    title: "Relationship Issues?",
    description: "Let's talk about your connections",
  },
  {
    icon: Coffee,
    title: "Daily Stress?",
    description: "Discover relaxation techniques",
  },
];

const ChatWindow: React.FC<ChatWindowProps> = ({ userPhotoURL, chatId, onNewChat }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messageBeingEdited, setMessageBeingEdited] = useState<Message | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initializeChat = async () => {
      if (chatId) {
        const chat = await getChat(chatId);
        if (chat) {
          setMessages(chat.messages);
          setHasInteracted(true);
          
        }
      } else {
        setMessages([WELCOME_MESSAGE]);
        setHasInteracted(false);
        setShowAnimation(false);
      }
      setMessage('');
      setMessageBeingEdited(null);
    };

    initializeChat();
  }, [chatId]);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setHasInteracted(false);  // Reset to show welcome page on login
        setMessages([WELCOME_MESSAGE]);
        setShowAnimation(false)  // Optional: reset to welcome message
      }
    });
  
    return () => unsubscribe();
  }, []);
// New useEffect to set animation visibility when a chat is selected
useEffect(() => {
  if (chatId) {
    setShowAnimation(true); // Trigger the animation on chat selection
  }
}, [chatId]);
  const handleResourceClick = (title: string) => {
    setMessage(`I'd like to talk about ${title.toLowerCase()}`);
    setHasInteracted(true);
    setShowAnimation(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };
  
  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;
  
    setHasInteracted(true);
    const newMessage: Message = {
      id: crypto.randomUUID(),
      type: 'text',
      content: messageContent,
      sender: 'user',
      timestamp: Date.now(),
    };
  
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setMessage('');
  
    if (auth.currentUser) {
      if (!chatId) {
        const chat = await createChat(auth.currentUser.uid, newMessage);
        onNewChat(chat.id);
        setShowAnimation(false);
      } else {
        await updateChat(chatId, updatedMessages);
      }
    }
  
    setIsTyping(true);
    console.log("Typing animation should appear now");
    console.log("Sending message to API:", messageContent); // Log the message being sent
  
    try {
      const result = await axios.post('http://localhost:8000/chat', { message: messageContent });
      
      // Log the entire response from the API
      console.log("Full response from API:", result);
  
      // Ensure this is valid
      const botResponse = result.data.response || "Sorry, I couldn’t understand that."; 
      console.log("Bot response content:", botResponse); 
  
      const botMessage: Message = {
        id: crypto.randomUUID(),
        type: 'text',
        content: botResponse,
        sender: 'bot',
        timestamp: Date.now(),
      };
  
      // Update messages with bot reply
      setMessages((prevMessages) => [...prevMessages, botMessage]); 
      console.log("Updated messages with bot reply:", botMessage); 
  
      if (auth.currentUser && chatId) {
        await updateChat(chatId, [...updatedMessages, botMessage]);
      }
    } catch (error) {
      console.error("Error fetching bot response:", error);
    } finally {
      setTimeout(() => setIsTyping(false), 500); // Short delay to ensure typing shows
    }
  };
  
  
    

  const handleSendMessage = () => {
    sendMessage(message);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setHasInteracted(true);
    const newMessage: Message = {
      id: crypto.randomUUID(),
      type: 'file',
      content: URL.createObjectURL(file),
      sender: 'user',
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    if (auth.currentUser) {
      if (!chatId) {
        const chat = await createChat(auth.currentUser.uid, newMessage);
        onNewChat(chat.id);
      } else {
        await updateChat(chatId, updatedMessages);
      }
    }
  };

  const handleEditMessageSave = async () => {
    if (!messageBeingEdited) return;

    // Step 1: Update the edited message in the message list
    const updatedMessages = messages.map(msg =>
        msg.id === messageBeingEdited.id ? messageBeingEdited : msg
    );

    setMessages(updatedMessages);
    setMessageBeingEdited(null);

    if (auth.currentUser && chatId) {
        await updateChat(chatId, updatedMessages);
    }

    setIsTyping(true);

    try {
        // Step 2: Send the edited message to the API to get a dynamic response
        const result = await axios.post('http://localhost:8000/chat', {
            message: messageBeingEdited.content,
        });

        // Step 3: Retrieve the bot's response from the API
        const botResponse = result.data.response || "I couldn't understand your revised message.";

        // Step 4: Create a new message object for the bot's response
        const botMessage: Message = {
            id: crypto.randomUUID(),
            type: 'text',
            content: botResponse,
            sender: 'bot',
            timestamp: Date.now(),
        };

        // Step 5: Update the message list with the bot's response
        const newMessages = [...updatedMessages, botMessage];
        setMessages(newMessages);

        if (auth.currentUser && chatId) {
            await updateChat(chatId, newMessages);
        }
    } catch (error) {
        console.error("Error fetching bot response for edited message:", error);
    } finally {
        setIsTyping(false); // Stop the typing indicator
    }
};

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    setHasInteracted(true);
    setShowAnimation(true);
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => console.error('Speech recognition error:', event.error);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderChatInput = () => (
    <div className="flex items-center gap-2 max-w-4xl mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        title="Attach file"
      >
        <Paperclip className="w-5 h-5 text-gray-500" />
      </button>
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
      <button
        onClick={handleMicClick}
        className={`p-2 rounded-full transition-colors ${
          isListening ? 'bg-green-500' : 'hover:bg-gray-100'
        }`}
        title="Voice input"
      >
        <Mic className="w-5 h-5 text-gray-500" />
      </button>
      <button
        onClick={handleSendMessage}
        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Send message"
        disabled={!message.trim()}
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 relative overflow-y-auto">
       {/* Animated Background - Only shown after user interacts */}
       {showAnimation && <AnimatedBackground />} 
      <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-gray-200">
        {userPhotoURL ? (
          <img src={userPhotoURL} alt="User" className="w-10 h-10 rounded-full" />
        ) : (
          <User className="w-6 h-6 text-gray-700" />
        )}
      </div>

      <div className={`flex-1 overflow-y-auto pt-4 pr-16 p-4 space-y-4 ${!hasInteracted ? 'flex flex-col items-center justify-center' : ''}`}>

        {!hasInteracted ? (
          <div className="w-full max-w-2xl space-y-8 transform transition-all duration-500 ease-in-out mt-10">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-4xl font-bold text-gray-800">Welcome to Niraama</h1>
              <p className="text-lg text-gray-600">Your mental health companion</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {RESOURCE_BUTTONS.map((button, index) => (
                <button
                  key={index}
                  onClick={() => handleResourceClick(button.title)}
                  className="flex items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                >
                  <button.icon className="w-8 h-8 text-blue-500 mr-4" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">{button.title}</h3>
                    <p className="text-sm text-gray-600">{button.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="w-full max-w-xl mx-auto">
              {renderChatInput()}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`relative flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                    msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
                  }`}
                >
                  {msg.id === messageBeingEdited?.id ? (
                    <div>
                      <input
                        type="text"
                        value={messageBeingEdited.content}
                        onChange={(e) =>
                          setMessageBeingEdited({
                            ...messageBeingEdited,
                            content: e.target.value,
                          })
                        }
                        className="p-2 border rounded text-gray-800 w-full"
                        autoFocus
                      />
                      <button
                        onClick={handleEditMessageSave}
                        className="ml-2 text-blue-200 hover:text-white"
                      >
                        Save
                      </button>
                    </div>
                  ) : msg.type === 'text' ? (
                    <>
                      <span>{msg.content}</span>
                      {msg.sender === 'user' && hoveredMessageId === msg.id && (
                        <button
                          className="absolute top-1 right-2"
                          onClick={() => setMessageBeingEdited({ ...msg })}
                        >
                          <Edit2 className="w-4 h-4 text-white" />
                        </button>
                      )}
                    </>
                  ) : (
                    <img
                      src={msg.content}
                      alt="Uploaded"
                      className="max-w-xs rounded"
                    />
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <TypingAnimation />
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {hasInteracted && (
        <div className="border-t bg-white p-4 transform transition-all duration-500 ease-in-out">
          {renderChatInput()}
        </div>
      )}
    </div>
  );
};

export default ChatWindow;