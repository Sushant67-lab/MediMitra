import { 
  SymptomCategory, 
  SymptomInfo, 
  OtcMedicine, 
  HomeRemedy,
  Doctor, 
  TriageAssessment, 
  AgeCategory, 
  BiologicalSex, 
  SeverityLevel,
  QuestionContext
} from '../types/medical';

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

// Generates the adaptive 10-13 questions based on past answers and demographic group
export function getAdaptiveQuestion(step: number, ctx: QuestionContext): {
  id: string;
  stepNumber: number;
  question: string;
  subtext?: string;
  options: string[];
  allowFreeText?: boolean;
  freeTextPlaceholder?: string;
  badge?: string;
} | null {
  const isPediatric = ctx.ageCategory === 'child';
  const isSenior = ctx.ageCategory === 'senior';
  const isFemale = ctx.sex === 'female';
  const symptom = ctx.symptom;

  switch (step) {
    case 1:
      return {
        id: 'q1_demographics',
        stepNumber: 1,
        question: `First, let's verify the patient's age and life stage.`,
        subtext: 'Age category directly dictates medication safety, dosage calculations, and risk guidelines.',
        options: [
          'Child / Toddler (1 - 11 years)',
          'Teenager / Adolescent (12 - 17 years)',
          'Adult (18 - 59 years)',
          'Senior / Older Adult (60+ years)'
        ],
        badge: 'Demographic Baseline'
      };

    case 2:
      if (isFemale && (ctx.ageCategory === 'adult' || ctx.ageCategory === 'teen')) {
        return {
          id: 'q2_pregnancy_check',
          stepNumber: 2,
          question: 'Are you currently pregnant, planning to become pregnant, or nursing/breastfeeding?',
          subtext: 'Crucial clinical step: Many common OTC pain relievers (like Ibuprofen/Aspirin) are contraindicated during pregnancy.',
          options: [
            'No, not pregnant or nursing',
            'Currently pregnant (1st or 2nd trimester)',
            'Currently pregnant (3rd trimester)',
            'Currently breastfeeding / nursing',
            'Prefer not to disclose'
          ],
          badge: 'Women Health Safety'
        };
      } else if (isPediatric) {
        return {
          id: 'q2_pediatric_weight',
          stepNumber: 2,
          question: `What is the approximate weight of the child?`,
          subtext: 'Pediatric dosages (e.g. Paracetamol / Acetaminophen drops) are strictly weight-dependent (mg/kg).',
          options: [
            'Under 10 kg (Under 22 lbs)',
            '10 - 18 kg (22 - 40 lbs)',
            '19 - 30 kg (41 - 66 lbs)',
            'Above 30 kg (Above 66 lbs)',
            'Not sure of exact weight'
          ],
          badge: 'Pediatric Weight Safety'
        };
      } else if (isSenior) {
        return {
          id: 'q2_senior_conditions',
          stepNumber: 2,
          question: 'Do you have any existing chronic conditions like High Blood Pressure, Heart disease, or Kidney issues?',
          subtext: 'Decongestants and NSAIDs can spike blood pressure and strain renal function in older adults.',
          options: [
            'No major chronic conditions',
            'High Blood Pressure (Hypertension)',
            'Type 2 Diabetes',
            'Heart disease / Cardiac history',
            'Kidney / Renal condition'
          ],
          badge: 'Geriatric Safety Screening'
        };
      } else {
        return {
          id: 'q2_general_profile',
          stepNumber: 2,
          question: 'Do you have any known medical conditions or regular daily medications?',
          subtext: 'Helps us ensure zero drug-drug interactions with recommended relief remedies.',
          options: [
            'None / Generally healthy',
            'Asthma / Respiratory sensitivity',
            'Acid reflux / Peptic ulcer',
            'High blood pressure',
            'Other regular medication'
          ],
          badge: 'Baseline Health'
        };
      }

    case 3:
      return {
        id: 'q3_onset_duration',
        stepNumber: 3,
        question: `How long have you been experiencing this ${symptom.replace('_', ' ')}?`,
        subtext: 'The onset time distinguishes acute, transient conditions from chronic or progressing infections.',
        options: [
          'Just started today (Less than 24 hours)',
          '1 to 3 days',
          '4 to 7 days (Almost a week)',
          'More than 1 to 2 weeks',
          'Intermittent / Recurring over months'
        ],
        badge: 'Onset & Duration'
      };

    case 4:
      return {
        id: 'q4_severity_intensity',
        stepNumber: 4,
        question: 'How would you describe the current severity or discomfort on a scale of 1 to 10?',
        subtext: 'Assess physical impact and pain threshold to calibrate urgency.',
        options: [
          '1 - 3: Mild discomfort (annoying but able to work/play)',
          '4 - 6: Moderate (interferes with focus, uncomfortable)',
          '7 - 8: Severe (hard to function, need to lie down)',
          '9 - 10: Intolerable / Excruciating (extreme distress)'
        ],
        badge: 'Pain & Discomfort Scale'
      };

    case 5:
      // SYMPTOM-SPECIFIC DEEP DIVE
      if (symptom === 'fever') {
        return {
          id: 'q5_fever_temp',
          stepNumber: 5,
          question: 'Have you checked your body temperature with a thermometer? What was the reading?',
          subtext: 'Temperatures above 102°F (38.9°C) in adults or >100.4°F in infants require strict medical monitoring.',
          options: [
            'Low-grade: 99.0°F - 100.4°F (37.2°C - 38.0°C)',
            'Moderate: 100.5°F - 102.0°F (38.1°C - 38.9°C)',
            'High: 102.1°F - 104.0°F (39.0°C - 40.0°C)',
            'Extremely High: Above 104°F (>40.0°C)',
            'No thermometer, but skin feels hot & flushed'
          ],
          badge: 'Thermal Assessment'
        };
      } else if (symptom === 'headache') {
        return {
          id: 'q5_headache_type',
          stepNumber: 5,
          question: 'Where is the headache localized, and how does the sensation feel?',
          subtext: 'Differentiation between tension, sinus congestion, migraine, and hypertensive pressure.',
          options: [
            'Tight band across forehead / back of neck (Tension)',
            'One side throbbing with light or sound sensitivity (Migraine)',
            'Pressure behind eyes, cheeks, and nasal bridge (Sinus)',
            'Sudden explosive "thunderclap" pain like never before',
            'Dull general ache all over head'
          ],
          badge: 'Pain Characterization'
        };
      } else if (symptom === 'cold_sneezing') {
        return {
          id: 'q5_cold_discharge',
          stepNumber: 5,
          question: 'What is the nature of the nasal discharge and sneezing pattern?',
          subtext: 'Helps identify whether this is viral rhinovirus vs allergic rhinitis (dust/pollen).',
          options: [
            'Clear, watery fluid with itchy eyes (Allergic)',
            'Thick yellow or green mucus with blocked nose',
            'Dry stuffy nose with no discharge',
            'Sneezing fits triggered by pollen, pets, or cold air'
          ],
          badge: 'Secretions & Triggers'
        };
      } else if (symptom === 'skin_rash') {
        return {
          id: 'q5_rash_appearance',
          stepNumber: 5,
          question: 'How does the rash appear, and does it itch or burn?',
          subtext: 'Looking for raised welts (urticaria), eczema patches, or signs of secondary skin infection.',
          options: [
            'Raised red bumps or welts that itch intensely (Hives)',
            'Dry, scaly, cracked patches (Eczema / Dryness)',
            'Localized red circle or insect bite swelling',
            'Blisters with fluid or pus crusting',
            'Purple spots that do NOT fade when pressed'
          ],
          badge: 'Dermatological Inspection'
        };
      } else if (symptom === 'small_cuts') {
        return {
          id: 'q5_cut_characteristics',
          stepNumber: 5,
          question: 'What caused the cut, and is the bleeding currently controlled?',
          subtext: 'Evaluates wound depth, tetanus infection risk, and whether sutures/stitches are indicated.',
          options: [
            'Superficial kitchen nick / paper cut, bleeding stopped with light pressure',
            'Shallow scratch from clean object, minor oozing',
            'Cut from rusty metal, outdoor soil, or animal scratch',
            'Deep gaping wound where edges do not stay together',
            'Active bleeding that won’t stop after 10 minutes of direct pressure'
          ],
          badge: 'Wound Trauma Assessment'
        };
      } else if (symptom === 'stomach_upset') {
        return {
          id: 'q5_stomach_pattern',
          stepNumber: 5,
          question: 'What is the primary gastrointestinal distress you are facing?',
          subtext: 'Helps separate acid indigestion from viral gastroenteritis or food poisoning.',
          options: [
            'Burning sensation in chest / upper stomach after spicy meals (Acidity)',
            'Watery loose motions (Diarrhea) 2-3 times today',
            'Frequent vomiting or severe nausea',
            'Cramping gas and bloating without fever'
          ],
          badge: 'GI Symptom Spectrum'
        };
      } else {
        return {
          id: 'q5_symptom_nuance',
          stepNumber: 5,
          question: 'How does this symptom feel throughout the day?',
          subtext: 'Tracking morning vs evening peaks and posture triggers.',
          options: [
            'Worse in the morning upon waking up',
            'Worse at night while trying to sleep',
            'Constant intensity all day and night',
            'Comes in sudden waves or spasms'
          ],
          badge: 'Diurnal Pattern'
        };
      }

    case 6:
      // RED FLAG SCREENING
      return {
        id: 'q6_red_flags',
        stepNumber: 6,
        question: 'Are you experiencing ANY of these critical red flag warning signs?',
        subtext: 'Emergency screening: If present, immediate in-person medical evaluation is required.',
        options: [
          'None of these apply to me (Safe)',
          'Difficulty breathing, wheezing, or chest tightness',
          'Stiff neck with inability to touch chin to chest',
          'Confusion, extreme drowsiness, or fainting / dizziness',
          'Inability to keep any water or fluids down for >12 hours',
          'Blood in vomit, cough, or stool'
        ],
        badge: 'Red Flag Emergency Safety'
      };

    case 7:
      // DRUG ALLERGIES
      return {
        id: 'q7_drug_allergies',
        stepNumber: 7,
        question: 'Do you have any known allergies to common medicines?',
        subtext: 'Essential before recommending any OTC analgesic, antipyretic, or antihistamine.',
        options: [
          'No known drug allergies (NKDA)',
          'Allergic to Penicillin or related antibiotics',
          'Allergic to Aspirin or Ibuprofen / NSAIDs',
          'Allergic to Paracetamol / Acetaminophen',
          'Allergic to Sulfa drugs',
          'Multiple drug sensitivities'
        ],
        badge: 'Allergy Verification'
      };

    case 8:
      // MEDICATIONS ALREADY TAKEN
      return {
        id: 'q8_meds_taken_today',
        stepNumber: 8,
        question: 'Have you already taken any medication or home treatment in the past 12-24 hours?',
        subtext: 'Prevents accidental drug duplication or liver/kidney toxic overload.',
        options: [
          'Nothing taken yet',
          'Took Paracetamol / Tylenol earlier today',
          'Took Ibuprofen / Advil / Combiflam',
          'Took an Antihistamine / Cetirizine / Allegra',
          'Took an antacid (Gelusil / Eno / Omeprazole)',
          'Applied home herbal remedy / ice compress'
        ],
        badge: 'Dosage Timing & Stacking'
      };

    case 9:
      // HYDRATION & FLUID INTAKE
      if (symptom === 'fever' || symptom === 'stomach_upset' || symptom === 'cold_sneezing') {
        return {
          id: 'q9_hydration',
          stepNumber: 9,
          question: 'How is your fluid intake and hydration level today?',
          subtext: 'Fever and viral illnesses rapidly deplete electrolytes and water balance.',
          options: [
            'Drinking plenty of water and clear fluids normally',
            'Slightly reduced appetite, but drinking small sips',
            'Urine is dark yellow, feeling very dry mouth and thirsty',
            'Severe nausea / unable to drink any water without vomiting'
          ],
          badge: 'Hydration & Vitals'
        };
      } else if (symptom === 'small_cuts') {
        return {
          id: 'q9_tetanus_history',
          stepNumber: 9,
          question: 'When did you last receive a Tetanus Toxoid (TT) booster vaccine?',
          subtext: 'Tetanus spores survive in soil, rust, and dust; boosters are recommended within 5 to 10 years of dirty cuts.',
          options: [
            'Within the last 5 years (Up to date)',
            'Between 5 and 10 years ago',
            'More than 10 years ago or never',
            'Not sure of vaccination record'
          ],
          badge: 'Tetanus Prophylaxis'
        };
      } else {
        return {
          id: 'q9_daily_activities',
          stepNumber: 9,
          question: 'How is this condition affecting your ability to eat, sleep, and work/study?',
          subtext: 'Functional impairment score indicates clinical severity.',
          options: [
            'Able to eat and sleep fine, just mildly bothered',
            'Disrupted sleep last night, reduced energy',
            'Unable to work or concentrate today',
            'Completely bedridden, unable to carry out basic chores'
          ],
          badge: 'Functional Impact'
        };
      }

    case 10:
      // FINAL STEP: CARE PREFERENCE
      return {
        id: 'q10_care_preference',
        stepNumber: 10,
        question: 'Lastly, what do you need most right now?',
        subtext: 'We will suggest basic medicine if safe, or connect you to the nearest doctor.',
        options: [
          'Recommend safe basic medicine to take at home',
          'Tell me if this is a big problem needing a doctor',
          'Show nearest doctors and clinic timings'
        ],
        badge: 'Final Recommendation'
      };

    default:
      return null;
  }
}

