import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  ShieldAlert, 
  Search, 
  ArrowLeft, 
  Calendar,
  CheckCircle2,
  Navigation,
  Building2,
  ExternalLink,
  RefreshCw,
  Map as MapIcon
} from 'lucide-react';
import { NEARBY_DOCTORS } from '../data/medicalKnowledge';
import { Doctor } from '../types/medical';
import { 
  getCurrentBrowserCoordinates, 
  reverseGeocodeCoordinates, 
  fetchRealNearbyClinics 
} from '../services/realLocationDoctorService';
import { useLanguage } from '../context/LanguageContext';
import { getAppStrings } from '../data/appTranslations';

interface DoctorLocatorProps {
  onBack: () => void;
  preferredSpecialty?: string;
}

export const DoctorLocator: React.FC<DoctorLocatorProps> = ({
  onBack,
  preferredSpecialty
}) => {
  const { t, language } = useLanguage();
  const ui = getAppStrings(language);

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(preferredSpecialty || 'All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [doctorsList, setDoctorsList] = useState<Doctor[]>(NEARBY_DOCTORS);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(NEARBY_DOCTORS[0]);
  const [bookedDoctorId, setBookedDoctorId] = useState<string | null>(null);
  const [bookedToken, setBookedToken] = useState<number | null>(null);
  const [mapQueryType, setMapQueryType] = useState<'doctor' | 'all_clinics' | 'emergency'>('doctor');

  // Location state
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [detectedPlaceName, setDetectedPlaceName] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);
  const [showGpsHint, setShowGpsHint] = useState<boolean>(false);

  const specialties = [
    { id: 'All', label: ui.specAll },
    { id: 'General Physician', label: ui.specGp },
    { id: 'Pediatrician', label: ui.specPed },
    { id: 'Dermatologist', label: ui.specDerm },
    { id: 'ENT', label: ui.specEnt },
    { id: 'Emergency Medicine', label: ui.specEr }
  ];

  useEffect(() => {
    handleDetectLocation(true);
  }, []);

  const handleDetectLocation = async (silent = false) => {
    setIsLoadingLocation(true);
    setShowGpsHint(false);
    try {
      const coords = await getCurrentBrowserCoordinates();
      setUserCoords({ lat: coords.latitude, lon: coords.longitude });
      const geo = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);
      const placeString = [geo.locality, geo.city, geo.state].filter(Boolean).join(', ');
      setDetectedPlaceName(placeString || null);

      const realClinics = await fetchRealNearbyClinics(coords.latitude, coords.longitude);
      if (realClinics.length > 0) {
        setDoctorsList(realClinics);
        setSelectedDoctor(realClinics[0]);
      }
    } catch {
      setDetectedPlaceName(null);
      setDoctorsList(NEARBY_DOCTORS);
      setSelectedDoctor(NEARBY_DOCTORS[0]);
      if (!silent) {
        setShowGpsHint(true);
      }
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const filteredDoctors = doctorsList.filter((doc) => {
    const matchesSpecialty = 
      selectedSpecialty === 'All' || 
      (selectedSpecialty === 'Emergency Medicine'
        ? doc.emergency24x7
        : doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()));

    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      doc.name.toLowerCase().includes(q) ||
      doc.hospital.toLowerCase().includes(q) ||
      doc.specialty.toLowerCase().includes(q) ||
      doc.address.toLowerCase().includes(q);

    return matchesSpecialty && matchesSearch;
  });

  const handleBookToken = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setBookedDoctorId(doc.id);
    setBookedToken(Math.floor(100 + Math.random() * 900));
  };

  const getGoogleMapsUrl = () => {
    const lat = userCoords?.lat || selectedDoctor?.latitude || 22.7196;
    const lon = userCoords?.lon || selectedDoctor?.longitude || 75.8577;

    if (mapQueryType === 'emergency') {
      return `https://maps.google.com/maps?q=24+7+emergency+hospital+trauma+center+near+${lat},${lon}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    }
    if (mapQueryType === 'all_clinics' || !selectedDoctor) {
      return `https://maps.google.com/maps?q=clinics+and+doctors+near+${lat},${lon}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(`${selectedDoctor.hospital}, ${selectedDoctor.address}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const getDirectGoogleDirectionsUrl = (doc: Doctor) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${doc.hospital}, ${doc.address}`)}`;
  };

  const getFullGoogleMapsSearchUrl = () => {
    if (userCoords) {
      return `https://www.google.com/maps/search/clinics+and+doctors+near+me/@${userCoords.lat},${userCoords.lon},14z`;
    }
    return `https://www.google.com/maps/search/clinics+and+doctors+near+me`;
  };

  const displayLocation = isLoadingLocation
    ? ui.detectingLocation
    : detectedPlaceName || ui.localDirectoryLabel;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title={ui.backToHome}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {t.locatorHeading}
              </h1>
              <span className="text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t.currentLocationLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              {t.locatorSubtitle}
            </p>
          </div>
        </div>

        {/* Emergency SOS Banner */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs">
          <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 animate-pulse shrink-0" />
          <div>
            <span className="font-semibold block leading-tight">{t.emergencyTitle}</span>
            <span className="text-[11px] text-rose-700 dark:text-rose-300">{t.emergencySubtitle}</span>
          </div>
        </div>
      </div>

      {/* Live Location Ribbon */}
      <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/35 border border-teal-200/90 dark:border-teal-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-teal-800 dark:text-teal-300 tracking-wider block">
              {t.currentLocationLabel}
            </span>
            <span className="font-medium text-slate-900 dark:text-white text-xs">
              {displayLocation}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleDetectLocation(false)}
            disabled={isLoadingLocation}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-600 dark:text-teal-400 ${isLoadingLocation ? 'animate-spin' : ''}`} />
            <span>{isLoadingLocation ? ui.locatingText : ui.refreshGpsBtn}</span>
          </button>

          <a
            href={getFullGoogleMapsSearchUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{ui.googleMapsSearchBtn}</span>
          </a>
        </div>
      </div>

      {showGpsHint && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2">
          <span>{ui.gpsHintMessage}</span>
          <button
            onClick={() => handleDetectLocation(false)}
            className="font-semibold text-teal-700 dark:text-teal-400 underline cursor-pointer shrink-0"
          >
            {ui.retryGpsBtn}
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchClinicsPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 dark:focus:border-teal-500 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {specialties.map((spec) => (
            <button
              key={spec.id}
              onClick={() => setSelectedSpecialty(spec.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedSpecialty === spec.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {spec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 space-y-3.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{ui.verifiedClinicsCount} ({filteredDoctors.length})</span>
            <span className="text-teal-700 dark:text-teal-400 font-medium">{ui.sortedByDistance}</span>
          </div>

          <div className="space-y-3">
            {filteredDoctors.map((doc) => {
              const isSelected = selectedDoctor?.id === doc.id;
              const isBooked = bookedDoctorId === doc.id;

              return (
                <motion.div
                  key={doc.id}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setMapQueryType('doctor');
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-slate-900 ${
                    isSelected 
                      ? 'border-teal-500 shadow-md ring-1 ring-teal-500 bg-teal-50/20 dark:bg-teal-950/35' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-semibold text-sm shrink-0 shadow-xs ${
                        doc.emergency24x7 
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' 
                          : 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300'
                      }`}>
                        {doc.emergency24x7 ? <Building2 className="w-5 h-5" /> : (doc.name.charAt(4) || 'Dr')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{doc.name}</h3>
                          {doc.emergency24x7 && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-600 text-white">
                              {ui.er24x7Tab}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-teal-700 dark:text-teal-400 mt-0.5">
                          {doc.specialty}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 font-normal">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{doc.hospital} • {doc.address}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{doc.rating}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({doc.reviewsCount})</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mt-1">
                        {doc.distanceKm} {ui.kmAway}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-normal">
                      <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>{doc.nextAvailable}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{doc.fee}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={getDirectGoogleDirectionsUrl(doc)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-medium flex items-center gap-1 text-xs transition-colors"
                      >
                        <Navigation className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                        <span>{ui.directionsBtn}</span>
                      </a>

                      <a
                        href={`tel:${doc.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-1 text-xs transition-colors"
                      >
                        <Phone className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                        <span>{ui.callBtn}</span>
                      </a>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookToken(doc);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          isBooked
                            ? 'bg-emerald-600 text-white'
                            : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                        }`}
                      >
                        {isBooked ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{ui.reservedBtn}</span>
                          </>
                        ) : (
                          <>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{ui.bookTokenBtn}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Google Maps */}
        <div className="lg:col-span-6 space-y-4 sticky top-20">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <MapIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{ui.googleMapsLiveTitle}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMapQueryType('doctor')}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  mapQueryType === 'doctor'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {ui.selectedClinicTab}
              </button>
              <button
                onClick={() => setMapQueryType('all_clinics')}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  mapQueryType === 'all_clinics'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {ui.allNearbyTab}
              </button>
              <button
                onClick={() => setMapQueryType('emergency')}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  mapQueryType === 'emergency'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                }`}
              >
                {ui.er24x7Tab}
              </button>
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm relative h-96">
            <iframe
              title="Google Maps Clinic Locator"
              width="100%"
              height="100%"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={getGoogleMapsUrl()}
              className="w-full h-full border-0"
            />

            {selectedDoctor && (
              <div className="absolute top-3 left-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">
                    {ui.googleMapsTarget}
                  </span>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {selectedDoctor.hospital}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {selectedDoctor.address}
                  </p>
                </div>

                <a
                  href={getDirectGoogleDirectionsUrl(selectedDoctor)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors shrink-0"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{ui.navigateBtn}</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            )}
          </div>

          {selectedDoctor && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{selectedDoctor.name}</h4>
                  <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">{selectedDoctor.specialty}</p>
                </div>
                <a
                  href={`tel:${selectedDoctor.phone}`}
                  className="px-3 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold text-xs hover:bg-teal-100 dark:hover:bg-teal-900/60 flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                  <span>{selectedDoctor.phone}</span>
                </a>
              </div>

              <p className="text-slate-600 dark:text-slate-300 font-normal">
                <strong>{ui.addressLabel}:</strong> {selectedDoctor.address} ({selectedDoctor.distanceKm} {ui.kmFromLocation})
              </p>

              {bookedDoctorId === selectedDoctor.id && bookedToken && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-medium text-[11px]">
                    #MM-{bookedToken} • {ui.tokenConfirmedMsg}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
