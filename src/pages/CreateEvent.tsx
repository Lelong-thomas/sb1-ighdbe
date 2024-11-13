import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import { useEventsStore } from '../stores/eventsStore';
import { motion } from 'framer-motion';

export default function CreateEvent() {
  const navigate = useNavigate();
  const addEvent = useEventsStore((state) => state.addEvent);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [color, setColor] = useState('blue');

  const colors = [
    { id: 'blue', bg: 'bg-blue-500/20', text: 'text-blue-300' },
    { id: 'green', bg: 'bg-green-500/20', text: 'text-green-300' },
    { id: 'purple', bg: 'bg-purple-500/20', text: 'text-purple-300' },
    { id: 'red', bg: 'bg-red-500/20', text: 'text-red-300' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !date) return;

    const selectedColor = colors.find(c => c.id === color);
    
    const newEvent = {
      title,
      date: new Date(date),
      color: `${selectedColor?.bg} ${selectedColor?.text}`,
      type: 'event' as const
    };

    addEvent(newEvent);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24">
      <div className="max-w-xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Nouvel Événement</h1>
          <p className="text-gray-400">Ajouter un événement au calendrier familial</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Titre de l'événement
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
              Date et heure
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Couleur
            </label>
            <div className="flex gap-3">
              {colors.map((c) => (
                <motion.button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-8 h-8 rounded-full ${c.bg} ${c.text} flex items-center justify-center border-2 ${
                    color === c.id ? 'border-gray-400' : 'border-transparent'
                  }`}
                >
                  {color === c.id && '✓'}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition duration-200 flex items-center justify-center gap-2"
          >
            <CalendarClock className="w-5 h-5" />
            Confirmer
          </motion.button>
        </form>
      </div>
    </div>
  );
}