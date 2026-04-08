import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { TreePine } from 'lucide-react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-accent flex flex-col items-center justify-center z-[100]">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="bg-primary p-6 rounded-full shadow-xl mb-4">
          <TreePine size={80} className="text-accent" />
        </div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-primary tracking-tight"
        >
          EarnTree
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-primary/60 font-medium mt-2"
        >
          Grow Your Wealth Together
        </motion.p>
      </motion.div>
      
      <motion.div 
        className="absolute bottom-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </motion.div>
    </div>
  );
};

export default SplashScreen;