// Evaluates the full intake answers to produce an evidence-based triage report
export function evaluateTriage(
  ctx: QuestionContext,
  answers: Record<string, string>
): TriageAssessment {
  const isPediatric = ctx.ageCategory === 'child';
  const isSenior = ctx.ageCategory === 'senior';
  const isFemale = ctx.sex === 'female';
  const symptom = ctx.symptom;

  let severity: SeverityLevel = 'mild';
  const redFlags: string[] = [];
  const keyObservations: string[] = [];
  const otcs: OtcMedicine[] = [];
  const homeRemedies: HomeRemedy[] = [];
  const specialties: string[] = ['General Physician'];
  const whenToSeekEmergency: string[] = [];

  // Check red flag answers
  const q6Answer = answers['q6_red_flags'] || '';
  if (
    q6Answer.includes('breathing') ||
    q6Answer.includes('Stiff neck') ||
    q6Answer.includes('Confusion') ||
    q6Answer.includes('fluids down') ||
    q6Answer.includes('Blood')
  ) {
    severity = 'emergency';
    redFlags.push(q6Answer);
  }

  // Check pain intensity
  const q4Answer = answers['q4_severity_intensity'] || '';
  if (q4Answer.includes('9 - 10')) {
    if (severity !== 'emergency') severity = 'severe';
    keyObservations.push('High subjective pain rating (9-10/10).');
  } else if (q4Answer.includes('7 - 8')) {
    if (severity === 'mild') severity = 'moderate';
    keyObservations.push('Moderate-to-high discomfort affecting daily routine.');
  }

  // Check progression
  const q10Answer = answers['q10_progression'] || '';
  if (q10Answer.includes('Rapidly worsening')) {
    if (severity === 'mild') severity = 'moderate';
    keyObservations.push('Symptoms are progressing rapidly rather than plateauing.');
  }

  // Specific symptom logic
  if (symptom === 'fever') {
    const tempAnswer = answers['q5_fever_temp'] || '';
    if (tempAnswer.includes('Above 104°F') || (isPediatric && tempAnswer.includes('102.1°F'))) {
      severity = 'severe';
      redFlags.push('High-grade fever requires direct medical observation.');
      whenToSeekEmergency.push('Fever >103°F not responding to antipyretics within 2 hours');
    }

    if (isPediatric) {
      specialties.unshift('Pediatrician & Child Health Specialist');
      keyObservations.push('Pediatric patient: Paracetamol syrup calculated strictly by weight (10-15 mg/kg). Never give Aspirin.');
      otcs.push({
        name: 'Paracetamol / Acetaminophen Pediatric Oral Suspension (120mg/5ml or 250mg/5ml)',
        category: 'Antipyretic / Analgesic (Child Safe)',
        dosageGuide: '10 to 15 mg per kg of body weight every 4 to 6 hours as needed. Do not exceed 4 doses in 24 hours.',
        childDosageNote: 'Consult pediatrician or weight chart on the bottle. Never guess dosage.',
        safetyCaution: 'Do not combine with cold syrups that also contain paracetamol to avoid overdose.',
        typicalUse: 'Fever reduction and relief from aches.'
      });
    } else {
      otcs.push({
        name: 'Paracetamol (Acetaminophen) 500mg - 650mg Tablets',
        category: 'Antipyretic / Analgesic',
        dosageGuide: '1 tablet (500mg or 650mg) every 4 to 6 hours with a glass of water. Maximum 3000mg in 24 hours.',
        safetyCaution: 'Do not consume with alcohol. Avoid if you have active liver disease.',
        typicalUse: 'Reduces temperature, alleviates fever chills and muscular headache.'
      });
    }

    homeRemedies.push(
      {
        title: 'Tepid Sponge Baths',
        instructions: 'Gently wipe forehead, neck, and armpits with lukewarm (not freezing cold) water cloth.',
        benefit: 'Promotes gentle evaporative cooling without inducing shivering.'
      },
      {
        title: 'Electrolyte Hydration (ORS / Coconut Water)',
        instructions: 'Drink oral rehydration solution (ORS), fresh coconut water, or warm broths regularly.',
        benefit: 'Replaces essential sodium, potassium, and fluid lost through perspiration.'
      },
      {
        title: 'Light Cotton Clothing & Well-Ventilated Room',
        instructions: 'Wear loose single-layer cotton clothes. Keep room comfortably ventilated (avoid heavy blankets).',
        benefit: 'Prevents heat trapping and secondary hyperthermia.'
      }
    );

    whenToSeekEmergency.push(
      'Fever accompanied by severe neck stiffness, confusion, or convulsions',
      'Child appears excessively drowsy, listless, or refusing fluids',
      'Fever lasting more than 3 full days without improvement'
    );
  } else if (symptom === 'headache') {
    const typeAnswer = answers['q5_headache_type'] || '';
    if (typeAnswer.includes('thunderclap')) {
      severity = 'emergency';
      redFlags.push('Sudden explosive onset thunderclap headache requires immediate ER rule-out for intracranial hemorrhage.');
      whenToSeekEmergency.push('Sudden severe thunderclap headache starting within seconds');
    }

    if (severity !== 'emergency') {
      otcs.push({
        name: 'Paracetamol 500mg OR Ibuprofen 200mg - 400mg',
        category: 'Analgesic / Anti-inflammatory',
        dosageGuide: 'Adults: Take 1 tablet with a light snack or glass of water. Repeat after 6-8 hrs if needed.',
        safetyCaution: isFemale && ctx.isPregnantOrNursing 
          ? 'Use Paracetamol ONLY. Ibuprofen is contraindicated during pregnancy.'
          : 'Do not take NSAIDs on an empty stomach to prevent gastric irritation.',
        typicalUse: 'Relief of tension headache, forehead tightness, and neck strain pain.'
      });

      homeRemedies.push(
        {
          title: 'Dark Quiet Room & Screen Detox',
          instructions: 'Dim lights, turn off smartphone/laptop screens, and rest in a quiet space for 30-45 minutes.',
          benefit: 'Reduces sensory stimulation on trigeminal vascular nerve pathways.'
        },
        {
          title: 'Cold or Warm Gel Compress',
          instructions: 'Place a cool cloth over the forehead or a warm pad over the back of the neck for 15 minutes.',
          benefit: 'Eases scalp muscle tension and constricts dilated throbbing blood vessels.'
        },
        {
          title: 'Proper Hydration with Electrolytes',
          instructions: 'Drink 500ml of water slowly; mild dehydration is one of the leading triggers for acute headaches.',
          benefit: 'Restores vascular fluid volume and eases brain tissue tension.'
        }
      );
    }

    whenToSeekEmergency.push(
      'Headache following a head injury or fall',
      'Headache with numbness, facial drooping, slurred speech, or blurred vision',
      'Worst headache of your entire life with sudden onset'
    );
  } else if (symptom === 'cold_sneezing') {
    specialties.unshift('Ear, Nose & Throat Specialist (ENT)');
    otcs.push(
      {
        name: 'Cetirizine 10mg OR Loratadine 10mg Tablets',
        category: 'Non-Drowsy Antihistamine',
        dosageGuide: '1 tablet once daily in the evening or morning with water.',
        childDosageNote: 'For children 2-12 years, use pediatric Cetirizine syrup (2.5mg - 5mg once daily).',
        safetyCaution: 'May cause mild drowsiness in sensitive individuals; avoid driving if drowsy.',
        typicalUse: 'Controls sneezing, watery itchy eyes, runny nose, and allergic histamine reactions.'
      },
      {
        name: 'Isotonic Saline Nasal Spray (0.9% NaCl)',
        category: 'Nasal Decongestant (Drug-Free)',
        dosageGuide: '2 sprays in each nostril 3 to 4 times a day as needed.',
        safetyCaution: 'Completely safe for infants, children, seniors, and pregnant women. Non-addictive.',
        typicalUse: 'Cleanses allergens, thins thickened mucus, and relieves nasal blockage without rebound congestion.'
      }
    );

    homeRemedies.push(
      {
        title: 'Warm Steam Inhalation',
        instructions: 'Inhale gentle steam from a bowl of hot water or personal facial steamer for 5-10 minutes twice daily.',
        benefit: 'Moisturizes dry mucosal lining and loosens trapped sinus secretions.'
      },
      {
        title: 'Warm Saline Gargle',
        instructions: 'Dissolve 1/2 tsp salt in 1 cup warm water. Gargle for 30 seconds, 3 times a day.',
        benefit: 'Reduces pharyngeal swelling and soothes raw post-nasal drip irritation.'
      },
      {
        title: 'Honey and Warm Ginger Lemon Tea',
        instructions: 'Sip warm water or tea with 1 tsp natural honey and ginger (Note: Never give honey to infants under 1 year).',
        benefit: 'Coats irritated mucosal throat receptors and reduces coughing reflexes.'
      }
    );

    whenToSeekEmergency.push(
      'Shortness of breath, high-pitched wheezing, or stridor',
      'Severe pain swelling over cheeks and around eyes with high fever',
      'Inability to swallow saliva or open mouth fully'
    );
  } else if (symptom === 'skin_rash') {
    specialties.unshift('Consultant Dermatologist');
    const rashAnswer = answers['q5_rash_appearance'] || '';
    if (rashAnswer.includes('Purple spots') || rashAnswer.includes('does NOT fade')) {
      severity = 'emergency';
      redFlags.push('Non-blanching petechial/purpuric rash requires urgent hospital evaluation for systemic infection / vasculitis.');
      whenToSeekEmergency.push('Non-blanching purple spots that do not fade when pressed with a glass');
    }

    if (severity !== 'emergency') {
      otcs.push(
        {
          name: 'Calamine Lotion Topical Suspension',
          category: 'Soothing Antipruritic',
          dosageGuide: 'Apply a thin layer to affected itchy areas with clean cotton 2 to 3 times daily. Allow to dry.',
          safetyCaution: 'For external use only. Do not apply inside eyes, mouth, or on open deep lacerations.',
          typicalUse: 'Soothes intense itching, contact dermatitis, insect bites, and cooling hives.'
        },
        {
          name: 'Hydrocortisone 1% Cream (Mild OTC Corticosteroid)',
          category: 'Anti-inflammatory Topical',
          dosageGuide: 'Apply sparingly to red, inflamed patches twice daily for a maximum of 5 to 7 days.',
          safetyCaution: 'Do not use on fungal ringworm or face without doctor supervision. Avoid broken skin.',
          typicalUse: 'Calms allergic contact rashes, eczema flare-ups, and poison ivy irritation.'
        }
      );

      homeRemedies.push(
        {
          title: 'Cool Oatmeal Bath or Cold Compress',
          instructions: 'Apply a clean cloth soaked in cool water for 10-15 minutes or soak in a colloidal oatmeal bath.',
          benefit: 'Calms nerve endings and dramatically suppresses the urge to scratch.'
        },
        {
          title: 'Fragrance-Free Ceramide Moisturizer',
          instructions: 'Apply gentle, fragrance-free lotion within 3 minutes after washing while skin is still damp.',
          benefit: 'Repairs the compromised epidermal skin barrier and locks in hydration.'
        },
        {
          title: 'Trim Nails & Wear Breathable Cotton',
          instructions: 'Keep fingernails short and rounded to prevent secondary bacterial scratch infections (impetigo).',
          benefit: 'Prevents micro-tears in fragile inflamed skin.'
        }
      );
    }

    whenToSeekEmergency.push(
      'Rash accompanied by swelling of lips, tongue, or difficulty breathing (Anaphylaxis)',
      'Rapidly spreading skin redness that is extremely painful, hot, or streaking',
      'Blisters covering more than 10% of total body surface'
    );
  } else if (symptom === 'small_cuts') {
    const cutAnswer = answers['q5_cut_characteristics'] || '';
    if (cutAnswer.includes('Deep gaping') || cutAnswer.includes('Active bleeding')) {
      severity = 'severe';
      redFlags.push('Wound depth requires physician closure (sutures/steri-strips) within 6-8 hours to prevent infection and scarring.');
      whenToSeekEmergency.push('Wound gaping more than 0.5 cm or bleeding steadily after 10 min firm pressure');
    }

    otcs.push(
      {
        name: 'Povidone-Iodine 5% or Bacitracin/Polymyxin Ointment',
        category: 'Topical Antiseptic / Antibiotic',
        dosageGuide: 'Apply a tiny dab over the clean, dry cut 1 to 2 times daily before applying a sterile bandage.',
        safetyCaution: 'Clean the cut thoroughly with mild soap and water first. Do not use harsh hydrogen peroxide repeatedly.',
        typicalUse: 'Prevents bacterial colonization in minor abrasions and clean scrapes.'
      },
      {
        name: 'Sterile Adhesive Bandages / Hydrocolloid Dressing',
        category: 'Wound Dressing',
        dosageGuide: 'Change bandage daily or whenever it gets wet or soiled.',
        safetyCaution: 'Allow minor scabbed cuts to air out once closed.',
        typicalUse: 'Protects the wound bed from dust, friction, and environmental contamination.'
      }
    );

    homeRemedies.push(
      {
        title: 'Direct Pressure with Clean Gauze',
        instructions: 'Press firmly on the wound with a clean cloth or sterile gauze continuously for 5 to 10 minutes without peeking.',
        benefit: 'Activates platelet aggregation and natural clotting cascade.'
      },
      {
        title: 'Gentle Running Water Irrigation',
        instructions: 'Hold the cut under cool running tap water for 2-3 minutes to gently wash away foreign dirt particles.',
        benefit: 'Significantly reduces bacterial count without chemical tissue cytotoxicity.'
      },
      {
        title: 'Elevation Above Heart Level',
        instructions: 'If cut is on finger or arm, rest it elevated on a pillow above heart level for the first hour.',
        benefit: 'Decreases capillary hydrostatic pressure and reduces throbbing and swelling.'
      }
    );

    whenToSeekEmergency.push(
      'Wound caused by deep rusty nail, puncture, or animal/human bite (urgent Tetanus / Rabies protocol)',
      'Numbness, loss of sensation, or inability to move joint past the laceration',
      'Spreading red streaks, pus, or increasing heat 24-48 hours later'
    );
  } else {
    // Default general illness / stomach upset / aches
    otcs.push({
      name: 'Oral Rehydration Salts (ORS) / Electrolyte Solution',
      category: 'Fluid & Electrolyte Restorer',
      dosageGuide: 'Mix 1 packet in exactly 1 liter of clean drinking water. Sip 200-300ml after each loose motion or fever sweat.',
      safetyCaution: 'Follow package dilution instructions precisely. Do not boil already mixed ORS.',
      typicalUse: 'Prevents clinical dehydration and replenishes cellular potassium and sodium.'
    });

    homeRemedies.push(
      {
        title: 'BRAT Diet (Bananas, Rice, Applesauce, Toast)',
        instructions: 'Eat bland, non-spicy, low-fiber soft foods in small frequent portions.',
        benefit: 'Easily digestible and gentle on an inflamed gastrointestinal mucosal lining.'
      },
      {
        title: 'Rest & Gentle Posture',
        instructions: 'Rest in a semi-upright or reclined position. Avoid bending forward immediately after meals.',
        benefit: 'Allows the body to allocate metabolic energy toward cellular repair and immune defense.'
      }
    );
  }

  // Determine clinical summary
  let clinicalSummary = '';
  if (severity === 'emergency') {
    clinicalSummary = `URGENT MEDICAL ATTENTION REQUIRED: Your responses indicate high-priority red flag symptoms (${redFlags.join(', ')}). Immediate evaluation at the nearest emergency department or urgent care clinic is strongly recommended.`;
  } else if (severity === 'severe') {
    clinicalSummary = `PHYSICIAN EVALUATION RECOMMENDED TODAY: Your symptoms are clinically significant and should be examined in-person by a medical professional within the next few hours to prevent complications.`;
  } else if (severity === 'moderate') {
    clinicalSummary = `MONITORED CARE WITH MEDICAL OVERSIGHT: Your symptoms appear manageable with basic supportive care, but you should consult a doctor within 24 to 48 hours if no noticeable improvement occurs.`;
  } else {
    clinicalSummary = `MILD SYMPTOM PROFILE (SAFE HOME CARE): Your responses align with a benign, self-limiting condition. Safe over-the-counter support, hydration, and rest are appropriate first-line measures.`;
  }

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
    whenToSeekEmergency
  };
}
