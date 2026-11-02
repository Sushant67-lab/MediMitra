export type AgeCategory = 'child' | 'teen' | 'adult' | 'senior';
export type BiologicalSex = 'male' | 'female' | 'other';
export type SeverityLevel = 'mild' | 'moderate' | 'severe' | 'emergency';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  ageCategory: AgeCategory;
  sex: BiologicalSex;
  isPregnantOrNursing?: boolean;
  chronicConditions?: string[];
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

export type SymptomCategory = 
  | 'fever'
  | 'headache'
  | 'cold_sneezing'
  | 'skin_rash'
  | 'small_cuts'
  | 'stomach_upset'
  | 'cough_throat'
  | 'body_ache'
  | 'other';

export interface SymptomInfo {
  id: SymptomCategory;
  name: string;
  hindiName?: string;
  description: string;
  iconName: string;
  color: string;
  typicalOnset: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user' | 'system';
  text: string;
  timestamp: string;
  questionId?: string;
  options?: string[];
  selectedOption?: string;
  badge?: string;
  isRedFlagWarning?: boolean;
}

export interface TriageQuestion {
  id: string;
  stepNumber: number;
  question: string;
  subtext?: string;
  options: string[];
  allowFreeText?: boolean;
  freeTextPlaceholder?: string;
  applicableCategories?: SymptomCategory[];
  relevanceNote?: string; // e.g. "Tailored for Pediatric Patient" or "Pregnancy Safety Check"
}

export interface OtcMedicine {
  name: string;
  category: string;
  dosageGuide: string;
  childDosageNote?: string;
  safetyCaution: string;
  typicalUse: string;
}

export interface HomeRemedy {
  title: string;
  instructions: string;
  benefit: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  address: string;
  distanceKm: number;
  rating: number;
  reviewsCount: number;
  nextAvailable: string;
  phone: string;
  fee: string;
  emergency24x7?: boolean;
  latitude: number;
  longitude: number;
}

export interface TriageAssessment {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientSex: BiologicalSex;
  patientCategory: AgeCategory;
  timestamp: string;
  primarySymptom: SymptomCategory;
  severity: SeverityLevel;
  clinicalSummary: string;
  keyObservations: string[];
  redFlagsDetected: string[];
  recommendedOtcs: OtcMedicine[];
  homeRemedies: HomeRemedy[];
  recommendedSpecialties: string[];
  recommendedDoctors: Doctor[];
  followUpHours: number;
  whenToSeekEmergency: string[];
}

export interface QuestionContext {
  ageCategory: AgeCategory;
  age: number;
  sex: BiologicalSex;
  isPregnantOrNursing?: boolean;
  symptom: SymptomCategory;
  answers: Record<string, string>;
}

export interface MedicalRecord {
  id: string;
  date: string;
  primarySymptom: string;
  severity: SeverityLevel;
  patientName: string;
  age: number;
  sex: string;
  summary: string;
  prescribedOtcs: string[];
  doctorReferred?: string;
}
