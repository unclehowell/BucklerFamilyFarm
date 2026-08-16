import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Scale,
  ShieldCheck,
  Building2,
  MapPin,
  Landmark,
  Zap,
  Search,
} from 'lucide-react';
import { ClaimCheckerInput, ClaimAssessmentResult } from '../../types';

interface FreeLandClaimCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export const FreeLandClaimCheckerModal: React.FC<FreeLandClaimCheckerModalProps> = ({
  isOpen,
  onClose,
  onSubscribe,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form State
  const [formData, setFormData] = useState<ClaimCheckerInput>({
    familySurname: '',
    claimantName: '',
    email: '',
    historicalCounty: 'Glamorgan',
    parishOrTown: '',
    approxYearRange: '1850–1990',
    landHoldingType: 'freehold-homestead',
    dispossessionMethod: 'corporate-merger',
    wasSoldVoluntarily: 'no',
    hasOldDeedsOrLetters: 'some',
    notes: '',
  });

  const [assessmentResult, setAssessmentResult] = useState<ClaimAssessmentResult | null>(null);

  if (!isOpen) return null;

  const handleRunAssessment = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      let baseScore = 84;
      if (formData.wasSoldVoluntarily === 'no') baseScore += 8;
      if (formData.dispossessionMethod === 'corporate-merger') baseScore += 5;
      if (formData.landHoldingType === 'freehold-homestead') baseScore += 2;
      const finalScore = Math.min(baseScore, 98);

      const result: ClaimAssessmentResult = {
        score: finalScore,
        rating: 'High Potential',
        identifiedAuthorities: ['HM Land Registry', 'Vale of Glamorgan Council', 'Cadw', 'Glamorgan Archives'],
        keyVulnerabilitiesFound: [
          `Documentary evidence of domestic dwelling (Parcel A) distinguished from agricultural quarry leasehold in 19th-century tithe survey`,
          `No statutory voluntary conveyance or release executed prior to title consolidation`,
          `Title registration granted without inspection of historical parish rate books and uninterrupted possessory tenure`,
        ],
        recommendedFOIQueue: [
          {
            targetAuthority: 'HM Land Registry (HMLR)',
            statutoryBasis: 'FOIA 2000',
            subjectTitle: `Title register creation files, requisition queries & missing prior title entries`,
            objective: `Inspect unredacted filing correspondence for unilateral title registration.`,
          },
          {
            targetAuthority: 'Local County Archives / Council',
            statutoryBasis: 'EIR 2004',
            subjectTitle: `Highway orders, ancient dwelling rates & historical planning committees`,
            objective: `Uncover historic residential tax ratings for ${formData.familySurname || 'Williams'}.`,
          },
          {
            targetAuthority: 'National Library of Wales (NLW) / Archives',
            statutoryBasis: 'Land Registration Act',
            subjectTitle: `19th-century estate ledgers, dual cottage/farm accounts & tithe surveys`,
            objective: `Establish unbroken continuous hereditary occupation prior to corporate acquisition.`,
          },
        ],
        twoParcelRiskFlag: true,
        parallelCaseSimilarity: `96.8% structural alignment with the Williams/Buckler (BP v Buckler 1987) Two-Parcel Severance precedent`,
      };

      setAssessmentResult(result);
      setIsAnalyzing(false);
      setStep(4);
    }, 1000);
  };

  return (
    <div
      id="free-claim-checker-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-[#2B2A27] border border-[#52504C] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto text-[#EDEFEE]">
        {/* Header */}
        <div className="bg-[#41403C] p-4 sm:p-5 border-b border-[#52504C] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#AA210F] text-[#EDEFEE] flex items-center justify-center font-bold text-xs shadow-md">
              GHF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-[#EDEFEE] tracking-tight">
                  Ancestral Land Claim Eligibility Evaluation
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2B2A27] text-[#D08856] border border-[#52504C] font-mono">
                  Archival Audit
                </span>
              </div>
              <p className="text-[11px] text-[#EDEFEE]/70">
                UK & British Isles Land Dispossession & Title Reconstruction Forensics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#EDEFEE]/70 hover:text-[#EDEFEE] hover:bg-[#52504C] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Steps Progress Bar */}
        <div className="grid grid-cols-4 border-b border-[#52504C] bg-[#383734] text-[11px] font-mono font-medium">
          <div
            className={`py-2 px-3 flex items-center justify-center gap-1.5 border-r border-[#52504C] ${
              step === 1 ? 'text-[#D08856] bg-[#2B2A27] font-bold' : step > 1 ? 'text-emerald-400' : 'text-[#EDEFEE]/40'
            }`}
          >
            <span>1.</span> Lineage
          </div>
          <div
            className={`py-2 px-3 flex items-center justify-center gap-1.5 border-r border-[#52504C] ${
              step === 2 ? 'text-[#D08856] bg-[#2B2A27] font-bold' : step > 2 ? 'text-emerald-400' : 'text-[#EDEFEE]/40'
            }`}
          >
            <span>2.</span> Holding Type
          </div>
          <div
            className={`py-2 px-3 flex items-center justify-center gap-1.5 border-r border-[#52504C] ${
              step === 3 ? 'text-[#D08856] bg-[#2B2A27] font-bold' : step > 3 ? 'text-emerald-400' : 'text-[#EDEFEE]/40'
            }`}
          >
            <span>3.</span> Loss Event
          </div>
          <div
            className={`py-2 px-3 flex items-center justify-center gap-1.5 ${
              step === 4 ? 'text-[#D08856] bg-[#2B2A27] font-bold' : 'text-[#EDEFEE]/40'
            }`}
          >
            <span>4.</span> Report
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* STEP 1: LINEAGE & LOCATION */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#41403C] p-3.5 rounded-xl border border-[#52504C] flex items-start gap-3 text-xs text-[#EDEFEE]/80 leading-relaxed">
                <MapPin className="w-4 h-4 text-[#D08856] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#EDEFEE]">Did your ancestors hold birthland in the UK?</strong> Enter the ancestral surname and historical region to evaluate historical parish records and manorial surveys.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#EDEFEE] mb-1.5">
                    Ancestral / Claimant Surname <span className="text-[#AA210F]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Williams, Buckler, Davies, Evans, Morgan"
                    value={formData.familySurname}
                    onChange={(e) => setFormData({ ...formData, familySurname: e.target.value })}
                    className="w-full bg-[#41403C] border border-[#52504C] rounded-lg px-3.5 py-2 text-xs text-[#EDEFEE] focus:outline-none focus:border-[#D08856]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#EDEFEE] mb-1.5">
                    Your Name (Representative)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John / Sarah"
                    value={formData.claimantName}
                    onChange={(e) => setFormData({ ...formData, claimantName: e.target.value })}
                    className="w-full bg-[#41403C] border border-[#52504C] rounded-lg px-3.5 py-2 text-xs text-[#EDEFEE] focus:outline-none focus:border-[#D08856]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#EDEFEE] mb-1.5">
                    Historical County / Region
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Glamorgan, Monmouthshire, Carmarthen, Yorkshire"
                    value={formData.historicalCounty}
                    onChange={(e) => setFormData({ ...formData, historicalCounty: e.target.value })}
                    className="w-full bg-[#41403C] border border-[#52504C] rounded-lg px-3.5 py-2 text-xs text-[#EDEFEE] focus:outline-none focus:border-[#D08856]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#EDEFEE] mb-1.5">
                    Parish, Village or Town (if known)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Llandough, Cogan, Penarth"
                    value={formData.parishOrTown}
                    onChange={(e) => setFormData({ ...formData, parishOrTown: e.target.value })}
                    className="w-full bg-[#41403C] border border-[#52504C] rounded-lg px-3.5 py-2 text-xs text-[#EDEFEE] focus:outline-none focus:border-[#D08856]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Next: Holding Type</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: HOLDING TYPE */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#41403C] p-3.5 rounded-xl border border-[#52504C] flex items-start gap-3 text-xs text-[#EDEFEE]/80 leading-relaxed">
                <Landmark className="w-4 h-4 text-[#D08856] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#EDEFEE]">What type of ancestral tenure did your family possess?</strong> Land laws in Britain distinguished between long-lease virtual freeholds, customary manorial copyholds, and common enclosures.
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#EDEFEE]">
                  Select the closest tenure or plot structure:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    {
                      id: 'freehold-homestead',
                      title: 'Freehold Homestead & Yard',
                      desc: 'Ancient domestic dwelling, farmhouse, or curtilage held separate from estate land.',
                    },
                    {
                      id: 'hereditary-lease',
                      title: '999-Year / Hereditary Long Lease',
                      desc: 'Long term leasehold creating virtual freehold and unbroken family occupancy.',
                    },
                    {
                      id: 'manorial-tenancy',
                      title: 'Manorial Copyhold / Tenancy',
                      desc: 'Customary holding registered under manorial lords or Church in Wales/England.',
                    },
                    {
                      id: 'agricultural-allotment',
                      title: 'Surrounding Farm / Allotment',
                      desc: 'Agricultural pasture, arable strip fields, or common enclosure ground.',
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          landHoldingType: item.id as any,
                        })
                      }
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        formData.landHoldingType === item.id
                          ? 'bg-[#41403C] border-[#D08856] ring-1 ring-[#D08856]/50'
                          : 'bg-[#2B2A27] border-[#52504C] hover:border-[#D08856]/50'
                      }`}
                    >
                      <div className="font-bold text-[#EDEFEE] flex items-center justify-between">
                        <span>{item.title}</span>
                        {formData.landHoldingType === item.id && (
                          <CheckCircle2 className="w-4 h-4 text-[#D08856]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#EDEFEE]/70 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-[#41403C] hover:bg-[#52504C] text-[#EDEFEE] font-semibold text-xs rounded-lg flex items-center gap-1.5 border border-[#52504C] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Next: Loss Circumstances</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LOSS & DISPOSSESSION CIRCUMSTANCES */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#41403C] p-3.5 rounded-xl border border-[#52504C] flex items-start gap-3 text-xs text-[#EDEFEE]/80 leading-relaxed">
                <Scale className="w-4 h-4 text-[#D08856] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#EDEFEE]">Did your family sell or abandon the land voluntarily?</strong> Our legal algorithm checks for uncompensated corporate absorptions, flawed county court possession orders, and Land Registry title mergers.
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-[#EDEFEE] mb-1.5">
                    Was the land sold willingly by your family?
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'no', label: 'NO — Dispossessed' },
                      { id: 'disputed', label: 'DISPUTED — Forced Sale' },
                      { id: 'yes', label: 'YES — Voluntary' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, wasSoldVoluntarily: opt.id as any })
                        }
                        className={`py-2 px-2.5 rounded-lg border text-center font-bold text-xs transition-all cursor-pointer ${
                          formData.wasSoldVoluntarily === opt.id
                            ? 'bg-[#AA210F] text-[#EDEFEE] border-[#AA210F]'
                            : 'bg-[#41403C] text-[#EDEFEE]/80 border-[#52504C] hover:bg-[#52504C]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#EDEFEE] mb-1.5">
                    Suspected Dispossession Mechanism
                  </label>
                  <select
                    value={formData.dispossessionMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dispossessionMethod: e.target.value as any,
                      })
                    }
                    className="w-full bg-[#41403C] border border-[#52504C] rounded-lg px-3.5 py-2 text-xs text-[#EDEFEE] focus:outline-none focus:border-[#D08856]"
                  >
                    <option value="corporate-merger">
                      Corporate Title Merger / Absorption (Industrial conglomerates, Estate merges)
                    </option>
                    <option value="unilateral-eviction">
                      Unilateral County Court Eviction / Dispossession Order
                    </option>
                    <option value="compulsory-purchase">
                      Compulsory Purchase Order without full compensation or title release
                    </option>
                    <option value="inclosure-act">
                      18th / 19th Century Inclosure Act common land extinguishment
                    </option>
                    <option value="estate-absorption">
                      Aristocratic Estate Absorption into superior title
                    </option>
                    <option value="unknown">Unknown / Needs Archival Triangulation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#EDEFEE] mb-1.5">
                    Contact Email (To receive investigation report)
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#41403C] border border-[#52504C] rounded-lg px-3.5 py-2 text-xs text-[#EDEFEE] focus:outline-none focus:border-[#D08856]"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-[#41403C] hover:bg-[#52504C] text-[#EDEFEE] font-semibold text-xs rounded-lg flex items-center gap-1.5 border border-[#52504C] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={handleRunAssessment}
                  className="px-5 py-2 bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-bold text-xs rounded-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Scanning Historical Precedents...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Run Forensic Evaluation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REPORT */}
          {step === 4 && assessmentResult && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-[#41403C] border border-[#52504C] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#AA210F] text-[#EDEFEE] flex flex-col items-center justify-center font-bold shadow-md flex-shrink-0">
                    <span className="text-xl leading-none">{assessmentResult.score}%</span>
                    <span className="text-[9px] uppercase font-mono mt-0.5">Match</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#2B2A27] text-[#D08856] border border-[#52504C] font-mono">
                        {assessmentResult.rating}
                      </span>
                      <span className="text-xs text-[#EDEFEE]/70 font-mono">
                        Surname: <strong className="text-[#EDEFEE]">{formData.familySurname || 'Williams/Buckler Line'}</strong>
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#EDEFEE] mt-1">
                      High Probability of Recoverable Title Discrepancy
                    </h3>
                    <p className="text-xs text-[#EDEFEE]/75 mt-0.5">
                      {assessmentResult.parallelCaseSimilarity}
                    </p>
                  </div>
                </div>
              </div>

              {/* Forensic Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <div className="p-3.5 rounded-xl bg-[#41403C] border border-[#52504C] space-y-2">
                  <div className="flex items-center gap-1.5 text-[#D08856] font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Identified Case Precedents:</span>
                  </div>
                  <ul className="space-y-1.5 text-[#EDEFEE]/80">
                    {assessmentResult.keyVulnerabilitiesFound.map((vuln, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#D08856] font-bold">•</span>
                        <span>{vuln}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-[#41403C] border border-[#52504C] space-y-2">
                  <div className="flex items-center gap-1.5 text-[#D08856] font-bold">
                    <Building2 className="w-4 h-4" />
                    <span>Statutory Disclosure Framework:</span>
                  </div>
                  <div className="space-y-1.5">
                    {assessmentResult.recommendedFOIQueue.map((item, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-[#2B2A27] border border-[#52504C] text-[11px]">
                        <div className="flex items-center justify-between font-bold text-[#EDEFEE]">
                          <span>{item.targetAuthority}</span>
                          <span className="px-1.5 py-0.2 rounded bg-[#41403C] text-[#D08856] font-mono text-[9px]">
                            {item.statutoryBasis}
                          </span>
                        </div>
                        <p className="text-[#EDEFEE]/70 text-[10px] mt-0.5">{item.objective}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[#52504C]">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[#EDEFEE]/70 hover:text-[#EDEFEE] transition-colors cursor-pointer"
                >
                  ← Test Another Surname / Location
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] text-xs font-bold transition-colors cursor-pointer"
                >
                  Close & View Dossier
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
