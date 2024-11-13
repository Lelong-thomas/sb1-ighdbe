import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useEventsStore } from '../stores/eventsStore';
import { useAuthStore } from '../stores/authStore';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface FamilyMember {
  id: string;
  name: string;
}

export default function CreateTask() {
  const navigate = useNavigate();
  const addEvent = useEventsStore((state) => state.addEvent);
  const currentUser = useAuthStore((state) => state.user);
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

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

        const validMembers = membersData.filter((member): member is FamilyMember => member !== null);
        setFamilyMembers(validMembers);
      } catch (error) {
        console.error('Error fetching family members:', error);
      }
    };

    fetchFamilyMembers();
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !assignee || !dueDate) return;

    const newTask = {
      title,
      date: new Date(dueDate),
      color: 'bg-blue-500/20 text-blue-300',
      type: 'task' as const,
      completed: false,
      assignee
    };

    addEvent(newTask);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24">
      <div className="max-w-xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Nouvelle Tâche</h1>
          <p className="text-gray-400">Ajouter une tâche au calendrier familial</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Titre de la tâche
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Assigner à
            </label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner un membre</option>
              {familyMembers.map((member) => (
                <option key={member.id} value={member.name}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Date et heure
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition duration-200 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Confirmer
          </motion.button>
        </form>
      </div>
    </div>
  );
}