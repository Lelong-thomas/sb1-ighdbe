import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useMessagesStore } from '../stores/messagesStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Chat, FamilyMember } from '../types/chat';
import ChatHeader from '../components/messages/ChatHeader';
import ChatList from '../components/messages/ChatList';
import NewChatModal from '../components/messages/NewChatModal';

function Messages() {
  const [showNewChat, setShowNewChat] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string>();
  
  const currentUser = useAuthStore((state) => state.user);
  const { createChat, chats, getUnreadCount } = useMessagesStore();

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      if (!currentUser?.familyId) return;

      try {
        const familyDoc = await getDoc(doc(db, 'families', currentUser.familyId));
        if (!familyDoc.exists()) return;

        const memberIds = familyDoc.data().members || [];
        const membersData = await Promise.all(
          memberIds.map(async (memberId: string) => {
            const userDoc = await getDoc(doc(db, 'users', memberId));
            if (!userDoc.exists()) return null;
            const userData = userDoc.data();
            return {
              id: memberId,
              name: userData.name
            };
          })
        );

        const validMembers = membersData
          .filter((member): member is FamilyMember => member !== null)
          .filter(member => member.id !== currentUser.id);
        setFamilyMembers(validMembers);
      } catch (error) {
        console.error('Error fetching family members:', error);
      }
    };

    fetchFamilyMembers();
  }, [currentUser]);

  const handleCreateGroup = async () => {
    if (!groupName || selectedMembers.length === 0) return;

    try {
      const participants = [...selectedMembers, currentUser!.id];
      const chatId = await createChat('group', participants, groupName);
      setShowNewChat(false);
      setIsCreatingGroup(false);
      setGroupName('');
      setSelectedMembers([]);
      setSelectedChatId(chatId);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleStartIndividualChat = async (memberId: string) => {
    try {
      const chatId = await createChat('individual', [memberId, currentUser!.id]);
      setShowNewChat(false);
      setSelectedChatId(chatId);
    } catch (error) {
      console.error('Error starting individual chat:', error);
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const filteredChats = chats.filter(chat => {
    const searchLower = searchQuery.toLowerCase();
    return (
      chat.name?.toLowerCase().includes(searchLower) ||
      chat.participants.some(p => p.name.toLowerCase().includes(searchLower))
    );
  });

  const unreadCounts = chats.reduce((acc, chat) => ({
    ...acc,
    [chat.id]: getUnreadCount(chat.id)
  }), {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24">
      <ChatHeader
        onNewChat={() => setShowNewChat(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="max-w-xl mx-auto px-4 py-4">
        <ChatList
          chats={filteredChats}
          onSelectChat={setSelectedChatId}
          selectedChatId={selectedChatId}
          unreadCounts={unreadCounts}
        />
      </div>

      <AnimatePresence>
        {showNewChat && (
          <NewChatModal
            isOpen={showNewChat}
            onClose={() => {
              setShowNewChat(false);
              setIsCreatingGroup(false);
              setGroupName('');
              setSelectedMembers([]);
            }}
            isCreatingGroup={isCreatingGroup}
            onCreateGroup={handleCreateGroup}
            groupName={groupName}
            onGroupNameChange={setGroupName}
            selectedMembers={selectedMembers}
            onMemberToggle={handleMemberToggle}
            familyMembers={familyMembers}
            onStartIndividualChat={handleStartIndividualChat}
            setIsCreatingGroup={setIsCreatingGroup}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Messages;