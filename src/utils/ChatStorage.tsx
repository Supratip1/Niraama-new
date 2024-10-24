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

export const createChat = async (userId: string, firstMessage: Message): Promise<ChatSession> => {
  const chat: ChatSession = {
    id: crypto.randomUUID(),
    userId,
    title: firstMessage.content.slice(0, 50) + '...',
    messages: [firstMessage],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const chats = await getChats(userId);
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
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }
};