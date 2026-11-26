import { 
  SymptomCategory, 
  SymptomInfo, 
  OtcMedicine, 
  HomeRemedy,
  Doctor, 
  TriageAssessment, 
  SeverityLevel,
  QuestionContext
} from '../types/medical';
import { LanguageCode } from '../context/LanguageContext';
import { QUESTION_TRANSLATIONS, QuestionId, SYMPTOM_NAMES_BY_LANG } from './triageTranslations';
import { ASSESSMENT_TRANSLATIONS, toOtcMedicine } from './assessmentTranslations';

export function getLocalizedSymptomName(symptom: SymptomCategory, lang: LanguageCode = 'en'): string {
  return SYMPTOM_NAMES_BY_LANG[lang]?.[symptom] || SYMPTOM_NAMES_BY_LANG.en[symptom] || 'General Health Issue';
}

export const COMMON_SYMPTOMS: SymptomInfo[] = [
  {
    id: 'fever',
    name: 'Fever & Chills',
    hindiName: 'Bukhar / Taap',
    description: 'Elevated body temperature, sweating, shivers, or feeling hot and flushed.',
    iconName: 'Flame',
    color: 'from-amber-500 to-orange-500',
    typicalOnset: 'Sudden or gradual over 1-2 days'
  },
  {
    id: 'headache',
    name: 'Headache & Migraine',
    hindiName: 'Sar Dard',
    description: 'Throbbing, pressure, forehead tension, or sharp pain around the head or eyes.',
    iconName: 'Zap',
    color: 'from-violet-500 to-purple-600',
    typicalOnset: 'Acute or tension-related'
  },
  {
    id: 'cold_sneezing',
    name: 'Cold & Sneezing',
    hindiName: 'Zukam / Chheenk',
    description: 'Runny or blocked nose, continuous sneezing, watery eyes, or sinus congestion.',
    iconName: 'Wind',
    color: 'from-teal-500 to-emerald-600',
    typicalOnset: 'Seasonal allergies or viral URI'
  },
  {
    id: 'skin_rash',
    name: 'Skin Rashes & Itching',
    hindiName: 'Khujli / Daad / Lal Chhinte',
    description: 'Redness, hives, patchy bumps, dry itch, or suspected contact allergy.',
    iconName: 'Sparkles',
    color: 'from-rose-500 to-pink-600',
    typicalOnset: 'After contact or food exposure'
  },
  {
    id: 'small_cuts',
    name: 'Small Cuts & Scrapes',
    hindiName: 'Chhoti Chot / Zakhmi Khronch',
    description: 'Superficial skin lacerations, bleeding scratches, knife nicks, or paper cuts.',
    iconName: 'Bandage',
    color: 'from-sky-500 to-blue-600',
    typicalOnset: 'Trauma or kitchen / outdoor nick'
  },
  {
    id: 'stomach_upset',
    name: 'Stomach Upset & Acidity',
    hindiName: 'Pet Dard / Gas / Matli',
    description: 'Nausea, loose stools, bloating, mild cramps, or burning acid reflux.',
    iconName: 'Activity',
    color: 'from-amber-600 to-yellow-600',
    typicalOnset: 'Dietary trigger or gastric bug'
  },
  {
    id: 'cough_throat',
    name: 'Cough & Sore Throat',
    hindiName: 'Khansi / Gale me Kharash',
    description: 'Scratchy throat, painful swallowing, dry tickle, or phlegm cough.',
    iconName: 'Volume2',
    color: 'from-indigo-500 to-blue-500',
    typicalOnset: 'Often follows cold or exposure'
  },
  {
    id: 'body_ache',
    name: 'Body Aches & Fatigue',
    hindiName: 'Badan Dard / Kamzori',
    description: 'Muscle stiffness, generalized exhaustion, or joint discomfort.',
    iconName: 'HeartPulse',
    color: 'from-emerald-600 to-teal-700',
    typicalOnset: 'Post-viral or physical strain'
  }
];

