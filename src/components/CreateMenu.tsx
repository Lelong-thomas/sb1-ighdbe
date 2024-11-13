import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreateMenu({ isOpen, onClose }: CreateMenuProps) {
  const navigate = useNavigate();

  const handleOption = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-24 inset-x-4 z-50 max-w-lg mx-auto"
          >
            <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Ajouter</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-gray-700/50 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Option Tâche */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOption('/create-task')}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 hover:border-blue-500/40 transition-colors group"
                >
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-blue-500/25 transition-shadow">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-white mb-1">Tâche</h3>
                    <p className="text-sm text-gray-400">Ajouter une tâche</p>
                  </div>
                </motion.button>

                {/* Option Événement */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOption('/create-event')}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/20 hover:border-purple-500/40 transition-colors group"
                >
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:shadow-purple-500/25 transition-shadow">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-white mb-1">Événement</h3>
                    <p className="text-sm text-gray-400">Ajouter un événement</p>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CreateMenu;