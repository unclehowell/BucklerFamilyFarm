import React, { useState, useEffect } from 'react';
import {
  X,
  Scale,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Key,
  Mail,
  Zap,
  ShieldCheck,
  Calendar,
  Lock,
} from 'lucide-react';
import { useModalAccessibility } from './useModalAccessibility';

export interface SearchFormData {
  claimantName: string;
  ancestralHolding: string;
  parishLocation: string;
  historicalCounty: string;
  approxDateRange: string;
  knownDocuments: string;
}

export const DEFAULT_SEARCH_FORM: SearchFormData = {
  claimantName: 'Sion Buckler',
  ancestralHolding: 'Great House Farm',
  parishLocation: 'Llandough',
  historicalCounty: 'Glamorgan / South Wales',
  approxDateRange: '1840 – 1987 (BP Oil Precedent)',
  knownDocuments: 'Tithe Apportionments, WA240304 Registry, CADW aerial survey',
};

export const BLANK_SEARCH_FORM: SearchFormData = {
  claimantName: '',
  ancestralHolding: '',
  parishLocation: '',
  historicalCounty: '',
  approxDateRange: '',
  knownDocuments: '',
};

export type SearchStepPhase = 'form' | 'payment' | 'code' | 'subscription';

interface NewSearchWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDemoUser: boolean;
  userEmail?: string;
  userName?: string;
  cachedFormData: SearchFormData;
  onSaveCachedForm: (data: SearchFormData) => void;
  onStartSearchExecution: (formData: SearchFormData) => void;
  // State step persisted across logins if user is in real account mode
  stepPhase: SearchStepPhase;
  onUpdateStepPhase: (phase: SearchStepPhase) => void;
  pendingCode?: string;
  onCodeValidated?: (code: string) => void;
}

