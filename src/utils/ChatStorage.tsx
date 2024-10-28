export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  type: 'text' | 'file';
  content: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

const STORAGE_KEY = 'niraama_chats';

const WELCOME_MESSAGE: Message = {
  id: crypto.randomUUID(),
  type: 'text',
  content: 'Hi! I am Niraama, your mental health companion. How are you feeling today?',
  sender: 'bot',
  timestamp: Date.now(),
};

const BOT_RESPONSE: Message = {
  id: crypto.randomUUID(),
  type: 'text',
  content: "I'm here to listen and support you. Would you like to tell me more about what's on your mind?",
  sender: 'bot',
  timestamp: Date.now(),
};
export const sendMessageToBot = async (userMessage: string): Promise<Message> => {
  try {
    const response = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        "Authorization": "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", // Use your token here
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch response from bot.");
    }

    const data = await response.json();
    return {
      id: crypto.randomUUID(),
      type: 'text',
      content: data.response, // Assuming your FastAPI returns { response: "..." }
      sender: 'bot',
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Error sending message to bot:", error);
    return {
      id: crypto.randomUUID(),
      type: 'text',
      content: "Sorry, I couldn't get a response from the bot.",
      sender: 'bot',
      timestamp: Date.now(),
    };
  }
};

export const createChat = async (userId: string, firstMessage: Message): Promise<ChatSession> => {
  const chat: ChatSession = {
    id: crypto.randomUUID(),
    userId,
    title: firstMessage.content.slice(0, 50) + '...',
    messages: [
      { ...WELCOME_MESSAGE, timestamp: Date.now() - 2000 },
      firstMessage,  // Initial user message
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const chats = await getChats(userId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([chat, ...chats]));

  // Get the bot's response from FastAPI
  const botMessage = await sendMessageToBot(firstMessage.content);
  chat.messages.push(botMessage); // Add bot response to messages
  chat.updatedAt = Date.now();

  // Update the chat in local storage
  localStorage.setItem(STORAGE_KEY, JSON.stringify([chat, ...chats]));

  return chat;
};

export const getChats = async (userId: string): Promise<ChatSession[]> => {
  const storedChats = localStorage.getItem(STORAGE_KEY);
  if (!storedChats) return [];
  
  const chats: ChatSession[] = JSON.parse(storedChats);
  return chats.filter(chat => chat.userId === userId);
};

export const getChat = async (chatId: string): Promise<ChatSession | null> => {
  const storedChats = localStorage.getItem(STORAGE_KEY);
  if (!storedChats) return null;
  
  const chats: ChatSession[] = JSON.parse(storedChats);
  return chats.find(chat => chat.id === chatId) || null;
};

export const updateChat = async (chatId: string, messages: Message[]): Promise<void> => {
  const storedChats = localStorage.getItem(STORAGE_KEY);
  if (!storedChats) return;
  
  const chats: ChatSession[] = JSON.parse(storedChats);
  const chatIndex = chats.findIndex(chat => chat.id === chatId);
  
  if (chatIndex !== -1) {
    chats[chatIndex] = {
      ...chats[chatIndex],
      messages,
      title: messages.find(m => m.sender === 'user')?.content.slice(0, 50) + '...' || chats[chatIndex].title,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }
};

export const deleteChat = async (chatId: string): Promise<void> => {
  const storedChats = localStorage.getItem(STORAGE_KEY);
  if (!storedChats) return;
  
  const chats: ChatSession[] = JSON.parse(storedChats);
  const updatedChats = chats.filter(chat => chat.id !== chatId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChats));
};