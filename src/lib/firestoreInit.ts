import { db } from './firebase';
import { collection, doc, getDocs } from 'firebase/firestore';

// Suppression des données initiales car les utilisateurs doivent créer leurs propres familles
export const initializeFirestoreData = async () => {
  try {
    // Vérifie si les données existent déjà
    const checkCollection = await getDocs(collection(db, 'families'));
    if (!checkCollection.empty) {
      console.log('Les données existent déjà');
      return;
    }

    console.log('Base de données prête pour les nouvelles familles');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Firestore:', error);
    throw error;
  }
};