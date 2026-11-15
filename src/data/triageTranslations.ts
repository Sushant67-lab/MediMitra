import { LanguageCode } from '../context/LanguageContext';
import { SymptomCategory } from '../types/medical';

export interface LocalizedQuestionCopy {
  question: string;
  subtext: string;
  badge: string;
  options: string[];
}

export type QuestionId =
  | 'q1_demographics'
  | 'q2_pregnancy_check'
  | 'q2_pediatric_weight'
  | 'q2_senior_conditions'
  | 'q2_general_profile'
  | 'q3_onset_duration'
  | 'q4_severity_intensity'
  | 'q5_fever_temp'
  | 'q5_headache_type'
  | 'q5_cold_discharge'
  | 'q5_rash_appearance'
  | 'q5_cut_characteristics'
  | 'q5_stomach_pattern'
  | 'q5_symptom_nuance'
  | 'q6_red_flags'
  | 'q7_drug_allergies'
  | 'q8_meds_taken_today'
  | 'q9_hydration'
  | 'q9_tetanus_history'
  | 'q9_daily_activities'
  | 'q10_progression';

export interface TriageUiStrings {
  checkupBadge: string;
  noteAck: string;
  feelingPrefix: string;
  restartedText: string;
  analyzingText: string;
  patientLabel: string;
  redFlagBannerTitle: string;
  redFlagBannerDesc: string;
  redFlagBannerBtn: string;
  ackStep1: (opt: string) => string;
  ackStep2: (opt: string) => string;
  ackStep5: string;
  ackStep6RedFlag: string;
  ackStep6Safe: string;
  ackStep8: string;
}

export const SYMPTOM_NAMES_BY_LANG: Record<LanguageCode, Record<SymptomCategory, string>> = {
  en: {
    fever: 'Fever & Chills',
    headache: 'Headache & Migraine',
    cold_sneezing: 'Cold & Sneezing',
    skin_rash: 'Skin Rashes & Itching',
    small_cuts: 'Small Cuts & Scrapes',
    stomach_upset: 'Stomach Upset & Acidity',
    cough_throat: 'Cough & Sore Throat',
    body_ache: 'Body Aches & Fatigue',
    other: 'General Health Issue'
  },
  hi: {
    fever: 'बुखार और कंपकंपी',
    headache: 'सिरदर्द और माइग्रेन',
    cold_sneezing: 'जुकाम और छींक आना',
    skin_rash: 'त्वचा पर चकत्ते और खुजली',
    small_cuts: 'छोटी चोट और खरोंच',
    stomach_upset: 'पेट दर्द, गैस और एसिडिटी',
    cough_throat: 'खांसी और गले में खराश',
    body_ache: 'बदन दर्द और कमजोरी',
    other: 'सामान्य स्वास्थ्य समस्या'
  },
  hinglish: {
    fever: 'Bukhar aur Thand Lagna',
    headache: 'Sar Dard aur Migraine',
    cold_sneezing: 'Zukam aur Chheenk',
    skin_rash: 'Skin Rash, Daad aur Khujli',
    small_cuts: 'Chhoti Chot aur Kharonch',
    stomach_upset: 'Pet Dard, Gas aur Acidity',
    cough_throat: 'Khansi aur Gale me Kharash',
    body_ache: 'Badan Dard aur Kamzori',
    other: 'General Health Problem'
  },
  mr: {
    fever: 'ताप आणि थंडी वाजणे',
    headache: 'डोकेदुखी आणि मायग्रेन',
    cold_sneezing: 'सर्दी आणि शिंका',
    skin_rash: 'त्वचेवर पुरळ आणि खाज',
    small_cuts: 'लहान जखम आणि खरचटणे',
    stomach_upset: 'पोटदुखी, गॅस आणि ॲसिडिटी',
    cough_throat: 'खोकला आणि घसा खवखवणे',
    body_ache: 'अंगदुखी आणि थकवा',
    other: 'सामान्य आरोग्य समस्या'
  },
  bn: {
    fever: 'জ্বর ও কাঁপুনি',
    headache: 'মাথাব্যথা ও মাইগ্রেন',
    cold_sneezing: 'সর্দি ও হাঁচি',
    skin_rash: 'ত্বকের র‍্যাশ ও চুলকানি',
    small_cuts: 'ছোট কাটা ও ছড়ে যাওয়া',
    stomach_upset: 'পেটের সমস্যা ও অ্যাসিডিটি',
    cough_throat: 'কাশি ও গলা ব্যথা',
    body_ache: 'গা ব্যথা ও দুর্বলতা',
    other: 'সাধারণ স্বাস্থ্য সমস্যা'
  },
  ta: {
    fever: 'காய்ச்சல் மற்றும் குளிர்',
    headache: 'தலைவலி மற்றும் ஒற்றைத் தலைவலி',
    cold_sneezing: 'சளி மற்றும் தும்மல்',
    skin_rash: 'தோல் தடிப்பு மற்றும் அரிப்பு',
    small_cuts: 'சிறிய வெட்டு மற்றும் சிராய்ப்பு',
    stomach_upset: 'வயிற்று வலி மற்றும் அசிடிட்டி',
    cough_throat: 'இருமல் மற்றும் தொண்டை வலி',
    body_ache: 'உடல் வலி மற்றும் சோர்வு',
    other: 'பொதுவான உடல்நலப் பிரச்சனை'
  },
  te: {
    fever: 'జ్వరం మరియు చలి',
    headache: 'తలనొప్పి మరియు మైగ్రేన్',
    cold_sneezing: 'జలుబు మరియు తుమ్ములు',
    skin_rash: 'చర్మం దద్దుర్లు మరియు దురద',
    small_cuts: 'చిన్న గాయాలు మరియు గీతలు',
    stomach_upset: 'కడుపు నొప్పి మరియు అసిడిటీ',
    cough_throat: 'దగ్గు మరియు గొంతు నొప్పి',
    body_ache: 'ఒళ్ళు నొప్పులు మరియు నీరసం',
    other: 'సాధారణ ఆరోగ్య సమస్య'
  },
  gu: {
    fever: 'તાવ અને ઠંડી',
    headache: 'માથાનો દુખાવો અને માઇગ્રેન',
    cold_sneezing: 'શરદી અને છીંકો',
    skin_rash: 'ચામડી પર ફોલ્લીઓ અને ખંજવાળ',
    small_cuts: 'નાના ઘા અને ઉઝરડા',
    stomach_upset: 'પેટનો દુખાવો અને એસિડિટી',
    cough_throat: 'ઉધરસ અને ગળામાં ખરાશ',
    body_ache: 'શરીરમાં દુખાવો અને નબળાઈ',
    other: 'સામાન્ય આરોગ્ય સમસ્યા'
  }
};

export const TRIAGE_UI_STRINGS: Record<LanguageCode, TriageUiStrings> = {
  en: {
    checkupBadge: 'MediMitra Check-up',
    noteAck: "Thank you for sharing that. Let's ask a few simple questions tailored for you.",
    feelingPrefix: "I'm feeling:",
    restartedText: 'Consultation restarted. Let us begin the 10-step health check for',
    analyzingText: 'MediMitra is analyzing symptoms',
    patientLabel: 'Patient',
    redFlagBannerTitle: 'High Priority Indicator Flagged:',
    redFlagBannerDesc: 'One or more answers suggest emergency medical evaluation may be required.',
    redFlagBannerBtn: 'Find Emergency Doctors Now',
    ackStep1: (opt) => `Understood. Age group set to ${opt}. Calibrating safe dosage algorithms...`,
    ackStep2: (opt) => `Noted your health context (${opt}). Ensuring all medicine & powder checks reflect this.`,
    ackStep5: 'Clinical specifics recorded. Now screening for potential warning signs...',
    ackStep6RedFlag: '⚠️ Caution: You selected a high-priority warning sign. Emergency medical attention may be needed.',
    ackStep6Safe: 'No acute warning signs indicated. Checking allergy and medication history...',
    ackStep8: 'Checked prior medication timing to prevent compound dosage risks.'
  },
  hi: {
    checkupBadge: 'मेडिमित्रा जांच',
    noteAck: 'जानकारी साझा करने के लिए धन्यवाद। आइए आपकी स्थिति के अनुसार कुछ आसान प्रश्न पूछते हैं।',
    feelingPrefix: 'मुझे यह महसूस हो रहा है:',
    restartedText: 'परामर्श फिर से शुरू किया गया। आइए 10-चरणीय स्वास्थ्य जांच शुरू करें:',
    analyzingText: 'मेडिमित्रा लक्षणों का विश्लेषण कर रहा है',
    patientLabel: 'मरीज',
    redFlagBannerTitle: 'उच्च प्राथमिकता चेतावनी संकेत:',
    redFlagBannerDesc: 'आपके उत्तर से लगता है कि तुरंत डॉक्टर की जांच आवश्यक हो सकती है।',
    redFlagBannerBtn: 'तुरंत नजदीकी डॉक्टर खोजें',
    ackStep1: (opt) => `समझ गया। आयु वर्ग "${opt}" सेट किया गया है। सुरक्षित खुराक की गणना की जा रही है...`,
    ackStep2: (opt) => `आपकी स्वास्थ्य स्थिति (${opt}) नोट कर ली गई है। सभी दवा और पाउडर की जांच इसी के अनुसार होगी।`,
    ackStep5: 'लक्षणों की जानकारी दर्ज हो गई है। अब गंभीर चेतावनी संकेतों की जांच की जा रही है...',
    ackStep6RedFlag: '⚠️ सावधानी: आपने एक गंभीर चेतावनी संकेत चुना है। तुरंत डॉक्टर से मिलना आवश्यक हो सकता है।',
    ackStep6Safe: 'कोई गंभीर चेतावनी संकेत नहीं मिला। अब एलर्जी और पहले ली गई दवाओं की जांच की जा रही है...',
    ackStep8: 'दवाओं के दोहराव से बचने के लिए पिछली दवा का समय जांच लिया गया है।'
  },
  hinglish: {
    checkupBadge: 'MediMitra Check-up',
    noteAck: 'Share karne ke liye shukriya. Aaiye aapke hisaab se kuch aasan sawal puchhte hain.',
    feelingPrefix: 'Mujhe yeh lag raha hai:',
    restartedText: 'Check-up dobara shuru hua. Chaliye 10-step health check shuru karte hain:',
    analyzingText: 'MediMitra symptoms analyze kar raha hai',
    patientLabel: 'Patient',
    redFlagBannerTitle: 'High Priority Warning Signal:',
    redFlagBannerDesc: 'Aapke jawab ke hisaab se turant doctor ki jaanch zaroori ho sakti hai.',
    redFlagBannerBtn: 'Turant Doctor Khojein',
    ackStep1: (opt) => `Samajh gaya. Age group "${opt}" set ho gaya hai. Safe dosage calculate ho raha hai...`,
    ackStep2: (opt) => `Aapki health detail (${opt}) note kar li hai. Saari medicine aur powder checks iske hisaab se hongi.`,
    ackStep5: 'Symptoms note ho gaye hain. Ab serious warning signs check kar rahe hain...',
    ackStep6RedFlag: '⚠️ Dhyan dein: Aapne ek serious warning sign chuna hai. Turant doctor ko dikhana zaroori ho sakta hai.',
    ackStep6Safe: 'Koi serious khatre ka nishan nahi mila. Ab allergy aur pehle li gayi dawa check kar rahe hain...',
    ackStep8: 'Double dose se bachne ke liye pehle li gayi dawa ka timing check kar liya hai.'
  },
  mr: {
    checkupBadge: 'मेडिमित्रा तपासणी',
    noteAck: 'माहिती शेअर केल्याबद्दल धन्यवाद. चला तुमच्या प्रकृतीनुसार काही सोपे प्रश्न विचारूया.',
    feelingPrefix: 'मला असे जाणवत आहे:',
    restartedText: 'तपासणी पुन्हा सुरू झाली. चला १०-टप्प्यांची आरोग्य तपासणी सुरू करूया:',
    analyzingText: 'मेडिमित्रा लक्षणांचे विश्लेषण करत आहे',
    patientLabel: 'रुग्ण',
    redFlagBannerTitle: 'तातडीचा धोक्याचा इशारा:',
    redFlagBannerDesc: 'तुमच्या उत्तरांवरून तात्काळ डॉक्टरांची तपासणी आवश्यक असू शकते.',
    redFlagBannerBtn: 'जवळचे डॉक्टर शोधा',
    ackStep1: (opt) => `समजले. वयोगट "${opt}" निश्चित केला आहे. सुरक्षित डोसची मोजणी सुरू आहे...`,
    ackStep2: (opt) => `तुमची आरोग्य माहिती (${opt}) नोंदवली आहे. सर्व औषधे व पावडर तपासणी यानुसार होईल.`,
    ackStep5: 'लक्षणांची नोंद झाली आहे. आता धोक्याच्या चिन्हांची तपासणी करत आहोत...',
    ackStep6RedFlag: '⚠️ सावधान: तुम्ही गंभीर धोक्याचे लक्षण निवडले आहे. तातडीने डॉक्टरांना भेटा.',
    ackStep6Safe: 'कोणतेही गंभीर धोक्याचे लक्षण आढळले नाही. आता ॲलर्जी व आधी घेतलेल्या औषधांची तपासणी करत आहोत...',
    ackStep8: 'दुहेरी डोस टाळण्यासाठी आधी घेतलेल्या औषधांची वेळ तपासली आहे.'
  },
  bn: {
    checkupBadge: 'মেডিমিত্র পরীক্ষা',
    noteAck: 'তথ্য দেওয়ার জন্য ধন্যবাদ। এবার আপনার উপসর্গ অনুযায়ী কয়েকটি সহজ প্রশ্ন করা যাক।',
    feelingPrefix: 'আমার অনুভূতি:',
    restartedText: 'পরামর্শ আবার শুরু হয়েছে। আসুন ১০ ধাপের স্বাস্থ্য পরীক্ষা শুরু করি:',
    analyzingText: 'মেডিমিত্র উপসর্গ বিশ্লেষণ করছে',
    patientLabel: 'রোগী',
    redFlagBannerTitle: 'জরুরি সতর্কতা সংকেত:',
    redFlagBannerDesc: 'আপনার উত্তর অনুযায়ী দ্রুত চিকিৎসকের পরামর্শ নেওয়া প্রয়োজন হতে পারে।',
    redFlagBannerBtn: 'জরুরি ডাক্তার খুঁজুন',
    ackStep1: (opt) => `বোঝা গেছে। বয়স শ্রেণি "${opt}" নির্ধারণ করা হয়েছে। নিরাপদ ডোজ হিসাব করা হচ্ছে...`,
    ackStep2: (opt) => `আপনার স্বাস্থ্য তথ্য (${opt}) নোট করা হয়েছে। সব ওষুধ ও পাউডার যাচাই সে অনুযায়ী হবে।`,
    ackStep5: 'লক্ষণগুলি নথিভুক্ত হয়েছে। এখন গুরুতর সতর্কতা চিহ্ন যাচাই করা হচ্ছে...',
    ackStep6RedFlag: '⚠️ সতর্কতা: আপনি একটি গুরুতর সতর্কতা লক্ষণ বেছে নিয়েছেন। দ্রুত চিকিৎসকের সাহায্য প্রয়োজন হতে পারে।',
    ackStep6Safe: 'কোনো গুরুতর সতর্কতা লক্ষণ পাওয়া যায়নি। এখন অ্যালার্জি ও আগের ওষুধের তথ্য যাচাই করা হচ্ছে...',
    ackStep8: 'অতিরিক্ত ডোজ এড়াতে আগের ওষুধ খাওয়ার সময় যাচাই করা হয়েছে।'
  },
  ta: {
    checkupBadge: 'மெடிமித்ரா பரிசோதனை',
    noteAck: 'பகிர்ந்ததற்கு நன்றி. உங்களுக்கு ஏற்ற சில எளிய கேள்விகளைக் கேட்போம்.',
    feelingPrefix: 'எனது உணர்வு:',
    restartedText: 'பரிசோதனை மீண்டும் தொடங்கப்பட்டது. 10-படி ஆரோக்கிய சோதனையைத் தொடங்குவோம்:',
    analyzingText: 'மெடிமித்ரா அறிகுறிகளை ஆய்வு செய்கிறது',
    patientLabel: 'நோயாளி',
    redFlagBannerTitle: 'அவசர எச்சரிக்கை அறிகுறி:',
    redFlagBannerDesc: 'உங்கள் பதிலின் அடிப்படையில் உடனடி மருத்துவப் பரிசோதனை தேவைப்படலாம்.',
    redFlagBannerBtn: 'அருகிலுள்ள மருத்துவரைத் தேடுங்கள்',
    ackStep1: (opt) => `புரிந்தது. வயது பிரிவு "${opt}" அமைக்கப்பட்டது. பாதுகாப்பான மருந்து அளவு கணக்கிடப்படுகிறது...`,
    ackStep2: (opt) => `உங்கள் உடல்நலத் தகவல் (${opt}) பதிவு செய்யப்பட்டது. மருந்து மற்றும் பவுடர் பரிந்துரை இதன்படி இருக்கும்.`,
    ackStep5: 'அறிகுறி விவரங்கள் பதிவு செய்யப்பட்டன. அபாய அறிகுறிகள் சோதிக்கப்படுகின்றன...',
    ackStep6RedFlag: '⚠️ எச்சரிக்கை: நீங்கள் அபாய அறிகுறியைத் தேர்ந்தெடுத்துள்ளீர்கள். உடனடி மருத்துவ உதவி தேவைப்படலாம்.',
    ackStep6Safe: 'அவசர அபாய அறிகுறிகள் இல்லை. ஒவ்வாமை மற்றும் முந்தைய மருந்து விவரங்கள் சரிபார்க்கப்படுகின்றன...',
    ackStep8: 'அதிகப்படியான மருந்து அளவைத் தவிர்க்க முந்தைய மருந்து நேரம் சரிபார்க்கப்பட்டது.'
  },
  te: {
    checkupBadge: 'మెడిమిత్ర తనిఖీ',
    noteAck: 'వివరాలు పంచుకున్నందుకు ధన్యవాదాలు. మీ పరిస్థితికి తగిన కొన్ని సులభమైన ప్రశ్నలు అడుగుతాము.',
    feelingPrefix: 'నాకు ఇలా అనిపిస్తోంది:',
    restartedText: 'సంప్రదింపు మళ్లీ ప్రారంభమైంది. 10-దశల ఆరోగ్య తనిఖీని ప్రారంభిద్దాం:',
    analyzingText: 'మెడిమిత్ర లక్షణాలను విశ్లేషిస్తోంది',
    patientLabel: 'రోగి',
    redFlagBannerTitle: 'అత్యవసర హెచ్చరిక సూచన:',
    redFlagBannerDesc: 'మీ సమాధానాల ప్రకారం వెంటనే వైద్యుడిని సంప్రదించడం అవసరం కావచ్చు.',
    redFlagBannerBtn: 'సమీప వైద్యులను కనుగొనండి',
    ackStep1: (opt) => `అర్థమైంది. వయస్సు వర్గం "${opt}" సెట్ చేయబడింది. సురక్షిత డోసు లెక్కించబడుతోంది...`,
    ackStep2: (opt) => `మీ ఆరోగ్య వివరాలు (${opt}) నమోదు చేయబడ్డాయి. మందులు & పౌడర్ సూచనలు దీనికి అనుగుణంగా ఉంటాయి.`,
    ackStep5: 'లక్షణాల వివరాలు నమోదయ్యాయి. ఇప్పుడు ప్రమాదకర సంకేతాలను తనిఖీ చేస్తున్నాము...',
    ackStep6RedFlag: '⚠️ జాగ్రత్త: మీరు తీవ్రమైన హెచ్చరిక లక్షణాన్ని ఎంచుకున్నారు. అత్యవసర వైద్య సహాయం అవసరం కావచ్చు.',
    ackStep6Safe: 'తీవ్రమైన ప్రమాద సంకేతాలు లేవు. అలర్జీలు మరియు ముందుగా తీసుకున్న మందులను తనిఖీ చేస్తున్నాము...',
    ackStep8: 'డబుల్ డోసును నివారించడానికి మునుపటి మందుల సమయం తనిఖీ చేయబడింది.'
  },
  gu: {
    checkupBadge: 'મેડિમિત્રા તપાસ',
    noteAck: 'માહિતી શેર કરવા બદલ આભાર. ચાલો તમારા લક્ષણો મુજબ થોડા સરળ પ્રશ્નો પૂછીએ.',
    feelingPrefix: 'મને આવું લાગે છે:',
    restartedText: 'તપાસ ફરીથી શરૂ કરવામાં આવી છે. ચાલો 10-પગલાંની આરોગ્ય તપાસ શરૂ કરીએ:',
    analyzingText: 'મેડિમિત્રા લક્ષણોનું વિશ્લેષણ કરી રહ્યું છે',
    patientLabel: 'દર્દી',
    redFlagBannerTitle: 'ઉચ્ચ પ્રાથમિકતા ચેતવણી સંકેત:',
    redFlagBannerDesc: 'તમારા જવાબ મુજબ તાત્કાલિક ડૉક્ટરની તપાસ જરૂરી હોઈ શકે છે.',
    redFlagBannerBtn: 'નજીકના ડૉક્ટર શોધો',
    ackStep1: (opt) => `સમજાઈ ગયું. વય જૂથ "${opt}" સેટ થયું છે. સુરક્ષિત ડોઝની ગણતરી થઈ રહી છે...`,
    ackStep2: (opt) => `તમારી આરોગ્ય માહિતી (${opt}) નોંધવામાં આવી છે. દવા અને પાવડરની તપાસ આ મુજબ થશે.`,
    ackStep5: 'લક્ષણોની વિગતો નોંધાઈ ગઈ છે. હવે ગંભીર ચેતવણી સંકેતોની તપાસ થઈ રહી છે...',
    ackStep6RedFlag: '⚠️ સાવધાની: તમે ગંભીર ચેતવણી સંકેત પસંદ કર્યો છે. તાત્કાલિક તબીબી મદદ જરૂરી હોઈ શકે છે.',
    ackStep6Safe: 'કોઈ ગંભીર ચેતવણી સંકેત મળ્યો નથી. હવે એલર્જી અને અગાઉ લીધેલી દવાઓ તપાસી રહ્યા છીએ...',
    ackStep8: 'વધારાના ડોઝથી બચવા માટે અગાઉની દવાનો સમય તપાસવામાં આવ્યો છે.'
  }
};

