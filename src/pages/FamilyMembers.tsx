import React, { useState, useEffect } from 'react';
import { Users, Crown, Shield, UserMinus, UserPlus, LogOut, AlertTriangle, Home, Settings } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

interface FamilyMember {
  id: string;
  name: string;
  role: 'creator' | 'deputy' | 'member';
}

function FamilyMembers() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showConfirmation, setShowConfirmation] = useState<{ memberId: string; action: 'remove' | 'deputy' } | null>(null);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [newCreatorId, setNewCreatorId] = useState<string>('');
  const currentUser = useAuthStore((state) => state.user);
  const leaveFamily = useAuthStore((state) => state.leaveFamily);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!currentUser?.familyId) return;

      try {
        const familyDoc = await getDoc(doc(db, 'families', currentUser.familyId));
        if (!familyDoc.exists()) return;

        const familyData = familyDoc.data();
        const memberIds = familyData.members || [];
        const creatorId = familyData.createdBy;
        const deputyId = familyData.deputyId;

        const membersData = await Promise.all(
          memberIds.map(async (memberId: string) => {
            const userDoc = await getDoc(doc(db, 'users', memberId));
            if (!userDoc.exists()) return null;
            const userData = userDoc.data();
            
            let role: 'creator' | 'deputy' | 'member' = 'member';
            if (memberId === creatorId) role = 'creator';
            else if (memberId === deputyId) role = 'deputy';

            return {
              id: memberId,
              name: userData.name,
              role
            };
          })
        );

        const validMembers = membersData.filter((member): member is FamilyMember => member !== null);
        setMembers(validMembers);
      } catch (error) {
        console.error('Error fetching family members:', error);
      }
    };

    fetchMembers();
  }, [currentUser]);

  const handleRemoveMember = async (memberId: string) => {
    if (!currentUser?.familyId) return;
    
    const userRole = members.find(m => m.id === currentUser.id)?.role;
    if (userRole !== 'creator' && userRole !== 'deputy') return;

    try {
      const familyRef = doc(db, 'families', currentUser.familyId);
      const familyDoc = await getDoc(familyRef);
      if (!familyDoc.exists()) return;

      const updatedMembers = familyDoc.data().members.filter((id: string) => id !== memberId);
      await updateDoc(familyRef, { members: updatedMembers });

      const userRef = doc(db, 'users', memberId);
      await updateDoc(userRef, { 
        familyId: null,
        isValidMember: false
      });

      setMembers(members.filter(m => m.id !== memberId));
      setShowConfirmation(null);
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleSetDeputy = async (memberId: string) => {
    if (!currentUser?.familyId) return;
    
    const userRole = members.find(m => m.id === currentUser.id)?.role;
    if (userRole !== 'creator') return;

    try {
      const familyRef = doc(db, 'families', currentUser.familyId);
      await updateDoc(familyRef, { deputyId: memberId });

      setMembers(members.map(member => ({
        ...member,
        role: member.id === memberId ? 'deputy' : 
              member.role === 'deputy' ? 'member' : 
              member.role
      })));
      setShowConfirmation(null);
    } catch (error) {
      console.error('Error setting deputy:', error);
    }
  };

  const handleLeaveFamily = async () => {
    if (!currentUser?.familyId) return;
    
    const userRole = members.find(m => m.id === currentUser.id)?.role;
    
    try {
      if (userRole === 'creator') {
        if (!newCreatorId) {
          alert('Veuillez sélectionner un nouveau créateur');
          return;
        }

        const familyRef = doc(db, 'families', currentUser.familyId);
        await updateDoc(familyRef, { 
          createdBy: newCreatorId,
          deputyId: null
        });
      }

      await leaveFamily();
      navigate('/family-setup');
    } catch (error) {
      console.error('Error leaving family:', error);
    }
  };

  const canManageMembers = (userRole?: 'creator' | 'deputy' | 'member') => {
    return userRole === 'creator' || userRole === 'deputy';
  };

  const currentUserRole = members.find(m => m.id === currentUser?.id)?.role;

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24">
      {/* Header avec effet de gradient */}
      <div className="relative overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
        <div className="relative px-4 py-8">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-4">
              <motion.div 
                className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-sm border border-blue-500/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home className="w-6 h-6 text-blue-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold mb-1">Gestion Familiale</h1>
                <p className="text-gray-400 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {members.length} membres actifs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4">
        {/* Section Membres */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Membres de la Famille
              </h2>
              {canManageMembers(currentUserRole) && (
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 text-sm">
                  Administration
                </div>
              )}
            </div>
          </div>

          <div className="divide-y divide-gray-700/50">
            {members.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 hover:bg-gray-700/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <motion.div 
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center font-semibold text-lg shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {member.name[0].toUpperCase()}
                      </motion.div>
                      {member.role === 'creator' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 p-1 bg-yellow-500/20 rounded-full backdrop-blur-sm border border-yellow-500/20"
                        >
                          <Crown className="w-4 h-4 text-yellow-400" />
                        </motion.div>
                      )}
                      {member.role === 'deputy' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 p-1 bg-blue-500/20 rounded-full backdrop-blur-sm border border-blue-500/20"
                        >
                          <Shield className="w-4 h-4 text-blue-400" />
                        </motion.div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        {member.name}
                        {member.id === currentUser?.id && (
                          <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-400">
                            Vous
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {member.role === 'creator' ? 'Créateur' :
                         member.role === 'deputy' ? 'Adjoint' : 'Membre'}
                      </p>
                    </div>
                  </div>

                  {canManageMembers(currentUserRole) && member.id !== currentUser?.id && (
                    <div className="flex gap-2">
                      {currentUserRole === 'creator' && member.role !== 'deputy' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowConfirmation({ memberId: member.id, action: 'deputy' })}
                          className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                        >
                          <Shield className="w-5 h-5" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowConfirmation({ memberId: member.id, action: 'remove' })}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        <UserMinus className="w-5 h-5" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section Quitter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl border border-red-500/20 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <LogOut className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Quitter la Famille</h2>
                <p className="text-gray-400">Cette action est irréversible</p>
              </div>
            </div>

            <p className="text-gray-400 mb-6">
              {currentUserRole === 'creator' 
                ? "En tant que créateur, vous devez désigner un nouveau créateur avant de quitter la famille."
                : "Vous pouvez quitter la famille à tout moment. Vos données seront conservées."}
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowLeaveConfirmation(true)}
              className="w-full p-4 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Quitter la famille
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowConfirmation(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  {showConfirmation.action === 'remove' ? 
                    <UserMinus className="w-6 h-6 text-blue-400" /> :
                    <Shield className="w-6 h-6 text-blue-400" />
                  }
                </div>
                <h3 className="text-xl font-bold">
                  {showConfirmation.action === 'remove' ? 
                    'Confirmer l\'exclusion' : 
                    'Nommer comme adjoint'}
                </h3>
              </div>

              <p className="text-gray-400 mb-6">
                {showConfirmation.action === 'remove' ? 
                  'Êtes-vous sûr de vouloir exclure ce membre de la famille ?' : 
                  'Voulez-vous nommer ce membre comme adjoint ? L\'adjoint actuel redeviendra membre.'}
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirmation(null)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (showConfirmation.action === 'remove') {
                      handleRemoveMember(showConfirmation.memberId);
                    } else {
                      handleSetDeputy(showConfirmation.memberId);
                    }
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    showConfirmation.action === 'remove' ?
                    'bg-red-500 hover:bg-red-600' :
                    'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  Confirmer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showLeaveConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLeaveConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold">Quitter la famille</h3>
              </div>

              {currentUserRole === 'creator' ? (
                <>
                  <p className="text-gray-400 mb-4">
                    En tant que créateur, vous devez choisir un nouveau créateur avant de quitter la famille.
                  </p>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Sélectionner le nouveau créateur
                    </label>
                    <select
                      value={newCreatorId}
                      onChange={(e) => setNewCreatorId(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Choisir un membre</option>
                      {members
                        .filter(m => m.id !== currentUser?.id)
                        .map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              ) : (
                <p className="text-gray-400 mb-6">
                  Êtes-vous sûr de vouloir quitter la famille ? Cette action est irréversible.
                </p>
              )}

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLeaveConfirmation(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLeaveFamily}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Confirmer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FamilyMembers;