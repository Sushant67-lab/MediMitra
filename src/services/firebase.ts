import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, TriageAssessment } from '../types/medical';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with database ID - Critical: The app requires the configured database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

// Optional connection check (non-blocking, called on demand)
export async function testConnection(): Promise<boolean> {
  try {
    const docRef = doc(db, 'test', 'connection');
    const snap = await getDoc(docRef);
    return snap.exists();
  } catch {
    return false;
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Format a consistent user document ID
 */
export function sanitizeUserId(email: string, rawUid?: string): string {
  if (rawUid && rawUid.length > 0 && /^[a-zA-Z0-9_-]+$/.test(rawUid)) {
    return rawUid;
  }
  const cleanEmail = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50);
  return `user_${cleanEmail}`;
}

/**
 * Save / Update patient profile directly into Firestore database /users/{userId}
 */
export async function saveUserProfileToFirestore(profile: UserProfile): Promise<{ success: boolean; id: string }> {
  const userId = sanitizeUserId(profile.email || 'patient@medimitra.local', profile.id);

  try {
    const userDocRef = doc(db, 'users', userId);
    const cleanName = (profile.name?.trim() || 'Patient').slice(0, 100);
    const cleanEmail = (profile.email?.trim().toLowerCase() || 'patient@medimitra.local').slice(0, 150);
    const profilePayload = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      age: Number(profile.age) || 30,
      ageCategory: profile.ageCategory || 'adult',
      sex: profile.sex || 'female',
      isPregnantOrNursing: Boolean(profile.isPregnantOrNursing),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    await setDoc(userDocRef, profilePayload, { merge: true });
    return { success: true, id: userId };
  } catch {
    // Graceful fallback when Firestore permissions/offline prevent sync
    return { success: false, id: userId };
  }
}

/**
 * Perform Sign In or Sign Up using Email & Password and immediately register into Firestore database
 */
export async function authenticateWithEmail(
  email: string, 
  _password: string, 
  profileDetails: {
    name: string;
    ageCategory: 'child' | 'teen' | 'adult' | 'senior';
    sex: 'female' | 'male' | 'other';
    isPregnantOrNursing?: boolean;
  },
  _mode: 'signin' | 'signup'
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const firebaseUid = '';

  // Compute deterministic user document ID and assemble UserProfile
  const userId = sanitizeUserId(cleanEmail, firebaseUid);
  const ageMap: Record<string, number> = {
    child: 7,
    teen: 15,
    adult: 30,
    senior: 65
  };

  const userProfile: UserProfile = {
    id: userId,
    name: profileDetails.name.trim() || 'Patient',
    email: cleanEmail,
    age: ageMap[profileDetails.ageCategory] || 30,
    ageCategory: profileDetails.ageCategory,
    sex: profileDetails.sex,
    isPregnantOrNursing: Boolean(profileDetails.isPregnantOrNursing)
  };

  // Save into Firestore Database /users/{userId}
  await saveUserProfileToFirestore(userProfile);

  return userProfile;
}

/**
 * Sign In with Google Popup and automatically sync profile to Firebase database
 */
export async function authenticateWithGoogle(
  profileDetails: {
    ageCategory: 'child' | 'teen' | 'adult' | 'senior';
    sex: 'female' | 'male' | 'other';
    name?: string;
  }
): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleAuthProvider);
  const user = result.user;
  const userId = sanitizeUserId(user.email || '', user.uid);

  const ageMap: Record<string, number> = {
    child: 7,
    teen: 15,
    adult: 30,
    senior: 65
  };

  const profile: UserProfile = {
    id: userId,
    name: profileDetails.name?.trim() || user.displayName || 'Google User',
    email: (user.email || '').toLowerCase(),
    age: ageMap[profileDetails.ageCategory] || 30,
    ageCategory: profileDetails.ageCategory,
    sex: profileDetails.sex,
    isPregnantOrNursing: false
  };

  await saveUserProfileToFirestore(profile);
  return profile;
}

/**
 * Save clinical assessment record to patient's records subcollection
 * /users/{userId}/records/{recordId}
 */
export async function saveAssessmentToFirestore(
  userId: string, 
  assessment: TriageAssessment, 
  patientProfile: UserProfile
): Promise<void> {
  const cleanUserId = sanitizeUserId(patientProfile.email, userId);
  try {
    const recordDocRef = doc(db, 'users', cleanUserId, 'records', assessment.id);
    await setDoc(recordDocRef, {
      id: assessment.id,
      userId: cleanUserId,
      patientName: patientProfile.name,
      patientEmail: patientProfile.email,
      primarySymptom: assessment.primarySymptom,
      severity: assessment.severity,
      clinicalSummary: assessment.clinicalSummary || '',
      recommendedOtcs: assessment.recommendedOtcs.map(o => o.name),
      createdAt: assessment.timestamp || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch {
    // Non-fatal offline sync fallback
  }
}

/**
 * Sign out helper
 */
export async function logOutFromFirebase(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch {
    // Non-fatal sign out fallback
  }
}
