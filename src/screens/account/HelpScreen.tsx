import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle } from 'lucide-react';

const HelpScreen: React.FC = () => {
  const faqs = [
    {
      q: "How do I earn money?",
      a: "You earn money by referring new members to EarnTree using your unique referral code. You also get daily recruitment bonuses, monthly milestones, and a daily salary based on your team size level."
    },
    {
      q: "When does my referral bonus credit?",
      a: "Referral bonuses are credited instantly as soon as your recruit's account is activated by the admin."
    },
    {
      q: "What is the minimum withdrawal?",
      a: "The minimum withdrawal amount is ₹200. You can request a withdrawal to your Bank Account."
    },
    {
      q: "How many days does withdrawal take?",
      a: "Withdrawals are typically processed within 24-48 hours. You can track the status in your Transaction History."
    },
    {
      q: "Can I change my package?",
      a: "Yes, you can upgrade to a higher package at any time to increase your referral bonus tier. Contact support for assistance with upgrades."
    },
    {
      q: "What happens if my referral doesn't pay?",
      a: "Your account will only receive a bonus once the referral's account is activated. If they don't pay, their account remains inactive and no bonus is generated."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="p-6 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-accent text-primary rounded-2xl mx-auto flex items-center justify-center mb-4">
          <HelpCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-primary">Help & Support</h1>
        <p className="text-gray-500">Find answers to common questions</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full p-5 flex items-center justify-between text-left"
            >
              <span className="font-bold text-primary pr-4">{faq.q}</span>
              {openIndex === index ? <ChevronUp size={20} className="text-accent shrink-0" /> : <ChevronDown size={20} className="text-gray-300 shrink-0" />}
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-5 pb-5"
                >
                  <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="bg-primary p-6 rounded-[32px] text-white flex items-center justify-between">
        <div className="space-y-1">
          <p className="font-bold">Still have questions?</p>
          <p className="text-xs text-white/60">Our team is here to help you 24/7</p>
        </div>
        <button className="bg-accent text-primary p-3 rounded-2xl">
          <MessageCircle size={24} />
        </button>
      </div>
    </div>
  );
};

export default HelpScreen;
