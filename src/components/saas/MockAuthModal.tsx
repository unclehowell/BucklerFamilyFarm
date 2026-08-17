import React, { useState } from 'react';
import {
  LogIn,
  Mail,
  Key,
  ArrowRight,
} from 'lucide-react';
import { useModalAccessibility } from './useModalAccessibility';

interface MockAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { email: string; name: string; isDemo: boolean }) => void;
  onSwitchToRealRegister?: () => void;
}

export const MockAuthModal: React.FC<MockAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('hywelapbuckler@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useModalAccessibility(isOpen, onClose);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess({
        email: email.trim() || 'hywelapbuckler@gmail.com',
        name: 'Sion Buckler (Hywel ap Buckler)',
        isDemo: true,
      });
    }, 450);
  };

  return (
    <div
      id="mock-login-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mock-login-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex min-h-full items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="mock-login-modal-card"
        className="relative w-full max-w-md my-auto rounded-3xl bg-[#23221F] border-2 border-[#D08856] shadow-2xl text-[#EDEFEE] flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-[#484642] bg-[#2D2C28] flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#AA210F] text-[#EDEFEE] flex items-center justify-center font-black shadow-md flex-shrink-0">
            <LogIn className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 id="mock-login-title" className="text-lg sm:text-xl font-black text-[#EDEFEE] truncate">
              Member Portal Sign In
            </h3>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block text-[#EDEFEE] font-bold">Username / Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A3A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#34332F] border border-[#484642] rounded-xl pl-9 pr-3.5 py-3 text-xs text-[#EDEFEE] font-mono focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[#EDEFEE] font-bold flex items-center justify-between">
                <span>Password</span>
                <span className="text-[10px] font-mono text-[#D08856]">Default: ****</span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#A3A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#34332F] border border-[#484642] rounded-xl pl-9 pr-3.5 py-3 text-xs text-[#EDEFEE] font-mono focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="btn-modal-login-submit"
                disabled={isSubmitting}
                className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer uppercase tracking-wider group focus-visible:ring-2 focus-visible:ring-[#D08856] focus:outline-none"
              >
                <span>{isSubmitting ? 'Logging in to Portal...' : 'Login to Dashboard'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
