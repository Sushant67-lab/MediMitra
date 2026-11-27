import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  ShieldAlert, 
  Pill, 
  Home, 
  MapPin, 
  ArrowLeft, 
  Phone, 
  Stethoscope,
  Mail,
  Send,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
  Navigation,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { TriageAssessment, UserProfile, Doctor, OtcMedicine } from '../types/medical';
import { evaluateTriage, getLocalizedSymptomName } from '../data/medicalKnowledge';
import { ASSESSMENT_TRANSLATIONS } from '../data/assessmentTranslations';
import { getAppStrings } from '../data/appTranslations';
import { MediMitraLogo } from './MediMitraLogo';
import { generateAndDownloadPdf } from '../utils/reportPdfGenerator';
import { openGmailCompose, openNativeMailto } from '../utils/reportEmailGenerator';
import { 
  getCurrentBrowserCoordinates, 
  reverseGeocodeCoordinates, 
  fetchRealNearbyClinics 
} from '../services/realLocationDoctorService';
import { useLanguage } from '../context/LanguageContext';
import { DispenseModal } from './DispenseModal';
import { PaymentQrModal, getMedicinePrice } from './PaymentQrModal';
import { DispenseStatusTracker } from './DispenseStatusTracker';
import { Esp32HardwareGuideModal } from './Esp32HardwareGuideModal';
import { DispensingCommand, ServoConfig } from '../types/dispensing';
import { createDispensingCommand } from '../services/dispensingService';

interface TriageResultViewProps {
  assessment: TriageAssessment;
  currentProfile: UserProfile;
  onSaveRecord: (assessment: TriageAssessment) => void;
  onOpenDoctors: () => void;
  onStartNew: () => void;
  canAccessEsp32?: boolean;
  onRequestEsp32Access?: (onGranted: () => void) => void;
  isSaved: boolean;
}

