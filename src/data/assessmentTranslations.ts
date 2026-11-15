import { LanguageCode } from '../context/LanguageContext';
import { HomeRemedy, OtcMedicine, SeverityLevel } from '../types/medical';

export interface ProductTranslation {
  name: string;
  category: string;
  dosageGuide: string;
  childDosageNote?: string;
  safetyCaution: string;
  typicalUse: string;
  preferredQuantity: number;
  unitLabel: 'tablet' | 'sachet' | 'bottle' | 'tube' | 'pack';
}

export interface AssessmentLocaleBundle {
  summaries: Record<SeverityLevel, (redFlagsText: string) => string>;
  observations: {
    highPain: string;
    modPain: string;
    rapidProgress: string;
    impairedDaily: string;
    pediatricParacetamol: string;
    frequentVomiting: string;
  };
  redFlags: {
    defaultFlag: string;
    noFluids: string;
    highFever: string;
    thunderclap: string;
    nonBlanching: string;
    blisters: string;
    deepCut: string;
  };
  products: {
    calpol120: ProductTranslation;
    calpol250: ProductTranslation;
    dolo650: ProductTranslation;
    crocin500: ProductTranslation;
    brufen400: ProductTranslation;
    electralOrs: ProductTranslation;
    cetzine10: ProductTranslation;
    otrivinSaline: ProductTranslation;
    candidPowder: ProductTranslation;
    caladrylLotion: ProductTranslation;
    betadineOintment: ProductTranslation;
    bandAidStrips: ProductTranslation;
    enoPowder: ProductTranslation;
    strepsils: ProductTranslation;
  };
  simpleTips: [string, string, string];
  remedies: {
    fever: HomeRemedy[];
    headache: HomeRemedy[];
    cold_sneezing: HomeRemedy[];
    skin_rash: HomeRemedy[];
    small_cuts: HomeRemedy[];
    stomach_upset: HomeRemedy[];
    cough_throat: HomeRemedy[];
    body_ache: HomeRemedy[];
  };
}

