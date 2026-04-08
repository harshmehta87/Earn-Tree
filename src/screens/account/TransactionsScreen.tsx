import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { Transaction } from '../../types';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Filter, Search, Calendar } from 'lucide-react';

const TransactionsScreen: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) {
      const unsubscribe = firestoreService.getRecentTransactions(user.uid, setTransactions);
      return () => unsubscribe();
    }
  }, [user]);

  const filteredTxns = transactions.filter(txn => {
    const matchesFilter = filter === 'all' || txn.type === filter;
    const matchesSearch = txn.description.toLowerCase().includes(search.toLowerCase()) || txn.type.includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'withdrawal': return { icon: ArrowUpRight, color: 'bg-red-50 text-red-600' };
      case 'referral_bonus': return { icon: ArrowDownLeft, color: 'bg-green-50 text-green-600' };
      case 'daily_bonus': return { icon: ArrowDownLeft, color: 'bg-blue-50 text-blue-600' };
      case 'level_salary': return { icon: ArrowDownLeft, color: 'bg-purple-50 text-purple-600' };
      default: return { icon: ArrowDownLeft, color: 'bg-gray-50 text-gray-600' };
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Transactions</h1>
        <div className="w-10 h-10 bg-bg-light rounded-full flex items-center justify-center text-primary">
          <Calendar size={20} />
        </div>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-bg-light rounded-2xl border-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
          {['all', 'referral_bonus', 'daily_bonus', 'level_salary', 'withdrawal'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filter === f ? 'bg-primary text-white' : 'bg-bg-light text-gray-500'
              }`}
            >
              {f.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredTxns.length > 0 ? (
          filteredTxns.map((txn, index) => {
            const { icon: Icon, color } = getIcon(txn.type);
            return (
              <motion.div
                key={txn.txnId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary capitalize">{txn.type.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-400">{new Date(txn.createdAt).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{txn.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black ${
                    txn.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {txn.type === 'withdrawal' ? '-' : '+'}₹{txn.amount.toLocaleString('en-IN')}
                  </p>
                  <p className={`text-[8px] font-bold uppercase tracking-widest ${
                    txn.status === 'completed' ? 'text-green-500' : 'text-orange-500'
                  }`}>
                    {txn.status}
                  </p>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-bg-light rounded-[40px]">
            <p className="text-gray-400 font-medium">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsScreen;