export const NEARBY_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Anita Deshmukh, MD',
    specialty: 'Senior General Physician',
    hospital: 'Apex Metro Polyclinic',
    address: 'Suite 204, Green Park Avenue (0.8 km away)',
    distanceKm: 0.8,
    rating: 4.9,
    reviewsCount: 342,
    nextAvailable: 'Today in 30 mins',
    phone: '+1 (555) 234-8901',
    fee: '$35 / ₹500',
    emergency24x7: false,
    latitude: 37.7749,
    longitude: -122.4194
  },
  {
    id: 'doc-2',
    name: 'Dr. Vikram Sethi, DCH',
    specialty: 'Pediatrician & Child Health Specialist',
    hospital: 'Little Angels Children Care Clinic',
    address: '42 Blossom Boulevard (1.2 km away)',
    distanceKm: 1.2,
    rating: 4.95,
    reviewsCount: 512,
    nextAvailable: 'Today at 4:30 PM',
    phone: '+1 (555) 345-6789',
    fee: '$40 / ₹600',
    emergency24x7: false,
    latitude: 37.7765,
    longitude: -122.4150
  },
  {
    id: 'doc-3',
    name: 'Dr. Priya V. Raman, MD',
    specialty: 'Consultant Dermatologist',
    hospital: 'Skin & Allergy Institute',
    address: '88 Healthcare Crescent (1.7 km away)',
    distanceKm: 1.7,
    rating: 4.85,
    reviewsCount: 220,
    nextAvailable: 'Tomorrow 10:00 AM',
    phone: '+1 (555) 456-7890',
    fee: '$45 / ₹700',
    emergency24x7: false,
    latitude: 37.7720,
    longitude: -122.4210
  },
  {
    id: 'doc-4',
    name: 'Dr. Michael Chen, MS (ENT)',
    specialty: 'Ear, Nose & Throat Specialist',
    hospital: 'Sinus & Allergy Center',
    address: '15 Medical Arcade (2.1 km away)',
    distanceKm: 2.1,
    rating: 4.88,
    reviewsCount: 198,
    nextAvailable: 'Today at 5:15 PM',
    phone: '+1 (555) 567-8901',
    fee: '$42 / ₹650',
    emergency24x7: false,
    latitude: 37.7790,
    longitude: -122.4120
  },
  {
    id: 'doc-5',
    name: 'St. Jude 24x7 Emergency & Trauma Hospital',
    specialty: 'Emergency Medicine / Level 1 Urgent Care',
    hospital: 'Emergency Department, St. Jude Medical Complex',
    address: '100 Memorial Parkway (2.4 km away)',
    distanceKm: 2.4,
    rating: 4.9,
    reviewsCount: 1420,
    nextAvailable: 'Immediate Walk-in Open Now',
    phone: '+1 (555) 911-0000',
    fee: 'Insurance / Emergency triage',
    emergency24x7: true,
    latitude: 37.7810,
    longitude: -122.4080
  }
];

// Determines the question ID for each step (1 to 10) based on demographic group (Male, Female, Male-Child, Female-Child) & symptom
export function getQuestionIdForStep(step: number, ctx: QuestionContext): QuestionId | null {
  const isPediatric = ctx.ageCategory === 'child';
  const isSenior = ctx.ageCategory === 'senior';
  const isFemale = ctx.sex === 'female';
  const isMale = ctx.sex === 'male';
  const isReproductiveFemale = isFemale && (ctx.ageCategory === 'adult' || ctx.ageCategory === 'teen');
  const symptom = ctx.symptom;

  switch (step) {
    case 1:
      return 'q1_symptom_trigger';
    case 2:
      if (isPediatric && isMale) return 'q2_boy_pediatric_weight';
      if (isPediatric && isFemale) return 'q2_girl_pediatric_weight';
      if (isPediatric) return 'q2_pediatric_weight';

      if (isSenior && isMale) return 'q2_senior_male_health';
      if (isSenior && isFemale) return 'q2_senior_female_health';
      if (isSenior) return 'q2_senior_conditions';

      // Ask female pregnancy / period questions ONLY when clinically required by the problem
      if (isReproductiveFemale) {
        if (symptom === 'fever' || symptom === 'headache') {
          return 'q2_pregnancy_check';
        }
        if (symptom === 'stomach_upset' || symptom === 'body_ache') {
          return 'q2_female_cycle_check';
        }
        return 'q2_female_wellness';
      }

      if (isMale) return 'q2_male_profile';
      return 'q2_general_profile';
    case 3:
      return 'q3_onset_duration';
    case 4:
      return 'q4_severity_intensity';
    case 5:
      if (symptom === 'fever') return 'q5_fever_temp';
      if (symptom === 'headache') return 'q5_headache_type';
      if (symptom === 'cold_sneezing') return 'q5_cold_discharge';
      if (symptom === 'skin_rash') return 'q5_rash_appearance';
      if (symptom === 'small_cuts') return 'q5_cut_characteristics';
      if (symptom === 'stomach_upset') return 'q5_stomach_pattern';
      return 'q5_symptom_nuance';
    case 6:
      return 'q6_red_flags';
    case 7:
      return 'q7_drug_allergies';
    case 8:
      return 'q8_meds_taken_today';
    case 9:
      if (symptom === 'small_cuts') {
        return 'q9_tetanus_history';
      }
      if (isPediatric && isMale) return 'q9_boy_problem_context';
      if (isPediatric && isFemale) return 'q9_girl_problem_context';
      if (isMale) return 'q9_male_problem_context';
      if (isFemale) return 'q9_female_problem_context';
      if (symptom === 'fever' || symptom === 'stomach_upset' || symptom === 'cold_sneezing') {
        return 'q9_hydration';
      }
      return 'q9_daily_activities';
    case 10:
      return 'q10_progression';
    default:
      return null;
  }
}

