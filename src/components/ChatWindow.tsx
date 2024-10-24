import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Edit2 } from 'lucide-react';
import TypingAnimation from './TypingAnimation';

export interface Message {
  id: string;
  type: 'text' | 'file';
  content: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

// Declare global types for SpeechRecognition (for TypeScript)
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatWindowProps {
  onNewChat: (firstMessage: Message) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onNewChat }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messageBeingEdited, setMessageBeingEdited] = useState<Message | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null); // Reference for SpeechRecognition

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Send welcome message when component mounts
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: crypto.randomUUID(),
        type: 'text',
        content: 'Hi! I am Niraama, your mental health companion. How are you feeling today?',
        sender: 'bot',
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }, 500);
  }, []);

  // Initialize SpeechRecognition API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US'; // Set language
      recognition.continuous = false; // Stops listening after a single input
      recognition.interimResults = false; // Final results only
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => console.error(event.error);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: crypto.randomUUID(),
        type: 'text',
        content: message,
        sender: 'user',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessage('');

      if (messages.length === 0) {
        onNewChat(newMessage);
      }

      // Show typing animation
      setIsTyping(true);

      // Simulate bot response
      setTimeout(() => {
        setIsTyping(false);
        const botMessage: Message = {
          id: crypto.randomUUID(),
          type: 'text',
          content: "I'm here to listen and support you. Would you like to tell me more about what's on your mind?",
          sender: 'bot',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }, 2000);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newMessage: Message = {
        id: crypto.randomUUID(),
        type: 'file',
        content: URL.createObjectURL(file),
        sender: 'user',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, newMessage]);

      if (messages.length === 0) {
        onNewChat(newMessage);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditMessageSave = () => {
    if (messageBeingEdited) {
      const updatedMessages = messages.map((msg) =>
        msg.id === messageBeingEdited.id ? { ...msg, content: messageBeingEdited.content } : msg
      );
      setMessages(updatedMessages);
      setMessageBeingEdited(null); // Close the edit mode
      handleBotResponse(messageBeingEdited.content); // Trigger new bot response
    }
  };

  const handleBotResponse = (userMessage: string) => {
    // Show typing animation
    setIsTyping(true);

    // First bot reply (1/2)
    setTimeout(() => {
      const firstBotReply: Message = {
        id: crypto.randomUUID(),
        type: 'text',
        content: `Thanks for updating your message! Here's my revised response based on: "${userMessage}"`,
        sender: 'bot',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, firstBotReply]);

      // Second bot reply (2/2)
      setTimeout(() => {
        const secondBotReply: Message = {
          id: crypto.randomUUID(),
          type: 'text',
          content: `I hope this helps! Feel free to edit your message again if needed.`,
          sender: 'bot',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, secondBotReply]);
        setIsTyping(false);
      }, 2000);
    }, 2000);
  };

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
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
                <input
                  type="text"
                  value={messageBeingEdited?.content || ''}
                  onChange={(e) =>
                    setMessageBeingEdited((prev) =>
                      prev
                        ? {
                            ...prev,
                            content: e.target.value,
                          }
                        : null
                    )
                  }
                  onKeyDown={(e) => e.key === 'Enter' && handleEditMessageSave()}
                  className="p-2 rounded border w-full bg-white text-gray-800"
                  style={{ padding: '10px', fontSize: '14px', color: '#333', borderColor: '#ccc' }}
                />
              ) : msg.type === 'text' ? (
                <>
                  {msg.content}
                  {msg.sender === 'user' && hoveredMessageId === msg.id && (
                    <button
                      className="absolute top-1 right-2"
                      onClick={() => setMessageBeingEdited(msg)}
                    >
                      <Edit2 className="w-4 h-4 text-white" />
                    </button>
                  )}
                </>
              ) : (
                <img src={msg.content} alt="Uploaded" className="max-w-xs rounded" />
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
            onClick={handleMicClick} // Handle voice input
            className={`p-2 rounded-full transition-colors ${isListening ? 'bg-green-500' : 'hover:bg-gray-100'}`}
            title="Voice input"
          >
            <Mic className="w-5 h-5 text-gray-500" />
          </button>
          <button
            onClick={handleSendMessage}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
  
};

export default ChatWindow;
