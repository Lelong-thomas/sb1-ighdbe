import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Leaderboard from './pages/Leaderboard';
import CreateTask from './pages/CreateTask';
import CreateEvent from './pages/CreateEvent';
import Profile from './pages/Profile';
import FamilyMembers from './pages/FamilyMembers';
import Login from './pages/Login';
import FamilySetup from './pages/FamilySetup';
import { useAuthStore } from './stores/authStore';
import PageTransition from './components/PageTransition';

function AppRoutes() {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        <PageTransition key="login">
          <Login />
        </PageTransition>
      </AnimatePresence>
    );
  }

  if (!user?.familyId) {
    return (
      <AnimatePresence mode="wait">
        <PageTransition key="family-setup">
          <FamilySetup />
        </PageTransition>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={
            <PageTransition key="dashboard">
              <Dashboard />
            </PageTransition>
          } />
          <Route path="messages" element={
            <PageTransition key="messages">
              <Messages />
            </PageTransition>
          } />
          <Route path="leaderboard" element={
            <PageTransition key="leaderboard">
              <Leaderboard />
            </PageTransition>
          } />
          <Route path="create-task" element={
            <PageTransition key="create-task">
              <CreateTask />
            </PageTransition>
          } />
          <Route path="create-event" element={
            <PageTransition key="create-event">
              <CreateEvent />
            </PageTransition>
          } />
          <Route path="profile" element={
            <PageTransition key="profile">
              <Profile />
            </PageTransition>
          } />
          <Route path="family-members" element={
            <PageTransition key="family-members">
              <FamilyMembers />
            </PageTransition>
          } />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default AppRoutes;