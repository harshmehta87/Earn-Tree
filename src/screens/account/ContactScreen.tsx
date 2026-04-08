import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneCall, Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

const ContactScreen: React.FC = () => {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setSubmitted(true);
      setMessage('');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </motion.div>
        <h2 className="text-2xl font-bold text-primary mb-2">Message Sent!</h2>
        <p className="text-gray-500 mb-8">We've received your message and will get back to you shortly.</p>
        <button onClick={() => setSubmitted(false)} className="w-full h-14 bg-primary text-white font-bold rounded-2xl">Send Another</button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">Contact Us</h1>
        <p className="text-gray-500">We're here to help you grow</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <a href="tel:+918059845755" className="bg-bg-light p-6 rounded-3xl flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center">
            <PhoneCall size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Call Us</p>
            <p className="font-bold text-primary">+91 80598 45755</p>
          </div>
        </a>

        <a href="mailto:harshmehta12317@gmail.com" className="bg-bg-light p-6 rounded-3xl flex items-center space-x-4">
          <div className="w-12 h-12 bg-accent text-primary rounded-2xl flex items-center justify-center">
            <Mail size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Email Us</p>
            <p className="font-bold text-primary">harshmehta12317@gmail.com</p>
          </div>
        </a>
      </div>

      <div className="bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm space-y-6">
        <div className="flex items-center space-x-3">
          <MessageSquare className="text-primary" size={24} />
          <h2 className="text-xl font-bold text-primary">Send a Message</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <textarea
            placeholder="How can we help you today?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-40 p-4 bg-bg-light rounded-2xl border-none focus:ring-2 focus:ring-primary resize-none"
            required
          />
          
          <button
            type="submit"
            className="w-full h-14 bg-primary text-white font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-primary/20"
          >
            <span>Send Message</span>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactScreen;
