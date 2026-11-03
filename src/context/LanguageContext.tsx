import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'hi' | 'hinglish' | 'mr' | 'bn' | 'ta' | 'te' | 'gu';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'hinglish', label: 'Hinglish', nativeName: 'Hinglish (हिंग्लिश)', flag: '💬' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
];

export interface Translations {
  // Brand
  brandName: string;
  brandTagline: string;
  proverb: string;
  proverbSub: string;

  // Header
  nearestDoctors: string;
  signOut: string;
  editPatient: string;
  languageSelect: string;

  // Auth Screen Step 1
  whoNeedsCheckup: string;
  step1Subtitle: string;
  patientNameLabel: string;
  patientNamePlaceholder: string;
  whoIsThisFor: string;
  kidLabel: string;
  kidSub: string;
  adultLabel: string;
  adultSub: string;
  seniorLabel: string;
  seniorSub: string;
  genderLabel: string;
  femaleLabel: string;
  femaleSub: string;
  maleLabel: string;
  maleSub: string;
  continueToCheckup: string;

  // Auth Screen Step 2
  authStepTitle: string;
  authStepSubtitle: string;
  authStepBadge: string;
  patientProfileSummary: string;
  editDetails: string;
  emailLabel: string;
  emailPlaceholder: string;
  emailDisclaimer: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  enterCheckupBtn: string;
  createAccountBtn: string;
  orContinueWith: string;
  googleSignInBtn: string;
  guestModeBtn: string;
  needAccount: string;
  alreadyHaveAccount: string;

  // Front Page
  greeting: string;
  frontSubtitle: string;
  customSearchPlaceholder: string;
  startCheckupBtn: string;
  commonIssuesTitle: string;
  commonIssuesSubtitle: string;
  needDoctorTitle: string;
  needDoctorSubtitle: string;
  findDoctorsBtn: string;
  emergencyTitle: string;
  emergencySubtitle: string;
  emergencyCallBtn: string;

  // Symptoms
  symptomHeadache: string;
  symptomHeadacheDesc: string;
  symptomFever: string;
  symptomFeverDesc: string;
  symptomRash: string;
  symptomRashDesc: string;
  symptomCold: string;
  symptomColdDesc: string;
  symptomStomach: string;
  symptomStomachDesc: string;
  symptomCuts: string;
  symptomCutsDesc: string;
  symptomBodyAche: string;
  symptomBodyAcheDesc: string;

  // Triage Chat
  question: string;
  of: string;
  chatWelcome: string;
  tapAnswerHint: string;
  customInputPlaceholder: string;
  sendBtn: string;
  restartBtn: string;
  backHomeBtn: string;
  redFlagTitle: string;
  redFlagDesc: string;
  consultDoctorNowBtn: string;
  analyzingAnswers: string;
  viewReportBtn: string;

  // Results & Report
  reportTitle: string;
  reportSub: string;
  patientDetailsTitle: string;
  severityTitle: string;
  severityMild: string;
  severityModerate: string;
  severitySevere: string;
  severityEmergency: string;
  sendReportEmailTitle: string;
  sendReportEmailSubtitle: string;
  sendReportBtn: string;
  sendingBtn: string;
  reportSentNotice: string;
  downloadPdfBtn: string;
  recommendedMedsTitle: string;
  homeCareTitle: string;
  nearestDoctorsTitle: string;
  openGoogleMaps: string;
  startNewCheckupBtn: string;

  // Doctor Locator
  locatorHeading: string;
  locatorSubtitle: string;
  detectLocationBtn: string;
  currentLocationLabel: string;
  allSpecialties: string;
  searchClinicsPlaceholder: string;
  callClinicBtn: string;
  getDirectionsBtn: string;
  bookVisitBtn: string;

  // Footer
  footerTagline: string;
  switchProfileBtn: string;
  emergencyNumber: string;
}

