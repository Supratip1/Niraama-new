import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Edit2, User } from 'lucide-react';
import { auth } from '../Auth';
import TypingAnimation from './TypingAnimation';
import { Message, createChat, getChat, updateChat } from '../utils/chatStorage';

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

const ChatWindow: React.FC<ChatWindowProps> = ({ userPhotoURL, chatId, onNewChat }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messageBeingEdited, setMessageBeingEdited] = useState<Message | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Reset messages when switching chats or starting a new chat
  useEffect(() => {
    if (chatId) {
      loadChat(chatId);
    } else {
      // New chat - show welcome message
      setMessages([WELCOME_MESSAGE]);
      setMessage('');
      setMessageBeingEdited(null);
    }
  }, [chatId]);

  const loadChat = async (id: string) => {
    const chat = await getChat(id);
    if (chat) {
      setMessages(chat.messages);
    } else {
      // Fallback to welcome message if chat not found
      setMessages([WELCOME_MESSAGE]);
    }
    setMessage('');
    setMessageBeingEdited(null);
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

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

    // Create new chat or update existing one
    if (auth.currentUser) {
      if (!chatId) {
        const chat = await createChat(auth.currentUser.uid, newMessage);
        onNewChat(chat.id);
      } else {
        await updateChat(chatId, updatedMessages);
      }
    }

    // Show typing animation and send bot response
    setIsTyping(true);
    setTimeout(() => {
      const botMessage: Message = {
        id: crypto.randomUUID(),
        type: 'text',
        content: "I'm here to listen and support you. Would you like to tell me more about what's on your mind?",
        sender: 'bot',
        timestamp: Date.now(),
      };
      const messagesWithBot = [...updatedMessages, botMessage];
      setMessages(messagesWithBot);
      setIsTyping(false);
      
      // Update chat with bot response
      if (auth.currentUser && chatId) {
        updateChat(chatId, messagesWithBot);
      }
    }, 2000);
  };

  const handleSendMessage = () => {
    sendMessage(message);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

    const updatedMessages = messages.map(msg =>
      msg.id === messageBeingEdited.id ? messageBeingEdited : msg
    );

    setMessages(updatedMessages);
    setMessageBeingEdited(null);

    if (auth.currentUser && chatId) {
      await updateChat(chatId, updatedMessages);
    }

    setIsTyping(true);
    setTimeout(() => {
      const botMessage: Message = {
        id: crypto.randomUUID(),
        type: 'text',
        content: `I understand you've revised your message. Let me respond to what you're saying now...`,
        sender: 'bot',
        timestamp: Date.now(),
      };
      const newMessages = [...updatedMessages, botMessage];
      setMessages(newMessages);
      setIsTyping(false);
      
      if (auth.currentUser && chatId) {
        updateChat(chatId, newMessages);
      }
    }, 1500);
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) return;

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

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 relative">
      <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-gray-200">
        {userPhotoURL ? (
          <img src={userPhotoURL} alt="User" className="w-10 h-10 rounded-full" />
        ) : (
          <User className="w-6 h-6 text-gray-700" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
      </div>

      <div className="border-t bg-white p-4">
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
      </div>
    </div>
  );
};

export default ChatWindow;