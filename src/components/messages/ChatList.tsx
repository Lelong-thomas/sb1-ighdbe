import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Users, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Chat } from '../../types/chat';

interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chatId: string) => void;
  selectedChatId?: string;
  unreadCounts: Record<string, number>;
}

export default function ChatList({ chats, onSelectChat, selectedChatId, unreadCounts }: ChatListProps) {
  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <motion.button
          key={chat.id}
          onClick={() => onSelectChat(chat.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full p-4 rounded-xl border transition-all ${
            selectedChatId === chat.id
              ? 'bg-blue-500/10 border-blue-500/30'
              : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center ${
              chat.type === 'group' 
                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                : 'bg-gradient-to-br from-gray-700 to-gray-600'
            }`}>
              {chat.type === 'group' ? (
                <Users className="w-6 h-6 text-blue-400" />
              ) : (
                <span className="text-lg font-semibold">{chat.name?.[0]}</span>
              )}
              {unreadCounts[chat.id] > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs font-medium">
                  {unreadCounts[chat.id]}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium truncate">
                  {chat.type === 'group' ? chat.name : chat.participants[0]?.name}
                </h3>
                {chat.lastMessage?.timestamp && (
                  <span className="text-xs text-gray-400">
                    {format(new Date(chat.lastMessage.timestamp), 'HH:mm')}
                  </span>
                )}
              </div>
              {chat.lastMessage && (
                <p className="text-sm text-gray-400 truncate">
                  {chat.lastMessage.content}
                </p>
              )}
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}