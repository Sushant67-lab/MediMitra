import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight,
  MapPin,
  Stethoscope,
  Pill,
  Navigation,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';
import { SymptomCategory, UserProfile } from '../types/medical';
import { MediMitraLogo } from './MediMitraLogo';

interface FrontPageProps {
  currentProfile: UserProfile;
  onStartTriage: (symptom: SymptomCategory, userCustomNote?: string) => void;
  onOpenDoctors: () => void;
}

interface SimpleProblem {
  id: SymptomCategory;
  title: string;
  subTitle: string;
  emoji: string;
  color: string;
  badgeBg: string;
}

const PRIMARY_PROBLEMS: SimpleProblem[] = [
  {
    id: 'headache',
    title: 'Headache',
    subTitle: 'Sar dard, throbbing forehead, tension, or migraine',
    emoji: '🤕',
    color: 'hover:border-purple-300 hover:bg-purple-50/50',
    badgeBg: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'fever',
    title: 'Fever (Bukhar)',
    subTitle: 'Hot body, chills, sweating, or general sickness',
    emoji: '🌡️',
    color: 'hover:border-orange-300 hover:bg-orange-50/50',
    badgeBg: 'bg-orange-100 text-orange-800'
  },
  {
    id: 'skin_rash',
    title: 'Rashes Problem',
    subTitle: 'Skin itching, red patches, bumps, or allergy',
    emoji: '🌸',
    color: 'hover:border-rose-300 hover:bg-rose-50/50',
    badgeBg: 'bg-rose-100 text-rose-800'
  },
  {
    id: 'cold_sneezing',
    title: 'Cough & Cold',
    subTitle: 'Khansi, continuous sneezing, or runny nose',
    emoji: '🤧',
    color: 'hover:border-teal-300 hover:bg-teal-50/50',
    badgeBg: 'bg-teal-100 text-teal-800'
  },
  {
    id: 'stomach_upset',
    title: 'Stomach Ache',
    subTitle: 'Pet dard, cramps, gas, acidity, or nausea',
    emoji: '🤢',
    color: 'hover:border-amber-300 hover:bg-amber-50/50',
    badgeBg: 'bg-amber-100 text-amber-800'
  },
  {
    id: 'small_cuts',
    title: 'Small Cut Problem',
    subTitle: 'Chhoti chot, kitchen scrape, or minor bleeding',
    emoji: '🩹',
    color: 'hover:border-sky-300 hover:bg-sky-50/50',
    badgeBg: 'bg-sky-100 text-sky-800'
  },
  {
    id: 'body_ache',
    title: 'General Illness',
    subTitle: 'Badan dard, body weakness, or exhaustion',
    emoji: '🤒',
    color: 'hover:border-emerald-300 hover:bg-emerald-50/50',
    badgeBg: 'bg-emerald-100 text-emerald-800'
  }
];

export const FrontPage: React.FC<FrontPageProps> = ({
  currentProfile,
  onStartTriage,
  onOpenDoctors
}) => {
  const [customComplaint, setCustomComplaint] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customComplaint.trim()) return;

    const text = customComplaint.toLowerCase();
    let detected: SymptomCategory = 'fever';

    if (text.includes('head') || text.includes('sar')) {
      detected = 'headache';
    } else if (text.includes('rash') || text.includes('itch') || text.includes('khujli') || text.includes('skin')) {
      detected = 'skin_rash';
    } else if (text.includes('cough') || text.includes('cold') || text.includes('sneeze') || text.includes('zukam') || text.includes('khansi')) {
      detected = 'cold_sneezing';
    } else if (text.includes('stomach') || text.includes('pet') || text.includes('gas') || text.includes('vomit') || text.includes('loose')) {
      detected = 'stomach_upset';
    } else if (text.includes('cut') || text.includes('bleed') || text.includes('wound') || text.includes('chot')) {
      detected = 'small_cuts';
    } else if (text.includes('fever') || text.includes('bukhar') || text.includes('hot')) {
      detected = 'fever';
    } else {
      detected = 'body_ache';
    }

    onStartTriage(detected, customComplaint.trim());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10 sm:space-y-12">
      {/* Friendly Hero Greeting with MediMitra Emblem */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-3"
      >
        <div className="flex justify-center mb-1">
          <MediMitraLogo size="md" showTagline />
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
          How are you feeling today, {currentProfile.name ? currentProfile.name.split(' ')[0] : 'there'}?
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-normal max-w-lg mx-auto leading-relaxed">
          Select what problem you are facing below, or type your symptom. MediMitra will guide you through 10 simple questions and recommend safe medicine or the nearest doctor on Google Maps.
        </p>
      </motion.div>

      {/* Spacious Input Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <form onSubmit={handleCustomSubmit} className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={customComplaint}
            onChange={(e) => setCustomComplaint(e.target.value)}
            placeholder="Type your problem in simple words (e.g. headache since morning, bukhar)..."
            className="w-full pl-5 pr-28 py-4 text-sm font-normal rounded-2xl border border-slate-300 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!customComplaint.trim()}
            className={`absolute right-2.5 top-2.5 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              customComplaint.trim()
                ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-xs'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Ask</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </motion.div>

      {/* Primary Health Problems Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Select Your Problem
          </span>
          <span className="text-xs text-slate-400 font-normal">Tap any category to start</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {PRIMARY_PROBLEMS.map((prob) => (
            <motion.div
              key={prob.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              onClick={() => onStartTriage(prob.id)}
              className={`p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all cursor-pointer flex items-center justify-between ${prob.color}`}
            >
              <div className="flex items-center gap-3.5">
                <span className="text-3xl p-1">{prob.emoji}</span>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-slate-900">
                    {prob.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-normal mt-0.5 line-clamp-1">
                    {prob.subTitle}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How MediMitra Works in 3 Simple Steps (Elongated Content) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/90 space-y-4"
      >
        <div className="text-center space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
            Simple 3-Step Health Guidance
          </span>
          <h2 className="text-base font-semibold text-slate-900">How MediMitra Helps You</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-semibold text-xs">
              1
            </div>
            <h3 className="font-semibold text-xs text-slate-900">Choose Problem</h3>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Select or type what you are feeling (headache, fever, rashes, cough, cuts, stomach ache).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-xs">
              2
            </div>
            <h3 className="font-semibold text-xs text-slate-900">10-Question Chat</h3>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              MediMitra asks 10 sequential, adaptive questions tailored to your age and gender.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-semibold text-xs">
              3
            </div>
            <h3 className="font-semibold text-xs text-slate-900">Medicine & Maps Referral</h3>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Get safe basic medicine dosage if mild, or navigate to nearby doctors on Google Maps if serious.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Google Maps Doctor Locator Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-teal-800 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md"
      >
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <MapPin className="w-4 h-4 text-teal-400" />
            <span className="font-semibold text-sm text-white">Google Maps Clinic & Doctor Locator</span>
          </div>
          <p className="text-xs text-teal-100/90 font-normal max-w-lg">
            View live clinics, pediatric centers, and 24x7 emergency trauma hospitals near you with turn-by-turn directions.
          </p>
        </div>
        <button
          onClick={onOpenDoctors}
          className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Open Google Maps</span>
        </button>
      </motion.div>
    </div>
  );
};
