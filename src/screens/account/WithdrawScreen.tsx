import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { WithdrawalMethod, WithdrawalRequest, TransactionStatus } from '../../types';
import { MIN_WITHDRAWAL } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Landmark, QrCode, ArrowRight, CheckCircle2, AlertCircle, Clock, History } from 'lucide-react';
import { db } from '../../firebase';
import { doc, setDoc, increment, updateDoc } from 'firebase/firestore';

const WithdrawScreen: React.FC = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<WithdrawalMethod>('bank');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);

  // Bank details
  const [accountNumber, setAccountNumber] = useState(user?.withdrawalMethod?.bank?.accountNumber || '');
  const [ifsc, setIfsc] = useState(user?.withdrawalMethod?.bank?.ifsc || '');
  const [holderName, setHolderName] = useState(user?.withdrawalMethod?.bank?.holderName || '');

  useEffect(() => {
    const fetchRequests = async () => {
      const all = await firestoreService.getAllWithdrawalRequests();
      setRequests(all.filter(r => r.userId === user?.uid).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()));
    };
    fetchRequests();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount < MIN_WITHDRAWAL) {
      setError(`Minimum withdrawal is ₹${MIN_WITHDRAWAL}`);
      return;
    }
    
    if (numAmount > (user?.walletBalance || 0)) {
      setError('Insufficient balance');
      return;
    }

    if (!accountNumber || !ifsc || !holderName) {
      setError('Please fill all bank details');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const requestId = `wd_${Date.now()}_${user?.uid}`;
      const accountDetails = { accountNumber, ifsc, holderName };
      
      const request: WithdrawalRequest = {
        requestId,
        userId: user!.uid,
        userName: user!.name,
        amount: numAmount,
        method: 'bank',
        accountDetails,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      };

      // 1. Create request
      await firestoreService.createWithdrawalRequest(request);
      
      // 2. Deduct from wallet
      await updateDoc(doc(db, 'users', user!.uid), {
        walletBalance: increment(-numAmount),
        withdrawalMethod: {
          bank: { accountNumber, ifsc, holderName }
        }
      });

      // 3. Create pending transaction
      const txnId = `txn_wd_${Date.now()}`;
      await setDoc(doc(db, 'transactions', txnId), {
        txnId,
        userId: user!.uid,
        type: 'withdrawal',
        amount: numAmount,
        status: 'pending',
        description: `Withdrawal request via Bank Transfer`,
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      setAmount('');
    } catch (err: any) {
      console.error(err);
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </motion.div>
        <h2 className="text-2xl font-bold text-primary mb-2">Request Submitted!</h2>
        <p className="text-gray-500 mb-8">Your withdrawal request is being processed. It usually takes 24-48 hours.</p>
        <button onClick={() => setSuccess(false)} className="w-full h-14 bg-primary text-white font-bold rounded-2xl">Done</button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="bg-primary p-8 rounded-[40px] text-white space-y-4">
        <p className="text-white/60 font-medium">Available Balance</p>
        <h2 className="text-4xl font-black text-accent">₹{user?.walletBalance.toLocaleString('en-IN')}</h2>
        <div className="flex items-center space-x-2 text-xs text-white/40">
          <AlertCircle size={14} />
          <span>Minimum withdrawal: ₹{MIN_WITHDRAWAL}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-primary">Enter Amount</h3>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-primary">₹</span>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-16 pl-10 pr-4 bg-bg-light rounded-2xl border-none focus:ring-2 focus:ring-primary text-2xl font-black text-primary"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-primary flex items-center space-x-2">
            <Landmark size={18} />
            <span>Bank Details</span>
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full h-14 px-4 bg-bg-light rounded-2xl border-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="IFSC Code"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              className="w-full h-14 px-4 bg-bg-light rounded-2xl border-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Account Holder Name"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              className="w-full h-14 px-4 bg-bg-light rounded-2xl border-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm font-medium text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-accent text-primary font-bold rounded-2xl shadow-lg shadow-accent/20 flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /> : <><span>Submit Request</span><ArrowRight size={20} /></>}
        </button>
      </form>

      {/* History */}
      <div className="space-y-4">
        <h3 className="font-bold text-primary flex items-center space-x-2">
          <History size={18} />
          <span>Past Requests</span>
        </h3>
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.requestId} className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm font-bold text-primary">₹{req.amount.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{req.method} • {new Date(req.requestedAt).toLocaleDateString()}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center space-x-1 ${
                req.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                req.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {req.status === 'pending' ? <Clock size={10} /> : req.status === 'approved' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                <span>{req.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WithdrawScreen;
