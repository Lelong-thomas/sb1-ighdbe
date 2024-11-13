import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import { AnimatePresence } from 'framer-motion';

function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="pb-20">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>
      <Navigation />
    </div>
  );
}

export default Layout;