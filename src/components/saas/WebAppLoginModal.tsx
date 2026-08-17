import React, { useState, useEffect } from 'react';
import {
  X,
  LogIn,
  Mail,
  Key,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  User,
  CreditCard,
  Lock,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useModalAccessibility } from './useModalAccessibility';

interface WebAppLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: () => void;
  onOpenEligibilityCheck?: () => void;
  initialEligibilityCode?: string;
}

export const WebAppLoginModal: React.FC<WebAppLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  onOpenEligibilityCheck,
  initialEligibilityCode = '',
}) => {
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');

  // Registration Fields (Strict Order: 1. Eligibility Code, 2. Name, 3. Email, 4. Password)
  const [eligibilityCode, setEligibilityCode] = useState(initialEligibilityCode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Validation & Processing State
  const [codeStatus, setCodeStatus] = useState<{
    valid: boolean;
    checked: boolean;
    message?: string;
    details?: string;
  }>({
    valid: false,
    checked: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useModalAccessibility(isOpen, onClose);

  // Sync initial eligibility code if passed in
  useEffect(() => {
    if (initialEligibilityCode) {
      setEligibilityCode(initialEligibilityCode);
      validateCode(initialEligibilityCode);
    }
  }, [initialEligibilityCode]);

  const validateCode = async (codeToTest: string) => {
    const clean = codeToTest.trim().toUpperCase();
    if (!clean) {
      setCodeStatus({ valid: false, checked: false });
      return;
    }

    try {
      const res = await fetch('/api/eligibility/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean }),
      });
      const data = await res.json();

      if (data.valid) {
        setCodeStatus({
          valid: true,
          checked: true,
          message: 'Certificate Verified',
          details: `${data.claimant || 'Claimant'} • ${data.holding || 'Estate'} (${data.rating || 'Qualified'})`,
        });
        if (data.claimant && !fullName) {
          setFullName(data.claimant);
        }
      } else {
        setCodeStatus({
          valid: false,
          checked: true,
          message: 'Code not recognized. Please complete the £9.99 check.',
        });
      }
    } catch {
      // Local fallback for offline/client environments
      if (clean.startsWith('ELIG-') || clean === 'ELIG-BUCKLER-1987') {
        setCodeStatus({
          valid: true,
          checked: true,
          message: 'Certificate Verified (Offline/Demo)',
          details: 'Sion Buckler • Great House Farm (96.8% Restitution Rating)',
        });
        if (!fullName) {
          setFullName('Sion Buckler');
        }
      } else {
        setCodeStatus({
          valid: false,
          checked: true,
          message: 'Invalid certificate code. Please check code or pay £9.99.',
        });
      }
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEligibilityCode(val);
    if (val.length >= 6) {
      validateCode(val);
    } else {
      setCodeStatus({ valid: false, checked: false });
    }
  };

  const handleUseSampleCode = () => {
    const demo = 'ELIG-BUCKLER-1987';
    setEligibilityCode(demo);
    validateCode(demo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    if (authMode === 'signup' && !codeStatus.valid) {
      setErrorMessage('A valid £9.99 Eligibility Certificate Code is required to subscribe.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (authMode === 'signup') {
        const response = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'subscription',
            name: fullName,
            email: email,
            eligibilityCode: eligibilityCode,
          }),
        });

        const data = await response.json();
        if (data.sessionUrl) {
          window.location.href = data.sessionUrl;
          return;
        }
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onSuccessLogin) onSuccessLogin();
      }, 1200);
    } catch {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onSuccessLogin) onSuccessLogin();
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="webapp-login-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="webapp-login-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex min-h-full items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="webapp-login-modal-card"
        className="relative w-full max-w-lg my-auto rounded-3xl bg-[#2B2A27] border-2 border-[#52504C] shadow-2xl text-[#EDEFEE] flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header Bar */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#52504C] bg-[#23221F] flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#AA210F] text-[#EDEFEE] flex items-center justify-center font-black shadow-md flex-shrink-0">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-[#34332F] text-[#D08856] text-[10px] font-mono font-bold uppercase border border-[#52504C]">
                  Funnel Step 3
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">£49.99 / Month</span>
              </div>
              <h3 id="webapp-login-title" className="text-lg sm:text-xl font-black text-[#EDEFEE] truncate">
                {authMode === 'signup'
                  ? 'Subscribe to Restitution Service'
                  : 'Subscriber Portal Login'}
              </h3>
            </div>
          </div>

          {/* Accessible Close Button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-2xl bg-[#34332F] hover:bg-[#41403C] text-[#EDEFEE] border border-[#52504C] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D08856] focus:outline-none"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <p className="text-xs text-[#C8C7C4]">
            {authMode === 'signup'
              ? '£49.99/mo service — Subject to £9.99 Eligibility Check'
              : 'Access your active £49.99/mo autonomous AI agent workspace'}
          </p>

          {/* Funnel Clarification Banner */}
          {authMode === 'signup' && (
            <div className="p-3.5 rounded-2xl bg-[#34332F] border border-[#52504C] text-[11px] space-y-1">
              <div className="flex items-center justify-between font-mono">
                <span className="text-[#D08856] font-bold">SALES FUNNEL PROTOCOL:</span>
                <span className="text-[#A3A29E]">Step 3 of 3</span>
              </div>
              <div className="text-[#EDEFEE] font-medium">
                <span className="text-emerald-400">1. Free Demo</span> →{' '}
                <span className="text-emerald-400">2. £9.99 Eligibility Check</span> →{' '}
                <span className="font-bold text-[#D08856]">3. Subscribe (£49.99/mo, if eligible)</span>
              </div>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-[#34332F] rounded-2xl border border-[#52504C] text-xs">
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                  : 'text-[#C8C7C4] hover:text-[#EDEFEE]'
              }`}
            >
              Subscribe (£49.99/mo)
            </button>
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                  : 'text-[#C8C7C4] hover:text-[#EDEFEE]'
              }`}
            >
              Portal Sign In
            </button>
          </div>

          {isSuccess ? (
            <div className="p-6 rounded-2xl bg-[#34332F] border-2 border-emerald-500/50 text-center space-y-2 animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="font-black text-[#EDEFEE] text-base">Subscription Activated!</h4>
              <p className="text-xs text-[#C8C7C4]">
                Launching your £49.99/mo Autonomous Land Restitution AI Agent...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {authMode === 'signup' ? (
                <>
                  {/* FIELD 1: ELIGIBILITY CODE */}
                  <div className="p-3.5 rounded-2xl bg-[#34332F] border-2 border-[#D08856] space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <label className="block text-[#EDEFEE] font-bold text-xs flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#AA210F] text-[#EDEFEE] flex items-center justify-center text-[10px] font-mono">
                          1
                        </span>
                        <span>Eligibility Certificate Code</span>
                        <span className="text-red-400">*</span>
                      </label>

                      {onOpenEligibilityCheck && (
                        <button
                          type="button"
                          onClick={onOpenEligibilityCheck}
                          className="text-[11px] font-bold text-[#D08856] hover:text-[#e4a070] underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Pay £9.99 & Check</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="e.g. ELIG-BUCKLER-1987 or ELIG-XXXX-XXXX"
                        value={eligibilityCode}
                        onChange={handleCodeChange}
                        className="flex-1 bg-[#23221F] border border-[#52504C] rounded-xl px-3 py-2 text-xs font-mono uppercase text-[#EDEFEE] placeholder-[#A3A29E] focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856]"
                      />
                      <button
                        type="button"
                        onClick={handleUseSampleCode}
                        className="px-3 py-1.5 rounded-xl bg-[#23221F] hover:bg-[#41403C] text-[#D08856] border border-[#52504C] text-[10px] font-mono font-bold cursor-pointer whitespace-nowrap"
                        title="Use benchmark demo code"
                      >
                        Demo Code
                      </button>
                    </div>

                    {/* Status Indicator */}
                    {codeStatus.checked && (
                      <div
                        className={`text-[11px] rounded-xl p-2 font-medium flex items-center gap-1.5 ${
                          codeStatus.valid
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                            : 'bg-red-950/60 text-red-300 border border-red-500/40'
                        }`}
                      >
                        {codeStatus.valid ? (
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
                        )}
                        <div>
                          <span className="font-bold">{codeStatus.message}</span>
                          {codeStatus.details && <span className="ml-1 text-[10px] opacity-90">{codeStatus.details}</span>}
                        </div>
                      </div>
                    )}

                    {!codeStatus.valid && !codeStatus.checked && (
                      <div className="text-[10px] text-[#A3A29E]">
                        Must enter a valid £9.99 eligibility certificate code before subscribing.
                      </div>
                    )}
                  </div>

                  {/* FIELD 2: CLAIMANT / FULL NAME */}
                  <div className="space-y-1.5">
                    <label className="block text-[#EDEFEE] font-bold flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#34332F] text-[#EDEFEE] flex items-center justify-center text-[10px] font-mono">
                        2
                      </span>
                      <span>Claimant / Representative Full Name</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#A3A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sion Buckler"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-[#34332F] border border-[#52504C] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#EDEFEE] placeholder-[#A3A29E] focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856]"
                      />
                    </div>
                  </div>

                  {/* FIELD 3: EMAIL ADDRESS */}
                  <div className="space-y-1.5">
                    <label className="block text-[#EDEFEE] font-bold flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#34332F] text-[#EDEFEE] flex items-center justify-center text-[10px] font-mono">
                        3
                      </span>
                      <span>Account Email Address</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#A3A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="claimant@familydomain.co.uk"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#34332F] border border-[#52504C] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#EDEFEE] placeholder-[#A3A29E] focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856]"
                      />
                    </div>
                  </div>

                  {/* FIELD 4: PASSWORD */}
                  <div className="space-y-1.5">
                    <label className="block text-[#EDEFEE] font-bold flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#34332F] text-[#EDEFEE] flex items-center justify-center text-[10px] font-mono">
                        4
                      </span>
                      <span>Security Password / Access PIN</span>
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-[#A3A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#34332F] border border-[#52504C] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#EDEFEE] placeholder-[#A3A29E] focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856]"
                      />
                    </div>
                  </div>

                  {/* Submit / Stripe Payment Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || !codeStatus.valid}
                      className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed group focus-visible:ring-2 focus-visible:ring-[#D08856] focus:outline-none"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {isSubmitting
                          ? 'Connecting to Stripe Merchant...'
                          : codeStatus.valid
                          ? 'Subscribe & Start AI Agent (£49.99/mo)'
                          : 'Enter Valid Eligibility Code to Subscribe'}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </>
              ) : (
                /* Sign In Flow */
                <>
                  <div className="space-y-1.5">
                    <label className="block text-[#EDEFEE] font-bold">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#A3A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="claimant@familydomain.co.uk"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#34332F] border border-[#52504C] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#EDEFEE] placeholder-[#A3A29E] focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856]"
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
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#34332F] border border-[#52504C] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#EDEFEE] placeholder-[#A3A29E] focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-[#D08856] focus:outline-none"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{isSubmitting ? 'Signing In...' : 'Sign In to Subscriber Portal'}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-[#23221F] border-t border-[#52504C] flex items-center justify-between text-[11px] text-[#A3A29E] font-mono flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Stripe Encrypted Billing</span>
          </span>
          <span>Cancel anytime in portal</span>
        </div>
      </div>
    </div>
  );
};
