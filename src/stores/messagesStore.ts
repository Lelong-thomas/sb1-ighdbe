import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  getDocs,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuthStore } from './authStore';

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  read: boolean;
  familyId: string;
  imageUrl?: string;
  type: 'text' | 'image';
}

interface Chat {
  id: string;
  type: 'individual' | 'group';
  participants: string[];
  name?: string;
  lastMessage?: Message;
  familyId: string;
}

interface MessagesState {
  chats: Chat[];
  messages: Message[];
  addMessage: (chatId: string, content: string, type?: 'text' | 'image', imageFile?: File) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  createChat: (type: 'individual' | 'group', participants: string[], name?: string) => Promise<string>;
  markAsRead: (chatId: string) => Promise<void>;
  getUnreadCount: (chatId: string) => number;
  getChatMessages: (chatId: string) => Message[];
  subscribeToFamilyChats: (familyId: string) => () => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  chats: [],
  messages: [],

  addMessage: async (chatId, content, type = 'text', imageFile?) => {
    const user = useAuthStore.getState().user;
    if (!user?.familyId) throw new Error('User not in a family');

    try {
      let imageUrl;
      if (type === 'image' && imageFile) {
        const storageRef = ref(storage, `chat-images/${chatId}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const timestamp = Timestamp.now();
      const newMessage = {
        chatId,
        content,
        senderId: user.id,
        senderName: user.name,
        timestamp,
        read: false,
        familyId: user.familyId,
        type,
        ...(imageUrl && { imageUrl })
      };

      const messagesRef = collection(db, 'messages');
      const docRef = await addDoc(messagesRef, newMessage);

      const chatRef = doc(db, 'chats', chatId);
      await setDoc(chatRef, {
        lastMessage: {
          content: type === 'image' ? '📷 Photo' : content,
          timestamp
        },
        type: chatId === 'family' ? 'group' : 'individual',
        participants: [],
        familyId: user.familyId,
        updatedAt: timestamp
      }, { merge: true });

      set(state => ({
        messages: [...state.messages, {
          id: docRef.id,
          ...newMessage,
          timestamp: timestamp.toDate()
        }]
      }));
    } catch (error) {
      console.error('Add message error:', error);
      throw error;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await deleteDoc(messageRef);
      
      set(state => ({
        messages: state.messages.filter(m => m.id !== messageId)
      }));
    } catch (error) {
      console.error('Delete message error:', error);
      throw error;
    }
  },

  createChat: async (type, participants, name) => {
    const user = useAuthStore.getState().user;
    if (!user?.familyId) throw new Error('User not in a family');

    try {
      const chatData = {
        type,
        participants,
        name: name || (type === 'individual' ? '' : 'Nouveau groupe'),
        familyId: user.familyId,
        createdAt: serverTimestamp(),
        createdBy: user.id
      };

      const chatsRef = collection(db, 'chats');
      const docRef = await addDoc(chatsRef, chatData);
      
      set(state => ({
        chats: [...state.chats, { id: docRef.id, ...chatData }]
      }));

      return docRef.id;
    } catch (error) {
      console.error('Create chat error:', error);
      throw error;
    }
  },

  markAsRead: async (chatId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const q = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        where('read', '==', false),
        where('senderId', '!=', user.id)
      );

      const querySnapshot = await getDocs(q);
      const batch = querySnapshot.docs.map(doc =>
        updateDoc(doc.ref, { read: true })
      );

      await Promise.all(batch);

      set(state => ({
        messages: state.messages.map(message => 
          message.chatId === chatId && message.senderId !== user.id
            ? { ...message, read: true }
            : message
        )
      }));
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  },

  getUnreadCount: (chatId) => {
    const user = useAuthStore.getState().user;
    if (!user) return 0;

    return get().messages.filter(
      message => message.chatId === chatId && !message.read && message.senderId !== user.id
    ).length;
  },

  getChatMessages: (chatId) => {
    return get().messages
      .filter(message => message.chatId === chatId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  },

  subscribeToFamilyChats: (familyId) => {
    const chatsUnsubscribe = onSnapshot(
      query(collection(db, 'chats'), where('familyId', '==', familyId)),
      (snapshot) => {
        const chats = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Chat[];
        set({ chats });
      }
    );

    const messagesUnsubscribe = onSnapshot(
      query(collection(db, 'messages'), where('familyId', '==', familyId)),
      (snapshot) => {
        const messages = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date()
          };
        }) as Message[];
        set({ messages });
      }
    );

    return () => {
      chatsUnsubscribe();
      messagesUnsubscribe();
    };
  }
}));