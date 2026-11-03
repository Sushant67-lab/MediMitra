import React, { useState, useEffect } from 'react';
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
  Clock,
  ChevronDown,
  ChevronUp,
  Navigation,
  ExternalLink,
  LocateFixed,
  RefreshCw
} from 'lucide-react';
import { TriageAssessment, UserProfile, Doctor } from '../types/medical';
import { COMMON_SYMPTOMS } from '../data/medicalKnowledge';
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
import { OtcMedicine } from '../types/medical';
import { DispensingCommand, ServoConfig } from '../types/dispensing';
import { createDispensingCommand } from '../services/dispensingService';
import { Cpu, QrCode } from 'lucide-react';

interface TriageResultViewProps {
  assessment: TriageAssessment;
  currentProfile: UserProfile;
  onSaveRecord: (assessment: TriageAssessment) => void;
  onOpenDoctors: () => void;
  onStartNew: () => void;
  isSaved: boolean;
}

export const TriageResultView: React.FC<TriageResultViewProps> = ({
  assessment,
  currentProfile,
  onSaveRecord,
  onOpenDoctors,
  onStartNew,
  isSaved
}) => {
  const { t } = useLanguage();
  const symptomInfo = COMMON_SYMPTOMS.find(s => s.id === assessment.primarySymptom) || COMMON_SYMPTOMS[0];
  const isSevere = assessment.severity === 'emergency' || assessment.severity === 'severe';

  // Email state - uses the exact email provided during sign in / sign up
  const [recipientEmail, setRecipientEmail] = useState(currentProfile.email || '');

  // Keep synced if profile updates
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
  const [userLocationName, setUserLocationName] = useState<string>('Detecting location...');
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [realDoctors, setRealDoctors] = useState<Doctor[]>(assessment.recommendedDoctors);
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

  const handleProceedToPayment = (qty: number, sConf: ServoConfig) => {
    setDispenseQuantity(qty);
    setConfiguredServoConfig(sConf);
    setIsPaymentQrModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    if (!selectedMedicineForDispense) return;
    try {
      const command = await createDispensingCommand({
        medicineName: selectedMedicineForDispense.name,
        quantity: dispenseQuantity,
        userId: currentProfile.id,
        userEmail: currentProfile.email,
        customServoConfig: configuredServoConfig
      });
      setActiveDispenseCommand(command);
      setIsPaymentQrModalOpen(false);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to create command after payment:', err);
    }
  };

  // Detect user's real location and fetch real nearby clinics/doctors
  useEffect(() => {
    detectLocationAndDoctors();
  }, []);

  const detectLocationAndDoctors = async () => {
    setIsLoadingLocation(true);
    try {
      const coords = await getCurrentBrowserCoordinates();
      setUserCoordinates({ lat: coords.latitude, lon: coords.longitude });
      const geo = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);
      const placeLabel = [geo.locality, geo.city].filter(Boolean).join(', ') || 'Your Area';
      setUserLocationName(placeLabel);

      // Fetch real clinics near these coordinates
      const nearby = await fetchRealNearbyClinics(coords.latitude, coords.longitude);
      if (nearby.length > 0) {
        setRealDoctors(nearby);
      }
    } catch {
      setUserLocationName('Nearby Clinics (Select to Enable GPS)');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Handle PDF Generation & Download
  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    try {
      generateAndDownloadPdf(assessment, currentProfile, reportId, recipientEmail);
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 4000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Handle sending email to user's provided email address
  const handleSendEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!recipientEmail.trim()) return;

    setIsSendingEmail(true);

    // Save assessment to user medical records
    onSaveRecord(assessment);

    // Dispatch report to user's email client
    try {
      openGmailCompose(assessment, currentProfile, reportId, recipientEmail);
    } catch {
      openNativeMailto(assessment, currentProfile, reportId, recipientEmail);
    }

    setTimeout(() => {
      setIsSendingEmail(false);
      setEmailDispatched(true);
    }, 600);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5"
    >
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onStartNew}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-teal-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-normal">
          <span>Report ID: <span className="font-mono text-slate-700 font-medium">{reportId}</span></span>
        </div>
      </div>

      {/* Main Medical Report Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
        {/* MediMitra Report Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <MediMitraLogo size="sm" showTagline />
          <div className="text-left sm:text-right text-xs text-slate-500">
            <span className="font-medium text-slate-700 block">Check-up Complete • Medical Report</span>
            <span>Date: {assessment.timestamp || 'Today'}</span>
          </div>
        </div>

        {/* Patient Details Ribbon */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
          <div>
            Patient: <span className="font-semibold text-slate-900">{currentProfile.name}</span> •{' '}
            <span className="capitalize">{currentProfile.ageCategory} ({currentProfile.age}y)</span> •{' '}
            <span className="capitalize">{currentProfile.sex}</span>
          </div>
          <div className="text-slate-600">
            Chief Complaint: <span className="font-semibold text-teal-800">{symptomInfo.name}</span>
          </div>
        </div>

        {/* Check-up Status Indicator Banner */}
        <div className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
          isSevere 
            ? 'bg-rose-50/70 border-rose-200 text-rose-950'
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
            isSevere ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
          }`}>
            {isSevere ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
              isSevere ? 'bg-rose-200 text-rose-900' : 'bg-emerald-200 text-emerald-900'
            }`}>
              {isSevere ? 'Severe Problem • Doctor Visit Required' : 'Basic Problem • Home Treatment Safe'}
            </span>
            <h1 className="text-lg sm:text-xl font-semibold mt-1 text-slate-900">
              {isSevere 
                ? 'This problem is serious and cannot be treated with basic medicine alone.' 
                : 'This is a basic health problem and can be treated with simple medicine.'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-normal mt-1 leading-relaxed">
              {isSevere 
                ? 'Your answers indicate severe pain or warning signs. Please consult a nearby doctor or clinic today.' 
                : 'Your symptoms appear mild and safe for home relief. Follow the recommended medicine guidelines below.'}
            </p>
          </div>
        </div>

        {/* Simple & Clean: Send Report to Your Email */}
        <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-700" />
              <h2 className="text-xs font-semibold text-teal-950 uppercase tracking-wide">
                {t.sendReportEmailTitle}
              </h2>
            </div>
            <span className="text-[11px] text-teal-700 font-medium">Digital Medical Record</span>
          </div>

          <p className="text-xs text-slate-600 font-normal">
            {currentProfile.email ? (
              <>
                {t.sendReportEmailSubtitle}:{' '}
                <strong className="text-teal-900 font-semibold">{currentProfile.email}</strong>.
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
                placeholder="Enter your email address (e.g. user@gmail.com)"
                className="w-full pl-9 pr-3 py-2.5 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white text-slate-900"
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

          {/* Email Sent Status Banner */}
          {emailDispatched && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-950 text-xs flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">Report dispatched to {recipientEmail}!</span>
                <span className="text-[11px] text-emerald-800 block">
                  Your medical check-up summary has been sent. You can also download the official PDF copy below.
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Live Dispensing Status Tracker (when command active) */}
        {activeDispenseCommand && (
          <DispenseStatusTracker
            command={activeDispenseCommand}
            onDismiss={() => setActiveDispenseCommand(null)}
            onOpenHardwareGuide={() => setIsHardwareGuideOpen(true)}
          />
        )}

        {/* IF MILD: Recommend Basic Medicine */}
        {!isSevere && assessment.recommendedOtcs.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-800">
                <Pill className="w-4 h-4 text-teal-600" />
                <h2 className="text-sm font-semibold text-slate-900">Recommended Basic Medicine & IoT Dispenser</h2>
              </div>

              <button
                type="button"
                onClick={() => setIsHardwareGuideOpen(true)}
                className="text-xs font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5 text-teal-600" />
                <span>ESP32 Hardware Schematic & Code</span>
              </button>
            </div>

            <div className="space-y-3">
              {assessment.recommendedOtcs.map((otc, idx) => {
                const price = getMedicinePrice(otc.name);
                return (
                  <div 
                    key={idx}
                    className="p-5 rounded-2xl bg-teal-50/40 border border-teal-200/70 hover:border-teal-400 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-slate-900">{otc.name}</span>
                          <span className="text-[10px] font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">
                            OTC Relief
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Category: {otc.category || 'General Health'}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ₹{price} / tablet
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMedicineForDispense(otc);
                            setDispenseQuantity(1);
                            setIsDispenseModalOpen(true);
                          }}
                          className="sm:hidden px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Pill className="w-3.5 h-3.5" />
                          <span>Dispense</span>
                        </button>
                        <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500">
                          Dispenser Slot #{idx + 1}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 font-normal leading-relaxed">
                      <strong className="text-slate-900">Dosage Guide: </strong>{otc.dosageGuide}
                    </p>

                    {otc.childDosageNote && (
                      <p className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-normal">
                        <strong className="text-amber-950">Pediatric Note: </strong>{otc.childDosageNote}
                      </p>
                    )}

                    <p className="text-[11px] text-slate-500 font-normal">
                      <strong className="text-slate-700">Safety Caution: </strong>{otc.safetyCaution}
                    </p>

                    {/* Dispense Action Strip - Ultra Visible on Mobile & Desktop */}
                    <div className="pt-3 border-t border-teal-200/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-teal-800 font-medium">
                        <Cpu className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>Connected to ESP32 Dispenser Unit (SG90 Servo GPIO 18)</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMedicineForDispense(otc);
                          setDispenseQuantity(1);
                          setIsDispenseModalOpen(true);
                        }}
                        className="w-full sm:w-auto px-6 py-3.5 sm:py-2.5 rounded-2xl sm:rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-sm sm:text-xs flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg cursor-pointer ring-2 ring-teal-500/30"
                      >
                        <Pill className="w-4 h-4 shrink-0" />
                        <span>DISPENSE MEDICINE (₹{price})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Simple Home Care Measures */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-medium text-slate-800">
                <Home className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">Simple Home Tips:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 font-normal text-slate-600">
                <li>Drink plenty of warm water and clear fluids to stay hydrated.</li>
                <li>Ensure adequate rest and avoid heavy screen time or physical strain.</li>
                <li>If symptoms do not improve within 48 hours, consult a physician.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Real Clinics and Doctors: ONLY shown when problem is big/severe (NO medicine dispensed) */}
        {isSevere && (
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-800">
                <Stethoscope className="w-4 h-4 text-rose-600" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Recommended Doctors & Clinics to Visit
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Near: <strong className="text-slate-700">{userLocationName}</strong></span>
                    <button
                      onClick={detectLocationAndDoctors}
                      disabled={isLoadingLocation}
                      className="text-[11px] text-teal-600 hover:text-teal-800 font-medium ml-1 flex items-center gap-0.5 cursor-pointer"
                      title="Update current location"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingLocation ? 'animate-spin' : ''}`} />
                      <span>{isLoadingLocation ? 'Locating...' : 'Refresh GPS'}</span>
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={onOpenDoctors}
                className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
              >
                View All Doctors on Google Maps →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {realDoctors.slice(0, 2).map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-400 transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900">{doc.name}</h3>
                        <p className="text-xs text-teal-700 font-medium">{doc.specialty}</p>
                      </div>
                      <span className="text-[11px] font-medium bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                        ★ {doc.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-normal mt-1">{doc.hospital}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 font-normal">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{doc.distanceKm} km away • {doc.address}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-600 font-normal">{doc.nextAvailable}</span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${doc.hospital}, ${doc.address}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl border border-teal-200 hover:bg-teal-50 text-teal-700 font-medium text-xs flex items-center gap-1 transition-colors"
                        title="Open Google Maps directions"
                      >
                        <Navigation className="w-3 h-3 text-teal-600" />
                        <span>Directions</span>
                      </a>
                      <a
                        href={`tel:${doc.phone}`}
                        className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Full Report Preview */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => setShowFullReportPreview(!showFullReportPreview)}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>{showFullReportPreview ? 'Hide Detailed Clinical Report Preview' : 'View Full Formatted Report Document'}</span>
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
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 font-mono text-xs text-slate-700 space-y-2 leading-relaxed">
                  <div className="text-center pb-2 border-b border-slate-200 font-sans">
                    <span className="font-semibold text-slate-900 block text-sm">MEDIMITRA DIGITAL HEALTHCARE REPORT</span>
                    <span className="text-[10px] text-slate-500">Case Reference #{reportId} • Generated via MediMitra Clinical Engine</span>
                  </div>
                  <div><strong>Patient:</strong> {currentProfile.name} ({currentProfile.ageCategory}, {currentProfile.age}y, {currentProfile.sex})</div>
                  <div><strong>Email Dispatched:</strong> {recipientEmail}</div>
                  <div><strong>Chief Symptom:</strong> {symptomInfo.name}</div>
                  <div><strong>Clinical Triage Level:</strong> {assessment.severity.toUpperCase()}</div>
                  <div><strong>Assessment Summary:</strong> {assessment.clinicalSummary}</div>
                  <div><strong>Recommended Remedies:</strong> {assessment.recommendedOtcs.map(o => o.name).join(', ') || 'Physician consultation required'}</div>
                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-sans">
                    * Disclaimer: This digital summary was generated for informational health guidance. Not a substitute for emergency medicine.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Actions - PDF Download & Navigation */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Real PDF Download Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingPdf ? 'Generating PDF...' : pdfDownloaded ? 'PDF Downloaded ✓' : t.downloadPdfBtn}</span>
            </button>

            <button
              onClick={() => onSaveRecord(assessment)}
              className={`text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {isSaved ? 'Saved ✓' : 'Save Summary'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isSevere && (
              <button
                onClick={onOpenDoctors}
                className="px-4 py-2.5 rounded-xl border border-rose-600 text-rose-700 font-semibold text-xs hover:bg-rose-50 transition-colors cursor-pointer"
              >
                {t.nearestDoctors}
              </button>
            )}
            <button
              onClick={onStartNew}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              {t.startNewCheckupBtn}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Sticky Dispense Action Bar for Mobile Devices */}
      {!isSevere && assessment.recommendedOtcs.length > 0 && !activeDispenseCommand && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-teal-200 px-4 py-3 shadow-2xl flex items-center justify-between gap-3">
          <div className="truncate">
            <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider block">Recommended</span>
            <span className="text-xs font-bold text-slate-900 truncate block">
              {assessment.recommendedOtcs[0].name}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedMedicineForDispense(assessment.recommendedOtcs[0]);
              setDispenseQuantity(1);
              setIsDispenseModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
          >
            <Pill className="w-3.5 h-3.5" />
            <span>DISPENSE (₹{getMedicinePrice(assessment.recommendedOtcs[0].name)})</span>
          </button>
        </div>
      )}

      {/* Dispense Authorization & Clinical Verification Modal */}
      {selectedMedicineForDispense && (
        <DispenseModal
          isOpen={isDispenseModalOpen}
          onClose={() => setIsDispenseModalOpen(false)}
          medicine={selectedMedicineForDispense}
          patientProfile={currentProfile}
          onProceedToPayment={handleProceedToPayment}
          onOpenHardwareGuide={() => setIsHardwareGuideOpen(true)}
        />
      )}

      {/* Payment QR Code Modal */}
      {selectedMedicineForDispense && (
        <PaymentQrModal
          isOpen={isPaymentQrModalOpen}
          onClose={() => setIsPaymentQrModalOpen(false)}
          medicine={selectedMedicineForDispense}
          quantity={dispenseQuantity}
          patientProfile={currentProfile}
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
