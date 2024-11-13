import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

function FamilySetup() {
  const [isJoining, setIsJoining] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setupFamily = useAuthStore((state) => state.setupFamily);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await setupFamily(isJoining ? { code: familyCode } : { name: familyName });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gray-800/50 p-4 rounded-full inline-block mb-4 border border-gray-700">
            <Users className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-gray-400">Let's get you connected with your family</p>
        </div>

        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <div className="flex mb-6">
            <button
              type="button"
              className={`flex-1 py-2 text-center ${!isJoining ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
              onClick={() => setIsJoining(false)}
            >
              Create Family
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-center ${isJoining ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
              onClick={() => setIsJoining(true)}
            >
              Join Family
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isJoining ? (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Family Code
                </label>
                <input
                  type="text"
                  value={familyCode}
                  onChange={(e) => setFamilyCode(e.target.value)}
                  placeholder="Enter the code shared by your family"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Family Name
                </label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Enter a name for your family"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              {isJoining ? 'Join Family' : 'Create Family'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FamilySetup;