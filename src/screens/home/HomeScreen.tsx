import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { Transaction, AdminSettings } from '../../types';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Users, UserPlus, Bell, ChevronRight, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);

  useEffect(() => {
    if (user) {
      const unsubscribeTxns = firestoreService.getRecentTransactions(user.uid, setTransactions);
      const unsubscribeSettings = firestoreService.getAdminSettings(setAdminSettings);
      return () => {
        unsubscribeTxns();
        unsubscribeSettings();
      };
    }
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
    <div className="bg-bg-light p-4 rounded-3xl flex flex-col space-y-2">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-xs text-gray-500 font-medium">{title}</p>
      <p className="text-lg font-bold text-primary">{value}</p>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 font-medium">{getGreeting()},</p>
          <h1 className="text-2xl font-bold text-primary">{user?.name}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            user?.level === 'none' ? 'bg-gray-100 text-gray-400' : 
            user?.level === 'silver' ? 'bg-gray-200 text-gray-600' :
            user?.level === 'gold' ? 'bg-accent/20 text-accent' : 'bg-primary text-white'
          }`}>
            {user?.level === 'none' ? 'No Level' : user?.level}
          </div>
          <button className="w-10 h-10 bg-bg-light rounded-full flex items-center justify-center text-primary relative">
            <Bell size={20} />
            {adminSettings?.announcement && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />}
          </button>
        </div>
      </div>

      {/* Announcement */}
      {adminSettings?.announcement && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent/10 border border-accent/20 p-4 rounded-2xl flex items-start space-x-3"
        >
          <Bell className="text-accent shrink-0" size={18} />
          <p className="text-sm text-primary font-medium">{adminSettings.announcement}</p>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Wallet Balance" value={`₹${user?.walletBalance.toLocaleString('en-IN')}`} icon={Wallet} color="bg-blue-600" />
        <StatCard title="Total Earned" value={`₹${user?.totalEarned.toLocaleString('en-IN')}`} icon={TrendingUp} color="bg-green-600" />
        <StatCard title="Team Size" value={user?.teamSize || 0} icon={Users} color="bg-purple-600" />
        <StatCard title="Direct Referrals" value={user?.directReferrals || 0} icon={UserPlus} color="bg-orange-600" />
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">Recent Transactions</h2>
          <Link to="/account/transactions" className="text-sm text-accent font-bold flex items-center">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions.slice(0, 5).map((txn) => (
              <div key={txn.txnId} className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    txn.type === 'withdrawal' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {txn.type === 'withdrawal' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary capitalize">{txn.type.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-400">{new Date(txn.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={`font-bold ${
                  txn.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {txn.type === 'withdrawal' ? '-' : '+'}₹{txn.amount.toLocaleString('en-IN')}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-bg-light rounded-3xl">
              <p className="text-gray-400 text-sm">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
