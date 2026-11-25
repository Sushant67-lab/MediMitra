import { LanguageCode } from '../context/LanguageContext';

export interface DemoVideoSceneScript {
  id: string;
  durationSec: number;
  chapterTitle: string;
  shortLabel: string;
  subtitle: string;
  voiceover: string;
  highlights: string[];
}

export interface DemoVideoLocaleBundle {
  buttonLabel: string;
  buttonSublabel: string;
  modalTitle: string;
  modalBadge: string;
  playBtn: string;
  pauseBtn: string;
  replayBtn: string;
  muteVoiceBtn: string;
  enableVoiceBtn: string;
  voiceLanguageLabel: string;
  voiceFallbackNotice: string;
  closeBtn: string;
  totalDurationLabel: string;
  scenes: DemoVideoSceneScript[];
}

export const DEMO_VIDEO_TRANSLATIONS: Record<LanguageCode, DemoVideoLocaleBundle> = {
  en: {
    buttonLabel: 'GUIDE',
    buttonSublabel: 'Patient guide + ESP32 guide',
    modalTitle: 'MediMitra Complete Guide: Patient Flow, System & ESP32 Dispenser',
    modalBadge: '2-Minute Animated Walkthrough',
    playBtn: 'Play',
    pauseBtn: 'Pause',
    replayBtn: 'Replay',
    muteVoiceBtn: 'Mute Voice',
    enableVoiceBtn: 'Voice On',
    voiceLanguageLabel: 'Voice Language',
    voiceFallbackNotice: 'Browser speech synthesis active with synchronized captions in your selected language.',
    closeBtn: 'Close Video',
    totalDurationLabel: '02:00',
    scenes: [
      {
        id: 'patient_onboarding',
        durationSec: 20,
        chapterTitle: '01. Patient Check-In & Language Setup',
        shortLabel: 'Patient Intake',
        subtitle: 'Enter patient name, choose Child, Adult, or Senior, select Male or Female, and pick your preferred language.',
        voiceover: 'Welcome to MediMitra. A patient starts by entering their name, choosing Child, Adult, or Senior, and selecting Male or Female. Using the top selector, you can run the entire checkup in English, Hindi, or six other regional languages.',
        highlights: ['Name, Age Group & Sex', '8 Regional Languages', 'Email, Google or Guest Entry']
      },
      {
        id: 'adaptive_triage',
        durationSec: 20,
        chapterTitle: '02. Selecting Symptoms & Smart Q&A',
        shortLabel: 'Smart Questions',
        subtitle: 'Select any health issue. Questions adapt separately for Male, Female, Male-Child, and Female-Child.',
        voiceover: 'Next, pick your health issue, such as fever, cold, or stomach upset. MediMitra asks ten quick questions tailored separately for boys, girls, men, and women. Pregnancy or period checks are asked only when the symptom truly needs them.',
        highlights: ['Male vs Female Flow', 'Boy vs Girl Pediatric Checks', 'Contextual Safety Questions']
      },
      {
        id: 'system_evaluation',
        durationSec: 20,
        chapterTitle: '03. Clinical Engine & Care Recommendation',
        shortLabel: 'System Analysis',
        subtitle: 'Evaluates pain, allergies, and warning signs to suggest safe OTC medicines, home care, or nearby doctors.',
        voiceover: 'Behind the scenes, the clinical engine checks red flag signs, allergies, and prior doses. For mild cases, it suggests safe over-the-counter tablets or powders with home remedies. For urgent warning signs, it directs you straight to nearby doctors.',
        highlights: ['Red-Flag Emergency Screen', 'Safe Dosage Calibration', 'Instant Doctor Locator']
      },
      {
        id: 'cloud_online_sync',
        durationSec: 20,
        chapterTitle: '04. Cloud Sync & Top-Right Online Indicator',
        shortLabel: 'Cloud & Wi-Fi',
        subtitle: 'Confirm dispensing and monitor the live Online/Offline Wi-Fi badge at the top right of the screen.',
        voiceover: 'When you tap Dispense Medicine, the app reserves stock and sends a secure command to the cloud database. At the top right corner, a live Wi-Fi badge turns green and reads Online whenever the dispenser is connected to your mobile hotspot or router.',
        highlights: ['Secure Stock Reservation', 'Real-Time Cloud Queue', 'Live Top-Right Online Badge']
      },
      {
        id: 'esp32_hardware',
        durationSec: 20,
        chapterTitle: '05. Inside the ESP32 Dispenser Module',
        shortLabel: 'ESP32 Module',
        subtitle: 'ESP32 DevKit V1 reads cloud commands via 2.4 GHz Wi-Fi, drives GPIO 18 servo signal, and signals status via GPIO 2 blue LED.',
        voiceover: 'Now look inside the hardware box. The ESP32 module connects to 2.4 gigahertz Wi-Fi and checks the cloud every two point five seconds. An external five-volt power supply feeds the SG90 motor, while GPIO eighteen stays safely at zero volts on boot to prevent twitching.',
        highlights: ['GPIO 18 PWM Control', 'External 5V 2A + Common GND', 'GPIO 2 Blue LED Signals']
      },
      {
        id: 'physical_dispense',
        durationSec: 20,
        chapterTitle: '06. Live 25° Dispense & Confirmation',
        shortLabel: 'Servo Dispense',
        subtitle: 'Servo rotates 0° to 25° for 300ms, returns to 0°, blinks blue LED slowly once, and marks Completed.',
        voiceover: 'Finally, when a dispense command arrives, the ESP32 smoothly rotates the servo horn from zero to twenty-five degrees, holds briefly to drop the medicine, returns to zero, and gives one slow blue LED blink. Your web screen updates immediately to Completed.',
        highlights: ['0° → 25° → 0° Smooth Rotation', '1 Slow Blue LED Blink', 'App Marks Completed']
      }
    ]
  },

  hi: {
    buttonLabel: 'GUIDE',
    buttonSublabel: 'मरीज गाइड + ESP32 सिस्टम',
    modalTitle: 'मेडिमित्रा पूरा गाइड: मरीज उपयोग, सिस्टम और ESP32 डिस्पेंसर',
    modalBadge: '2-मिनट एनिमेटेड वीडियो गाइड',
    playBtn: 'चलाएं',
    pauseBtn: 'रोकें',
    replayBtn: 'फिर देखें',
    muteVoiceBtn: 'आवाज़ बंद',
    enableVoiceBtn: 'आवाज़ चालू',
    voiceLanguageLabel: 'आवाज़ की भाषा',
    voiceFallbackNotice: 'आपकी चुनी हुई भाषा में आवाज़ और नीचे लाइव सबटाइटल चल रहे हैं।',
    closeBtn: 'बंद करें',
    totalDurationLabel: '02:00',
    scenes: [
      {
        id: 'patient_onboarding',
        durationSec: 20,
        chapterTitle: '01. मरीज प्रवेश और भाषा चयन',
        shortLabel: 'मरीज प्रवेश',
        subtitle: 'मरीज का नाम लिखें, बच्चा, वयस्क या वरिष्ठ और पुरुष या महिला चुनें, और अपनी भाषा चुनें।',
        voiceover: 'मेडिमित्रा में आपका स्वागत है। शुरुआत में मरीज अपना नाम दर्ज करता है, बच्चा, वयस्क या वरिष्ठ चुनता है, और पुरुष या महिला का चयन करता है। ऊपर दिए गए विकल्प से आप पूरी जांच हिंदी, अंग्रेजी या आठ भारतीय भाषाओं में चला सकते हैं।',
        highlights: ['नाम, उम्र वर्ग और लिंग', '8 भारतीय भाषाएं', 'ईमेल, गूगल या गेस्ट प्रवेश']
      },
      {
        id: 'adaptive_triage',
        durationSec: 20,
        chapterTitle: '02. समस्या चुनना और स्मार्ट प्रश्न',
        shortLabel: 'स्मार्ट प्रश्न',
        subtitle: 'अपनी तकलीफ चुनें। लड़का, लड़की, पुरुष और महिला के लिए अलग-अलग प्रश्न पूछे जाते हैं।',
        voiceover: 'इसके बाद बुखार, जुकाम या पेट दर्द जैसी अपनी समस्या चुनें। मेडिमित्रा लड़के, लड़की, पुरुष और महिला के अनुसार दस आसान प्रश्न पूछता है। महिलाओं से गर्भावस्था या पीरियड्स के सवाल केवल जरूरत होने पर ही पूछे जाते हैं।',
        highlights: ['पुरुष व महिला अलग जांच', 'लड़का व लड़की अलग प्रश्न', 'केवल जरूरी होने पर विशेष जांच']
      },
      {
        id: 'system_evaluation',
        durationSec: 20,
        chapterTitle: '03. सिस्टम विश्लेषण और दवा सुझाव',
        shortLabel: 'सिस्टम निर्णय',
        subtitle: 'सिस्टम गंभीर संकेत, एलर्जी और खुराक जांच कर सुरक्षित दवा या नजदीकी डॉक्टर सुझाता है।',
        voiceover: 'बैकग्राउंड में क्लिनिकल सिस्टम खतरे के लक्षण, एलर्जी और पिछली दवाओं की जांच करता है। हल्की समस्या में यह सुरक्षित दवा और घरेलू उपाय बताता है, जबकि गंभीर लक्षण मिलने पर तुरंत नजदीकी डॉक्टर दिखाने की सलाह देता है।',
        highlights: ['गंभीर संकेत की पहचान', 'सुरक्षित खुराक गणना', 'तुरंत डॉक्टर खोजें']
      },
      {
        id: 'cloud_online_sync',
        durationSec: 20,
        chapterTitle: '04. क्लाउड सिंक और ऑनलाइन इंडिकेटर',
        shortLabel: 'क्लाउड व वाई-फाई',
        subtitle: 'दवा डिस्पेंस बटन दबाने पर ऊपर दाईं ओर हरा ऑनलाइन इंडिकेटर मशीन की स्थिति दिखाता है।',
        voiceover: 'दवा निकालें बटन दबाने पर सिस्टम स्टॉक सुरक्षित करता है और क्लाउड डेटाबेस में कमांड भेजता है। ऐप के ऊपर दाईं ओर लगा वाई-फाई आइकन बताता है कि आपकी ESP32 मशीन हॉटस्पॉट से जुड़कर ऑनलाइन है या ऑफलाइन।',
        highlights: ['तुरंत स्टॉक बुकिंग', 'लाइव क्लाउड कमांड', 'ऊपर दाईं ओर ऑनलाइन स्टेटस']
      },
      {
        id: 'esp32_hardware',
        durationSec: 20,
        chapterTitle: '05. ESP32 मॉड्यूल और हार्डवेयर कनेक्शन',
        shortLabel: 'ESP32 मॉड्यूल',
        subtitle: 'ESP32 दो दशमलव चार गीगाहर्ट्ज़ वाई-फाई, बाहरी 5V सप्लाई, GPIO 18 और नीली LED से काम करता है।',
        voiceover: 'अब मशीन के अंदर के ESP32 मॉड्यूल को समझें। यह दो दशमलव चार गीगाहर्ट्ज़ वाई-फाई से जुड़कर हर ढाई सेकंड में कमांड जांचता है। मोटर को बाहरी पांच वोल्ट सप्लाई मिलती है और GPIO अठारह बूट के समय मोटर को हिलने से रोकता है।',
        highlights: ['GPIO 18 सिग्नल वायर', 'बाहरी 5V सप्लाई + कॉमन ग्राउंड', 'GPIO 2 नीली LED संकेत']
      },
      {
        id: 'physical_dispense',
        durationSec: 20,
        chapterTitle: '06. 25 डिग्री मोटर घुमाव और पुष्टि',
        shortLabel: 'दवा डिस्पेंस',
        subtitle: 'सर्वो मोटर 0° से 25° घूमकर वापस 0° पर आती है, नीली LED धीरे से चमकती है और ऐप पूरा दिखाता है।',
        voiceover: 'कमांड मिलते ही ESP32 सर्वो मोटर को शून्य से पच्चीस डिग्री घुमाकर दवा गिराता है और वापस शून्य पर लाता है। इसके बाद नीली लाइट एक बार धीरे से चमकती है और वेब ऐप पर तुरंत दवा मिलने की पुष्टि दिख जाती है।',
        highlights: ['0° → 25° → 0° सटीक घुमाव', '1 धीमी नीली LED ब्लिंक', 'ऐप में पूर्ण स्टेटस']
      }
    ]
  },

  hinglish: {
    buttonLabel: 'GUIDE',
    buttonSublabel: 'Patient guide + ESP32 working',
    modalTitle: 'MediMitra Complete Video: Patient Guide, System & ESP32 Module',
    modalBadge: '2-Minute Animated Walkthrough',
    playBtn: 'Play',
    pauseBtn: 'Pause',
    replayBtn: 'Replay',
    muteVoiceBtn: 'Mute Voice',
    enableVoiceBtn: 'Voice On',
    voiceLanguageLabel: 'Voice Language',
    voiceFallbackNotice: 'Selected language me voiceover aur live subtitles saath chal rahe hain.',
    closeBtn: 'Close Video',
    totalDurationLabel: '02:00',
    scenes: [
      {
        id: 'patient_onboarding',
        durationSec: 20,
        chapterTitle: '01. Patient Check-In & Language Setup',
        shortLabel: 'Patient Entry',
        subtitle: 'Patient naam daalein, Kid/Adult/Senior aur Female/Male chunein, aur apni language select karein.',
        voiceover: 'MediMitra me aapka swagat hai. Sabse pehle patient apna naam bharta hai, Kid, Adult ya Senior chunta hai, aur Male ya Female select karta hai. Upar diye selector se aap yeh poora checkup apni pasand ki bhasha me chala sakte hain.',
        highlights: ['Naam, Age Group aur Gender', '8 Bhashaon ka Support', 'Email, Google ya Guest Mode']
      },
      {
        id: 'adaptive_triage',
        durationSec: 20,
        chapterTitle: '02. Problem Selection & Smart Q&A',
        shortLabel: 'Smart Sawal',
        subtitle: 'Symptom chunein. Ladke, ladki, male aur female ke liye alag-alag sahi sawal pooche jaate hain.',
        voiceover: 'Ab patient bukhar, zukam ya pet dard jaisi apni takleef chunta hai. MediMitra ladke, ladki, purush aur mahila ke hisaab se das smart sawal poochta hai. Mahilaon se periods ya pregnancy ke sawal sirf zaroorat padne par hi pooche jaate hain.',
        highlights: ['Male vs Female Alag Flow', 'Boy vs Girl Pediatric Checks', 'Sirf Zaroorat Par Cycle Check']
      },
      {
        id: 'system_evaluation',
        durationSec: 20,
        chapterTitle: '03. Clinical Engine & Medicine Decision',
        shortLabel: 'System Logic',
        subtitle: 'System red flags, allergy aur pehle li dawa check karke safe dawa ya doctor suggest karta hai.',
        voiceover: 'System ke andar clinical engine aapke dard, allergy aur khatre ke nishanon ko check karta hai. Halka mamla hone par yeh safe tablet ya powder aur gharelu upay batata hai. Serious red flag milne par turant nazdeeki doctor dikhane ko kehta hai.',
        highlights: ['Red-Flag Emergency Check', 'Safe Dose Calculation', 'Nearby Doctor Finder']
      },
      {
        id: 'cloud_online_sync',
        durationSec: 20,
        chapterTitle: '04. Cloud Sync & Top-Right Online Badge',
        shortLabel: 'Cloud & Wi-Fi',
        subtitle: 'Dispense click karne par cloud me command jaati hai aur top-right badge ESP32 ko Online dikhata hai.',
        voiceover: 'Jab aap Dispense Medicine click karte hain, web app dawa ka stock reserve karke cloud database me command bhejta hai. Screen ke top right par Wi-Fi indicator hamesha dikhata hai ki ESP32 aapke mobile hotspot se Online hai ya Offline.',
        highlights: ['Stock Reserve & Command', 'Live Cloud Database Sync', 'Top-Right Online Indicator']
      },
      {
        id: 'esp32_hardware',
        durationSec: 20,
        chapterTitle: '05. ESP32 Module & Hardware Wiring',
        shortLabel: 'ESP32 Module',
        subtitle: 'ESP32 2.4GHz Wi-Fi se chalta hai, GPIO 18 servo wire control karta hai aur GPIO 2 blue LED status deta hai.',
        voiceover: 'Ab dekhte hain ESP32 module kaise kaam karta hai. ESP32 two point four gigahertz hotspot se judkar har dhai second me cloud check karta hai. Servo ko alag five volt supply milti hai, aur GPIO eighteen boot par zero volt rehkar jhatke se bachata hai.',
        highlights: ['GPIO 18 PWM Wire', 'External 5V + Common GND', 'GPIO 2 Blue LED Signals']
      },
      {
        id: 'physical_dispense',
        durationSec: 20,
        chapterTitle: '06. Live 25° Dispense & Confirmation',
        shortLabel: 'Servo Turn',
        subtitle: 'Motor 0° se 25° ghoom kar wapas 0° aati hai, blue LED dheere blink karti hai aur app Completed dikhata hai.',
        voiceover: 'Jaise hi command aata hai, ESP32 servo motor ko zero se pachees degree ghumakar dawa tray me girata hai aur wapas zero par le aata hai. Phir blue LED ek baar dheere se blink hoti hai aur web app par Completed dikh jaata hai.',
        highlights: ['0° → 25° → 0° Smooth Turn', '1 Slow Blue LED Blink', 'Web App Completed Sync']
      }
    ]
  },

  mr: {
    buttonLabel: 'GUIDE',
    buttonSublabel: 'रुग्ण माहिती + ESP32 कार्यप्रणाली',
    modalTitle: 'मेडिमित्रा संपूर्ण माहिती: रुग्ण वापर, सिस्टीम आणि ESP32 डिस्पेंसर',
    modalBadge: '2-मिनिटांचे ॲनिमेटेड मार्गदर्शन',
    playBtn: 'सुरू करा',
    pauseBtn: 'थांबवा',
    replayBtn: 'पुन्हा पहा',
    muteVoiceBtn: 'आवाज बंद',
    enableVoiceBtn: 'आवाज सुरू',
    voiceLanguageLabel: 'आवाजाची भाषा',
    voiceFallbackNotice: 'तुमच्या निवडलेल्या भाषेत आवाज आणि खाली थेट सबटायटल्स सुरू आहेत.',
    closeBtn: 'बंद करा',
    totalDurationLabel: '02:00',
    scenes: [
      {
        id: 'patient_onboarding',
        durationSec: 20,
        chapterTitle: '01. रुग्ण नोंदणी आणि भाषा निवड',
        shortLabel: 'रुग्ण प्रवेश',
        subtitle: 'रुग्णाचे नाव लिहा, वयोगट व लिंग निवडा आणि वरून तुमची आवडती भाषा सेट करा.',
        voiceover: 'मेडिमित्रामध्ये स्वागत आहे. सुरुवातीला रुग्ण स्वतःचे नाव टाकतो, लहान मूल, प्रौढ किंवा ज्येष्ठ निवडतो आणि पुरुष किंवा महिला पर्याय निवडतो. तुम्ही संपूर्ण तपासणी मराठी, हिंदी किंवा इंग्रजी अशा आठ भाषांमध्ये वापरू शकता.',
        highlights: ['नाव, वयोगट व लिंग', '8 भारतीय भाषा', 'ईमेल, गूगल किंवा गेस्ट प्रवेश']
      },
      {
        id: 'adaptive_triage',
        durationSec: 20,
        chapterTitle: '02. आजार निवड व अचूक प्रश्नोत्तरे',
        shortLabel: 'स्मार्ट प्रश्न',
        subtitle: 'तुमचा त्रास निवडा. मुलगा, मुलगी, पुरुष आणि महिलांसाठी वेगवेगळे अचूक प्रश्न विचारले जातात.',
        voiceover: 'पुढे ताप, सर्दी किंवा पोटदुखी यासारखी समस्या निवडा. मेडिमित्रा मुलगा, मुलगी, पुरुष आणि महिलांनुसार दहा सोपे प्रश्न विचारतो. महिलांना गर्भधारणा किंवा मासिक पाळीचे प्रश्न केवळ आवश्यकता असेल तेव्हाच विचारले जातात.',
        highlights: ['पुरुष व महिला वेगळे प्रश्न', 'मुलगा व मुलगी वेगळी तपासणी', 'आवश्यकतेनुसारच विशेष प्रश्न']
      },
      {
        id: 'system_evaluation',
        durationSec: 20,
        chapterTitle: '03. सिस्टीम विश्लेषण आणि औषध सल्ला',
        shortLabel: 'सिस्टीम निर्णय',
        subtitle: 'सिस्टीम लक्षणे, ॲलर्जी व धोके तपासून सुरक्षित औषध किंवा जवळच्या डॉक्टरांचा सल्ला देते.',
        voiceover: 'मेडिमित्राची क्लिनिकल सिस्टीम तात्काळ धोक्याची लक्षणे, औषधांची ॲलर्जी आणि आधी घेतलेली औषधे तपासते. सौम्य त्रासासाठी सुरक्षित गोळी किंवा पावडर व घरगुती उपाय सुचवले जातात, तर गंभीर लक्षणे असल्यास जवळचे डॉक्टर दाखवले जातात.',
        highlights: ['तात्काळ धोका तपासणी', 'सुरक्षित डोस मोजणी', 'जवळचे डॉक्टर शोधक']
      },
      {
        id: 'cloud_online_sync',
        durationSec: 20,
        chapterTitle: '04. क्लाउड सिंक आणि ऑनलाइन चिन्ह',
        shortLabel: 'क्लाउड व वाय-फाय',
        subtitle: 'औषध डिस्पेंस बटण दाबताच क्लाउडद्वारे मशीनला संदेश जातो आणि वर उजवीकडे ऑनलाइन स्थिती दिसते.',
        voiceover: 'डिस्पेंस बटण दाबल्यावर ॲप औषधाचा साठा राखीव ठेवते आणि क्लाउड डेटाबेसमध्ये आज्ञा पाठवते. स्क्रीनच्या वरच्या उजव्या कोपऱ्यातील वाय-फाय चिन्ह ESP32 हॉटस्पॉटशी जोडलेले असताना हिरवे ऑनलाइन दाखवते.',
        highlights: ['सुरक्षित साठा नोंदणी', 'थेट क्लाउड सिंक', 'वर उजवीकडे ऑनलाइन चिन्ह']
      },
      {
        id: 'esp32_hardware',
        durationSec: 20,
        chapterTitle: '05. ESP32 मॉड्यूल आणि हार्डवेअर रचना',
        shortLabel: 'ESP32 मॉड्यूल',
        subtitle: 'ESP32 दोन पॉईंट चार गिगाहर्ट्झ वाय-फाय, बाहेरील 5V सप्लाय, GPIO 18 आणि निळ्या LED वर चालते.',
        voiceover: 'आता ESP32 हार्डवेअर समजून घेऊया. हे मॉड्यूल दोन पॉईंट चार गिगाहर्ट्झ वाय-फायशी जोडून दर अडीच सेकंदांनी क्लाउड तपासते. मोटरला बाहेरील पाच व्होल्ट पॉवर मिळते आणि GPIO अठरा सुरुवातीला मोटर स्थिर ठेवते.',
        highlights: ['GPIO 18 सिग्नल वायर', 'बाहेरील 5V + कॉमन ग्राउंड', 'GPIO 2 निळा LED संदेश']
      },
      {
        id: 'physical_dispense',
        durationSec: 20,
        chapterTitle: '06. 25° मोटर फिरणे आणि पूर्ण स्थिती',
        shortLabel: 'औषध वितरण',
        subtitle: 'सर्व्हो मोटर 0° पासून 25° फिरून परत 0° वर येते, निळा दिवा हळू चमकतो आणि ॲप पूर्ण दाखवते.',
        voiceover: 'आदेश मिळताच ESP32 सर्व्हो मोटर शून्य ते पंचवीस अंश फिरवून औषध बाहेर सोडतो आणि परत शून्य स्थितीवर आणतो. त्यानंतर निळा दिवा एकदा हळुवार चमकतो आणि वेब ॲपवर लगेच वितरण पूर्ण झाल्याचे दिसते.',
        highlights: ['0° → 25° → 0° अचूक फिरणे', '1 हळू निळी LED ब्लिंक', 'ॲपमध्ये पूर्ण नोंद']
      }
    ]
  },

  bn: {
    buttonLabel: 'GUIDE',
    buttonSublabel: 'রোগীর গাইড + ESP32 সিস্টেম',
    modalTitle: 'মেডিমিত্র সম্পূর্ণ গাইড: রোগীর ব্যবহার, সিস্টেম ও ESP32 মডিউল',
    modalBadge: '২-মিনিটের অ্যানিমেটেড ভিডিও গাইড',
    playBtn: 'চালান',
    pauseBtn: 'থামান',
    replayBtn: 'আবার দেখুন',
    muteVoiceBtn: 'শব্দ বন্ধ',
    enableVoiceBtn: 'শব্দ চালু',
    voiceLanguageLabel: 'ভয়েসের ভাষা',
    voiceFallbackNotice: 'আপনার নির্বাচিত ভাষায় ভয়েস এবং লাইভ সাবটাইটেল চলছে।',
    closeBtn: 'বন্ধ করুন',
    totalDurationLabel: '02:00',
    scenes: [
      {
        id: 'patient_onboarding',
        durationSec: 20,
        chapterTitle: '০১. রোগীর তথ্য ও ভাষা নির্বাচন',
        shortLabel: 'রোগী প্রবেশ',
        subtitle: 'নাম লিখুন, শিশু, প্রাপ্তবয়স্ক বা বয়োজ্যেষ্ঠ এবং পুরুষ বা মহিলা নির্বাচন করে আপনার ভাষা বাছুন।',
        voiceover: 'মেডিমিত্রে স্বাগতম। প্রথমে রোগী নিজের নাম লেখেন, শিশু, প্রাপ্তবয়স্ক বা বয়োজ্যেষ্ঠ এবং পুরুষ বা মহিলা নির্বাচন করেন। উপরের ভাষা মেনু থেকে পুরো পরীক্ষা বাংলা, হিন্দি বা ইংরেজিসহ আটটি ভাষায় চালানো যায়।',
        highlights: ['নাম, বয়স ও লিঙ্গ', '৮টি ভাষার সুবিধা', 'ইমেইল, গুগল বা গেস্ট মোড']
      },
      {
        id: 'adaptive_triage',
        durationSec: 20,
        chapterTitle: '০২. সমস্যা বাছাই ও স্মার্ট প্রশ্নোত্তর',
        shortLabel: 'স্মার্ট প্রশ্ন',
        subtitle: 'উপসর্গ বাছাই করুন। ছেলে, মেয়ে, পুরুষ ও মহিলার জন্য আলাদা আলাদা প্রাসঙ্গিক প্রশ্ন আসে।',
        voiceover: 'এরপর জ্বর, সর্দি বা পেটের সমস্যার মতো উপসর্গ বেছে নিন। মেডিমিত্র ছেলে শিশু, মেয়ে শিশু, পুরুষ ও মহিলার জন্য আলাদা দশটি সহজ প্রশ্ন করে। গর্ভাবস্থা বা মাসিক সংক্রান্ত প্রশ্ন কেবল প্রয়োজন হলেই জিজ্ঞাসা করা হয়।',
        highlights: ['পুরুষ ও মহিলার আলাদা ধাপ', 'ছেলে ও মেয়ে শিশুর যত্ন', 'প্রয়োজন অনুযায়ী বিশেষ প্রশ্ন']
      },
      {
        id: 'system_evaluation',
        durationSec: 20,
        chapterTitle: '০৩. সিস্টেম বিশ্লেষণ ও চিকিৎসা পরামর্শ',
        shortLabel: 'সিস্টেম বিচার',
        subtitle: 'সিস্টেম বিপদ সংকেত, অ্যালার্জি ও ডোজ যাচাই করে নিরাপদ ওষুধ বা নিকটস্থ ডাক্তার দেখায়।',
        voiceover: 'সিস্টেমের ক্লিনিক্যাল ইঞ্জিন গুরুতর লক্ষণ, ওষুধের অ্যালার্জি ও আগের ওষুধ পরীক্ষা করে। সাধারণ সমস্যায় এটি নিরাপদ ট্যাবলেট বা পাউডার এবং ঘরোয়া উপায় বলে, আর ঝুঁকি থাকলে সরাসরি কাছের ডাক্তারের খোঁজ দেয়।',
        highlights: ['জরুরি লক্ষণ শনাক্তকরণ', 'সঠিক ডোজ নির্ণয়', 'নিকটস্থ ডাক্তার তালিকা']
      },
      {
        id: 'cloud_online_sync',
        durationSec: 20,
        chapterTitle: '০৪. ক্লাউড সিঙ্ক ও উপরে ডানদিকে অনলাইন চিহ্ন',
        shortLabel: 'ক্লাউড ও ওয়াই-ফাই',
        subtitle: 'ডিস্পেন্স বোতামে চাপলে ক্লাউডে বার্তা যায় এবং উপরে ডানদিকে সবুজ অনলাইন চিহ্ন দেখা যায়।',
        voiceover: 'ওষুধ ডিস্পেন্স বোতামে চাপ দিলে অ্যাপ স্টক সংরক্ষণ করে এবং ক্লাউড ডেটাবেসে কমান্ড পাঠায়। স্ক্রিনের উপরে ডানদিকে থাকা ওয়াই-ফাই আইকনটি ESP32 হটস্পটের সাথে যুক্ত থাকলে সবুজ অনলাইন দেখায়।',
        highlights: ['নিরাপদ স্টক বুকিং', 'রিয়েল-টাইম ক্লাউড কমান্ড', 'উপরে ডানদিকে অনলাইন চিহ্ন']
      },
      {
        id: 'esp32_hardware',
        durationSec: 20,
        chapterTitle: '০৫. ESP32 মডিউল ও হার্ডওয়্যার সংযোগ',
        shortLabel: 'ESP32 মডিউল',
        subtitle: 'ESP32 ২.৪ গিগাহার্টজ ওয়াই-ফাই, বাইরের 5V সাপ্লাই, GPIO 18 এবং নীল LED ব্যবহার করে।',
        voiceover: 'এবার ESP32 মডিউলটি দেখুন। এটি ২.৪ গিগাহার্টজ ওয়াই-ফাইয়ে যুক্ত হয়ে প্রতি আড়াই সেকেন্ডে ক্লাউড পরীক্ষা করে। বাইরের পাঁচ ভোল্ট পাওয়ার মোটর চালায় এবং GPIO আঠারো চালু হওয়ার সময় মোটর নড়াচড়া বন্ধ রাখে।',
        highlights: ['GPIO 18 সিগন্যাল তার', 'বাইরের 5V + কমন গ্রাউন্ড', 'GPIO 2 নীল LED সংকেত']
      },
      {
        id: 'physical_dispense',
        durationSec: 20,
        chapterTitle: '০৬. ২৫° মোটর ঘোরা ও ডেলিভারি নিশ্চিতকরণ',
        shortLabel: 'ওষুধ ডিস্পেন্স',
        subtitle: 'মোটর ০° থেকে ২৫° ঘুরে আবার ০°-তে ফেরে, নীল বাতি ধীরে জ্বলে এবং অ্যাপ Completed দেখায়।',
        voiceover: 'কমান্ড পেলেই ESP32 সার্ভো মোটরকে শূন্য থেকে পঁচিশ ডিগ্রি ঘুরিয়ে ওষুধ ফেলে দেয় এবং আবার শূন্যতে ফিরে আসে। এরপর নীল বাতি একবার ধীরে জ্বলে ওঠে এবং অ্যাপে সাথে সাথে কাজ সম্পূর্ণ দেখা যায়।',
        highlights: ['0° → 25° → 0° মসৃণ ঘোরা', '১টি ধীর নীল LED ব্লিংক', 'অ্যাপে সম্পূর্ণ স্ট্যাটাস']
      }
    ]
  },

  ta: {
    buttonLabel: 'GUIDE',
    buttonSublabel: 'நோயாளி வழிகாட்டி + ESP32',
    modalTitle: 'மெடிமித்ரா முழு வழிகாட்டி: நோயாளி பயன்பாடு, சிஸ்டம் & ESP32',
    modalBadge: '2-நிமிட அனிமேஷன் விளக்க வீடியோ',
    playBtn: 'இயக்கு',
    pauseBtn: 'நிறுத்து',
    replayBtn: 'மீண்டும் பார்',
    muteVoiceBtn: 'ஒலி நிறுத்து',
    enableVoiceBtn: 'ஒலி இயக்கு',
    voiceLanguageLabel: 'குரல் மொழி',
    voiceFallbackNotice: 'தேர்ந்தெடுத்த மொழியில் குரல் மற்றும் நேரடி வசனங்கள் இயங்குகின்றன.',
    closeBtn: 'மூடு',
    totalDurationLabel: '02:00',
    scenes: [
      {
        id: 'patient_onboarding',
        durationSec: 20,
        chapterTitle: '01. நோயாளி பதிவு & மொழி தேர்வு',
        shortLabel: 'நோயாளி நுழைவு',
        subtitle: 'பெயர், வயதுப் பிரிவு மற்றும் பாலினத்தைத் தேர்ந்தெடுத்து உங்கள் விருப்ப மொழியில் தொடங்குங்கள்.',
        voiceover: 'மெடிமித்ராவிற்கு வரவேற்கிறோம். முதலில் நோயாளி தன் பெயரை உள்ளிட்டு, குழந்தை, பெரியவர் அல்லது மூத்தவர் மற்றும் ஆண் அல்லது பெண் என்பதைத் தேர்ந்தெடுக்கிறார். மேலே உள்ள மொழித் தேர்வில் தமிழ் உட்பட எட்டு மொழிகளில் பயன்படுத்தலாம்.',
        highlights: ['பெயர், வயது & பாலினம்', '8 மொழிகள் ஆதரவு', 'மின்னஞ்சல் அல்லது விருந்தினர் நுழைவு']
      },
      {
        id: 'adaptive_triage',
        durationSec: 20,
        chapterTitle: '02. அறிகுறி தேர்வு & ஸ்மார்ட் கேள்விகள்',
        shortLabel: 'ஸ்மார்ட் கேள்விகள்',
        subtitle: 'பிரச்சனையைத் தேர்ந்தெடுக்கவும். சிறுவன், சிறுமி, ஆண், பெண் ஆகியோருக்கு ஏற்ப கேள்விகள் மாறும்.',
        voiceover: 'அடுத்து காய்ச்சல், சளி அல்லது வயிற்று வலி போன்ற பிரச்சனையைத் தேர்ந்தெடுக்கவும். ஆண், பெண், சிறுவன் மற்றும் சிறுமிக்கு ஏற்ப பத்து எளிய கேள்விகள் கேட்கப்படும். கர்ப்பம் அல்லது மாதவிடாய் கேள்விகள் தேவையான போது மட்டுமே கேட்கப்படும்.',
        highlights: ['ஆண் / பெண் தனிப்பயன் கேள்விகள்', 'சிறுவன் / சிறுமி தனி கவனம்', 'தேவையான போது மட்டுமே சிறப்பு கேள்வி']
      },
      {
        id: 'system_evaluation',
        durationSec: 20,
        chapterTitle: '03. சிஸ்டம் ஆய்வு & மருந்து பரிந்துரை',
        shortLabel: 'சிஸ்டம் முடிவு',
        subtitle: 'அபாய அறிகுறி மற்றும் ஒவ்வாமையைச் சோதித்து பாதுகாப்பான மருந்து அல்லது மருத்துவரைப் பரிந்துரைக்கும்.',
        voiceover: 'உள்ளே உள்ள மருத்துவ இயந்திரம் அபாய அறிகுறிகள், மருந்து ஒவ்வாமை மற்றும் முந்தைய மருந்துகளைச் சரிபார்க்கிறது. சாதாரண நிலையில் பாதுகாப்பான மருந்து மற்றும் வீட்டு வைத்தியத்தைக் கூறும்; அவசர நிலையில் அருகிலுள்ள மருத்துவரைக் காட்டும்.',
        highlights: ['அவசர அறிகுறி சோதனை', 'பாதுகாப்பான அளவு கணிப்பு', 'அருகிலுள்ள மருத்துவர் தேடல்']
      },
      {
        id: 'cloud_online_sync',
        durationSec: 20,
        chapterTitle: '04. கிளவுட் இணைப்பு & ஆன்லைன் குறியீடு',
        shortLabel: 'கிளவுட் & Wi-Fi',
        subtitle: 'மருந்து வழங்க அழுத்தும்போது மேலே வலதுபுறத்தில் ஆன்லைன் / ஆஃப்லைன் நிலை உடனே தெரியும்.',
        voiceover: 'மருந்து வழங்கு பொத்தானை அழுத்தும்போது ஆப் இருப்பை முன்பதிவு செய்து கிளவுட் தரவுத்தளத்திற்கு கட்டளை அனுப்பும். திரையின் மேல் வலது மூலையில் உள்ள Wi-Fi குறியீடு ESP32 இணைந்திருந்தால் பச்சை ஆன்லைன் எனக் காட்டும்.',
        highlights: ['இருப்பு முன்பதிவு', 'நேரடி கிளவுட் கட்டளை', 'மேல் வலது ஆன்லைன் குறியீடு']
      },
      {
        id: 'esp32_hardware',
        durationSec: 20,
        chapterTitle: '05. ESP32 தொகுதி & வன்பொருள் அமைப்பு',
        shortLabel: 'ESP32 தொகுதி',
        subtitle: 'ESP32 2.4GHz Wi-Fi, வெளிப்புற 5V சக்தி, GPIO 18 சிக்னல் மற்றும் GPIO 2 நீல விளக்கு மூலம் இயங்கும்.',
        voiceover: 'இப்போது ESP32 வன்பொருளைப் பார்ப்போம். இது 2.4 ஜிகாஹெர்ட்ஸ் Wi-Fi மூலம் இணைந்து இரண்டரை வினாடிக்கு ஒருமுறை கிளவுட்டைச் சரிபார்க்கும். வெளிப்புற ஐந்து வோல்ட் சக்தி மோட்டாரை இயக்கும், GPIO பதினெட்டு தொடக்க அதிர்வைத் தடுக்கும்.',
        highlights: ['GPIO 18 PWM இணைப்பு', 'வெளிப்புற 5V + பொது GND', 'GPIO 2 நீல LED சிக்னல்']
      },
      {
        id: 'physical_dispense',
        durationSec: 20,
        chapterTitle: '06. 25° மோட்டார் சுழற்சி & உறுதிப்படுத்தல்',
        shortLabel: 'மருந்து வெளியீடு',
        subtitle: 'மோட்டார் 0° இலிருந்து 25° சுழன்று திரும்பும், நீல விளக்கு மெதுவாக ஒளிரும், ஆப் முடிந்தது எனக் காட்டும்.',
        voiceover: 'கட்டளை வந்ததும் ESP32 சர்வோ மோட்டாரை பூஜ்ஜியத்திலிருந்து இருபத்தைந்து டிகிரி சுழற்றி மருந்தை வெளியிட்டு மீண்டும் பூஜ்ஜியத்திற்குத் திரும்பும். பின் நீல விளக்கு ஒருமுறை மெதுவாக ஒளிர்ந்து ஆப்பில் முடிந்ததாகக் காட்டும்.',
        highlights: ['0° → 25° → 0° மென்மையான சுழற்சி', '1 மெதுவான நீல LED ஒளி', 'ஆப்பில் முடிந்த நிலை']
      }
    ]
  },

  te: {
    buttonLabel: 'GUIDE',
    buttonSublabel: 'రోగి గైడ్ + ESP32 విధానం',
    modalTitle: 'మెడిమిత్ర పూర్తి వీడియో: రోగి వాడుక, సిస్టమ్ & ESP32 మాడ్యూల్',
    modalBadge: '2-నిమిషాల యానిమేటెడ్ వివరణ',
    playBtn: 'ప్లే',
    pauseBtn: 'ఆపు',
    replayBtn: 'మళ్లీ చూడు',
    muteVoiceBtn: 'వాయిస్ ఆఫ్',
    enableVoiceBtn: 'వాయిస్ ఆన్',
    voiceLanguageLabel: 'వాయిస్ భాష',
    voiceFallbackNotice: 'ఎంచుకున్న భాషలో వాయిస్ మరియు లైవ్ సబ్‌టైటిల్స్ నడుస్తున్నాయి.',
    closeBtn: 'మూసివేయి',
    totalDurationLabel: '02:00',
    scenes: [
      {
        id: 'patient_onboarding',
        durationSec: 20,
        chapterTitle: '01. రోగి నమోదు & భాష ఎంపిక',
        shortLabel: 'రోగి ప్రవేశం',
        subtitle: 'పేరు నమోదు చేసి, చిన్నారి, వయోజనుడు లేదా సీనియర్ మరియు పురుషుడు/మహిళను ఎంచుకుని భాషను సెట్ చేయండి.',
        voiceover: 'మెడిమిత్రకు స్వాగతం. మొదట రోగి తన పేరు నమోదు చేసి, వయస్సు వర్గం మరియు పురుషుడు లేదా మహిళను ఎంచుకుంటారు. పైన ఉన్న భాషా ఎంపికతో మొత్తం పరీక్షను తెలుగు, హిందీ లేదా ఇంగ్లీష్‌లో సులభంగా నిర్వహించవచ్చు.',
        highlights: ['పేరు, వయస్సు & లింగం', '8 భాషల మద్దతు', 'ఈమెయిల్, గూగుల్ లేదా గెస్ట్']
      },
      {
        id: 'adaptive_triage',
        durationSec: 20,
        chapterTitle: '02. సమస్య ఎంపిక & స్మార్ట్ ప్రశ్నలు',
        shortLabel: 'స్మార్ట్ ప్రశ్నలు',
        subtitle: 'సమస్యను ఎంచుకోండి. అబ్బాయి, అమ్మాయి, పురుషుడు మరియు మహిళకు వేర్వేరు ప్రశ్నలు వస్తాయి.',
        voiceover: 'తర్వాత జ్వరం, జలుబు లేదా కడుపు నొప్పి వంటి సమస్యను ఎంచుకోండి. మెడిమిత్ర అబ్బాయి, అమ్మాయి, పురుషుడు మరియు మహిళకు అనుగుణంగా పది ప్రశ్నలు అడుగుతుంది. గర్భధారణ లేదా పీరియడ్స్ ప్రశ్నలు అవసరమైనప్పుడు మాత్రమే అడుగుతుంది.',
        highlights: ['స్త్రీ పురుషులకు వేర్వేరు ప్రశ్నలు', 'బాలుడు vs బాలిక శ్రద్ధ', 'అవసరమైనప్పుడే ప్రత్యేక ప్రశ్నలు']
      },
      {
        id: 'system_evaluation',
        durationSec: 20,
        chapterTitle: '03. సిస్టమ్ విశ్లేషణ & మందుల సూచన',
        shortLabel: 'సిస్టమ్ నిర్ణయం',
        subtitle: 'ప్రమాద సంకేతాలు, అలర్జీలు తనిఖీ చేసి సురక్షిత మందులు లేదా సమీప డాక్టర్లను చూపిస్తుంది.',
        voiceover: 'సిస్టమ్ లోపల క్లినికల్ ఇంజిన్ తీవ్రమైన సంకేతాలు, అలర్జీలు మరియు మునుపటి మందులను తనిఖీ చేస్తుంది. సాధారణ సమస్యలకు సురక్షితమైన మాత్రలు, పౌడర్ మరియు ఇంటి చిట్కాలు ఇస్తుంది; తీవ్రమైన స్థితిలో వెంటనే సమీప డాక్టర్లను సూచిస్తుంది.',
        highlights: ['ప్రమాద సంకేతాల స్క్రీన్', 'సురక్షిత మోతాదు లెక్కింపు', 'సమీప డాక్టర్ల జాబితా']
      },
      {
        id: 'cloud_online_sync',
        durationSec: 20,
        chapterTitle: '04. క్లౌడ్ సింక్ & ఆన్‌లైన్ సూచిక',
        shortLabel: 'క్లౌడ్ & Wi-Fi',
        subtitle: 'డిస్పెన్స్ నొక్కినప్పుడు క్లౌడ్‌కు ఆదేశం వెళ్తుంది, పైన కుడివైపున ఆన్‌లైన్ గుర్తు కనిపిస్తుంది.',
        voiceover: 'మీరు డిస్పెన్స్ బటన్ నొక్కినప్పుడు, యాప్ మందు స్టాక్‌ను రిజర్వ్ చేసి క్లౌడ్ డేటాబేస్‌కు ఆదేశం పంపుతుంది. స్క్రీన్ పైన కుడి మూలలో ఉన్న Wi-Fi గుర్తు ESP32 కనెక్ట్ అయినప్పుడు ఆకుపచ్చ ఆన్‌లైన్ అని చూపిస్తుంది.',
        highlights: ['స్టాక్ రిజర్వేషన్', 'లైవ్ క్లౌడ్ కమాండ్', 'పైన కుడి ఆన్‌లైన్ గుర్తు']
      },
      {
        id: 'esp32_hardware',
        durationSec: 20,
        chapterTitle: '05. ESP32 మాడ్యూల్ & హార్డ్‌వేర్ పనితీరు',
        shortLabel: 'ESP32 మాడ్యూల్',
        subtitle: 'ESP32 2.4GHz Wi-Fi ద్వారా క్లౌడ్‌ను తనిఖీ చేసి, GPIO 18 మోటార్ మరియు GPIO 2 నీలి LED ని నడుపుతుంది.',
        voiceover: 'ఇప్పుడు ESP32 మాడ్యూల్ లోపల చూద్దాం. ఇది 2.4 గిగాహెర్ట్జ్ Wi-Fi తో కనెక్ట్ అయి ప్రతి రెండున్నర సెకన్లకు క్లౌడ్‌ను తనిఖీ చేస్తుంది. బయటి ఐదు వోల్ట్ల పవర్ సర్వో మోటార్‌కు శక్తినిస్తుంది, GPIO పద్దెనిమిది బూట్ సమయంలో కదలికను ఆపుతుంది.',
        highlights: ['GPIO 18 PWM వైర్', 'బయటి 5V + కామన్ GND', 'GPIO 2 నీలి LED సంకేతాలు']
      },
      {
        id: 'physical_dispense',
        durationSec: 20,
        chapterTitle: '06. 25° మోటార్ తిరుగుడు & నిర్ధారణ',
        shortLabel: 'మందు విడుదల',
        subtitle: 'మోటార్ 0° నుండి 25° తిరిగి సున్నాకు వస్తుంది, నీలి LED నెమ్మదిగా వెలుగుతుంది, యాప్ పూర్తయిందని చూపుతుంది.',
        voiceover: 'ఆదేశం రాగానే ESP32 సర్వో మోటార్‌ను సున్నా నుండి ఇరవై ఐదు డిగ్రీలకు తిప్పి మందును ట్రేలో వదులుతుంది, తర్వాత సున్నాకు తిరిగి వస్తుంది. అనంతరం నీలి LED ఒకసారి నెమ్మదిగా వెలిగి యాప్‌లో పూర్తయినట్లు చూపిస్తుంది.',
        highlights: ['0° → 25° → 0° సాఫీ కదలిక', '1 నెమ్మది నీలి LED బ్లింక్', 'యాప్‌లో పూర్తయిన స్థితి']
      }
    ]
  },

  gu: {
    buttonLabel: 'GUIDE',
    buttonSublabel: 'દર્દી માર્ગદર્શિકા + ESP32',
    modalTitle: 'મેડિમિત્રા સંપૂર્ણ માર્ગદર્શન: દર્દી ઉપયોગ, સિસ્ટમ અને ESP32 મોડ્યુલ',
    modalBadge: '2-મિનિટનો એનિમેટેડ વિડિઓ',
    playBtn: 'ચલાવો',
    pauseBtn: 'રોકો',
    replayBtn: 'ફરી જુઓ',
    muteVoiceBtn: 'અવાજ બંધ',
    enableVoiceBtn: 'અવાજ ચાલુ',
    voiceLanguageLabel: 'અવાજની ભાષા',
    voiceFallbackNotice: 'તમારી પસંદ કરેલી ભાષામાં અવાજ અને લાઇવ સબટાઇટલ્સ ચાલી રહ્યા છે.',
    closeBtn: 'બંધ કરો',
    totalDurationLabel: '02:00',
    scenes: [
      {
        id: 'patient_onboarding',
        durationSec: 20,
        chapterTitle: '01. દર્દીની માહિતી અને ભાષા પસંદગી',
        shortLabel: 'દર્દી પ્રવેશ',
        subtitle: 'દર્દીનું નામ લખો, બાળક, પુખ્ત કે વરિષ્ઠ અને પુરુષ કે મહિલા પસંદ કરી તમારી ભાષા પસંદ કરો.',
        voiceover: 'મેડિમિત્રામાં આપનું સ્વાગત છે. શરૂઆતમાં દર્દી પોતાનું નામ લખે છે, બાળક, પુખ્ત કે વરિષ્ઠ અને પુરુષ કે મહિલા પસંદ કરે છે. ઉપરની ભાષા પસંદગીથી સમગ્ર તપાસ ગુજરાતી, હિન્દી કે અંગ્રેજી સહિત આઠ ભાષાઓમાં ચલાવી શકાય છે.',
        highlights: ['નામ, ઉંમર અને લિંગ', '8 ભાષાઓનો સપોર્ટ', 'ઈમેલ, ગૂગલ કે ગેસ્ટ પ્રવેશ']
      },
      {
        id: 'adaptive_triage',
        durationSec: 20,
        chapterTitle: '02. સમસ્યાની પસંદગી અને સ્માર્ટ પ્રશ્નો',
        shortLabel: 'સ્માર્ટ પ્રશ્નો',
        subtitle: 'તકલીફ પસંદ કરો. છોકરો, છોકરી, પુરુષ અને મહિલા માટે અલગ અલગ યોગ્ય પ્રશ્નો પૂછાય છે.',
        voiceover: 'ત્યારબાદ તાવ, શરદી કે પેટની તકલીફ જેવી સમસ્યા પસંદ કરો. મેડિમિત્રા છોકરા, છોકરી, પુરુષ અને મહિલા મુજબ દસ સરળ પ્રશ્નો પૂછે છે. મહિલાઓ માટે ગર્ભાવસ્થા કે માસિકના પ્રશ્નો માત્ર જરૂર હોય ત્યારે જ પૂછાય છે.',
        highlights: ['પુરુષ અને મહિલા અલગ પ્રશ્નો', 'છોકરો વિ. છોકરી કાળજી', 'જરૂરિયાત મુજબ વિશેષ તપાસ']
      },
      {
        id: 'system_evaluation',
        durationSec: 20,
        chapterTitle: '03. સિસ્ટમ વિશ્લેષણ અને દવાની સલાહ',
        shortLabel: 'સિસ્ટમ નિર્ણય',
        subtitle: 'સિસ્ટમ ગંભીર ચિહ્નો, એલર્જી અને ડોઝ તપાસીને સુરક્ષિત દવા કે નજીકના ડૉક્ટર સૂચવે છે.',
        voiceover: 'બેકગ્રાઉન્ડમાં ક્લિનિકલ એન્જિન ગંભીર લક્ષણો, એલર્જી અને અગાઉની દવાઓ તપાસે છે. સામાન્ય તકલીફમાં સુરક્ષિત દવા કે પાવડર અને ઘરેલુ ઉપાય આપે છે, જ્યારે ગંભીર સંકેતમાં તરત નજીકના ડૉક્ટર બતાવે છે.',
        highlights: ['તાત્કાલિક ચેતવણી તપાસ', 'સુરક્ષિત ડોઝ ગણતરી', 'નજીકના ડૉક્ટર શોધો']
      },
      {
        id: 'cloud_online_sync',
        durationSec: 20,
        chapterTitle: '04. ક્લાઉડ સિંક અને ઉપર જમણે ઓનલાઇન નિશાની',
        shortLabel: 'ક્લાઉડ અને Wi-Fi',
        subtitle: 'ડિસ્પેન્સ દબાવતા ક્લાઉડમાં આદેશ જાય છે અને ઉપર જમણી બાજુએ ઓનલાઇન સ્ટેટસ દેખાય છે.',
        voiceover: 'દવા ડિસ્પેન્સ બટન દબાવતા એપ સ્ટોક સુરક્ષિત કરે છે અને ક્લાઉડ ડેટાબેઝમાં આદેશ મોકલે છે. સ્ક્રીનની ઉપર જમણી બાજુએ Wi-Fi આઇકોન ESP32 હોટસ્પોટ સાથે જોડાયેલ હોય ત્યારે લીલા રંગમાં ઓનલાઇન બતાવે છે.',
        highlights: ['સુરક્ષિત સ્ટોક રિઝર્વ', 'લાઇવ ક્લાઉડ કમાન્ડ', 'ઉપર જમણે ઓનલાઇન આઇકોન']
      },
      {
        id: 'esp32_hardware',
        durationSec: 20,
        chapterTitle: '05. ESP32 મોડ્યુલ અને હાર્ડવેર રચના',
        shortLabel: 'ESP32 મોડ્યુલ',
        subtitle: 'ESP32 2.4GHz Wi-Fi, બહારની 5V સપ્લાય, GPIO 18 સિગ્નલ અને GPIO 2 વાદળી LED થી ચાલે છે.',
        voiceover: 'હવે ESP32 મોડ્યુલ સમજીએ. તે 2.4 ગીગાહર્ટ્ઝ Wi-Fi સાથે જોડાઈને દર અઢી સેકન્ડે ક્લાઉડ તપાસે છે. બહારની પાંચ વોલ્ટ પાવર સપ્લાય મોટર ચલાવે છે અને GPIO અઢાર બૂટ સમયે મોટરને સ્થિર રાખે છે.',
        highlights: ['GPIO 18 PWM વાયર', 'બહારની 5V + કોમન GND', 'GPIO 2 વાદળી LED સંકેત']
      },
      {
        id: 'physical_dispense',
        durationSec: 20,
        chapterTitle: '06. 25° મોટર રોટેશન અને ડિલિવરી પુષ્ટિ',
        shortLabel: 'દવા વિતરણ',
        subtitle: 'સર્વો મોટર 0° થી 25° ફરીને 0° પર આવે છે, વાદળી LED ધીમે ચમકે છે અને એપ પૂર્ણ બતાવે છે.',
        voiceover: 'આદેશ મળતા જ ESP32 સર્વો મોટરને શૂન્યથી પચ્ચીસ ડિગ્રી ફેરવી દવા ટ્રેમાં પાડે છે અને પાછો શૂન્ય પર લાવે છે. ત્યારબાદ વાદળી LED એકવાર ધીમે ચમકે છે અને વેબ એપ પર તરત વિતરણ પૂર્ણ દેખાય છે.',
        highlights: ['0° → 25° → 0° સરળ રોટેશન', '1 ધીમી વાદળી LED બ્લિંક', 'એપમાં પૂર્ણ સ્થિતિ']
      }
    ]
  }
};
