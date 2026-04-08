import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LEVELS } from '../../constants';
import { motion } from 'framer-motion';
import { Trophy, ShieldCheck, Target, Users, ChevronRight, CheckCircle2 } from 'lucide-react';

const LevelScreen: React.FC = () => {
  const { user } = useAuth();
  
  const levels = [
    { id: 'silver', ...LEVELS.silver, icon: Trophy, color: 'text-gray-400', bg: 'bg-gray-50' },
    { id: 'gold', ...LEVELS.gold, icon: Trophy, color: 'text-accent', bg: 'bg-accent/5' },
    { id: 'diamond', ...LEVELS.diamond, icon: Trophy, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  const currentLevelInfo = levels.find(l => l.id === user?.level);
  const nextLevel = levels.find(l => l.minTeam > (user?.teamSize || 0));

  return (
    <div className="p-6 space-y-8">
      {/* Current Level Header */}
      <div className="bg-primary p-8 rounded-[40px] text-white text-center space-y-4 shadow-xl shadow-primary/20">
        <div className="w-20 h-20 bg-white/10 rounded-3xl mx-auto flex items-center justify-center">
          <Trophy size={40} className={currentLevelInfo?.color || 'text-white/20'} />
        </div>
        <div>
          <p className="text-white/60 font-medium">Current Level</p>
          <h2 className="text-3xl font-black uppercase tracking-widest">{user?.level || 'No Level'}</h2>
        </div>
        <div className="bg-accent text-primary px-4 py-2 rounded-2xl inline-flex items-center space-x-2 font-bold">
          <span>Daily Salary: ₹{currentLevelInfo?.dailySalary.toLocaleString('en-IN') || 0}</span>
        </div>
      </div>

      {/* Progress to Next Level */}
      {nextLevel && (
        <div className="bg-bg-light p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center">
                <Target size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Next: {nextLevel.id.toUpperCase()}</p>
                <p className="text-xs text-gray-500">Need {nextLevel.minTeam} members</p>
              </div>
            </div>
            <p className="text-lg font-black text-primary">{user?.teamSize || 0}/{nextLevel.minTeam}</p>
          </div>
          
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(((user?.teamSize || 0) / nextLevel.minTeam) * 100, 100)}%` }}
              className="h-full bg-primary"
            />
          </div>
          
          <p className="text-center text-xs font-bold text-primary/60">
            {nextLevel.minTeam - (user?.teamSize || 0)} more members to reach {nextLevel.id.toUpperCase()}
          </p>
        </div>
      )}

      {/* Levels Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary flex items-center space-x-2">
          <ShieldCheck className="text-blue-600" size={20} />
          <span>All Levels & Rewards</span>
        </h3>
        
        <div className="space-y-4">
          {levels.map((l) => {
            const isUnlocked = (user?.teamSize || 0) >= l.minTeam;
            const isCurrent = user?.level === l.id;
            
            return (
              <div 
                key={l.id} 
                className={`p-5 rounded-3xl border-2 transition-all flex items-center justify-between ${
                  isCurrent ? 'border-primary bg-primary/5' : isUnlocked ? 'border-green-100 bg-green-50/30' : 'border-gray-50 bg-white'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${l.bg} ${l.color}`}>
                    <l.icon size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-primary uppercase tracking-wider">{l.id}</p>
                    <p className="text-xs text-gray-500">{l.minTeam} Members Required</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-primary">₹{l.dailySalary.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Daily Salary</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelScreen;
