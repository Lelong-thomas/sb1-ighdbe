import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Crown, Star, CheckCircle2, TrendingUp } from 'lucide-react';
import { useEventsStore } from '../stores/eventsStore';
import { useAuthStore } from '../stores/authStore';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface FamilyMember {
  id: string;
  name: string;
  points: number;
  tasksCompleted: number;
}

function Leaderboard() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const getPointsForUser = useEventsStore((state) => state.getPointsForUser);
  const currentUser = useAuthStore((state) => state.user);

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
              name: userData.name,
              points: getPointsForUser(userData.name),
              tasksCompleted: getPointsForUser(userData.name)
            };
          })
        );

        const validMembers = membersData
          .filter((member): member is FamilyMember => member !== null)
          .sort((a, b) => b.points - a.points)
          .map((member, index) => ({
            ...member,
            position: index + 1
          }));

        setFamilyMembers(validMembers);
      } catch (error) {
        console.error('Error fetching family members:', error);
      }
    };

    fetchFamilyMembers();
  }, [currentUser, getPointsForUser]);

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const podiumVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.3
      }
    }
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const progressVariants = {
    hidden: { width: 0 },
    visible: (progress: number) => ({
      width: `${progress}%`,
      transition: {
        duration: 1,
        ease: "easeOut",
        delay: 1
      }
    })
  };

  if (familyMembers.length === 0) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-900 text-white flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-center">
          <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Aucun membre</h2>
          <p className="text-gray-400">Invitez des membres à rejoindre votre famille</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24">
      {/* Header avec effet de gradient */}
      <motion.div 
        className="relative overflow-hidden"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20" />
        <div className="relative px-6 py-8">
          <div className="text-center">
            <motion.div 
              className="inline-flex items-center justify-center p-3 bg-yellow-500/10 rounded-xl backdrop-blur-sm border border-yellow-500/20 mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trophy className="w-8 h-8 text-yellow-400" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Classement Familial</h1>
            <p className="text-gray-400">Chaque tâche complétée rapporte 1 point</p>
          </div>
        </div>
      </motion.div>

      {/* Podium */}
      <motion.div 
        className="px-6 -mt-4 mb-8"
        variants={podiumVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {familyMembers.slice(0, 3).map((member, index) => (
            <motion.div
              key={member.id}
              className={`flex flex-col items-center ${index === 1 ? 'order-first' : ''}`}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className={`relative w-16 h-16 mb-2 ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  'bg-orange-500'
                } rounded-full flex items-center justify-center shadow-lg`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-xl font-bold">{member.name[0]}</span>
                <motion.div 
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-sm border-2 border-gray-700"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {index + 1}
                </motion.div>
              </motion.div>
              <span className="text-sm font-medium">{member.name}</span>
              <motion.span 
                className="text-xs text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {member.points} pts
              </motion.span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Statistiques détaillées */}
      <motion.div 
        className="px-6"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="space-y-4">
          {familyMembers.map((member) => (
            <motion.div
              key={member.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur rounded-xl border border-gray-700 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="relative"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      member.position === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                      member.position === 2 ? 'bg-gray-500/20 text-gray-400' :
                      member.position === 3 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {member.position === 1 && <Crown className="w-6 h-6" />}
                      {member.position === 2 && <Medal className="w-6 h-6" />}
                      {member.position === 3 && <Medal className="w-6 h-6" />}
                      {member.position > 3 && <Star className="w-6 h-6" />}
                    </div>
                  </motion.div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <motion.div 
                        className="flex items-center gap-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.2 }}
                      >
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="font-bold">{member.points} points</span>
                      </motion.div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{member.tasksCompleted} tâches</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>#{member.position} au classement</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Barre de progression */}
              <div className="h-1 bg-gray-800">
                <motion.div
                  variants={progressVariants}
                  custom={(member.points / familyMembers[0].points) * 100}
                  initial="hidden"
                  animate="visible"
                  className={`h-full ${
                    member.position === 1 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                    member.position === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    member.position === 3 ? 'bg-gradient-to-r from-orange-400 to-red-400' :
                    'bg-gradient-to-r from-blue-400 to-blue-500'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default Leaderboard;