import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PACKAGES } from '../../constants';
import { motion } from 'framer-motion';
import { Check, Info, ShieldCheck, Zap, Users } from 'lucide-react';

const PlansScreen: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">Investment Plans</h1>
        <p className="text-gray-500">Higher package = higher referral income</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {PACKAGES.map((pkg, index) => {
          const isActive = user?.packageAmount === pkg.amount;
          return (
            <motion.div
              key={pkg.amount}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-6 rounded-3xl border-2 transition-all ${
                isActive ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-gray-100 bg-white'
              }`}
            >
              {isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Your Current Plan
                </div>
              )}
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-3xl font-black text-primary">₹{pkg.amount.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-500 font-medium mt-1">Referral Bonus Tier</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isActive ? 'bg-primary text-white' : 'bg-bg-light text-primary'}`}>
                  <Zap size={24} />
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <Check size={12} />
                  </div>
                  <p className="text-sm text-gray-600">Referral bonus: <span className="font-bold text-primary">₹{pkg.bonus}</span> per person</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <Check size={12} />
                  </div>
                  <p className="text-sm text-gray-600">Recruit 3 people to earn: <span className="font-bold text-primary">₹{pkg.bonus * 3}</span></p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <Check size={12} />
                  </div>
                  <p className="text-sm text-gray-600">Unlimited depth team growth</p>
                </div>
              </div>

              <button
                disabled={isActive}
                className={`w-full h-12 rounded-xl font-bold transition-all ${
                  isActive ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-accent text-primary shadow-lg shadow-accent/20'
                }`}
              >
                {isActive ? 'Plan Active' : 'Upgrade Plan'}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="bg-primary p-8 rounded-[40px] text-white space-y-6">
        <div className="flex items-center space-x-3">
          <Info className="text-accent" size={24} />
          <h2 className="text-xl font-bold">How referral income works</h2>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck className="text-accent" size={20} />
            </div>
            <div>
              <p className="font-bold">1. You Join</p>
              <p className="text-sm text-white/60">Choose a package and activate your account.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
              <Users className="text-accent" size={20} />
            </div>
            <div>
              <p className="font-bold">2. You Refer</p>
              <p className="text-sm text-white/60">Share your code with friends and family.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
              <TrendingUp className="text-accent" size={20} />
            </div>
            <div>
              <p className="font-bold">3. You Earn</p>
              <p className="text-sm text-white/60">Get instant bonuses for every active recruit.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrendingUp = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export default PlansScreen;
