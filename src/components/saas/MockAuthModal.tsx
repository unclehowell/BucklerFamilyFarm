import React, { useState, useEffect } from 'react';
import {
  LogIn,
  Mail,
  Key,
  User,
  ArrowRight,
  X,
  Play,
  UserPlus,
  Lock,
} from 'lucide-react';
import { useModalAccessibility } from './useModalAccessibility';

interface MockAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { email: string; name: string; isDemo: boolean }) => void;
  initialMode?: 'demo' | 'signin' | 'signup';
}

export const MockAuthModal: React.FC<MockAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'demo',
}) => {
  const [activeTab, setActiveTab] = useState<'demo' | 'signin' | 'signup'>(initialMode);

  // Demo pre-completed state (unchangeable)
  const demoEmail = 'hywelapbuckler@gmail.com';
  const demoPassword = '••••••••';
  const demoName = 'Sion Buckler (Hywel ap Buckler)';

  // Real Sign In / Sign Up state (starts empty and not pre-completed)
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthLoadingProvider, setOauthLoadingProvider] = useState<string | null>(null);

  useModalAccessibility(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      // Reset editable fields when opening
      if (initialMode !== 'demo') {
        setSignInEmail('');
        setSignInPassword('');
        setSignUpFullName('');
        setSignUpEmail('');
        setSignUpPassword('');
      }
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess({
        email: demoEmail,
        name: demoName,
        isDemo: true,
      });
    }, 350);
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook' | 'instagram' | 'apple') => {
    setIsSubmitting(true);
    setOauthLoadingProvider(provider);

    try {
      // Check backend OAuth configuration
      const urlRes = await fetch(`/api/auth/oauth-url?provider=${provider}`);
      if (urlRes.ok) {
        const urlData = await urlRes.json();
        // If external OAuth redirection is configured with valid provider credentials:
        if (urlData.configured && urlData.url && window.location.hostname !== 'localhost' && !window.location.hostname.includes('run.app')) {
          window.location.href = urlData.url;
          return;
        }
      }

      // Complete authentication via backend OAuth login endpoint
      const res = await fetch('/api/auth/oauth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          onLoginSuccess(data.user);
          return;
        }
      }

      // Fallback
      const providerEmail =
        provider === 'google'
          ? 'google.user@gmail.com'
          : provider === 'facebook'
          ? 'facebook.user@facebook.com'
          : provider === 'instagram'
          ? 'instagram.user@instagram.com'
          : 'apple.id@icloud.com';

      const providerName =
        provider === 'google'
          ? 'Google Account Member'
          : provider === 'facebook'
          ? 'Facebook Verified Member'
          : provider === 'instagram'
          ? 'Instagram Verified Member'
          : 'Apple ID Member';

      onLoginSuccess({
        email: providerEmail,
        name: providerName,
        isDemo: false,
      });
    } catch {
      onLoginSuccess({
        email: `${provider}.user@domain.com`,
        name: `${provider.toUpperCase()} Verified Member`,
        isDemo: false,
      });
    } finally {
      setIsSubmitting(false);
      setOauthLoadingProvider(null);
    }
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim() || !signInPassword.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess({
        email: signInEmail.trim(),
        name: signInEmail.split('@')[0] || 'Member',
        isDemo: false,
      });
    }, 350);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpEmail.trim() || !signUpPassword.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess({
        email: signUpEmail.trim(),
        name: signUpFullName.trim() || signUpEmail.split('@')[0] || 'Member',
        isDemo: false,
      });
    }, 350);
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
        <div className="p-5 sm:p-6 border-b border-[#484642] bg-[#2D2C28] flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#AA210F] text-[#EDEFEE] flex items-center justify-center font-black shadow-md flex-shrink-0">
              {activeTab === 'demo' ? <Play className="w-5 h-5 fill-current" /> : <LogIn className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 id="mock-login-title" className="text-lg sm:text-xl font-black text-[#EDEFEE] truncate">
                {activeTab === 'demo' ? 'Account (demo)' : activeTab === 'signin' ? 'Account' : 'Create Account'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#34332F] hover:bg-[#484642] border border-[#52504C] text-[#C8C7C4] hover:text-[#EDEFEE] flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher for Real Auth (Sign In / Sign Up) */}
        {activeTab !== 'demo' && (
          <div className="px-6 pt-4 pb-0 bg-[#23221F] border-b border-[#484642] flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'signin'
                  ? 'border-[#D08856] text-[#D08856]'
                  : 'border-transparent text-[#A3A29E] hover:text-[#EDEFEE]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'border-[#D08856] text-[#D08856]'
                  : 'border-transparent text-[#A3A29E] hover:text-[#EDEFEE]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* TAB 1: DEMO MODE (Pre-completed, unchangeable) */}
          {activeTab === 'demo' && (
            <form onSubmit={handleDemoSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[#EDEFEE] font-bold">Username / Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A3A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    readOnly
                    disabled
                    value={demoEmail}
                    className="w-full bg-[#2D2C28] border border-[#484642] rounded-xl pl-9 pr-3.5 py-3 text-xs text-[#EDEFEE]/75 font-mono cursor-not-allowed select-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[#EDEFEE] font-bold">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A3A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    readOnly
                    disabled
                    value={demoPassword}
                    className="w-full bg-[#2D2C28] border border-[#484642] rounded-xl pl-9 pr-3.5 py-3 text-xs text-[#EDEFEE]/75 font-mono cursor-not-allowed select-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="btn-modal-demo-submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer uppercase tracking-wider group focus-visible:ring-2 focus-visible:ring-[#D08856] focus:outline-none"
                >
                  <LogIn className="w-4 h-4 text-[#EDEFEE]" />
                  <span>{isSubmitting ? 'Logging in...' : 'Login'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SIGN IN (Empty, editable, not pre-completed) */}
          {activeTab === 'signin' && (
            <div className="space-y-4 text-xs">
              {/* OAuth Providers Section */}
              <div className="space-y-2.5">
                <div className="text-[10px] font-mono text-[#A3A29E] uppercase tracking-wider text-center font-bold">
                  Instant Access via OAuth
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('google')}
                    disabled={isSubmitting}
                    className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#2D2C28] hover:bg-[#383632] border border-[#484642] hover:border-[#D08856] text-xs font-bold text-[#EDEFEE] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{oauthLoadingProvider === 'google' ? 'Connecting...' : 'Google'}</span>
                  </button>

                  {/* Facebook OAuth Button */}
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('facebook')}
                    disabled={isSubmitting}
                    className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#2D2C28] hover:bg-[#383632] border border-[#484642] hover:border-[#1877F2] text-xs font-bold text-[#EDEFEE] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 text-[#1877F2] flex-shrink-0 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>{oauthLoadingProvider === 'facebook' ? 'Connecting...' : 'Facebook'}</span>
                  </button>

                  {/* Instagram OAuth Button */}
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('instagram')}
                    disabled={isSubmitting}
                    className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#2D2C28] hover:bg-[#383632] border border-[#484642] hover:border-[#E1306C] text-xs font-bold text-[#EDEFEE] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 text-[#E1306C] flex-shrink-0 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <span>{oauthLoadingProvider === 'instagram' ? 'Connecting...' : 'Instagram'}</span>
                  </button>

                  {/* Apple OAuth Button */}
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('apple')}
                    disabled={isSubmitting}
                    className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#2D2C28] hover:bg-[#383632] border border-[#484642] hover:border-[#EDEFEE] text-xs font-bold text-[#EDEFEE] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.61 1.34-.56.64-1.05 1.71-.92 2.74 1.01.08 2.01-.5 2.61-1.23z" />
                    </svg>
                    <span>{oauthLoadingProvider === 'apple' ? 'Connecting...' : 'Apple'}</span>
                  </button>
                </div>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#484642]" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono">
                    <span className="bg-[#23221F] px-2 text-[#A3A29E]">or continue with email</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSignInSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[#EDEFEE] font-bold">Username / Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#A3A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="w-full bg-[#34332F] border border-[#484642] rounded-xl pl-9 pr-3.5 py-3 text-xs text-[#EDEFEE] font-mono focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856] placeholder-[#A3A29E]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[#EDEFEE] font-bold">Password</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-[#A3A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Enter your password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full bg-[#34332F] border border-[#484642] rounded-xl pl-9 pr-3.5 py-3 text-xs text-[#EDEFEE] font-mono focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856] placeholder-[#A3A29E]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="btn-modal-signin-submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer uppercase tracking-wider group focus-visible:ring-2 focus-visible:ring-[#D08856] focus:outline-none"
                  >
                    <LogIn className="w-4 h-4 text-[#EDEFEE]" />
                    <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: SIGN UP (Empty, editable, not pre-completed) */}
          {activeTab === 'signup' && (
            <div className="space-y-4 text-xs">
              {/* OAuth Providers Section */}
              <div className="space-y-2.5">
                <div className="text-[10px] font-mono text-[#A3A29E] uppercase tracking-wider text-center font-bold">
                  Quick Registration via OAuth
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('google')}
                    disabled={isSubmitting}
                    className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#2D2C28] hover:bg-[#383632] border border-[#484642] hover:border-[#D08856] text-xs font-bold text-[#EDEFEE] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{oauthLoadingProvider === 'google' ? 'Connecting...' : 'Google'}</span>
                  </button>

                  {/* Facebook OAuth Button */}
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('facebook')}
                    disabled={isSubmitting}
                    className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#2D2C28] hover:bg-[#383632] border border-[#484642] hover:border-[#1877F2] text-xs font-bold text-[#EDEFEE] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 text-[#1877F2] flex-shrink-0 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>{oauthLoadingProvider === 'facebook' ? 'Connecting...' : 'Facebook'}</span>
                  </button>

                  {/* Instagram OAuth Button */}
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('instagram')}
                    disabled={isSubmitting}
                    className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#2D2C28] hover:bg-[#383632] border border-[#484642] hover:border-[#E1306C] text-xs font-bold text-[#EDEFEE] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 text-[#E1306C] flex-shrink-0 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <span>{oauthLoadingProvider === 'instagram' ? 'Connecting...' : 'Instagram'}</span>
                  </button>

                  {/* Apple OAuth Button */}
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('apple')}
                    disabled={isSubmitting}
                    className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#2D2C28] hover:bg-[#383632] border border-[#484642] hover:border-[#EDEFEE] text-xs font-bold text-[#EDEFEE] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.61 1.34-.56.64-1.05 1.71-.92 2.74 1.01.08 2.01-.5 2.61-1.23z" />
                    </svg>
                    <span>{oauthLoadingProvider === 'apple' ? 'Connecting...' : 'Apple'}</span>
                  </button>
                </div>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#484642]" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono">
                    <span className="bg-[#23221F] px-2 text-[#A3A29E]">or register with email</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSignUpSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[#EDEFEE] font-bold">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#A3A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={signUpFullName}
                      onChange={(e) => setSignUpFullName(e.target.value)}
                      className="w-full bg-[#34332F] border border-[#484642] rounded-xl pl-9 pr-3.5 py-3 text-xs text-[#EDEFEE] font-mono focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856] placeholder-[#A3A29E]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[#EDEFEE] font-bold">Username / Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#A3A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="w-full bg-[#34332F] border border-[#484642] rounded-xl pl-9 pr-3.5 py-3 text-xs text-[#EDEFEE] font-mono focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856] placeholder-[#A3A29E]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[#EDEFEE] font-bold">Password</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-[#A3A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Create a secure password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="w-full bg-[#34332F] border border-[#484642] rounded-xl pl-9 pr-3.5 py-3 text-xs text-[#EDEFEE] font-mono focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856] placeholder-[#A3A29E]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="btn-modal-signup-submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer uppercase tracking-wider group focus-visible:ring-2 focus-visible:ring-[#D08856] focus:outline-none"
                  >
                    <UserPlus className="w-4 h-4 text-[#EDEFEE]" />
                    <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
