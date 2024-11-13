import React from 'react';
import { Users, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { FamilyMember } from '../../types/chat';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCreatingGroup: boolean;
  onCreateGroup: () => void;
  groupName: string;
  onGroupNameChange: (name: string) => void;
  selectedMembers: string[];
  onMemberToggle: (memberId: string) => void;
  familyMembers: FamilyMember[];
  onStartIndividualChat: (memberId: string) => Promise<void>;
  setIsCreatingGroup: (value: boolean) => void;
}

export default function NewChatModal({
  isOpen,
  onClose,
  isCreatingGroup,
  onCreateGroup,
  groupName,
  onGroupNameChange,
  selectedMembers,
  onMemberToggle,
  familyMembers,
  onStartIndividualChat,
  setIsCreatingGroup
}: NewChatModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        onClick={e => e.stopPropagation()}
        className="fixed bottom-0 inset-x-0 bg-gray-900 rounded-t-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {isCreatingGroup ? 'Nouveau groupe' : 'Nouvelle conversation'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {isCreatingGroup ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nom du groupe
                </label>
                <input
                  type="text"
                  placeholder="Ex: Famille Martin"
                  value={groupName}
                  onChange={(e) => onGroupNameChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sélectionner les membres
                </label>
                <div className="space-y-2">
                  {familyMembers.map(member => (
                    <label
                      key={member.id}
                      className="flex items-center p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => onMemberToggle(member.id)}
                        className="mr-3"
                      />
                      <span>{member.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCreateGroup}
                disabled={!groupName || selectedMembers.length === 0}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                Créer le groupe
              </motion.button>
            </div>
          ) : (
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCreatingGroup(true)}
                className="w-full p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center gap-4 hover:bg-blue-500/10 transition-colors"
              >
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium">Créer un groupe</span>
                  <p className="text-sm text-gray-400">Discuter avec plusieurs membres</p>
                </div>
              </motion.button>

              <div className="pt-2">
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Conversation individuelle
                </h3>
                {familyMembers.map(member => (
                  <motion.button
                    key={member.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onStartIndividualChat(member.id)}
                    className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 flex items-center gap-4 hover:bg-gray-700 transition-colors mb-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                      <span className="text-lg font-semibold">{member.name[0]}</span>
                    </div>
                    <span>{member.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}