export const QUESTION_TRANSLATIONS: Record<
  LanguageCode,
  Record<QuestionId, LocalizedQuestionCopy>
> = {
  en: {
    q1_demographics: {
      question: "First, let's verify the patient's age and life stage.",
      subtext: 'Age category directly dictates medication safety, dosage calculations, and risk guidelines.',
      badge: 'Demographic Baseline',
      options: [
        'Child / Toddler (1 - 11 years)',
        'Teenager / Adolescent (12 - 17 years)',
        'Adult (18 - 59 years)',
        'Senior / Older Adult (60+ years)'
      ]
    },
    q2_pregnancy_check: {
      question: 'Are you currently pregnant, planning to become pregnant, or nursing/breastfeeding?',
      subtext: 'Crucial clinical step: Many common OTC pain relievers (like Ibuprofen/Aspirin) are contraindicated during pregnancy.',
      badge: 'Women Health Safety',
      options: [
        'No, not pregnant or nursing',
        'Currently pregnant (1st or 2nd trimester)',
        'Currently pregnant (3rd trimester)',
        'Currently breastfeeding / nursing',
        'Prefer not to disclose'
      ]
    },
    q2_pediatric_weight: {
      question: 'What is the approximate weight of the child?',
      subtext: 'Pediatric dosages (e.g. Paracetamol / Acetaminophen drops) are strictly weight-dependent (mg/kg).',
      badge: 'Pediatric Weight Safety',
      options: [
        'Under 10 kg (Under 22 lbs)',
        '10 - 18 kg (22 - 40 lbs)',
        '19 - 30 kg (41 - 66 lbs)',
        'Above 30 kg (Above 66 lbs)',
        'Not sure of exact weight'
      ]
    },
    q2_senior_conditions: {
      question: 'Do you have any existing chronic conditions like High Blood Pressure, Heart disease, or Kidney issues?',
      subtext: 'Decongestants and NSAIDs can spike blood pressure and strain renal function in older adults.',
      badge: 'Geriatric Safety Screening',
      options: [
        'No major chronic conditions',
        'High Blood Pressure (Hypertension)',
        'Type 2 Diabetes',
        'Heart disease / Cardiac history',
        'Kidney / Renal condition'
      ]
    },
    q2_general_profile: {
      question: 'Do you have any known medical conditions or regular daily medications?',
      subtext: 'Helps us ensure zero drug-drug interactions with recommended relief remedies.',
      badge: 'Baseline Health',
      options: [
        'None / Generally healthy',
        'Asthma / Respiratory sensitivity',
        'Acid reflux / Peptic ulcer',
        'High blood pressure',
        'Other regular medication'
      ]
    },
    q3_onset_duration: {
      question: 'How long have you been experiencing this symptom?',
      subtext: 'The onset time distinguishes acute, transient conditions from chronic or progressing infections.',
      badge: 'Onset & Duration',
      options: [
        'Just started today (Less than 24 hours)',
        '1 to 3 days',
        '4 to 7 days (Almost a week)',
        'More than 1 to 2 weeks',
        'Intermittent / Recurring over months'
      ]
    },
    q4_severity_intensity: {
      question: 'How would you describe the current severity or discomfort on a scale of 1 to 10?',
      subtext: 'Assess physical impact and pain threshold to calibrate urgency.',
      badge: 'Pain & Discomfort Scale',
      options: [
        '1 - 3: Mild discomfort (annoying but able to work/play)',
        '4 - 6: Moderate (interferes with focus, uncomfortable)',
        '7 - 8: Severe (hard to function, need to lie down)',
        '9 - 10: Intolerable / Excruciating (extreme distress)'
      ]
    },
    q5_fever_temp: {
      question: 'Have you checked your body temperature with a thermometer? What was the reading?',
      subtext: 'Temperatures above 102°F (38.9°C) in adults or >100.4°F in infants require strict medical monitoring.',
      badge: 'Thermal Assessment',
      options: [
        'Low-grade: 99.0°F - 100.4°F (37.2°C - 38.0°C)',
        'Moderate: 100.5°F - 102.0°F (38.1°C - 38.9°C)',
        'High: 102.1°F - 104.0°F (39.0°C - 40.0°C)',
        'Extremely High: Above 104°F (>40.0°C)',
        'No thermometer, but skin feels hot & flushed'
      ]
    },
    q5_headache_type: {
      question: 'Where is the headache localized, and how does the sensation feel?',
      subtext: 'Differentiation between tension, sinus congestion, migraine, and hypertensive pressure.',
      badge: 'Pain Characterization',
      options: [
        'Tight band across forehead / back of neck (Tension)',
        'One side throbbing with light or sound sensitivity (Migraine)',
        'Pressure behind eyes, cheeks, and nasal bridge (Sinus)',
        'Sudden explosive "thunderclap" pain like never before',
        'Dull general ache all over head'
      ]
    },
    q5_cold_discharge: {
      question: 'What is the nature of the nasal discharge and sneezing pattern?',
      subtext: 'Helps identify whether this is viral rhinovirus vs allergic rhinitis (dust/pollen).',
      badge: 'Secretions & Triggers',
      options: [
        'Clear, watery fluid with itchy eyes (Allergic)',
        'Thick yellow or green mucus with blocked nose',
        'Dry stuffy nose with no discharge',
        'Sneezing fits triggered by pollen, pets, or cold air'
      ]
    },
    q5_rash_appearance: {
      question: 'How does the rash appear, and does it itch or burn?',
      subtext: 'Looking for fungal sweat rashes, raised hives, eczema patches, or signs of skin infection.',
      badge: 'Dermatological Inspection',
      options: [
        'Raised red bumps or welts that itch intensely (Hives)',
        'Sweat rash / itchy fungal redness in skin folds (Candid-type)',
        'Dry, scaly patches or circular ringworm rash',
        'Blisters with fluid or pus crusting',
        'Purple spots that do NOT fade when pressed'
      ]
    },
    q5_cut_characteristics: {
      question: 'What caused the cut, and is the bleeding currently controlled?',
      subtext: 'Evaluates wound depth, tetanus infection risk, and whether sutures/stitches are indicated.',
      badge: 'Wound Trauma Assessment',
      options: [
        'Superficial kitchen nick / paper cut, bleeding stopped with light pressure',
        'Shallow scratch from clean object, minor oozing',
        'Cut from rusty metal, outdoor soil, or animal scratch',
        'Deep gaping wound where edges do not stay together',
        'Active bleeding that will not stop after 10 minutes of direct pressure'
      ]
    },
    q5_stomach_pattern: {
      question: 'What is the primary gastrointestinal distress you are facing?',
      subtext: 'Helps separate acid indigestion from viral gastroenteritis or food poisoning.',
      badge: 'GI Symptom Spectrum',
      options: [
        'Burning sensation in chest / upper stomach after spicy meals (Acidity)',
        'Watery loose motions (Diarrhea) 2-3 times today',
        'Frequent vomiting or severe nausea',
        'Cramping gas and bloating without fever'
      ]
    },
    q5_symptom_nuance: {
      question: 'How does this symptom feel throughout the day?',
      subtext: 'Tracking morning vs evening peaks and posture triggers.',
      badge: 'Diurnal Pattern',
      options: [
        'Worse in the morning upon waking up',
        'Worse at night while trying to sleep',
        'Constant intensity all day and night',
        'Comes in sudden waves or spasms'
      ]
    },
    q6_red_flags: {
      question: 'Are you experiencing ANY of these critical red flag warning signs?',
      subtext: 'Emergency screening: If present, immediate in-person medical evaluation is required.',
      badge: 'Red Flag Emergency Safety',
      options: [
        'None of these apply to me (Safe)',
        'Difficulty breathing, wheezing, or chest tightness',
        'Stiff neck with inability to touch chin to chest',
        'Confusion, extreme drowsiness, or fainting / dizziness',
        'Inability to keep any water or fluids down for >12 hours',
        'Blood in vomit, cough, or stool'
      ]
    },
    q7_drug_allergies: {
      question: 'Do you have any known allergies to common medicines?',
      subtext: 'Essential before recommending any OTC analgesic, antipyretic, powder, or antihistamine.',
      badge: 'Allergy Verification',
      options: [
        'No known drug allergies (NKDA)',
        'Allergic to Penicillin or related antibiotics',
        'Allergic to Aspirin or Ibuprofen / NSAIDs',
        'Allergic to Paracetamol / Acetaminophen',
        'Allergic to Sulfa drugs',
        'Multiple drug sensitivities'
      ]
    },
    q8_meds_taken_today: {
      question: 'Have you already taken any medication or home treatment in the past 12-24 hours?',
      subtext: 'Prevents accidental drug duplication or liver/kidney toxic overload.',
      badge: 'Dosage Timing & Stacking',
      options: [
        'Nothing taken yet',
        'Took Paracetamol / Tylenol earlier today',
        'Took Ibuprofen / Advil / Combiflam',
        'Took an Antihistamine / Cetirizine / Allegra',
        'Took an antacid or applied medicated powder / lotion',
        'Applied home herbal remedy / ice compress'
      ]
    },
    q9_hydration: {
      question: 'How is your fluid intake and hydration level today?',
      subtext: 'Fever and viral illnesses rapidly deplete electrolytes and water balance.',
      badge: 'Hydration & Vitals',
      options: [
        'Drinking plenty of water and clear fluids normally',
        'Slightly reduced appetite, but drinking small sips',
        'Urine is dark yellow, feeling very dry mouth and thirsty',
        'Severe nausea / unable to drink any water without vomiting'
      ]
    },
    q9_tetanus_history: {
      question: 'When did you last receive a Tetanus Toxoid (TT) booster vaccine?',
      subtext: 'Tetanus spores survive in soil, rust, and dust; boosters are recommended within 5 to 10 years of dirty cuts.',
      badge: 'Tetanus Prophylaxis',
      options: [
        'Within the last 5 years (Up to date)',
        'Between 5 and 10 years ago',
        'More than 10 years ago or never',
        'Not sure of vaccination record'
      ]
    },
    q9_daily_activities: {
      question: 'How is this condition affecting your ability to eat, sleep, and work/study?',
      subtext: 'Functional impairment score indicates clinical severity.',
      badge: 'Functional Impact',
      options: [
        'Able to eat and sleep fine, just mildly bothered',
        'Disrupted sleep last night, reduced energy',
        'Unable to work or concentrate today',
        'Completely bedridden, unable to carry out basic chores'
      ]
    },
    q10_progression: {
      question: 'How have your symptoms been changing over the last few hours?',
      subtext: 'Helps MediMitra automatically decide whether safe home medicine/powder is enough or a doctor visit is required.',
      badge: 'Symptom Progression',
      options: [
        'Gradually getting better or mild',
        'Staying about the same without worsening',
        'Slowly getting more uncomfortable',
        'Rapidly worsening over the last few hours'
      ]
    }
  },
  hi: {
    q1_demographics: {
      question: 'सबसे पहले, आइए मरीज की आयु और जीवन चरण की पुष्टि करें।',
      subtext: 'आयु वर्ग के अनुसार दवा की सुरक्षा, खुराक और जोखिम दिशानिर्देश तय होते हैं।',
      badge: 'आयु विवरण',
      options: [
        'बच्चा (1 - 11 वर्ष)',
        'किशोर (12 - 17 वर्ष)',
        'वयस्क (18 - 59 वर्ष)',
        'वरिष्ठ नागरिक (60+ वर्ष)'
      ]
    },
    q2_pregnancy_check: {
      question: 'क्या आप वर्तमान में गर्भवती हैं, गर्भधारण की योजना बना रही हैं, या स्तनपान करा रही हैं?',
      subtext: 'महत्वपूर्ण जांच: कई सामान्य दर्द निवारक दवाएं (जैसे इबुप्रोफेन/एस्पिरिन) गर्भावस्था में सुरक्षित नहीं होतीं।',
      badge: 'महिला स्वास्थ्य सुरक्षा',
      options: [
        'नहीं, गर्भवती या स्तनपान कराने वाली नहीं',
        'गर्भवती हैं (पहली या दूसरी तिमाही)',
        'गर्भवती हैं (तीसरी तिमाही)',
        'स्तनपान करा रही हैं',
        'बताना नहीं चाहतीं'
      ]
    },
    q2_pediatric_weight: {
      question: 'बच्चे का अनुमानित वजन कितना है?',
      subtext: 'बच्चों की दवा की खुराक (जैसे पैरासिटामोल सिरप/ड्रॉप्स) पूरी तरह वजन (mg/kg) पर निर्भर करती है।',
      badge: 'बाल वजन सुरक्षा',
      options: [
        '10 किग्रा से कम',
        '10 - 18 किग्रा',
        '19 - 30 किग्रा',
        '30 किग्रा से अधिक',
        'सटीक वजन पता नहीं है'
      ]
    },
    q2_senior_conditions: {
      question: 'क्या आपको हाई ब्लड प्रेशर, हृदय रोग या किडनी से जुड़ी कोई पुरानी बीमारी है?',
      subtext: 'कुछ सर्दी व दर्द की दवाएं बुजुर्गों में बीपी बढ़ा सकती हैं या किडनी पर असर डाल सकती हैं।',
      badge: 'वरिष्ठ स्वास्थ्य सुरक्षा',
      options: [
        'कोई बड़ी पुरानी बीमारी नहीं',
        'उच्च रक्तचाप (हाई बीपी)',
        'डायबिटीज (मधुमेह)',
        'हृदय रोग',
        'किडनी की समस्या'
      ]
    },
    q2_general_profile: {
      question: 'क्या आपको कोई पुरानी बीमारी है या आप रोज़ कोई नियमित दवा लेते हैं?',
      subtext: 'इससे यह सुनिश्चित होता है कि सुझाई गई दवा या पाउडर का कोई दुष्प्रभाव न हो।',
      badge: 'स्वास्थ्य पृष्ठभूमि',
      options: [
        'कोई नहीं / सामान्य रूप से स्वस्थ',
        'अस्थमा / सांस की एलर्जी',
        'एसिडिटी / पेट में अल्सर',
        'उच्च रक्तचाप (हाई बीपी)',
        'अन्य नियमित दवा ले रहे हैं'
      ]
    },
    q3_onset_duration: {
      question: 'आपको यह समस्या कब से हो रही है?',
      subtext: 'समस्या की अवधि से पता चलता है कि यह तात्कालिक है या लंबे समय से चल रहा संक्रमण।',
      badge: 'समस्या की अवधि',
      options: [
        'आज ही शुरू हुआ (24 घंटे से कम)',
        '1 से 3 दिन',
        '4 से 7 दिन (लगभग एक सप्ताह)',
        '1 से 2 सप्ताह से अधिक',
        'महीनों से बार-बार हो रहा है'
      ]
    },
    q4_severity_intensity: {
      question: '1 से 10 के पैमाने पर अभी आपकी तकलीफ या दर्द कितना गंभीर है?',
      subtext: 'तकलीफ की तीव्रता से यह तय होता है कि समस्या सामान्य है या गंभीर।',
      badge: 'तीव्रता मापदंड',
      options: [
        '1 - 3: हल्की तकलीफ (काम या खेल जारी रख सकते हैं)',
        '4 - 6: मध्यम (ध्यान भटकता है, असुविधा होती है)',
        '7 - 8: तेज / गंभीर (काम करना मुश्किल, आराम की जरूरत)',
        '9 - 10: असहनीय / अत्यधिक दर्द'
      ]
    },
    q5_fever_temp: {
      question: 'क्या आपने थर्मामीटर से तापमान जांचा है? रीडिंग क्या थी?',
      subtext: 'वयस्कों में 102°F से ऊपर या बच्चों में 100.4°F से ऊपर तापमान पर विशेष निगरानी जरूरी है।',
      badge: 'तापमान जांच',
      options: [
        'हल्का बुखार: 99.0°F - 100.4°F',
        'मध्यम बुखार: 100.5°F - 102.0°F',
        'तेज बुखार: 102.1°F - 104.0°F',
        'अत्यधिक तेज बुखार: 104°F से ऊपर',
        'थर्मामीटर नहीं है, पर शरीर गर्म लग रहा है'
      ]
    },
    q5_headache_type: {
      question: 'सिरदर्द किस हिस्से में है और यह कैसा महसूस होता है?',
      subtext: 'तनाव, साइनस, माइग्रेन और गंभीर दबाव के बीच अंतर समझने के लिए।',
      badge: 'दर्द का प्रकार',
      options: [
        'माथे या गर्दन के पीछे कसाव जैसा दर्द (तनाव)',
        'एक तरफ धड़कन वाला दर्द, रोशनी/आवाज से परेशानी (माइग्रेन)',
        'आंखों, गाल और नाक के पीछे दबाव (साइनस)',
        'अचानक बिजली जैसा अत्यंत तेज दर्द',
        'पूरे सिर में हल्का लगातार दर्द'
      ]
    },
    q5_cold_discharge: {
      question: 'नाक बहने और छींक आने का पैटर्न कैसा है?',
      subtext: 'इससे वायरल जुकाम और धूल/मौसमी एलर्जी की पहचान होती है।',
      badge: 'लक्षण और कारण',
      options: [
        'साफ पानी जैसा स्राव और आंखों में खुजली (एलर्जी)',
        'गाढ़ा पीला या हरा बलगम और बंद नाक',
        'बिना पानी के सूखी बंद नाक',
        'धूल, पालतू जानवर या ठंडी हवा से लगातार छींकें'
      ]
    },
    q5_rash_appearance: {
      question: 'त्वचा पर चकत्ते कैसे दिखते हैं और क्या उनमें खुजली या जलन होती है?',
      subtext: 'पसीने/फंगल दाद, एलर्जी पित्ती, रूखेपन या त्वचा संक्रमण की पहचान के लिए।',
      badge: 'त्वचा निरीक्षण',
      options: [
        'उभरे हुए लाल दाने जिनमें तेज खुजली हो (पित्ती/एलर्जी)',
        'पसीने या त्वचा की तहों में फंगल खुजली व लालपन (कैंडिड पाउडर योग्य)',
        'सूखे पपड़ीदार या गोल दाद जैसे चकत्ते',
        'पानी या मवाद भरे छाले / फफोले',
        'बैंगनी धब्बे जो दबाने पर भी फीके नहीं पड़ते'
      ]
    },
    q5_cut_characteristics: {
      question: 'चोट किस कारण लगी और क्या खून बहना बंद हो गया है?',
      subtext: 'घाव की गहराई, टिटनेस के खतरे और टांकों की जरूरत जांचने के लिए।',
      badge: 'घाव मूल्यांकन',
      options: [
        'हल्का कट / खरोंच, दबाव से खून रुक गया है',
        'साफ वस्तु से सतही खरोंच, हल्का रिसाव',
        'जंग लगे लोहे, मिट्टी या जानवर के खरोंच से कट',
        'गहरा खुला घाव जिसके किनारे मिल नहीं रहे',
        '10 मिनट दबाने के बाद भी खून लगातार बह रहा है'
      ]
    },
    q5_stomach_pattern: {
      question: 'पेट में मुख्य रूप से किस प्रकार की परेशानी हो रही है?',
      subtext: 'एसिडिटी/गैस और पेट के संक्रमण के बीच अंतर करने में मदद करता है।',
      badge: 'पाचन लक्षण',
      options: [
        'तीखे भोजन के बाद सीने या ऊपरी पेट में जलन (एसिडिटी)',
        'आज 2-3 बार पतले पानी जैसे दस्त',
        'बार-बार उल्टी या तेज मतली',
        'बिना बुखार के गैस, मरोड़ और पेट फूलना'
      ]
    },
    q5_symptom_nuance: {
      question: 'दिन भर में यह लक्षण कब ज्यादा महसूस होता है?',
      subtext: 'सुबह और रात में बढ़ने वाले लक्षणों के पैटर्न की जांच।',
      badge: 'दैनिक पैटर्न',
      options: [
        'सुबह उठने पर ज्यादा महसूस होता है',
        'रात में सोते समय बढ़ जाता है',
        'पूरे दिन और रात एक जैसा बना रहता है',
        'अचानक लहरों या ऐंठन की तरह आता है'
      ]
    },
    q6_red_flags: {
      question: 'क्या आपको इनमें से कोई भी गंभीर चेतावनी संकेत महसूस हो रहे हैं?',
      subtext: 'आपातकालीन जांच: यदि इनमें से कोई लक्षण हो, तो तुरंत डॉक्टर के पास जाना जरूरी है।',
      badge: 'आपातकालीन सुरक्षा जांच',
      options: [
        'इनमें से कोई भी लक्षण नहीं है (सुरक्षित)',
        'सांस लेने में कठिनाई, घरघराहट या सीने में जकड़न',
        'गर्दन में अकड़न (ठुड्डी को सीने से न लगा पाना)',
        'भ्रम, अत्यधिक सुस्ती, चक्कर या बेहोशी',
        '12 घंटे से अधिक समय से पानी भी न पच पाना (उल्टी)',
        'उल्टी, खांसी या मल में खून आना'
      ]
    },
    q7_drug_allergies: {
      question: 'क्या आपको किसी सामान्य दवा से एलर्जी है?',
      subtext: 'कोई भी सुरक्षित दवा या पाउडर सुझाने से पहले यह जांच जरूरी है।',
      badge: 'दवा एलर्जी जांच',
      options: [
        'किसी दवा से कोई एलर्जी नहीं है',
        'पेनिसिलिन या एंटीबायोटिक्स से एलर्जी',
        'एस्पिरिन या इबुप्रोफेन (NSAIDs) से एलर्जी',
        'पैरासिटामोल से एलर्जी',
        'सल्फा दवाओं से एलर्जी',
        'कई दवाओं से संवेदनशीलता'
      ]
    },
    q8_meds_taken_today: {
      question: 'क्या आपने पिछले 12-24 घंटों में कोई दवा या घरेलू उपचार लिया है?',
      subtext: 'दवा के ओवरडोज या दोहराव से बचने के लिए।',
      badge: 'पिछली दवा का विवरण',
      options: [
        'अभी तक कुछ नहीं लिया है',
        'आज पहले पैरासिटामोल / क्रोसिन ली है',
        'इबुप्रोफेन / कॉम्बिफ्लेम ली है',
        'एलर्जी की गोली (सेटिरिज़िन / एलेग्रा) ली है',
        'एंटासिड (ईनो/जेलुसिल) या पाउडर/लोशन लगाया है',
        'घरेलू काढ़ा या बर्फ की सिकाई की है'
      ]
    },
    q9_hydration: {
      question: 'आज आपका पानी पीने और शरीर में तरलता (हाइड्रेशन) का स्तर कैसा है?',
      subtext: 'बुखार और पेट खराब होने पर शरीर में पानी और इलेक्ट्रोलाइट्स की कमी जल्दी होती है।',
      badge: 'हाइड्रेशन जांच',
      options: [
        'सामान्य रूप से पर्याप्त पानी और तरल पदार्थ पी रहे हैं',
        'भूख कम है, पर थोड़ा-थोड़ा पानी पी पा रहे हैं',
        'पेशाब गहरा पीला है, मुंह सूख रहा है और बहुत प्यास लग रही है',
        'तेज मतली / पानी पीते ही उल्टी हो रही है'
      ]
    },
    q9_tetanus_history: {
      question: 'आपने आखिरी बार टिटनेस (TT) का टीका कब लगवाया था?',
      subtext: 'धूल, मिट्टी या जंग से लगे कट के 5-10 साल के भीतर टिटनेस बूस्टर आवश्यक होता है।',
      badge: 'टिटनेस सुरक्षा',
      options: [
        'पिछले 5 वर्षों के भीतर (अप टू डेट)',
        '5 से 10 साल पहले',
        '10 साल से अधिक पहले या कभी नहीं',
        'टीकाकरण की जानकारी याद नहीं है'
      ]
    },
    q9_daily_activities: {
      question: 'यह समस्या आपके खाने, सोने और रोज़मर्रा के कामों को कैसे प्रभावित कर रही है?',
      subtext: 'दैनिक कार्यक्षमता पर प्रभाव से गंभीरता का सही अंदाजा लगता है।',
      badge: 'दैनिक प्रभाव',
      options: [
        'खाना-पीना और नींद ठीक है, बस हल्की परेशानी है',
        'रात में नींद खराब हुई और थकान महसूस हो रही है',
        'आज काम या पढ़ाई पर ध्यान नहीं दे पा रहे',
        'पूरी तरह बिस्तर पर हैं, सामान्य काम भी नहीं हो पा रहे'
      ]
    },
    q10_progression: {
      question: 'पिछले कुछ घंटों में आपके लक्षणों की स्थिति कैसी बदल रही है?',
      subtext: 'इससे मेडिमित्रा अपने आप तय करेगा कि सामान्य दवा/पाउडर पर्याप्त है या डॉक्टर के पास जाना होगा।',
      badge: 'लक्षणों की प्रगति',
      options: [
        'धीरे-धीरे सुधार हो रहा है या हल्का है',
        'पहले जैसा ही स्थिर है, बढ़ नहीं रहा',
        'धीरे-धीरे असुविधा बढ़ रही है',
        'पिछले कुछ घंटों में तेजी से बिगड़ रहा है'
      ]
    }
  },
  hinglish: {
    q1_demographics: {
      question: 'Sabse pehle, patient ki age aur life stage confirm karte hain.',
      subtext: 'Age ke hisaab se dawa ki safety aur sahi dosage tay hoti hai.',
      badge: 'Age Details',
      options: [
        'Bachcha / Child (1 - 11 saal)',
        'Teenager (12 - 17 saal)',
        'Adult (18 - 59 saal)',
        'Bujurg / Senior (60+ saal)'
      ]
    },
    q2_pregnancy_check: {
      question: 'Kya aap abhi pregnant hain, plan kar rahi hain, ya baby ko doodh pila rahi hain?',
      subtext: 'Zaroori jaanch: Kuch common painkillers (jaise Ibuprofen/Aspirin) pregnancy me safe nahi hote.',
      badge: 'Women Health Safety',
      options: [
        'Nahi, pregnant ya nursing nahi hoon',
        'Pregnant hoon (1st ya 2nd trimester)',
        'Pregnant hoon (3rd trimester)',
        'Breastfeeding / nursing kar rahi hoon',
        'Batana nahi chahti'
      ]
    },
    q2_pediatric_weight: {
      question: 'Bachche ka lagbhag weight kitna hai?',
      subtext: 'Bachchon ki dawa (jaise Paracetamol syrup/drops) weight (mg/kg) ke hisaab se di jaati hai.',
      badge: 'Child Weight Safety',
      options: [
        '10 kg se kam',
        '10 - 18 kg',
        '19 - 30 kg',
        '30 kg se zyada',
        'Exact weight pata nahi hai'
      ]
    },
    q2_senior_conditions: {
      question: 'Kya aapko High BP, Heart problem ya Kidney ki koi purani bimari hai?',
      subtext: 'Kuch cold aur pain ki dawaayein bujurgon me BP badha sakti hain.',
      badge: 'Senior Health Check',
      options: [
        'Koi badi purani bimari nahi',
        'High Blood Pressure (BP)',
        'Sugar / Type 2 Diabetes',
        'Heart ki problem',
        'Kidney ki samasya'
      ]
    },
    q2_general_profile: {
      question: 'Kya aapko koi purani bimari hai ya roz koi regular dawa lete hain?',
      subtext: 'Isse sure hota hai ki suggest ki gayi dawa ya powder safe rahe.',
      badge: 'Health Background',
      options: [
        'Kuch nahi / Bilkul healthy',
        'Asthma / Saans ki dikkat',
        'Acidity / Pet ka ulcer',
        'High Blood Pressure',
        'Koi aur regular dawa chal rahi hai'
      ]
    },
    q3_onset_duration: {
      question: 'Aapko yeh problem kab se ho rahi hai?',
      subtext: 'Time duration se pata chalta hai ki problem nayi hai ya purani.',
      badge: 'Samay aur Duration',
      options: [
        'Aaj hi shuru hui (24 ghante se kam)',
        '1 se 3 din',
        '4 se 7 din (lagbhag ek hafta)',
        '1 se 2 hafte se zyada',
        'Mahinon se baar-baar ho rahi hai'
      ]
    },
    q4_severity_intensity: {
      question: '1 se 10 ke scale par abhi takleef ya dard kitna tez hai?',
      subtext: 'Isse pata chalta hai ki problem mild hai ya serious.',
      badge: 'Pain Scale',
      options: [
        '1 - 3: Halka dard/takleef (kaam kar sakte hain)',
        '4 - 6: Medium (dhyan bhatakta hai, bechaini)',
        '7 - 8: Tez / Serious (kaam karna mushkil, aaram chahiye)',
        '9 - 10: Bahut zyada / Asahaniya dard'
      ]
    },
    q5_fever_temp: {
      question: 'Kya aapne thermometer se bukhar check kiya hai? Reading kya aayi?',
      subtext: '102°F se upar bukhar par doctor ki salah zaroori ho sakti hai.',
      badge: 'Temperature Check',
      options: [
        'Halka bukhar: 99.0°F - 100.4°F',
        'Medium bukhar: 100.5°F - 102.0°F',
        'Tez bukhar: 102.1°F - 104.0°F',
        'Bahut tez bukhar: 104°F se upar',
        'Thermometer nahi hai, par body garam lag rahi hai'
      ]
    },
    q5_headache_type: {
      question: 'Sar dard kis jagah par hai aur kaisa mehsoos ho raha hai?',
      subtext: 'Tension, sinus, migraine aur serious dard me farq samajhne ke liye.',
      badge: 'Headache Type',
      options: [
        'Maathe ya gardan ke peeche khichav (Tension)',
        'Ek side dhadkan jaisa dard, light/awaaz se chidh (Migraine)',
        'Aankhon, gaal aur naak ke paas dabav (Sinus)',
        'Achanak bijli jaisa bahut tez dard',
        'Poore sar me halka dard'
      ]
    },
    q5_cold_discharge: {
      question: 'Naak behna aur chheenk aane ka pattern kaisa hai?',
      subtext: 'Viral zukam aur dust/allergy ke beech farq samajhne ke liye.',
      badge: 'Cold Details',
      options: [
        'Saaf paani jaisa naak behna aur aankhon me khujli (Allergy)',
        'Gaadha peela ya hara balgam aur naak band',
        'Sukhi band naak, bina paani ke',
        'Dhool, thandi hawa ya pet se lagatar chheenk'
      ]
    },
    q5_rash_appearance: {
      question: 'Skin par rash kaisa dikh raha hai aur kya khujli ya jalan hai?',
      subtext: 'Fungal pasine wali khujli (daad), allergy ke daane ya infection check karne ke liye.',
      badge: 'Skin Check',
      options: [
        'Ubhre hue laal daane jisme tez khujli ho (Hives/Allergy)',
        'Pasine ya skin folds me laal fungal khujli (Candid powder type)',
        'Sookhe papdi wale ya gol daad jaise nishan',
        'Paani ya pas bhare chhale / blisters',
        'Neela/baingani daag jo dabane par halka nahi hota'
      ]
    },
    q5_cut_characteristics: {
      question: 'Chot kis cheez se lagi aur kya khoon behna ruk gaya hai?',
      subtext: 'Ghav ki gehrai aur tetanus risk check karne ke liye.',
      badge: 'Cut & Wound Check',
      options: [
        'Chhota kitchen cut / kharonch, dabane par khoon ruk gaya',
        'Saaf cheez se halki kharonch',
        'Zang lage lohe, mitti ya janwar ke nakhun se chot',
        'Gehra khula ghav jiske kinare jud nahi rahe',
        '10 minute dabane ke baad bhi khoon nahi ruk raha'
      ]
    },
    q5_stomach_pattern: {
      question: 'Pet me main problem kya ho rahi hai?',
      subtext: 'Acidity/gas aur food poisoning me farq samajhne ke liye.',
      badge: 'Stomach Check',
      options: [
        'Teekha khane ke baad seene/pet me jalan (Acidity)',
        'Aaj 2-3 baar patle dast (Loose motions)',
        'Baar-baar ulti ya bahut matli',
        'Bina bukhar ke gas, marod aur pet phoolna'
      ]
    },
    q5_symptom_nuance: {
      question: 'Poore din me yeh takleef kab zyada lagti hai?',
      subtext: 'Subah aur raat ke pattern ko samajhne ke liye.',
      badge: 'Daily Pattern',
      options: [
        'Subah uthne par zyada mehsoos hota hai',
        'Raat ko sote waqt badh jaata hai',
        'Din aur raat lagatar ek jaisa rehta hai',
        'Achanak lahar ya ainthaan ki tarah aata hai'
      ]
    },
    q6_red_flags: {
      question: 'Kya aapko inme se koi serious khatre ka nishan mehsoos ho raha hai?',
      subtext: 'Emergency safety check: Agar inme se kuch ho toh turant doctor ke paas jaana zaroori hai.',
      badge: 'Emergency Warning Check',
      options: [
        'Inme se koi bhi nahi hai (Safe)',
        'Saans lene me dikkat ya seene me jakdan',
        'Gardan me akad (thuddi seene se na lag paana)',
        'Ghabrahat, bahut zyada neend aana ya chakkar/behoshi',
        '12 ghante se zyada se paani bhi pet me na rukna (ulti)',
        'Ulti, khansi ya potty me khoon aana'
      ]
    },
    q7_drug_allergies: {
      question: 'Kya aapko kisi common dawa se allergy hai?',
      subtext: 'Koi bhi safe medicine ya powder batane se pehle yeh jaanch zaroori hai.',
      badge: 'Allergy Check',
      options: [
        'Kisi dawa se koi allergy nahi hai',
        'Penicillin ya antibiotics se allergy',
        'Aspirin ya Ibuprofen (NSAIDs) se allergy',
        'Paracetamol se allergy',
        'Sulfa dawaon se allergy',
        'Kai dawaon se sensitivity'
      ]
    },
    q8_meds_taken_today: {
      question: 'Kya aapne pichle 12-24 ghante me koi dawa ya gharelu upay kiya hai?',
      subtext: 'Double dose ya liver/kidney par asar se bachne ke liye.',
      badge: 'Previous Medicine Check',
      options: [
        'Abhi tak kuch nahi liya',
        'Aaj pehle Paracetamol / Crocin li hai',
        'Ibuprofen / Combiflam li hai',
        'Allergy ki goli (Cetirizine / Allegra) li hai',
        'Antacid (Eno/Gelusil) ya powder/lotion lagaya hai',
        'Gharelu kadha ya barf se sikai ki hai'
      ]
    },
    q9_hydration: {
      question: 'Aaj aapka paani aur liquid peene ka level kaisa hai?',
      subtext: 'Bukhar aur loose motion me body se paani aur salts jaldi kam hote hain.',
      badge: 'Hydration Check',
      options: [
        'Normal tarike se khoob paani aur liquids pee rahe hain',
        'Bhook kam hai, par thoda-thoda paani pee rahe hain',
        'Peshab peela hai, munh sookh raha hai aur tez pyaas hai',
        'Bahut matli hai / paani peete hi ulti ho rahi hai'
      ]
    },
    q9_tetanus_history: {
      question: 'Aapne aakhri baar Tetanus (TT) ka injection kab lagwaya tha?',
      subtext: 'Mitti ya zang wali chot ke liye 5-10 saal ke andar TT booster zaroori hota hai.',
      badge: 'Tetanus Check',
      options: [
        'Pichle 5 saal ke andar lagwaya hai',
        '5 se 10 saal pehle',
        '10 saal se zyada pehle ya kabhi nahi',
        'Yaad nahi hai'
      ]
    },
    q9_daily_activities: {
      question: 'Is problem se aapke khane, sone aur roz ke kaam par kya asar pad raha hai?',
      subtext: 'Daily routine par asar dekh kar problem ki seriousness samajh aati hai.',
      badge: 'Daily Impact',
      options: [
        'Khana aur neend theek hai, bas halki dikkat hai',
        'Raat ko neend kharab hui, thakan lag rahi hai',
        'Aaj kaam ya padhai par dhyan nahi lag raha',
        'Bilkul bed par hain, roz ke kaam bhi nahi ho pa rahe'
      ]
    },
    q10_progression: {
      question: 'Pichle kuch ghanton me aapke symptoms kis taraf badal rahe hain?',
      subtext: 'Iske base par MediMitra khud decide karega ki basic medicine/powder kaafi hai ya doctor chahiye.',
      badge: 'Symptom Progression',
      options: [
        'Dheere-dheere theek ho raha hai ya halka hai',
        'Jaisa tha waisa hi hai, badh nahi raha',
        'Dheere-dheere takleef badh rahi hai',
        'Pichle kuch ghanton me tezi se badh raha hai'
      ]
    }
  },
  mr: {
    q1_demographics: {
      question: 'प्रथम रुग्णाचे वय आणि वयोगट निश्चित करूया.',
      subtext: 'वयोगटानुसार औषधांची सुरक्षितता आणि योग्य डोस ठरवला जातो.',
      badge: 'वय तपशील',
      options: ['लहान मूल (1 - 11 वर्षे)', 'किशोर (12 - 17 वर्षे)', 'प्रौढ (18 - 59 वर्षे)', 'ज्येष्ठ नागरिक (60+ वर्षे)']
    },
    q2_pregnancy_check: {
      question: 'तुम्ही सध्या गर्भवती आहात, गर्भधारणेचा विचार करत आहात किंवा स्तनपान देत आहात का?',
      subtext: 'महत्त्वाची तपासणी: काही सामान्य वेदनाशामक औषधे गर्भधारणेदरम्यान सुरक्षित नसतात.',
      badge: 'महिला आरोग्य सुरक्षा',
      options: ['नाही, गर्भवती किंवा स्तनपान देत नाही', 'गर्भवती आहे (पहिला किंवा दुसरा तिमाही)', 'गर्भवती आहे (तिसरा तिमाही)', 'स्तनपान देत आहे', 'सांगायचे नाही']
    },
    q2_pediatric_weight: {
      question: 'मुलाचे अंदाजे वजन किती आहे?',
      subtext: 'मुलांच्या औषधांचा डोस पूर्णपणे वजनावर (mg/kg) आधारित असतो.',
      badge: 'बाल वजन सुरक्षा',
      options: ['10 किलोपेक्षा कमी', '10 - 18 किलो', '19 - 30 किलो', '30 किलोपेक्षा जास्त', 'नेमके वजन माहित नाही']
    },
    q2_senior_conditions: {
      question: 'तुम्हाला उच्च रक्तदाब (BP), हृदयरोग किंवा किडनीचा जुना आजार आहे का?',
      subtext: 'काही औषधांमुळे ज्येष्ठांमध्ये रक्तदाब वाढू शकतो.',
      badge: 'ज्येष्ठ आरोग्य तपासणी',
      options: ['कोणताही मोठा जुना आजार नाही', 'उच्च रक्तदाब (हाय बीपी)', 'मधुमेह (डायबिटीज)', 'हृदयरोग', 'किडनीचा त्रास']
    },
    q2_general_profile: {
      question: 'तुम्हाला कोणताही जुना आजार आहे का किंवा नियमित औषधे सुरू आहेत का?',
      subtext: 'सुचवलेले औषध किंवा पावडर सुरक्षित राहण्यासाठी ही माहिती मदत करते.',
      badge: 'आरोग्य माहिती',
      options: ['काही नाही / निरोगी', 'दमा / श्वसनाचा त्रास', 'ॲसिडिटी / पोटाचा अल्सर', 'उच्च रक्तदाब', 'इतर नियमित औषधे सुरू आहेत']
    },
    q3_onset_duration: {
      question: 'तुम्हाला हा त्रास केव्हापासून होत आहे?',
      subtext: 'कालावधीवरून समस्या तात्पुरती आहे की संसर्ग वाढत आहे हे समजते.',
      badge: 'कालावधी',
      options: ['आजच सुरू झाले (24 तासांपेक्षा कमी)', '1 ते 3 दिवस', '4 ते 7 दिवस (सुमारे आठवडा)', '1 ते 2 आठवड्यांपेक्षा जास्त', 'महिन्यांपासून अधूनमधून']
    },
    q4_severity_intensity: {
      question: '1 ते 10 च्या प्रमाणात सध्याचा त्रास किंवा वेदना किती तीव्र आहेत?',
      subtext: 'तीव्रतेवरून समस्येचे गांभीर्य ठरवले जाते.',
      badge: 'वेदना तीव्रता',
      options: ['1 - 3: सौम्य त्रास (दैनंदिन कामे शक्य)', '4 - 6: मध्यम त्रास (लक्ष विचलित होते)', '7 - 8: तीव्र त्रास (कामे करणे कठीण)', '9 - 10: असह्य तीव्र वेदना']
    },
    q5_fever_temp: {
      question: 'थर्मामीटरने तापमान मोजले आहे का? रीडिंग किती होते?',
      subtext: '102°F पेक्षा जास्त ताप असल्यास डॉक्टरांचे लक्ष आवश्यक असते.',
      badge: 'तापमान तपासणी',
      options: ['सौम्य ताप: 99.0°F - 100.4°F', 'मध्यम ताप: 100.5°F - 102.0°F', 'उच्च ताप: 102.1°F - 104.0°F', 'अतिउच्च ताप: 104°F पेक्षा जास्त', 'थर्मामीटर नाही, पण अंग गरम वाटते']
    },
    q5_headache_type: {
      question: 'डोके नेमके कुठे आणि कसे दुखत आहे?',
      subtext: 'ताण, सायनस आणि मायग्रेन यातील फरक ओळखण्यासाठी.',
      badge: 'डोकेदुखीचा प्रकार',
      options: ['कपाळावर किंवा मानेमागे घट्ट ताण', 'एका बाजूला ठणकणारे दुखणे व प्रकाश/आवाजाचा त्रास (मायग्रेन)', 'डोळे व नाकामागे जडपणा (सायनस)', 'अचानक अत्यंत तीव्र धक्कादायक वेदना', 'संपूर्ण डोक्यात सौम्य दुखणे']
    },
    q5_cold_discharge: {
      question: 'सर्दी व शिंकांचे स्वरूप कसे आहे?',
      subtext: 'व्हायरल सर्दी व ॲलर्जीमधील फरक ओळखण्यासाठी.',
      badge: 'सर्दी तपशील',
      options: ['स्वच्छ पाण्यासारखे नाक गळणे व डोळ्यांना खाज (ॲलर्जी)', 'दाट पिवळा किंवा हिरवा कफ आणि नाक बंद', 'पाण्याशिवाय कोरडे बंद नाक', 'धूळ किंवा थंड हवेमुळे सतत शिंका']
    },
    q5_rash_appearance: {
      question: 'त्वचेवरील पुरळ कसे दिसते आणि त्यात खाज किंवा जळजळ होते का?',
      subtext: 'घाम/बुरशीजन्य खाज (Candid पावडर योग्य), ॲलर्जी किंवा संसर्ग ओळखण्यासाठी.',
      badge: 'त्वचा तपासणी',
      options: ['उंचवटलेले लाल फोड व तीव्र खाज (ॲलर्जी)', 'घाम किंवा त्वचेच्या घड्यांमध्ये बुरशीजन्य लाल खाज (कॅन्डिड पावडर योग्य)', 'कोरडे खपलीसारखे किंवा गोलाकार नायटासारखे चट्टे', 'पाणी किंवा पू भरलेले फोड', 'दाबल्यावरही फिकट न होणारे जांभळे डाग']
    },
    q5_cut_characteristics: {
      question: 'जखम कशामुळे झाली आणि रक्तस्त्राव थांबला आहे का?',
      subtext: 'जखमेची खोली व धनुर्वात (टिटॅनस) धोका तपासण्यासाठी.',
      badge: 'जखम तपासणी',
      options: ['किरकोळ कापणे/खरचटणे, दाब दिल्यावर रक्त थांबले', 'स्वच्छ वस्तूमुळे वरवरचा ओरखडा', 'गंजलेले लोखंड, माती किंवा प्राण्याच्या नखाची जखम', 'खोल उघडी जखम जिच्या कडा जुळत नाहीत', '10 मिनिटे दाब देऊनही रक्त वाहत आहे']
    },
    q5_stomach_pattern: {
      question: 'पोटात मुख्यतः कोणता त्रास होत आहे?',
      subtext: 'ॲसिडिटी आणि पोटाच्या संसर्गातील फरक ओळखण्यासाठी.',
      badge: 'पोटाचे लक्षण',
      options: ['तिखट खाल्ल्यानंतर छातीत किंवा पोटात जळजळ (ॲसिडिटी)', 'आज 2-3 वेळा पातळ जुलाब', 'वारंवार उलट्या किंवा तीव्र मळमळ', 'तापाशिवाय गॅस, मुरडा आणि पोट फुगणे']
    },
    q5_symptom_nuance: {
      question: 'दिवसभरात हा त्रास कधी जास्त जाणवतो?',
      subtext: 'सकाळ-रात्रीच्या बदलाचा अंदाज घेण्यासाठी.',
      badge: 'दैनिक स्वरूप',
      options: ['सकाळी उठल्यावर जास्त जाणवतो', 'रात्री झोपताना वाढतो', 'दिवस-रात्र सतत सारखाच राहतो', 'अचानक लाटांप्रमाणे येतो']
    },
    q6_red_flags: {
      question: 'तुम्हाला यापैकी कोणतीही गंभीर धोक्याची लक्षणे जाणवत आहेत का?',
      subtext: 'तात्काळ तपासणी: यापैकी कोणतेही लक्षण असल्यास त्वरित डॉक्टरांना भेटा.',
      badge: 'तात्काळ सुरक्षा तपासणी',
      options: ['यापैकी कोणतेही लक्षण नाही (सुरक्षित)', 'श्वास घेण्यास त्रास किंवा छातीत जडपणा', 'मान ताठ होणे (हनुवटी छातीला न लागणे)', 'गोंधळ, अति झोप येणे किंवा चक्कर/बेशुद्धी', '12 तासांपेक्षा जास्त काळ पाणीही न पचणे', 'उलटी, खोकला किंवा शौचातून रक्त येणे']
    },
    q7_drug_allergies: {
      question: 'तुम्हाला कोणत्याही सामान्य औषधाची ॲलर्जी आहे का?',
      subtext: 'सुरक्षित औषध किंवा पावडर सुचवण्यापूर्वी ही खात्री आवश्यक आहे.',
      badge: 'औषध ॲलर्जी',
      options: ['कोणत्याही औषधाची ॲलर्जी नाही', 'पेनिसिलिन किंवा अँटिबायोटिक्सची ॲलर्जी', 'ॲस्पिरिन किंवा आयबुप्रोफेन (NSAIDs) ची ॲलर्जी', 'पॅरासिटामोलची ॲलर्जी', 'सल्फा औषधांची ॲलर्जी', 'अनेक औषधांची संवेदनशीलता']
    },
    q8_meds_taken_today: {
      question: 'तुम्ही मागील 12-24 तासांत कोणतेही औषध किंवा घरगुती उपचार घेतले आहेत का?',
      subtext: 'दुहेरी डोस टाळण्यासाठी ही माहिती महत्त्वाची आहे.',
      badge: 'मागील औषध तपशील',
      options: ['अजून काहीही घेतलेले नाही', 'आज पॅरासिटामोल घेतली आहे', 'आयबुप्रोफेन / कॉम्बिफ्लेम घेतली आहे', 'ॲलर्जीची गोळी (Cetirizine) घेतली आहे', 'ॲन्टॅसिड (Eno/Gelusil) किंवा पावडर/लोशन लावले आहे', 'घरगुती काढा किंवा बर्फाचा शेक घेतला आहे']
    },
    q9_hydration: {
      question: 'आज तुमचे पाणी व द्रवपदार्थ पिण्याचे प्रमाण कसे आहे?',
      subtext: 'ताप व जुलाबामध्ये शरीरातील पाणी लवकर कमी होते.',
      badge: 'पाणी व हायड्रेशन',
      options: ['नेहमीप्रमाणे पुरेसे पाणी व द्रव पीत आहे', 'भूक कमी आहे पण थोडे थोडे पाणी पीत आहे', 'लघवी गडद पिवळी व तोंड कोरडे पडले आहे', 'पाणी प्यायल्यावर लगेच उलटी होत आहे']
    },
    q9_tetanus_history: {
      question: 'तुम्ही शेवटचे टिटॅनस (TT) चे इंजेक्शन केव्हा घेतले होते?',
      subtext: 'माती किंवा गंज लागलेल्या जखमेसाठी 5-10 वर्षांत बूस्टर आवश्यक असतो.',
      badge: 'टिटॅनस तपासणी',
      options: ['मागील 5 वर्षांत घेतले आहे', '5 ते 10 वर्षांपूर्वी', '10 वर्षांहून अधिक काळ किंवा कधीच नाही', 'लक्षात नाही']
    },
    q9_daily_activities: {
      question: 'या त्रासाचा तुमच्या खाण्यावर, झोपेवर आणि कामावर कसा परिणाम होत आहे?',
      subtext: 'दैनंदिन जीवनावरील परिणामावरून तीव्रता कळते.',
      badge: 'दैनंदिन परिणाम',
      options: ['खाणे-झोप ठीक आहे, फक्त किरकोळ त्रास', 'रात्री झोप मोडली आणि थकवा वाटतो', 'आज काम किंवा अभ्यासात लक्ष लागत नाही', 'पूर्णपणे अंथरुणाला खिळून आहे']
    },
    q10_progression: {
      question: 'मागील काही तासांत तुमची लक्षणे कशी बदलत आहेत?',
      subtext: 'यावरून मेडिमित्रा स्वतः ठरवेल की साधे औषध/पावडर पुरेसे आहे की डॉक्टर आवश्यक आहेत.',
      badge: 'लक्षणांची दिशा',
      options: ['हळूहळू बरे वाटत आहे किंवा सौम्य आहे', 'जसे होते तसेच स्थिर आहे', 'हळूहळू अस्वस्थता वाढत आहे', 'मागील काही तासांत वेगाने वाढत आहे']
    }
  },
  bn: {
    q1_demographics: {
      question: 'প্রথমে রোগীর বয়স এবং পর্যায় নিশ্চিত করা যাক।',
      subtext: 'বয়স অনুযায়ী ওষুধের নিরাপত্তা ও সঠিক মাত্রা নির্ধারণ করা হয়।',
      badge: 'বয়সের তথ্য',
      options: ['শিশু (1 - 11 বছর)', 'কিশোর (12 - 17 বছর)', 'প্রাপ্তবয়স্ক (18 - 59 বছর)', 'বয়োজ্যেষ্ঠ (60+ বছর)']
    },
    q2_pregnancy_check: {
      question: 'আপনি কি বর্তমানে গর্ভবতী, গর্ভধারণের পরিকল্পনা করছেন, বা স্তন্যপান করাচ্ছেন?',
      subtext: 'গুরুত্বপূর্ণ যাচাই: অনেক সাধারণ ব্যথার ওষুধ গর্ভাবস্থায় নিরাপদ নয়।',
      badge: 'নারী স্বাস্থ্য সুরক্ষা',
      options: ['না, গর্ভবতী বা স্তন্যদানকারী নই', 'গর্ভবতী (প্রথম বা দ্বিতীয় ত্রৈমাসিক)', 'গর্ভবতী (তৃতীয় ত্রৈমাসিক)', 'স্তন্যপান করাচ্ছি', 'জানাতে চাই না']
    },
    q2_pediatric_weight: {
      question: 'শিশুটির আনুমানিক ওজন কত?',
      subtext: 'শিশুদের ওষুধের ডোজ সম্পূর্ণ ওজনের (mg/kg) উপর নির্ভর করে।',
      badge: 'শিশু ওজন সুরক্ষা',
      options: ['10 কেজির কম', '10 - 18 কেজি', '19 - 30 কেজি', '30 কেজির বেশি', 'সঠিক ওজন জানা নেই']
    },
    q2_senior_conditions: {
      question: 'আপনার কি উচ্চ রক্তচাপ, হৃদরোগ বা কিডনির কোনো পুরোনো সমস্যা আছে?',
      subtext: 'বয়স্কদের ক্ষেত্রে কিছু ওষুধ রক্তচাপ বাড়াতে পারে।',
      badge: 'বয়োজ্যেষ্ঠ সুরক্ষা',
      options: ['কোনো বড় পুরোনো রোগ নেই', 'উচ্চ রক্তচাপ', 'ডায়াবেটিস', 'হৃদরোগ', 'কিডনির সমস্যা']
    },
    q2_general_profile: {
      question: 'আপনার কি কোনো দীর্ঘমেয়াদি রোগ আছে বা নিয়মিত কোনো ওষুধ খান?',
      subtext: 'নিরাপদ ওষুধ বা পাউডার পরামর্শ দেওয়ার জন্য এটি প্রয়োজনীয়।',
      badge: 'স্বাস্থ্য তথ্য',
      options: ['কিছু নেই / সুস্থ', 'হাঁপানি / শ্বাসকষ্ট', 'অ্যাসিডিটি / আলসার', 'উচ্চ রক্তচাপ', 'অন্য নিয়মিত ওষুধ চলছে']
    },
    q3_onset_duration: {
      question: 'কতদিন ধরে এই সমস্যা হচ্ছে?',
      subtext: 'সময়কাল থেকে বোঝা যায় সমস্যাটি নতুন নাকি দীর্ঘস্থায়ী।',
      badge: 'সময়কাল',
      options: ['আজই শুরু হয়েছে (24 ঘণ্টার কম)', '1 থেকে 3 দিন', '4 থেকে 7 দিন', '1 থেকে 2 সপ্তাহের বেশি', 'মাসের পর মাস মাঝে মাঝে হয়']
    },
    q4_severity_intensity: {
      question: '1 থেকে 10 স্কেলে আপনার কষ্ট বা ব্যথা এখন কতটা তীব্র?',
      subtext: 'তীব্রতা অনুযায়ী সমস্যার গুরুত্ব নির্ধারিত হয়।',
      badge: 'তীব্রতার মাত্রা',
      options: ['1 - 3: হালকা অস্বস্তি', '4 - 6: মাঝারি কষ্ট', '7 - 8: তীব্র কষ্ট (বিশ্রাম দরকার)', '9 - 10: অসহনীয় ব্যথা']
    },
    q5_fever_temp: {
      question: 'থার্মোমিটারে শরীরের তাপমাত্রা কত ছিল?',
      subtext: '102°F-এর বেশি জ্বর হলে সতর্ক পর্যবেক্ষণ প্রয়োজন।',
      badge: 'তাপমাত্রা যাচাই',
      options: ['হালকা: 99.0°F - 100.4°F', 'মাঝারি: 100.5°F - 102.0°F', 'বেশি: 102.1°F - 104.0°F', 'অত্যধিক: 104°F-এর বেশি', 'থার্মোমিটার নেই, তবে গা গরম']
    },
    q5_headache_type: {
      question: 'মাথাব্যথা কোথায় এবং কেমন অনুভূত হচ্ছে?',
      subtext: 'টেনশন, সাইনাস ও মাইগ্রেনের পার্থক্য বুঝতে সাহায্য করে।',
      badge: 'ব্যথার ধরন',
      options: ['কপাল ও ঘাড়ের পেছনে চাপ', 'একপাশে দপদপানি ও আলো-শব্দে কষ্ট (মাইগ্রেন)', 'চোখ ও নাকের পেছনে চাপ (সাইনাস)', 'হঠাৎ তীব্র বজ্রপাতের মতো ব্যথা', 'সারা মাথায় হালকা ব্যথা']
    },
    q5_cold_discharge: {
      question: 'সর্দি ও হাঁচির ধরন কেমন?',
      subtext: 'ভাইরাল সর্দি ও অ্যালার্জির পার্থক্য বুঝতে।',
      badge: 'সর্দির লক্ষণ',
      options: ['স্বচ্ছ জলের মতো সর্দি ও চোখে চুলকানি (অ্যালার্জি)', 'ঘন হলুদ বা সবুজ শ্লেষ্মা ও নাক বন্ধ', 'সর্দি ছাড়া শুকনো বন্ধ নাক', 'ধুলো বা ঠান্ডা হাওয়ায় হাঁচি']
    },
    q5_rash_appearance: {
      question: 'ত্বকের র‍্যাশ কেমন দেখতে এবং চুলকানি বা জ্বালা আছে কি?',
      subtext: 'ঘাম/ফাঙ্গাল র‍্যাশ (Candid পাউডার উপযোগী) নাকি সংক্রমণ তা যাচাই করতে।',
      badge: 'ত্বক পরীক্ষা',
      options: ['ফোলা লাল দানা ও তীব্র চুলকানি', 'ঘাম বা ত্বকের ভাঁজে ফাঙ্গাল লাল চুলকানি (Candid পাউডার উপযোগী)', 'শুকনো খসখসে বা গোল দাদ', 'জল বা পুঁজ ভরা ফোসকা', 'বেগুনি দাগ যা চাপলেও মিলিয়ে যায় না']
    },
    q5_cut_characteristics: {
      question: 'ক্ষতটি কীভাবে হয়েছে এবং রক্তপাত কি বন্ধ হয়েছে?',
      subtext: 'ক্ষতের গভীরতা ও টিটেনাস ঝুঁকি যাচাই করতে।',
      badge: 'ক্ষত মূল্যায়ন',
      options: ['হালকা কাটা, চাপে রক্ত বন্ধ হয়েছে', 'পরিষ্কার জিনিসে হালকা আঁচড়', 'মরচে ধরা লোহা, মাটি বা প্রাণীর নখের আঁচড়', 'গভীর ফাঁকা ক্ষত', '10 মিনিট চাপ দিলেও রক্ত থামছে না']
    },
    q5_stomach_pattern: {
      question: 'পেটের প্রধান সমস্যা কী হচ্ছে?',
      subtext: 'অ্যাসিডিটি ও পেটের সংক্রমণ আলাদা করতে সাহায্য করে।',
      badge: 'পেটের লক্ষণ',
      options: ['বুক বা পেটের উপরের দিকে জ্বালা (অ্যাসিডিটি)', 'আজ 2-3 বার পাতলা পায়খানা', 'ঘনঘন বমি বা তীব্র বমি ভাব', 'জ্বর ছাড়া গ্যাস ও পেট ফাঁপা']
    },
    q5_symptom_nuance: {
      question: 'দিনের কোন সময়ে উপসর্গ বেশি অনুভূত হয়?',
      subtext: 'দৈনিক পরিবর্তন বোঝার জন্য।',
      badge: 'দৈনিক ধরন',
      options: ['সকালে ঘুম থেকে উঠলে বেশি', 'রাতে শোয়ার সময় বাড়ে', 'সারাদিন-রাত একই রকম থাকে', 'হঠাৎ দমকে দমকে আসে']
    },
    q6_red_flags: {
      question: 'নিচের কোনো গুরুতর সতর্কতা লক্ষণ কি আপনার আছে?',
      subtext: 'জরুরি যাচাই: এর কোনোটি থাকলে অবিলম্বে ডাক্তারের কাছে যেতে হবে।',
      badge: 'জরুরি নিরাপত্তা যাচাই',
      options: ['এর কোনোটিই নেই (নিরাপদ)', 'শ্বাসকষ্ট বা বুকে চাপ', 'ঘাড় শক্ত হয়ে যাওয়া', 'বিভ্রান্তি, অতিরিক্ত তন্দ্রা বা মাথা ঘুরে পড়ে যাওয়া', '12 ঘণ্টার বেশি জলও ধরে রাখতে না পারা', 'বমি, কাশি বা মলের সাথে রক্ত']
    },
    q7_drug_allergies: {
      question: 'কোনো সাধারণ ওষুধে আপনার অ্যালার্জি আছে কি?',
      subtext: 'নিরাপদ ওষুধ বা পাউডার পরামর্শের আগে এটি জরুরি।',
      badge: 'ওষুধ অ্যালার্জি',
      options: ['কোনো ওষুধে অ্যালার্জি নেই', 'পেনিসিলিন বা অ্যান্টিবায়োটিকে অ্যালার্জি', 'অ্যাসপিরিন বা আইবুপ্রোফেনে অ্যালার্জি', 'প্যারাসিটামলে অ্যালার্জি', 'সালফা ওষুধে অ্যালার্জি', 'একাধিক ওষুধে সংবেদনশীলতা']
    },
    q8_meds_taken_today: {
      question: 'গত 12-24 ঘণ্টায় আপনি কি কোনো ওষুধ বা ঘরোয়া চিকিৎসা নিয়েছেন?',
      subtext: 'ডাবল ডোজ এড়াতে এটি জানা প্রয়োজন।',
      badge: 'আগের ওষুধের তথ্য',
      options: ['এখনো কিছু নিইনি', 'আজ প্যারাসিটামল খেয়েছি', 'আইবুপ্রোফেন / কম্বিফ্লাম খেয়েছি', 'অ্যালার্জির ওষুধ (Cetirizine) খেয়েছি', 'অ্যান্টাসিড বা পাউডার/লোশন ব্যবহার করেছি', 'ঘরোয়া টোটকা বা বরফ সেঁক দিয়েছি']
    },
    q9_hydration: {
      question: 'আজ আপনার জল ও তরল পানের পরিমাণ কেমন?',
      subtext: 'জ্বর ও পেটের সমস্যায় শরীরে জলের ঘাটতি হতে পারে।',
      badge: 'হাইড্রেশন যাচাই',
      options: ['স্বাভাবিকভাবে পর্যাপ্ত জল খাচ্ছি', 'ক্ষুধা কম, তবে অল্প অল্প জল খাচ্ছি', 'প্রস্রাব গাঢ় হলুদ ও মুখ শুকিয়ে যাচ্ছে', 'জল খেলেই বমি হয়ে যাচ্ছে']
    },
    q9_tetanus_history: {
      question: 'শেষ কবে টিটেনাস (TT) টিকা নিয়েছেন?',
      subtext: 'ধুলো বা মরচে লাগা ক্ষতে 5-10 বছরের মধ্যে বুস্টার দরকার।',
      badge: 'টিটেনাস সুরক্ষা',
      options: ['গত 5 বছরের মধ্যে', '5 থেকে 10 বছর আগে', '10 বছরের বেশি আগে বা কখনো নয়', 'মনে নেই']
    },
    q9_daily_activities: {
      question: 'এই সমস্যা আপনার খাওয়া, ঘুম ও কাজে কীভাবে প্রভাব ফেলছে?',
      subtext: 'দৈনন্দিন কাজে প্রভাব থেকে গুরুত্ব বোঝা যায়।',
      badge: 'দৈনন্দিন প্রভাব',
      options: ['খাওয়া ও ঘুম ঠিক আছে, সামান্য অসুবিধা', 'রাতে ঘুমের ব্যাঘাত হয়েছে', 'আজ কাজ বা পড়াশোনায় মন বসছে না', 'সম্পূর্ণ শয্যাশায়ী']
    },
    q10_progression: {
      question: 'গত কয়েক ঘণ্টায় আপনার উপসর্গ কীভাবে পরিবর্তিত হচ্ছে?',
      subtext: 'এর ভিত্তিতে মেডিমিত্র নিজেই সিদ্ধান্ত নেবে সাধারণ ওষুধ/পাউডার যথেষ্ট নাকি ডাক্তার দরকার।',
      badge: 'উপসর্গের অগ্রগতি',
      options: ['ধীরে ধীরে ভালো হচ্ছে বা হালকা আছে', 'একই রকম আছে, বাড়ছে না', 'ধীরে ধীরে অস্বস্তি বাড়ছে', 'গত কয়েক ঘণ্টায় দ্রুত খারাপ হচ্ছে']
    }
  },
  ta: {
    q1_demographics: {
      question: 'முதலில் நோயாளியின் வயது மற்றும் நிலையை உறுதி செய்வோம்.',
      subtext: 'வயதைப் பொறுத்து மருந்தின் பாதுகாப்பு மற்றும் அளவு தீர்மானிக்கப்படுகிறது.',
      badge: 'வயது விவரம்',
      options: ['குழந்தை (1 - 11 வயது)', 'இளையோர் (12 - 17 வயது)', 'பெரியவர் (18 - 59 வயது)', 'முதியவர் (60+ வயது)']
    },
    q2_pregnancy_check: {
      question: 'நீங்கள் தற்போது கர்ப்பமாக உள்ளீர்களா அல்லது தாய்ப்பால் கொடுக்கிறீர்களா?',
      subtext: 'முக்கிய சோதனை: சில வலி நிவாரணிகள் கர்ப்ப காலத்தில் பாதுகாப்பானவை அல்ல.',
      badge: 'பெண்கள் நல பாதுகாப்பு',
      options: ['இல்லை', 'கர்ப்பமாக உள்ளேன் (1வது அல்லது 2வது மூன்று மாதங்கள்)', 'கர்ப்பமாக உள்ளேன் (3வது மூன்று மாதங்கள்)', 'தாய்ப்பால் கொடுக்கிறேன்', 'கூற விரும்பவில்லை']
    },
    q2_pediatric_weight: {
      question: 'குழந்தையின் தோராயமான எடை என்ன?',
      subtext: 'குழந்தைகளுக்கான மருந்து அளவு எடையைப் பொறுத்தது.',
      badge: 'குழந்தை எடை பாதுகாப்பு',
      options: ['10 கிலோவுக்குக் கீழ்', '10 - 18 கிலோ', '19 - 30 கிலோ', '30 கிலோவுக்கு மேல்', 'சரியான எடை தெரியவில்லை']
    },
    q2_senior_conditions: {
      question: 'உங்களுக்கு உயர் இரத்த அழுத்தம், இதய நோய் அல்லது சிறுநீரக பிரச்சனை உள்ளதா?',
      subtext: 'சில மருந்துகள் முதியவர்களில் இரத்த அழுத்தத்தை அதிகரிக்கலாம்.',
      badge: 'முதியோர் பாதுகாப்பு',
      options: ['பெரிய நோய்கள் எதுவும் இல்லை', 'உயர் இரத்த அழுத்தம்', 'சர்க்கரை நோய்', 'இதய நோய்', 'சிறுநீரகப் பிரச்சனை']
    },
    q2_general_profile: {
      question: 'உங்களுக்கு ஏதேனும் பழைய நோய்கள் அல்லது தினசரி மருந்துகள் உள்ளனவா?',
      subtext: 'மருந்து அல்லது பவுடர் பாதுகாப்பாக இருக்க உதவுகிறது.',
      badge: 'உடல்நலப் பின்னணி',
      options: ['எதுவும் இல்லை / நலமாக உள்ளேன்', 'ஆஸ்துமா / சுவாச உணர்திறன்', 'அசிடிட்டி / வயிற்றுப் புண்', 'உயர் இரத்த அழுத்தம்', 'மற்ற தினசரி மருந்துகள்']
    },
    q3_onset_duration: {
      question: 'இந்த அறிகுறி எவ்வளவு காலமாக உள்ளது?',
      subtext: 'கால அளவு நிலையின் தன்மையை அறிய உதவுகிறது.',
      badge: 'கால அளவு',
      options: ['இன்றுதான் தொடங்கியது (24 மணி நேரத்திற்குள்)', '1 முதல் 3 நாட்கள்', '4 முதல் 7 நாட்கள்', '1 முதல் 2 வாரங்களுக்கு மேல்', 'மாதங்களாக அடிக்கடி வருகிறது']
    },
    q4_severity_intensity: {
      question: '1 முதல் 10 அளவுகோலில் உங்கள் அசௌகரியம் எவ்வளவு தீவிரமாக உள்ளது?',
      subtext: 'தீவிரத்தைப் பொறுத்து அவசர நிலை மதிப்பிடப்படும்.',
      badge: 'தீவிர அளவு',
      options: ['1 - 3: லேசான அசௌகரியம்', '4 - 6: நடுத்தரம்', '7 - 8: கடுமையானது (ஓய்வு தேவை)', '9 - 10: தாங்க முடியாத வலி']
    },
    q5_fever_temp: {
      question: 'தெர்மாமீட்டரில் உடல் வெப்பநிலை எவ்வளவு இருந்தது?',
      subtext: '102°F-க்கு மேல் காய்ச்சல் இருந்தால் கவனம் தேவை.',
      badge: 'வெப்பநிலை சோதனை',
      options: ['குறைந்த: 99.0°F - 100.4°F', 'நடுத்தரம்: 100.5°F - 102.0°F', 'அதிகம்: 102.1°F - 104.0°F', 'மிக அதிகம்: 104°F-க்கு மேல்', 'தெர்மாமீட்டர் இல்லை, உடல் சூடாக உள்ளது']
    },
    q5_headache_type: {
      question: 'தலைவலி எங்கே, எப்படி உணரப்படுகிறது?',
      subtext: 'டென்ஷன், சைனஸ் மற்றும் ஒற்றைத் தலைவலியை வேறுபடுத்த.',
      badge: 'வலி தன்மை',
      options: ['நெற்றி அல்லது கழுத்தில் இறுக்கம்', 'ஒரு பக்கத் துடிப்பு மற்றும் ஒளி/ஒலி உணர்திறன்', 'கண்கள் மற்றும் மூக்குக்குப் பின் அழுத்தம் (சைனஸ்)', 'திடீர் மிகக் கடுமையான வலி', 'தலை முழுவதும் மந்தமான வலி']
    },
    q5_cold_discharge: {
      question: 'மூக்கு ஒழுகுதல் மற்றும் தும்மல் எவ்வாறு உள்ளது?',
      subtext: 'வைரஸ் சளி மற்றும் ஒவ்வாமையை வேறுபடுத்த.',
      badge: 'சளி விவரம்',
      options: ['தெளிவான நீர் போன்ற சளி மற்றும் கண் அரிப்பு (ஒவ்வாமை)', 'கெட்டியான மஞ்சள் அல்லது பச்சை சளி', 'நீரின்றி மூக்கு அடைப்பு', 'தூசி அல்லது குளிர் காற்றால் தும்மல்']
    },
    q5_rash_appearance: {
      question: 'தோல் தடிப்பு எப்படி இருக்கிறது? அரிப்பு அல்லது எரிச்சல் உள்ளதா?',
      subtext: 'வியர்வை/பூஞ்சை அரிப்பு (Candid பவுடர் ஏற்றது) அல்லது தொற்றைக் கண்டறிய.',
      badge: 'தோல் பரிசோதனை',
      options: ['உயர்ந்த சிவப்புத் தடிப்பு மற்றும் தீவிர அரிப்பு', 'வியர்வை அல்லது தோல் மடிப்புகளில் பூஞ்சை அரிப்பு (Candid பவுடர் ஏற்றது)', 'வறண்ட செதில் அல்லது வட்ட வடிவப் படை', 'நீர் அல்லது சீழ் நிரம்பிய கொப்புளங்கள்', 'அழுத்தினாலும் மறையாத ஊதா புள்ளிகள்']
    },
    q5_cut_characteristics: {
      question: 'காயம் எதனால் ஏற்பட்டது? இரத்தப்போக்கு நின்றுவிட்டதா?',
      subtext: 'காயத்தின் ஆழம் மற்றும் டெட்டனஸ் அபாயத்தை அறிய.',
      badge: 'காய மதிப்பீடு',
      options: ['சிறிய வெட்டு, அழுத்தத்தால் இரத்தம் நின்றது', 'சுத்தமான பொருளால் லேசான சிராய்ப்பு', 'துருப்பிடித்த இரும்பு, மண் அல்லது விலங்கு கீறல்', 'ஆழமான திறந்த காயம்', '10 நிமிடம் அழுத்தியும் இரத்தம் நிற்கவில்லை']
    },
    q5_stomach_pattern: {
      question: 'வயிற்றில் முக்கியப் பிரச்சனை என்ன?',
      subtext: 'அசிடிட்டி மற்றும் வயிற்றுத் தொற்றை வேறுபடுத்த.',
      badge: 'வயிற்று அறிகுறி',
      options: ['நெஞ்சு அல்லது மேல் வயிற்றில் எரிச்சல் (அசிடிட்டி)', 'இன்று 2-3 முறை நீர் போன்ற வயிற்றுப்போக்கு', 'அடிக்கடி வாந்தி அல்லது குமட்டல்', 'காய்ச்சலின்றி வாயு மற்றும் வயிற்று உப்புசம்']
    },
    q5_symptom_nuance: {
      question: 'நாள் முழுவதும் இந்த அறிகுறி எப்போது அதிகமாகத் தெரிகிறது?',
      subtext: 'தினசரி மாற்றங்களை அறிய.',
      badge: 'தினசரி முறை',
      options: ['காலையில் எழுந்தவுடன் அதிகம்', 'இரவில் தூங்கும் போது அதிகம்', 'நாள் முழுவதும் ஒரே மாதிரி உள்ளது', 'திடீர் அலைகளாக வருகிறது']
    },
    q6_red_flags: {
      question: 'இந்த அவசர எச்சரிக்கை அறிகுறிகளில் ஏதேனும் உள்ளதா?',
      subtext: 'அவசர பாதுகாப்பு: இவற்றில் ஏதேனும் இருந்தால் உடனே மருத்துவரை அணுகவும்.',
      badge: 'அவசர எச்சரிக்கை',
      options: ['இவற்றில் எதுவும் இல்லை (பாதுகாப்பானது)', 'மூச்சுத் திணறல் அல்லது நெஞ்சு இறுக்கம்', 'கழுத்து விறைப்பு', 'மயக்கம் அல்லது அதீத தூக்க கலக்கம்', '12 மணி நேரத்திற்கு மேல் தண்ணீர் கூட குடிக்க முடியாமை', 'வாந்தி, இருமல் அல்லது மலத்தில் இரத்தம்']
    },
    q7_drug_allergies: {
      question: 'சாதாரண மருந்துகளுக்கு ஏதேனும் ஒவ்வாமை உள்ளதா?',
      subtext: 'பாதுகாப்பான மருந்து அல்லது பவுடர் பரிந்துரைக்க இது அவசியம்.',
      badge: 'மருந்து ஒவ்வாமை',
      options: ['எந்த மருந்திற்கும் ஒவ்வாமை இல்லை', 'பென்சிலின் / ஆன்டிபயாடிக் ஒவ்வாமை', 'ஆஸ்பிரின் / இபுப்ரோஃபென் ஒவ்வாமை', 'பாராசிட்டமால் ஒவ்வாமை', 'சல்ஃபா மருந்து ஒவ்வாமை', 'பல மருந்து ஒவ்வாமை']
    },
    q8_meds_taken_today: {
      question: 'கடந்த 12-24 மணி நேரத்தில் ஏதேனும் மருந்து அல்லது வீட்டு வைத்தியம் எடுத்தீர்களா?',
      subtext: 'அதிகப்படியான மருந்து அளவைத் தவிர்க்க.',
      badge: 'முந்தைய மருந்து',
      options: ['இதுவரை எதுவும் எடுக்கவில்லை', 'இன்று பாராசிட்டமால் எடுத்தேன்', 'இபுப்ரோஃபென் / காம்பிஃபிளாம் எடுத்தேன்', 'ஒவ்வாமை மாத்திரை (Cetirizine) எடுத்தேன்', 'அமில நீக்கி அல்லது பவுடர்/லோஷன் பயன்படுத்தினேன்', 'வீட்டு வைத்தியம் / ஐஸ் ஒத்தடம்']
    },
    q9_hydration: {
      question: 'இன்று உங்கள் தண்ணீர் மற்றும் நீர்ச்சத்து அளவு எப்படி உள்ளது?',
      subtext: 'காய்ச்சல் மற்றும் வயிற்றுப்போக்கில் நீர்ச்சத்து விரைவாகக் குறையும்.',
      badge: 'நீர்ச்சத்து சோதனை',
      options: ['சாதாரணமாக நன்றாகத் தண்ணீர் குடிக்கிறேன்', 'பசி குறைவு, ஆனால் சிறிது சிறிதாகக் குடிக்கிறேன்', 'சிறுநீர் அடர் மஞ்சள் மற்றும் வாய் வறட்சி', 'தண்ணீர் குடித்தாலே வாந்தி வருகிறது']
    },
    q9_tetanus_history: {
      question: 'கடைசியாக எப்போது டெட்டனஸ் (TT) தடுப்பூசி போட்டீர்கள்?',
      subtext: 'மண் அல்லது துரு காயங்களுக்கு 5-10 ஆண்டுகளுக்குள் தடுப்பூசி அவசியம்.',
      badge: 'டெட்டனஸ் பாதுகாப்பு',
      options: ['கடந்த 5 ஆண்டுகளுக்குள்', '5 முதல் 10 ஆண்டுகளுக்கு முன்', '10 ஆண்டுகளுக்கு மேல் அல்லது எப்போதுமில்லை', 'நினைவில்லை']
    },
    q9_daily_activities: {
      question: 'உணவு, தூக்கம் மற்றும் அன்றாட வேலைகளை இது எவ்வாறு பாதிக்கிறது?',
      subtext: 'தீவிரத்தை மதிப்பிட உதவுகிறது.',
      badge: 'தினசரி பாதிப்பு',
      options: ['உணவு மற்றும் தூக்கம் நன்றாக உள்ளது', 'தூக்கம் கெட்டு சோர்வு உள்ளது', 'இன்று வேலை செய்ய முடியவில்லை', 'முழுமையாகப் படுக்கையில் உள்ளேன்']
    },
    q10_progression: {
      question: 'கடந்த சில மணி நேரங்களில் உங்கள் அறிகுறிகள் எவ்வாறு மாறுகின்றன?',
      subtext: 'இதைக் கொண்டு சாதாரண மருந்து/பவுடர் போதுமா அல்லது மருத்துவர் தேவையா என்பதை மெடிமித்ரா தானாக முடிவு செய்யும்.',
      badge: 'அறிகுறி மாற்றம்',
      options: ['மெதுவாகக் குறைகிறது அல்லது லேசானது', 'மாறாமல் அப்படியே உள்ளது', 'மெதுவாக அதிகரிக்கிறது', 'கடந்த சில மணி நேரங்களில் வேகமாக மோசமாகிறது']
    }
  },
  te: {
    q1_demographics: {
      question: 'ముందుగా రోగి వయస్సు మరియు దశను నిర్ధారిద్దాం.',
      subtext: 'వయస్సు ఆధారంగా మందుల భద్రత మరియు డోసు నిర్ణయించబడతాయి.',
      badge: 'వయస్సు వివరాలు',
      options: ['పిల్లలు (1 - 11 సంవత్సరాలు)', 'టీనేజర్ (12 - 17 సంవత్సరాలు)', 'పెద్దలు (18 - 59 సంవత్సరాలు)', 'వృద్ధులు (60+ సంవత్సరాలు)']
    },
    q2_pregnancy_check: {
      question: 'మీరు ప్రస్తుతం గర్భవతిగా ఉన్నారా లేదా తల్లిపాలు ఇస్తున్నారా?',
      subtext: 'ముఖ్యమైన తనిఖీ: కొన్ని నొప్పి నివారణ మందులు గర్భధారణ సమయంలో సురక్షితం కాదు.',
      badge: 'మహిళా ఆరోగ్య భద్రత',
      options: ['కాదు', 'గర్భవతిని (1వ లేదా 2వ త్రైమాసికం)', 'గర్భవతిని (3వ త్రైమాసికం)', 'తల్లిపాలు ఇస్తున్నాను', 'చెప్పదలుచుకోలేదు']
    },
    q2_pediatric_weight: {
      question: 'పిల్లల సుమారు బరువు ఎంత?',
      subtext: 'పిల్లల మందుల డోసు బరువు (mg/kg) మీద ఆధారపడి ఉంటుంది.',
      badge: 'పిల్లల బరువు భద్రత',
      options: ['10 కిలోల కంటే తక్కువ', '10 - 18 కిలోలు', '19 - 30 కిలోలు', '30 కిలోల కంటే ఎక్కువ', 'ఖచ్చితమైన బరువు తెలియదు']
    },
    q2_senior_conditions: {
      question: 'మీకు అధిక రక్తపోటు (BP), గుండె లేదా కిడ్నీ సమస్యలు ఉన్నాయా?',
      subtext: 'కొన్ని మందులు పెద్దవారిలో BP పెంచవచ్చు.',
      badge: 'సీనియర్ భద్రతా తనిఖీ',
      options: ['పెద్ద సమస్యలు ఏవీ లేవు', 'అధిక రక్తపోటు (High BP)', 'మధుమేహం (Diabetes)', 'గుండె జబ్బు', 'కిడ్నీ సమస్య']
    },
    q2_general_profile: {
      question: 'మీకు ఏవైనా దీర్ఘకాలిక సమస్యలు ఉన్నాయా లేదా రోజూ మందులు వాడుతున్నారా?',
      subtext: 'సురక్షితమైన మందులు లేదా పౌడర్ సూచించడానికి ఇది సహాయపడుతుంది.',
      badge: 'ఆరోగ్య వివరాలు',
      options: ['ఏమీ లేవు / ఆరోగ్యంగా ఉన్నాను', 'ఆస్తమా / శ్వాస సమస్య', 'అసిడిటీ / అల్సర్', 'అధిక రక్తపోటు', 'ఇతర రోజూవారీ మందులు']
    },
    q3_onset_duration: {
      question: 'ఈ సమస్య ఎప్పటి నుండి ఉంది?',
      subtext: 'వ్యవధి సమస్య తీవ్రతను అర్థం చేసుకోవడానికి సహాయపడుతుంది.',
      badge: 'సమయం & వ్యవధి',
      options: ['ఈరోజే మొదలైంది (24 గంటల లోపు)', '1 నుండి 3 రోజులు', '4 నుండి 7 రోజులు', '1 నుండి 2 వారాల కంటే ఎక్కువ', 'నెలల తరబడి అప్పుడప్పుడు వస్తోంది']
    },
    q4_severity_intensity: {
      question: '1 నుండి 10 స్కేల్‌లో ప్రస్తుతం మీ అసౌకర్యం ఎంత తీవ్రంగా ఉంది?',
      subtext: 'బాధ స్థాయిని బట్టి తదుపరి నిర్ణయం ఉంటుంది.',
      badge: 'తీవ్రత స్కేల్',
      options: ['1 - 3: తేలికపాటి అసౌకర్యం', '4 - 6: మధ్యస్థం', '7 - 8: తీవ్రమైనది (విశ్రాంతి అవసరం)', '9 - 10: భరించలేని నొప్పి']
    },
    q5_fever_temp: {
      question: 'థర్మామీటర్‌తో ఉష్ణోగ్రత ఎంత వచ్చింది?',
      subtext: '102°F దాటితే వైద్య పర్యవేక్షణ అవసరం కావచ్చు.',
      badge: 'ఉష్ణోగ్రత తనిఖీ',
      options: ['తక్కువ: 99.0°F - 100.4°F', 'మధ్యస్థం: 100.5°F - 102.0°F', 'ఎక్కువ: 102.1°F - 104.0°F', 'చాలా ఎక్కువ: 104°F పైగా', 'థర్మామీటర్ లేదు, శరీరం వేడిగా ఉంది']
    },
    q5_headache_type: {
      question: 'తలనొప్పి ఎక్కడ మరియు ఎలా అనిపిస్తోంది?',
      subtext: 'టెన్షన్, సైనస్ మరియు మైగ్రేన్ తేడా తెలుసుకోవడానికి.',
      badge: 'నొప్పి రకం',
      options: ['నుదురు లేదా మెడ వెనుక బిగుతు', 'ఒకవైపు కొట్టుకోవడం, వెలుతురు/శబ్దానికి ఇబ్బంది', 'కళ్ళు, ముక్కు వెనుక ఒత్తిడి (సైనస్)', 'అకస్మాత్తుగా భయంకరమైన నొప్పి', 'తలంతా మందంగా నొప్పి']
    },
    q5_cold_discharge: {
      question: 'ముక్కు కారడం మరియు తుమ్ములు ఎలా ఉన్నాయి?',
      subtext: 'వైరల్ జలుబు మరియు అలర్జీ తేడా గుర్తించడానికి.',
      badge: 'జలుబు వివరాలు',
      options: ['నీరులా కారడం మరియు కళ్ళు దురద (అలర్జీ)', 'చిక్కటి పసుపు లేదా ఆకుపచ్చ శ్లేష్మం', 'నీరు లేకుండా ముక్కు దిబ్బడ', 'దుమ్ము లేదా చల్లని గాలికి తుమ్ములు']
    },
    q5_rash_appearance: {
      question: 'చర్మం దద్దుర్లు ఎలా ఉన్నాయి? దురద లేదా మంట ఉందా?',
      subtext: 'చెమట/ఫంగల్ దురద (Candid పౌడర్ తగినది) లేదా ఇన్ఫెక్షన్ గుర్తించడానికి.',
      badge: 'చర్మ పరీక్ష',
      options: ['ఎర్రటి బొబ్బలు మరియు తీవ్రమైన దురద', 'చెమట లేదా చర్మం మడతల్లో ఫంగల్ దురద (Candid పౌడర్ తగినది)', 'పొడి పొలుసులు లేదా గుండ్రని తామర మచ్చలు', 'నీరు లేదా చీముతో కూడిన బొబ్బలు', 'నొక్కినా తగ్గని ఊదా రంగు మచ్చలు']
    },
    q5_cut_characteristics: {
      question: 'గాయం ఎలా అయింది మరియు రక్తస్రావం ఆగిందా?',
      subtext: 'గాయం లోతు మరియు టెటనస్ ప్రమాదాన్ని తనిఖీ చేయడానికి.',
      badge: 'గాయం తనిఖీ',
      options: ['చిన్న కోత, ఒత్తిడితో రక్తం ఆగింది', 'శుభ్రమైన వస్తువుతో చిన్న గీత', 'తుప్పు పట్టిన ఇనుము, మట్టి లేదా జంతువు గీత', 'లోతైన తెరుచుకున్న గాయం', '10 నిమిషాలు నొక్కినా రక్తం ఆగడం లేదు']
    },
    q5_stomach_pattern: {
      question: 'కడుపులో ప్రధాన సమస్య ఏమిటి?',
      subtext: 'అసిడిటీ మరియు ఇన్ఫెక్షన్ తేడా తెలుసుకోవడానికి.',
      badge: 'కడుపు లక్షణాలు',
      options: ['ఛాతీ లేదా పై కడుపులో మంట (అసిడిటీ)', 'ఈరోజు 2-3 సార్లు నీళ్ల విరేచనాలు', 'తరచుగా వాంతులు లేదా తీవ్రమైన వికారం', 'జ్వరం లేకుండా గ్యాస్ మరియు ఉబ్బరం']
    },
    q5_symptom_nuance: {
      question: 'రోజులో ఈ లక్షణం ఎప్పుడు ఎక్కువగా అనిపిస్తుంది?',
      subtext: 'రోజువారీ మార్పును అర్థం చేసుకోవడానికి.',
      badge: 'రోజువారీ సరళి',
      options: ['ఉదయం లేవగానే ఎక్కువగా ఉంటుంది', 'రాత్రి పడుకున్నప్పుడు పెరుగుతుంది', 'రోజంతా ఒకేలా ఉంటుంది', 'అకస్మాత్తుగా అలలుగా వస్తుంది']
    },
    q6_red_flags: {
      question: 'కింది తీవ్రమైన ప్రమాద సంకేతాలు ఏవైనా ఉన్నాయా?',
      subtext: 'అత్యవసర భద్రత: వీటిలో ఏది ఉన్నా వెంటనే డాక్టర్‌ను కలవండి.',
      badge: 'అత్యవసర తనిఖీ',
      options: ['వీటిలో ఏవీ లేవు (సురక్షితం)', 'శ్వాస తీసుకోవడంలో ఇబ్బంది లేదా ఛాతీ బిగుతు', 'మెడ బిగుతుగా ఉండటం', 'గందరగోళం, తీవ్ర మగత లేదా కళ్ళు తిరగడం', '12 గంటలకు పైగా నీరు కూడా తాగలేకపోవడం', 'వాంతి, దగ్గు లేదా మలంలో రక్తం']
    },
    q7_drug_allergies: {
      question: 'సాధారణ మందులకు ఏమైనా అలర్జీలు ఉన్నాయా?',
      subtext: 'సురక్షిత మందులు లేదా పౌడర్ సూచించే ముందు ఇది అవసరం.',
      badge: 'మందుల అలర్జీ',
      options: ['ఏ మందుకూ అలర్జీ లేదు', 'పెన్సిలిన్ / యాంటీబయాటిక్స్ అలర్జీ', 'ఆస్పిరిన్ / ఇబుప్రోఫెన్ అలర్జీ', 'పారాసెటమాల్ అలర్జీ', 'సల్ఫా మందుల అలర్జీ', 'పలు మందులకు సున్నితత్వం']
    },
    q8_meds_taken_today: {
      question: 'గత 12-24 గంటల్లో ఏదైనా మందు లేదా ఇంటి చిట్కా తీసుకున్నారా?',
      subtext: 'అధిక మోతాదు నివారించడానికి ఇది అవసరం.',
      badge: 'మునుపటి మందులు',
      options: ['ఇంకా ఏమీ తీసుకోలేదు', 'ఈరోజు పారాసెటమాల్ తీసుకున్నాను', 'ఇబుప్రోఫెన్ / కాంబిఫ్లామ్ తీసుకున్నాను', 'అలర్జీ టాబ్లెట్ (Cetirizine) తీసుకున్నాను', 'యాంటాసిడ్ లేదా పౌడర్/లోషన్ వాడాను', 'ఇంటి చిట్కా / ఐస్ ప్యాక్ వాడాను']
    },
    q9_hydration: {
      question: 'ఈరోజు మీ నీరు మరియు ద్రవాల స్థాయి ఎలా ఉంది?',
      subtext: 'జ్వరం మరియు విరేచనాలలో నీటి కొరత త్వరగా వస్తుంది.',
      badge: 'హైడ్రేషన్ తనిఖీ',
      options: ['సాధారణంగా తగినంత నీరు తాగుతున్నాను', 'ఆకలి తక్కువ, కానీ కొద్దికొద్దిగా తాగుతున్నాను', 'మూత్రం ముదురు పసుపు, నోరు ఎండిపోతోంది', 'నీరు తాగినా వాంతి అవుతోంది']
    },
    q9_tetanus_history: {
      question: 'చివరిసారి టెటనస్ (TT) టీకా ఎప్పుడు వేయించుకున్నారు?',
      subtext: 'మట్టి లేదా తుప్పు గాయాలకు 5-10 ఏళ్ళలో బూస్టర్ అవసరం.',
      badge: 'టెటనస్ రక్షణ',
      options: ['గత 5 సంవత్సరాలలోపు', '5 నుండి 10 సంవత్సరాల క్రితం', '10 ఏళ్ళకు పైగా లేదా ఎప్పుడూ లేదు', 'గుర్తు లేదు']
    },
    q9_daily_activities: {
      question: 'ఈ సమస్య మీ ఆహారం, నిద్ర మరియు పనులను ఎలా ప్రభావితం చేస్తోంది?',
      subtext: 'రోజువారీ ప్రభావాన్ని బట్టి తీవ్రత అంచనా వేయబడుతుంది.',
      badge: 'రోజువారీ ప్రభావం',
      options: ['ఆహారం, నిద్ర బాగున్నాయి, చిన్న ఇబ్బంది మాత్రమే', 'రాత్రి నిద్ర చెడింది, నీరసంగా ఉంది', 'ఈరోజు పనిపై దృష్టి పెట్టలేకపోతున్నాను', 'పూర్తిగా మంచం పైనే ఉన్నాను']
    },
    q10_progression: {
      question: 'గత కొన్ని గంటల్లో మీ లక్షణాలు ఎలా మారుతున్నాయి?',
      subtext: 'దీని ఆధారంగా సాధారణ మందు/పౌడర్ సరిపోతుందా లేదా డాక్టర్ అవసరమా అని మెడిమిత్ర స్వయంగా నిర్ణయిస్తుంది.',
      badge: 'లక్షణాల పురోగతి',
      options: ['నెమ్మదిగా తగ్గుతున్నాయి లేదా తేలికగా ఉన్నాయి', 'అదే స్థితిలో ఉన్నాయి, పెరగడం లేదు', 'నెమ్మదిగా అసౌకర్యం పెరుగుతోంది', 'గత కొన్ని గంటల్లో వేగంగా తీవ్రమవుతున్నాయి']
    }
  },
  gu: {
    q1_demographics: {
      question: 'સૌ પ્રથમ દર્દીની ઉંમર અને તબક્કાની ખાતરી કરીએ.',
      subtext: 'ઉંમર પ્રમાણે દવાની સુરક્ષા અને યોગ્ય ડોઝ નક્કી થાય છે.',
      badge: 'ઉંમરની વિગત',
      options: ['બાળક (1 - 11 વર્ષ)', 'કિશોર (12 - 17 વર્ષ)', 'પુખ્ત (18 - 59 વર્ષ)', 'વડીલ / સિનિયર (60+ વર્ષ)']
    },
    q2_pregnancy_check: {
      question: 'શું તમે હાલમાં ગર્ભવતી છો, ગર્ભધારણનું વિચારી રહ્યા છો, કે સ્તનપાન કરાવો છો?',
      subtext: 'મહત્વની તપાસ: ઘણી સામાન્ય દુખાવાની દવાઓ ગર્ભાવસ્થામાં સુરક્ષિત નથી હોતી.',
      badge: 'મહિલા આરોગ્ય સુરક્ષા',
      options: ['ના, ગર્ભવતી કે સ્તનપાન કરાવતી નથી', 'ગર્ભવતી છું (પહેલો કે બીજો ત્રિમાસિક)', 'ગર્ભવતી છું (ત્રીજો ત્રિમાસિક)', 'સ્તનપાન કરાવું છું', 'જણાવવા માંગતી નથી']
    },
    q2_pediatric_weight: {
      question: 'બાળકનું અંદાજિત વજન કેટલું છે?',
      subtext: 'બાળકોની દવાનો ડોઝ વજન (mg/kg) પર આધારિત હોય છે.',
      badge: 'બાળ વજન સુરક્ષા',
      options: ['10 કિલોથી ઓછું', '10 - 18 કિલો', '19 - 30 કિલો', '30 કિલોથી વધુ', 'ચોક્કસ વજન ખબર નથી']
    },
    q2_senior_conditions: {
      question: 'શું તમને હાઈ બીપી, હૃદય રોગ કે કિડનીની કોઈ જૂની બીમારી છે?',
      subtext: 'કેટલીક દવાઓ વડીલોમાં બીપી વધારી શકે છે.',
      badge: 'સિનિયર સુરક્ષા તપાસ',
      options: ['કોઈ મોટી જૂની બીમારી નથી', 'હાઈ બ્લડ પ્રેશર (BP)', 'ડાયાબિટીસ', 'હૃદય રોગ', 'કિડનીની સમસ્યા']
    },
    q2_general_profile: {
      question: 'શું તમને કોઈ જૂની બીમારી છે અથવા નિયમિત દવા ચાલુ છે?',
      subtext: 'સુરક્ષિત દવા કે પાવડર સૂચવવા માટે મદદરૂપ થાય છે.',
      badge: 'આરોગ્ય માહિતી',
      options: ['કંઈ નહીં / સ્વસ્થ', 'અસ્થમા / શ્વાસની એલર્જી', 'એસિડિટી / અલ્સર', 'હાઈ બ્લડ પ્રેશર', 'અન્ય નિયમિત દવા ચાલુ છે']
    },
    q3_onset_duration: {
      question: 'તમને આ તકલીફ ક્યારથી થઈ રહી છે?',
      subtext: 'સમયગાળા પરથી તકલીફની સ્થિતિ સમજાય છે.',
      badge: 'સમયગાળો',
      options: ['આજે જ શરૂ થઈ (24 કલાકથી ઓછું)', '1 થી 3 દિવસ', '4 થી 7 દિવસ', '1 થી 2 અઠવાડિયાથી વધુ', 'મહિનાઓથી વારંવાર થાય છે']
    },
    q4_severity_intensity: {
      question: '1 થી 10 ના સ્કેલ પર હાલ દુખાવો કે તકલીફ કેટલી તીવ્ર છે?',
      subtext: 'તીવ્રતા પ્રમાણે ગંભીરતા નક્કી થાય છે.',
      badge: 'તીવ્રતા માપદંડ',
      options: ['1 - 3: હળવી તકલીફ', '4 - 6: મધ્યમ તકલીફ', '7 - 8: તીવ્ર (આરામ જરૂરી)', '9 - 10: અસહ્ય દુખાવો']
    },
    q5_fever_temp: {
      question: 'થર્મોમીટરથી તાપમાન માપ્યું છે? કેટલું હતું?',
      subtext: '102°F થી વધુ તાવમાં તબીબી દેખરેખ જરૂરી છે.',
      badge: 'તાપમાન તપાસ',
      options: ['હળવો: 99.0°F - 100.4°F', 'મધ્યમ: 100.5°F - 102.0°F', 'વધુ: 102.1°F - 104.0°F', 'અતિ વધુ: 104°F થી ઉપર', 'થર્મોમીટર નથી, પણ શરીર ગરમ લાગે છે']
    },
    q5_headache_type: {
      question: 'માથાનો દુખાવો ક્યાં અને કેવો લાગે છે?',
      subtext: 'ટેન્શન, સાઇનસ અને માઇગ્રેન વચ્ચેનો તફાવત સમજવા માટે.',
      badge: 'દુખાવાનો પ્રકાર',
      options: ['કપાળ કે ગરદન પાછળ ખેંચાણ', 'એક બાજુ ધબકારા જેવો દુખાવો અને અજવાળા/અવાજથી તકલીફ', 'આંખ અને નાક પાછળ દબાણ (સાઇનસ)', 'અચાનક વીજળી જેવો અતિ તીવ્ર દુખાવો', 'આખા માથામાં હળવો દુખાવો']
    },
    q5_cold_discharge: {
      question: 'શરદી અને છીંકનો પ્રકાર કેવો છે?',
      subtext: 'વાયરલ શરદી અને એલર્જી વચ્ચેનો તફાવત ઓળખવા માટે.',
      badge: 'શરદીની વિગત',
      options: ['ચોખ્ખું પાણી જેવું નાક અને આંખમાં ખંજવાળ (એલર્જી)', 'ઘટ્ટ પીળો કે લીલો કફ અને બંધ નાક', 'પાણી વગર સુકું બંધ નાક', 'ધૂળ કે ઠંડી હવાથી સતત છીંકો']
    },
    q5_rash_appearance: {
      question: 'ચામડી પર ફોલ્લીઓ કેવી દેખાય છે અને ખંજવાળ કે બળતરા થાય છે?',
      subtext: 'પરસેવા/ફંગલ ખંજવાળ (Candid પાવડર યોગ્ય) કે ચેપ ઓળખવા માટે.',
      badge: 'ચામડી તપાસ',
      options: ['ઉપસેલા લાલ દાણા અને તીવ્ર ખંજવાળ', 'પરસેવા કે ચામડીની ગડીઓમાં ફંગલ ખંજવાળ (Candid પાવડર યોગ્ય)', 'સૂકા ભીંગડા કે ગોળ દાદર જેવા ચકામા', 'પાણી કે પરુ ભરેલા ફોલ્લા', 'દબાવવાથી પણ ઝાંખા ન પડતા જાંબલી ડાઘ']
    },
    q5_cut_characteristics: {
      question: 'ઘા શાનાથી લાગ્યો અને લોહી નીકળતું બંધ થયું છે?',
      subtext: 'ઘાની ઊંડાઈ અને ટિટનસનું જોખમ તપાસવા માટે.',
      badge: 'ઘાની તપાસ',
      options: ['સામાન્ય કાપો, દબાવવાથી લોહી બંધ થયું', 'ચોખ્ખી વસ્તુથી હળવો ઉઝરડો', 'કાટ લાગેલા લોખંડ, માટી કે પ્રાણીના નખનો ઘા', 'ઊંડો ખુલ્લો ઘા', '10 મિનિટ દબાવ્યા પછી પણ લોહી બંધ નથી થતું']
    },
    q5_stomach_pattern: {
      question: 'પેટમાં મુખ્ય તકલીફ શું છે?',
      subtext: 'એસિડિટી અને પેટના ચેપ વચ્ચેનો તફાવત સમજવા માટે.',
      badge: 'પેટના લક્ષણો',
      options: ['છાતી કે ઉપરના પેટમાં બળતરા (એસિડિટી)', 'આજે 2-3 વાર પાણી જેવા ઝાડા', 'વારંવાર ઉલટી કે તીવ્ર ઉબકા', 'તાવ વગર ગેસ અને પેટ ફૂલવું']
    },
    q5_symptom_nuance: {
      question: 'દિવસ દરમિયાન આ તકલીફ ક્યારે વધુ લાગે છે?',
      subtext: 'દૈનિક પેટર્ન સમજવા માટે.',
      badge: 'દૈનિક પેટર્ન',
      options: ['સવારે ઉઠતી વખતે વધુ', 'રાત્રે સૂતી વખતે વધે છે', 'આખો દિવસ અને રાત સરખું રહે છે', 'અચાનક લહેર કે આંકડીની જેમ આવે છે']
    },
    q6_red_flags: {
      question: 'શું તમને આમાંથી કોઈ ગંભીર ચેતવણીના લક્ષણો દેખાય છે?',
      subtext: 'તાત્કાલિક સુરક્ષા: આમાંથી કોઈ પણ હોય તો તરત જ ડૉક્ટરને મળો.',
      badge: 'ઇમરજન્સી તપાસ',
      options: ['આમાંથી કોઈ પણ નથી (સુરક્ષિત)', 'શ્વાસ લેવામાં તકલીફ કે છાતીમાં ભારેપણું', 'ગરદન જકડાઈ જવી', 'મૂંઝવણ, અતિશય ઘેન કે ચક્કર/બેભાન થવું', '12 કલાકથી વધુ સમયથી પાણી પણ ન ટકવું', 'ઉલટી, ઉધરસ કે મળમાં લોહી આવવું']
    },
    q7_drug_allergies: {
      question: 'શું તમને કોઈ સામાન્ય દવાની એલર્જી છે?',
      subtext: 'સુરક્ષિત દવા કે પાવડર સૂચવતા પહેલા આ જરૂરી છે.',
      badge: 'દવાની એલર્જી',
      options: ['કોઈ દવાની એલર્જી નથી', 'પેનિસિલિન કે એન્ટિબાયોટિક્સની એલર્જી', 'એસ્પિરિન કે આઇબુપ્રોફેનની એલર્જી', 'પેરાસિટામોલની એલર્જી', 'સલ્ફા દવાઓની એલર્જી', 'અનેક દવાઓ પ્રત્યે સંવેદનશીલતા']
    },
    q8_meds_taken_today: {
      question: 'શું તમે છેલ્લા 12-24 કલાકમાં કોઈ દવા કે ઘરેલુ ઉપાય કર્યો છે?',
      subtext: 'ડબલ ડોઝથી બચવા માટે આ માહિતી જરૂરી છે.',
      badge: 'અગાઉની દવા',
      options: ['હજુ સુધી કંઈ લીધું નથી', 'આજે પેરાસિટામોલ લીધી છે', 'આઇબુપ્રોફેન / કોમ્બિફ્લેમ લીધી છે', 'એલર્જીની ગોળી (Cetirizine) લીધી છે', 'એન્ટાસિડ અથવા પાવડર/લોશન લગાવ્યો છે', 'ઘરેલુ ઉકાળો કે બરફનો શેક કર્યો છે']
    },
    q9_hydration: {
      question: 'આજે તમારું પાણી અને પ્રવાહી પીવાનું પ્રમાણ કેવું છે?',
      subtext: 'તાવ અને ઝાડામાં શરીરમાંથી પાણી જલ્દી ઓછું થાય છે.',
      badge: 'હાઇડ્રેશન તપાસ',
      options: ['સામાન્ય રીતે પૂરતું પાણી પી રહ્યો છું', 'ભૂખ ઓછી છે, પણ થોડું થોડું પાણી પીઉં છું', 'પેશાબ ઘટ્ટ પીળો અને મોં સુકાય છે', 'પાણી પીતા જ ઉલટી થઈ જાય છે']
    },
    q9_tetanus_history: {
      question: 'છેલ્લે ટિટનસ (TT) નું ઇન્જેક્શન ક્યારે લીધું હતું?',
      subtext: 'માટી કે કાટ વાળા ઘા માટે 5-10 વર્ષમાં બૂસ્ટર જરૂરી છે.',
      badge: 'ટિટનસ સુરક્ષા',
      options: ['છેલ્લા 5 વર્ષમાં', '5 થી 10 વર્ષ પહેલા', '10 વર્ષથી વધુ પહેલા કે ક્યારેય નહીં', 'યાદ નથી']
    },
    q9_daily_activities: {
      question: 'આ સમસ્યાથી તમારા ખાવા, ઊંઘવા અને કામ પર કેવી અસર થાય છે?',
      subtext: 'રોજિંદા કામની અસર પરથી ગંભીરતા સમજાય છે.',
      badge: 'દૈનિક અસર',
      options: ['ખાવાનું અને ઊંઘ બરાબર છે, સામાન્ય તકલીફ', 'રાત્રે ઊંઘ બગડી અને થાક લાગે છે', 'આજે કામ કે અભ્યાસમાં ધ્યાન નથી લાગતું', 'સંપૂર્ણ પથારીવશ છું']
    },
    q10_progression: {
      question: 'છેલ્લા કેટલાક કલાકોમાં તમારા લક્ષણો કેવી રીતે બદલાઈ રહ્યા છે?',
      subtext: 'આના આધારે મેડિમિત્રા જાતે નક્કી કરશે કે સામાન્ય દવા/પાવડર પૂરતું છે કે ડૉક્ટરની જરૂર છે.',
      badge: 'લક્ષણોની પ્રગતિ',
      options: ['ધીમે ધીમે સુધારો થઈ રહ્યો છે અથવા હળવું છે', 'પહેલા જેવું જ સ્થિર છે, વધતું નથી', 'ધીમે ધીમે તકલીફ વધી રહી છે', 'છેલ્લા કેટલાક કલાકોમાં ઝડપથી વધી રહ્યું છે']
    }
  }
};
