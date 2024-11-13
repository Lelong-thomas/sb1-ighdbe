import React from 'react';
import { Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatHeaderProps {
  onNewChat: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function ChatHeader({ onNewChat, searchQuery, onSearchChange }: ChatHeaderProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
      <div className="max-w-xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Messages</h1>
          <motion.button
            onClick={onNewChat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-2 text-white"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">Nouvelle conversation</span>
          </motion.button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}