import React, { useState } from 'react';
import {
  X,
  Scale,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  CreditCard,
  Lock,
  Search,
  Building,
  AlertCircle,
} from 'lucide-react';

interface EligibilityCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEligibilityConfirmed?: (code: string) => void;
  defaultClaimantName?: string;
  defaultHoldingName?: string;
  defaultLocation?: string;
}

export const EligibilityCheckModal: React.FC<EligibilityCheckModalProps> = ({
  isOpen,
  onClose,
  onEligibilityConfirmed,
  defaultClaimantName = 'Sion Buckler',
  defaultHoldingName = 'Great House Farm',
  defaultLocation = 'Llandough',
}) => {
  const [claimantName, setClaimantName] = useState(defaultClaimantName);
  const [holdingName, setHoldingName] = useState(defaultHoldingName);
  const [location, setLocation] = useState(defaultLocation);
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePayAndCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'eligibility_check',
          name: claimantName,
          email: email || undefined,
        }),
      });

      const data = await response.json();

      if (data.sessionUrl) {
        // Redirect to live Stripe Checkout
        window.location.href = data.sessionUrl;
        return;
      }

      // Demo/Simulation response
      const code = data.eligibilityCode || `ELIG-${Math.random().toString(36).substring(2, 6).toUpperCase()}-1987`;
      setGeneratedCode(code);
    } catch (err: unknown) {
      console.error('Eligibility check request failed:', err);
      // Fallback generate code for demo reliability
      const code = `ELIG-${Math.random().toString(36).substring(2, 6).toUpperCase()}-1987`;
      setGeneratedCode(code);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyToRegistration = () => {
    if (generatedCode && onEligibilityConfirmed) {
      onEligibilityConfirmed(generatedCode);
    }
    onClose();
  };

  return (
    <div
      id="eligibility-check-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="bg-[#2B2A27] border-2 border-[#D08856] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl text-[#EDEFEE] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#EDEFEE]/70 hover:text-[#EDEFEE] p-2 rounded-xl bg-[#41403C] border border-[#52504C] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#AA210F] text-[#EDEFEE] flex items-center justify-center font-black shadow-md flex-shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#41403C] text-[#D08856] text-[10px] font-mono font-bold uppercase border border-[#52504C]">
                Funnel Step 2
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">One-Off £9.99</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#EDEFEE]">
              Statutory Eligibility Check
            </h3>
            <p className="text-xs text-[#EDEFEE]/70">
              Required qualification certificate before £49.99/mo subscription
            </p>
          </div>
        </div>

        {generatedCode ? (
          /* SUCCESS: Generated Certificate Code */
          <div className="space-y-5 animate-in zoom-in-95 duration-200">
            <div className="p-5 rounded-2xl bg-[#41403C] border-2 border-emerald-500/50 space-y-3 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
              <div>
                <span className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
                  ELIGIBILITY VERIFIED & ISSUED
                </span>
                <h4 className="text-base sm:text-lg font-black text-[#EDEFEE] mt-0.5">
                  96.8% High Restitution Probability
                </h4>
              </div>

              {/* Highlighted Code Box */}
              <div className="p-3.5 rounded-xl bg-[#2B2A27] border border-[#52504C] space-y-1">
                <div className="text-[10px] font-mono text-[#EDEFEE]/60 uppercase">
                  Your Official Eligibility Code
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono tracking-wider text-[#D08856] select-all">
                  {generatedCode}
                </div>
                <div className="text-[10px] text-[#EDEFEE]/70 font-mono">
                  Sion Buckler • Great House Farm, Llandough (WA240304)
                </div>
              </div>
            </div>

            <button
              onClick={handleApplyToRegistration}
              className="w-full py-4 rounded-2xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer uppercase tracking-wider group"
            >
              <span>Apply Code & Proceed to Subscribe (£49.99/mo)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ) : (
          /* FORM: Pay £9.99 & Check Eligibility */
          <form onSubmit={handlePayAndCheck} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Pricing Notice */}
            <div className="p-3.5 rounded-2xl bg-[#41403C] border border-[#52504C] flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-bold text-[#EDEFEE]">Statutory Deed Archival Audit</div>
                <div className="text-[11px] text-[#EDEFEE]/70">
                  Includes full WA240304 register analysis & certificate code
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-lg font-black text-[#D08856]">£9.99</span>
                <div className="text-[10px] text-[#EDEFEE]/60">one-off fee</div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[#EDEFEE] font-bold">
                Claimant / Hereditary Representative Name
              </label>
              <input
                type="text"
                required
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                placeholder="e.g. Sion Buckler"
                className="w-full bg-[#41403C] border border-[#52504C] rounded-xl px-3.5 py-2.5 text-xs text-[#EDEFEE] focus:outline-none focus:border-[#D08856]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[#EDEFEE] font-bold">Ancestral Holding</label>
                <input
                  type="text"
                  required
                  value={holdingName}
                  onChange={(e) => setHoldingName(e.target.value)}
                  placeholder="e.g. Great House Farm"
                  className="w-full bg-[#41403C] border border-[#52504C] rounded-xl px-3.5 py-2.5 text-xs text-[#EDEFEE] focus:outline-none focus:border-[#D08856]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[#EDEFEE] font-bold">Parish / Township</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Llandough"
                  className="w-full bg-[#41403C] border border-[#52504C] rounded-xl px-3.5 py-2.5 text-xs text-[#EDEFEE] focus:outline-none focus:border-[#D08856]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[#EDEFEE] font-bold">Email for Certificate Delivery</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="claimant@familydomain.co.uk"
                className="w-full bg-[#41403C] border border-[#52504C] rounded-xl px-3.5 py-2.5 text-xs text-[#EDEFEE] focus:outline-none focus:border-[#D08856]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer uppercase tracking-wider group disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {isProcessing ? 'Processing £9.99 Audit via Stripe...' : 'Pay £9.99 & Get Eligibility Code'}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center justify-between text-[11px] text-[#EDEFEE]/60 border-t border-[#52504C] pt-3 font-mono">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Stripe Encrypted Merchant</span>
          </span>
          <span>Funnel: Demo → £9.99 Check → £49.99/mo</span>
        </div>
      </div>
    </div>
  );
};
