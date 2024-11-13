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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './authStore';

export interface Event {
  id: string;
  title: string;
  date: Date;
  color: string;
  type: 'event' | 'task';
  completed?: boolean;
  assignee?: string;
  createdBy: string;
  createdByName: string;
  completedAt?: Date;
  familyId: string;
}

interface EventsState {
  events: Event[];
  addEvent: (event: Omit<Event, 'id' | 'createdBy' | 'createdByName' | 'familyId'>) => Promise<void>;
  updateEvent: (event: Event) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  completeTask: (eventId: string) => Promise<void>;
  canModifyEvent: (eventId: string) => boolean;
  getPointsForUser: (userName: string) => number;
  subscribeToFamilyEvents: (familyId: string) => () => void;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],

  addEvent: async (event) => {
    const user = useAuthStore.getState().user;
    if (!user?.familyId) throw new Error('User not in a family');

    try {
      const newEvent = {
        ...event,
        createdBy: user.id,
        createdByName: user.name,
        familyId: user.familyId,
        completed: false,
        date: new Date(event.date)
      };

      const docRef = await addDoc(collection(db, 'events'), newEvent);
      
      // Mettre à jour le state local immédiatement
      set(state => ({
        events: [...state.events, { ...newEvent, id: docRef.id }]
      }));

      return docRef.id;
    } catch (error) {
      console.error('Add event error:', error);
      throw error;
    }
  },

  updateEvent: async (event) => {
    try {
      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, { ...event });
      
      // Mettre à jour le state local
      set(state => ({
        events: state.events.map(e => 
          e.id === event.id ? event : e
        )
      }));
    } catch (error) {
      console.error('Update event error:', error);
      throw error;
    }
  },

  deleteEvent: async (eventId) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
      
      // Mettre à jour le state local
      set(state => ({
        events: state.events.filter(e => e.id !== eventId)
      }));
    } catch (error) {
      console.error('Delete event error:', error);
      throw error;
    }
  },

  completeTask: async (eventId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const eventRef = doc(db, 'events', eventId);
      const completedAt = new Date();
      await updateDoc(eventRef, {
        completed: true,
        completedAt
      });

      // Mettre à jour le state local
      set(state => ({
        events: state.events.map(e => 
          e.id === eventId 
            ? { ...e, completed: true, completedAt } 
            : e
        )
      }));
    } catch (error) {
      console.error('Complete task error:', error);
      throw error;
    }
  },

  canModifyEvent: (eventId) => {
    const user = useAuthStore.getState().user;
    if (!user) return false;
    
    const event = get().events.find(e => e.id === eventId);
    return event?.createdBy === user.id || 
           (event?.type === 'task' && event?.assignee?.toLowerCase() === user.name.toLowerCase());
  },

  getPointsForUser: (userName) => {
    return get().events.filter(
      event => 
        event.type === 'task' && 
        event.completed && 
        event.assignee?.toLowerCase() === userName.toLowerCase()
    ).length;
  },

  subscribeToFamilyEvents: (familyId) => {
    const q = query(
      collection(db, 'events'),
      where('familyId', '==', familyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: new Date(doc.data().date.toDate())
      })) as Event[];

      set({ events });
    });

    return unsubscribe;
  }
}));