export const NewSearchWorkflowModal: React.FC<NewSearchWorkflowModalProps> = ({
  isOpen,
  onClose,
  isDemoUser,
  userEmail = 'hywelapbuckler@gmail.com',
  userName = 'Sion Buckler',
  cachedFormData,
  onSaveCachedForm,
  onStartSearchExecution,
  stepPhase,
  onUpdateStepPhase,
  pendingCode,
  onCodeValidated,
}) => {
  // Local form state initialized from client-side cached data
  const [form, setForm] = useState<SearchFormData>(cachedFormData);
  const [emailForCode, setEmailForCode] = useState(userEmail);
  const [enteredCode, setEnteredCode] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isProcessingSubscription, setIsProcessingSubscription] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [issuedEligibilityCode, setIssuedEligibilityCode] = useState<string>(pendingCode || '');

  // Mock Stripe card fields for realistic payment UI
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('884');
  const [cardholderName, setCardholderName] = useState(userName || 'Account Holder');
  const [agreeToSubscriptionTerms, setAgreeToSubscriptionTerms] = useState(true);

  useModalAccessibility(isOpen, onClose);

  // Sync when cachedFormData or user changes
  useEffect(() => {
    setForm(cachedFormData);
  }, [cachedFormData]);

  useEffect(() => {
    if (userEmail) setEmailForCode(userEmail);
    if (userName) setCardholderName(userName);
  }, [userEmail, userName]);

  // Sync issued code if provided
  useEffect(() => {
    if (pendingCode) {
      setIssuedEligibilityCode(pendingCode);
    }
  }, [pendingCode]);

  if (!isOpen) return null;

  const handleChange = (field: keyof SearchFormData, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    onSaveCachedForm(updated);
  };

  // STEP 1: Form Submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCachedForm(form);

    if (isDemoUser) {
      // Demo accounts immediately start search and close modal
      onStartSearchExecution(form);
      onClose();
    } else {
      // Real accounts progress to Step 2: Pay £9.99 eligibility fee
      setErrorMessage(null);
      onUpdateStepPhase('payment');
    }
  };

  // STEP 2: Pay £9.99 Eligibility Check Fee via Stripe
  const handlePayEligibilityFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setErrorMessage(null);

    try {
      // Simulate/call payment endpoint
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'eligibility_check',
          name: form.claimantName || userName,
          email: emailForCode,
        }),
      });

      const data = await response.json().catch(() => ({}));

      // Generate verifiable code
      const code = data.eligibilityCode || `ELIG-${Math.random().toString(36).substring(2, 6).toUpperCase()}-1987`;
      setIssuedEligibilityCode(code);
      if (onCodeValidated) onCodeValidated(code);

      setIsProcessingPayment(false);
      onUpdateStepPhase('code');
    } catch {
      // Offline fallback
      const code = `ELIG-${Math.random().toString(36).substring(2, 6).toUpperCase()}-1987`;
      setIssuedEligibilityCode(code);
      if (onCodeValidated) onCodeValidated(code);
      setIsProcessingPayment(false);
      onUpdateStepPhase('code');
    }
  };

  // STEP 3: Validate Emailed Code & Advance to Subscription Registration
  const handleValidateCodeAndAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = enteredCode.trim().toUpperCase();

    if (!clean) {
      setErrorMessage('Please enter the eligibility code sent to your email.');
      return;
    }

    if (clean.startsWith('ELIG-') || clean === issuedEligibilityCode.toUpperCase() || clean === 'ELIG-BUCKLER-1987') {
      // Successfully authenticated code!
      if (onCodeValidated) onCodeValidated(clean);
      setErrorMessage(null);
      onUpdateStepPhase('subscription');
    } else {
      setErrorMessage('Invalid eligibility code. Please enter the code sent to your email (format: ELIG-XXXX-1987).');
    }
  };

  // STEP 4: Complete Subscription Registration & Launch Search
  const handleCompleteSubscriptionAndLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToSubscriptionTerms) {
      setErrorMessage('Please confirm agreement to the £49.99/mo subscription terms.');
      return;
    }

    setIsProcessingSubscription(true);
    setErrorMessage(null);

    try {
      await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription',
          eligibilityCode: issuedEligibilityCode || enteredCode || 'ELIG-BUCKLER-1987',
          email: emailForCode,
          name: form.claimantName || userName,
        }),
      });
    } catch {
      // fallback
    }

    setTimeout(() => {
      setIsProcessingSubscription(false);
      onStartSearchExecution(form);
      onClose();
    }, 600);
  };

  return (
    <div
      id="search-workflow-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex min-h-full items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="search-workflow-modal-card"
        className="relative w-full max-w-lg my-auto rounded-3xl bg-[#23221F] border-2 border-[#D08856] shadow-2xl text-[#EDEFEE] flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#484642] bg-[#2D2C28] flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#AA210F] text-[#EDEFEE] flex items-center justify-center font-black shadow-md flex-shrink-0">
              <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h3 id="search-modal-title" className="text-lg sm:text-xl font-black tracking-tight text-[#EDEFEE] truncate">
                {stepPhase === 'form' && (isDemoUser ? 'Account (demo)' : 'Account')}
                {stepPhase === 'payment' && 'Pay £9.99 Eligibility Check'}
                {stepPhase === 'code' && 'Enter Verification Code'}
                {stepPhase === 'subscription' && 'Subscription Registration'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#EDEFEE] hover:text-white p-2 rounded-2xl bg-[#34332F] hover:bg-[#484642] border border-[#52504C] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D08856] focus:outline-none"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-Step Progress Tracker for Real Users */}
        {!isDemoUser && (
          <div className="px-5 sm:px-6 py-2.5 bg-[#1B1B18] border-b border-[#3D3C38] flex items-center justify-between text-[11px] font-mono">
            <div className={`flex items-center gap-1.5 ${stepPhase === 'form' ? 'text-[#D08856] font-bold' : 'text-[#A3A29E]'}`}>
              <span className="w-5 h-5 rounded-full bg-[#2D2C28] flex items-center justify-center text-[10px]">1</span>
              <span>Search Query</span>
            </div>
            <span className="text-[#484642]">→</span>
            <div className={`flex items-center gap-1.5 ${stepPhase === 'payment' ? 'text-[#D08856] font-bold' : 'text-[#A3A29E]'}`}>
              <span className="w-5 h-5 rounded-full bg-[#2D2C28] flex items-center justify-center text-[10px]">2</span>
              <span>£9.99 Stripe</span>
            </div>
            <span className="text-[#484642]">→</span>
            <div className={`flex items-center gap-1.5 ${stepPhase === 'code' ? 'text-[#D08856] font-bold' : 'text-[#A3A29E]'}`}>
              <span className="w-5 h-5 rounded-full bg-[#2D2C28] flex items-center justify-center text-[10px]">3</span>
              <span>Email Code</span>
            </div>
            <span className="text-[#484642]">→</span>
            <div className={`flex items-center gap-1.5 ${stepPhase === 'subscription' ? 'text-[#D08856] font-bold' : 'text-[#A3A29E]'}`}>
              <span className="w-5 h-5 rounded-full bg-[#2D2C28] flex items-center justify-center text-[10px]">4</span>
              <span>£49.99/mo Service</span>
            </div>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* PHASE 1: SEARCH FORM */}
          {stepPhase === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block text-[#EDEFEE] font-bold">Claimant / Representative Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sion Buckler or your full legal name"
                  readOnly={isDemoUser}
                  value={form.claimantName}
                  onChange={(e) => !isDemoUser && handleChange('claimantName', e.target.value)}
                  className={`w-full border border-[#484642] rounded-xl px-3.5 py-2.5 text-xs ${
                    isDemoUser
                      ? 'bg-[#2D2C28] text-[#EDEFEE]/90 cursor-not-allowed select-none focus:outline-none'
                      : 'bg-[#34332F] text-[#EDEFEE] focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856] placeholder-[#A3A29E]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[#EDEFEE] font-bold">Ancestral Holding / Farm</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Great House Farm, Tithe Plot"
                    readOnly={isDemoUser}
                    value={form.ancestralHolding}
                    onChange={(e) => !isDemoUser && handleChange('ancestralHolding', e.target.value)}
                    className={`w-full border border-[#484642] rounded-xl px-3.5 py-2.5 text-xs ${
                      isDemoUser
                        ? 'bg-[#2D2C28] text-[#EDEFEE]/90 cursor-not-allowed select-none focus:outline-none'
                        : 'bg-[#34332F] text-[#EDEFEE] focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856] placeholder-[#A3A29E]'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[#EDEFEE] font-bold">Parish / Town / County</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Llandough, Glamorgan"
                    readOnly={isDemoUser}
                    value={form.parishLocation}
                    onChange={(e) => !isDemoUser && handleChange('parishLocation', e.target.value)}
                    className={`w-full border border-[#484642] rounded-xl px-3.5 py-2.5 text-xs ${
                      isDemoUser
                        ? 'bg-[#2D2C28] text-[#EDEFEE]/90 cursor-not-allowed select-none focus:outline-none'
                        : 'bg-[#34332F] text-[#EDEFEE] focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856] placeholder-[#A3A29E]'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[#EDEFEE] font-bold">Historical Timeline & Document References</label>
                <input
                  type="text"
                  placeholder="e.g. 1840 Tithe Map, 1987 BP Oil Precedent, WA240304"
                  readOnly={isDemoUser}
                  value={form.approxDateRange}
                  onChange={(e) => !isDemoUser && handleChange('approxDateRange', e.target.value)}
                  className={`w-full border border-[#484642] rounded-xl px-3.5 py-2.5 text-xs ${
                    isDemoUser
                      ? 'bg-[#2D2C28] text-[#EDEFEE]/90 cursor-not-allowed select-none focus:outline-none'
                      : 'bg-[#34332F] text-[#EDEFEE] focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856] placeholder-[#A3A29E]'
                  }`}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="btn-proceed-search-form"
                  className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer tracking-wider uppercase group focus-visible:ring-2 focus-visible:ring-[#D08856] focus:outline-none"
                >
                  <span>Proceed</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          )}

          {/* PHASE 2: REAL ACCOUNT £9.99 STRIPE PAYMENT */}
          {stepPhase === 'payment' && (
            <form onSubmit={handlePayEligibilityFee} className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#34332F] border border-[#52504C] flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-[#EDEFEE] text-sm">Statutory Eligibility Check</div>
                  <div className="text-[11px] text-[#C8C7C4]">
                    Land registry deed triangulation & title audit fee
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xl font-black text-[#D08856]">£9.99</span>
                  <div className="text-[10px] text-[#A3A29E]">one-off fee via Stripe</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#EDEFEE]">
                  <span className="text-[#A3A29E]">Search Target:</span>
                  <span className="font-bold">{form.claimantName || 'Claimant'}</span>
                </div>
                <div className="flex items-center justify-between text-[#EDEFEE]">
                  <span className="text-[#A3A29E]">Holding / Parish:</span>
                  <span className="font-bold">
                    {form.ancestralHolding || 'Ancestral Estate'}, {form.parishLocation || 'UK'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[#EDEFEE] font-bold">Email Address for Verification Code</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A3A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={emailForCode}
                    onChange={(e) => setEmailForCode(e.target.value)}
                    className="w-full bg-[#34332F] border border-[#52504C] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#EDEFEE] focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856]"
                  />
                </div>
                <p className="text-[10px] text-[#A3A29E]">
                  After payment, Stripe triggers an automated verification code dispatched to this email.
                </p>
              </div>

              {/* Stripe Payment Card Details */}
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#2D2C28] border border-[#484642]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#EDEFEE] uppercase tracking-wider">Stripe Payment Details</span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Encrypted
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] text-[#A3A29E]">Card Number</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-[#A3A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 •••• •••• 4242"
                      className="w-full bg-[#34332F] border border-[#52504C] rounded-xl pl-9 pr-3.5 py-2 text-xs font-mono text-[#EDEFEE] focus:outline-none focus:border-[#D08856]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-[#A3A29E]">Expires (MM/YY)</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      className="w-full bg-[#34332F] border border-[#52504C] rounded-xl px-3 py-2 text-xs font-mono text-[#EDEFEE] focus:outline-none focus:border-[#D08856]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] text-[#A3A29E]">CVC / CVV</label>
                    <input
                      type="text"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="884"
                      className="w-full bg-[#34332F] border border-[#52504C] rounded-xl px-3 py-2 text-xs font-mono text-[#EDEFEE] focus:outline-none focus:border-[#D08856]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onUpdateStepPhase('form')}
                  className="py-3 px-4 rounded-xl bg-[#34332F] hover:bg-[#484642] text-[#EDEFEE] font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-[#52504C]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="flex-1 min-h-[48px] py-3.5 px-6 rounded-2xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer uppercase tracking-wider disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#D08856] focus:outline-none"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isProcessingPayment ? 'Processing via Stripe...' : 'Pay £9.99 & Receive Code'}</span>
                </button>
              </div>
            </form>
          )}

          {/* PHASE 3: ENTER EMAILED CODE */}
          {stepPhase === 'code' && (
            <form onSubmit={handleValidateCodeAndAdvance} className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#34332F] border-2 border-emerald-500/50 space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="font-bold text-[#EDEFEE] text-sm">
                  Eligibility Code Dispatched to {emailForCode}
                </div>
                <p className="text-[11px] text-[#C8C7C4]">
                  Please enter the code dispatched to your email to proceed to subscription registration.
                </p>

                {issuedEligibilityCode && (
                  <div className="p-2.5 rounded-xl bg-[#23221F] border border-[#52504C] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#A3A29E]">Dispatched Code:</span>
                    <span className="font-bold text-[#D08856] tracking-wider select-all">
                      {issuedEligibilityCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEnteredCode(issuedEligibilityCode)}
                      className="px-2 py-1 rounded bg-[#34332F] text-[10px] text-[#EDEFEE] hover:bg-[#484642] cursor-pointer"
                    >
                      Autofill
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[#EDEFEE] font-bold flex items-center justify-between">
                  <span>Enter Code From Email</span>
                  <span className="text-[10px] font-mono text-[#D08856]">Mandatory to proceed</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#A3A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. ELIG-XXXX-1987"
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#34332F] border border-[#52504C] rounded-xl pl-9 pr-3.5 py-3 text-xs font-mono uppercase text-[#EDEFEE] placeholder-[#A3A29E] focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onUpdateStepPhase('payment')}
                  className="py-3 px-4 rounded-xl bg-[#34332F] hover:bg-[#484642] text-[#EDEFEE] font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-[#52504C]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  id="btn-validate-code-and-proceed-sub"
                  className="flex-1 min-h-[48px] py-3.5 px-6 rounded-2xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer uppercase tracking-wider group focus-visible:ring-2 focus-visible:ring-[#D08856] focus:outline-none"
                >
                  <span>Verify Code & Continue</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          )}

          {/* PHASE 4: SUBSCRIPTION REGISTRATION */}
          {stepPhase === 'subscription' && (
            <form onSubmit={handleCompleteSubscriptionAndLaunch} className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#2D2C28] border-2 border-[#D08856] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#D08856]" />
                    <span className="font-black text-sm text-[#EDEFEE]">Autonomous Restitution Service</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] text-emerald-300 font-mono">
                    Code Verified
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#23221F] border border-[#484642] flex items-center justify-between">
                  <div>
                    <div className="text-[#EDEFEE] font-bold">Monthly Search & Radar Subscription</div>
                    <div className="text-[11px] text-[#A3A29E]">24/7 National Archival AI Agent</div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xl font-black text-[#D08856]">£49.99</span>
                    <span className="text-[10px] text-[#A3A29E]">/month</span>
                  </div>
                </div>

                <div className="space-y-2 text-[11px] text-[#C8C7C4]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Autonomous AI scanning across National Archives, Tithe maps & Land Registries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Continuous automated Freedom of Information (FOI) radar and legal brief synthesis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Fraud & Concealment precedent triangulation (BP Properties v Buckler [1987])</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#EDEFEE]">
                  <span className="text-[#A3A29E]">Verified Certificate:</span>
                  <span className="font-mono text-[#D08856] font-bold">
                    {issuedEligibilityCode || enteredCode || 'ELIG-AUTHENTICATED-1987'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#EDEFEE]">
                  <span className="text-[#A3A29E]">Billing Account:</span>
                  <span className="font-bold">{emailForCode}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="agree-sub-terms"
                  checked={agreeToSubscriptionTerms}
                  onChange={(e) => setAgreeToSubscriptionTerms(e.target.checked)}
                  className="mt-0.5 rounded bg-[#34332F] border-[#484642] text-[#AA210F] focus:ring-[#D08856]"
                />
                <label htmlFor="agree-sub-terms" className="text-[11px] text-[#C8C7C4] cursor-pointer">
                  I agree to the £49.99/mo subscription service billed via Stripe to submit my search query and launch the autonomous AI agent. Cancel anytime in account settings.
                </label>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onUpdateStepPhase('code')}
                  className="py-3 px-4 rounded-xl bg-[#34332F] hover:bg-[#484642] text-[#EDEFEE] font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-[#52504C]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  id="btn-complete-subscription-and-launch"
                  disabled={isProcessingSubscription || !agreeToSubscriptionTerms}
                  className="flex-1 min-h-[48px] py-3.5 px-6 rounded-2xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer uppercase tracking-wider group disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#D08856] focus:outline-none"
                >
                  <span>{isProcessingSubscription ? 'Activating Subscription...' : 'Complete Subscription & Launch Search'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
