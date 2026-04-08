import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { firestoreService } from '../../services/firestoreService';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

const AdminLoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await firestoreService.getUser(userCredential.user.uid);
      
      if (userData?.role === 'admin' || email === 'harshmehta12317@gmail.com') {
        navigate('/admin');
      } else {
        setError('Access denied. You do not have admin privileges.');
        await auth.signOut();
      }
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col p-6 items-center justify-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white rounded-[40px] p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Admin Portal</h1>
          <p className="text-gray-500 text-sm">Sign in to manage EarnTree</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-bg-light rounded-2xl border-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-bg-light rounded-2xl border-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm font-medium">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Login as Admin</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
        
        <button 
          onClick={() => navigate('/login')}
          className="w-full mt-6 text-gray-400 font-medium text-sm"
        >
          Back to User Login
        </button>
      </motion.div>
    </div>
  );
};

export default AdminLoginScreen;
