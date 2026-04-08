import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MILESTONES, LEVELS } from '../../constants';
import { motion } from 'framer-motion';
import { Copy, Share2, Users, Trophy, Target, ChevronDown, ChevronUp, UserPlus } from 'lucide-react';

const ReferScreen: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join EarnTree',
        text: `Join EarnTree and start earning! Use my referral code: ${user?.referralCode}`,
        url: window.location.origin,
      });
    }
  };

  const getDailyBonus = () => {
    const count = user?.dailyRecruitCount || 0;
    if (count === 1) return 50;
    if (count === 2) return 100;
    if (count >= 3) return 150;
    return 0;
  };

  return (
    <div className="p-6 space-y-8">
      {/* Referral Code Card */}
      <div className="bg-primary p-8 rounded-[40px] text-white text-center space-y-6 shadow-xl shadow-primary/20">
        <p className="text-white/60 font-medium">My Referral Code</p>
        <h2 className="text-5xl font-black tracking-[0.2em] text-accent">{user?.referralCode}</h2>
        <div className="flex space-x-3">
          <button 
            onClick={handleCopy}
            className="flex-1 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center space-x-2 transition-colors"
          >
            <Copy size={18} />
            <span className="font-bold">{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <button 
            onClick={handleShare}
            className="flex-1 h-12 bg-accent text-primary rounded-2xl flex items-center justify-center space-x-2 font-bold"
          >
            <Share2 size={18} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Daily Bonus Tracker */}
      <div className="bg-bg-light p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent text-primary rounded-2xl flex items-center justify-center">
              <Target size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">Daily Recruits</p>
              <p className="text-xs text-gray-500">Resets at midnight</p>
            </div>
          </div>
          <p className="text-lg font-black text-primary">{user?.dailyRecruitCount || 0}/3</p>
        </div>
        
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(((user?.dailyRecruitCount || 0) / 3) * 100, 100)}%` }}
            className="h-full bg-accent"
          />
        </div>
        
        <div className="flex justify-between items-center text-xs font-bold">
          <p className="text-gray-500">Today's bonus earned:</p>
          <p className="text-green-600">₹{getDailyBonus()}</p>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm space-y-2">
          <Users className="text-blue-600" size={24} />
          <p className="text-xs text-gray-500 font-medium">Total Team</p>
          <p className="text-2xl font-black text-primary">{user?.teamSize || 0}</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm space-y-2">
          <UserPlus className="text-orange-600" size={24} />
          <p className="text-xs text-gray-500 font-medium">Directs</p>
          <p className="text-2xl font-black text-primary">{user?.directReferrals || 0}</p>
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary flex items-center space-x-2">
          <Trophy className="text-accent" size={20} />
          <span>Monthly Milestones</span>
        </h3>
        
        <div className="space-y-4">
          {MILESTONES.map((m) => {
            const isReached = user?.milestonesReached.includes(m.teamSize);
            const progress = Math.min(((user?.teamSize || 0) / m.teamSize) * 100, 100);
            
            return (
              <div key={m.teamSize} className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-primary">{m.teamSize} Members</p>
                    <p className="text-xs text-gray-500">Reward: ₹{m.bonus.toLocaleString('en-IN')}</p>
                  </div>
                  {isReached ? (
                    <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      Reached
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-accent">{m.teamSize - (user?.teamSize || 0)} more needed</p>
                  )}
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReferScreen;
