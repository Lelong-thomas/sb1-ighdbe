import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  familyId?: string;
  avatar?: string;
  isValidMember?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  setupFamily: (params: { name?: string; code?: string }) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  leaveFamily: () => Promise<void>;
}

const generateFamilyCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const specialChars = '#@$%&*';
  let code = '';
  
  // Format: XXX-0000-YY#
  // Trois lettres majuscules
  for (let i = 0; i < 3; i++) {
    code += chars.charAt(Math.floor(Math.random() * 26));
  }
  
  code += '-';
  
  // Quatre chiffres
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * 10) + 26);
  }
  
  code += '-';
  
  // Deux lettres majuscules
  for (let i = 0; i < 2; i++) {
    code += chars.charAt(Math.floor(Math.random() * 26));
  }
  
  // Un caractère spécial
  code += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  return code;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,

  login: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data() as Omit<User, 'id'>;

      set({
        isAuthenticated: true,
        user: {
          id: userCredential.user.uid,
          ...userData
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  signup: async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      const userData = {
        name,
        email,
        createdAt: new Date().toISOString(),
        isValidMember: false
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      set({
        isAuthenticated: true,
        user: {
          id: userCredential.user.uid,
          ...userData
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ isAuthenticated: false, user: null });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  setupFamily: async (params: { name?: string; code?: string }) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('User not authenticated');

    try {
      if (params.code) {
        // Rejoindre une famille existante
        const familyDoc = await getDoc(doc(db, 'families', params.code));
        if (!familyDoc.exists()) {
          throw new Error('Code famille invalide');
        }

        // Mettre à jour la famille avec le nouveau membre
        await setDoc(doc(db, 'families', params.code), {
          members: [...(familyDoc.data().members || []), userId]
        }, { merge: true });

        // Mettre à jour l'utilisateur comme membre validé
        await setDoc(doc(db, 'users', userId), {
          familyId: params.code,
          isValidMember: true
        }, { merge: true });

        set((state) => ({
          user: state.user ? {
            ...state.user,
            familyId: params.code,
            isValidMember: true
          } : null
        }));
      } else {
        // Créer une nouvelle famille
        const familyId = generateFamilyCode();
        
        // Créer le document de la famille avec le créateur comme membre
        await setDoc(doc(db, 'families', familyId), {
          name: params.name || 'Famille',
          members: [userId],
          createdAt: new Date().toISOString(),
          createdBy: userId
        });

        // Mettre à jour l'utilisateur comme créateur et membre validé
        await setDoc(doc(db, 'users', userId), {
          familyId,
          isValidMember: true
        }, { merge: true });

        set((state) => ({
          user: state.user ? {
            ...state.user,
            familyId,
            isValidMember: true
          } : null
        }));
      }
    } catch (error) {
      console.error('Setup family error:', error);
      throw error;
    }
  },

  updateProfile: async (data: Partial<User>) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('User not authenticated');

    try {
      await setDoc(doc(db, 'users', userId), data, { merge: true });
      
      set((state) => ({
        user: state.user ? {
          ...state.user,
          ...data
        } : null
      }));
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  leaveFamily: async () => {
    const user = useAuthStore.getState().user;
    if (!user?.familyId) throw new Error('User not in a family');

    try {
      // Remove user from family
      const familyRef = doc(db, 'families', user.familyId);
      await updateDoc(familyRef, {
        members: arrayRemove(user.id)
      });

      // Update user document
      await setDoc(doc(db, 'users', user.id), {
        familyId: null,
        isValidMember: false
      }, { merge: true });

      // Update local state
      set((state) => ({
        user: state.user ? {
          ...state.user,
          familyId: undefined,
          isValidMember: false
        } : null
      }));
    } catch (error) {
      console.error('Leave family error:', error);
      throw error;
    }
  }
}));