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
  LocateFixed,
  RefreshCw,
  Compass,
  Map as MapIcon
} from 'lucide-react';
import { NEARBY_DOCTORS } from '../data/medicalKnowledge';
import { Doctor } from '../types/medical';
import { MediMitraLogo } from './MediMitraLogo';
import { 
  getCurrentBrowserCoordinates, 
  reverseGeocodeCoordinates, 
  fetchRealNearbyClinics,
  generateRealCityClinics 
} from '../services/realLocationDoctorService';
import { useLanguage } from '../context/LanguageContext';

interface DoctorLocatorProps {
  onBack: () => void;
  preferredSpecialty?: string;
}

export const DoctorLocator: React.FC<DoctorLocatorProps> = ({
  onBack,
  preferredSpecialty
}) => {
  const { t } = useLanguage();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(preferredSpecialty || 'All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [doctorsList, setDoctorsList] = useState<Doctor[]>(NEARBY_DOCTORS);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(NEARBY_DOCTORS[0]);
  const [bookedDoctorId, setBookedDoctorId] = useState<string | null>(null);
  const [mapQueryType, setMapQueryType] = useState<'doctor' | 'all_clinics' | 'emergency'>('doctor');

  // Location state
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('Detecting live location...');
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const specialties = ['All', 'General Physician', 'Pediatrician', 'Dermatologist', 'ENT', 'Emergency Medicine'];

  // Automatically request user location on mount
  useEffect(() => {
    handleDetectLocation();
  }, []);

  const handleDetectLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    try {
      const coords = await getCurrentBrowserCoordinates();
      setUserCoords({ lat: coords.latitude, lon: coords.longitude });
      const geo = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);
      const placeString = [geo.locality, geo.city, geo.state].filter(Boolean).join(', ') || 'Your Current Location';
      setLocationName(placeString);

      // Fetch real clinics near these coordinates
      const realClinics = await fetchRealNearbyClinics(coords.latitude, coords.longitude);
      if (realClinics.length > 0) {
        setDoctorsList(realClinics);
        setSelectedDoctor(realClinics[0]);
      }
    } catch (err: any) {
      console.warn('Geolocation detection error:', err);
      setLocationError('Location permission needed. Click "Enable GPS" or search your city.');
      setLocationName('Default Medical Center Area');
      setDoctorsList(NEARBY_DOCTORS);
      setSelectedDoctor(NEARBY_DOCTORS[0]);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const filteredDoctors = doctorsList.filter((doc) => {
    const matchesSpecialty = 
      selectedSpecialty === 'All' || 
      (selectedSpecialty === 'Emergency Medicine' ? doc.emergency24x7 : doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()));

    const matchesSearch = 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSpecialty && matchesSearch;
  });

  const handleBookToken = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setBookedDoctorId(doc.id);
  };

  // Live Google Maps Embed URL
  const getGoogleMapsUrl = () => {
    const lat = userCoords?.lat || (selectedDoctor?.latitude || 22.7196);
    const lon = userCoords?.lon || (selectedDoctor?.longitude || 75.8577);

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                {t.locatorHeading}
              </h1>
              <span className="text-[10px] font-medium bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t.currentLocationLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal">
              {t.locatorSubtitle}
            </p>
          </div>
        </div>

        {/* Emergency SOS Banner */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
          <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse shrink-0" />
          <div>
            <span className="font-semibold block leading-tight">{t.emergencyTitle}</span>
            <span className="text-[11px] text-rose-700">{t.emergencySubtitle}</span>
          </div>
        </div>
      </div>

      {/* Live Location Ribbon */}
      <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-teal-800 tracking-wider block">
              {t.currentLocationLabel}
            </span>
            <span className="font-medium text-slate-900 text-xs">
              {locationName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDetectLocation}
            disabled={isLoadingLocation}
            className="px-3 py-1.5 rounded-xl bg-white border border-teal-300 hover:bg-teal-50 text-teal-800 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isLoadingLocation ? 'animate-spin' : ''}`} />
            <span>{isLoadingLocation ? 'Locating...' : 'Refresh GPS Location'}</span>
          </button>

          <a
            href={getFullGoogleMapsSearchUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Google Maps Search</span>
          </a>
        </div>
      </div>

      {locationError && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
          <span>{locationError}</span>
          <button
            onClick={handleDetectLocation}
            className="font-semibold text-teal-700 underline cursor-pointer"
          >
            Retry GPS
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor, clinic name, or street..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50/50 text-slate-900"
          />
        </div>

        {/* Specialty Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedSpecialty === spec
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Doctors List on Left, Live Google Maps on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Doctor Cards List */}
        <div className="lg:col-span-6 space-y-3.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Verified Clinics & Doctors ({filteredDoctors.length})</span>
            <span className="text-teal-700 font-medium">Sorted by live distance</span>
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
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                    isSelected 
                      ? 'border-teal-500 shadow-md ring-1 ring-teal-500 bg-teal-50/20' 
                      : 'border-slate-200 hover:border-teal-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-semibold text-sm shrink-0 shadow-xs ${
                        doc.emergency24x7 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-teal-100 text-teal-800'
                      }`}>
                        {doc.emergency24x7 ? <Building2 className="w-5 h-5" /> : (doc.name.charAt(4) || 'Dr')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-slate-900">{doc.name}</h3>
                          {doc.emergency24x7 && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-600 text-white">
                              24x7 ER
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-teal-700 mt-0.5">
                          {doc.specialty}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 font-normal">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{doc.hospital} • {doc.address}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{doc.rating}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({doc.reviewsCount})</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 block mt-1">
                        {doc.distanceKm} km away
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-500 font-normal">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>{doc.nextAvailable}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-700">{doc.fee}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={getDirectGoogleDirectionsUrl(doc)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-50 text-teal-700 font-medium flex items-center gap-1 text-xs transition-colors"
                        title="Open directions in Google Maps"
                      >
                        <Navigation className="w-3 h-3 text-teal-600" />
                        <span>Directions</span>
                      </a>

                      <a
                        href={`tel:${doc.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-1 text-xs transition-colors"
                      >
                        <Phone className="w-3 h-3 text-teal-600" />
                        <span>Call</span>
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
                            <span>Reserved ✓</span>
                          </>
                        ) : (
                          <>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Book Token</span>
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

        {/* Right Column: Real Google Maps Integration */}
        <div className="lg:col-span-6 space-y-4 sticky top-20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapIcon className="w-3.5 h-3.5 text-teal-600" />
              <span>Google Maps Live Locator</span>
            </span>

            {/* Quick Map Presets */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMapQueryType('doctor')}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  mapQueryType === 'doctor'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Selected Clinic
              </button>
              <button
                onClick={() => setMapQueryType('all_clinics')}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  mapQueryType === 'all_clinics'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Nearby
              </button>
              <button
                onClick={() => setMapQueryType('emergency')}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  mapQueryType === 'emergency'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                24x7 ER
              </button>
            </div>
          </div>

          {/* Real Google Maps Embedded Iframe */}
          <div className="bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative h-96">
            <iframe
              title="Google Maps Doctor & Clinic Locator"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={getGoogleMapsUrl()}
              className="w-full h-full"
            />

            {/* Floating Quick Action Overlay */}
            {selectedDoctor && (
              <div className="absolute top-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-md flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider block">
                    Google Maps Target
                  </span>
                  <h4 className="text-xs font-semibold text-slate-900 truncate">
                    {selectedDoctor.hospital}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
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
                  <span>Navigate</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            )}
          </div>

          {/* Selected Doctor Summary Card */}
          {selectedDoctor && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2 text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-slate-900">{selectedDoctor.name}</h4>
                  <p className="text-xs text-teal-700 font-medium">{selectedDoctor.specialty}</p>
                </div>
                <a
                  href={`tel:${selectedDoctor.phone}`}
                  className="px-3 py-1 rounded-lg bg-teal-50 text-teal-800 font-semibold text-xs hover:bg-teal-100 flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-teal-600" />
                  <span>{selectedDoctor.phone}</span>
                </a>
              </div>

              <p className="text-slate-600 font-normal">
                <strong>Address:</strong> {selectedDoctor.address} ({selectedDoctor.distanceKm} km from your location)
              </p>

              {bookedDoctorId === selectedDoctor.id && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-[11px]">
                    Consultation token #MM-{Math.floor(100 + Math.random() * 900)} confirmed.
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
