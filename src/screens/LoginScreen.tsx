import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import { TreePine, LogIn, ArrowRight } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoTaps, setLogoTaps] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (logoTaps >= 5) {
      navigate('/admin/login');
    }
  }, [logoTaps, navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled in Firebase Console.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div 
          onClick={() => setLogoTaps(prev => prev + 1)}
          className="bg-primary p-5 rounded-3xl shadow-lg mb-6 cursor-pointer"
          whileTap={{ scale: 0.95 }}
        >
          <TreePine size={60} className="text-accent" />
        </motion.div>
        
        <h1 className="text-3xl font-bold text-primary mb-2">EarnTree</h1>
        <p className="text-gray-500 mb-10 text-center">Grow your wealth through our referral network</p>

        <div className="w-full space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-14 bg-white border-2 border-gray-100 text-primary font-bold rounded-2xl shadow-sm flex items-center justify-center space-x-3 disabled:opacity-50 active:scale-[0.98] transition-all"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebase/explore/google.svg" alt="Google" className="w-6 h-6" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <span className="relative px-4 bg-white text-xs text-gray-400 font-medium uppercase tracking-widest">Secure Access</span>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-gray-400 text-center mt-auto">
        By continuing, you agree to EarnTree's Terms of Service and Privacy Policy
      </p>
    </div>
  );
};

export default LoginScreen;