export const TriageResultView: React.FC<TriageResultViewProps> = ({
  assessment,
  currentProfile,
  onSaveRecord,
  onOpenDoctors,
  onStartNew,
  canAccessEsp32 = false,
  onRequestEsp32Access,
  isSaved
}) => {
  const { t, language } = useLanguage();
  const ui = getAppStrings(language);

  const displayAssessment = useMemo(() => {
    if (assessment.triageContext && assessment.triageAnswers) {
      return evaluateTriage(assessment.triageContext, assessment.triageAnswers, language);
    }
    return assessment;
  }, [assessment, language]);

  const getEnglishAssessment = () => {
    if (assessment.triageContext && assessment.triageAnswers) {
      return evaluateTriage(assessment.triageContext, assessment.triageAnswers, 'en');
    }
    return assessment;
  };

  const localizedSymptomName = getLocalizedSymptomName(displayAssessment.primarySymptom, language);
  const isSevere = displayAssessment.severity === 'emergency' || displayAssessment.severity === 'severe';

  const localizedPatientName = currentProfile.name?.trim() || ui.patientWord;
  const localizedAgeCategory =
    currentProfile.ageCategory === 'child'
      ? ui.ageChild
      : currentProfile.ageCategory === 'senior'
        ? ui.ageSenior
        : ui.ageAdult;
  const localizedSex = currentProfile.sex === 'male' ? ui.sexMale : ui.sexFemale;

  const getLocalizedUnit = (otc: OtcMedicine) => {
    const lowerName = otc.name.toLowerCase();
    const u =
      otc.unitLabel ||
      (lowerName.includes('sachet')
        ? 'sachet'
        : lowerName.includes('powder') || lowerName.includes('lotion') || lowerName.includes('suspension') || lowerName.includes('spray')
          ? 'bottle'
          : lowerName.includes('ointment') || lowerName.includes('cream')
            ? 'tube'
            : lowerName.includes('strip') || lowerName.includes('lozenge')
              ? 'pack'
              : 'tablet');

    switch (u) {
      case 'sachet': return ui.unitSachet;
      case 'bottle': return ui.unitBottle;
      case 'tube': return ui.unitTube;
      case 'pack': return ui.unitPack;
      default: return ui.unitTablet;
    }
  };

  const getLocalizedSeverityLabel = () => {
    switch (displayAssessment.severity) {
      case 'emergency': return t.severityEmergency;
      case 'severe': return t.severitySevere;
      case 'moderate': return t.severityModerate;
      default: return t.severityMild;
    }
  };

  const triggerEsp32 = (action: () => void) => {
    if (onRequestEsp32Access) {
      onRequestEsp32Access(action);
    } else {
      action();
    }
  };

  // Email state
  const [recipientEmail, setRecipientEmail] = useState(currentProfile.email || '');

  useEffect(() => {
    if (currentProfile.email) {
      setRecipientEmail(currentProfile.email);
    }
  }, [currentProfile.email]);

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailDispatched, setEmailDispatched] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [showFullReportPreview, setShowFullReportPreview] = useState(false);

  // Real location & doctors state
  const [detectedPlaceName, setDetectedPlaceName] = useState<string | null>(null);
  const [realDoctors, setRealDoctors] = useState<Doctor[]>(displayAssessment.recommendedDoctors);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const [reportId] = useState(() => `MM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`);

  // IoT Dispenser & Payment States
  const [selectedMedicineForDispense, setSelectedMedicineForDispense] = useState<OtcMedicine | null>(null);
  const [isDispenseModalOpen, setIsDispenseModalOpen] = useState(false);
  const [isPaymentQrModalOpen, setIsPaymentQrModalOpen] = useState(false);
  const [isHardwareGuideOpen, setIsHardwareGuideOpen] = useState(false);
  const [activeDispenseCommand, setActiveDispenseCommand] = useState<DispensingCommand | null>(null);
  const [dispenseQuantity, setDispenseQuantity] = useState(1);
  const [configuredServoConfig, setConfiguredServoConfig] = useState<ServoConfig | undefined>(undefined);
  const [dispenseError, setDispenseError] = useState<string | null>(null);

  const handleProceedToPayment = (qty: number, sConf: ServoConfig) => {
    setDispenseError(null);
    setDispenseQuantity(qty);
    setConfiguredServoConfig(sConf);
    setIsPaymentQrModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentDetails: {
    transactionId: string;
    amount: number;
    paymentMethod: string;
    timestamp: string;
    command?: DispensingCommand | null;
  }) => {
    if (!selectedMedicineForDispense) return;
    setDispenseError(null);
    try {
      const command = paymentDetails.command
        ? paymentDetails.command
        : await createDispensingCommand({
            medicineName: selectedMedicineForDispense.name,
            quantity: dispenseQuantity,
            userId: currentProfile.id,
            userEmail: currentProfile.email,
            paymentTransactionId: paymentDetails.transactionId,
            paymentAmount: paymentDetails.amount,
            customServoConfig: configuredServoConfig
          });
      setActiveDispenseCommand(command);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    } catch (err: any) {
      setDispenseError(err?.message || 'Unable to authorize ESP32 dispense after payment verification.');
    } finally {
      setIsPaymentQrModalOpen(false);
    }
  };

  useEffect(() => {
    detectLocationAndDoctors();
  }, []);

  const detectLocationAndDoctors = async () => {
    setIsLoadingLocation(true);
    try {
      const coords = await getCurrentBrowserCoordinates();
      const geo = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);
      const placeLabel = [geo.locality, geo.city].filter(Boolean).join(', ');
      setDetectedPlaceName(placeLabel || null);

      const nearby = await fetchRealNearbyClinics(coords.latitude, coords.longitude);
      if (nearby.length > 0) {
        setRealDoctors(nearby);
      }
    } catch {
      setDetectedPlaceName(null);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    try {
      generateAndDownloadPdf(getEnglishAssessment(), currentProfile, reportId, recipientEmail);
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 4000);
    } catch {
      // Non-fatal PDF fallback
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleSendEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!recipientEmail.trim()) return;

    setIsSendingEmail(true);
    onSaveRecord(displayAssessment);

    const engAssessment = getEnglishAssessment();
    try {
      openGmailCompose(engAssessment, currentProfile, reportId, recipientEmail);
    } catch {
      openNativeMailto(engAssessment, currentProfile, reportId, recipientEmail);
    }

    setTimeout(() => {
      setIsSendingEmail(false);
      setEmailDispatched(true);
    }, 600);
  };

  const homeTips = ASSESSMENT_TRANSLATIONS[language]?.simpleTips || ASSESSMENT_TRANSLATIONS.en.simpleTips;

  const firstOtc = displayAssessment.recommendedOtcs[0];
  const firstOtcQty = firstOtc?.preferredQuantity || 1;
  const firstOtcTotal = firstOtc ? getMedicinePrice(firstOtc.name) * firstOtcQty : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-6 space-y-5"
    >
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onStartNew}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{ui.backToHome}</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-normal">
          <span>{ui.reportIdLabel}: <span className="font-mono text-slate-700 dark:text-slate-200 font-medium">{reportId}</span></span>
        </div>
      </div>

      {/* Main Medical Report Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8 transition-colors">
        {/* MediMitra Report Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <MediMitraLogo size="sm" showTagline />
          <div className="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-200 block">{ui.checkupCompleteBadge}</span>
            <span>{ui.dateLabel}: {displayAssessment.timestamp || ''}</span>
          </div>
        </div>

        {/* Patient Details Ribbon */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-300">
          <div>
            {ui.patientLabel}: <span className="font-semibold text-slate-900 dark:text-white">{localizedPatientName}</span> •{' '}
            <span>{localizedAgeCategory} ({currentProfile.age}{ui.yearsShort})</span> •{' '}
            <span>{localizedSex}</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            {ui.chiefComplaintLabel}: <span className="font-semibold text-teal-800 dark:text-teal-300">{localizedSymptomName}</span>
          </div>
        </div>

        {/* Check-up Status Indicator Banner */}
        <div className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
          isSevere 
            ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-950 dark:text-rose-100'
            : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
            isSevere ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
          }`}>
            {isSevere ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
              isSevere ? 'bg-rose-200 dark:bg-rose-900/70 text-rose-900 dark:text-rose-200' : 'bg-emerald-200 dark:bg-emerald-900/70 text-emerald-900 dark:text-emerald-200'
            }`}>
              {isSevere ? ui.severeBadge : ui.mildBadge}
            </span>
            <h1 className="text-lg sm:text-xl font-semibold mt-1 text-slate-900 dark:text-white">
              {isSevere ? ui.severeHeadline : ui.mildHeadline}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal mt-1 leading-relaxed">
              {isSevere ? ui.severeSubtext : ui.mildSubtext}
            </p>
          </div>
        </div>

        {/* Send Report to Email */}
        <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/35 border border-teal-200 dark:border-teal-800/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <h2 className="text-xs font-semibold text-teal-950 dark:text-teal-200 uppercase tracking-wide">
                {t.sendReportEmailTitle}
              </h2>
            </div>
            <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">{ui.digitalMedicalRecord}</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
            {currentProfile.email ? (
              <>
                {t.sendReportEmailSubtitle}:{' '}
                <strong className="text-teal-900 dark:text-teal-200 font-semibold">{currentProfile.email}</strong>.
              </>
            ) : (
              t.sendReportEmailSubtitle
            )}
          </p>

          <form onSubmit={handleSendEmail} className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <div className="relative flex-1 w-full">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder={ui.enterEmailPlaceholder}
                className="w-full pl-9 pr-3 py-2.5 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 dark:focus:border-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSendingEmail || !recipientEmail.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
            >
              {isSendingEmail ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t.sendingBtn}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.sendReportBtn}</span>
                </>
              )}
            </button>
          </form>

          {emailDispatched && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-xs flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">{ui.reportDispatchedTitle(recipientEmail)}</span>
                <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block">
                  {ui.reportDispatchedSub}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Dispense Authorization Error Banner */}
        {dispenseError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{dispenseError}</span>
          </div>
        )}

        {/* Live Dispensing Status Tracker */}
        {activeDispenseCommand && (
          <DispenseStatusTracker
            command={activeDispenseCommand}
            onDismiss={() => setActiveDispenseCommand(null)}
            onOpenHardwareGuide={
              canAccessEsp32
                ? () => triggerEsp32(() => setIsHardwareGuideOpen(true))
                : undefined
            }
          />
        )}

        {/* IF MILD: Recommend Real OTC Product */}
        {!isSevere && displayAssessment.recommendedOtcs.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Pill className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{ui.recommendedMedsAndDispenser}</h2>
              </div>

              {canAccessEsp32 && (
                <button
                  type="button"
                  onClick={() => triggerEsp32(() => setIsHardwareGuideOpen(true))}
                  className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{ui.esp32SchematicBtn}</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {displayAssessment.recommendedOtcs.map((otc, idx) => {
                const unitPrice = getMedicinePrice(otc.name);
                const preferredQty = otc.preferredQuantity || 1;
                const totalPrice = unitPrice * preferredQty;
                const unitLabel = getLocalizedUnit(otc);

                return (
                  <div 
                    key={idx}
                    className="p-5 rounded-2xl bg-teal-50/40 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/70 hover:border-teal-400 dark:hover:border-teal-600 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-base text-slate-900 dark:text-white">{otc.name}</span>
                          <span className="text-[10px] font-semibold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-md border border-transparent dark:border-teal-800">
                            {ui.verifiedOtcBadge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ui.categoryLabel}: {otc.category}</p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {preferredQty} {unitLabel} • ₹{totalPrice}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMedicineForDispense(otc);
                            setDispenseQuantity(preferredQty);
                            setIsDispenseModalOpen(true);
                          }}
                          className="sm:hidden px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Pill className="w-3.5 h-3.5" />
                          <span>{ui.dispenseShortBtn}</span>
                        </button>
                        <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {ui.dispenserSlot} #{idx + 1}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
                      <strong className="text-slate-900 dark:text-white">{ui.dosageGuideLabel}: </strong>{otc.dosageGuide}
                    </p>

                    {otc.childDosageNote && (
                      <p className="text-xs text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/70 font-normal">
                        <strong className="text-amber-950 dark:text-amber-100">{ui.pediatricNoteLabel}: </strong>{otc.childDosageNote}
                      </p>
                    )}

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                      <strong className="text-slate-700 dark:text-slate-200">{ui.safetyCautionLabel}: </strong>{otc.safetyCaution}
                    </p>

                    <div className="pt-3 border-t border-teal-200/60 dark:border-teal-800/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-teal-800 dark:text-teal-300 font-medium">
                        <Cpu className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>{ui.connectedEsp32Text}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMedicineForDispense(otc);
                          setDispenseQuantity(preferredQty);
                          setIsDispenseModalOpen(true);
                        }}
                        className="w-full sm:w-auto px-6 py-3.5 sm:py-2.5 rounded-2xl sm:rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-sm sm:text-xs flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg cursor-pointer ring-2 ring-teal-500/30"
                      >
                        <Pill className="w-4 h-4 shrink-0" />
                        <span>{ui.dispenseMedicineBtn} ({preferredQty} {unitLabel} • ₹{totalPrice})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Simple Home Care Measures */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-100">
                <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold">{ui.simpleHomeTipsTitle}:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 font-normal text-slate-600 dark:text-slate-300">
                {displayAssessment.homeRemedies.length > 0
                  ? displayAssessment.homeRemedies.slice(0, 3).map((rem, rIdx) => (
                      <li key={rIdx}>
                        <strong className="text-slate-800 dark:text-slate-100">{rem.title}:</strong> {rem.instructions}
                      </li>
                    ))
                  : homeTips.map((tip, tIdx) => <li key={tIdx}>{tip}</li>)}
              </ul>
            </div>
          </div>
        )}

        {/* Real Clinics and Doctors: ONLY shown when problem is severe */}
        {isSevere && (
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Stethoscope className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {ui.recommendedDoctorsVisitTitle}
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>
                      {ui.nearLabel}:{' '}
                      <strong className="text-slate-700 dark:text-slate-200">
                        {isLoadingLocation ? ui.detectingLocation : detectedPlaceName || ui.localDirectoryLabel}
                      </strong>
                    </span>
                    <button
                      onClick={detectLocationAndDoctors}
                      disabled={isLoadingLocation}
                      className="text-[11px] text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-medium ml-1 flex items-center gap-0.5 cursor-pointer"
                      title={ui.refreshGpsBtn}
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingLocation ? 'animate-spin' : ''}`} />
                      <span>{isLoadingLocation ? ui.locatingText : ui.refreshGpsShort}</span>
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={onOpenDoctors}
                className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
              >
                {ui.viewAllDoctorsMaps}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {realDoctors.slice(0, 2).map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-teal-400 dark:hover:border-teal-600 transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{doc.name}</h3>
                        <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">{doc.specialty}</p>
                      </div>
                      <span className="text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                        ★ {doc.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-1">{doc.hospital}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1 font-normal">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{doc.distanceKm} {ui.kmAway} • {doc.address}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-normal">{doc.nextAvailable}</span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${doc.hospital}, ${doc.address}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-medium text-xs flex items-center gap-1 transition-colors"
                      >
                        <Navigation className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                        <span>{ui.directionsBtn}</span>
                      </a>
                      <a
                        href={`tel:${doc.phone}`}
                        className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{ui.callBtn}</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Full Report Preview */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setShowFullReportPreview(!showFullReportPreview)}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{showFullReportPreview ? ui.hidePreviewBtn : ui.viewFullPreviewBtn}</span>
            </span>
            {showFullReportPreview ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          <AnimatePresence>
            {showFullReportPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-mono text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
                  <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-800 font-sans">
                    <span className="font-semibold text-slate-900 dark:text-white block text-sm">{ui.previewReportHeader}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{ui.previewCaseRef} #{reportId}</span>
                  </div>
                  <div><strong>{ui.patientLabel}:</strong> {localizedPatientName} ({localizedAgeCategory}, {currentProfile.age}{ui.yearsShort}, {localizedSex})</div>
                  <div><strong>{ui.previewEmailDispatched}:</strong> {recipientEmail || '-'}</div>
                  <div><strong>{ui.chiefComplaintLabel}:</strong> {localizedSymptomName}</div>
                  <div><strong>{ui.previewTriageLevel}:</strong> {getLocalizedSeverityLabel()}</div>
                  <div><strong>{ui.previewSummary}:</strong> {displayAssessment.clinicalSummary}</div>
                  <div><strong>{ui.previewRemedies}:</strong> {displayAssessment.recommendedOtcs.map(o => o.name).join(', ') || ui.previewPhysicianNeeded}</div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 font-sans">
                    {ui.previewDisclaimer}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingPdf ? ui.generatingPdf : pdfDownloaded ? ui.pdfDownloaded : t.downloadPdfBtn}</span>
            </button>

            <button
              onClick={() => onSaveRecord(displayAssessment)}
              className={`text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {isSaved ? ui.savedBtn : ui.saveSummaryBtn}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isSevere && (
              <button
                onClick={onOpenDoctors}
                className="px-4 py-2.5 rounded-xl border border-rose-600 dark:border-rose-500 text-rose-700 dark:text-rose-300 font-semibold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              >
                {t.nearestDoctors}
              </button>
            )}
            <button
              onClick={onStartNew}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              {t.startNewCheckupBtn}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Sticky Dispense Action Bar for Mobile Devices */}
      {!isSevere && firstOtc && !activeDispenseCommand && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-teal-200 dark:border-teal-800 px-4 py-3 shadow-2xl flex items-center justify-between gap-3">
          <div className="truncate">
            <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold uppercase tracking-wider block">{ui.recommendedShort}</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
              {firstOtc.name}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedMedicineForDispense(firstOtc);
              setDispenseQuantity(firstOtcQty);
              setIsDispenseModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
          >
            <Pill className="w-3.5 h-3.5" />
            <span>{ui.dispenseShortBtn} (₹{firstOtcTotal})</span>
          </button>
        </div>
      )}

      {/* Dispense Authorization Modal */}
      {selectedMedicineForDispense && (
        <DispenseModal
          isOpen={isDispenseModalOpen}
          onClose={() => setIsDispenseModalOpen(false)}
          medicine={selectedMedicineForDispense}
          patientProfile={currentProfile}
          onProceedToPayment={handleProceedToPayment}
        />
      )}

      {/* Payment Checkout Modal */}
      {selectedMedicineForDispense && (
        <PaymentQrModal
          isOpen={isPaymentQrModalOpen}
          onClose={() => setIsPaymentQrModalOpen(false)}
          medicine={selectedMedicineForDispense}
          quantity={dispenseQuantity}
          patientProfile={currentProfile}
          servoConfig={configuredServoConfig}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* ESP32 Hardware Wiring & Firmware Sketch Modal */}
      <Esp32HardwareGuideModal
        isOpen={isHardwareGuideOpen}
        onClose={() => setIsHardwareGuideOpen(false)}
      />
    </motion.div>
  );
};
