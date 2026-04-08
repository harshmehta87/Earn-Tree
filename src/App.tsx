import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Home, Package, Share2, User, LayoutDashboard } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import HomeScreen from './screens/home/HomeScreen';
import PlansScreen from './screens/plans/PlansScreen';
import ReferScreen from './screens/refer/ReferScreen';
import AccountScreen from './screens/account/AccountScreen';
import WithdrawScreen from './screens/account/WithdrawScreen';
import LevelScreen from './screens/account/LevelScreen';
import TransactionsScreen from './screens/account/TransactionsScreen';
import HelpScreen from './screens/account/HelpScreen';
import ContactScreen from './screens/account/ContactScreen';
import AdminLoginScreen from './screens/admin/AdminLoginScreen';
import AdminDashboard from './screens/admin/AdminDashboard';
import { motion, AnimatePresence } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/plans', icon: Package, label: 'Plans' },
    { path: '/refer', icon: Share2, label: 'Refer' },
    { path: '/account', icon: User, label: 'Account' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ path: '/admin', icon: LayoutDashboard, label: 'Admin' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-primary h-16 flex items-center justify-around z-50 border-t border-white/10">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              isActive ? 'text-accent' : 'text-white/60'
            }`}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const showNav = ['/', '/plans', '/refer', '/account', '/admin'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-white pb-20">
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      {showNav && <BottomNav />}
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { firebaseUser, loading, user } = useAuth();
  
  if (loading) return <SplashScreen />;
  if (!firebaseUser) return <Navigate to="/login" />;
  if (!user) return <Navigate to="/register" />;
  if (user.isBlocked) return <div className="flex items-center justify-center h-screen p-6 text-center">Your account has been blocked. Please contact support.</div>;
  
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (user?.role !== 'admin') return <Navigate to="/" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegistrationScreen />} />
            <Route path="/admin/login" element={<AdminLoginScreen />} />
            
            <Route path="/" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
            <Route path="/plans" element={<ProtectedRoute><PlansScreen /></ProtectedRoute>} />
            <Route path="/refer" element={<ProtectedRoute><ReferScreen /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><AccountScreen /></ProtectedRoute>} />
            <Route path="/account/withdraw" element={<ProtectedRoute><WithdrawScreen /></ProtectedRoute>} />
            <Route path="/account/level" element={<ProtectedRoute><LevelScreen /></ProtectedRoute>} />
            <Route path="/account/transactions" element={<ProtectedRoute><TransactionsScreen /></ProtectedRoute>} />
            <Route path="/account/help" element={<ProtectedRoute><HelpScreen /></ProtectedRoute>} />
            <Route path="/account/contact" element={<ProtectedRoute><ContactScreen /></ProtectedRoute>} />
            
            <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