// Generates the adaptive 10 localized questions based on past answers, demographic group, and language
export function getAdaptiveQuestion(
  step: number,
  ctx: QuestionContext,
  lang: LanguageCode = 'en'
): {
  id: QuestionId;
  stepNumber: number;
  question: string;
  subtext?: string;
  options: string[];
  allowFreeText?: boolean;
  freeTextPlaceholder?: string;
  badge?: string;
} | null {
  const questionId = getQuestionIdForStep(step, ctx);
  if (!questionId) return null;

  const langBundle = QUESTION_TRANSLATIONS[lang] || QUESTION_TRANSLATIONS.en;
  const copy = langBundle[questionId] || QUESTION_TRANSLATIONS.en[questionId];

  let questionText = copy.question;
  if (questionId === 'q3_onset_duration' && lang === 'en') {
    const symptomLabel = getLocalizedSymptomName(ctx.symptom, 'en').toLowerCase();
    questionText = `How long have you been experiencing ${symptomLabel}?`;
  }

  return {
    id: questionId,
    stepNumber: step,
    question: questionText,
    subtext: copy.subtext,
    options: copy.options,
    badge: copy.badge
  };
}

// Evaluates the full intake answers (language-independent via answerIndices + text fallback)
// to automatically decide severity and recommend real commercial OTC medicine/powder or doctor consultation
export function evaluateTriage(
  ctx: QuestionContext,
  answers: Record<string, string>,
  lang: LanguageCode = 'en'
): TriageAssessment {
  const isPediatric = ctx.ageCategory === 'child';
  const isSenior = ctx.ageCategory === 'senior';
  const symptom = ctx.symptom;
  const idxMap = ctx.answerIndices || {};
  const bundle = ASSESSMENT_TRANSLATIONS[lang] || ASSESSMENT_TRANSLATIONS.en;
  const P = bundle.products;

  let severity: SeverityLevel = 'mild';
  const redFlags: string[] = [];
  const keyObservations: string[] = [];
  const otcs: OtcMedicine[] = [];
  const homeRemedies: HomeRemedy[] = [];
  const specialties: string[] = ['General Physician'];
  const whenToSeekEmergency: string[] = [];

  // Check pregnancy / nursing / delayed-period safety context
  const q2PregIdx = idxMap['q2_pregnancy_check'];
  const q2CycleIdx = idxMap['q2_female_cycle_check'];
  const isPregnantOrNursing =
    Boolean(ctx.isPregnantOrNursing) ||
    q2PregIdx === 1 ||
    q2PregIdx === 2 ||
    q2PregIdx === 3 ||
    q2CycleIdx === 2 ||
    q2CycleIdx === 3;

  // Check allergies (q7_drug_allergies)
  const q7AllergyIdx = idxMap['q7_drug_allergies'];
  const q7Answer = answers['q7_drug_allergies'] || '';
  const allergicToNsaids = q7AllergyIdx === 2 || q7Answer.includes('Ibuprofen') || q7Answer.includes('Aspirin');
  const allergicToParacetamol = q7AllergyIdx === 3 || q7Answer.includes('Paracetamol');

  // Check red flag answers (q6_red_flags: index > 0 is a red flag)
  const q6Idx = idxMap['q6_red_flags'];
  const q6Answer = answers['q6_red_flags'] || '';
  const hasQ6RedFlag =
    (typeof q6Idx === 'number' && q6Idx > 0) ||
    q6Answer.includes('breathing') ||
    q6Answer.includes('Stiff neck') ||
    q6Answer.includes('Confusion') ||
    q6Answer.includes('fluids down') ||
    q6Answer.includes('Blood');

  if (hasQ6RedFlag) {
    severity = 'emergency';
    const localizedQ6 =
      typeof q6Idx === 'number'
        ? QUESTION_TRANSLATIONS[lang]?.q6_red_flags?.options?.[q6Idx]
        : q6Answer;
    redFlags.push(localizedQ6 || bundle.redFlags.defaultFlag);
  }

  // Check pain intensity (q4_severity_intensity: 0=1-3, 1=4-6, 2=7-8, 3=9-10)
  const q4Idx = idxMap['q4_severity_intensity'];
  const q4Answer = answers['q4_severity_intensity'] || '';
  if (q4Idx === 3 || q4Answer.includes('9 - 10')) {
    if (severity !== 'emergency') severity = 'severe';
    keyObservations.push(bundle.observations.highPain);
  } else if (q4Idx === 2 || q4Answer.includes('7 - 8')) {
    if (severity === 'mild') severity = 'moderate';
    keyObservations.push(bundle.observations.modPain);
  }

  // Check symptom progression (q10_progression: 0=better, 1=same, 2=slowly worse, 3=rapidly worsening)
  const q10Idx = idxMap['q10_progression'];
  const q10Answer = answers['q10_progression'] || '';
  if (q10Idx === 3 || q10Answer.includes('Rapidly worsening')) {
    if (severity === 'moderate') {
      severity = 'severe';
    } else if (severity === 'mild') {
      severity = 'moderate';
    }
    keyObservations.push(bundle.observations.rapidProgress);
  }

  // Check severe hydration, urinary discomfort, or bedridden status across demographic Step 9 questions
  const q9HydrIdx = idxMap['q9_hydration'];
  const q9BoyIdx = idxMap['q9_boy_problem_context'];
  const q9GirlIdx = idxMap['q9_girl_problem_context'];
  const q9MaleIdx = idxMap['q9_male_problem_context'];
  const q9FemaleIdx = idxMap['q9_female_problem_context'];

  if (q9HydrIdx === 3 || q9BoyIdx === 3 || q9GirlIdx === 3 || q9MaleIdx === 3 || q9FemaleIdx === 3) {
    if (severity !== 'emergency') severity = 'severe';
    redFlags.push(bundle.redFlags.noFluids);
  } else if (q9GirlIdx === 2 && severity === 'mild') {
    severity = 'moderate';
  }

  const q9DailyIdx = idxMap['q9_daily_activities'];
  if (q9DailyIdx === 3 && severity === 'moderate') {
    severity = 'severe';
    keyObservations.push(bundle.observations.impairedDaily);
  }

  // Specific symptom logic using real commercial OTC products
  if (symptom === 'fever') {
    const tempIdx = idxMap['q5_fever_temp'];
    const tempAnswer = answers['q5_fever_temp'] || '';
    if (
      tempIdx === 3 ||
      tempAnswer.includes('Above 104°F') ||
      (isPediatric && (tempIdx === 2 || tempAnswer.includes('102.1°F')))
    ) {
      if (severity !== 'emergency') severity = 'severe';
      redFlags.push(bundle.redFlags.highFever);
      whenToSeekEmergency.push(bundle.redFlags.highFever);
    }

    if (isPediatric) {
      specialties.unshift('Pediatrician & Child Health Specialist');
      keyObservations.push(bundle.observations.pediatricParacetamol);
      if (!allergicToParacetamol) {
        otcs.push(toOtcMedicine(P.calpol120));
      }
    } else if (!allergicToParacetamol) {
      otcs.push(toOtcMedicine(P.dolo650));
    }

    otcs.push(toOtcMedicine(P.electralOrs));
    homeRemedies.push(...bundle.remedies.fever);
  } else if (symptom === 'headache') {
    const typeIdx = idxMap['q5_headache_type'];
    const typeAnswer = answers['q5_headache_type'] || '';
    if (typeIdx === 3 || typeAnswer.includes('thunderclap')) {
      severity = 'emergency';
      redFlags.push(bundle.redFlags.thunderclap);
      whenToSeekEmergency.push(bundle.redFlags.thunderclap);
    }

    if (severity !== 'emergency') {
      if (isPediatric && !allergicToParacetamol) {
        otcs.push(toOtcMedicine(P.calpol250));
      } else if (isPregnantOrNursing || allergicToNsaids || isSenior || !allergicToParacetamol) {
        otcs.push(toOtcMedicine(P.crocin500));
      } else {
        otcs.push(toOtcMedicine(P.brufen400));
      }
      if (idxMap['q1_symptom_trigger'] === 2) {
        otcs.push(toOtcMedicine(P.electralOrs));
      }
      homeRemedies.push(...bundle.remedies.headache);
    }
  } else if (symptom === 'cold_sneezing') {
    specialties.unshift('Ear, Nose & Throat Specialist (ENT)');
    otcs.push(toOtcMedicine(P.cetzine10), toOtcMedicine(P.otrivinSaline));
    homeRemedies.push(...bundle.remedies.cold_sneezing);
  } else if (symptom === 'skin_rash') {
    specialties.unshift('Consultant Dermatologist');
    const rashIdx = idxMap['q5_rash_appearance'];
    const rashAnswer = answers['q5_rash_appearance'] || '';
    if (rashIdx === 4 || rashAnswer.includes('Purple spots') || rashAnswer.includes('does NOT fade')) {
      severity = 'emergency';
      redFlags.push(bundle.redFlags.nonBlanching);
      whenToSeekEmergency.push(bundle.redFlags.nonBlanching);
    } else if (rashIdx === 3 || rashAnswer.includes('Blisters')) {
      if (severity !== 'emergency') severity = 'severe';
      redFlags.push(bundle.redFlags.blisters);
    }

    if (severity !== 'emergency' && severity !== 'severe') {
      otcs.push(toOtcMedicine(P.candidPowder), toOtcMedicine(P.caladrylLotion));
      homeRemedies.push(...bundle.remedies.skin_rash);
    }
  } else if (symptom === 'small_cuts') {
    const cutIdx = idxMap['q5_cut_characteristics'];
    const cutAnswer = answers['q5_cut_characteristics'] || '';
    if (cutIdx === 3 || cutIdx === 4 || cutAnswer.includes('Deep gaping') || cutAnswer.includes('Active bleeding')) {
      if (severity !== 'emergency') severity = 'severe';
      redFlags.push(bundle.redFlags.deepCut);
      whenToSeekEmergency.push(bundle.redFlags.deepCut);
    }

    otcs.push(toOtcMedicine(P.betadineOintment), toOtcMedicine(P.bandAidStrips));
    homeRemedies.push(...bundle.remedies.small_cuts);
  } else if (symptom === 'stomach_upset') {
    const stomachIdx = idxMap['q5_stomach_pattern'];
    if (stomachIdx === 2) {
      keyObservations.push(bundle.observations.frequentVomiting);
    }

    otcs.push(toOtcMedicine(P.electralOrs), toOtcMedicine(P.enoPowder));
    homeRemedies.push(...bundle.remedies.stomach_upset);
  } else if (symptom === 'cough_throat') {
    specialties.unshift('Ear, Nose & Throat Specialist (ENT)');
    otcs.push(toOtcMedicine(P.strepsils), toOtcMedicine(P.otrivinSaline));
    homeRemedies.push(...bundle.remedies.cough_throat);
  } else {
    if (!allergicToParacetamol) {
      otcs.push(toOtcMedicine(isPediatric ? P.calpol250 : P.crocin500));
    }
    otcs.push(toOtcMedicine(P.electralOrs));
    homeRemedies.push(...bundle.remedies.body_ache);
  }

  const clinicalSummary = bundle.summaries[severity](redFlags.join(', '));

  // Filter recommended doctors based on specialty & severity
  const matchedDocs = NEARBY_DOCTORS.filter(d => {
    if (severity === 'emergency') return d.emergency24x7;
    if (isPediatric && d.specialty.includes('Pediatric')) return true;
    if (symptom === 'skin_rash' && d.specialty.includes('Dermatologist')) return true;
    if (symptom === 'cold_sneezing' && d.specialty.includes('ENT')) return true;
    return d.specialty.includes('Physician') || d.emergency24x7;
  });

  return {
    id: `assess-${Date.now()}`,
    patientId: ctx.ageCategory,
    patientName: 'Patient',
    patientAge: ctx.age,
    patientSex: ctx.sex,
    patientCategory: ctx.ageCategory,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
    primarySymptom: symptom,
    severity,
    clinicalSummary,
    keyObservations,
    redFlagsDetected: redFlags,
    recommendedOtcs: otcs,
    homeRemedies,
    recommendedSpecialties: specialties,
    recommendedDoctors: matchedDocs.length > 0 ? matchedDocs : NEARBY_DOCTORS,
    followUpHours: severity === 'emergency' ? 0 : severity === 'severe' ? 6 : 24,
    whenToSeekEmergency,
    triageContext: ctx,
    triageAnswers: answers
  };
}
