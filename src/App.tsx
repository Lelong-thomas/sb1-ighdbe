import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { initializeFirestoreData } from './lib/firestoreInit';

// Initialize Firestore data
initializeFirestoreData().catch(console.error);

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;