const TRANSLATIONS: Record<LanguageCode, Translations> = {
  en: {
    brandName: 'MediMitra',
    brandTagline: 'Your Health Friend',
    proverb: '“Health is the greatest wealth”',
    proverbSub: 'पहला सुख निरोगी काया',

    nearestDoctors: 'Nearest Doctors',
    signOut: 'Sign Out',
    editPatient: 'Edit Patient Information',
    languageSelect: 'Language',

    whoNeedsCheckup: 'Who needs a check-up today?',
    step1Subtitle: 'Step 1 of 2: Basic patient information',
    patientNameLabel: 'Name of the Patient',
    patientNamePlaceholder: 'e.g. Rahul, Priya, Aarav',
    whoIsThisFor: 'Who is this check-up for?',
    kidLabel: 'Kid / Child',
    kidSub: 'Under 12',
    adultLabel: 'Adult',
    adultSub: '18 - 59',
    seniorLabel: 'Old Person',
    seniorSub: '60+',
    genderLabel: 'Gender',
    femaleLabel: 'Woman / Female',
    femaleSub: 'Maternity & hormonal aware',
    maleLabel: 'Man / Male',
    maleSub: 'Standard adult care',
    continueToCheckup: 'Continue to Check-up',

    authStepTitle: 'Sign In or Sign Up',
    authStepSubtitle: 'Records patient check-up in Firebase database',
    authStepBadge: 'Step 2 of 2: Secure Medical Record Sync',
    patientProfileSummary: 'Patient',
    editDetails: 'Edit',
    emailLabel: 'Your Email Address',
    emailPlaceholder: 'you@example.com',
    emailDisclaimer: 'Your checkup report will be dispatched to this email address',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Minimum 6 characters',
    enterCheckupBtn: 'Enter Medical Check-up',
    createAccountBtn: 'Create Account & Enter',
    orContinueWith: 'or continue with',
    googleSignInBtn: 'Enter Check-up with Google',
    guestModeBtn: 'Quick Guest Mode (Skip Email)',
    needAccount: 'New patient? Create an account',
    alreadyHaveAccount: 'Already have an account? Sign In',

    greeting: 'How are you feeling today',
    frontSubtitle: 'Select what problem you are facing below, or type your symptom. MediMitra will guide you through 10 simple questions and recommend safe medicine or the nearest doctor on Google Maps.',
    customSearchPlaceholder: 'Describe your symptoms in simple words (e.g., headache since morning, fever, rash)...',
    startCheckupBtn: 'Start Check-up',
    commonIssuesTitle: 'Choose a Common Health Issue',
    commonIssuesSubtitle: 'Tap any card to start a 10-question smart checkup',
    needDoctorTitle: 'Need a Doctor Right Now?',
    needDoctorSubtitle: 'Locate nearby clinics and doctors with directions on Google Maps',
    findDoctorsBtn: 'Find Nearest Doctors',
    emergencyTitle: 'Emergency or Severe Symptoms?',
    emergencySubtitle: 'If you have severe chest pain, breathing difficulty, or heavy bleeding, call emergency services immediately.',
    emergencyCallBtn: 'Call 112 / Emergency',

    symptomHeadache: 'Headache',
    symptomHeadacheDesc: 'Sar dard, throbbing forehead, tension, or migraine',
    symptomFever: 'Fever (Bukhar)',
    symptomFeverDesc: 'Hot body, chills, sweating, or general sickness',
    symptomRash: 'Rashes Problem',
    symptomRashDesc: 'Skin itching, red patches, bumps, or allergy',
    symptomCold: 'Cough & Cold',
    symptomColdDesc: 'Khansi, continuous sneezing, or runny nose',
    symptomStomach: 'Stomach Ache',
    symptomStomachDesc: 'Pet dard, cramps, gas, acidity, or nausea',
    symptomCuts: 'Small Cut Problem',
    symptomCutsDesc: 'Chhoti chot, kitchen scrape, or minor bleeding',
    symptomBodyAche: 'General Illness',
    symptomBodyAcheDesc: 'Badan dard, body weakness, or exhaustion',

    question: 'Question',
    of: 'of',
    chatWelcome: 'Hello! I am MediMitra, your digital health companion. I will ask you quick questions to understand your symptoms and recommend the right basic medicine or doctor.',
    tapAnswerHint: 'Tap your answer below or type your response:',
    customInputPlaceholder: 'Type your answer or symptom details...',
    sendBtn: 'Send',
    restartBtn: 'Start Over',
    backHomeBtn: 'Back to Home',
    redFlagTitle: 'Immediate Attention Alert',
    redFlagDesc: 'Based on this answer, we recommend consulting a physician or emergency doctor immediately.',
    consultDoctorNowBtn: 'Consult Doctor Now',
    analyzingAnswers: 'MediMitra is analyzing your answers & preparing recommendation...',
    viewReportBtn: 'View Check-up Report',

    reportTitle: 'Medical Check-up Summary',
    reportSub: 'Prepared by MediMitra Health Companion',
    patientDetailsTitle: 'Patient Information',
    severityTitle: 'Assessment & Severity',
    severityMild: 'Mild / Manageable at Home',
    severityModerate: 'Moderate / Doctor Consultation Advised',
    severitySevere: 'Severe / Doctor Visit Required',
    severityEmergency: 'Emergency / Immediate Hospital Care',
    sendReportEmailTitle: 'Send Medical Report to Your Email',
    sendReportEmailSubtitle: 'Dispatched to the email address provided during sign in',
    sendReportBtn: 'Send Report to Email',
    sendingBtn: 'Sending to Email...',
    reportSentNotice: 'Report dispatched to your email!',
    downloadPdfBtn: 'Download PDF Report',
    recommendedMedsTitle: 'Recommended Basic Medicine',
    homeCareTitle: 'Home Care & Recovery Advice',
    nearestDoctorsTitle: 'Nearest Doctors & Medical Clinics',
    openGoogleMaps: 'Open on Google Maps',
    startNewCheckupBtn: 'Start New Check-up',

    locatorHeading: 'Nearest Doctors & Medical Clinics',
    locatorSubtitle: 'Locate verified doctors and medical centers near you using live GPS',
    detectLocationBtn: 'Detect Live Location',
    currentLocationLabel: 'Current Location',
    allSpecialties: 'All Specialties',
    searchClinicsPlaceholder: 'Search clinic name, doctor, or address...',
    callClinicBtn: 'Call Clinic',
    getDirectionsBtn: 'Get Directions',
    bookVisitBtn: 'Book Appointment',

    footerTagline: 'MediMitra • Digital Medical Companion & Doctor Referral',
    switchProfileBtn: 'Switch Profile',
    emergencyNumber: 'Emergency: 112 / 911'
  },

  hi: {
    brandName: 'मेडीमित्र',
    brandTagline: 'आपका स्वास्थ्य मित्र',
    proverb: '“पहला सुख निरोगी काया”',
    proverbSub: 'स्वास्थ्य ही सबसे बड़ा धन है',

    nearestDoctors: 'नज़दीकी डॉक्टर',
    signOut: 'लॉग आउट',
    editPatient: 'मरीज की जानकारी बदलें',
    languageSelect: 'भाषा (Language)',

    whoNeedsCheckup: 'आज किसे चेक-अप की ज़रूरत है?',
    step1Subtitle: 'चरण 1: मरीज की सामान्य जानकारी',
    patientNameLabel: 'मरीज का नाम',
    patientNamePlaceholder: 'उदा. राहुल, प्रिया, आरव',
    whoIsThisFor: 'यह चेक-अप किसके लिए है?',
    kidLabel: 'बच्चा (Kid)',
    kidSub: '12 वर्ष से कम',
    adultLabel: 'वयस्क (Adult)',
    adultSub: '18 - 59 वर्ष',
    seniorLabel: 'बुजुर्ग (Senior)',
    seniorSub: '60+ वर्ष',
    genderLabel: 'लिंग (Gender)',
    femaleLabel: 'महिला / स्त्री',
    femaleSub: 'मातृत्व और हार्मोनल समझ सहित',
    maleLabel: 'पुरुष',
    maleSub: 'सामान्य वयस्क देखभाल',
    continueToCheckup: 'चेक-अप आगे बढ़ाएं',

    authStepTitle: 'साइन इन या नया खाता बनाएं',
    authStepSubtitle: 'मरीज का चेक-अप रिकॉर्ड सुरक्षित रूप से सेव होता है',
    authStepBadge: 'चरण 2: सुरक्षित मेडिकल रिकॉर्ड सिंक',
    patientProfileSummary: 'मरीज',
    editDetails: 'बदलें',
    emailLabel: 'आपका ईमेल पता',
    emailPlaceholder: 'you@example.com',
    emailDisclaimer: 'आपकी चेक-अप रिपोर्ट इसी ईमेल पर भेजी जाएगी',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: 'न्यूनतम 6 अक्षर',
    enterCheckupBtn: 'चेक-अप में प्रवेश करें',
    createAccountBtn: 'खाता बनाएं और शुरू करें',
    orContinueWith: 'या इसके साथ आगे बढ़ें',
    googleSignInBtn: 'Google से प्रवेश करें',
    guestModeBtn: 'अतिथि मोड (ईमेल छोड़ें)',
    needAccount: 'नए मरीज हैं? खाता बनाएं',
    alreadyHaveAccount: 'पहले से खाता है? साइन इन करें',

    greeting: 'आज आप कैसा महसूस कर रहे हैं',
    frontSubtitle: 'अपनी समस्या नीचे चुनें या लिखें। मेडीमित्र 10 आसान सवालों से आपकी जांच करेगा और सुरक्षित दवा या नज़दीकी डॉक्टर की सलाह देगा।',
    customSearchPlaceholder: 'अपनी समस्या आसान शब्दों में लिखें (जैसे सुबह से सिरदर्द, बुखार, दाने)...',
    startCheckupBtn: 'चेक-अप शुरू करें',
    commonIssuesTitle: 'सामान्य स्वास्थ्य समस्या चुनें',
    commonIssuesSubtitle: '10 सवालों का स्मार्ट चेक-अप शुरू करने के लिए किसी भी कार्ड पर टैप करें',
    needDoctorTitle: 'क्या तुरंत डॉक्टर की ज़रूरत है?',
    needDoctorSubtitle: 'गूगल मैप्स पर नज़दीकी क्लीनिक और डॉक्टरों का रास्ता देखें',
    findDoctorsBtn: 'नज़दीकी डॉक्टर खोजें',
    emergencyTitle: 'आपातकालीन या गंभीर लक्षण?',
    emergencySubtitle: 'यदि छाती में तेज दर्द, सांस लेने में तकलीफ या गहरा खून बह रहा है, तो तुरंत आपातकालीन सेवा को कॉल करें।',
    emergencyCallBtn: '112 पर कॉल करें',

    symptomHeadache: 'सिर दर्द',
    symptomHeadacheDesc: 'सिर का भारीपन, माइग्रेन, तनाव या माथे में दर्द',
    symptomFever: 'बुखार (Fever)',
    symptomFeverDesc: 'गर्म शरीर, ठंड लगना, पसीना या कमजोरी',
    symptomRash: 'खुजली और दाने',
    symptomRashDesc: 'त्वचा पर लाल चकत्ते, खुजली या एलर्जी',
    symptomCold: 'खांसी और जुकाम',
    symptomColdDesc: 'छींकें, बहती या बंद नाक, गले में खराश',
    symptomStomach: 'पेट दर्द और गैस',
    symptomStomachDesc: 'मरोड़, एसिडिटी, गैस या उल्टी जैसा लगना',
    symptomCuts: 'छोटी चोट या खरोंच',
    symptomCutsDesc: 'हल्का कट लगना, खरोंच या हल्का खून आना',
    symptomBodyAche: 'सामान्य कमजोरी / बदन दर्द',
    symptomBodyAcheDesc: 'मांसपेशियों में दर्द, थकान या भारीपन',

    question: 'प्रश्न',
    of: 'कुल',
    chatWelcome: 'नमस्ते! मैं मेडीमित्र हूं, आपका डिजिटल स्वास्थ्य साथी। मैं कुछ आसान सवाल पूछूंगा ताकि आपके लक्षणों को समझकर सही दवा या डॉक्टर बता सकूं।',
    tapAnswerHint: 'नीचे दिए गए विकल्पों पर टैप करें या अपना उत्तर लिखें:',
    customInputPlaceholder: 'अपना उत्तर या लक्षण यहां लिखें...',
    sendBtn: 'भेजें',
    restartBtn: 'दोबारा शुरू करें',
    backHomeBtn: 'होम पर वापस जाएं',
    redFlagTitle: 'तुरंत ध्यान देने योग्य चेतावनी',
    redFlagDesc: 'इस लक्षण के आधार पर हम तुरंत किसी विशेषज्ञ डॉक्टर से परामर्श लेने की सलाह देते हैं।',
    consultDoctorNowBtn: 'अभी डॉक्टर से संपर्क करें',
    analyzingAnswers: 'मेडीमित्र आपके उत्तरों का विश्लेषण कर रहा है...',
    viewReportBtn: 'चेक-अप रिपोर्ट देखें',

    reportTitle: 'मेडिकल चेक-अप सारांश',
    reportSub: 'मेडीमित्र डिजिटल स्वास्थ्य साथी द्वारा तैयार',
    patientDetailsTitle: 'मरीज की जानकारी',
    severityTitle: 'जांच परिणाम और स्थिति',
    severityMild: 'हल्का / घर पर देखभाल संभव',
    severityModerate: 'मध्यम / डॉक्टर से सलाह आवश्यक',
    severitySevere: 'गंभीर / डॉक्टर को तुरंत दिखाएं',
    severityEmergency: 'अति-गंभीर / तुरंत अस्पताल जाएं',
    sendReportEmailTitle: 'मेडिकल रिपोर्ट ईमेल पर प्राप्त करें',
    sendReportEmailSubtitle: 'साइन इन के दौरान दिए गए ईमेल पते पर भेजी जाएगी',
    sendReportBtn: 'ईमेल पर रिपोर्ट भेजें',
    sendingBtn: 'ईमेल भेजा जा रहा है...',
    reportSentNotice: 'रिपोर्ट आपके ईमेल पर भेज दी गई है!',
    downloadPdfBtn: 'PDF रिपोर्ट डाउनलोड करें',
    recommendedMedsTitle: 'सुझाई गई सामान्य दवाइयां',
    homeCareTitle: 'घरेलू देखभाल और सुधार के उपाय',
    nearestDoctorsTitle: 'नज़दीकी डॉक्टर और क्लीनिक',
    openGoogleMaps: 'गूगल मैप्स पर खोलें',
    startNewCheckupBtn: 'नया चेक-अप शुरू करें',

    locatorHeading: 'नज़दीकी डॉक्टर और अस्पताल',
    locatorSubtitle: 'लाइव जीपीएस के माध्यम से अपने आसपास प्रमाणित क्लीनिक और डॉक्टर खोजें',
    detectLocationBtn: 'मेरी लोकेशन खोजें',
    currentLocationLabel: 'वर्तमान लोकेशन',
    allSpecialties: 'सभी विशेषज्ञ',
    searchClinicsPlaceholder: 'क्लीनिक, डॉक्टर या पता खोजें...',
    callClinicBtn: 'कॉल करें',
    getDirectionsBtn: 'रास्ता देखें',
    bookVisitBtn: 'अपॉइंटमेंट लें',

    footerTagline: 'मेडीमित्र • डिजिटल स्वास्थ्य साथी और डॉक्टर परामर्श',
    switchProfileBtn: 'मरीज बदलें',
    emergencyNumber: 'आपातकालीन: 112 / 108'
  },

  hinglish: {
    brandName: 'MediMitra',
    brandTagline: 'Aapka Health Friend',
    proverb: '“Pehla Sukh Nirogi Kaya”',
    proverbSub: 'Health hi sabse bada dhan hai',

    nearestDoctors: 'Nazdeeki Doctors',
    signOut: 'Sign Out',
    editPatient: 'Patient Details Edit Karein',
    languageSelect: 'Language Chunein',

    whoNeedsCheckup: 'Aaj kiska check-up karna hai?',
    step1Subtitle: 'Step 1: Patient ki basic jaankari',
    patientNameLabel: 'Patient ka Naam',
    patientNamePlaceholder: 'Jaise Rahul, Priya, Aarav',
    whoIsThisFor: 'Yeh check-up kiske liye hai?',
    kidLabel: 'Baccha (Kid)',
    kidSub: '12 saal se kam',
    adultLabel: 'Adult (Bada)',
    adultSub: '18 - 59 saal',
    seniorLabel: 'Bujurg (Senior)',
    seniorSub: '60+ saal',
    genderLabel: 'Gender',
    femaleLabel: 'Female (Mahila)',
    femaleSub: 'Pregnancy aur hormonal aware',
    maleLabel: 'Male (Purush)',
    maleSub: 'Standard health care',
    continueToCheckup: 'Check-up Shuru Karein',

    authStepTitle: 'Sign In ya Naya Account Banayein',
    authStepSubtitle: 'Check-up record Firebase database me secure save hota hai',
    authStepBadge: 'Step 2: Medical Record Sync',
    patientProfileSummary: 'Patient',
    editDetails: 'Edit',
    emailLabel: 'Aapka Email Address',
    emailPlaceholder: 'you@example.com',
    emailDisclaimer: 'Aapki check-up report is email par bhej di jaayegi',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Kam se kam 6 characters',
    enterCheckupBtn: 'Check-up me Entry Karein',
    createAccountBtn: 'Account Banayein & Shuru Karein',
    orContinueWith: 'ya iske saath aage badhein',
    googleSignInBtn: 'Google se Sign In Karein',
    guestModeBtn: 'Quick Guest Mode (Email Skip)',
    needAccount: 'Naye patient hain? Account banayein',
    alreadyHaveAccount: 'Pehle se account hai? Sign In karein',

    greeting: 'Aaj aap kaisa feel kar rahe hain',
    frontSubtitle: 'Apni takleef neeche select karein ya likhein. MediMitra aapse 10 aasan sawaal pooch kar safe medicine ya nazdeeki doctor recommend karega.',
    customSearchPlaceholder: 'Apni problem simple words me likhein (jaise sar dard, bukhar, khujli)...',
    startCheckupBtn: 'Check-up Start Karein',
    commonIssuesTitle: 'Common Health Problem Chunein',
    commonIssuesSubtitle: '10 sawaal ka smart check-up start karne ke liye kisi bhi card par click karein',
    needDoctorTitle: 'Abhi Doctor ki Zaroorat Hai?',
    needDoctorSubtitle: 'Google Maps par nazdeeki clinics aur doctors ka direct rasta dekhein',
    findDoctorsBtn: 'Nazdeeki Doctor Dhundein',
    emergencyTitle: 'Emergency ya Serious Problem?',
    emergencySubtitle: 'Agar chest me tez dard, saans lene me dikkat ya heavy bleeding ho, toh turant 112 par call karein.',
    emergencyCallBtn: '112 / Emergency Call Karein',

    symptomHeadache: 'Sar Dard (Headache)',
    symptomHeadacheDesc: 'Sar dard, migraine, heavy sir ya tension',
    symptomFever: 'Bukhar (Fever)',
    symptomFeverDesc: 'Garam sharir, thand lagna, paseena ya kamzori',
    symptomRash: 'Khujli & Rashes',
    symptomRashDesc: 'Skin par laal daane, allergy ya khujli',
    symptomCold: 'Khansi & Zukam',
    symptomColdDesc: 'Chheenk, behti naak ya gale me kharash',
    symptomStomach: 'Pet Dard & Gas',
    symptomStomachDesc: 'Cramps, acidity, gas ya ulti jaisa lagna',
    symptomCuts: 'Chhoti Chot (Cuts)',
    symptomCutsDesc: 'Kitchen cut, khronch ya halka khoon',
    symptomBodyAche: 'Badan Dard & Kamzori',
    symptomBodyAcheDesc: 'Muscle dard, thakan ya weakness',

    question: 'Sawaal',
    of: 'me se',
    chatWelcome: 'Namaste! Main hoon MediMitra, aapka digital health dost. Main aapse kuch quick questions poochunga taaki sahi dawai ya doctor suggest kar sakun.',
    tapAnswerHint: 'Neeche options par tap karein ya type karein:',
    customInputPlaceholder: 'Apna answer yahan type karein...',
    sendBtn: 'Send',
    restartBtn: 'Dobara Shuru Karein',
    backHomeBtn: 'Home par Jayein',
    redFlagTitle: 'Urgent Attention Alert',
    redFlagDesc: 'Is symptom ke liye hum recommend karte hain ki turant kisi qualified doctor ko dikhayein.',
    consultDoctorNowBtn: 'Doctor se Contact Karein',
    analyzingAnswers: 'MediMitra aapke answers analyze kar raha hai...',
    viewReportBtn: 'Report Dekhein',

    reportTitle: 'Medical Check-up Summary',
    reportSub: 'MediMitra Health Companion dwara taiyaar',
    patientDetailsTitle: 'Patient Information',
    severityTitle: 'Assessment & Condition',
    severityMild: 'Mild / Ghar par theek ho sakta hai',
    severityModerate: 'Moderate / Doctor se salah lein',
    severitySevere: 'Severe / Doctor ko dikhana zaroori hai',
    severityEmergency: 'Emergency / Turant hospital jayein',
    sendReportEmailTitle: 'Medical Report Email par Paayein',
    sendReportEmailSubtitle: 'Sign-in waale email address par send ki jaayegi',
    sendReportBtn: 'Email par Report Send Karein',
    sendingBtn: 'Email bhej rahe hain...',
    reportSentNotice: 'Report aapke email par bhej di gayi hai!',
    downloadPdfBtn: 'PDF Report Download Karein',
    recommendedMedsTitle: 'Recommended Basic Medicines',
    homeCareTitle: 'Gharelu Upay & Care Tips',
    nearestDoctorsTitle: 'Nazdeeki Doctors & Clinics',
    openGoogleMaps: 'Google Maps par Kholein',
    startNewCheckupBtn: 'Naya Check-up Karein',

    locatorHeading: 'Nazdeeki Doctors & Clinics',
    locatorSubtitle: 'Live GPS se apne aas-paas ke verified doctors aur hospitals dekhein',
    detectLocationBtn: 'Meri Live Location Detect Karein',
    currentLocationLabel: 'Current Location',
    allSpecialties: 'Sabhi Specialties',
    searchClinicsPlaceholder: 'Clinic, doctor ya address search karein...',
    callClinicBtn: 'Call Karein',
    getDirectionsBtn: 'Directions Dekhein',
    bookVisitBtn: 'Appointment Book Karein',

    footerTagline: 'MediMitra • Digital Medical Companion & Doctor Referral',
    switchProfileBtn: 'Patient Badlein',
    emergencyNumber: 'Emergency: 112 / 108'
  },

  mr: {
    brandName: 'मेदीमित्र',
    brandTagline: 'तुमचा आरोग्य मित्र',
    proverb: '“आरोग्य हीच खरी संपत्ती”',
    proverbSub: 'पहिला सुख निरोगी काया',

    nearestDoctors: 'जवळचे डॉक्टर',
    signOut: 'लॉग आऊट',
    editPatient: 'रुग्णाची माहिती बदला',
    languageSelect: 'भाषा (Language)',

    whoNeedsCheckup: 'आज कोणाची तपासणी करायची आहे?',
    step1Subtitle: 'पायरी 1: रुग्णाची प्राथमिक माहिती',
    patientNameLabel: 'रुग्णाचे नाव',
    patientNamePlaceholder: 'उदा. राहुल, प्रिया, आरव',
    whoIsThisFor: 'ही तपासणी कोणासाठी आहे?',
    kidLabel: 'मूल (Kid)',
    kidSub: '12 वर्षांखालील',
    adultLabel: 'प्रौढ (Adult)',
    adultSub: '18 - 59 वर्षे',
    seniorLabel: 'ज्येष्ठ नागरिक (Senior)',
    seniorSub: '60+ वर्षे',
    genderLabel: 'लिंग (Gender)',
    femaleLabel: 'महिला / स्त्री',
    femaleSub: 'मातृत्व व हार्मोनल आरोग्य सजग',
    maleLabel: 'पुरुष',
    maleSub: 'सामान्य प्रौढ काळजी',
    continueToCheckup: 'तपासणी सुरू करा',

    authStepTitle: 'साइन इन किंवा खाते तयार करा',
    authStepSubtitle: 'रुग्णाचा तपासणी अहवाल सुरक्षित जतन केला जातो',
    authStepBadge: 'पायरी 2: सुरक्षित रेकॉर्ड सिंक',
    patientProfileSummary: 'रुग्ण',
    editDetails: 'बदला',
    emailLabel: 'तुमचा ईमेल पत्ता',
    emailPlaceholder: 'you@example.com',
    emailDisclaimer: 'तपासणी अहवाल थेट या ईमेलवर पाठवला जाईल',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: 'किमान 6 अक्षरे',
    enterCheckupBtn: 'तपासणी सुरू करा',
    createAccountBtn: 'खाते तयार करा',
    orContinueWith: 'किंवा याद्वारे पुढे जा',
    googleSignInBtn: 'Google द्वारे साइन इन करा',
    guestModeBtn: 'गेस्ट मोड (ईमेल वगळा)',
    needAccount: 'नवीन रुग्ण? खाते उघडा',
    alreadyHaveAccount: 'आधीच खाते आहे? साइन इन करा',

    greeting: 'आज तुम्हाला कसे वाटत आहे',
    frontSubtitle: 'खालीलपैकी लक्षण निवडा किंवा टाईप करा. मेदीमित्र 10 सोप्या प्रश्नांद्वारे योग्य औषध किंवा जवळच्या डॉक्टरांचा सल्ला देईल.',
    customSearchPlaceholder: 'तुमची लक्षणे सोप्या शब्दात लिहा (उदा. सकाळपासून डोकेदुखी, ताप)...',
    startCheckupBtn: 'तपासणी सुरू करा',
    commonIssuesTitle: 'सामान्य आरोग्य समस्या निवडा',
    commonIssuesSubtitle: '10 प्रश्नांची तपासणी सुरू करण्यासाठी कार्डवर क्लिक करा',
    needDoctorTitle: 'तातडीने डॉक्टर हवे आहेत?',
    needDoctorSubtitle: 'गुगल मॅप्सवर जवळचे दवाखाने व डॉक्टरांचे लोकेशन पहा',
    findDoctorsBtn: 'जवळचे डॉक्टर शोधा',
    emergencyTitle: 'तातडीची किंवा गंभीर लक्षणे?',
    emergencySubtitle: 'छातीत तीव्र वेदना, श्वास घेण्यास त्रास किंवा अतिरक्तस्राव असल्यास त्वरित आपत्कालीन नंबरवर संपर्क साधा.',
    emergencyCallBtn: '112 वर कॉल करा',

    symptomHeadache: 'डोकेदुखी',
    symptomHeadacheDesc: 'डोके जड होणे, मायग्रेन किंवा ताण',
    symptomFever: 'ताप (Fever)',
    symptomFeverDesc: 'अंग गरम, हुडहुडी, घाम किंवा अशक्तपणा',
    symptomRash: 'खाज व पुरळ',
    symptomRashDesc: 'त्वचेवर लाल चट्टे, खाज किंवा ॲलर्जी',
    symptomCold: 'सर्दी व खोकला',
    symptomColdDesc: 'शिंका, वाहणारे नाक किंवा घशात खवखव',
    symptomStomach: 'पोटदुखी व गॅस',
    symptomStomachDesc: 'पोटात मुरडा, ॲसिडिटी किंवा मळमळ',
    symptomCuts: 'बारीक जखम / ओरखडा',
    symptomCutsDesc: 'किचनमध्ये बोट कापणे किंवा खरचटणे',
    symptomBodyAche: 'अंगदुखी व थकवा',
    symptomBodyAcheDesc: 'स्नायू दुखणे, थकवा किंवा अशक्तपणा',

    question: 'प्रश्न',
    of: 'पैकी',
    chatWelcome: 'नमस्कार! मी मेदीमित्र, तुमचा डिजिटल आरोग्य सोबती. तुमच्या लक्षणांनुसार योग्य औषध किंवा डॉक्टर सुचवण्यासाठी मी काही सोपे प्रश्न विचारणार आहे.',
    tapAnswerHint: 'खालील पर्यायांवर क्लिक करा किंवा उत्तर टाईप करा:',
    customInputPlaceholder: 'तुमचे उत्तर येथे लिहा...',
    sendBtn: 'पाठवा',
    restartBtn: 'पुन्हा सुरू करा',
    backHomeBtn: 'मुख्य पानावर जा',
    redFlagTitle: 'तातडीने लक्ष देण्याची सूचना',
    redFlagDesc: 'या लक्षणासाठी त्वरित तज्ज्ञ डॉक्टरांचा सल्ला घेणे गरजेचे आहे.',
    consultDoctorNowBtn: 'आताच डॉक्टरांना भेटा',
    analyzingAnswers: 'मेदीमित्र विश्लेषण करत आहे...',
    viewReportBtn: 'अहवाल पहा',

    reportTitle: 'वैद्यकीय तपासणी अहवाल',
    reportSub: 'मेदीमित्र डिजिटल आरोग्य प्रणालीद्वारे तयार',
    patientDetailsTitle: 'रुग्णाची माहिती',
    severityTitle: 'तपासणी निकाल व तीव्रता',
    severityMild: 'सौम्य / घरगुती काळजी शक्य',
    severityModerate: 'मध्यम / डॉक्टरांचा सल्ला घ्या',
    severitySevere: 'गंभीर / त्वरित डॉक्टरांना भेटा',
    severityEmergency: 'अतिगंभीर / तातडीने हॉस्पिटलमध्ये जा',
    sendReportEmailTitle: 'तपासणी अहवाल ईमेलवर मिळवा',
    sendReportEmailSubtitle: 'साइन इन केलेल्या ईमेल पत्त्यावर पाठवला जाईल',
    sendReportBtn: 'ईमेलवर पाठवा',
    sendingBtn: 'पाठवत आहे...',
    reportSentNotice: 'अहवाल ईमेलवर पाठवला गेला आहे!',
    downloadPdfBtn: 'PDF अहवाल डाऊनलोड करा',
    recommendedMedsTitle: 'प्राथमिक औषध सल्ला',
    homeCareTitle: 'घरगुती काळजी व विश्रांती',
    nearestDoctorsTitle: 'जवळचे डॉक्टर व क्लिनिक',
    openGoogleMaps: 'गुगल मॅप्सवर पहा',
    startNewCheckupBtn: 'नवीन तपासणी करा',

    locatorHeading: 'जवळचे डॉक्टर व दवाखाने',
    locatorSubtitle: 'लाईव्ह जीपीएसद्वारे आपल्या परिसरातील प्रमाणित डॉक्टर शोधा',
    detectLocationBtn: 'माझे स्थान शोधा',
    currentLocationLabel: 'सध्याचे स्थान',
    allSpecialties: 'सर्व तज्ज्ञ',
    searchClinicsPlaceholder: 'दवाखाना, डॉक्टर किंवा पत्ता शोधा...',
    callClinicBtn: 'कॉल करा',
    getDirectionsBtn: 'दिशा पहा',
    bookVisitBtn: 'भेट निश्चित करा',

    footerTagline: 'मेदीमित्र • डिजिटल आरोग्य साथी व डॉक्टर मार्गदर्शन',
    switchProfileBtn: 'रुग्ण बदला',
    emergencyNumber: 'आपत्कालीन: 112 / 108'
  },

  bn: {
    brandName: 'মেডিমিথ্র',
    brandTagline: 'আপনার স্বাস্থ্য বন্ধু',
    proverb: '“স্বাস্থ্যই সকল সুখের মূল”',
    proverbSub: 'সুস্থ দেহই পরম সম্পদ',

    nearestDoctors: 'নিকটস্থ ডাক্তার',
    signOut: 'লগ আউট',
    editPatient: 'রোগীর তথ্য পরিবর্তন',
    languageSelect: 'ভাষা (Language)',

    whoNeedsCheckup: 'আজ কার স্বাস্থ্য পরীক্ষা দরকার?',
    step1Subtitle: 'ধাপ ১: রোগীর প্রাথমিক তথ্য',
    patientNameLabel: 'রোগীর নাম',
    patientNamePlaceholder: 'যেমন: রাহুল, প্রিয়া, আরভ',
    whoIsThisFor: 'এই পরীক্ষা কার জন্য?',
    kidLabel: 'শিশু (Kid)',
    kidSub: '১২ বছরের নিচে',
    adultLabel: 'প্রাপ্তবয়স্ক (Adult)',
    adultSub: '১৮ - ৫৯ বছর',
    seniorLabel: 'বয়োজ্যেষ্ঠ (Senior)',
    seniorSub: '৬০+ বছর',
    genderLabel: 'লিঙ্গ (Gender)',
    femaleLabel: 'মহিলা (Female)',
    femaleSub: 'মাতৃত্ব ও হরমোন সচেতন',
    maleLabel: 'পুরুষ (Male)',
    maleSub: 'সাধারণ স্বাস্থ্য সেবা',
    continueToCheckup: 'চেক-আপ শুরু করুন',

    authStepTitle: 'সাইন ইন অথবা নতুন অ্যাকাউন্ট',
    authStepSubtitle: 'রোগীর তথ্য নিরাপদে সেভ করা হয়',
    authStepBadge: 'ধাপ ২: সুরক্ষিত মেডিকেল রেকর্ড সিঙ্ক',
    patientProfileSummary: 'রোগী',
    editDetails: 'সম্পাদনা',
    emailLabel: 'আপনার ইমেইল ঠিকানা',
    emailPlaceholder: 'you@example.com',
    emailDisclaimer: 'চেক-আপ রিপোর্ট এই ইমেইলে পাঠানো হবে',
    passwordLabel: 'পাসওয়ার্ড',
    passwordPlaceholder: 'কমপক্ষে ৬ অক্ষর',
    enterCheckupBtn: 'চেক-আপে প্রবেশ করুন',
    createAccountBtn: 'অ্যাকাউন্ট তৈরি করুন',
    orContinueWith: 'অথবা অন্য মাধ্যমে',
    googleSignInBtn: 'Google দিয়ে প্রবেশ করুন',
    guestModeBtn: 'গেস্ট মোড (ইমেইল ছাড়া)',
    needAccount: 'নতুন রোগী? অ্যাকাউন্ট খুলুন',
    alreadyHaveAccount: 'আগে থেকেই অ্যাকাউন্ট আছে? সাইন ইন করুন',

    greeting: 'আজ আপনি কেমন বোধ করছেন',
    frontSubtitle: 'আপনার সমস্যা বেছে নিন বা লিখুন। মেডিমিথ্র ১০টি সহজ প্রশ্নের মাধ্যমে সঠিক ওষুধ বা ডাক্তারের সন্ধান দেবে।',
    customSearchPlaceholder: 'আপনার লক্ষণ সহজে লিখুন (যেমন: সকাল থেকে মাথাব্যথা, জ্বর)...',
    startCheckupBtn: 'পরীক্ষা শুরু করুন',
    commonIssuesTitle: 'সাধারণ স্বাস্থ্য সমস্যা বেছে নিন',
    commonIssuesSubtitle: '১০ প্রশ্নের স্মার্ট চেক-আপের জন্য যেকোনো কার্ডে চাপ দিন',
    needDoctorTitle: 'এখনই ডাক্তারের প্রয়োজন?',
    needDoctorSubtitle: 'গুগল ম্যাপে নিকটস্থ ক্লিনিক ও ডাক্তারের পথ দেখুন',
    findDoctorsBtn: 'কাছের ডাক্তার খুঁজুন',
    emergencyTitle: 'জরুরি বা তীব্র লক্ষণ?',
    emergencySubtitle: 'বুকে তীব্র ব্যথা, শ্বাসকষ্ট বা রক্তপাত হলে অবিলম্বে জরুরি নম্বরে কল করুন।',
    emergencyCallBtn: '১১২ তে কল করুন',

    symptomHeadache: 'মাথাব্যথা',
    symptomHeadacheDesc: 'মাথার যন্ত্রণা, মাইগ্রেন বা ক্লান্তি',
    symptomFever: 'জ্বর (Fever)',
    symptomFeverDesc: 'শরীর গরম, কাঁপুনি, ঘাম বা দুর্বলতা',
    symptomRash: 'চুলকানি ও ফুসকুড়ি',
    symptomRashDesc: 'ত্বকে লাল চাকা, চুলকানি বা অ্যালার্জি',
    symptomCold: 'সর্দি ও কাশি',
    symptomColdDesc: 'হাঁচি, নাক দিয়ে জল পড়া বা গলা খুসখুস',
    symptomStomach: 'পেটব্যথা ও গ্যাস',
    symptomStomachDesc: 'পেটে মোচড়, অম্লতা বা বমি ভাব',
    symptomCuts: 'ছোটখাটো কাটা-ছেঁড়া',
    symptomCutsDesc: 'রান্নাঘরে কেটে যাওয়া বা হালকা আঁচড়',
    symptomBodyAche: 'গা-হাত-পা ব্যথা ও ক্লান্তি',
    symptomBodyAcheDesc: 'পেশির যন্ত্রণা বা শারীরিক দুর্বলতা',

    question: 'প্রশ্ন',
    of: 'এর মধ্যে',
    chatWelcome: 'নমস্কার! আমি মেডিমিথ্র, আপনার ডিজিটাল স্বাস্থ্য সঙ্গী। সঠিক ওষুধ বা ডাক্তার সুপারিশ করতে আমি কিছু সহজ প্রশ্ন জিজ্ঞাসা করব।',
    tapAnswerHint: 'নিচের বিকল্পে ট্যাপ করুন বা উত্তর টাইপ করুন:',
    customInputPlaceholder: 'আপনার উত্তর এখানে লিখুন...',
    sendBtn: 'পাঠান',
    restartBtn: 'পুনরায় শুরু করুন',
    backHomeBtn: 'হোমে ফিরে যান',
    redFlagTitle: 'জরুরি সতর্কতা',
    redFlagDesc: 'এই লক্ষণের জন্য অবিলম্বে অভিজ্ঞ চিকিৎসকের পরামর্শ নেওয়া উচিত।',
    consultDoctorNowBtn: 'এখনই ডাক্তারের সাথে যোগাযোগ করুন',
    analyzingAnswers: 'মেডিমিথ্র আপনার উত্তর বিশ্লেষণ করছে...',
    viewReportBtn: 'রিপোর্ট দেখুন',

    reportTitle: 'মেডিকেল চেক-আপ রিপোর্ট',
    reportSub: 'মেডিমিথ্র ডিজিটাল স্বাস্থ্য ব্যবস্থা দ্বারা প্রস্তুত',
    patientDetailsTitle: 'রোগীর তথ্য',
    severityTitle: 'পরীক্ষার ফলাফল ও তীব্রতা',
    severityMild: 'মৃদু / ঘরোয়া পরিচর্যা যথেষ্ট',
    severityModerate: 'মাঝারি / ডাক্তারের পরামর্শ প্রয়োজন',
    severitySevere: 'তীব্র / অবিলম্বে ডাক্তার দেখান',
    severityEmergency: 'জরুরি / দ্রুত হাসপাতালে যান',
    sendReportEmailTitle: 'রিপোর্ট ইমেইলে গ্রহণ করুন',
    sendReportEmailSubtitle: 'সাইন ইন করা ইমেইল ঠিকানায় পাঠানো হবে',
    sendReportBtn: 'ইমেইলে রিপোর্ট পাঠান',
    sendingBtn: 'পাঠানো হচ্ছে...',
    reportSentNotice: 'রিপোর্ট ইমেইলে পাঠানো সম্পন্ন!',
    downloadPdfBtn: 'PDF রিপোর্ট ডাউনলোড করুন',
    recommendedMedsTitle: 'প্রাথমিক ওষুধের পরামর্শ',
    homeCareTitle: 'ঘরোয়া যত্ন ও বিশ্রাম',
    nearestDoctorsTitle: 'নিকটস্থ ডাক্তার ও ক্লিনিক',
    openGoogleMaps: 'গুগল ম্যাপে দেখুন',
    startNewCheckupBtn: 'নতুন পরীক্ষা শুরু করুন',

    locatorHeading: 'নিকটস্থ ডাক্তার ও হাসপাতাল',
    locatorSubtitle: 'লাইভ জিপিএস দিয়ে আপনার এলাকার যাচাইকৃত ডাক্তারদের খুঁজুন',
    detectLocationBtn: 'বর্তমান অবস্থান চিহ্নিত করুন',
    currentLocationLabel: 'বর্তমান অবস্থান',
    allSpecialties: 'সকল বিশেষজ্ঞ',
    searchClinicsPlaceholder: 'ক্লিনিক, ডাক্তার বা ঠিকানা খুঁজুন...',
    callClinicBtn: 'কল করুন',
    getDirectionsBtn: 'দিকনির্দেশনা দেখুন',
    bookVisitBtn: 'অ্যাপয়েন্টমেন্ট নিন',

    footerTagline: 'মেডিমিথ্র • ডিজিটাল স্বাস্থ্য সাথী ও ডাক্তার পরামর্শ',
    switchProfileBtn: 'রোগী পরিবর্তন',
    emergencyNumber: 'জরুরি: ১১২ / ১০৮'
  },

  ta: {
    brandName: 'மெடிமித்ரா',
    brandTagline: 'உங்கள் சுகாதார தோழன்',
    proverb: '“நோயற்ற வாழ்வே குறைவற்ற செல்வம்”',
    proverbSub: 'உடலினைக் காப்பது தலையாய கடமை',

    nearestDoctors: 'அருகிலுள்ள மருத்துவர்கள்',
    signOut: 'வெளியேறு (Sign Out)',
    editPatient: 'நோயாளி விவரங்களை மாற்றுக',
    languageSelect: 'மொழி (Language)',

    whoNeedsCheckup: 'இன்று யாருக்கு மருத்துவ பரிசோதனை?',
    step1Subtitle: 'படி 1: நோயாளியின் அடிப்படை விவரங்கள்',
    patientNameLabel: 'நோயாளியின் பெயர்',
    patientNamePlaceholder: 'எ.கா: ராகுல், பிரியா, ஆரவ்',
    whoIsThisFor: 'யாருக்கான பரிசோதனை?',
    kidLabel: 'குழந்தை (Kid)',
    kidSub: '12 வயதுக்கு கீழ்',
    adultLabel: 'பெரியவர் (Adult)',
    adultSub: '18 - 59 வயது',
    seniorLabel: 'முதியவர் (Senior)',
    seniorSub: '60+ வயது',
    genderLabel: 'பாலினம் (Gender)',
    femaleLabel: 'பெண் (Female)',
    femaleSub: 'மகப்பேறு & ஹார்மோன் விழிப்புணர்வு',
    maleLabel: 'ஆண் (Male)',
    maleSub: 'பொது ஆரோக்கிய பராமரிப்பு',
    continueToCheckup: 'பரிசோதனையை தொடர்க',

    authStepTitle: 'உள்நுழைக அல்லது கணக்கு உருவாக்குக',
    authStepSubtitle: 'மருத்துவ குறிப்புகள் பாதுகாப்பாக சேமிக்கப்படுகின்றன',
    authStepBadge: 'படி 2: மருத்துவ பதிவு ஒத்திசைவு',
    patientProfileSummary: 'நோயாளி',
    editDetails: 'திருத்துக',
    emailLabel: 'மின்னஞ்சல் முகவரி',
    emailPlaceholder: 'you@example.com',
    emailDisclaimer: 'பரிசோதனை அறிக்கை இந்த மின்னஞ்சலுக்கு அனுப்பப்படும்',
    passwordLabel: 'கடவுச்சொல்',
    passwordPlaceholder: 'குறைந்தது 6 எழுத்துக்கள்',
    enterCheckupBtn: 'பரிசோதனையை தொடங்குக',
    createAccountBtn: 'கணக்கை உருவாக்கி தொடர்க',
    orContinueWith: 'அல்லது இதன் மூலம்',
    googleSignInBtn: 'Google மூலம் உள்நுழைக',
    guestModeBtn: 'விருந்தினர் முறை (மின்னஞ்சலை தவிர்க்க)',
    needAccount: 'புதிய நோயாளி? கணக்கு உருவாக்குக',
    alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக',

    greeting: 'இன்று உங்கள் உடல்நிலை எப்படி உள்ளது',
    frontSubtitle: 'உங்கள் பிரச்சனையை கீழே தேர்ந்தெடுக்கவும் அல்லது எழுதவும். மெடிமித்ரா 10 எளிய கேள்விகள் மூலம் சரியான மருந்து அல்லது மருத்துவரை பரிந்துரைக்கும்.',
    customSearchPlaceholder: 'உங்கள் அறிகுறிகளை எளிய தமிழில் எழுதவும் (எ.கா: தலைவலி, காய்ச்சல்)...',
    startCheckupBtn: 'பரிசோதனையை தொடங்குக',
    commonIssuesTitle: 'பொதுவான உடல் பிரச்சனையை தேர்ந்தெடுக்கவும்',
    commonIssuesSubtitle: '10 கேள்விகள் கொண்ட பரிசோதனைக்கு அட்டையைத் தொடவும்',
    needDoctorTitle: 'உடனடி மருத்துவர் ஆலோசனையா?',
    needDoctorSubtitle: 'கூகுள் வரைபடத்தில் அருகிலுள்ள மருத்துவமனைகளை காண்க',
    findDoctorsBtn: 'மருத்துவரை தேடுக',
    emergencyTitle: 'அவசர அல்லது தீவிர அறிகுறிகளா?',
    emergencySubtitle: 'நெஞ்சு வலி, மூச்சுத் திணறல் அல்லது அதிக இரத்தப்போக்கு இருந்தால் உடனே 112-ஐ அழைக்கவும்.',
    emergencyCallBtn: '112 அவசர அழைப்பு',

    symptomHeadache: 'தலைவலி',
    symptomHeadacheDesc: 'ஒற்றைத் தலைவலி, பாரம் அல்லது அழுத்தம்',
    symptomFever: 'காய்ச்சல் (Fever)',
    symptomFeverDesc: 'உடல் சூடு, நடுக்கம், வியர்வை அல்லது சோர்வு',
    symptomRash: 'அரிப்பு & தடிப்புகள்',
    symptomRashDesc: 'தோலில் சிவப்பு திட்டுகள், நமைச்சல் அல்லது அலர்ஜி',
    symptomCold: 'சளி மற்றும் இருமல்',
    symptomColdDesc: 'தும்மல், மூக்கொழுகுதல், தொண்டை வலி',
    symptomStomach: 'வயிற்று வலி & வாயு',
    symptomStomachDesc: 'வயிற்றுப் பிடிப்பு, நெஞ்செரிச்சல் அல்லது குமட்டல்',
    symptomCuts: 'சிறு காயங்கள் & கீறல்கள்',
    symptomCutsDesc: 'சமையலறை வெட்டு அல்லது லேசான காயம்',
    symptomBodyAche: 'உடல் வலி & சோர்வு',
    symptomBodyAcheDesc: 'தசை வலி, பலவீனம் அல்லது அசதி',

    question: 'கேள்வி',
    of: 'இல்',
    chatWelcome: 'வணக்கம்! நான் மெடிமித்ரா, உங்கள் டிஜிட்டல் நல தோழன். உங்கள் அறிகுறிகளை அறிந்து சரியான மருந்து அல்லது மருத்துவரை பரிந்துரைக்க சில எளிய கேள்விகள் கேட்பேன்.',
    tapAnswerHint: 'கீழே உள்ள பதிலைத் தொடவும் அல்லது தட்டச்சு செய்யவும்:',
    customInputPlaceholder: 'உங்கள் பதிலை இங்கே உள்ளிடவும்...',
    sendBtn: 'அனுப்புக',
    restartBtn: 'மீண்டும் தொடங்குக',
    backHomeBtn: 'முகப்புக்கு செல்க',
    redFlagTitle: 'உடனடி மருத்துவ எச்சரிக்கை',
    redFlagDesc: 'இந்த அறிகுறிக்கு உடனடியாக மருத்துவரை அணுகுமாறு பரிந்துரைக்கிறோம்.',
    consultDoctorNowBtn: 'மருத்துவரை அணுகவும்',
    analyzingAnswers: 'மெடிமித்ரா ஆய்வு செய்கிறது...',
    viewReportBtn: 'அறிக்கையை காண்க',

    reportTitle: 'மருத்துவ பரிசோதனை அறிக்கை',
    reportSub: 'மெடிமித்ரா சுகாதார அமைப்பால் தயாரிக்கப்பட்டது',
    patientDetailsTitle: 'நோயாளி விவரங்கள்',
    severityTitle: 'பரிசோதனை முடிவு & நிலை',
    severityMild: 'லேசானது / வீட்டிலேயே குணப்படுத்தலாம்',
    severityModerate: 'மிதமானது / மருத்துவர் ஆலோசனை தேவை',
    severitySevere: 'தீவிரமானது / மருத்துவரை நேரில் அணுகவும்',
    severityEmergency: 'அவசரம் / உடனே மருத்துவமனைக்கு செல்க',
    sendReportEmailTitle: 'அறிக்கையை மின்னஞ்சலில் பெறுக',
    sendReportEmailSubtitle: 'உள்நுழைவின் போது வழங்கிய மின்னஞ்சலுக்கு அனுப்பப்படும்',
    sendReportBtn: 'மின்னஞ்சலுக்கு அனுப்புக',
    sendingBtn: 'அனுப்பப்படுகிறது...',
    reportSentNotice: 'அறிக்கை மின்னஞ்சலுக்கு அனுப்பப்பட்டது!',
    downloadPdfBtn: 'PDF பதிவிறக்கம்',
    recommendedMedsTitle: 'பரிந்துரைக்கப்படும் மருந்துகள்',
    homeCareTitle: 'வீட்டுப் பராமரிப்பு ஆலோசனைகள்',
    nearestDoctorsTitle: 'அருகிலுள்ள மருத்துவர்கள் & கிளினிக்குகள்',
    openGoogleMaps: 'கூகுள் மேப்ஸில் திறக்குக',
    startNewCheckupBtn: 'புதிய பரிசோதனை',

    locatorHeading: 'அருகிலுள்ள மருத்துவர்கள் & கிளினிக்குகள்',
    locatorSubtitle: 'நேரலை ஜிபிஎஸ் மூலம் அருகிலுள்ள மருத்துவர்களை கண்டறியவும்',
    detectLocationBtn: 'என் இருப்பிடத்தை கண்டறிக',
    currentLocationLabel: 'தற்போதைய இடம்',
    allSpecialties: 'அனைத்து நிபுணர்கள்',
    searchClinicsPlaceholder: 'மருத்துவமனை அல்லது மருத்துவரை தேடுக...',
    callClinicBtn: 'அழைக்க',
    getDirectionsBtn: 'வழிப்பாதை',
    bookVisitBtn: 'முன்பதிவு செய்க',

    footerTagline: 'மெடிமித்ரா • டிஜிட்டல் நல தோழன் மற்றும் மருத்துவ வழிகாட்டி',
    switchProfileBtn: 'நோயாளி மாற்றுக',
    emergencyNumber: 'அவசரம்: 112 / 108'
  },

  te: {
    brandName: 'మెడిమిత్ర',
    brandTagline: 'మీ ఆరోగ్య మిత్రుడు',
    proverb: '“ఆరోగ్యమే మహాభాగ్యం”',
    proverbSub: 'మొదటి సుఖం నిరోగి కాయం',

    nearestDoctors: 'సమీప వైద్యులు',
    signOut: 'లాగ్ అవుట్',
    editPatient: 'రోగి వివరాలు మార్చండి',
    languageSelect: 'భాష (Language)',

    whoNeedsCheckup: 'ఈ రోజు ఎవరికి వైద్య పరీక్ష అవసరం?',
    step1Subtitle: 'దశ 1: రోగి ప్రాథమిక సమాచారం',
    patientNameLabel: 'రోగి పేరు',
    patientNamePlaceholder: 'ఉదా: రాహుల్, ప్రియ, ఆరవ్',
    whoIsThisFor: 'ఈ పరీక్ష ఎవరి కోసం?',
    kidLabel: 'పిల్లవాడు (Kid)',
    kidSub: '12 ఏళ్ల లోపు',
    adultLabel: 'పెద్దవారు (Adult)',
    adultSub: '18 - 59 ఏళ్లు',
    seniorLabel: 'వృద్ధులు (Senior)',
    seniorSub: '60+ ఏళ్లు',
    genderLabel: 'లింగం (Gender)',
    femaleLabel: 'మహిళ (Female)',
    femaleSub: 'గర్భధారణ మరియు హార్మోన్ల స్పృహతో',
    maleLabel: 'పురుషుడు (Male)',
    maleSub: 'సాధారణ ఆరోగ్య సంరక్షణ',
    continueToCheckup: 'పరీక్షను కొనసాగించండి',

    authStepTitle: 'సైన్ ఇన్ లేదా కొత్త ఖాతా',
    authStepSubtitle: 'వైద్య రికార్డు సురక్షితంగా నిల్వ చేయబడుతుంది',
    authStepBadge: 'దశ 2: సురక్షిత మెడికల్ రికార్డ్ సింక్',
    patientProfileSummary: 'రోగి',
    editDetails: 'సవరించు',
    emailLabel: 'మీ ఈమెయిల్ చిరునామా',
    emailPlaceholder: 'you@example.com',
    emailDisclaimer: 'పరీక్ష రిపోర్ట్ ఈ ఈమెయిల్‌కు పంపబడుతుంది',
    passwordLabel: 'పాస్‌వర్డ్',
    passwordPlaceholder: 'కనీసం 6 అక్షరాలు',
    enterCheckupBtn: 'పరీక్షను ప్రారంభించండి',
    createAccountBtn: 'ఖాతా సృష్టించి ప్రారంభించండి',
    orContinueWith: 'లేదా దీనితో కొనసాగండి',
    googleSignInBtn: 'Google తో సైన్ ఇన్ చేయండి',
    guestModeBtn: 'గెస్ట్ మోడ్ (ఈమెయిల్ దాటవేయి)',
    needAccount: 'కొత్త రోగా? ఖాతా సృష్టించండి',
    alreadyHaveAccount: 'ఖాతా ఉందా? సైన్ ఇన్ చేయండి',

    greeting: 'ఈ రోజు మీరు ఎలా భావిస్తున్నారు',
    frontSubtitle: 'మీ సమస్యను ఎంచుకోండి లేదా రాయండి. మెడిమిత్ర 10 సాధారణ ప్రశ్నలతో సరైన ఔషధం లేదా సమీప వైద్యుడిని సిఫార్సు చేస్తుంది.',
    customSearchPlaceholder: 'మీ సమస్యను సాధారణ పదాలలో రాయండి (ఉదా: తలనొప్పి, జ్వరం)...',
    startCheckupBtn: 'పరీక్షను ప్రారంభించండి',
    commonIssuesTitle: 'సాధారణ ఆరోగ్య సమస్యను ఎంచుకోండి',
    commonIssuesSubtitle: '10 ప్రశ్నల పరీక్ష ప్రారంభించడానికి ఏదైనా కార్డుపై నొక్కండి',
    needDoctorTitle: 'వెంటనే వైద్యుడు అవసరమా?',
    needDoctorSubtitle: 'గూగుల్ మ్యాప్స్‌లో సమీప క్లినిక్‌లు మరియు వైద్యుల మార్గాన్ని చూడండి',
    findDoctorsBtn: 'వైద్యులను కనుగొనండి',
    emergencyTitle: 'అత్యవసర లేదా తీవ్ర లక్షణాలా?',
    emergencySubtitle: 'ఛాతీ నొప్పి, శ్వాస తీసుకోవడంలో ఇబ్బంది లేదా తీవ్ర రక్తస్రావం ఉంటే వెంటనే 112 కు కాల్ చేయండి.',
    emergencyCallBtn: '112 అత్యవసర కాల్',

    symptomHeadache: 'తలనొప్పి',
    symptomHeadacheDesc: 'మైగ్రేన్, ఒత్తిడి లేదా భారంగా ఉండటం',
    symptomFever: 'జ్వరం (Fever)',
    symptomFeverDesc: 'శరీర ఉష్ణోగ్రత, వణుకు, చెమట లేదా నీరసం',
    symptomRash: 'దురద & దద్దుర్లు',
    symptomRashDesc: 'చర్మంపై ఎర్రటి మచ్చలు, దురద లేదా అలర్జీ',
    symptomCold: 'జలుబు & దగ్గు',
    symptomColdDesc: 'తుమ్ములు, ముక్కు కారడం, గొంతు నొప్పి',
    symptomStomach: 'కడుపునొప్పి & గ్యాస్',
    symptomStomachDesc: 'కడుపులో తిప్పడం, అసిడిటీ లేదా వికారం',
    symptomCuts: 'చిన్న గాయాలు & గీతలు',
    symptomCutsDesc: 'వంటగదిలో కట్ అవ్వడం లేదా చిన్న గాయం',
    symptomBodyAche: 'ఒళ్లు నొప్పులు & అలసట',
    symptomBodyAcheDesc: 'కండరాల నొప్పులు లేదా తీవ్ర నీరసం',

    question: 'ప్రశ్న',
    of: 'లో',
    chatWelcome: 'నమస్కారం! నేను మెడిమిత్ర, మీ డిజిటల్ ఆరోగ్య సహచరిని. మీ లక్షణాలకు సరైన మందు లేదా డాక్టర్‌ను సిఫార్సు చేయడానికి కొన్ని సులభమైన ప్రశ్నలు అడుగుతాను.',
    tapAnswerHint: 'క్రింది సమాధానాలపై నొక్కండి లేదా టైప్ చేయండి:',
    customInputPlaceholder: 'మీ సమాధానం ఇక్కడ టైప్ చేయండి...',
    sendBtn: 'పంపు',
    restartBtn: 'మళ్లీ ప్రారంభించు',
    backHomeBtn: 'హోమ్‌కు వెళ్ళు',
    redFlagTitle: 'తక్షణ వైద్య హెచ్చరిక',
    redFlagDesc: 'ఈ లక్షణానికి వెంటనే వైద్యుడిని సంప్రదించాలని మేము సిఫార్సు చేస్తున్నాము.',
    consultDoctorNowBtn: 'వెంటనే వైద్యుడిని సంప్రదించండి',
    analyzingAnswers: 'మెడిమిత్ర సమాధానాలను విశ్లేషిస్తోంది...',
    viewReportBtn: 'రిపోర్ట్ చూడండి',

    reportTitle: 'వైద్య పరీక్ష రిపోర్ట్',
    reportSub: 'మెడిమిత్ర హెల్త్ సిస్టమ్ ద్వారా రూపొందించబడింది',
    patientDetailsTitle: 'రోగి సమాచారం',
    severityTitle: 'పరీక్ష ఫలితం & తీవ్రత',
    severityMild: 'తేలికపాటి / ఇంట్లోనే నయం చేయవచ్చు',
    severityModerate: 'మధ్యస్థం / వైద్యుడి సలహా అవసరం',
    severitySevere: 'తీవ్రమైనది / వెంటనే వైద్యుడిని కలవండి',
    severityEmergency: 'అత్యవసరం / వెంటనే ఆసుపత్రికి వెళ్ళండి',
    sendReportEmailTitle: 'రిపోర్ట్‌ను ఈమెయిల్‌లో పొందండి',
    sendReportEmailSubtitle: 'సైన్ ఇన్ చేసిన ఈమెయిల్ చిరునామాకు పంపబడుతుంది',
    sendReportBtn: 'ఈమెయిల్‌కు పంపు',
    sendingBtn: 'పంపుతోంది...',
    reportSentNotice: 'రిపోర్ట్ మీ ఈమెయిల్‌కు పంపబడింది!',
    downloadPdfBtn: 'PDF రిపోర్ట్ డౌన్‌లోడ్',
    recommendedMedsTitle: 'సిఫార్సు చేయబడిన మందులు',
    homeCareTitle: 'ఇంటి సంరక్షణ చిట్కాలు',
    nearestDoctorsTitle: 'సమీప వైద్యులు & క్లినిక్‌లు',
    openGoogleMaps: 'గూగుల్ మ్యాప్స్‌లో తెరవండి',
    startNewCheckupBtn: 'కొత్త పరీక్ష ప్రారంభించండి',

    locatorHeading: 'సమీప వైద్యులు & ఆసుపత్రులు',
    locatorSubtitle: 'లైవ్ జీపీఎస్ ద్వారా ధృవీకరించబడిన వైద్యులను కనుగొనండి',
    detectLocationBtn: 'నా లొకేషన్ గుర్తించు',
    currentLocationLabel: 'ప్రస్తుత ప్రాంతం',
    allSpecialties: 'అన్ని విభాగాలు',
    searchClinicsPlaceholder: 'క్లినిక్, డాక్టర్ లేదా చిరునామా వెతకండి...',
    callClinicBtn: 'కాల్ చేయండి',
    getDirectionsBtn: 'దారి చూడండి',
    bookVisitBtn: 'అపాయింట్‌మెంట్ తీసుకోండి',

    footerTagline: 'మెడిమిత్ర • డిజిటల్ ఆరోగ్య సహచరి మరియు వైద్య మార్గదర్శి',
    switchProfileBtn: 'రోగిని మార్చండి',
    emergencyNumber: 'అత్యవసరం: 112 / 108'
  },

  gu: {
    brandName: 'મેડીમિત્ર',
    brandTagline: 'તમારો સ્વાસ્થ્ય મિત્ર',
    proverb: '“પહેલું સુખ તે જાતે નર્યા”',
    proverbSub: 'સ્વાસ્થ્ય એ જ સાચી સંપત્તિ છે',

    nearestDoctors: 'નજીકના ડોક્ટરો',
    signOut: 'લૉગ આઉટ',
    editPatient: 'દર્દીની વિગત બદલો',
    languageSelect: 'ભાષા (Language)',

    whoNeedsCheckup: 'આજે કોની તપાસ કરવાની છે?',
    step1Subtitle: 'પગલું 1: દર્દીની સામાન્ય વિગત',
    patientNameLabel: 'દર્દીનું નામ',
    patientNamePlaceholder: 'દા.ત. રાહુલ, પ્રિયા, આરવ',
    whoIsThisFor: 'આ તપાસ કોના માટે છે?',
    kidLabel: 'બાળક (Kid)',
    kidSub: '12 વર્ષથી નાનું',
    adultLabel: 'પુખ્ત (Adult)',
    adultSub: '18 - 59 વર્ષ',
    seniorLabel: 'વૃદ્ધ (Senior)',
    seniorSub: '60+ વર્ષ',
    genderLabel: 'જાતિ (Gender)',
    femaleLabel: 'મહિલા / સ્ત્રી',
    femaleSub: 'માતૃત્વ અને હોર્મોનલ કાળજી સાથે',
    maleLabel: 'પુરુષ',
    maleSub: 'સામાન્ય પુખ્ત કાળજી',
    continueToCheckup: 'તપાસ શરૂ કરો',

    authStepTitle: 'સાઇન ઇન અથવા નવું ખાતું બનાવો',
    authStepSubtitle: 'દર્દીનો તપાસ અહેવાલ સુરક્ષિત સંગ્રહાય છે',
    authStepBadge: 'પગલું 2: સુરક્ષિત મેડિકલ રેકોર્ડ સિંક',
    patientProfileSummary: 'દર્દી',
    editDetails: 'બદલો',
    emailLabel: 'તમારું ઈમેલ એડ્રેસ',
    emailPlaceholder: 'you@example.com',
    emailDisclaimer: 'તપાસ અહેવાલ આ ઈમેલ પર મોકલવામાં આવશે',
    passwordLabel: 'પાસવર્ડ',
    passwordPlaceholder: 'ઓછામાં ઓછા 6 અક્ષરો',
    enterCheckupBtn: 'તપાસમાં પ્રવેશ કરો',
    createAccountBtn: 'ખાતું બનાવો અને શરૂ કરો',
    orContinueWith: 'અથવા આના દ્વારા આગળ વધો',
    googleSignInBtn: 'Google થી સાઇન ઇન કરો',
    guestModeBtn: 'ગેસ્ટ મોડ (ઈમેલ છોડો)',
    needAccount: 'નવા દર્દી? ખાતું બનાવો',
    alreadyHaveAccount: 'ખાતું છે? સાઇન ઇન કરો',

    greeting: 'આજે તમે કેવું અનુભવી રહ્યા છો',
    frontSubtitle: 'નીચેથી સમસ્યા પસંદ કરો અથવા લખો. મેડીમિત્ર 10 સરળ પ્રશ્નો દ્વારા સાચી દવા અથવા નજીકના ડોક્ટરની સલાહ આપશે.',
    customSearchPlaceholder: 'તમારી સમસ્યા સરળ શબ્દોમાં લખો (દા.ત. માથાનો દુખાવો, તાવ)...',
    startCheckupBtn: 'તપાસ શરૂ કરો',
    commonIssuesTitle: 'સામાન્ય સ્વાસ્થ્ય સમસ્યા પસંદ કરો',
    commonIssuesSubtitle: '10 પ્રશ્નોની તપાસ માટે કોઈપણ કાર્ડ પર ક્લિક કરો',
    needDoctorTitle: 'તાત્કાલિક ડોક્ટરની જરૂર છે?',
    needDoctorSubtitle: 'ગુગલ મેપ્સ પર નજીકના ક્લિનિક અને ડોક્ટરોનો રસ્તો જુઓ',
    findDoctorsBtn: 'નજીકના ડોક્ટર શોધો',
    emergencyTitle: 'કટોકટી અથવા ગંભીર લક્ષણો?',
    emergencySubtitle: 'છાતીમાં દુખાવો, શ્વાસ લેવામાં તકલીફ કે વધુ રક્તસ્ત્રાવ હોય તો તરત જ 112 પર કૉલ કરો.',
    emergencyCallBtn: '112 કટોકટી કૉલ',

    symptomHeadache: 'માથાનો દુખાવો',
    symptomHeadacheDesc: 'માથું ભારે લાગવું, આધાશીશી કે તણાવ',
    symptomFever: 'તાવ (Fever)',
    symptomFeverDesc: 'શરીર ગરમ થવું, ધ્રુજારી, પરસેવો કે નબળાઈ',
    symptomRash: 'ખંજવાળ અને ચકામા',
    symptomRashDesc: 'ત્વચા પર લાલ ચકામા, ખંજવાળ કે એલર્જી',
    symptomCold: 'શરદી અને ઉધરસ',
    symptomColdDesc: 'છીંકો, વહેતું નાક કે ગળામાં ખરાશ',
    symptomStomach: 'પેટનો દુખાવો અને ગેસ',
    symptomStomachDesc: 'પેટમાં ચૂંક, એસિડિટી કે ઉલટી જેવું લાગવું',
    symptomCuts: 'નાની ઈજા અથવા છોલાવું',
    symptomCutsDesc: 'રસોડામાં કાપો પડવો કે સામાન્ય લોહી નીકળવું',
    symptomBodyAche: 'શરીરનો દુખાવો અને થાક',
    symptomBodyAcheDesc: 'સ્નાયુઓનો દુખાવો કે અશક્તિ',

    question: 'પ્રશ્ન',
    of: 'માંથી',
    chatWelcome: 'નમસ્તે! હું મેડીમિત્ર છું, તમારો ડિજિટલ સ્વાસ્થ્ય સાથી. સાચી દવા કે ડોક્ટર સૂચવવા માટે હું થોડા સરળ પ્રશ્નો પૂછીશ.',
    tapAnswerHint: 'નીચે આપેલા વિકલ્પ પર ક્લિક કરો અથવા લખો:',
    customInputPlaceholder: 'તમારો જવાબ અહીં લખો...',
    sendBtn: 'મોકલો',
    restartBtn: 'ફરીથી શરૂ કરો',
    backHomeBtn: 'મુખ્ય પૃષ્ઠ પર જાઓ',
    redFlagTitle: 'તાત્કાલિક ધ્યાન દોરતી ચેતવણી',
    redFlagDesc: 'આ લક્ષણ માટે તરત જ યોગ્ય ડોક્ટરની સલાહ લેવાની ભલામણ કરીએ છીએ.',
    consultDoctorNowBtn: 'ડોક્ટરનો સંપર્ક કરો',
    analyzingAnswers: 'મેડીમિત્ર જવાબોનું વિશ્લેષણ કરી રહ્યું છે...',
    viewReportBtn: 'રિપોર્ટ જુઓ',

    reportTitle: 'તબીબી તપાસ અહેવાલ',
    reportSub: 'મેડીમિત્ર ડિજિટલ હેલ્થ સિસ્ટમ દ્વારા તૈયાર',
    patientDetailsTitle: 'દર્દીની વિગત',
    severityTitle: 'તપાસનું પરિણામ અને ગંભીરતા',
    severityMild: 'હળવું / ઘરે સંભાળ શક્ય',
    severityModerate: 'મધ્યમ / ડોક્ટરની સલાહ જરૂરી',
    severitySevere: 'ગંભીર / તરત જ ડોક્ટરને બતાવો',
    severityEmergency: 'અત્યંત ગંભીર / તાત્કાલિક હોસ્પિટલ જાઓ',
    sendReportEmailTitle: 'ઈમેલ પર તપાસ અહેવાલ મેળવો',
    sendReportEmailSubtitle: 'સાઇન ઇન કરેલા ઈમેલ એડ્રેસ પર મોકલવામાં આવશે',
    sendReportBtn: 'ઈમેલ પર મોકલો',
    sendingBtn: 'મોકલી રહ્યું છે...',
    reportSentNotice: 'અહેવાલ તમારા ઈમેલ પર મોકલાઈ ગયો છે!',
    downloadPdfBtn: 'PDF રિપોર્ટ ડાઉનલોડ કરો',
    recommendedMedsTitle: 'ભલામણ કરેલ પ્રાથમિક દવાઓ',
    homeCareTitle: 'ઘરેલું ઉપચાર અને આરામ',
    nearestDoctorsTitle: 'નજીકના ડોક્ટર અને ક્લિનિક',
    openGoogleMaps: 'ગુગલ મેપ્સ પર જુઓ',
    startNewCheckupBtn: 'નવી તપાસ શરૂ કરો',

    locatorHeading: 'નજીકના ડોક્ટર અને હોસ્પિટલ',
    locatorSubtitle: 'લાઇવ જીપીએસ દ્વારા તમારા વિસ્તારના ચકાસાયેલ ડોક્ટર શોધો',
    detectLocationBtn: 'મારું સ્થાન શોધો',
    currentLocationLabel: 'હાલનું સ્થાન',
    allSpecialties: 'તમામ નિષ્ણાતો',
    searchClinicsPlaceholder: 'ક્લિનિક, ડોક્ટર કે સરનામું શોધો...',
    callClinicBtn: 'કૉલ કરો',
    getDirectionsBtn: 'દિશા જુઓ',
    bookVisitBtn: 'એપોઇન્ટમેન્ટ બુક કરો',

    footerTagline: 'મેડીમિત્ર • ડિજિટલ સ્વાસ્થ્ય સાથી અને ડોક્ટર માર્ગદર્શન',
    switchProfileBtn: 'દર્દી બદલો',
    emergencyNumber: 'કટોકટી: 112 / 108'
  }
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('medimitra_language') as LanguageCode;
      if (saved && TRANSLATIONS[saved]) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('medimitra_language', lang);
    } catch {
      // ignore
    }
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
