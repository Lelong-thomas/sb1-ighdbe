import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useEventsStore } from '../stores/eventsStore';
import { 
  UserCircle, Award, LogOut, Camera, Eye, EyeOff, 
  TrendingUp, Calendar, CheckCircle2, Edit2, 
  Gift, Users, Copy, Trophy, Star, Medal, Target,
  Heart, Home, BookOpen, Smile, Zap, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Profile() {
  const { user, logout, updateProfile } = useAuthStore();
  const { events, points } = useEventsStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: formData.name,
      email: formData.email,
    });
    setIsEditing(false);
  };

  const copyFamilyCode = () => {
    if (user?.familyId) {
      navigator.clipboard.writeText(user.familyId);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    }
  };

  const monthlyStats = {
    tasksCompleted: events.filter(e => e.type === 'task' && e.completed).length,
    eventsCreated: events.filter(e => e.type === 'event').length,
    totalPoints: points,
    completionRate: Math.round((events.filter(e => e.type === 'task' && e.completed).length / 
      Math.max(events.filter(e => e.type === 'task').length, 1)) * 100)
  };

  const achievements = [
    {
      level: 1,
      title: "Premier Pas",
      description: "Complétez votre première tâche familiale",
      icon: CheckCircle2,
      progress: monthlyStats.tasksCompleted > 0 ? 100 : 0,
      reward: "Badge Débutant"
    },
    {
      level: 2,
      title: "Esprit d'Équipe",
      description: "Complétez 10 tâches familiales",
      icon: Users,
      progress: Math.min((monthlyStats.tasksCompleted / 10) * 100, 100),
      reward: "Badge Collaborateur"
    },
    {
      level: 3,
      title: "Étoile Montante",
      description: "Gagnez 50 points",
      icon: Star,
      progress: Math.min((points / 50) * 100, 100),
      reward: "Badge Étoile"
    },
    {
      level: 4,
      title: "Organisateur",
      description: "Créez 5 événements familiaux",
      icon: Calendar,
      progress: Math.min((monthlyStats.eventsCreated / 5) * 100, 100),
      reward: "Badge Planificateur"
    },
    {
      level: 5,
      title: "Pilier Familial",
      description: "Maintenez un taux de complétion de 80%",
      icon: Home,
      progress: monthlyStats.completionRate >= 80 ? 100 : (monthlyStats.completionRate * 100) / 80,
      reward: "Badge Excellence"
    },
    {
      level: 6,
      title: "Champion Hebdomadaire",
      description: "Terminez en tête du classement pendant une semaine",
      icon: Crown,
      progress: 0, // À implémenter avec la logique de classement
      reward: "Couronne Virtuelle"
    },
    {
      level: 7,
      title: "Mentor Familial",
      description: "Aidez d'autres membres à compléter leurs tâches",
      icon: Heart,
      progress: 0, // À implémenter
      reward: "Badge Mentor"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24">
      <div className="max-w-2xl mx-auto p-6">
        {/* En-tête du profil avec effet de gradient */}
        <div className="relative mb-8 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-600/30" />
          <div className="relative p-6 backdrop-blur-sm">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-1">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    <UserCircle className="w-16 h-16 text-blue-400" />
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors shadow-lg">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Code Famille */}
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur rounded-lg border border-gray-700">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">Code Famille: {user?.familyId}</span>
                  <button
                    onClick={copyFamilyCode}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <AnimatePresence>
                  {showCopiedMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-green-400 mt-2"
                    >
                      Code copié !
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Informations du profil */}
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Email"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                    >
                      Sauvegarder
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">{user?.name}</h2>
                  <p className="text-gray-400">{user?.email}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Modifier le profil
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progression Mensuelle */}
        <section className="mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            Progression Mensuelle
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-500/10 to-blue-500/20 backdrop-blur p-4 rounded-xl border border-blue-500/20"
            >
              <div className="text-3xl font-bold text-blue-400">{monthlyStats.tasksCompleted}</div>
              <div className="text-sm text-gray-400">Tâches Complétées</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-500/10 to-green-500/20 backdrop-blur p-4 rounded-xl border border-green-500/20"
            >
              <div className="text-3xl font-bold text-green-400">{monthlyStats.totalPoints}</div>
              <div className="text-sm text-gray-400">Points Gagnés</div>
            </motion.div>
          </div>
        </section>

        {/* Succès Familiaux */}
        <section className="mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Succès Familiaux
          </h2>
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.level}
                whileHover={{ scale: 1.01 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur p-4 rounded-xl border border-gray-700"
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20">
                    <achievement.icon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Niveau {achievement.level}: {achievement.title}</h3>
                      <span className="text-sm text-yellow-400">{Math.round(achievement.progress)}%</span>
                    </div>
                    <p className="text-sm text-gray-400">{achievement.description}</p>
                  </div>
                </div>
                <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${achievement.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-400 to-orange-400"
                  />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-400">
                    Récompense: {achievement.reward}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Bouton de déconnexion */}
        <button
          onClick={logout}
          className="w-full bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur p-4 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/30 transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}

export default Profile;