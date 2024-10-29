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
interface HeadingSection {
  type: 'heading';
  content: string;
}

interface SubheadingSection {
  type: 'subheading';
  content: string;
}

interface ParagraphSection {
  type: 'paragraph';
  content: string;
}

interface ListSection {
  type: 'list';
  items: string[];
}

// Union type for all section types
type MessageSection = HeadingSection | SubheadingSection | ParagraphSection | ListSection;

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
        // Existing chat: load messages from storage
        const chat = await getChat(chatId);
        if (chat) {
          setMessages(chat.messages);
          setHasInteracted(true);
        }
      } else {
        // New chat: only set welcome message if messages are empty
        setMessages([WELCOME_MESSAGE]);
        setHasInteracted(false);
        setShowAnimation(false);
      }
      setMessage('');
      setMessageBeingEdited(null);
    };
  
    initializeChat();
  }, [chatId]); // Use chatId as the dependency
  
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Reset welcome message when auth state changes
        setHasInteracted(false);
        setMessages([WELCOME_MESSAGE]);
        setShowAnimation(false);
      }
    });
  
    return () => unsubscribe();
  }, []); // No dependency on messages.length
  
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
    // Check for empty input and `isTyping` to prevent duplicate API calls
    if (!messageContent.trim() || isTyping) return;
  
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
    setIsAnimationActive(true); 
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
    console.log("Sending message to API:", messageContent);
  
    try {
      const result = await axios.post('http://localhost:8000/chat', { message: messageContent });
      console.log("Full response from API:", result);
  
      const botResponse = result.data.response || "Sorry, I couldn’t understand that.";
      console.log("Bot response content:", botResponse);
  
      const botMessage: Message = {
        id: crypto.randomUUID(),
        type: 'text',
        content: botResponse,
        sender: 'bot',
        timestamp: Date.now(),
      };
  
      // Prevent duplicate bot messages by checking the last message's content and sender
      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage?.sender === 'bot' && lastMessage.content === botResponse) {
          return prevMessages; // Don't add duplicate bot response
        }
        return [...prevMessages, botMessage];
      });
  
      console.log("Updated messages with bot reply:", botMessage);
  
      if (auth.currentUser && chatId) {
        await updateChat(chatId, [...updatedMessages, botMessage]);
      }
    } catch (error) {
      console.error("Error fetching bot response:", error);
    } finally {
      setTimeout(() => setIsTyping(false), 500); // Delay ensures `isTyping` resets after showing
    }
  };
  
  
  
    const exampleBotMessage = [
  { type: 'heading', content: 'Welcome to Niraama' },
  { type: 'subheading', content: 'How can I help you today?' },
  {
    type: 'paragraph',
    content:
      'We are here to support you in various aspects of mental health. Feel free to reach out anytime.',
  },
  {
    type: 'list',
    items: [
      'Feeling anxious? Let\'s explore coping strategies.',
      'Need support? Share what\'s on your mind.',
      'Relationship issues? Let\'s talk about your connections.',
    ],
  },
];
const renderFormattedMessage = (messageSections: MessageSection[]) => (
  <div>
    {messageSections.map((section, index) => {
      switch (section.type) {
        case 'heading':
          return (
            <h1 key={index} className="text-xl font-bold mb-2 text-gray-900">
              {section.content}
            </h1>
          );
        case 'subheading':
          return (
            <h2 key={index} className="text-lg font-semibold mb-1 text-gray-800">
              {section.content}
            </h2>
          );
        case 'paragraph':
          return (
            <p key={index} className="text-gray-700 mb-2 leading-relaxed">
              {section.content}
            </p>
          );
        case 'list':
          return (
            <ul key={index} className="list-disc list-inside text-gray-700 space-y-1 pl-4">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          );
        default:
          return null; // Although TypeScript should ensure this is not reached
      }
    })}
  </div>
);



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
      className={`max-w-[70%] p-4 rounded-3xl shadow-lg transition-all duration-300 ${
        msg.sender === 'user'
          ? 'bg-blue-500 text-white'
          : 'bg-gradient-to-r from-blue-50 to-blue-100 text-gray-800 border border-blue-200 animate-fade-in'
      }`}
      style={{
        animation: 'fadeIn 0.3s ease-in-out',
        whiteSpace: 'pre-wrap', // Ensures line breaks are respected
        wordWrap: 'break-word', // Allows longer words to wrap
        lineHeight: '1.5', // Increase readability for longer replies
        fontSize: msg.content.length > 100 ? '1rem' : '1.1rem', // Slightly smaller text for long replies
      }}
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
            className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            Save
          </button>
        </div>
      ) : msg.type === 'text' ? (
        <>
          {/* Check if message is long and format accordingly */}
          <span className="text-sm leading-relaxed">
            {msg.content.length > 120
              ? msg.content.match(/(.{1,120})(\s|$)/g)?.join('\n')
              : msg.content}
          </span>
          {msg.sender === 'user' && hoveredMessageId === msg.id && (
            <button
              className="absolute top-1 right-2"
              onClick={() => setMessageBeingEdited({ ...msg })}
            >
              <Edit2 className="w-4 h-4 text-white opacity-80 hover:opacity-100 transition-opacity" />
            </button>
          )}
        </>
      ) : (
        <img
          src={msg.content}
          alt="Uploaded"
          className="max-w-xs rounded-lg shadow-md"
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