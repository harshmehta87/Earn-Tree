import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Users, Wallet, Package, Settings, LayoutDashboard, ChevronRight, Search, Check, X, AlertCircle, ShieldCheck } from 'lucide-react';
import { firestoreService } from '../../services/firestoreService';
import { User, WithdrawalRequest, AdminSettings } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { doc, updateDoc, increment, Timestamp, setDoc, getDoc } from 'firebase/firestore';
import { referralService } from '../../services/referralService';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Initialize settings if they don't exist
      try {
        const settingsRef = doc(db, 'adminSettings', 'global');
        const settingsSnap = await getDoc(settingsRef);
        if (!settingsSnap.exists()) {
          await setDoc(settingsRef, {
            totalUsers: 0,
            totalMoneyDistributed: 0,
            appVersion: "1.0.0",
            maintenanceMode: false,
            announcement: "Welcome to EarnTree! Start referring and grow your wealth."
          });
        }
      } catch (err) {
        console.error('Failed to initialize admin settings:', err);
      }

      const allUsers = await firestoreService.getAllUsers();
      const allWithdrawals = await firestoreService.getAllWithdrawalRequests();
      setUsers(allUsers);
      setWithdrawals(allWithdrawals);
      setLoading(false);
    };
    
    fetchData();
    const unsubscribeSettings = firestoreService.getAdminSettings(setSettings);
    return () => unsubscribeSettings();
  }, []);

  const handleActivateUser = async (user: User) => {
    try {
      await updateDoc(doc(db, 'users', user.uid), { packageActive: true });
      // Process referral bonus for recruiter
      if (user.referredBy) {
        const recruiter = users.find(u => u.referralCode === user.referredBy);
        if (recruiter) {
          await referralService.processReferral(recruiter.uid, user.uid);
        }
      }
      // Refresh users
      const allUsers = await firestoreService.getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveWithdrawal = async (req: WithdrawalRequest) => {
    try {
      await updateDoc(doc(db, 'withdrawalRequests', req.requestId), {
        status: 'approved',
        processedAt: new Date().toISOString()
      });
      
      await updateDoc(doc(db, 'users', req.userId), {
        totalWithdrawn: increment(req.amount)
      });

      const txnId = `txn_wd_appr_${Date.now()}`;
      await setDoc(doc(db, 'transactions', txnId), {
        txnId,
        userId: req.userId,
        type: 'withdrawal',
        amount: req.amount,
        status: 'completed',
        description: 'Withdrawal approved and processed',
        createdAt: new Date().toISOString()
      });

      // Refresh data
      const allWithdrawals = await firestoreService.getAllWithdrawalRequests();
      setWithdrawals(allWithdrawals);
    } catch (err) {
      console.error(err);
    }
  };

  const StatsHeader = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <p className="text-xs text-gray-500 font-medium">Total Users</p>
        <p className="text-xl font-black text-primary">{users.length}</p>
      </div>
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <p className="text-xs text-gray-500 font-medium">Active Packages</p>
        <p className="text-xl font-black text-green-600">{users.filter(u => u.packageActive).length}</p>
      </div>
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <p className="text-xs text-gray-500 font-medium">Pending Withdrawals</p>
        <p className="text-xl font-black text-orange-600">{withdrawals.filter(w => w.status === 'pending').length}</p>
      </div>
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <p className="text-xs text-gray-500 font-medium">Total Distributed</p>
        <p className="text-xl font-black text-blue-600">₹{settings?.totalMoneyDistributed.toLocaleString('en-IN') || 0}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-light p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
        <div className="flex items-center space-x-2">
          {settings?.maintenanceMode && <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Maintenance</div>}
          <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      <StatsHeader />

      <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'users', label: 'Users', icon: Users },
          { id: 'withdrawals', label: 'Withdrawals', icon: Wallet },
          { id: 'packages', label: 'Packages', icon: Package },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map(tab => (
          <Link
            key={tab.id}
            to={`/admin/${tab.id}`}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${
              window.location.pathname.includes(tab.id) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-500'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>

      <Routes>
        <Route path="/" element={<Navigate to="users" replace />} />
        <Route path="users" element={<AdminUsers users={users} onActivate={handleActivateUser} />} />
        <Route path="withdrawals" element={<AdminWithdrawals withdrawals={withdrawals} onApprove={handleApproveWithdrawal} />} />
        <Route path="packages" element={<AdminPackages users={users} />} />
        <Route path="settings" element={<AdminSettingsScreen settings={settings} />} />
      </Routes>
    </div>
  );
};

const AdminUsers = ({ users, onActivate }: { users: User[], onActivate: (u: User) => void }) => {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search));

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search users by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-14 pl-12 pr-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-3">
        {filtered.map(user => (
          <div key={user.uid} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-bg-light rounded-2xl flex items-center justify-center font-bold text-primary">
                {user.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-primary">{user.name}</p>
                <p className="text-xs text-gray-500">{user.phone} • {user.packageAmount}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!user.packageActive && (
                <button 
                  onClick={() => onActivate(user)}
                  className="bg-accent text-primary px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Activate
                </button>
              )}
              <div className={`w-2 h-2 rounded-full ${user.packageActive ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminWithdrawals = ({ withdrawals, onApprove }: { withdrawals: WithdrawalRequest[], onApprove: (r: WithdrawalRequest) => void }) => {
  const pending = withdrawals.filter(w => w.status === 'pending');
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-primary">Pending Requests ({pending.length})</h2>
      {pending.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
          <p className="text-gray-400">No pending withdrawals</p>
        </div>
      ) : (
        pending.map(req => (
          <div key={req.requestId} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-primary text-lg">{req.userName}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{req.method}</p>
              </div>
              <p className="text-2xl font-black text-primary">₹{req.amount.toLocaleString('en-IN')}</p>
            </div>
            
            <div className="bg-bg-light p-4 rounded-2xl text-xs font-mono">
              <p>A/C: {req.accountDetails.accountNumber}</p>
              <p>IFSC: {req.accountDetails.ifsc}</p>
              <p>Name: {req.accountDetails.holderName}</p>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => onApprove(req)}
                className="flex-1 h-12 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center space-x-2"
              >
                <Check size={18} />
                <span>Approve</span>
              </button>
              <button className="flex-1 h-12 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center space-x-2">
                <X size={18} />
                <span>Reject</span>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const AdminPackages = ({ users }: { users: User[] }) => {
  const counts = users.reduce((acc: any, u) => {
    acc[u.packageAmount] = (acc[u.packageAmount] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-primary">Package Distribution</h2>
      <div className="grid grid-cols-1 gap-4">
        {Object.entries(counts).map(([amt, count]: any) => (
          <div key={amt} className="bg-white p-6 rounded-3xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-primary">₹{parseInt(amt).toLocaleString('en-IN')}</p>
              <p className="text-sm text-gray-500">{count} Active Users</p>
            </div>
            <div className="w-12 h-12 bg-bg-light rounded-2xl flex items-center justify-center font-black text-primary">
              {count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminSettingsScreen = ({ settings }: { settings: AdminSettings | null }) => {
  const [announcement, setAnnouncement] = useState(settings?.announcement || '');

  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, 'adminSettings', 'global'), { announcement });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[32px] shadow-sm space-y-4">
        <h3 className="font-bold text-primary">Global Announcement</h3>
        <textarea
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          className="w-full h-32 p-4 bg-bg-light rounded-2xl border-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Enter announcement text..."
        />
        <button 
          onClick={handleUpdate}
          className="w-full h-12 bg-primary text-white rounded-xl font-bold"
        >
          Update Announcement
        </button>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm space-y-4">
        <h3 className="font-bold text-primary">System Controls</h3>
        <div className="flex items-center justify-between p-4 bg-bg-light rounded-2xl">
          <div>
            <p className="font-bold text-sm">Maintenance Mode</p>
            <p className="text-xs text-gray-500">Disable app for all users</p>
          </div>
          <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings?.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}>
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings?.maintenanceMode ? 'translate-x-6' : ''}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
