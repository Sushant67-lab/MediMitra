import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocFromServer, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
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

// Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or connecting...');
    }
    return false;
  }
}

// Connection test run
testConnection();

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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
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
  const userId = sanitizeUserId(profile.email, profile.id);
  const targetPath = `users/${userId}`;

  try {
    const userDocRef = doc(db, 'users', userId);
    const profilePayload = {
      id: userId,
      name: profile.name.trim() || 'Patient',
      email: profile.email.trim().toLowerCase(),
      age: Number(profile.age) || 30,
      ageCategory: profile.ageCategory || 'adult',
      sex: profile.sex || 'female',
      isPregnantOrNursing: Boolean(profile.isPregnantOrNursing),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    await setDoc(userDocRef, profilePayload, { merge: true });
    console.info(`✓ Successfully saved user profile to Firebase Firestore database: /users/${userId}`);
    return { success: true, id: userId };
  } catch (err) {
    console.error('Error saving user profile to Firestore:', err);
    try {
      handleFirestoreError(err, OperationType.WRITE, targetPath);
    } catch {
      // Return fallback to not hard-crash the user experience
      return { success: false, id: userId };
    }
  }
}

/**
 * Perform Sign In or Sign Up using Email & Password and immediately register into Firestore database
 */
export async function authenticateWithEmail(
  email: string, 
  password: string, 
  profileDetails: {
    name: string;
    ageCategory: 'child' | 'teen' | 'adult' | 'senior';
    sex: 'female' | 'male' | 'other';
    isPregnantOrNursing?: boolean;
  },
  mode: 'signin' | 'signup'
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  let firebaseUid = '';

  // 1. Attempt Firebase Auth
  try {
    if (mode === 'signup') {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        firebaseUid = cred.user.uid;
      } catch (signUpErr: any) {
        // If email already exists, try signing in with the provided password
        if (signUpErr?.code === 'auth/email-already-in-use') {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
          firebaseUid = cred.user.uid;
        } else if (signUpErr?.code === 'auth/operation-not-allowed') {
          console.warn('Firebase email/password provider not enabled yet; proceeding with direct Firestore user document creation.');
        } else {
          throw signUpErr;
        }
      }
    } else {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        firebaseUid = cred.user.uid;
      } catch (signInErr: any) {
        // If user not found, try creating account transparently
        if (signInErr?.code === 'auth/user-not-found') {
          const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          firebaseUid = cred.user.uid;
        } else if (signInErr?.code === 'auth/operation-not-allowed') {
          console.warn('Firebase email/password provider not enabled yet; proceeding with direct Firestore user document creation.');
        } else {
          throw signInErr;
        }
      }
    }
  } catch (authError: any) {
    // If it's a wrong password error, notify caller
    if (authError?.code === 'auth/wrong-password' || authError?.code === 'auth/invalid-credential') {
      throw new Error('Incorrect password. Please verify your credentials.');
    }
    console.warn('Firebase Auth notice:', authError?.message || authError);
  }

  // 2. Compute UID and assemble UserProfile
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

  // 3. Save into Firestore Database /users/{userId}
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
  const path = `users/${cleanUserId}/records/${assessment.id}`;
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
    console.info(`✓ Successfully saved medical assessment to Firebase: ${path}`);
  } catch (err) {
    console.warn('Could not sync checkup record to Firestore:', err);
  }
}

/**
 * Sign out helper
 */
export async function logOutFromFirebase(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.warn('Sign out warning', e);
  }
}