export const ASSESSMENT_TRANSLATIONS: Record<LanguageCode, AssessmentLocaleBundle> = {
  en: {
    summaries: {
      emergency: (rf) => `URGENT MEDICAL ATTENTION REQUIRED: Your responses indicate high-priority red flag symptoms (${rf}). Immediate evaluation at the nearest emergency department is strongly recommended.`,
      severe: () => 'PHYSICIAN EVALUATION RECOMMENDED TODAY: Your symptoms are significant and should be examined in-person by a medical professional within the next few hours.',
      moderate: () => 'MONITORED CARE WITH MEDICAL OVERSIGHT: Your symptoms are manageable with basic supportive care, but consult a doctor within 24–48 hours if no improvement occurs.',
      mild: () => 'MILD SYMPTOM PROFILE (SAFE HOME CARE): Your responses indicate a mild, self-limiting condition. Real OTC products, hydration, and rest are appropriate.'
    },
    observations: {
      highPain: 'High subjective discomfort rating (9–10/10).',
      modPain: 'Moderate discomfort affecting daily routine.',
      rapidProgress: 'Symptoms are progressing rapidly rather than settling.',
      impairedDaily: 'Difficulty performing routine daily activities.',
      pediatricParacetamol: 'Pediatric patient: Calpol weight-based dose (10–15 mg/kg) only. Never give Aspirin.',
      frequentVomiting: 'Frequent vomiting reported — prioritize small sips of Electral ORS.'
    },
    redFlags: {
      defaultFlag: 'Critical warning sign reported',
      noFluids: 'Unable to retain oral fluids due to persistent vomiting.',
      highFever: 'High-grade fever requires direct medical observation.',
      thunderclap: 'Sudden severe headache requires immediate ER evaluation.',
      nonBlanching: 'Non-blanching purple spots require urgent hospital evaluation.',
      blisters: 'Fluid or pus-filled blisters may indicate skin infection needing doctor care.',
      deepCut: 'Deep or actively bleeding wound requires medical closure within 6–8 hours.'
    },
    products: {
      calpol120: {
        name: 'Calpol 120mg/5ml Pediatric Oral Suspension (GSK)',
        category: 'Pediatric Antipyretic Syrup (Paracetamol IP)',
        dosageGuide: 'Give weight-based dose (10–15 mg/kg) every 4–6 hours using the measuring cap. Max 4 doses in 24 hrs.',
        childDosageNote: 'Follow exact weight chart on bottle or consult pediatrician.',
        safetyCaution: 'Do not combine with other cold syrups containing Paracetamol.',
        typicalUse: 'Reduces fever and relieves aches safely in children.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      calpol250: {
        name: 'Calpol 250mg/5ml Pediatric Oral Suspension (GSK)',
        category: 'Pediatric Analgesic Syrup (Paracetamol IP)',
        dosageGuide: 'Give 10–15 mg/kg per dose every 4–6 hours after light food.',
        childDosageNote: 'Verify child weight before measuring.',
        safetyCaution: 'Do not exceed 4 doses in 24 hours.',
        typicalUse: 'Relieves body ache and fever in older children.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      dolo650: {
        name: 'Dolo 650mg Tablet (Micro Labs — Paracetamol IP)',
        category: 'Antipyretic & Pain Relief Tablet',
        dosageGuide: 'Take 1 tablet every 6–8 hours with water after light food. Max 3–4 tablets in 24 hrs.',
        safetyCaution: 'Avoid alcohol and duplicate Paracetamol tablets. Avoid in severe liver disease.',
        typicalUse: 'Reduces fever, chills, and generalized body aches.',
        preferredQuantity: 2,
        unitLabel: 'tablet'
      },
      crocin500: {
        name: 'Crocin Advance 500mg Tablet (GSK — Paracetamol IP)',
        category: 'Fast-Release Analgesic Tablet',
        dosageGuide: 'Take 1 tablet with a glass of water after light food. Repeat after 6 hrs if needed.',
        safetyCaution: 'Safe first-line option; do not exceed 4 tablets in 24 hours.',
        typicalUse: 'Fast relief of headache, forehead tension, and mild fever.',
        preferredQuantity: 2,
        unitLabel: 'tablet'
      },
      brufen400: {
        name: 'Brufen 400mg Tablet (Abbott — Ibuprofen IP)',
        category: 'Anti-inflammatory Analgesic (NSAID)',
        dosageGuide: 'Take 1 tablet strictly after a meal with plenty of water. Repeat every 8 hrs if needed.',
        safetyCaution: 'Avoid if pregnant, having stomach ulcers, kidney issues, or NSAID allergy.',
        typicalUse: 'Relieves migraine-type pain and muscular inflammation.',
        preferredQuantity: 1,
        unitLabel: 'tablet'
      },
      electralOrs: {
        name: 'Electral WHO ORS Powder Sachet 21.8g (FDC Ltd)',
        category: 'WHO Oral Rehydration Powder',
        dosageGuide: 'Dissolve full 1 sachet in 1 liter of clean drinking water and sip throughout the day.',
        safetyCaution: 'Use prepared water within 24 hours. Never boil after mixing.',
        typicalUse: 'Restores lost sodium, potassium, and fluids during fever, weakness, or loose motions.',
        preferredQuantity: 1,
        unitLabel: 'sachet'
      },
      cetzine10: {
        name: 'Cetzine 10mg Tablet (GSK — Cetirizine IP)',
        category: 'Anti-Allergic Antihistamine Tablet',
        dosageGuide: 'Take 1 tablet once daily at bedtime with water.',
        childDosageNote: 'For children 2–12 years, use Cetzine Syrup (2.5ml–5ml once daily).',
        safetyCaution: 'May cause mild drowsiness; avoid driving after taking.',
        typicalUse: 'Stops continuous sneezing, runny nose, watery eyes, and skin allergy itching.',
        preferredQuantity: 1,
        unitLabel: 'tablet'
      },
      otrivinSaline: {
        name: 'Otrivin Breathe Clean Saline Nasal Spray (GSK — 0.9% NaCl)',
        category: 'Drug-Free Isotonic Nasal Spray',
        dosageGuide: 'Apply 2 sprays in each nostril 3–4 times daily to clear congestion.',
        safetyCaution: '100% drug-free and non-addictive; safe for kids, seniors, and pregnancy.',
        typicalUse: 'Clears nasal blockage, washes out allergens, and soothes post-nasal throat drip.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      candidPowder: {
        name: 'Candid Dusting Powder 100g (Glenmark — Clotrimazole 1%)',
        category: 'Antifungal Medicated Skin Powder',
        dosageGuide: 'Wash and dry the rash area completely, then dust Candid Powder lightly twice daily (morning & night).',
        safetyCaution: 'External use only. Keep away from eyes, mouth, and open bleeding wounds.',
        typicalUse: 'Treats fungal itching, sweat rashes, prickly heat, and red skin folds.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      caladrylLotion: {
        name: 'Caladryl Skin Allergy Lotion (Piramal — Calamine + Diphenhydramine)',
        category: 'Soothing Anti-Itch Skin Lotion',
        dosageGuide: 'Shake bottle well and apply a thin layer with clean cotton 2–3 times daily.',
        safetyCaution: 'For external skin use only. Do not apply on open weeping wounds.',
        typicalUse: 'Cools itching, red hives, insect bites, and mild contact allergy.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      betadineOintment: {
        name: 'Betadine 5% Povidone-Iodine Ointment 15g (Win-Medicare)',
        category: 'Topical Antiseptic Ointment',
        dosageGuide: 'Clean the cut with water, pat dry, and apply a thin layer 1–2 times daily before bandaging.',
        safetyCaution: 'Avoid if allergic to iodine. Not for deep gaping wounds.',
        typicalUse: 'Prevents bacterial infection in small cuts, kitchen nicks, and scrapes.',
        preferredQuantity: 1,
        unitLabel: 'tube'
      },
      bandAidStrips: {
        name: 'Band-Aid Washproof Antiseptic Strips (Johnson & Johnson)',
        category: 'Sterile Adhesive Wound Dressing',
        dosageGuide: 'Cover clean wound with a fresh strip; replace daily or if wet.',
        safetyCaution: 'Allow minor healing cuts to breathe once skin closes.',
        typicalUse: 'Shields minor cuts from dirt, water, and friction.',
        preferredQuantity: 1,
        unitLabel: 'pack'
      },
      enoPowder: {
        name: 'ENO Fruit Salt Antacid Powder Sachet 5g (GSK)',
        category: 'Fast-Acting Antacid & Gas Relief Powder',
        dosageGuide: 'Dissolve 1 sachet in 1 glass of cool water and drink immediately after meals.',
        safetyCaution: 'Do not exceed 2 sachets in 24 hours. Avoid frequent use in high BP or kidney disease.',
        typicalUse: 'Relieves acidity, heartburn, gas, and bloating within seconds.',
        preferredQuantity: 1,
        unitLabel: 'sachet'
      },
      strepsils: {
        name: 'Strepsils Honey & Lemon Throat Lozenges (Reckitt)',
        category: 'Antiseptic Throat Soothing Lozenges',
        dosageGuide: 'Dissolve 1 lozenge slowly in the mouth every 3–4 hours.',
        childDosageNote: 'Do not give hard lozenges to children under 5 years (use Dabur Honitus syrup instead).',
        safetyCaution: 'Never give honey products to infants under 1 year.',
        typicalUse: 'Soothes scratchy sore throat and calms dry cough.',
        preferredQuantity: 1,
        unitLabel: 'pack'
      }
    },
    simpleTips: [
      'Drink plenty of clean water, Electral ORS, or warm fluids to stay hydrated.',
      'Ensure adequate rest and avoid heavy screen time or physical strain.',
      'If symptoms do not improve within 48 hours, consult a nearby physician.'
    ],
    remedies: {
      fever: [
        { title: 'Tepid Water Sponging', instructions: 'Wipe forehead and neck gently with lukewarm water cloth.', benefit: 'Safely lowers temperature without causing shivers.' },
        { title: 'Electral ORS / Coconut Water', instructions: 'Sip prepared ORS or fresh coconut water regularly.', benefit: 'Restores lost sodium, potassium, and fluids.' },
        { title: 'Light Cotton Clothes', instructions: 'Wear loose cotton clothing in a well-ventilated room.', benefit: 'Prevents body heat trapping.' }
      ],
      headache: [
        { title: 'Dark Quiet Rest & Screen Break', instructions: 'Dim room lights, step away from screens, and rest 30 mins.', benefit: 'Calms overstimulated cranial nerves.' },
        { title: 'Cool Forehead Compress', instructions: 'Place a cool damp cloth on the forehead for 15 minutes.', benefit: 'Reduces throbbing vessel tension.' },
        { title: 'Steady Hydration', instructions: 'Sip 500ml water slowly.', benefit: 'Prevents dehydration-triggered headaches.' }
      ],
      cold_sneezing: [
        { title: 'Warm Steam Inhalation', instructions: 'Inhale gentle steam for 5–10 minutes twice daily.', benefit: 'Opens blocked nasal passages.' },
        { title: 'Warm Salt Water Gargle', instructions: 'Gargle with 1/2 tsp salt in warm water 3 times daily.', benefit: 'Reduces throat irritation.' },
        { title: 'Warm Ginger-Honey Tea', instructions: 'Sip warm water with ginger and honey (ages 1+ only).', benefit: 'Soothes throat tickle.' }
      ],
      skin_rash: [
        { title: 'Cool Water Compress', instructions: 'Apply a clean cool cloth for 10 minutes before applying Candid powder.', benefit: 'Calms itching without scratching.' },
        { title: 'Keep Skin Dry & Cotton Wear', instructions: 'Dry skin completely after bath and wear loose cotton clothes.', benefit: 'Prevents sweat and fungal buildup.' },
        { title: 'Avoid Scratching', instructions: 'Keep nails trimmed short.', benefit: 'Prevents secondary bacterial skin infection.' }
      ],
      small_cuts: [
        { title: 'Direct Clean Pressure', instructions: 'Press firmly with clean gauze for 5–10 minutes.', benefit: 'Stops minor capillary bleeding.' },
        { title: 'Running Water Rinse', instructions: 'Rinse gently under clean tap water for 2–3 minutes.', benefit: 'Washes away dirt safely.' },
        { title: 'Elevate Injured Area', instructions: 'Rest injured finger or hand slightly raised.', benefit: 'Reduces throbbing and swelling.' }
      ],
      stomach_upset: [
        { title: 'Light Soft Diet (Khichdi / Curd Rice)', instructions: 'Eat bland, non-spicy soft foods in small portions.', benefit: 'Gentle on irritated stomach lining.' },
        { title: 'Stay Upright After Meals', instructions: 'Sit upright for 45 minutes after eating.', benefit: 'Prevents acid reflux.' }
      ],
      cough_throat: [
        { title: 'Warm Salt Water Gargle', instructions: 'Gargle with warm salted water 3 times daily.', benefit: 'Clears throat mucus and swelling.' },
        { title: 'Evening Steam Inhalation', instructions: 'Inhale warm steam for 5–10 mins before sleep.', benefit: 'Loosens dry cough irritants.' }
      ],
      body_ache: [
        { title: 'Warm Compress & Rest', instructions: 'Apply warm pad on sore muscles and get 8 hours sleep.', benefit: 'Relaxes muscle stiffness.' },
        { title: 'Nutritious Warm Soup & Fluids', instructions: 'Have warm dal soup and water.', benefit: 'Restores energy and hydration.' }
      ]
    }
  },

  hi: {
    summaries: {
      emergency: (rf) => `तुरंत आपातकालीन देखभाल आवश्यक: आपके उत्तरों में गंभीर चेतावनी संकेत (${rf}) मिले हैं। कृपया तुरंत नजदीकी अस्पताल के इमरजेंसी विभाग में जाएं।`,
      severe: () => 'आज ही डॉक्टर से जांच आवश्यक: आपके लक्षण गंभीर हैं और इन्हें आज ही किसी योग्य डॉक्टर को दिखाना जरूरी है।',
      moderate: () => 'निगरानी के साथ देखभाल: आपके लक्षण सामान्य देखभाल से संभाले जा सकते हैं, लेकिन 24–48 घंटों में सुधार न हो तो डॉक्टर से मिलें।',
      mild: () => 'हल्के लक्षण (घर पर सुरक्षित देखभाल): आपकी स्थिति सामान्य है। नीचे सुझाई गई असली दवा/पाउडर, पानी और आराम उपयुक्त हैं।'
    },
    observations: {
      highPain: 'अधिक दर्द/तकलीफ स्तर (9–10/10) बताया गया।',
      modPain: 'मध्यम तकलीफ जो रोजमर्रा के काम को प्रभावित कर रही है।',
      rapidProgress: 'लक्षण धीरे-धीरे ठीक होने के बजाय तेजी से बढ़ रहे हैं।',
      impairedDaily: 'दैनिक कार्यों को करने में गंभीर कठिनाई।',
      pediatricParacetamol: 'बच्चा मरीज: केवल वजन के अनुसार Calpol सिरप (10–15 mg/kg) दें। Aspirin कभी न दें।',
      frequentVomiting: 'बार-बार उल्टी बताई गई — थोड़े-थोड़े घूंट में Electral ORS पिएं।'
    },
    redFlags: {
      defaultFlag: 'गंभीर चेतावनी लक्षण',
      noFluids: 'लगातार उल्टी के कारण तरल पदार्थ पेट में नहीं रुक रहे हैं।',
      highFever: 'तेज बुखार के लिए तुरंत डॉक्टर की जांच जरूरी है।',
      thunderclap: 'अचानक हुए तेज सिरदर्द के लिए तुरंत इमरजेंसी जांच जरूरी है।',
      nonBlanching: 'दबाने पर न मिटने वाले बैंगनी दाने के लिए तुरंत अस्पताल जाएं।',
      blisters: 'मवाद या पानी भरे फफोलों के लिए त्वचा विशेषज्ञ/डॉक्टर की जांच जरूरी है।',
      deepCut: 'गहरे घाव या लगातार खून बहने पर 6–8 घंटे के भीतर टांके/इलाज जरूरी है।'
    },
    products: {
      calpol120: {
        name: 'Calpol 120mg/5ml पीडियाट्रिक सिरप (GSK — पैरासिटामोल)',
        category: 'बच्चों के बुखार और दर्द का सिरप',
        dosageGuide: 'बच्चे के वजन के अनुसार (10–15 mg/kg) हर 4–6 घंटे में मापने वाले ढक्कन से दें। 24 घंटे में अधिकतम 4 खुराक।',
        childDosageNote: 'बोतल पर दिए वजन चार्ट के अनुसार या बाल रोग विशेषज्ञ से पूछकर ही दें।',
        safetyCaution: 'पैरासिटामोल वाली किसी अन्य सर्दी की दवा के साथ न मिलाएं।',
        typicalUse: 'बच्चों में बुखार और बदन दर्द से सुरक्षित राहत।',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      calpol250: {
        name: 'Calpol 250mg/5ml पीडियाट्रिक सिरप (GSK)',
        category: 'बच्चों के दर्द व बुखार की दवा',
        dosageGuide: 'हल्के भोजन के बाद हर 4–6 घंटे में वजन अनुसार (10–15 mg/kg) दें।',
        childDosageNote: 'सही मात्रा के लिए बच्चे का वजन जांचें।',
        safetyCaution: '24 घंटे में 4 खुराक से अधिक न दें।',
        typicalUse: 'बड़े बच्चों में बदन दर्द और बुखार कम करने के लिए।',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      dolo650: {
        name: 'Dolo 650mg टैबलेट (Micro Labs — पैरासिटामोल IP)',
        category: 'बुखार और दर्द निवारक टैबलेट',
        dosageGuide: 'हल्के भोजन के बाद हर 6–8 घंटे में 1 गोली पानी के साथ लें। 24 घंटे में अधिकतम 3–4 गोलियां।',
        safetyCaution: 'शराब से बचें और कोई दूसरी पैरासिटामोल गोली साथ न लें। लिवर रोग में डॉक्टर से पूछें।',
        typicalUse: 'बुखार, ठंड लगना और शरीर के दर्द को कम करता है।',
        preferredQuantity: 2,
        unitLabel: 'tablet'
      },
      crocin500: {
        name: 'Crocin Advance 500mg टैबलेट (GSK — पैरासिटामोल IP)',
        category: 'तेज असर करने वाली दर्द निवारक गोली',
        dosageGuide: 'हल्के नाश्ते के बाद 1 गिलास पानी के साथ 1 गोली लें। जरूरत हो तो 6 घंटे बाद दोहराएं।',
        safetyCaution: 'सुरक्षित प्राथमिक दवा; 24 घंटे में 4 गोलियों से अधिक न लें।',
        typicalUse: 'सिरदर्द, माथे के तनाव और हल्के बुखार से तुरंत राहत।',
        preferredQuantity: 2,
        unitLabel: 'tablet'
      },
      brufen400: {
        name: 'Brufen 400mg टैबलेट (Abbott — इबुप्रोफेन IP)',
        category: 'सूजन और दर्द निवारक दवा (NSAID)',
        dosageGuide: 'खाना खाने के बाद ही 1 गोली पूरे पानी के साथ लें। जरूरत पड़ने पर 8 घंटे बाद लें।',
        safetyCaution: 'गर्भावस्था, पेट के अल्सर, किडनी समस्या या NSAID एलर्जी में न लें।',
        typicalUse: 'माइग्रेन जैसे सिरदर्द और मांसपेशियों की सूजन में राहत।',
        preferredQuantity: 1,
        unitLabel: 'tablet'
      },
      electralOrs: {
        name: 'Electral WHO ORS पाउडर पाउच 21.8g (FDC Ltd)',
        category: 'WHO इलेक्ट्रोलाइट और हाइड्रेशन पाउडर',
        dosageGuide: '1 पूरा पाउच 1 लीटर साफ पीने के पानी में घोलें और दिन भर थोड़ा-थोड़ा पिएं।',
        safetyCaution: 'तैयार घोल का उपयोग 24 घंटे के भीतर करें। घोलने के बाद पानी को उबालें नहीं।',
        typicalUse: 'बुखार, कमजोरी या दस्त में शरीर के नमक, पोटैशियम और पानी की कमी पूरी करता है।',
        preferredQuantity: 1,
        unitLabel: 'sachet'
      },
      cetzine10: {
        name: 'Cetzine 10mg टैबलेट (GSK — सेटिरिज़िन IP)',
        category: 'एंटी-एलर्जिक एंटीहिस्टामाइन गोली',
        dosageGuide: 'रात को सोने से पहले 1 गोली पानी के साथ लें।',
        childDosageNote: '2–12 वर्ष के बच्चों के लिए Cetzine सिरप (2.5ml–5ml दिन में एक बार) उपयोग करें।',
        safetyCaution: 'हल्की नींद आ सकती है; लेने के बाद वाहन न चलाएं।',
        typicalUse: 'लगातार छींकें, बहती नाक, आंखों से पानी और त्वचा की एलर्जी खुजली रोकता है।',
        preferredQuantity: 1,
        unitLabel: 'tablet'
      },
      otrivinSaline: {
        name: 'Otrivin Breathe Clean सलाइन नेज़ल स्प्रे (GSK — 0.9% NaCl)',
        category: 'दवा-रहित सेलाइन नाक स्प्रे',
        dosageGuide: 'बंद नाक खोलने के लिए दिन में 3–4 बार दोनों नथुनों में 2-2 स्प्रे करें।',
        safetyCaution: '100% दवा-रहित और सुरक्षित; बच्चों, बुजुर्गों और गर्भवती महिलाओं के लिए भी सुरक्षित।',
        typicalUse: 'नाक की जकड़न साफ करता है, धूल/एलर्जी हटाता है और गले की खराश घटाता है।',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      candidPowder: {
        name: 'Candid डस्टिंग पाउडर 100g (Glenmark — क्लोट्रिमाज़ोल 1%)',
        category: 'एंटीफंगल मेडिकेटेड डस्टिंग पाउडर',
        dosageGuide: 'प्रभावित हिस्से को धोकर अच्छी तरह सुखाएं, फिर सुबह और रात 2 बार हल्के से Candid पाउडर छिड़कें।',
        safetyCaution: 'केवल बाहरी त्वचा पर उपयोग के लिए। आंखों, मुंह और खुले घावों से दूर रखें।',
        typicalUse: 'पसीने के दाने, फंगल खुजली, घमौरियां और त्वचा की लालिमा ठीक करता है।',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      caladrylLotion: {
        name: 'Caladryl स्किन एलर्जी लोशन (Piramal — कैलामाइन)',
        category: 'ठंडक देने वाला एंटी-इच लोशन',
        dosageGuide: 'बोतल को अच्छी तरह हिलाएं और साफ रुई से दिन में 2–3 बार हल्की परत लगाएं।',
        safetyCaution: 'केवल बाहरी उपयोग के लिए। बहते हुए खुले घाव पर न लगाएं।',
        typicalUse: 'तेज खुजली, लाल चकत्ते, कीड़े के काटने और एलर्जी में ठंडक देता है।',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      betadineOintment: {
        name: 'Betadine 5% पोविडोन-आयोडीन ऑइंटमेंट 15g (Win-Medicare)',
        category: 'एंटीसेप्टिक घाव मरहम',
        dosageGuide: 'घाव को साफ पानी से धोकर सुखाएं और पट्टी लगाने से पहले दिन में 1–2 बार हल्की परत लगाएं।',
        safetyCaution: 'आयोडीन से एलर्जी हो तो न लगाएं। गहरे खुले घाव के लिए नहीं।',
        typicalUse: 'छोटे कट, रसोई की चोट और खरोंच में संक्रमण रोकता है।',
        preferredQuantity: 1,
        unitLabel: 'tube'
      },
      bandAidStrips: {
        name: 'Band-Aid वॉशप्रूफ एंटीसेप्टिक स्ट्रिप्स (Johnson & Johnson)',
        category: 'स्टेराइल चिपकने वाली पट्टी',
        dosageGuide: 'साफ चोट पर नई पट्टी लगाएं; गीली या गंदी होने पर रोज बदलें।',
        safetyCaution: 'घाव भरने लगे तो खुली हवा लगने दें।',
        typicalUse: 'छोटी चोट को धूल, पानी और रगड़ से बचाता है।',
        preferredQuantity: 1,
        unitLabel: 'pack'
      },
      enoPowder: {
        name: 'ENO फ्रूट सॉल्ट एंटासिड पाउडर पाउच 5g (GSK)',
        category: 'तेज असर एंटासिड और गैस पाउडर',
        dosageGuide: '1 गिलास ठंडे पानी में 1 पाउच घोलें और भोजन के बाद तुरंत पिएं।',
        safetyCaution: '24 घंटे में 2 पाउच से अधिक न लें। हाई बीपी या किडनी रोग में बार-बार न लें।',
        typicalUse: 'एसिडिटी, सीने की जलन, गैस और पेट फूलने से सेकंडों में राहत।',
        preferredQuantity: 1,
        unitLabel: 'sachet'
      },
      strepsils: {
        name: 'Strepsils हनी एंड लेमन गले की गोलियां (Reckitt)',
        category: 'गले की खराश दूर करने वाली लोज़ेंजेस',
        dosageGuide: 'हर 3–4 घंटे में 1 गोली मुंह में धीरे-धीरे चूसें।',
        childDosageNote: '5 साल से छोटे बच्चों को कठोर गोली न दें (Dabur Honitus सिरप का उपयोग करें)।',
        safetyCaution: '1 साल से छोटे शिशु को शहद उत्पाद न दें।',
        typicalUse: 'गले की खराश और सूखी खांसी को शांत करता है।',
        preferredQuantity: 1,
        unitLabel: 'pack'
      }
    },
    simpleTips: [
      'शरीर को हाइड्रेट रखने के लिए पर्याप्त साफ पानी, Electral ORS या गुनगुने तरल पदार्थ पिएं।',
      'पर्याप्त आराम करें और मोबाइल/स्क्रीन या भारी शारीरिक श्रम से बचें।',
      'यदि 48 घंटों में सुधार न दिखे, तो नजदीकी डॉक्टर से जरूर मिलें।'
    ],
    remedies: {
      fever: [
        { title: 'गुनगुने पानी की पट्टी', instructions: 'माथे और गर्दन पर गुनगुने पानी के कपड़े से हल्के से पोंछें।', benefit: 'बिना कंपकंपी पैदा किए शरीर का तापमान कम करता है।' },
        { title: 'Electral ORS और नारियल पानी', instructions: 'तैयार ORS घोल या ताजा नारियल पानी थोड़ी-थोड़ी देर में पिएं।', benefit: 'पसीने से निकले नमक और पानी की पूर्ति करता है।' },
        { title: 'हल्के सूती कपड़े', instructions: 'ढीले सूती कपड़े पहनें और हवादार कमरे में रहें।', benefit: 'शरीर की अतिरिक्त गर्मी बाहर निकलती है।' }
      ],
      headache: [
        { title: 'अंधेरे शांत कमरे में आराम', instructions: 'लाइट कम करें, स्क्रीन बंद करें और 30 मिनट आराम करें।', benefit: 'सिर की नसों का तनाव कम होता है।' },
        { title: 'माथे पर ठंडी पट्टी', instructions: 'माथे पर ठंडा गीला कपड़ा 15 मिनट रखें।', benefit: 'तेज धड़कन वाले दर्द को शांत करता है।' },
        { title: 'पर्याप्त पानी पिएं', instructions: 'धीरे-धीरे 2 गिलास पानी पिएं।', benefit: 'डिहाइड्रेशन से होने वाले सिरदर्द से बचाता है।' }
      ],
      cold_sneezing: [
        { title: 'गर्म पानी की भाप (Steam)', instructions: 'दिन में दो बार 5–10 मिनट हल्की भाप लें।', benefit: 'बंद नाक और साइनस खुलता है।' },
        { title: 'नमक के गुनगुने पानी के गरारे', instructions: '1 गिलास गुनगुने पानी में आधा चम्मच नमक डालकर गरारे करें।', benefit: 'गले की सूजन और खराश कम होती है।' },
        { title: 'अदरक-शहद की गुनगुनी चाय', instructions: 'गुनगुने पानी में अदरक और 1 चम्मच शहद मिलाकर पिएं (1 वर्ष से बड़े)।', benefit: 'गले को आराम देता है।' }
      ],
      skin_rash: [
        { title: 'ठंडे पानी की सिकाई', instructions: 'Candid पाउडर लगाने से पहले साफ ठंडे कपड़े से 10 मिनट सिंकाई करें।', benefit: 'खुजली तुरंत शांत होती है।' },
        { title: 'त्वचा सूखी रखें और सूती कपड़े पहनें', instructions: 'नहाने के बाद त्वचा अच्छी तरह सुखाएं और ढीले सूती कपड़े पहनें।', benefit: 'नमी और फंगल संक्रमण रुकता है।' },
        { title: 'खुजलाने से बचें', instructions: 'नाखून छोटे रखें ताकि त्वचा पर खरोंच न लगे।', benefit: 'त्वचा में दूसरे बैक्टीरियल संक्रमण से बचाव होता है।' }
      ],
      small_cuts: [
        { title: 'साफ कपड़े से सीधा दबाव', instructions: 'साफ पट्टी से 5–10 मिनट तक लगातार दबाकर रखें।', benefit: 'हल्का खून बहना रुकता है।' },
        { title: 'साफ बहते पानी से धोएं', instructions: 'चोट को साफ नल के पानी के नीचे 2–3 मिनट धोएं।', benefit: 'धूल और गंदगी सुरक्षित रूप से साफ होती है।' },
        { title: 'चोट वाले हिस्से को ऊपर रखें', instructions: 'हाथ या उंगली को दिल के स्तर से थोड़ा ऊपर रखें।', benefit: 'सूजन और टीस कम होती है।' }
      ],
      stomach_upset: [
        { title: 'हल्का सादा भोजन (खिचड़ी / दही-चावल)', instructions: 'मसालेदार खाने से बचें और थोड़ा-थोड़ा हल्का भोजन लें।', benefit: 'पेट की अंदरूनी परत को आराम मिलता है।' },
        { title: 'भोजन के बाद सीधे बैठें', instructions: 'खाने के बाद कम से कम 45 मिनट तक न लेटें।', benefit: 'एसिड ऊपर चढ़ने (एसिडिटी) से रोकता है।' }
      ],
      cough_throat: [
        { title: 'गुनगुने नमक पानी से गरारे', instructions: 'दिन में 3 बार गुनगुने नमक वाले पानी से गरारे करें।', benefit: 'गले का कफ और सूजन साफ होता है।' },
        { title: 'सोने से पहले भाप लें', instructions: 'सोने से पहले 5–10 मिनट भाप लें।', benefit: 'सूखी खांसी और गले की खुश्की कम होती है।' }
      ],
      body_ache: [
        { title: 'गुनगुनी सिकाई और पूरी नींद', instructions: 'दर्द वाली मांसपेशियों पर गर्म पट्टी से सिकाई करें और 8 घंटे सोएं।', benefit: 'मांसपेशियों की अकड़न दूर होती है।' },
        { title: 'पौष्टिक हल्का सूप और पानी', instructions: 'दाल का सूप और पर्याप्त पानी पिएं।', benefit: 'कमजोरी दूर कर ऊर्जा बढ़ाता है।' }
      ]
    }
  },

  hinglish: {
    summaries: {
      emergency: (rf) => `TURANT HOSPITAL JAYEIN: Aapke answers me serious red-flag symptoms (${rf}) mile hain. Turant nazdeeki emergency hospital me doctor ko dikhayein.`,
      severe: () => 'AAJ HI DOCTOR KO DIKHAYEIN: Aapke symptoms kaafi significant hain, inhe aaj hi doctor se check karwana zaroori hai.',
      moderate: () => 'CARE AUR MONITORING: Symptoms basic care se sambhale ja sakte hain, lekin agar 24–48 hours me aaram na ho toh doctor se milein.',
      mild: () => 'HALKE SYMPTOMS (SAFE HOME CARE): Yeh serious problem nahi hai. Neeche batayi gayi real OTC medicine/powder, paani aur aaram kaafi hai.'
    },
    observations: {
      highPain: 'Tez dard/takleef rating (9–10/10) report ki gayi.',
      modPain: 'Medium takleef jo daily kaam ko affect kar rahi hai.',
      rapidProgress: 'Symptoms theek hone ke bajay tezi se badh rahe hain.',
      impairedDaily: 'Rozmarra ke kaam karne me kaafi dikkat ho rahi hai.',
      pediatricParacetamol: 'Baccha patient: Sirf weight ke hisaab se Calpol syrup (10–15 mg/kg) dein. Aspirin kabhi na dein.',
      frequentVomiting: 'Baar-baar ulti report hui — chhote ghoont me Electral ORS pilayein.'
    },
    redFlags: {
      defaultFlag: 'Urgent warning sign report hua',
      noFluids: 'Lagatar ulti ki wajah se paani pet me ruk nahi raha hai.',
      highFever: 'Tez bukhar ke liye turant doctor ki jaanch zaroori hai.',
      thunderclap: 'Achanak tez sar dard ke liye turant ER check-up zaroori hai.',
      nonBlanching: 'Dabane par na mitne wale purple spots ke liye turant hospital jayein.',
      blisters: 'Paani ya pus wale chhale infection ho sakte hain, doctor ko dikhayein.',
      deepCut: 'Gahre cut ya lagatar khoon behne par 6–8 ghante me doctor treatment zaroori hai.'
    },
    products: {
      calpol120: {
        name: 'Calpol 120mg/5ml Pediatric Syrup (GSK — Paracetamol IP)',
        category: 'Bacchon ke Bukhar aur Dard ka Syrup',
        dosageGuide: 'Weight ke hisaab se (10–15 mg/kg) har 4–6 ghante me measuring cap se dein. 24 hrs me max 4 doses.',
        childDosageNote: 'Bottle par likhe weight chart ya pediatrician ki salah se dein.',
        safetyCaution: 'Paracetamol wale kisi doosre cold syrup ke saath na dein.',
        typicalUse: 'Bacchon me bukhar aur badan dard se safe aaram.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      calpol250: {
        name: 'Calpol 250mg/5ml Pediatric Syrup (GSK)',
        category: 'Bade Bacchon ke liye Bukhar/Dard Syrup',
        dosageGuide: 'Halke khane ke baad har 4–6 ghante me weight ke hisaab se dein.',
        childDosageNote: 'Bacche ka weight check karke exact dose naapein.',
        safetyCaution: '24 ghante me 4 dose se zyada na dein.',
        typicalUse: 'Bacchon ke badan dard aur bukhar ko kam karta hai.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      dolo650: {
        name: 'Dolo 650mg Tablet (Micro Labs — Paracetamol IP)',
        category: 'Bukhar aur Pain Relief Tablet',
        dosageGuide: 'Halke khane ke baad har 6–8 ghante me 1 tablet paani se lein. 24 hrs me max 3–4 tablets.',
        safetyCaution: 'Alcohol aur doosri Paracetamol tablets saath na lein.',
        typicalUse: 'Bukhar, thand lagna aur badan dard me turant rahat.',
        preferredQuantity: 2,
        unitLabel: 'tablet'
      },
      crocin500: {
        name: 'Crocin Advance 500mg Tablet (GSK — Paracetamol IP)',
        category: 'Fast-Release Pain Relief Tablet',
        dosageGuide: 'Halke nashte ke baad 1 gilaas paani ke saath 1 tablet lein. Zaroorat ho toh 6 hrs baad lein.',
        safetyCaution: 'Safe first-line option; 24 ghante me 4 tablets se zyada na lein.',
        typicalUse: 'Sar dard, tension headache aur halke bukhar me aaram.',
        preferredQuantity: 2,
        unitLabel: 'tablet'
      },
      brufen400: {
        name: 'Brufen 400mg Tablet (Abbott — Ibuprofen IP)',
        category: 'Anti-inflammatory Pain Tablet (NSAID)',
        dosageGuide: 'Khana khane ke baad hi 1 tablet paani se lein. Zaroorat ho toh 8 hrs baad.',
        safetyCaution: 'Pregnancy, stomach ulcer, kidney problem ya NSAID allergy me na lein.',
        typicalUse: 'Migraine aur muscle sujan dard me rahat.',
        preferredQuantity: 1,
        unitLabel: 'tablet'
      },
      electralOrs: {
        name: 'Electral WHO ORS Powder Sachet 21.8g (FDC Ltd)',
        category: 'WHO Oral Rehydration Powder',
        dosageGuide: '1 poora sachet 1 liter saaf paani me ghol kar din bhar thoda-thoda piyein.',
        safetyCaution: 'Banaya hua ghol 24 ghante me khatam karein. Mix karne ke baad ubaalein nahi.',
        typicalUse: 'Bukhar, kamzori ya loose motion me electrolytes aur paani poora karta hai.',
        preferredQuantity: 1,
        unitLabel: 'sachet'
      },
      cetzine10: {
        name: 'Cetzine 10mg Tablet (GSK — Cetirizine IP)',
        category: 'Anti-Allergy Antihistamine Tablet',
        dosageGuide: 'Raat ko sone se pehle 1 tablet paani ke saath lein.',
        childDosageNote: '2–12 saal ke bacchon ke liye Cetzine Syrup (2.5ml–5ml din me ek baar) dein.',
        safetyCaution: 'Halki neend aa sakti hai; dawai ke baad driving na karein.',
        typicalUse: 'Lagatar chheenk, behti naak, aankh me paani aur allergy khujli rokta hai.',
        preferredQuantity: 1,
        unitLabel: 'tablet'
      },
      otrivinSaline: {
        name: 'Otrivin Breathe Clean Saline Nasal Spray (GSK — 0.9% NaCl)',
        category: 'Drug-Free Saline Nasal Spray',
        dosageGuide: 'Band naak kholne ke liye din me 3–4 baar dono nostrils me 2-2 spray karein.',
        safetyCaution: '100% drug-free aur safe; bacchon, bujurgon aur pregnancy me bhi safe.',
        typicalUse: 'Naak ki blockage saaf karta hai aur gale ki kharash kam karta hai.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      candidPowder: {
        name: 'Candid Dusting Powder 100g (Glenmark — Clotrimazole 1%)',
        category: 'Antifungal Medicated Skin Powder',
        dosageGuide: 'Affected skin ko dho kar achhe se sukha lein, phir subah aur raat 2 baar Candid Powder lagayein.',
        safetyCaution: 'Sirf bahari skin ke liye. Aankh, muh aur khule khoon wale ghav se door rakhein.',
        typicalUse: 'Paseene ke daane, fungal khujli, ghamoriya aur laal rashes theek karta hai.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      caladrylLotion: {
        name: 'Caladryl Skin Allergy Lotion (Piramal — Calamine)',
        category: 'Soothing Anti-Itch Skin Lotion',
        dosageGuide: 'Bottle achhe se hila kar saaf cotton se din me 2–3 baar lagayein.',
        safetyCaution: 'Sirf external skin use ke liye. Open bleeding cuts par na lagayein.',
        typicalUse: 'Tez khujli, hives, insect bites aur allergy me thandak deta hai.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      betadineOintment: {
        name: 'Betadine 5% Povidone-Iodine Ointment 15g (Win-Medicare)',
        category: 'Topical Antiseptic Ointment',
        dosageGuide: 'Chot ko saaf paani se dho kar sukhayein aur patti se pehle din me 1–2 baar halka lagayein.',
        safetyCaution: 'Iodine allergy ho toh na lagayein. Gahre cut ke liye nahi.',
        typicalUse: 'Chhote cuts aur khronch me bacterial infection rokta hai.',
        preferredQuantity: 1,
        unitLabel: 'tube'
      },
      bandAidStrips: {
        name: 'Band-Aid Washproof Antiseptic Strips (Johnson & Johnson)',
        category: 'Sterile Adhesive Dressing',
        dosageGuide: 'Saaf chot par fresh strip lagayein; geeli hone par badlein.',
        safetyCaution: 'Ghav bharne lage toh thodi der khula chhodein.',
        typicalUse: 'Chhoti chot ko dhool, paani aur friction se bachata hai.',
        preferredQuantity: 1,
        unitLabel: 'pack'
      },
      enoPowder: {
        name: 'ENO Fruit Salt Antacid Powder Sachet 5g (GSK)',
        category: 'Fast-Acting Acidity & Gas Powder',
        dosageGuide: '1 sachet ko 1 gilaas thande paani me ghol kar khane ke baad turant piyein.',
        safetyCaution: '24 ghante me 2 sachet se zyada na lein. High BP ya kidney problem me avoid karein.',
        typicalUse: 'Acidity, seene ki jalan, gas aur pet phoolne me turant aaram.',
        preferredQuantity: 1,
        unitLabel: 'sachet'
      },
      strepsils: {
        name: 'Strepsils Honey & Lemon Throat Lozenges (Reckitt)',
        category: 'Antiseptic Throat Lozenges',
        dosageGuide: 'Har 3–4 ghante me 1 lozenge muh me dheere-dheere chusein.',
        childDosageNote: '5 saal se chhote bacchon ko hard tablet na dein (Dabur Honitus syrup dein).',
        safetyCaution: '1 saal se chhote infant ko honey bilkul na dein.',
        typicalUse: 'Gale ki kharash aur sookhi khansi ko shant karta hai.',
        preferredQuantity: 1,
        unitLabel: 'pack'
      }
    },
    simpleTips: [
      'Body ko hydrated rakhne ke liye saaf paani, Electral ORS ya gunguna fluids piyein.',
      'Poora aaram karein aur screen time ya heavy physical kaam se bachein.',
      'Agar 48 ghante me symptoms me sudhar na ho, toh doctor ko zaroor dikhayein.'
    ],
    remedies: {
      fever: [
        { title: 'Gungune Paani ki Patti', instructions: 'Maathe aur gardan ko gungune paani ke kapde se halka ponchein.', benefit: 'Bina thand lagaye bukhar kam karta hai.' },
        { title: 'Electral ORS / Nariyal Paani', instructions: 'ORS ya nariyal paani thodi-thodi der me piyein.', benefit: 'Body ke salts aur fluids wapas laata hai.' },
        { title: 'Halke Cotton Kapde', instructions: 'Dheele cotton kapde pehnein aur hawaadar kamre me rahein.', benefit: 'Body heat bahar nikalti hai.' }
      ],
      headache: [
        { title: 'Andhere Shaant Kamre me Aaram', instructions: 'Lights dim karein, mobile band karein aur 30 min aaram karein.', benefit: 'Dimag ki naso ka tension kam hota hai.' },
        { title: 'Maathe par Thandi Patti', instructions: '15 minute tak maathe par thanda kapda rakhein.', benefit: 'Sar dard ka throbbing kam hota hai.' },
        { title: 'Paani Peete Rahein', instructions: 'Dheere-dheere 500ml paani piyein.', benefit: 'Dehydration wala sar dard theek hota hai.' }
      ],
      cold_sneezing: [
        { title: 'Bhaap Lena (Steam)', instructions: 'Din me 2 baar 5–10 minute garam paani ki bhaap lein.', benefit: 'Band naak aur sinus khulta hai.' },
        { title: 'Namak ke Paani ke Garare', instructions: 'Gungune paani me 1/2 tsp namak daal kar garare karein.', benefit: 'Gale ki sujan kam hoti hai.' },
        { title: 'Adrak-Shahad ki Gunguni Chai', instructions: 'Gungune paani me adrak aur shahad lein (1 saal se bade).', benefit: 'Gale ko aaram milta hai.' }
      ],
      skin_rash: [
        { title: 'Thande Paani ki Sikaai', instructions: 'Candid powder lagane se pehle 10 min thande kapde se sek karein.', benefit: 'Khujli turant kam hoti hai.' },
        { title: 'Skin Sukha Rakhein & Cotton Pehnein', instructions: 'Nahane ke baad skin bilkul sukha kar loose cotton kapde pehnein.', benefit: 'Paseena aur fungal infection rukta hai.' },
        { title: 'Khujlane se Bachein', instructions: 'Nakhun chhote rakhein.', benefit: 'Skin infection badhne se bachaav hota hai.' }
      ],
      small_cuts: [
        { title: 'Saaf Kapde se Dabav', instructions: 'Saaf gauze se 5–10 min tak lagatar dabaa kar rakhein.', benefit: 'Khoon behna rukta hai.' },
        { title: 'Saaf Paani se Dhona', instructions: 'Chot ko 2–3 min saaf tap water se dhoyein.', benefit: 'Mitti aur bacteria saaf hote hain.' },
        { title: 'Chot Upar Rakhein', instructions: 'Haath ya ungli ko thoda upar rakh kar aaram dein.', benefit: 'Sujan aur dard kam hota hai.' }
      ],
      stomach_upset: [
        { title: 'Halka Khana (Khichdi / Dahi-Chawal)', instructions: 'Teekha-masala chhod kar halka soft khana khayein.', benefit: 'Pet ko aaram milta hai.' },
        { title: 'Khane ke Baad Seedhe Baithein', instructions: 'Khane ke 45 min baad tak letein nahi.', benefit: 'Acidity upar aane se rukti hai.' }
      ],
      cough_throat: [
        { title: 'Namak Paani ke Garare', instructions: 'Din me 3 baar gungune namak paani se garare karein.', benefit: 'Gale ki sujan aur kaph saaf hota hai.' },
        { title: 'Sone se Pehle Bhaap', instructions: 'Raat ko sone se pehle 5–10 min bhaap lein.', benefit: 'Sookhi khansi me rahat milti hai.' }
      ],
      body_ache: [
        { title: 'Garam Sikaai aur Poori Neend', instructions: 'Dard wale hisse par garam patti rakhein aur 8 ghante soyein.', benefit: 'Muscle stiffness door hoti hai.' },
        { title: 'Garam Soup aur Fluids', instructions: 'Dal soup aur saaf paani piyein.', benefit: 'Energy aur hydration wapas aati hai.' }
      ]
    }
  },

  mr: {
    summaries: {
      emergency: (rf) => `तातडीची वैद्यकीय मदत आवश्यक: तुमच्या उत्तरांमध्ये गंभीर लक्षणे (${rf}) आढळली आहेत. कृपया त्वरित जवळच्या रुग्णालयाच्या इमर्जन्सी विभागात जा.`,
      severe: () => 'आजच डॉक्टरांची तपासणी आवश्यक: तुमची लक्षणे गंभीर आहेत, आजच डॉक्टरांना प्रत्यक्ष दाखवणे गरजेचे आहे.',
      moderate: () => 'देखरेखीखाली काळजी: लक्षणे प्राथमिक उपचारांनी सांभाळता येतील, परंतु 24–48 तासांत फरक न पडल्यास डॉक्टरांना भेटा.',
      mild: () => 'सौम्य लक्षणे (घरगुती सुरक्षित काळजी): ही गंभीर समस्या नाही. खाली सुचवलेले अस्सल औषध/पावडर, पाणी आणि विश्रांती पुरेशी आहे.'
    },
    observations: {
      highPain: 'तीव्र वेदना/अस्वस्थता (9–10/10) नोंदवली आहे.',
      modPain: 'मध्यम त्रास जो दैनंदिन कामांवर परिणाम करत आहे.',
      rapidProgress: 'लक्षणे सुधारण्याऐवजी वेगाने वाढत आहेत.',
      impairedDaily: 'दैनंदिन कामे करण्यात मोठी अडचण.',
      pediatricParacetamol: 'बाल रुग्ण: वजनानुसारच Calpol सिरप (10–15 mg/kg) द्या. Aspirin कधीही देऊ नका.',
      frequentVomiting: 'वारंवार उलट्या सांगितल्या आहेत — थोडे थोडे Electral ORS प्या.'
    },
    redFlags: {
      defaultFlag: 'गंभीर धोक्याचे लक्षण',
      noFluids: 'सततच्या उलट्यांमुळे पाणी पोटात टिकत नाही.',
      highFever: 'तीव्र तापासाठी डॉक्टरांचे प्रत्यक्ष निरीक्षण आवश्यक आहे.',
      thunderclap: 'अचानक झालेल्या तीव्र डोकेदुखीसाठी तात्काळ इमर्जन्सी तपासणी आवश्यक.',
      nonBlanching: 'दाबूनही न जाणारे जांभळे डाग असल्यास त्वरित रुग्णालयात जा.',
      blisters: 'पाणी किंवा पू भरलेले फोड संसर्गाचे लक्षण असू शकतात; डॉक्टरांना दाखवा.',
      deepCut: 'खोल जखम किंवा सततच्या रक्तस्रावासाठी 6–8 तासांत वैद्यकीय उपचार आवश्यक.'
    },
    products: {
      calpol120: {
        name: 'Calpol 120mg/5ml पीडियाट्रिक सिरप (GSK — पॅरासिटामॉल)',
        category: 'लहान मुलांचा ताप व वेदना सिरप',
        dosageGuide: 'वजनानुसार (10–15 mg/kg) दर 4–6 तासांनी मापन झाकणाने द्या. 24 तासांत कमाल 4 डोस.',
        childDosageNote: 'बाटलीवरील वजन तक्त्यानुसार किंवा बालरोगतज्ञांच्या सल्ल्यानेच द्या.',
        safetyCaution: 'पॅरासिटामॉल असलेल्या इतर सर्दीच्या सिरपसोबत देऊ नका.',
        typicalUse: 'मुलांमधील ताप व अंगदुखीवर सुरक्षित आराम.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      calpol250: {
        name: 'Calpol 250mg/5ml पीडियाट्रिक सिरप (GSK)',
        category: 'मुलांचे वेदना व ताप निवारक औषध',
        dosageGuide: 'हलक्या जेवणानंतर दर 4–6 तासांनी वजनानुसार द्या.',
        childDosageNote: 'देण्यापूर्वी मुलाचे वजन तपासा.',
        safetyCaution: '24 तासांत 4 डोसपेक्षा जास्त देऊ नका.',
        typicalUse: 'मोठ्या मुलांमधील अंगदुखी आणि ताप कमी करते.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      dolo650: {
        name: 'Dolo 650mg टॅबलेट (Micro Labs — पॅरासिटामॉल IP)',
        category: 'ताप व वेदना निवारक गोळी',
        dosageGuide: 'हलक्या जेवणानंतर दर 6–8 तासांनी 1 गोळी पाण्यासोबत घ्या. 24 तासांत कमाल 3–4 गोळ्या.',
        safetyCaution: 'दारू टाळा आणि इतर पॅरासिटामॉल गोळ्या सोबत घेऊ नका.',
        typicalUse: 'ताप, थंडी वाजणे आणि अंगदुखी कमी करते.',
        preferredQuantity: 2,
        unitLabel: 'tablet'
      },
      crocin500: {
        name: 'Crocin Advance 500mg टॅबलेट (GSK — पॅरासिटामॉल IP)',
        category: 'जलद परिणाम करणारी वेदनाशामक गोळी',
        dosageGuide: 'हलक्या नाश्त्यानंतर 1 ग्लास पाण्यासोबत 1 गोळी घ्या. गरजेनुसार 6 तासांनी पुन्हा घ्या.',
        safetyCaution: 'सुरक्षित प्राथमिक औषध; 24 तासांत 4 गोळ्यांपेक्षा जास्त घेऊ नका.',
        typicalUse: 'डोकेदुखी, कपाळाचा ताण आणि सौम्य तापावर जलद आराम.',
        preferredQuantity: 2,
        unitLabel: 'tablet'
      },
      brufen400: {
        name: 'Brufen 400mg टॅबलेट (Abbott — आयब्युप्रोफेन IP)',
        category: 'सूज आणि वेदनाशामक गोळी (NSAID)',
        dosageGuide: 'जेवणानंतरच 1 गोळी भरपूर पाण्यासोबत घ्या. गरजेनुसार दर 8 तासांनी.',
        safetyCaution: 'गरोदरपण, पोटाचा अल्सर, किडनी त्रास किंवा NSAID ॲलर्जी असल्यास घेऊ नका.',
        typicalUse: 'मायग्रेन आणि स्नायूंच्या सुजेवर आराम.',
        preferredQuantity: 1,
        unitLabel: 'tablet'
      },
      electralOrs: {
        name: 'Electral WHO ORS पावडर पाऊच 21.8g (FDC Ltd)',
        category: 'WHO ओरल रिहायड्रेशन पावडर',
        dosageGuide: '1 पूर्ण पाऊच 1 लिटर स्वच्छ पिण्याच्या पाण्यात मिसळा आणि दिवसभर थोडे थोडे प्या.',
        safetyCaution: 'तयार द्रावण 24 तासांत वापरा. मिसळल्यानंतर पाणी उकळू नका.',
        typicalUse: 'ताप, अशक्तपणा किंवा जुलाबात शरीरातील क्षार व पाण्याची कमतरता भरून काढते.',
        preferredQuantity: 1,
        unitLabel: 'sachet'
      },
      cetzine10: {
        name: 'Cetzine 10mg टॅबलेट (GSK — सेटिरिझिन IP)',
        category: 'ॲलर्जी विरोधी अँटीहिस्टामाइन गोळी',
        dosageGuide: 'रात्री झोपण्यापूर्वी 1 गोळी पाण्यासोबत घ्या.',
        childDosageNote: '2–12 वर्षे वयोगटासाठी Cetzine सिरप (2.5ml–5ml दिवसातून एकदा) वापरा.',
        safetyCaution: 'थोडी झोप येऊ शकते; घेतल्यानंतर वाहन चालवू नका.',
        typicalUse: 'सतत शिंका, वाहणारे नाक, डोळ्यांतून पाणी व त्वचेची खाज थांबवते.',
        preferredQuantity: 1,
        unitLabel: 'tablet'
      },
      otrivinSaline: {
        name: 'Otrivin Breathe Clean सलाइन नेझल स्प्रे (GSK — 0.9% NaCl)',
        category: 'औषध-विरहित सलाइन नाक स्प्रे',
        dosageGuide: 'चोंदलेले नाक मोकळे करण्यासाठी दिवसातून 3–4 वेळा दोन्ही नाकपुड्यांत 2-2 स्प्रे करा.',
        safetyCaution: '100% सुरक्षित; लहान मुले, ज्येष्ठ व गरोदर महिलांसाठीही योग्य.',
        typicalUse: 'नाकातील कफ व धूळ स्वच्छ करते आणि घशातील खवखव कमी करते.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      candidPowder: {
        name: 'Candid डस्टिंग पावडर 100g (Glenmark — क्लोट्रिमाझोल 1%)',
        category: 'अँटीफंगल मेडिकेटेड पावडर',
        dosageGuide: 'त्वचेचा भाग स्वच्छ धुवून पूर्ण कोरडा करा आणि सकाळ-संध्याकाळ 2 वेळा Candid पावडर लावा.',
        safetyCaution: 'फक्त बाह्य वापरासाठी. डोळे, तोंड व उघड्या जखमेपासून दूर ठेवा.',
        typicalUse: 'घामाचे पुरळ, फंगल खाज, घामोळे आणि त्वचेची लालसरपणा बरा करते.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      caladrylLotion: {
        name: 'Caladryl स्किन ॲलर्जी लोशन (Piramal — कॅलामाइन)',
        category: 'थंडावा देणारे खाज विरोधी लोशन',
        dosageGuide: 'बाटली नीट हलवा आणि स्वच्छ कापसाने दिवसातून 2–3 वेळा लावा.',
        safetyCaution: 'फक्त बाह्य त्वचेसाठी. उघड्या जखमांवर लावू नका.',
        typicalUse: 'तीव्र खाज, गांधी, कीटक चावणे व ॲलर्जीवर थंडावा देते.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      betadineOintment: {
        name: 'Betadine 5% पोव्हिडोन-आयोडीन मलम 15g (Win-Medicare)',
        category: 'अँटीसेप्टिक जखम मलम',
        dosageGuide: 'जखम स्वच्छ पाण्याने धुवून कोरडी करा व पट्टी बांधण्यापूर्वी दिवसातून 1–2 वेळा लावा.',
        safetyCaution: 'आयोडीनची ॲलर्जी असल्यास वापरू नका.',
        typicalUse: 'लहान कापणे व खरचटण्यातील जंतुसंसर्ग रोखते.',
        preferredQuantity: 1,
        unitLabel: 'tube'
      },
      bandAidStrips: {
        name: 'Band-Aid वॉशप्रूफ अँटीसेप्टिक स्ट्रिप्स (Johnson & Johnson)',
        category: 'निर्जंतुक जखम पट्टी',
        dosageGuide: 'स्वच्छ जखमेवर पट्टी लावा; ओली झाल्यास बदला.',
        safetyCaution: 'जखम भरू लागल्यावर मोकळी हवा लागू द्या.',
        typicalUse: 'जखमेचे धूळ, पाणी व घर्षणापासून संरक्षण करते.',
        preferredQuantity: 1,
        unitLabel: 'pack'
      },
      enoPowder: {
        name: 'ENO फ्रूट सॉल्ट अँटासिड पावडर पाऊच 5g (GSK)',
        category: 'जलद ॲसिडिटी व गॅस पावडर',
        dosageGuide: '1 ग्लास थंड पाण्यात 1 पाऊच विरघळवून जेवणानंतर लगेच प्या.',
        safetyCaution: '24 तासांत 2 पाऊचपेक्षा जास्त घेऊ नका. उच्च रक्तदाब किंवा किडनी आजारात टाळा.',
        typicalUse: 'ॲसिडिटी, छातीत जळजळ, गॅस आणि पोट फुगणे सेकंदात कमी करते.',
        preferredQuantity: 1,
        unitLabel: 'sachet'
      },
      strepsils: {
        name: 'Strepsils हनी अँड लेमन गोळ्या (Reckitt)',
        category: 'घसा शांत करणाऱ्या लोजेंजेस',
        dosageGuide: 'दर 3–4 तासांनी 1 गोळी तोंडात हळूहळू विरघळू द्या.',
        childDosageNote: '5 वर्षांखालील मुलांना कठीण गोळी देऊ नका (Dabur Honitus सिरप वापरा).',
        safetyCaution: '1 वर्षाखालील बाळाला मध देऊ नका.',
        typicalUse: 'घशाची खवखव आणि कोरडा खोकला शांत करते.',
        preferredQuantity: 1,
        unitLabel: 'pack'
      }
    },
    simpleTips: [
      'शरीरातील पाणी टिकवून ठेवण्यासाठी स्वच्छ पाणी, Electral ORS किंवा कोमट पेये घ्या.',
      'पुरेशी विश्रांती घ्या आणि स्क्रीन पाहणे किंवा कष्टाची कामे टाळा.',
      '48 तासांत लक्षणे न सुधारल्यास डॉक्टरांचा सल्ला घ्या.'
    ],
    remedies: {
      fever: [
        { title: 'कोमट पाण्याची पट्टी', instructions: 'कपाळावर आणि मानेवर कोमट पाण्याच्या कापडाने हळुवार पुसा.', benefit: 'थंडी न वाजता तापमान कमी होते.' },
        { title: 'Electral ORS व नारळ पाणी', instructions: 'दिवसभर थोड्या थोड्या वेळाने ORS किंवा नारळ पाणी प्या.', benefit: 'शरीरातील क्षार व पाणी भरून निघते.' },
        { title: 'हलके सुती कपडे', instructions: 'सैल सुती कपडे घाला आणि हवेशीर खोलीत राहा.', benefit: 'शरीरातील अतिरिक्त उष्णता बाहेर पडते.' }
      ],
      headache: [
        { title: 'अंधाऱ्या शांत खोलीत विश्रांती', instructions: 'दिवे मंद करा, स्क्रीन बंद करा आणि 30 मिनिटे विश्रांती घ्या.', benefit: 'डोक्याच्या नसांवरील ताण कमी होतो.' },
        { title: 'कपाळावर थंड पट्टी', instructions: '15 मिनिटे थंड ओले कापड कपाळावर ठेवा.', benefit: 'ठणकणारे दुखणे शांत होते.' },
        { title: 'पुरेसे पाणी प्या', instructions: 'हळूहळू 2 ग्लास पाणी प्या.', benefit: 'पाण्याअभावी होणारी डोकेदुखी थांबते.' }
      ],
      cold_sneezing: [
        { title: 'गरम पाण्याची वाफ', instructions: 'दिवसातून दोनदा 5–10 मिनिटे वाफ घ्या.', benefit: 'बंद नाक मोकळे होते.' },
        { title: 'कोमट मिठाच्या पाण्याच्या गुळण्या', instructions: 'कोमट पाण्यात अर्धा चमचा मीठ घालून गुळण्या करा.', benefit: 'घशाची सूज कमी होते.' },
        { title: 'आले-मध कोमट चहा', instructions: 'कोमट पाण्यात आले व मध घ्या (1 वर्षापेक्षा मोठ्यांसाठी).', benefit: 'घशाला आराम मिळतो.' }
      ],
      skin_rash: [
        { title: 'थंड पाण्याचा शेक', instructions: 'Candid पावडर लावण्यापूर्वी 10 मिनिटे थंड ओल्या कापडाने शेक द्या.', benefit: 'खाज त्वरित शांत होते.' },
        { title: 'त्वचा कोरडी व सुती कपडे', instructions: 'आंघोळीनंतर त्वचा पूर्ण कोरडी करा आणि सैल सुती कपडे घाला.', benefit: 'घाम व फंगल संसर्ग रोखला जातो.' },
        { title: 'खाजवणे टाळा', instructions: 'नखे लहान कापून ठेवा.', benefit: 'त्वचेला जखम व संसर्ग होत नाही.' }
      ],
      small_cuts: [
        { title: 'स्वच्छ कापडाने दाब', instructions: 'स्वच्छ कापडाने 5–10 मिनिटे दाबून धरा.', benefit: 'रक्तस्राव थांबतो.' },
        { title: 'वाहत्या स्वच्छ पाण्याने धुवा', instructions: '2–3 मिनिटे स्वच्छ पाण्याखाली जखम धुवा.', benefit: 'धूळ व जंतू सुरक्षितपणे निघून जातात.' },
        { title: 'जखम उंचावर ठेवा', instructions: 'जखमी हात किंवा बोट थोडे वर ठेवा.', benefit: 'सूज व ठणका कमी होतो.' }
      ],
      stomach_upset: [
        { title: 'हलका साधा आहार (खिचडी / दही-भात)', instructions: 'तिखट-मसालेदार टाळून थोडा थोडा मऊ आहार घ्या.', benefit: 'पोटाला आराम मिळतो.' },
        { title: 'जेवणानंतर सरळ बसा', instructions: 'जेवणानंतर 45 मिनिटे झोपू नका.', benefit: 'ॲसिडिटी वर येणे थांबते.' }
      ],
      cough_throat: [
        { title: 'मिठाच्या पाण्याच्या गुळण्या', instructions: 'दिवसातून 3 वेळा कोमट मिठाच्या पाण्याने गुळण्या करा.', benefit: 'कफ आणि घशाची सूज कमी होते.' },
        { title: 'झोपण्यापूर्वी वाफ घ्या', instructions: 'झोपण्यापूर्वी 5–10 मिनिटे वाफ घ्या.', benefit: 'कोरडा खोकला शांत होतो.' }
      ],
      body_ache: [
        { title: 'कोमट शेक व पुरेशी झोप', instructions: 'दुखणाऱ्या स्नायूंना गरम पिशवीने शेक द्या व 8 तास झोप घ्या.', benefit: 'ताठरपणा कमी होतो.' },
        { title: 'गरम सूप व पाणी', instructions: 'गरम डाळीचे सूप व भरपूर पाणी प्या.', benefit: 'अशक्तपणा दूर होऊन ऊर्जा मिळते.' }
      ]
    }
  },

  bn: {
    summaries: {
      emergency: (rf) => `জরুরি চিকিৎসা প্রয়োজন: আপনার উত্তরে গুরুতর সতর্কতামূলক লক্ষণ (${rf}) পাওয়া গেছে। অবিলম্বে নিকটস্থ হাসপাতালের জরুরি বিভাগে যান।`,
      severe: () => 'আজই ডাক্তার দেখান: আপনার লক্ষণগুলো গুরুতর এবং কয়েক ঘণ্টার মধ্যে সরাসরি ডাক্তারের পরীক্ষা প্রয়োজন।',
      moderate: () => 'পর্যবেক্ষণসহ যত্ন: সাধারণ যত্নে লক্ষণ সামলানো যায়, তবে ২৪–৪৮ ঘণ্টার মধ্যে উন্নতি না হলে ডাক্তার দেখান।',
      mild: () => 'মৃদু লক্ষণ (নিরাপদ ঘরোয়া যত্ন): এটি গুরুতর সমস্যা নয়। নিচের আসল OTC পণ্য, জল পান ও বিশ্রাম যথেষ্ট।'
    },
    observations: {
      highPain: 'তীব্র ব্যথা/অস্বস্তি (৯–১০/১০) জানানো হয়েছে।',
      modPain: 'মাঝারি অস্বস্তি যা দৈনন্দিন কাজে বাধা দিচ্ছে।',
      rapidProgress: 'লক্ষণ দ্রুত বাড়ছে।',
      impairedDaily: 'দৈনন্দিন কাজ করতে বেশ অসুবিধা হচ্ছে।',
      pediatricParacetamol: 'শিশু রোগী: ওজন অনুযায়ী Calpol সিরাপ (১০–১৫ mg/kg) দিন। অ্যাসপিরিন দেবেন না।',
      frequentVomiting: 'বারবার বমির কথা জানানো হয়েছে — অল্প অল্প করে Electral ORS পান করুন।'
    },
    redFlags: {
      defaultFlag: 'গুরুতর সতর্কতামূলক লক্ষণ',
      noFluids: 'ক্রমাগত বমির কারণে তরল পেটে থাকছে না।',
      highFever: 'তীব্র জ্বরের জন্য সরাসরি ডাক্তারের পর্যবেক্ষণ প্রয়োজন।',
      thunderclap: 'হঠাৎ তীব্র মাথাব্যথার জন্য জরুরি পরীক্ষা প্রয়োজন।',
      nonBlanching: 'চাপ দিলেও না মোছা বেগুনি দাগের জন্য দ্রুত হাসপাতালে যান।',
      blisters: 'পুঁজ বা জল ভরা ফোস্কার জন্য চিকিৎসকের পরীক্ষা জরুরি।',
      deepCut: 'গভীর কাটা বা রক্তপাত বন্ধ না হলে ৬–৮ ঘণ্টার মধ্যে চিকিৎসা প্রয়োজন।'
    },
    products: {
      calpol120: {
        name: 'Calpol 120mg/5ml পেডিয়াট্রিক সিরাপ (GSK — প্যারাসিটামল)',
        category: 'শিশুদের জ্বর ও ব্যথার সিরাপ',
        dosageGuide: 'ওজন অনুযায়ী (১০–১৫ mg/kg) প্রতি ৪–৬ ঘণ্টায় মাপার ক্যাপ দিয়ে দিন। দিনে সর্বোচ্চ ৪ বার।',
        childDosageNote: 'বোতলের ওজন চার্ট বা শিশু চিকিৎসকের পরামর্শ অনুযায়ী দিন।',
        safetyCaution: 'প্যারাসিটামলযুক্ত অন্য সর্দি-কাশির ওষুধের সাথে দেবেন না।',
        typicalUse: 'শিশুদের জ্বর ও ব্যথা নিরাপদে কমায়।',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      calpol250: {
        name: 'Calpol 250mg/5ml পেডিয়াট্রিক সিরাপ (GSK)',
        category: 'বড় শিশুদের জ্বর/ব্যথার ওষুধ',
        dosageGuide: 'হালকা খাবারের পর প্রতি ৪–৬ ঘণ্টায় ওজন অনুযায়ী দিন।',
        childDosageNote: 'সঠিক মাত্রার জন্য শিশুর ওজন যাচাই করুন।',
        safetyCaution: '২৪ ঘণ্টায় ৪ বারের বেশি দেবেন না।',
        typicalUse: 'বড় শিশুদের গা ব্যথা ও জ্বর কমায়।',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      dolo650: {
        name: 'Dolo 650mg ট্যাবলেট (Micro Labs — প্যারাসিটামল IP)',
        category: 'জ্বর ও ব্যথা নাশক ট্যাবলেট',
        dosageGuide: 'হালকা খাবারের পর প্রতি ৬–৮ ঘণ্টায় ১টি ট্যাবলেট জল দিয়ে খান। দিনে সর্বোচ্চ ৩–৪টি।',
        safetyCaution: 'অ্যালকোহল ও অন্য প্যারাসিটামল ট্যাবলেট এড়িয়ে চলুন।',
        typicalUse: 'জ্বর, কাঁপুনি এবং শরীরের ব্যথা কমায়।',
        preferredQuantity: 2,
        unitLabel: 'tablet'
      },
      crocin500: {
        name: 'Crocin Advance 500mg ট্যাবলেট (GSK — প্যারাসিটামল IP)',
        category: 'দ্রুত কার্যকর ব্যথা নাশক ট্যাবলেট',
        dosageGuide: 'হালকা খাবারের পর ১ গ্লাস জলের সাথে ১টি ট্যাবলেট নিন। প্রয়োজনে ৬ ঘণ্টা পর।',
        safetyCaution: 'নিরাপদ প্রথম পছন্দ; ২৪ ঘণ্টায় ৪টির বেশি নয়।',
        typicalUse: 'মাথাব্যথা, চাপ ও হালকা জ্বর দ্রুত কমায়।',
        preferredQuantity: 2,
        unitLabel: 'tablet'
      },
      brufen400: {
        name: 'Brufen 400mg ট্যাবলেট (Abbott — আইবুপ্রোফেন IP)',
        category: 'প্রদাহ ও ব্যথা নাশক (NSAID)',
        dosageGuide: 'খাবারের পরপরই ১টি ট্যাবলেট প্রচুর জল দিয়ে খান। প্রয়োজনে ৮ ঘণ্টা পর।',
        safetyCaution: 'গর্ভাবস্থা, আলসার, কিডনি রোগ বা NSAID অ্যালার্জিতে খাবেন না।',
        typicalUse: 'মাইগ্রেন ও পেশির ব্যথায় উপশম।',
        preferredQuantity: 1,
        unitLabel: 'tablet'
      },
      electralOrs: {
        name: 'Electral WHO ORS পাউডার প্যাকেট ২১.৮ গ্রাম (FDC Ltd)',
        category: 'WHO ওরাল রিহাইড্রেশন পাউডার',
        dosageGuide: '১টি সম্পূর্ণ প্যাকেট ১ লিটার পরিষ্কার পানীয় জলে গুলে সারা দিন অল্প অল্প করে পান করুন।',
        safetyCaution: 'তৈরি করা জল ২৪ ঘণ্টার মধ্যে ব্যবহার করুন। মেশানোর পর ফোটাবেন না।',
        typicalUse: 'জ্বর, দুর্বলতা বা পাতলা পায়খানায় শরীরের লবণ ও জলের ঘাটতি পূরণ করে।',
        preferredQuantity: 1,
        unitLabel: 'sachet'
      },
      cetzine10: {
        name: 'Cetzine 10mg ট্যাবলেট (GSK — সেটিরিজিন IP)',
        category: 'অ্যান্টি-অ্যালার্জি ট্যাবলেট',
        dosageGuide: 'রাতে ঘুমানোর আগে ১টি ট্যাবলেট জল দিয়ে খান।',
        childDosageNote: '২–১২ বছরের শিশুদের জন্য Cetzine সিরাপ (২.৫–৫ মিলি দিনে একবার) ব্যবহার করুন।',
        safetyCaution: 'সামান্য ঘুম পেতে পারে; খাওয়ার পর গাড়ি চালাবেন না।',
        typicalUse: 'হাঁচি, সর্দি, চোখ দিয়ে জল পড়া ও ত্বকের অ্যালার্জি চুলকানি বন্ধ করে।',
        preferredQuantity: 1,
        unitLabel: 'tablet'
      },
      otrivinSaline: {
        name: 'Otrivin Breathe Clean স্যালাইন নেসাল স্প্রে (GSK — 0.9% NaCl)',
        category: 'ওষুধ-মুক্ত স্যালাইন নাকের স্প্রে',
        dosageGuide: 'বন্ধ নাক খুলতে দিনে ৩–৪ বার দুই নাকে ২টি করে স্প্রে করুন।',
        safetyCaution: '১০০% নিরাপদ; শিশু, বয়স্ক এবং গর্ভাবস্থাতেও নিরাপদ।',
        typicalUse: 'নাক পরিষ্কার করে, অ্যালার্জি ধুয়ে ফেলে এবং গলার অস্বস্তি কমায়।',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      candidPowder: {
        name: 'Candid ডাস্টিং পাউডার ১০০ গ্রাম (Glenmark — ক্লোট্রিমাজোল ১%)',
        category: 'অ্যান্টিফাঙ্গাল মেডিকেটেড পাউডার',
        dosageGuide: 'আক্রান্ত স্থান ধুয়ে ভালোভাবে শুকিয়ে সকাল ও রাতে দিনে ২ বার হালকাভাবে Candid পাউডার লাগান।',
        safetyCaution: 'শুধুমাত্র বাহ্যিক ব্যবহারের জন্য। চোখ, মুখ ও খোলা ক্ষত থেকে দূরে রাখুন।',
        typicalUse: 'ঘামের র‍্যাশ, ফাঙ্গাল চুলকানি, ঘামাচি এবং লাল দাগ সারায়।',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      caladrylLotion: {
        name: 'Caladryl স্কিন অ্যালার্জি লোশন (Piramal — ক্যালামাইন)',
        category: 'শীতল অ্যান্টি-ইচ লোশন',
        dosageGuide: 'বোতল ভালোভাবে ঝাঁকিয়ে পরিষ্কার তুলো দিয়ে দিনে ২–৩ বার লাগান।',
        safetyCaution: 'শুধুমাত্র বাহ্যিক ব্যবহারের জন্য। খোলা ক্ষতে লাগাবেন না।',
        typicalUse: 'চুলকানি, আমবাত, পোকার কামড় ও অ্যালার্জিতে আরাম দেয়।',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      betadineOintment: {
        name: 'Betadine 5% পোভিডোন-আয়োডিন মলম ১৫ গ্রাম (Win-Medicare)',
        category: 'অ্যান্টিসেপটিক মলম',
        dosageGuide: 'ক্ষত জল দিয়ে ধুয়ে শুকিয়ে ব্যান্ডেজের আগে দিনে ১–২ বার লাগান।',
        safetyCaution: 'আয়োডিন অ্যালার্জি থাকলে ব্যবহার করবেন না।',
        typicalUse: 'ছোট কাটা ও ছড়ে যাওয়া স্থানে সংক্রমণ প্রতিরোধ করে।',
        preferredQuantity: 1,
        unitLabel: 'tube'
      },
      bandAidStrips: {
        name: 'Band-Aid ওয়াশপ্রুফ অ্যান্টিসেপটিক স্ট্রিপস (Johnson & Johnson)',
        category: 'জীবাণুমুক্ত ক্ষত ড্রেসিং',
        dosageGuide: 'পরিষ্কার ক্ষতে লাগান; ভিজে বা নোংরা হলে বদলে দিন।',
        safetyCaution: 'ক্ষত শুকোতে শুরু করলে খোলা বাতাসে রাখুন।',
        typicalUse: 'ছোট ক্ষতকে ধুলো, জল ও ঘর্ষণ থেকে রক্ষা করে।',
        preferredQuantity: 1,
        unitLabel: 'pack'
      },
      enoPowder: {
        name: 'ENO ফ্রুট সল্ট অ্যান্টাসিড পাউডার প্যাকেট ৫ গ্রাম (GSK)',
        category: 'দ্রুত অ্যাসিডিটি ও গ্যাস উপশম পাউডার',
        dosageGuide: '১ গ্লাস ঠান্ডা জলে ১টি প্যাকেট গুলে খাবারের পর সাথে সাথে পান করুন।',
        safetyCaution: '২৪ ঘণ্টায় ২টির বেশি খাবেন না। উচ্চ রক্তচাপ বা কিডনি রোগে এড়িয়ে চলুন।',
        typicalUse: 'কয়েক সেকেন্ডে অ্যাসিডিটি, বুকজ্বালা ও গ্যাস কমায়।',
        preferredQuantity: 1,
        unitLabel: 'sachet'
      },
      strepsils: {
        name: 'Strepsils হানি অ্যান্ড লেমন লজেন্স (Reckitt)',
        category: 'গলা ব্যথা ও কাশির লজেন্স',
        dosageGuide: 'প্রতি ৩–৪ ঘণ্টায় ১টি লজেন্স মুখে ধীরে ধীরে চুষুন।',
        childDosageNote: '৫ বছরের কম শিশুকে দেবেন না (Dabur Honitus সিরাপ ব্যবহার করুন)।',
        safetyCaution: '১ বছরের কম শিশুকে মধু দেবেন না।',
        typicalUse: 'গলা খুসখুস ও শুকনো কাশি কমায়।',
        preferredQuantity: 1,
        unitLabel: 'pack'
      }
    },
    simpleTips: [
      'শরীর হাইড্রেটেড রাখতে পরিষ্কার জল, Electral ORS বা হালকা গরম পানীয় পান করুন।',
      'পর্যাপ্ত বিশ্রাম নিন এবং অতিরিক্ত স্ক্রিন বা পরিশ্রম এড়িয়ে চলুন।',
      '৪৮ ঘণ্টার মধ্যে উন্নতি না হলে নিকটস্থ চিকিৎসকের পরামর্শ নিন।'
    ],
    remedies: {
      fever: [
        { title: 'হালকা গরম জলে স্পঞ্জিং', instructions: 'কপাল ও ঘাড় হালকা গরম জলে ভেজা কাপড় দিয়ে মুছুন।', benefit: 'কাঁপুনি ছাড়াই শরীর ঠান্ডা হয়।' },
        { title: 'Electral ORS ও ডাবের জল', instructions: 'নিয়মিত ORS বা ডাবের জল পান করুন।', benefit: 'লবণ ও জলের ঘাটতি পূরণ হয়।' },
        { title: 'হালকা সুতির পোশাক', instructions: 'ঢিলে সুতির জামা পরুন ও খোলামেলা ঘরে থাকুন।', benefit: 'শরীরের তাপ সহজে বের হয়।' }
      ],
      headache: [
        { title: 'অন্ধকার শান্ত ঘরে বিশ্রাম', instructions: 'আলো কমিয়ে ৩০ মিনিট স্ক্রিন থেকে দূরে বিশ্রাম নিন।', benefit: 'স্নায়ুর চাপ কমে।' },
        { title: 'কপালে ঠান্ডা পট্টি', instructions: '১৫ মিনিট কপালে ঠান্ডা ভেজা কাপড় রাখুন।', benefit: 'ব্যথার তীব্রতা কমে।' },
        { title: 'পর্যাপ্ত জল পান', instructions: 'ধীরে ধীরে ৫০০ মিলি জল পান করুন।', benefit: 'ডিহাইড্রেশনজনিত মাথাব্যথা সারে।' }
      ],
      cold_sneezing: [
        { title: 'গরম জলের ভাপ', instructions: 'দিনে দুবার ৫–১০ মিনিট ভাপ নিন।', benefit: 'বন্ধ নাক খুলে যায়।' },
        { title: 'নুন জলে গার্গল', instructions: 'হালকা গরম জলে আধা চামচ নুন দিয়ে গার্গল করুন।', benefit: 'গলার প্রদাহ কমে।' },
        { title: 'আদা-মধু চা', instructions: 'হালকা গরম জলে আদা ও মধু মিশিয়ে খান (১+ বছর)।', benefit: 'গলায় আরাম দেয়।' }
      ],
      skin_rash: [
        { title: 'ঠান্ডা জলের সেঁক', instructions: 'Candid পাউডার দেওয়ার আগে ১০ মিনিট ঠান্ডা কাপড়ে সেঁক দিন।', benefit: 'চুলকানি কমে।' },
        { title: 'ত্বক শুকনো রাখুন ও সুতির পোশাক', instructions: 'স্নানের পর ভালোভাবে মুছে হালকা সুতির জামা পরুন।', benefit: 'ঘাম ও ফাঙ্গাস জমে না।' },
        { title: 'নখ ছোট রাখুন', instructions: 'নখ কেটে রাখুন এবং চুলকানো থেকে বিরত থাকুন।', benefit: 'সংক্রমণ ছড়ায় না।' }
      ],
      small_cuts: [
        { title: 'পরিষ্কার কাপড়ে চাপ', instructions: '৫–১০ মিনিট পরিষ্কার গজ দিয়ে চেপে ধরুন।', benefit: 'রক্তপাত বন্ধ হয়।' },
        { title: 'পরিষ্কার জলে ধোয়া', instructions: '২–৩ মিনিট কলের পরিষ্কার জলে ধুয়ে নিন।', benefit: 'ময়লা পরিষ্কার হয়।' },
        { title: 'হাত উঁচু করে রাখা', instructions: 'ক্ষত স্থান কিছুটা উঁচুতে রাখুন।', benefit: 'ফোলা ও ব্যথা কমে।' }
      ],
      stomach_upset: [
        { title: 'হালকা নরম খাবার', instructions: 'মসলাদার খাবার এড়িয়ে খিচুড়ি বা দই-ভাত খান।', benefit: 'পাকস্থলীতে আরাম দেয়।' },
        { title: 'খাওয়ার পর সোজা বসা', instructions: 'খাওয়ার পর ৪৫ মিনিট শুয়ে পড়বেন না।', benefit: 'অ্যাসিড রিফ্লাক্স কমে।' }
      ],
      cough_throat: [
        { title: 'নুন-গরম জলে গার্গল', instructions: 'দিনে ৩ বার গার্গল করুন।', benefit: 'গলার ফোলা ও কফ কমে।' },
        { title: 'ঘুমানোর আগে ভাপ', instructions: 'রাতে ৫–১০ মিনিট ভাপ নিন।', benefit: 'শুকনো কাশি কমে।' }
      ],
      body_ache: [
        { title: 'গরম সেঁক ও বিশ্রাম', instructions: 'ব্যথার জায়গায় গরম সেঁক দিন ও ৮ ঘণ্টা ঘুমান।', benefit: 'পেশির ক্লান্তি দূর হয়।' },
        { title: 'গরম স্যুপ ও জল', instructions: 'ডালের স্যুপ ও পর্যাপ্ত জল পান করুন।', benefit: 'শক্তি ও আর্দ্রতা ফেরে।' }
      ]
    }
  },

  ta: {
    summaries: {
      emergency: (rf) => `உடனடி அவசர சிகிச்சை தேவை: உங்கள் பதில்களில் தீவிர எச்சரிக்கை அறிகுறிகள் (${rf}) உள்ளன. உடனே அருகிலுள்ள அவசர சிகிச்சை பிரிவுக்கு செல்லவும்.`,
      severe: () => 'இன்றே மருத்துவர் பரிசோதனை அவசியம்: உங்கள் அறிகுறிகள் தீவிரமாக உள்ளன; சில மணி நேரத்திற்குள் மருத்துவரை நேரில் அணுகவும்.',
      moderate: () => 'கண்காணிப்புடன் பராமரிப்பு: அடிப்படை பராமரிப்பில் குறையலாம்; ஆனால் 24–48 மணி நேரத்தில் முன்னேற்றம் இல்லாவிட்டால் மருத்துவரை சந்திக்கவும்.',
      mild: () => 'லேசான அறிகுறிகள் (பாதுகாப்பான வீட்டு பராமரிப்பு): இது தீவிர பிரச்சனை அல்ல. கீழே உள்ள உண்மையான OTC மருந்து/பவுடர், நீர் மற்றும் ஓய்வு போதுமானது.'
    },
    observations: {
      highPain: 'அதிக வலி/சிரமம் (9–10/10) பதிவாகியுள்ளது.',
      modPain: 'அன்றாட வேலைகளை பாதிக்கும் மிதமான சிரமம்.',
      rapidProgress: 'அறிகுறிகள் குறையாமல் வேகமாக அதிகரிக்கின்றன.',
      impairedDaily: 'வழக்கமான வேலைகளை செய்வதில் அதிக சிரமம்.',
      pediatricParacetamol: 'குழந்தை நோயாளி: எடைக்கேற்ப Calpol சிரப் (10–15 mg/kg) மட்டுமே தரவும். Aspirin கொடுக்காதீர்கள்.',
      frequentVomiting: 'அடிக்கடி வாந்தி — சிறிது சிறிதாக Electral ORS குடிக்கவும்.'
    },
    redFlags: {
      defaultFlag: 'தீவிர எச்சரிக்கை அறிகுறி',
      noFluids: 'தொடர் வாந்தியால் திரவங்கள் வயிற்றில் தங்கவில்லை.',
      highFever: 'அதிக காய்ச்சலுக்கு நேரடி மருத்துவர் கண்காணிப்பு அவசியம்.',
      thunderclap: 'திடீர் கடுமையான தலைவலிக்கு உடனடி அவசர பரிசோதனை தேவை.',
      nonBlanching: 'அழுத்தினாலும் மறையாத ஊதா புள்ளிகளுக்கு உடனே மருத்துவமனை செல்லவும்.',
      blisters: 'சீழ் அல்லது நீர் நிரம்பிய கொப்புளங்களுக்கு மருத்துவர் பரிசோதனை தேவை.',
      deepCut: 'ஆழமான வெட்டு அல்லது நிற்காத இரத்தப்போக்கு 6–8 மணி நேரத்தில் தையல்/சிகிச்சை தேவை.'
    },
    products: {
      calpol120: {
        name: 'Calpol 120mg/5ml குழந்தைகள் சிரப் (GSK — பாராசிட்டமால்)',
        category: 'குழந்தைகள் காய்ச்சல் & வலி நிவாரணி சிரப்',
        dosageGuide: 'எடைக்கேற்ப (10–15 mg/kg) 4–6 மணி நேரத்திற்கு ஒருமுறை அளவு மூடியால் தரவும். நாளொன்றுக்கு அதிகபட்சம் 4 வேளை.',
        childDosageNote: 'பாட்டிலில் உள்ள எடை அட்டவணை அல்லது குழந்தைகள் மருத்துவர் ஆலோசனைப்படி தரவும்.',
        safetyCaution: 'பாராசிட்டமால் உள்ள மற்ற சளி மருந்துகளுடன் சேர்க்காதீர்கள்.',
        typicalUse: 'குழந்தைகளின் காய்ச்சல் மற்றும் உடல் வலியை பாதுகாப்பாக குறைக்கும்.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      calpol250: {
        name: 'Calpol 250mg/5ml குழந்தைகள் சிரப் (GSK)',
        category: 'குழந்தைகள் வலி & காய்ச்சல் மருந்து',
        dosageGuide: 'லேசான உணவுக்குப் பின் 4–6 மணி நேரத்திற்கு ஒருமுறை எடைக்கேற்ப தரவும்.',
        childDosageNote: 'கொடுக்கும் முன் குழந்தையின் எடையை சரிபார்க்கவும்.',
        safetyCaution: '24 மணி நேரத்தில் 4 வேளைக்கு மேல் தராதீர்கள்.',
        typicalUse: 'வளர்ந்த குழந்தைகளின் உடல் வலி மற்றும் காய்ச்சலை குறைக்கும்.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      dolo650: {
        name: 'Dolo 650mg மாத்திரை (Micro Labs — பாராசிட்டமால் IP)',
        category: 'காய்ச்சல் & வலி நிவாரணி மாத்திரை',
        dosageGuide: 'லேசான உணவுக்குப் பின் 6–8 மணி நேரத்திற்கு 1 மாத்திரை தண்ணீருடன் எடுக்கவும். நாளொன்றுக்கு அதிகபட்சம் 3–4.',
        safetyCaution: 'மது மற்றும் மற்ற பாராசிட்டமால் மாத்திரைகளை தவிர்க்கவும்.',
        typicalUse: 'காய்ச்சல், குளிர் மற்றும் உடல் வலியை குறைக்கும்.',
        preferredQuantity: 2,
        unitLabel: 'tablet'
      },
      crocin500: {
        name: 'Crocin Advance 500mg மாத்திரை (GSK — பாராசிட்டமால் IP)',
        category: 'விரைவு வலி நிவாரணி மாத்திரை',
        dosageGuide: 'லேசான உணவுக்குப் பின் 1 கிளாஸ் தண்ணீருடன் 1 மாத்திரை எடுக்கவும். தேவைப்பட்டால் 6 மணி நேரம் கழித்து.',
        safetyCaution: 'பாதுகாப்பான முதல் மருந்து; 24 மணி நேரத்தில் 4 மாத்திரைக்கு மேல் எடுக்காதீர்கள்.',
        typicalUse: 'தலைவலி, நெற்றி அழுத்தம் மற்றும் லேசான காய்ச்சலுக்கு விரைவு நிவாரணம்.',
        preferredQuantity: 2,
        unitLabel: 'tablet'
      },
      brufen400: {
        name: 'Brufen 400mg மாத்திரை (Abbott — ஐபுப்ரோஃபென் IP)',
        category: 'வீக்கம் & வலி நிவாரணி (NSAID)',
        dosageGuide: 'உணவுக்குப் பிறகு மட்டுமே 1 மாத்திரை அதிக தண்ணீருடன் எடுக்கவும். தேவைப்பட்டால் 8 மணி நேரம் கழித்து.',
        safetyCaution: 'கர்ப்பம், வயிற்றுப் புண், சிறுநீரக பிரச்சனை அல்லது NSAID அலர்ஜி இருந்தால் தவிர்க்கவும்.',
        typicalUse: 'ஒற்றைத் தலைவலி மற்றும் தசை வீக்கத்தை குறைக்கும்.',
        preferredQuantity: 1,
        unitLabel: 'tablet'
      },
      electralOrs: {
        name: 'Electral WHO ORS பவுடர் பாக்கெட் 21.8g (FDC Ltd)',
        category: 'WHO உப்பு-சர்க்கரை கரைசல் பவுடர்',
        dosageGuide: '1 முழு பாக்கெட்டை 1 லிட்டர் சுத்தமான குடிநீரில் கரைத்து நாள் முழுவதும் சிறிது சிறிதாக குடிக்கவும்.',
        safetyCaution: 'தயாரித்த நீரை 24 மணி நேரத்திற்குள் குடிக்கவும். கலந்த பின் கொதிக்க வைக்காதீர்கள்.',
        typicalUse: 'காய்ச்சல், சோர்வு அல்லது வயிற்றுப்போக்கின் போது நீர்ச்சத்து மற்றும் உப்புகளை ஈடுசெய்யும்.',
        preferredQuantity: 1,
        unitLabel: 'sachet'
      },
      cetzine10: {
        name: 'Cetzine 10mg மாத்திரை (GSK — செட்டிரிசைன் IP)',
        category: 'அலர்ஜி தடுப்பு மாத்திரை',
        dosageGuide: 'இரவு தூங்கும் முன் 1 மாத்திரை தண்ணீருடன் எடுக்கவும்.',
        childDosageNote: '2–12 வயது குழந்தைகளுக்கு Cetzine சிரப் (2.5ml–5ml நாளொன்றுக்கு 1 முறை) பயன்படுத்தவும்.',
        safetyCaution: 'லேசான தூக்கம் வரலாம்; வாகனம் ஓட்டுவதை தவிர்க்கவும்.',
        typicalUse: 'தொடர் தும்மல், மூக்கொழுகுதல், கண் நீர் மற்றும் தோல் அலர்ஜி அரிப்பை நிறுத்தும்.',
        preferredQuantity: 1,
        unitLabel: 'tablet'
      },
      otrivinSaline: {
        name: 'Otrivin Breathe Clean சலைன் நாசி ஸ்ப்ரே (GSK — 0.9% NaCl)',
        category: 'மருந்தற்ற உப்புநீர் மூக்கு ஸ்ப்ரே',
        dosageGuide: 'மூக்கடைப்பை நீக்க தினமும் 3–4 முறை இரு நாசிகளிலும் 2 ஸ்ப்ரே செய்யவும்.',
        safetyCaution: '100% பாதுகாப்பானது; குழந்தைகள், முதியவர் மற்றும் கர்ப்பிணிகளுக்கும் ஏற்றது.',
        typicalUse: 'மூக்கடைப்பு நீக்கி, அலர்ஜி தூசுகளை சுத்தம் செய்து தொண்டை சளியை குறைக்கும்.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      candidPowder: {
        name: 'Candid டஸ்டிங் பவுடர் 100g (Glenmark — குளோட்ரிமாசோல் 1%)',
        category: 'பூஞ்சை எதிர்ப்பு மருத்துவ பவுடர்',
        dosageGuide: 'பாதிக்கப்பட்ட இடத்தை கழுவி நன்கு உலர்த்திய பின் காலை, இரவு என இருவேளை Candid பவுடர் தூவவும்.',
        safetyCaution: 'வெளிப்புற பயன்பாட்டிற்கு மட்டுமே. கண், வாய் மற்றும் திறந்த காயங்களில் படாமல் பார்த்துக்கொள்ளவும்.',
        typicalUse: 'வியர்வைத் தடிப்பு, பூஞ்சை அரிப்பு, வேர்க்குரு மற்றும் சிவந்த தடிப்புகளை குணமாக்கும்.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      caladrylLotion: {
        name: 'Caladryl தோல் அலர்ஜி லோஷன் (Piramal — காலமைன்)',
        category: 'குளிர்ச்சி தரும் அரிப்பு நீக்கி லோஷன்',
        dosageGuide: 'பாட்டிலை நன்கு குலுக்கி சுத்தமான பஞ்சால் தினமும் 2–3 முறை தடவவும்.',
        safetyCaution: 'வெளிப்புற சருமத்திற்கு மட்டும். திறந்த காயங்களில் தடவாதீர்கள்.',
        typicalUse: 'கடும் அரிப்பு, பூச்சி கடி மற்றும் சிவந்த தடிப்புகளுக்கு குளிர்ச்சி தரும்.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      betadineOintment: {
        name: 'Betadine 5% போவிடோன்-அயோடின் களிம்பு 15g (Win-Medicare)',
        category: 'கிருமி நாசினி களிம்பு',
        dosageGuide: 'காயத்தை நீரில் கழுவி உலர்த்தி தினமும் 1–2 முறை மெல்லியதாக தடவவும்.',
        safetyCaution: 'அயோடின் அலர்ஜி இருந்தால் தவிர்க்கவும்.',
        typicalUse: 'சிறு வெட்டு மற்றும் சிராய்ப்புகளில் கிருமித் தொற்றை தடுக்கும்.',
        preferredQuantity: 1,
        unitLabel: 'tube'
      },
      bandAidStrips: {
        name: 'Band-Aid வாஷ்புரூஃப் கிருமி நாசினி பட்டைகள் (Johnson & Johnson)',
        category: 'காயப் பாதுகாப்பு பேண்டேஜ்',
        dosageGuide: 'சுத்தமான காயத்தின் மீது ஒட்டவும்; நனைந்தால் மாற்றவும்.',
        safetyCaution: 'காயம் ஆறத் தொடங்கியதும் காற்றுப் பட விடவும்.',
        typicalUse: 'சிறு காயங்களை தூசி மற்றும் தண்ணீரிலிருந்து பாதுகாக்கும்.',
        preferredQuantity: 1,
        unitLabel: 'pack'
      },
      enoPowder: {
        name: 'ENO ஃப்ரூட் சால்ட் அமில நீக்கி பவுடர் 5g (GSK)',
        category: 'விரைவு அசிடிட்டி & வாயு நிவாரணி பவுடர்',
        dosageGuide: '1 கிளாஸ் குளிர்ந்த நீரில் 1 பாக்கெட்டை கரைத்து உணவுக்குப் பின் உடனே குடிக்கவும்.',
        safetyCaution: '24 மணி நேரத்தில் 2 பாக்கெட்டுக்கு மேல் எடுக்காதீர்கள். உயர் ரத்த அழுத்தம்/சிறுநீரக நோயாளிகள் தவிர்க்கவும்.',
        typicalUse: 'நெஞ்செரிச்சல், அசிடிட்டி மற்றும் வயிறு உப்புசத்தை நொடிகளில் குறைக்கும்.',
        preferredQuantity: 1,
        unitLabel: 'sachet'
      },
      strepsils: {
        name: 'Strepsils தேன் & எலுமிச்சை தொண்டை மாத்திரைகள் (Reckitt)',
        category: 'தொண்டை வலி நிவாரணி லோசென்ஜஸ்',
        dosageGuide: '3–4 மணி நேரத்திற்கு 1 மாத்திரையை வாயில் மெதுவாக சப்பவும்.',
        childDosageNote: '5 வயதுக்குட்பட்ட குழந்தைகளுக்கு தராதீர்கள் (Dabur Honitus சிரப் பயன்படுத்தவும்).',
        safetyCaution: '1 வயதுக்குட்பட்ட குழந்தைகளுக்கு தேன் கொடுக்காதீர்கள்.',
        typicalUse: 'தொண்டை கரகரப்பு மற்றும் வறட்டு இருமலை தணிக்கும்.',
        preferredQuantity: 1,
        unitLabel: 'pack'
      }
    },
    simpleTips: [
      'உடலில் நீர்ச்சத்து குறையாமல் இருக்க சுத்தமான நீர், Electral ORS குடிக்கவும்.',
      'போதுமான ஓய்வு எடுக்கவும்; மொபைல் திரை மற்றும் கடின உழைப்பைத் தவிர்க்கவும்.',
      '48 மணி நேரத்தில் குணமாகாவிட்டால் அருகிலுள்ள மருத்துவரை அணுகவும்.'
    ],
    remedies: {
      fever: [
        { title: 'இளஞ்சூடான நீர் ஒத்தடம்', instructions: 'நெற்றி மற்றும் கழுத்தை இளஞ்சூடான நீரில் நனைத்த துணியால் துடைக்கவும்.', benefit: 'நடுக்கமின்றி உடல் சூட்டை குறைக்கும்.' },
        { title: 'Electral ORS / இளநீர்', instructions: 'தொடர்ந்து ORS அல்லது இளநீர் குடிக்கவும்.', benefit: 'இழந்த உப்பு மற்றும் நீர்ச்சத்தை மீட்கும்.' },
        { title: 'மெல்லிய பருத்தி உடை', instructions: 'தளர்வான பருத்தி உடை அணிந்து காற்றோட்டமான அறையில் இருக்கவும்.', benefit: 'வெப்பம் தேங்குவதை தடுக்கும்.' }
      ],
      headache: [
        { title: 'இருண்ட அமைதியான அறையில் ஓய்வு', instructions: 'விளக்குகளை குறைத்து 30 நிமிடம் ஓய்வெடுக்கவும்.', benefit: 'நரம்பு அழுத்தத்தை குறைக்கும்.' },
        { title: 'குளிர்ந்த நெற்றி ஒத்தடம்', instructions: '15 நிமிடம் குளிர்ந்த ஈரத்துணியை நெற்றியில் வைக்கவும்.', benefit: 'வலியை தணிக்கும்.' },
        { title: 'நீர் அருந்துதல்', instructions: 'மெதுவாக 500ml நீர் குடிக்கவும்.', benefit: 'நீர்வறட்சி தலைவலியை குறைக்கும்.' }
      ],
      cold_sneezing: [
        { title: 'சூடான நீராவி பிடித்தல்', instructions: 'தினமும் இருமுறை 5–10 நிமிடம் ஆவி பிடிக்கவும்.', benefit: 'மூக்கடைப்பை நீக்கும்.' },
        { title: 'உப்பு நீர் கொப்பளித்தல்', instructions: 'இளஞ்சூடான நீரில் 1/2 ஸ்பூன் உப்பு கலந்து கொப்பளிக்கவும்.', benefit: 'தொண்டை வீக்கத்தை குறைக்கும்.' },
        { title: 'இஞ்சி-தேன் வெந்நீர்', instructions: 'இஞ்சி மற்றும் தேன் கலந்த வெந்நீர் அருந்தவும் (1 வயதுக்கு மேல்).', benefit: 'தொண்டைக்கு இதம் தரும்.' }
      ],
      skin_rash: [
        { title: 'குளிர்ந்த நீர் ஒத்தடம்', instructions: 'Candid பவுடர் பூசும் முன் 10 நிமிடம் குளிர்ந்த துணியால் ஒத்தடம் கொடுக்கவும்.', benefit: 'அரிப்பை உடனே தணிக்கும்.' },
        { title: 'சருமத்தை உலர்வாக வைக்கவும்', instructions: 'குளித்த பின் நன்கு துடைத்து பருத்தி ஆடை அணியவும்.', benefit: 'பூஞ்சை வளர்ச்சியை தடுக்கும்.' },
        { title: 'சொறிவதை தவிர்க்கவும்', instructions: 'நகங்களை வெட்டி சுத்தமாக வைக்கவும்.', benefit: 'தோல் தொற்றை தடுக்கும்.' }
      ],
      small_cuts: [
        { title: 'நேரடி அழுத்தம்', instructions: 'சுத்தமான துணியால் 5–10 நிமிடம் அழுத்தி பிடிக்கவும்.', benefit: 'இரத்தப்போக்கை நிறுத்தும்.' },
        { title: 'ஓடும் நீரில் கழுவுதல்', instructions: '2–3 நிமிடம் குழாய் நீரில் மெதுவாக கழுவவும்.', benefit: 'அழுக்கை அகற்றும்.' },
        { title: 'காயத்தை உயர்த்தி வைத்தல்', instructions: 'காயம்பட்ட கையை சற்று உயர்த்தி வைக்கவும்.', benefit: 'வீக்கத்தை குறைக்கும்.' }
      ],
      stomach_upset: [
        { title: 'லேசான உணவு (கஞ்சி / தயிர் சாதம்)', instructions: 'காரமில்லாத எளிய உணவை சிறிது சிறிதாக சாப்பிடவும்.', benefit: 'வயிற்றுக்கு இதம் தரும்.' },
        { title: 'உணவுக்குப் பின் நிமிர்ந்து இருங்கள்', instructions: 'சாப்பிட்ட 45 நிமிடங்களுக்கு படுக்க வேண்டாம்.', benefit: 'நெஞ்செரிச்சலை தடுக்கும்.' }
      ],
      cough_throat: [
        { title: 'உப்பு நீர் கொப்பளித்தல்', instructions: 'தினமும் 3 முறை வெதுவெதுப்பான உப்பு நீரில் கொப்பளிக்கவும்.', benefit: 'தொண்டை சளியை நீக்கும்.' },
        { title: 'இரவு ஆவி பிடித்தல்', instructions: 'தூங்கும் முன் 5–10 நிமிடம் ஆவி பிடிக்கவும்.', benefit: 'வறட்டு இருமலை தணிக்கும்.' }
      ],
      body_ache: [
        { title: 'வெந்நீர் ஒத்தடம் & ஓய்வு', instructions: 'வலிக்கும் இடத்தில் சூடான ஒத்தடம் கொடுத்து 8 மணி நேரம் தூங்கவும்.', benefit: 'தசை இறுக்கத்தை தளர்த்தும்.' },
        { title: 'சூடான சூப் & நீர்', instructions: 'பருப்பு சூப் மற்றும் நீர் அருந்தவும்.', benefit: 'சக்தி தரும்.' }
      ]
    }
  },

  te: {
    summaries: {
      emergency: (rf) => `తక్షణ అత్యవసర వైద్యం అవసరం: మీ సమాధానాలలో తీవ్రమైన హెచ్చరిక లక్షణాలు (${rf}) ఉన్నాయి. దయచేసి వెంటనే సమీప ఆసుపత్రి అత్యవసర విభాగానికి వెళ్ళండి.`,
      severe: () => 'ఈ రోజే వైద్యుడిని సంప్రదించాలి: మీ లక్షణాలు తీవ్రంగా ఉన్నాయి; కొన్ని గంటల్లోనే వైద్యుడిని నేరుగా కలవాలి.',
      moderate: () => 'పర్యవేక్షణతో సంరక్షణ: ప్రాథమిక సంరక్షణతో తగ్గవచ్చు, కానీ 24–48 గంటల్లో తగ్గకపోతే వైద్యుడిని కలవండి.',
      mild: () => 'తేలికపాటి లక్షణాలు (సురక్షిత ఇంటి సంరక్షణ): ఇది తీవ్రమైన సమస్య కాదు. క్రింది అసలు OTC మందు/పౌడర్, నీరు మరియు విశ్రాంతి సరిపోతాయి.'
    },
    observations: {
      highPain: 'అధిక నొప్పి/అసౌకర్యం (9–10/10) నమోదైంది.',
      modPain: 'రోజువారీ పనులను ప్రభావితం చేసే మధ్యస్థ అసౌకర్యం.',
      rapidProgress: 'లక్షణాలు తగ్గకుండా వేగంగా పెరుగుతున్నాయి.',
      impairedDaily: 'రోజువారీ పనులు చేయడంలో తీవ్ర ఇబ్బంది.',
      pediatricParacetamol: 'పిల్లల రోగి: బరువు ప్రకారం Calpol సిరప్ (10–15 mg/kg) మాత్రమే ఇవ్వండి. Aspirin ఇవ్వకండి.',
      frequentVomiting: 'తరచుగా వాంతులు — కొద్ది కొద్దిగా Electral ORS తాగించండి.'
    },
    redFlags: {
      defaultFlag: 'ప్రమాదకర హెచ్చరిక లక్షణం',
      noFluids: 'వరుస వాంతుల వల్ల నీరు కడుపులో నిలవడం లేదు.',
      highFever: 'అధిక జ్వరానికి వైద్యుల ప్రత్యక్ష పర్యవేక్షణ అవసరం.',
      thunderclap: 'అకస్మాత్తుగా వచ్చిన తీవ్ర తలనొప్పికి వెంటనే ER పరీక్ష అవసరం.',
      nonBlanching: 'నొక్కినా పోని ఊదా మచ్చలకు వెంటనే ఆసుపత్రికి వెళ్ళండి.',
      blisters: 'చీము లేదా నీటితో కూడిన బొబ్బలకు వైద్యుల పరీక్ష అవసరం.',
      deepCut: 'లోతైన గాయం లేదా ఆగని రక్తస్రావానికి 6–8 గంటల్లో చికిత్స అవసరం.'
    },
    products: {
      calpol120: {
        name: 'Calpol 120mg/5ml పీడియాట్రిక్ సిరప్ (GSK — పారాసిటమాల్)',
        category: 'పిల్లల జ్వరం & నొప్పి సిరప్',
        dosageGuide: 'బరువు ప్రకారం (10–15 mg/kg) ప్రతి 4–6 గంటలకు కొలత క్యాప్‌తో ఇవ్వండి. 24 గంటల్లో గరిష్టంగా 4 సార్లు.',
        childDosageNote: 'బాటిల్‌పై ఉన్న బరువు పట్టిక లేదా పిల్లల వైద్యుడి సలహా ప్రకారం ఇవ్వండి.',
        safetyCaution: 'పారాసిటమాల్ ఉన్న ఇతర జలుబు సిరప్‌లతో కలిపి ఇవ్వకండి.',
        typicalUse: 'పిల్లలలో జ్వరం మరియు నొప్పులను సురక్షితంగా తగ్గిస్తుంది.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      calpol250: {
        name: 'Calpol 250mg/5ml పీడియాట్రిక్ సిరప్ (GSK)',
        category: 'పెద్ద పిల్లల జ్వరం & నొప్పి మందు',
        dosageGuide: 'తేలికపాటి ఆహారం తర్వాత ప్రతి 4–6 గంటలకు బరువు ప్రకారం ఇవ్వండి.',
        childDosageNote: 'ఇచ్చే ముందు పిల్లల బరువు సరిచూసుకోండి.',
        safetyCaution: '24 గంటల్లో 4 మోతాదుల కంటే ఎక్కువ ఇవ్వకండి.',
        typicalUse: 'పెద్ద పిల్లలలో ఒళ్ళు నొప్పులు మరియు జ్వరాన్ని తగ్గిస్తుంది.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      dolo650: {
        name: 'Dolo 650mg టాబ్లెట్ (Micro Labs — పారాసిటమాల్ IP)',
        category: 'జ్వరం & నొప్పి నివారణ టాబ్లెట్',
        dosageGuide: 'తేలికపాటి ఆహారం తర్వాత ప్రతి 6–8 గంటలకు 1 టాబ్లెట్ నీటితో వేసుకోండి. రోజుకు గరిష్టంగా 3–4.',
        safetyCaution: 'మద్యం మరియు ఇతర పారాసిటమాల్ టాబ్లెట్లను కలిపి తీసుకోకండి.',
        typicalUse: 'జ్వరం, చలి మరియు ఒళ్ళు నొప్పులను తగ్గిస్తుంది.',
        preferredQuantity: 2,
        unitLabel: 'tablet'
      },
      crocin500: {
        name: 'Crocin Advance 500mg టాబ్లెట్ (GSK — పారాసిటమాల్ IP)',
        category: 'త్వరిత నొప్పి నివారణ టాబ్లెట్',
        dosageGuide: 'తేలికపాటి అల్పాహారం తర్వాత 1 గ్లాసు నీటితో 1 టాబ్లెట్ వేసుకోండి. అవసరమైతే 6 గంటల తర్వాత.',
        safetyCaution: 'సురక్షిత మొదటి ఎంపిక; 24 గంటల్లో 4 కంటే ఎక్కువ వేసుకోకండి.',
        typicalUse: 'తలనొప్పి, నుదుటి ఒత్తిడి మరియు తేలికపాటి జ్వరానికి వేగవంతమైన ఉపశమనం.',
        preferredQuantity: 2,
        unitLabel: 'tablet'
      },
      brufen400: {
        name: 'Brufen 400mg టాబ్లెట్ (Abbott — ఇబుప్రోఫెన్ IP)',
        category: 'వాపు & నొప్పి నివారణ (NSAID)',
        dosageGuide: 'భోజనం తర్వాత మాత్రమే 1 టాబ్లెట్ నీటితో వేసుకోండి. అవసరమైతే 8 గంటల తర్వాత.',
        safetyCaution: 'గర్భధారణ, కడుపు అల్సర్, కిడ్నీ సమస్య లేదా NSAID అలర్జీ ఉంటే వాడకండి.',
        typicalUse: 'మైగ్రేన్ మరియు కండరాల వాపు నొప్పిని తగ్గిస్తుంది.',
        preferredQuantity: 1,
        unitLabel: 'tablet'
      },
      electralOrs: {
        name: 'Electral WHO ORS పౌడర్ ప్యాకెట్ 21.8g (FDC Ltd)',
        category: 'WHO ఓరల్ రీహైడ్రేషన్ పౌడర్',
        dosageGuide: '1 పూర్తి ప్యాకెట్‌ను 1 లీటరు శుభ్రమైన త్రాగునీటిలో కలిపి రోజంతా కొద్దికొద్దిగా తాగండి.',
        safetyCaution: 'కలిపిన నీటిని 24 గంటల్లోపు తాగాలి. కలిపిన తర్వాత మరిగించకండి.',
        typicalUse: 'జ్వరం, నీరసం లేదా విరేచనాలలో లవణాలు మరియు నీటి లోటును భర్తీ చేస్తుంది.',
        preferredQuantity: 1,
        unitLabel: 'sachet'
      },
      cetzine10: {
        name: 'Cetzine 10mg టాబ్లెట్ (GSK — సెటిరిజైన్ IP)',
        category: 'యాంటీ-అలర్జీ టాబ్లెట్',
        dosageGuide: 'రాత్రి పడుకునే ముందు 1 టాబ్లెట్ నీటితో వేసుకోండి.',
        childDosageNote: '2–12 ఏళ్ల పిల్లలకు Cetzine సిరప్ (2.5ml–5ml రోజుకు 1 సారి) వాడండి.',
        safetyCaution: 'కొంచెం నిద్ర రావచ్చు; వాహనాలు నడపకండి.',
        typicalUse: 'తుమ్ములు, ముక్కు కారడం, కళ్ళలో నీరు మరియు చర్మ అలర్జీ దురదను ఆపుతుంది.',
        preferredQuantity: 1,
        unitLabel: 'tablet'
      },
      otrivinSaline: {
        name: 'Otrivin Breathe Clean సెలైన్ నాసల్ స్ప్రే (GSK — 0.9% NaCl)',
        category: 'మందు-లేని సెలైన్ ముక్కు స్ప్రే',
        dosageGuide: 'మూసుకుపోయిన ముక్కు తెరుచుకోవడానికి రోజుకు 3–4 సార్లు రెండు రంధ్రాలలో 2 స్ప్రేలు చేయండి.',
        safetyCaution: '100% సురక్షితం; పిల్లలు, వృద్ధులు, గర్భిణీలకు కూడా క్షేమకరం.',
        typicalUse: 'ముక్కు దిబ్బడను శుభ్రం చేసి, గొంతు కఫాన్ని తగ్గిస్తుంది.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      candidPowder: {
        name: 'Candid డస్టింగ్ పౌడర్ 100g (Glenmark — క్లోట్రిమజోల్ 1%)',
        category: 'యాంటీఫంగల్ మెడికేటెడ్ పౌడర్',
        dosageGuide: 'చర్మాన్ని కడిగి పూర్తిగా ఆరబెట్టిన తర్వాత ఉదయం, రాత్రి 2 సార్లు Candid పౌడర్ చల్లండి.',
        safetyCaution: 'బాహ్య వినియోగానికి మాత్రమే. కళ్ళు, నోరు మరియు తెరిచిన గాయాల వద్ద వాడకండి.',
        typicalUse: 'చెమట పొక్కులు, ఫంగల్ దురద, వేడి పొక్కులు మరియు ఎరుపును తగ్గిస్తుంది.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      caladrylLotion: {
        name: 'Caladryl స్కిన్ అలర్జీ లోషన్ (Piramal — కాలమైన్)',
        category: 'చల్లదనం ఇచ్చే దురద లోషన్',
        dosageGuide: 'బాటిల్‌ను బాగా కదిపి శుభ్రమైన దూదితో రోజుకు 2–3 సార్లు రాయండి.',
        safetyCaution: 'బాహ్య చర్మానికి మాత్రమే. తెరిచిన గాయాలపై రాయకండి.',
        typicalUse: 'తీవ్రమైన దురద, దద్దుర్లు మరియు పురుగు కాటుపై చల్లదనం ఇస్తుంది.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      betadineOintment: {
        name: 'Betadine 5% పోవిడోన్-అయోడిన్ ఆయింట్‌మెంట్ 15g (Win-Medicare)',
        category: 'యాంటీసెప్టిక్ గాయాల లేపనం',
        dosageGuide: 'గాయాన్ని శుభ్రమైన నీటితో కడిగి ఆరిన తర్వాత రోజుకు 1–2 సార్లు పలుచగా రాయండి.',
        safetyCaution: 'అయోడిన్ అలర్జీ ఉంటే వాడకండి.',
        typicalUse: 'చిన్న కోతలు మరియు గీతలలో ఇన్ఫెక్షన్ రాకుండా కాపాడుతుంది.',
        preferredQuantity: 1,
        unitLabel: 'tube'
      },
      bandAidStrips: {
        name: 'Band-Aid వాష్‌ప్రూఫ్ యాంటీసెప్టిక్ స్ట్రిప్స్ (Johnson & Johnson)',
        category: 'స్టెరైల్ గాయాల పట్టీ',
        dosageGuide: 'శుభ్రమైన గాయంపై అంటించండి; తడిసినా లేదా మురికి అయినా మార్చండి.',
        safetyCaution: 'గాయం మానడం మొదలయ్యాక గాలి తగలనివ్వండి.',
        typicalUse: 'చిన్న గాయాలను దుమ్ము మరియు నీటి నుండి రక్షిస్తుంది.',
        preferredQuantity: 1,
        unitLabel: 'pack'
      },
      enoPowder: {
        name: 'ENO ఫ్రూట్ సాల్ట్ యాంటాసిడ్ పౌడర్ ప్యాకెట్ 5g (GSK)',
        category: 'త్వరిత అసిడిటీ & గ్యాస్ పౌడర్',
        dosageGuide: '1 గ్లాసు చల్లని నీటిలో 1 ప్యాకెట్ కలిపి భోజనం తర్వాత వెంటనే తాగండి.',
        safetyCaution: '24 గంటల్లో 2 ప్యాకెట్లకు మించి వాడకండి. అధిక BP/కిడ్నీ సమస్యలలో వద్దు.',
        typicalUse: 'అసిడిటీ, ఛాతీ మంట మరియు గ్యాస్ నుండి క్షణాల్లో ఉపశమనం.',
        preferredQuantity: 1,
        unitLabel: 'sachet'
      },
      strepsils: {
        name: 'Strepsils హనీ & లెమన్ గొంతు బిళ్ళలు (Reckitt)',
        category: 'గొంతు నొప్పి ఉపశమన లోజెంజెస్',
        dosageGuide: 'ప్రతి 3–4 గంటలకు 1 బిళ్ళను నోటిలో నెమ్మదిగా చప్పరించండి.',
        childDosageNote: '5 ఏళ్ల లోపు పిల్లలకు గట్టి బిళ్ళలు ఇవ్వకండి (Dabur Honitus సిరప్ వాడండి).',
        safetyCaution: '1 ఏడాది లోపు శిశువుకు తేనె ఇవ్వకండి.',
        typicalUse: 'గొంతు గరగర మరియు పొడి దగ్గును తగ్గిస్తుంది.',
        preferredQuantity: 1,
        unitLabel: 'pack'
      }
    },
    simpleTips: [
      'శరీరంలో నీటి శాతం తగ్గకుండా శుభ్రమైన నీరు, Electral ORS తాగండి.',
      'తగినంత విశ్రాంతి తీసుకోండి; స్క్రీన్ సమయం మరియు శ్రమ తగ్గించండి.',
      '48 గంటల్లో మెరుగుదల లేకపోతే సమీప వైద్యుడిని సంప్రదించండి.'
    ],
    remedies: {
      fever: [
        { title: 'గోరువెచ్చని నీటి తుడవడం', instructions: 'నుదురు మరియు మెడపై గోరువెచ్చని నీటి గుడ్డతో సున్నితంగా తుడవండి.', benefit: 'చలి లేకుండా వేడి తగ్గుతుంది.' },
        { title: 'Electral ORS / కొబ్బరి నీరు', instructions: 'తరచుగా ORS లేదా కొబ్బరి నీరు తాగండి.', benefit: 'లవణాలు మరియు నీరు అందుతాయి.' },
        { title: 'తేలికపాటి కాటన్ దుస్తులు', instructions: 'వదులైన కాటన్ దుస్తులు ధరించి గాలి వచ్చే గదిలో ఉండండి.', benefit: 'వేడి బయటకు పోతుంది.' }
      ],
      headache: [
        { title: 'చీకటి నిశ్శబ్ద గదిలో విశ్రాంతి', instructions: 'లైట్లు తగ్గించి 30 నిమిషాలు స్క్రీన్ లేకుండా విశ్రాంతి తీసుకోండి.', benefit: 'నరాల ఒత్తిడి తగ్గుతుంది.' },
        { title: 'చల్లని తడి గుడ్డ', instructions: '15 నిమిషాలు నుదుటిపై చల్లని గుడ్డ ఉంచండి.', benefit: 'నొప్పి తీవ్రత తగ్గుతుంది.' },
        { title: 'నీరు తాగండి', instructions: 'నెమ్మదిగా 500ml నీరు తాగండి.', benefit: 'డీహైడ్రేషన్ తలనొప్పి తగ్గుతుంది.' }
      ],
      cold_sneezing: [
        { title: 'వేడి నీటి ఆవిరి', instructions: 'రోజుకు రెండుసార్లు 5–10 నిమిషాలు ఆవిరి పట్టండి.', benefit: 'ముక్కు దిబ్బడ వదులుతుంది.' },
        { title: 'గోరువెచ్చని ఉప్పు నీటి పుక్కిలింత', instructions: 'గోరువెచ్చని నీటిలో అర చెంచా ఉప్పు వేసి పుక్కిలించండి.', benefit: 'గొంతు వాపు తగ్గుతుంది.' },
        { title: 'అల్లం-తేనె వేడి నీరు', instructions: 'అల్లం, తేనెతో వేడి నీరు తాగండి (1 ఏడాది పైబడిన వారు).', benefit: 'గొంతుకు హాయిగా ఉంటుంది.' }
      ],
      skin_rash: [
        { title: 'చల్లని నీటి అద్దుడు', instructions: 'Candid పౌడర్ చల్లే ముందు 10 నిమిషాలు చల్లని గుడ్డతో అద్దండి.', benefit: 'దురద వెంటనే తగ్గుతుంది.' },
        { title: 'చర్మం పొడిగా ఉంచి కాటన్ ధరించండి', instructions: 'స్నానం తర్వాత పొడిగా తుడిచి వదులు కాటన్ దుస్తులు వేసుకోండి.', benefit: 'చెమట మరియు ఫంగస్ పెరగదు.' },
        { title: 'గోకడం మానండి', instructions: 'గోర్లు చిన్నగా కత్తిరించుకోండి.', benefit: 'చర్మం ఇన్ఫెక్షన్ రాదు.' }
      ],
      small_cuts: [
        { title: 'శుభ్రమైన గుడ్డతో ఒత్తిడి', instructions: '5–10 నిమిషాలు శుభ్రమైన గాజుగుడ్డతో గట్టిగా పట్టుకోండి.', benefit: 'రక్తస్రావం ఆగుతుంది.' },
        { title: 'నీటితో కడగడం', instructions: '2–3 నిమిషాలు శుభ్రమైన నీటి కింద కడగండి.', benefit: 'దుమ్ము పోతుంది.' },
        { title: 'పైకి ఎత్తి ఉంచడం', instructions: 'గాయమైన చేయి లేదా వేలును కాస్త పైకి ఉంచండి.', benefit: 'వాపు తగ్గుతుంది.' }
      ],
      stomach_upset: [
        { title: 'తేలికపాటి మెత్తని ఆహారం', instructions: 'కారం లేని కిచిడీ లేదా పెరుగు అన్నం కొద్దిగా తినండి.', benefit: 'కడుపుకు ఉపశమనం ఇస్తుంది.' },
        { title: 'భోజనం తర్వాత నిటారుగా కూర్చోండి', instructions: 'తిన్న 45 నిమిషాల వరకు పడుకోకండి.', benefit: 'అసిడిటీ తగ్గుతుంది.' }
      ],
      cough_throat: [
        { title: 'ఉప్పు నీటి పుక్కిలింత', instructions: 'రోజుకు 3 సార్లు గోరువెచ్చని ఉప్పు నీటితో పుక్కిలించండి.', benefit: 'గొంతు కఫం తగ్గుతుంది.' },
        { title: 'రాత్రి ఆవిరి పట్టండి', instructions: 'పడుకునే ముందు 5–10 నిమిషాలు ఆవిరి తీసుకోండి.', benefit: 'పొడి దగ్గు తగ్గుతుంది.' }
      ],
      body_ache: [
        { title: 'వేడి కాపడం & నిద్ర', instructions: 'నొప్పి ఉన్న కండరాలపై వెచ్చని కాపడం పెట్టి 8 గంటలు నిద్రపోండి.', benefit: 'కండరాల బిగుతు తగ్గుతుంది.' },
        { title: 'వేడి సూప్ & నీరు', instructions: 'పప్పు సూప్ మరియు తగినంత నీరు తాగండి.', benefit: 'శక్తిని అందిస్తుంది.' }
      ]
    }
  },

  gu: {
    summaries: {
      emergency: (rf) => `તાત્કાલિક કટોકટી સારવાર જરૂરી: તમારા જવાબોમાં ગંભીર ચેતવણી ચિહ્નો (${rf}) મળ્યા છે. કૃપા કરીને તરત નજીકની હોસ્પિટલના ઇમરજન્સી વિભાગમાં જાઓ.`,
      severe: () => 'આજે જ ડોક્ટરની તપાસ જરૂરી: તમારા લક્ષણો ગંભીર છે; થોડા કલાકોમાં ડોક્ટરને રૂબરૂ બતાવવું જરૂરી છે.',
      moderate: () => 'દેખરેખ સાથે સંભાળ: સામાન્ય સંભાળથી લક્ષણો સંભાળી શકાય છે, પરંતુ 24–48 કલાકમાં સુધારો ન થાય તો ડોક્ટરને મળો.',
      mild: () => 'હળવા લક્ષણો (ઘરે સુરક્ષિત સંભાળ): આ ગંભીર સમસ્યા નથી. નીચે સૂચવેલ અસલી OTC દવા/પાવડર, પાણી અને આરામ પૂરતા છે.'
    },
    observations: {
      highPain: 'વધુ પડતી પીડા/તકલીફ (9–10/10) જણાવેલ છે.',
      modPain: 'મધ્યમ તકલીફ જે દૈનિક કામને અસર કરે છે.',
      rapidProgress: 'લક્ષણો ઘટવાને બદલે ઝડપથી વધી રહ્યા છે.',
      impairedDaily: 'રોજિંદા કાર્યો કરવામાં મુશ્કેલી.',
      pediatricParacetamol: 'બાળ દર્દી: વજન મુજબ જ Calpol સિરપ (10–15 mg/kg) આપો. Aspirin ક્યારેય ન આપો.',
      frequentVomiting: 'વારંવાર ઉલટી જણાવેલ છે — થોડું થોડું Electral ORS પીવો.'
    },
    redFlags: {
      defaultFlag: 'ગંભીર ચેતવણી લક્ષણ',
      noFluids: 'સતત ઉલટીને કારણે પ્રવાહી પેટમાં ટકતું નથી.',
      highFever: 'વધુ તાવ માટે ડોક્ટરની સીધી તપાસ જરૂરી છે.',
      thunderclap: 'અચાનક થયેલા તીવ્ર માથાના દુખાવા માટે તરત ER તપાસ જરૂરી.',
      nonBlanching: 'દબાવવાથી ન જતા જાંબલી ડાઘ માટે તરત હોસ્પિટલ જાઓ.',
      blisters: 'પરુ કે પાણી ભરેલા ફોલ્લા માટે ડોક્ટરની તપાસ જરૂરી.',
      deepCut: 'ઊંડા ઘા અથવા અટકતા ન હોય તેવા રક્તસ્ત્રાવ માટે 6–8 કલાકમાં સારવાર જરૂરી.'
    },
    products: {
      calpol120: {
        name: 'Calpol 120mg/5ml પીડિયાટ્રિક સિરપ (GSK — પેરાસીટામોલ)',
        category: 'બાળકોના તાવ અને દુખાવાનો સિરપ',
        dosageGuide: 'વજન મુજબ (10–15 mg/kg) દર 4–6 કલાકે માપન ઢાંકણથી આપો. દિવસમાં વધુમાં વધુ 4 ડોઝ.',
        childDosageNote: 'બોટલ પરના વજન ચાર્ટ અથવા બાળરોગ નિષ્ણાત મુજબ આપો.',
        safetyCaution: 'પેરાસીટામોલ ધરાવતા અન્ય શરદીના સિરપ સાથે ન આપો.',
        typicalUse: 'બાળકોમાં તાવ અને દુખાવામાં સુરક્ષિત રાહત.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      calpol250: {
        name: 'Calpol 250mg/5ml પીડિયાટ્રિક સિરપ (GSK)',
        category: 'મોટા બાળકો માટે તાવ અને દુખાવાની દવા',
        dosageGuide: 'હળવા ખોરાક પછી દર 4–6 કલાકે વજન મુજબ આપો.',
        childDosageNote: 'આપતા પહેલા બાળકનું વજન ચકાસો.',
        safetyCaution: '24 કલાકમાં 4 ડોઝથી વધુ ન આપો.',
        typicalUse: 'મોટા બાળકોમાં શરીરનો દુખાવો અને તાવ ઘટાડે છે.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      dolo650: {
        name: 'Dolo 650mg ટેબ્લેટ (Micro Labs — પેરાસીટામોલ IP)',
        category: 'તાવ અને દુખાવાની ટેબ્લેટ',
        dosageGuide: 'હળવા ખોરાક પછી દર 6–8 કલાકે 1 ગોળી પાણી સાથે લો. 24 કલાકમાં વધુમાં વધુ 3–4 ગોળી.',
        safetyCaution: 'દારૂ અને અન્ય પેરાસીટામોલ ગોળીઓ સાથે લેવાનું ટાળો.',
        typicalUse: 'તાવ, ધ્રુજારી અને શરીરનો દુખાવો ઘટાડે છે.',
        preferredQuantity: 2,
        unitLabel: 'tablet'
      },
      crocin500: {
        name: 'Crocin Advance 500mg ટેબ્લેટ (GSK — પેરાસીટામોલ IP)',
        category: 'ઝડપી અસર કરતી દુખાવાની ગોળી',
        dosageGuide: 'હળવા નાસ્તા પછી 1 ગ્લાસ પાણી સાથે 1 ગોળી લો. જરૂર પડ્યે 6 કલાક પછી.',
        safetyCaution: 'સુરક્ષિત પ્રથમ વિકલ્પ; 24 કલાકમાં 4 ગોળીથી વધુ ન લો.',
        typicalUse: 'માથાનો દુખાવો, કપાળનો તણાવ અને હળવા તાવમાં ઝડપી રાહત.',
        preferredQuantity: 2,
        unitLabel: 'tablet'
      },
      brufen400: {
        name: 'Brufen 400mg ટેબ્લેટ (Abbott — આઇબુપ્રોફેન IP)',
        category: 'સોજા અને દુખાવાની દવા (NSAID)',
        dosageGuide: 'જમ્યા પછી જ 1 ગોળી પૂરતા પાણી સાથે લો. જરૂર પડ્યે દર 8 કલાકે.',
        safetyCaution: 'ગર્ભાવસ્થા, પેટમાં અલ્સર, કિડની તકલીફ કે NSAID એલર્જીમાં ન લો.',
        typicalUse: 'માઇગ્રેન અને સ્નાયુના સોજામાં રાહત.',
        preferredQuantity: 1,
        unitLabel: 'tablet'
      },
      electralOrs: {
        name: 'Electral WHO ORS પાવડર પાઉચ 21.8g (FDC Ltd)',
        category: 'WHO ઓરલ રિહાઇડ્રેશન પાવડર',
        dosageGuide: '1 પૂરું પાઉચ 1 લીટર ચોખ્ખા પીવાના પાણીમાં ઓગાળી આખો દિવસ થોડું થોડું પીવો.',
        safetyCaution: 'તૈયાર પાણી 24 કલાકમાં વાપરો. ભેળવ્યા પછી ઉકાળવું નહીં.',
        typicalUse: 'તાવ, નબળાઈ કે ઝાડામાં ક્ષાર અને પાણીની કમી પૂરી કરે છે.',
        preferredQuantity: 1,
        unitLabel: 'sachet'
      },
      cetzine10: {
        name: 'Cetzine 10mg ટેબ્લેટ (GSK — સેટિરિઝિન IP)',
        category: 'એન્ટી-એલર્જી ટેબ્લેટ',
        dosageGuide: 'રાત્રે સૂતા પહેલા 1 ગોળી પાણી સાથે લો.',
        childDosageNote: '2–12 વર્ષના બાળકો માટે Cetzine સિરપ (2.5ml–5ml દિવસમાં એકવાર) વાપરો.',
        safetyCaution: 'થોડી ઊંઘ આવી શકે; લીધા પછી વાહન ન ચલાવો.',
        typicalUse: 'છીંકો, વહેતું નાક, આંખમાંથી પાણી અને ચામડીની એલર્જી ખંજવાળ અટકાવે છે.',
        preferredQuantity: 1,
        unitLabel: 'tablet'
      },
      otrivinSaline: {
        name: 'Otrivin Breathe Clean સલાઇન નેઝલ સ્પ્રે (GSK — 0.9% NaCl)',
        category: 'દવા-મુક્ત સલાઇન નાક સ્પ્રે',
        dosageGuide: 'બંધ નાક ખોલવા દિવસમાં 3–4 વાર બંને નસકોરામાં 2-2 સ્પ્રે કરો.',
        safetyCaution: '100% સુરક્ષિત; બાળકો, વૃદ્ધો અને ગર્ભવતી મહિલાઓ માટે પણ યોગ્ય.',
        typicalUse: 'નાકની બ્લોકેજ સાફ કરે છે અને ગળાની ખરાશ ઘટાડે છે.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      candidPowder: {
        name: 'Candid ડસ્ટિંગ પાવડર 100g (Glenmark — ક્લોટ્રિમાઝોલ 1%)',
        category: 'એન્ટીફંગલ મેડિકેટેડ પાવડર',
        dosageGuide: 'અસરગ્રસ્ત ભાગ ધોઈને બરાબર સૂકવો, પછી સવાર-સાંજ 2 વાર Candid પાવડર છાંટો.',
        safetyCaution: 'ફક્ત બાહ્ય ઉપયોગ માટે. આંખ, મોં અને ખુલ્લા ઘાથી દૂર રાખો.',
        typicalUse: 'પરસેવાના દાણા, ફંગલ ખંજવાળ, અળાઈ અને લાલ ચકામા મટાડે છે.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      caladrylLotion: {
        name: 'Caladryl સ્કિન એલર્જી લોશન (Piramal — કેલામાઇન)',
        category: 'ઠંડક આપતું ખંજવાળ વિરોધી લોશન',
        dosageGuide: 'બોટલ બરાબર હલાવી સ્વચ્છ રૂથી દિવસમાં 2–3 વાર લગાવો.',
        safetyCaution: 'ફક્ત બાહ્ય ચામડી માટે. ખુલ્લા ઘા પર ન લગાવો.',
        typicalUse: 'તીવ્ર ખંજવાળ, જીવડાં કરડવા અને એલર્જીમાં ઠંડક આપે છે.',
        preferredQuantity: 1,
        unitLabel: 'bottle'
      },
      betadineOintment: {
        name: 'Betadine 5% પોવિડોન-આયોડિન મલમ 15g (Win-Medicare)',
        category: 'એન્ટીસેપ્ટિક ઘા મલમ',
        dosageGuide: 'ઘા પાણીથી ધોઈ સૂકવીને પાટો બાંધતા પહેલા દિવસમાં 1–2 વાર લગાવો.',
        safetyCaution: 'આયોડિનની એલર્જી હોય તો ન વાપરો.',
        typicalUse: 'નાના કાપા અને ઉઝરડામાં ચેપ રોકે છે.',
        preferredQuantity: 1,
        unitLabel: 'tube'
      },
      bandAidStrips: {
        name: 'Band-Aid વોશપ્રૂફ એન્ટીસેપ્ટિક સ્ટ્રીપ્સ (Johnson & Johnson)',
        category: 'જંતુરહિત ઘા પટ્ટી',
        dosageGuide: 'ચોખ્ખા ઘા પર લગાવો; ભીની કે ગંદી થાય તો બદલો.',
        safetyCaution: 'ઘા રુઝાવા લાગે ત્યારે ખુલ્લી હવા લાગવા દો.',
        typicalUse: 'નાના ઘાને ધૂળ, પાણી અને ઘસારાથી બચાવે છે.',
        preferredQuantity: 1,
        unitLabel: 'pack'
      },
      enoPowder: {
        name: 'ENO ફ્રૂટ સોલ્ટ એન્ટાસિડ પાવડર પાઉચ 5g (GSK)',
        category: 'ઝડપી એસિડિટી અને ગેસ પાવડર',
        dosageGuide: '1 ગ્લાસ ઠંડા પાણીમાં 1 પાઉચ ઓગાળી જમ્યા પછી તરત પીવો.',
        safetyCaution: '24 કલાકમાં 2 પાઉચથી વધુ ન લો. હાઈ BP કે કિડની રોગમાં ટાળો.',
        typicalUse: 'એસિડિટી, છાતીમાં બળતરા અને ગેસમાં સેકંડોમાં રાહત.',
        preferredQuantity: 1,
        unitLabel: 'sachet'
      },
      strepsils: {
        name: 'Strepsils હની એન્ડ લેમન ગોળીઓ (Reckitt)',
        category: 'ગળાની ખરાશ માટે લોઝેન્જેસ',
        dosageGuide: 'દર 3–4 કલાકે 1 ગોળી મોંમાં ધીમે ધીમે ચૂસો.',
        childDosageNote: '5 વર્ષથી નાના બાળકોને ન આપો (Dabur Honitus સિરપ વાપરો).',
        safetyCaution: '1 વર્ષથી નાના બાળકને મધ ન આપો.',
        typicalUse: 'ગળાની ખરાશ અને સૂકી ઉધરસ શાંત કરે છે.',
        preferredQuantity: 1,
        unitLabel: 'pack'
      }
    },
    simpleTips: [
      'શરીરને હાઇડ્રેટ રાખવા ચોખ્ખું પાણી, Electral ORS કે હુંફાળું પ્રવાહી પીવો.',
      'પૂરતો આરામ કરો અને સ્ક્રીન કે ભારે શારીરિક શ્રમ ટાળો.',
      '48 કલાકમાં સુધારો ન થાય તો નજીકના ડોક્ટરની સલાહ લો.'
    ],
    remedies: {
      fever: [
        { title: 'હુંફાળા પાણીના પોતા', instructions: 'કપાળ અને ગળા પર હુંફાળા પાણીના કપડાથી હળવેથી લૂછો.', benefit: 'ધ્રુજારી વગર તાપમાન ઘટાડે છે.' },
        { title: 'Electral ORS અને નાળિયેર પાણી', instructions: 'નિયમિત ORS કે નાળિયેર પાણી પીવો.', benefit: 'ક્ષાર અને પાણીની કમી પૂરી થાય છે.' },
        { title: 'હળવા સુતરાઉ કપડાં', instructions: 'ઢીલા સુતરાઉ કપડાં પહેરો અને હવાદાર રૂમમાં રહો.', benefit: 'વધારાની ગરમી બહાર નીકળે છે.' }
      ],
      headache: [
        { title: 'અંધારા શાંત રૂમમાં આરામ', instructions: 'લાઈટ ઓછી કરી 30 મિનિટ સ્ક્રીન વગર આરામ કરો.', benefit: 'નસોનો તણાવ ઘટે છે.' },
        { title: 'કપાળ પર ઠંડી પટ્ટી', instructions: '15 મિનિટ કપાળ પર ઠંડુ ભીનું કપડું મૂકો.', benefit: 'દુખાવો શાંત થાય છે.' },
        { title: 'પાણી પીતા રહો', instructions: 'ધીમે ધીમે 500ml પાણી પીવો.', benefit: 'ડિહાઇડ્રેશનથી થતો દુખાવો મટે છે.' }
      ],
      cold_sneezing: [
        { title: 'ગરમ પાણીની વરાળ', instructions: 'દિવસમાં બે વાર 5–10 મિનિટ વરાળ લો.', benefit: 'બંધ નાક ખૂલે છે.' },
        { title: 'મીઠાના પાણીના કોગળા', instructions: 'હુંફાળા પાણીમાં અડધી ચમચી મીઠું નાખી કોગળા કરો.', benefit: 'ગળાનો સોજો ઘટે છે.' },
        { title: 'આદુ-મધનું હુંફાળું પાણી', instructions: 'હુંફાળા પાણીમાં આદુ અને મધ લો (1 વર્ષથી મોટા).', benefit: 'ગળાને આરામ આપે છે.' }
      ],
      skin_rash: [
        { title: 'ઠંડા પાણીનો શેક', instructions: 'Candid પાવડર છાંટતા પહેલા 10 મિનિટ ઠંડા કપડાથી શેક કરો.', benefit: 'ખંજવાળ તરત ઘટે છે.' },
        { title: 'ચામડી સૂકી અને સુતરાઉ કપડાં', instructions: 'નાહ્યા પછી ચામડી બરાબર સૂકવી ઢીલા સુતરાઉ કપડાં પહેરો.', benefit: 'પરસેવો અને ફંગલ ચેપ અટકે છે.' },
        { title: 'ખંજવાળવું ટાળો', instructions: 'નખ નાના રાખો.', benefit: 'ચામડીમાં ચેપ લાગતો અટકે છે.' }
      ],
      small_cuts: [
        { title: 'ચોખ્ખા કપડાથી દબાણ', instructions: '5–10 મિનિટ ચોખ્ખા કપડાથી દબાવી રાખો.', benefit: 'લોહી નીકળતું બંધ થાય છે.' },
        { title: 'ચોખ્ખા પાણીથી ધોવું', instructions: '2–3 મિનિટ નળના પાણી નીચે ધોવો.', benefit: 'ધૂળ અને કચરો સાફ થાય છે.' },
        { title: 'ઘા ઊંચો રાખો', instructions: 'ઈજાગ્રસ્ત હાથ કે આંગળી થોડી ઊંચી રાખો.', benefit: 'સોજો ઘટે છે.' }
      ],
      stomach_upset: [
        { title: 'હળવો નરમ ખોરાક', instructions: 'તીખું ટાળી ખીચડી કે દહીં-ભાત થોડા થોડા ખાવ.', benefit: 'પેટને આરામ મળે છે.' },
        { title: 'જમ્યા પછી સીધા બેસો', instructions: 'જમ્યા પછી 45 મિનિટ સૂવું નહીં.', benefit: 'એસિડિટી અટકે છે.' }
      ],
      cough_throat: [
        { title: 'મીઠાના પાણીના કોગળા', instructions: 'દિવસમાં 3 વાર હુંફાળા મીઠાના પાણીથી કોગળા કરો.', benefit: 'કફ અને સોજો દૂર થાય છે.' },
        { title: 'સૂતા પહેલા વરાળ લો', instructions: 'રાત્રે 5–10 મિનિટ વરાળ લો.', benefit: 'સૂકી ઉધરસમાં રાહત મળે છે.' }
      ],
      body_ache: [
        { title: 'હુંફાળો શેક અને ઊંઘ', instructions: 'દુખતા સ્નાયુઓ પર ગરમ શેક કરી 8 કલાક ઊંઘ લો.', benefit: 'જકડન દૂર થાય છે.' },
        { title: 'ગરમ સૂપ અને પ્રવાહી', instructions: 'દાળનું સૂપ અને પૂરતું પાણી પીવો.', benefit: 'શક્તિ અને સ્ફૂર્તિ પાછી આવે છે.' }
      ]
    }
  }
};

export function toOtcMedicine(p: ProductTranslation): OtcMedicine {
  return {
    name: p.name,
    category: p.category,
    dosageGuide: p.dosageGuide,
    childDosageNote: p.childDosageNote,
    safetyCaution: p.safetyCaution,
    typicalUse: p.typicalUse,
    preferredQuantity: p.preferredQuantity,
    unitLabel: p.unitLabel
  };
}
