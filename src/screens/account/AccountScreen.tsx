import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { motion } from 'framer-motion';
import { 
  User, 
  Wallet, 
  Trophy, 
  History, 
  HelpCircle, 
  PhoneCall, 
  LogOut, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const AccountScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const MenuItem = ({ icon: Icon, label, onClick, color = "text-primary" }: { icon: any, label: string, onClick: () => void, color?: string }) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 bg-white border-b border-gray-50 active:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-xl bg-bg-light flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        <span className="font-bold text-primary">{label}</span>
      </div>
      <ChevronRight size={18} className="text-gray-300" />
    </button>
  );

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Profile Header */}
      <div className="bg-primary p-8 pt-12 rounded-b-[40px] text-white text-center space-y-4">
        <div className="w-24 h-24 bg-accent rounded-full mx-auto flex items-center justify-center border-4 border-white/10">
          <span className="text-3xl font-black text-primary">
            {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </span>
        </div>
        <div>
          <h2 className="text-2xl font-bold">{user?.name}</h2>
          <p className="text-white/60 font-medium">{user?.email}</p>
        </div>
        <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
          <Trophy size={16} className="text-accent" />
          <span className="text-sm font-bold uppercase tracking-widest">{user?.level || 'No Level'}</span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-6">
        <div className="bg-white rounded-[32px] overflow-hidden shadow-sm">
          <MenuItem icon={User} label="Account Details" onClick={() => navigate('/account/details')} />
          <MenuItem icon={Wallet} label="Withdraw Amount" onClick={() => navigate('/account/withdraw')} color="text-green-600" />
          <MenuItem icon={ShieldCheck} label="My Level" onClick={() => navigate('/account/level')} color="text-blue-600" />
          <MenuItem icon={History} label="Transaction History" onClick={() => navigate('/account/transactions')} />
          <MenuItem icon={HelpCircle} label="Help & Support" onClick={() => navigate('/account/help')} />
          <MenuItem icon={PhoneCall} label="Contact Us" onClick={() => navigate('/account/contact')} />
          <MenuItem icon={LogOut} label="Logout" onClick={handleLogout} color="text-red-600" />
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 pb-8">
        EarnTree Version 1.0.0
      </p>
    </div>
  );
};

export default AccountScreen;
