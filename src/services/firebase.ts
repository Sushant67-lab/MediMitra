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
  getDocFromServer, 
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

// Connection validation on boot using getDocFromServer
export async function testConnection(): Promise<boolean> {
  try {
    const docRef = doc(db, 'test', 'connection');
    const snap = await getDocFromServer(docRef);
    return snap.exists();
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return false;
  }
}

void testConnection();

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

function generateSaltHex(): string {
  const bytes = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function fallbackSha256Hex(ascii: string): string {
  const rightRotate = (value: number, amount: number) => (value >>> amount) | (value << (32 - amount));
  const maxWord = Math.pow(2, 32);
  let result = '';
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;
  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;
  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) isComposite[i] = true;
      hash[primeCounter] = (Math.pow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (let i = 0; i < ascii.length; i++) {
    const j = ascii.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;
  for (let j = 0; j < words.length;) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const a = hash[0];
      const e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] = i < 16
          ? w[i]
          : (w[i - 16] +
              (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
              w[i - 7] +
              (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
            0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }
    for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

async function hashPassword(password: string, salt: string, email: string): Promise<string> {
  const payload = `${salt}:${email}:${password}`;
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoded = new TextEncoder().encode(payload);
    const digest = await window.crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  }
  return fallbackSha256Hex(payload);
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
 * Verify and authenticate user strictly against Firestore database (/users/{userId}):
 * - Sign In: Queries Firestore directly; ONLY users whose email already exists in the database can sign in.
 * - Sign Up: Checks Firestore directly to prevent duplicate registration, then stores the verified account + salted password hash.
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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const userId = sanitizeUserId(cleanEmail);
  const userDocPath = `users/${userId}`;
  const userDocRef = doc(db, 'users', userId);
  const ageMap: Record<string, number> = {
    child: 7,
    teen: 15,
    adult: 30,
    senior: 65
  };

  let existingSnap;
  try {
    existingSnap = await getDocFromServer(userDocRef);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('insufficient')) {
      handleFirestoreError(err, OperationType.GET, userDocPath);
    }
    throw new Error('Unable to reach the database to verify your email. Please check your internet connection and try again.');
  }

  if (mode === 'signin') {
    if (!existingSnap.exists()) {
      throw new Error('No registered account found for this email in the database. Please create an account (Sign Up) first.');
    }

    const dbUser = existingSnap.data() as Record<string, any>;
    const dbEmail = String(dbUser.email || '').trim().toLowerCase();
    if (!dbEmail || dbEmail !== cleanEmail) {
      throw new Error('Email verification failed: no matching account found in the database.');
    }

    if (dbUser.authProvider === 'google' && !dbUser.passwordHash) {
      throw new Error('This email is registered with Google Sign-In. Please click "Enter Check-up with Google" to sign in.');
    }

    if (dbUser.passwordHash && dbUser.passwordSalt) {
      const candidateHash = await hashPassword(password, String(dbUser.passwordSalt), cleanEmail);
      if (candidateHash !== dbUser.passwordHash) {
        throw new Error('Incorrect password. Please verify your password and try again.');
      }
    }

    const now = new Date().toISOString();
    const patch: Record<string, any> = {
      accountCreated: true,
      lastLoginAt: now,
      updatedAt: now
    };
    if (!dbUser.passwordHash || !dbUser.passwordSalt) {
      const salt = generateSaltHex();
      patch.passwordSalt = salt;
      patch.passwordHash = await hashPassword(password, salt, cleanEmail);
      patch.authProvider = 'email';
    }

    try {
      await setDoc(userDocRef, patch, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, userDocPath);
    }

    const resolvedCategory = (dbUser.ageCategory as UserProfile['ageCategory']) || profileDetails.ageCategory || 'adult';
    const resolvedSex = (dbUser.sex as UserProfile['sex']) || profileDetails.sex || 'female';

    return {
      id: userId,
      name: String(dbUser.name || profileDetails.name || 'Patient').trim().slice(0, 100),
      email: cleanEmail,
      age: Number(dbUser.age) || ageMap[resolvedCategory] || 30,
      ageCategory: resolvedCategory,
      sex: resolvedSex,
      isPregnantOrNursing: Boolean(dbUser.isPregnantOrNursing)
    };
  }

  // mode === 'signup'
  if (existingSnap.exists()) {
    const existingData = existingSnap.data() as Record<string, any>;
    if (String(existingData?.email || '').trim().toLowerCase() === cleanEmail) {
      throw new Error('An account with this email already exists in the database. Please sign in instead.');
    }
  }

  const cleanName = (profileDetails.name?.trim() || '').slice(0, 100);
  if (!cleanName) {
    throw new Error('Please enter the patient name before creating an account.');
  }

  const salt = generateSaltHex();
  const passwordHash = await hashPassword(password, salt, cleanEmail);
  const now = new Date().toISOString();

  const userProfile: UserProfile = {
    id: userId,
    name: cleanName,
    email: cleanEmail,
    age: ageMap[profileDetails.ageCategory] || 30,
    ageCategory: profileDetails.ageCategory,
    sex: profileDetails.sex,
    isPregnantOrNursing: Boolean(profileDetails.isPregnantOrNursing)
  };

  try {
    await setDoc(userDocRef, {
      ...userProfile,
      accountCreated: true,
      authProvider: 'email',
      passwordHash,
      passwordSalt: salt,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, userDocPath);
  }

  return userProfile;
}

/**
 * Sign In with Google Popup and verify/sync profile in Firebase database
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
  const cleanEmail = (user.email || '').trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('Google account did not provide a verified email address.');
  }

  const userId = sanitizeUserId(cleanEmail, user.uid);
  const userDocRef = doc(db, 'users', userId);

  const ageMap: Record<string, number> = {
    child: 7,
    teen: 15,
    adult: 30,
    senior: 65
  };

  let existingData: Record<string, any> | null = null;
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      existingData = snap.data() as Record<string, any>;
    }
  } catch {
    // Graceful fallback
  }

  const resolvedCategory = (existingData?.ageCategory as UserProfile['ageCategory']) || profileDetails.ageCategory || 'adult';
  const resolvedSex = (existingData?.sex as UserProfile['sex']) || profileDetails.sex || 'female';

  const profile: UserProfile = {
    id: userId,
    name: String(existingData?.name || profileDetails.name?.trim() || user.displayName || 'Google User'),
    email: cleanEmail,
    age: Number(existingData?.age) || ageMap[resolvedCategory] || 30,
    ageCategory: resolvedCategory,
    sex: resolvedSex,
    isPregnantOrNursing: Boolean(existingData?.isPregnantOrNursing)
  };

  const now = new Date().toISOString();
  try {
    await setDoc(userDocRef, {
      ...profile,
      accountCreated: true,
      authProvider: 'google',
      updatedAt: now,
      lastLoginAt: now,
      ...(existingData ? {} : { createdAt: now })
    }, { merge: true });
  } catch {
    await saveUserProfileToFirestore(profile);
  }

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
