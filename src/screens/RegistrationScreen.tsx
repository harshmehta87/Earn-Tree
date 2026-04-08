import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { referralService } from '../services/referralService';
import { User, UserLevel } from '../types';
import { PACKAGES } from '../constants';
import { motion } from 'framer-motion';
import { User as UserIcon, Share2, Package as PackageIcon, Check, AlertCircle } from 'lucide-react';

const RegistrationScreen: React.FC = () => {
  const { firebaseUser } = useAuth();
  const [name, setName] = useState(firebaseUser?.displayName || '');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // 1. Validate referral code if provided
      if (referralCode) {
        const recruiter = await firestoreService.getUserByReferralCode(referralCode);
        if (!recruiter) {
          setError('Invalid referral code. Leave it blank if you don\'t have one.');
          setLoading(false);
          return;
        }
      }

      const uid = firebaseUser?.uid || '';
      const email = firebaseUser?.email || '';
      const phone = firebaseUser?.phoneNumber || '';
      const myReferralCode = Math.floor(100000 + Math.random() * 900000).toString();

      const newUser: User = {
        uid,
        name,
        email,
        phone,
        referralCode: myReferralCode,
        referredBy: referralCode || '',
        packageAmount: 0, // Default to 0, user can pick a plan later
        packageActive: false,
        walletBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        teamSize: 0,
        directReferrals: 0,
        level: 'none',
        dailyRecruitCount: 0,
        dailyRecruitDate: new Date().toISOString(),
        joinedAt: new Date().toISOString(),
        isBlocked: false,
        milestonesReached: [],
        role: 'user',
      };

      await firestoreService.createUser(newUser);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
            <UserIcon size={40} className="text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-primary">Complete Profile</h2>
          <p className="text-gray-500 mt-2">Just a few more details to get started</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-bg-light rounded-2xl border-none focus:ring-2 focus:ring-primary font-medium"
                required
              />
            </div>
            
            <div className="relative">
              <Share2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Referral Code (Optional)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="w-full h-14 pl-12 pr-4 bg-bg-light rounded-2xl border-none focus:ring-2 focus:ring-primary font-medium"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-2xl text-sm font-medium">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              'Start Earning'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default RegistrationScreen;
