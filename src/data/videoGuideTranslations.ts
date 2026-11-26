import { LanguageCode } from '../context/LanguageContext';

export interface VideoSceneScript {
  id: number;
  startSec: number;
  durationSec: number;
  title: string;
  caption: string;
  narration: string;
}

export interface VideoGuideLocale {
  modalTitle: string;
  modalSubtitle: string;
  buttonLabel: string;
  voiceLangBcp47: string[];
  voiceLangDisplay: string;
  playBtn: string;
  pauseBtn: string;
  replayBtn: string;
  muteBtn: string;
  unmuteBtn: string;
  voiceActiveLabel: string;
  voiceMutedLabel: string;
  closeBtn: string;
  scenes: VideoSceneScript[];
}

export const VIDEO_GUIDE_TRANSLATIONS: Record<LanguageCode, VideoGuideLocale> = {
  en: {
    modalTitle: 'MediMitra Interactive Guide',
    modalSubtitle: '2-Minute Patient Walkthrough, System Architecture & ESP32 Dispenser Overview',
    buttonLabel: 'Watch 2-Min App & ESP32 Guide',
    voiceLangBcp47: ['en-IN', 'en-US', 'en-GB', 'en'],
    voiceLangDisplay: 'English Voice',
    playBtn: 'Play',
    pauseBtn: 'Pause',
    replayBtn: 'Replay',
    muteBtn: 'Mute Voice',
    unmuteBtn: 'Unmute Voice',
    voiceActiveLabel: 'Voiceover Active',
    voiceMutedLabel: 'Voiceover Muted',
    closeBtn: 'Close',
    scenes: [
      {
        id: 1,
        startSec: 0,
        durationSec: 18,
        title: '01. Patient Sign-In & Profile',
        caption: 'Select language, enter patient name, age group (Child, Adult, Senior), and Male or Female profile.',
        narration:
          'Welcome to MediMitra. First, choose your preferred language and enter the patient name, age group such as child, adult, or senior, and gender. This lets the app personalize safe medicine doses from step one.'
      },
      {
        id: 2,
        startSec: 18,
        durationSec: 20,
        title: '02. Smart Symptom Checkup',
        caption: 'Tap a common issue or type symptoms. Questions adapt to triggers, hydration, and allergy rules.',
        narration:
          'On the home screen, tap a symptom like fever, headache, cold, or stomach upset, or type how you feel. The ten-step checkup adapts questions by age group, symptom triggers, hydration, and medicine allergy history.'
      },
      {
        id: 3,
        startSec: 38,
        durationSec: 18,
        title: '03. Clinical Result & Doctors',
        caption: 'MediMitra evaluates severity, filters allergies, recommends OTC relief, and locates nearby doctors.',
        narration:
          'After ten answers, MediMitra evaluates severity, checks drug allergies, and displays safe over-the-counter medicines alongside home remedies. If emergency signs appear, it highlights nearby doctors and clinics on the map.'
      },
      {
        id: 4,
        startSec: 56,
        durationSec: 18,
        title: '04. Cloud Sync & Live Status',
        caption: 'Clicking Dispense Medicine confirms dosage and sends a secure PENDING command via Cloud Firestore.',
        narration:
          'When safe medicine is recommended, click Dispense Medicine and authorize payment. MediMitra sends a real-time command to Google Cloud Firestore, while the top-right Online or Offline icon tracks your dispenser Wi-Fi connection live.'
      },
      {
        id: 5,
        startSec: 74,
        durationSec: 24,
        title: '05. ESP32 Module & Wiring',
        caption: 'ESP32 DevKit V1 connects over 2.4 GHz Wi-Fi or Hotspot, driving the SG90 servo via GPIO 18 and 5V supply.',
        narration:
          'Inside the hardware unit, the ESP32 DevKit V1 connects to your 2.4 gigahertz Wi-Fi or mobile hotspot and pings the cloud every ten seconds. GPIO 18 controls the orange signal wire held at zero volts on boot, powered safely by an external 5 volt 2 amp supply with a shared ground.'
      },
      {
        id: 6,
        startSec: 98,
        durationSec: 22,
        title: '06. Dispensing & Blue LED Signal',
        caption: 'ESP32 claims the command, sweeps Servo 0° → 25° → 0°, slowly blinks the Blue LED once, and updates UI.',
        narration:
          'As soon as a command arrives, the ESP32 switches the servo smoothly from zero to twenty-five degrees, pauses briefly to release the medicine, and returns to zero. It then gives one slow blue LED blink on pin 2 and marks the order completed in the web app.'
      }
    ]
  },

  hi: {
    modalTitle: 'मेडिमित्रा 2-मिनट एनिमेटेड गाइड',
    modalSubtitle: 'मरीज उपयोग, सिस्टम कार्यप्रणाली और ESP32 डिस्पेंसर मॉड्यूल की पूरी जानकारी',
    buttonLabel: '2-मिनट ऐप व ESP32 वीडियो देखें',
    voiceLangBcp47: ['hi-IN', 'hi'],
    voiceLangDisplay: 'हिन्दी आवाज़',
    playBtn: 'चलाएं',
    pauseBtn: 'रोकें',
    replayBtn: 'फिर से देखें',
    muteBtn: 'आवाज़ बंद करें',
    unmuteBtn: 'आवाज़ चालू करें',
    voiceActiveLabel: 'वॉइसओवर चालू',
    voiceMutedLabel: 'आवाज़ म्यूट',
    closeBtn: 'बंद करें',
    scenes: [
      {
        id: 1,
        startSec: 0,
        durationSec: 18,
        title: '01. मरीज लॉगिन और प्रोफ़ाइल',
        caption: 'अपनी भाषा चुनें, मरीज का नाम, आयु वर्ग (बच्चा, वयस्क, वरिष्ठ) और पुरुष या महिला चुनें।',
        narration:
          'मेडिमित्रा में आपका स्वागत है। सबसे पहले अपनी भाषा चुनें और मरीज का नाम, आयु वर्ग जैसे बच्चा, वयस्क या वरिष्ठ, तथा लिंग दर्ज करें। इससे ऐप पहले कदम से ही सही और सुरक्षित दवा की मात्रा तय कर पाता है।'
      },
      {
        id: 2,
        startSec: 18,
        durationSec: 20,
        title: '02. स्मार्ट लक्षण जांच',
        caption: 'लक्षण चुनें या लिखें। प्रश्न आयु वर्ग, पानी की कमी और एलर्जी के अनुसार बदलते हैं।',
        narration:
          'होम स्क्रीन पर बुखार, सिरदर्द, जुकाम या पेट दर्द चुनें या अपनी समस्या लिखें। दस चरणों की जांच आयु वर्ग, लक्षण के कारण और दवा एलर्जी के हिसाब से सटीक प्रश्न पूछती है।'
      },
      {
        id: 3,
        startSec: 38,
        durationSec: 18,
        title: '03. क्लिनिकल रिपोर्ट और डॉक्टर',
        caption: 'गंभीरता और एलर्जी जांच कर सुरक्षित दवा, घरेलू उपाय और नजदीकी डॉक्टर दिखाता है।',
        narration:
          'सभी दस उत्तरों के बाद मेडिमित्रा गंभीरता और दवा की एलर्जी जांचता है, फिर सुरक्षित दवा और घरेलू उपाय बताता है। यदि कोई गंभीर संकेत दिखे, तो यह तुरंत नजदीकी डॉक्टर और क्लीनिक दिखाता है।'
      },
      {
        id: 4,
        startSec: 56,
        durationSec: 18,
        title: '04. क्लाउड सिंक और लाइव स्टेटस',
        caption: 'Dispense Medicine पर क्लिक करते ही क्लाउड डेटाबेस में कमांड जाता है और ऊपर ऑनलाइन स्टेटस दिखता है।',
        narration:
          'दवा डिस्पेंस करने के लिए बटन दबाएं और भुगतान की पुष्टि करें। वेब ऐप तुरंत क्लाउड फायरस्टोर में कमांड भेजता है, और ऊपर दाईं ओर लगा वाई-फाई आइकन बताता है कि ESP32 ऑनलाइन है या ऑफलाइन।'
      },
      {
        id: 5,
        startSec: 74,
        durationSec: 24,
        title: '05. ESP32 मॉड्यूल और वायरिंग',
        caption: 'ESP32 2.4 GHz वाई-फाई या हॉटस्पॉट से जुड़कर GPIO 18 और 5V सप्लाई से सर्वो मोटर चलाता है।',
        narration:
          'हार्डवेयर के अंदर ESP32 मॉड्यूल 2.4 गीगाहर्ट्ज़ वाई-फाई या मोबाइल हॉटस्पॉट से जुड़कर हर दस सेकंड में ऑनलाइन सिग्नल भेजता है। पिन 18 सर्वो के नारंगी सिग्नल तार से जुड़ा है और बाहरी 5 वोल्ट 2 एम्पियर सप्लाई तथा कॉमन ग्राउंड इसे स्थिर पावर देते हैं।'
      },
      {
        id: 6,
        startSec: 98,
        durationSec: 22,
        title: '06. दवा निकलना और नीली एलईडी',
        caption: 'सर्वो 0° से 25° घूमकर वापस 0° पर आता है, नीली LED धीरे से एक बार जलती है और ऐप अपडेट होता है।',
        narration:
          'कमांड मिलते ही ESP32 सर्वो मोटर को शून्य से पच्चीस डिग्री तक घुमाकर दवा गिराता है और वापस शून्य पर लौटता है। इसके बाद नीली एलईडी धीरे से एक बार चमकती है और वेब ऐप पर स्टेटस पूरा हो जाता है।'
      }
    ]
  },

  hinglish: {
    modalTitle: 'MediMitra 2-Min Animated Guide',
    modalSubtitle: 'Patient Use, System Flow aur ESP32 Dispenser Module ki Poori Jankari',
    buttonLabel: 'Watch 2-Min App & ESP32 Guide',
    voiceLangBcp47: ['en-IN', 'hi-IN', 'en'],
    voiceLangDisplay: 'Hinglish Voice',
    playBtn: 'Play',
    pauseBtn: 'Pause',
    replayBtn: 'Replay',
    muteBtn: 'Mute Voice',
    unmuteBtn: 'Unmute Voice',
    voiceActiveLabel: 'Voiceover Active',
    voiceMutedLabel: 'Voiceover Muted',
    closeBtn: 'Close',
    scenes: [
      {
        id: 1,
        startSec: 0,
        durationSec: 18,
        title: '01. Patient Profile aur Login',
        caption: 'Language select karein, patient ka naam, age group (Kid, Adult, Senior) aur Male ya Female chunein.',
        narration:
          'MediMitra me aapka swagat hai. Sabse pehle apni pasand ki bhasha chunein, aur patient ka naam, age group jaise bachcha, adult ya senior, aur gender select karein. Isse app pehle step se safe medicine dose set karta hai.'
      },
      {
        id: 2,
        startSec: 18,
        durationSec: 20,
        title: '02. Smart Health Check-up',
        caption: 'Problem select karein ya type karein. Sawal age group, triggers aur allergy ke hisaab se badalte hain.',
        narration:
          'Home screen par bukhar, sar dard, zukam ya pet dard chunein ya apni takleef likhein. Das sawalon ka check-up age group, symptom trigger, hydration aur allergy history ke hisaab se sahi sawal poochta hai.'
      },
      {
        id: 3,
        startSec: 38,
        durationSec: 18,
        title: '03. Result aur Nearby Doctors',
        caption: 'Severity aur allergy check karke safe dawa, gharelu upay aur aas-paas ke doctors dikhata hai.',
        narration:
          'Sabhi das jawab ke baad MediMitra bimari ki gambhirta aur dawa allergy check karta hai, aur sahi dawa va gharelu upay batata hai. Agar koi khatre ka nishan mile toh turant paas ke doctor aur hospital dikhata hai.'
      },
      {
        id: 4,
        startSec: 56,
        durationSec: 18,
        title: '04. Cloud Sync aur Online Status',
        caption: 'Dispense Medicine click karte hi Cloud Firestore me command jaata hai aur top-right Online dikhta hai.',
        narration:
          'Dawa nikalne ke liye Dispense Medicine par click karein aur payment confirm karein. Web app turant Cloud Firestore me command bhejta hai, aur upar right side ka icon live dikhata hai ki ESP32 online hai ya offline.'
      },
      {
        id: 5,
        startSec: 74,
        durationSec: 24,
        title: '05. ESP32 Module aur Wiring',
        caption: 'ESP32 2.4 GHz Wi-Fi/Hotspot se judkar GPIO 18 aur 5V power supply se servo motor chalata hai.',
        narration:
          'Hardware ke andar ESP32 DevKit V1 aapke 2.4 gigahertz mobile hotspot ya Wi-Fi se judkar har das second me cloud ko signal deta hai. GPIO 18 servo ke orange wire ko control karta hai aur external 5 volt 2 amp supply tatha common ground isse power dete hain.'
      },
      {
        id: 6,
        startSec: 98,
        durationSec: 22,
        title: '06. 25° Dispense aur Blue LED',
        caption: 'Servo 0° se 25° ghoomkar 0° par wapas aata hai, Blue LED ek baar dheere blink hoti hai.',
        narration:
          'Command aate hi ESP32 servo motor ko zero se twenty-five degree par ghoomakar dawa nikalta hai aur wapas zero par aata hai. Phir blue LED ek baar dheere se blink hoti hai aur web app me dispensing complete dikh jaati hai.'
      }
    ]
  },

  mr: {
    modalTitle: 'मेडिमित्रा २-मिनिट अ‍ॅनिमेटेड मार्गदर्शक',
    modalSubtitle: 'रुग्ण वापर, प्रणाली कार्यपद्धती आणि ESP32 डिस्पेंसर मॉड्यूलची माहिती',
    buttonLabel: '२-मिनिट अ‍ॅप व ESP32 व्हिडिओ पहा',
    voiceLangBcp47: ['mr-IN', 'hi-IN', 'mr'],
    voiceLangDisplay: 'मराठी आवाज',
    playBtn: 'सुरू करा',
    pauseBtn: 'थांबवा',
    replayBtn: 'पुन्हा पहा',
    muteBtn: 'आवाज बंद',
    unmuteBtn: 'आवाज सुरू',
    voiceActiveLabel: 'आवाज सुरू आहे',
    voiceMutedLabel: 'आवाज बंद आहे',
    closeBtn: 'बंद करा',
    scenes: [
      {
        id: 1,
        startSec: 0,
        durationSec: 18,
        title: '01. रुग्ण नोंदणी आणि प्रोफाइल',
        caption: 'भाषा निवडा, रुग्णाचे नाव, वयोगट (लहान मूल, प्रौढ, ज्येष्ठ) आणि पुरुष किंवा महिला निवडा.',
        narration:
          'मेडिमित्रा मध्ये आपले स्वागत आहे. प्रथम तुमची भाषा निवडा आणि रुग्णाचे नाव, वयोगट जसे मूल, प्रौढ किंवा ज्येष्ठ, आणि लिंग भरा. यामुळे अ‍ॅप पहिल्याच टप्प्यापासून सुरक्षित औषधाचा डोस ठरवते.'
      },
      {
        id: 2,
        startSec: 18,
        durationSec: 20,
        title: '02. स्मार्ट लक्षण तपासणी',
        caption: 'समस्या निवडा किंवा लिहा. प्रश्न वयोगट, लक्षणांचे कारण आणि अ‍ॅलर्जीनुसार बदलतात.',
        narration:
          'मुख्य स्क्रीनवर ताप, डोकेदुखी, सर्दी किंवा पोटदुखी निवडा किंवा त्रास टाइप करा. दहा प्रश्नांची तपासणी वयोगट, लक्षणांची कारणे आणि औषधांची अ‍ॅलर्जी तपासून अचूक प्रश्न विचारते.'
      },
      {
        id: 3,
        startSec: 38,
        durationSec: 18,
        title: '03. वैद्यकीय निष्कर्ष व डॉक्टर',
        caption: 'तीव्रता व अ‍ॅलर्जी तपासून सुरक्षित औषधे, घरगुती उपाय आणि जवळचे डॉक्टर दाखवते.',
        narration:
          'दहा उत्तरे दिल्यावर मेडिमित्रा त्रासाची तीव्रता व औषधांची अ‍ॅलर्जी तपासते आणि सुरक्षित औषधे व घरगुती उपाय देते. गंभीर लक्षणे आढळल्यास जवळचे डॉक्टर व दवाखाने नकाशावर दाखवले जातात.'
      },
      {
        id: 4,
        startSec: 56,
        durationSec: 18,
        title: '04. क्लाउड सिंक व ऑनलाइन स्थिती',
        caption: 'Dispense Medicine दाबताच क्लाउड डेटाबेसमध्ये आदेश जातो आणि वर ऑनलाइन चिन्ह दिसते.',
        narration:
          'औषध काढण्यासाठी डिस्पेन्स बटनावर क्लिक करून पेमेंट पूर्ण करा. वेब अ‍ॅप लगेच क्लाउड फायरस्टोअरवर आदेश पाठवतो आणि वरच्या उजव्या कोपऱ्यातील चिन्ह ESP32 ऑनलाइन आहे की ऑफलाइन ते दाखवते.'
      },
      {
        id: 5,
        startSec: 74,
        durationSec: 24,
        title: '05. ESP32 मॉड्यूल आणि वायरिंग',
        caption: 'ESP32 २.४ GHz वाय-फाय किंवा हॉटस्पॉटने जोडून GPIO 18 व 5V सप्लायने सर्वो मोटर चालवते.',
        narration:
          'हार्डवेअरमधील ESP32 मॉड्यूल २.४ गीगाहर्ट्झ वाय-फाय किंवा मोबाइल हॉटस्पॉटशी जोडले जाऊन दर दहा सेकंदांनी क्लाउडला सिग्नल पाठवते. पिन १८ सर्वोच्या केशरी तारेशी जोडलेली असून बाह्य ५ व्होल्ट २ अँपियर सप्लाय व कॉमन ग्राउंड स्थिर ऊर्जा देते.'
      },
      {
        id: 6,
        startSec: 98,
        durationSec: 22,
        title: '06. औषध वितरण व निळी एलईडी',
        caption: 'सर्वो ०° ते २५° फिरून ०° वर परत येते, निळा दिवा हळू एकदा चमकतो व काम पूर्ण होते.',
        narration:
          'आदेश येताच ESP32 सर्वो मोटरला शून्यापासून पंचवीस अंशापर्यंत फिरवून औषध बाहेर काढते आणि परत शून्यावर आणते. त्यानंतर निळी एलईडी एकदा हळूवार चमकते आणि अ‍ॅपवर वितरण पूर्ण झाल्याचे दिसते.'
      }
    ]
  },

  bn: {
    modalTitle: 'মেডিমিত্র ২-মিনিটের অ্যানিমেটেড গাইড',
    modalSubtitle: 'রোগীর ব্যবহার, সিস্টেম প্রবাহ এবং ESP32 ডিসপেনসার মডিউলের বিবরণ',
    buttonLabel: '২-মিনিটের অ্যাপ ও ESP32 ভিডিও দেখুন',
    voiceLangBcp47: ['bn-IN', 'bn-BD', 'bn'],
    voiceLangDisplay: 'বাংলা ভয়েস',
    playBtn: 'চালান',
    pauseBtn: 'থামান',
    replayBtn: 'আবার দেখুন',
    muteBtn: 'আওয়াজ বন্ধ',
    unmuteBtn: 'আওয়াজ চালু',
    voiceActiveLabel: 'ভয়েসওভার চালু',
    voiceMutedLabel: 'আওয়াজ মিউট',
    closeBtn: 'বন্ধ করুন',
    scenes: [
      {
        id: 1,
        startSec: 0,
        durationSec: 18,
        title: '01. রোগীর সাইন-ইন ও প্রোফাইল',
        caption: 'ভাষা নির্বাচন করুন, রোগীর নাম, বয়স (শিশু, প্রাপ্তবয়স্ক, বয়োজ্যেষ্ঠ) এবং পুরুষ বা মহিলা দিন।',
        narration:
          'মেডিমিত্রতে স্বাগতম। প্রথমে আপনার পছন্দের ভাষা বেছে নিন এবং রোগীর নাম, বয়স যেমন শিশু, প্রাপ্তবয়স্ক বা বয়োজ্যেষ্ঠ এবং লিঙ্গ নির্বাচন করুন। এটি প্রথম ধাপ থেকেই সঠিক ওষুধের মাত্রা নির্ধারণে সাহায্য করে।'
      },
      {
        id: 2,
        startSec: 18,
        durationSec: 20,
        title: '02. স্মার্ট উপসর্গ পরীক্ষা',
        caption: 'সমস্যা বেছে নিন বা লিখুন। প্রশ্ন বয়স, কারণ ও ওষুধের অ্যালার্জি অনুযায়ী বদলায়।',
        narration:
          'হোম স্ক্রিনে জ্বর, মাথাব্যথা, সর্দি বা পেটের সমস্যা বেছে নিন অথবা নিজে লিখুন। দশ ধাপের পরীক্ষায় বয়স, উপসর্গের কারণ ও অ্যালার্জি অনুযায়ী সঠিক প্রশ্ন করা হয়।'
      },
      {
        id: 3,
        startSec: 38,
        durationSec: 18,
        title: '03. রিপোর্ট ও কাছের ডাক্তার',
        caption: 'গুরুত্ব ও অ্যালার্জি যাচাই করে নিরাপদ ওষুধ, ঘরোয়া প্রতিকার ও কাছের ডাক্তার দেখায়।',
        narration:
          'দশটি উত্তর দেওয়ার পর মেডিমিত্র রোগের তীব্রতা ও ওষুধের অ্যালার্জি যাচাই করে নিরাপদ ওষুধ ও ঘরোয়া উপায় জানায়। জরুরি লক্ষণ থাকলে মানচিত্রে কাছের ডাক্তার ও হাসপাতাল দেখিয়ে দেয়।'
      },
      {
        id: 4,
        startSec: 56,
        durationSec: 18,
        title: '04. ক্লাউড সিঙ্ক ও লাইভ স্ট্যাটাস',
        caption: 'Dispense Medicine-এ ক্লিক করলে ক্লাউডে কমান্ড যায় এবং ওপরে অনলাইন বা অফলাইন দেখায়।',
        narration:
          'ওষুধ নিতে ডিসপেনস বোতামে ক্লিক করে পেমেন্ট নিশ্চিত করুন। ওয়েব অ্যাপ সাথে সাথে ক্লাউড ফায়ারস্টোরে কমান্ড পাঠায় এবং উপরের ডানদিকের আইকনটি ESP32 অনলাইন না অফলাইন তা সরাসরি দেখায়।'
      },
      {
        id: 5,
        startSec: 74,
        durationSec: 24,
        title: '05. ESP32 মডিউল ও ওয়্যারিং',
        caption: 'ESP32 ২.৪ GHz ওয়াই-ফাই বা হটস্পটে যুক্ত হয়ে GPIO 18 এবং 5V সাপ্লাই দিয়ে সার্ভো চালায়।',
        narration:
          'হার্ডওয়্যারের ভেতরে ESP32 মডিউল ২.৪ গিগাহার্টজ ওয়াই-ফাই বা মোবাইল হটস্পটে যুক্ত হয়ে প্রতি দশ সেকেন্ডে ক্লাউডে সংকেত পাঠায়। পিন ১৮ সার্ভো মোটরের কমলা তার নিয়ন্ত্রণ করে এবং বাহ্যিক ৫ ভোল্ট ২ অ্যাম্পিয়ার সাপ্লাই ও কমন গ্রাউন্ড শক্তি জোগায়।'
      },
      {
        id: 6,
        startSec: 98,
        durationSec: 22,
        title: '06. ওষুধ বিতরণ ও নীল আলো',
        caption: 'সার্ভো ০° থেকে ২৫° ঘুরে ০° তে ফেরে, নীল LED ধীরে একবার জ্বলে এবং অ্যাপ আপডেট হয়।',
        narration:
          'কমান্ড পৌঁছানো মাত্রই ESP32 সার্ভো মোটরটিকে শূন্য থেকে পঁচিশ ডিগ্রিতে ঘুরিয়ে ওষুধ বের করে এবং আবার শূন্যে ফিরিয়ে আনে। এরপর নীল এলইডি ধীরে একবার জ্বলে ওঠে এবং ওয়েব অ্যাপে কাজ সম্পূর্ণ দেখায়।'
      }
    ]
  },

  ta: {
    modalTitle: 'மெடிமித்ரா 2-நிமிட அனிமேஷன் வழிகாட்டி',
    modalSubtitle: 'நோயாளி பயன்பாடு, சிஸ்டம் இயக்கம் மற்றும் ESP32 தொகுதி விளக்கம்',
    buttonLabel: '2-நிமிட ஆப் & ESP32 வீடியோ காண்க',
    voiceLangBcp47: ['ta-IN', 'ta'],
    voiceLangDisplay: 'தமிழ் குரல்',
    playBtn: 'இயக்கு',
    pauseBtn: 'நிறுத்து',
    replayBtn: 'மீண்டும் இயக்கு',
    muteBtn: 'ஒலி நிறுத்து',
    unmuteBtn: 'ஒலி இயக்கு',
    voiceActiveLabel: 'குரல் வழிகாட்டி இயங்குகிறது',
    voiceMutedLabel: 'ஒலி நிறுத்தப்பட்டது',
    closeBtn: 'மூடு',
    scenes: [
      {
        id: 1,
        startSec: 0,
        durationSec: 18,
        title: '01. நோயாளி உள்நுழைவு & சுயவிவரம்',
        caption: 'மொழியைத் தேர்ந்தெடுத்து நோயாளி பெயர், வயதுப் பிரிவு (குழந்தை, பெரியவர், மூத்தவர்) மற்றும் பாலினம் உள்ளிடவும்.',
        narration:
          'மெடிமித்ராவிற்கு வரவேற்கிறோம். முதலில் உங்கள் மொழியைத் தேர்ந்தெடுத்து, நோயாளியின் பெயர், குழந்தை, பெரியவர் அல்லது மூத்தவர் என்ற வயதுப் பிரிவு மற்றும் பாலினத்தை உள்ளிடவும். இது பாதுகாப்பான மருந்து அளவைத் தீர்மானிக்க உதவுகிறது.'
      },
      {
        id: 2,
        startSec: 18,
        durationSec: 20,
        title: '02. ஸ்மார்ட் அறிகுறி சோதனை',
        caption: 'பிரச்சனையைத் தேர்ந்தெடுக்கவும். வயது, காரணம் மற்றும் ஒவ்வாமைக்கேற்ப கேள்விகள் மாறும்.',
        narration:
          'முகப்புத் திரையில் காய்ச்சல், தலைவலி, சளி அல்லது வயிற்று வலியைத் தேர்ந்தெடுக்கவும். பத்து கேள்வி சோதனை வயதுப் பிரிவு, அறிகுறி காரணம் மற்றும் மருந்து ஒவ்வாமைக்கு ஏற்ப சரியான கேள்விகளைக் கேட்கும்.'
      },
      {
        id: 3,
        startSec: 38,
        durationSec: 18,
        title: '03. மருத்துவ முடிவு & மருத்துவர்கள்',
        caption: 'தீவிரம் மற்றும் ஒவ்வாமையை ஆராய்ந்து பாதுகாப்பான மருந்து மற்றும் அருகிலுள்ள மருத்துவர்களைக் காட்டும்.',
        narration:
          'பத்து பதில்களுக்குப் பிறகு மெடிமித்ரா தீவிரம் மற்றும் மருந்து ஒவ்வாமையைச் சரிபார்த்து பாதுகாப்பான மருந்துகளையும் வீட்டு வைத்தியத்தையும் வழங்குகிறது. அவசர அறிகுறி இருந்தால் அருகிலுள்ள மருத்துவர்களைக் காட்டும்.'
      },
      {
        id: 4,
        startSec: 56,
        durationSec: 18,
        title: '04. கிளவுட் இணைப்பு & ஆன்லைன் நிலை',
        caption: 'Dispense Medicine அழுத்தும்போது கிளவுட் வழியாக கட்டளை செல்லும்; மேல் வலதுபுறம் ஆன்லைன் காட்டும்.',
        narration:
          'மருந்தைப் பெற டிஸ்பென்ஸ் பொத்தானை அழுத்தி கட்டணத்தை உறுதிப்படுத்தவும். வெப் ஆப் உடனே கிளவுட் ஃபயர்ஸ்டோருக்கு கட்டளை அனுப்பும்; மேல் வலதுபுறத்தில் உள்ள ஐகான் ESP32 ஆன்லைனில் உள்ளதா என்பதைக் காட்டும்.'
      },
      {
        id: 5,
        startSec: 74,
        durationSec: 24,
        title: '05. ESP32 தொகுதி & வயரிங்',
        caption: 'ESP32 2.4 GHz வைஃபை வழியாக இணைந்து GPIO 18 மற்றும் 5V மின்சாரத்தால் சர்வோவை இயக்கும்.',
        narration:
          'வன்பொருளில் உள்ள ESP32 தொகுதி உங்கள் 2.4 ஜிகாஹெர்ட்ஸ் மொபைல் ஹாட்ஸ்பாட் அல்லது வைஃபையில் இணைந்து பத்து வினாடிக்கு ஒருமுறை கிளவுடுக்கு சிக்னல் அனுப்பும். பின் 18 சர்வோவின் ஆரஞ்சு வயரையும், 5 வோல்ட் 2 ஆம்ப் பவர் சப்ளை மோட்டாரையும் இயக்கும்.'
      },
      {
        id: 6,
        startSec: 98,
        durationSec: 22,
        title: '06. மருந்து விநியோகம் & நீல LED',
        caption: 'சர்வோ 0° முதல் 25° வரை சுழன்று 0°க்குத் திரும்பும்; நீல LED மெதுவாக ஒருமுறை ஒளிரும்.',
        narration:
          'கட்டளை வந்ததும் ESP32 சர்வோ மோட்டாரை பூஜ்ஜியத்திலிருந்து இருபத்தைந்து டிகிரிக்குச் சுழற்றி மருந்தை வழங்கி மீண்டும் பூஜ்ஜியத்திற்குத் திரும்பும். பின்பு நீல LED ஒருமுறை மெதுவாக ஒளிர்ந்து செயலி நிலையை நிறைவு செய்யும்.'
      }
    ]
  },

  te: {
    modalTitle: 'మెడిమిత్ర 2-నిమిషాల యానిమేటెడ్ గైడ్',
    modalSubtitle: 'రోగి వినియోగం, సిస్టమ్ పనితీరు మరియు ESP32 డిస్పెన్సర్ మాడ్యూల్ వివరాలు',
    buttonLabel: '2-నిమిషాల యాప్ & ESP32 వీడియో చూడండి',
    voiceLangBcp47: ['te-IN', 'te'],
    voiceLangDisplay: 'తెలుగు వాయిస్',
    playBtn: 'ప్లే చేయి',
    pauseBtn: 'ఆపు',
    replayBtn: 'మళ్ళీ చూడు',
    muteBtn: 'వాయిస్ ఆపు',
    unmuteBtn: 'వాయిస్ ఆన్',
    voiceActiveLabel: 'వాయిస్ ఓవర్ ఆన్',
    voiceMutedLabel: 'వాయిస్ మ్యూట్',
    closeBtn: 'మూసివేయి',
    scenes: [
      {
        id: 1,
        startSec: 0,
        durationSec: 18,
        title: '01. రోగి లాగిన్ & ప్రొఫైల్',
        caption: 'భాషను ఎంచుకుని రోగి పేరు, వయస్సు వర్గం (పిల్లలు, పెద్దలు, సీనియర్) మరియు పురుషుడు లేదా మహిళ ఎంచుకోండి.',
        narration:
          'మెడిమిత్రకు స్వాగతం. ముందుగా మీ భాషను ఎంచుకొని రోగి పేరు, పిల్లలు, పెద్దలు లేదా సీనియర్ వంటి వయస్సు వర్గం మరియు లింగాన్ని నమోదు చేయండి. దీనివల్ల యాప్ మొదటి అడుగు నుండే సురక్షిత మందు మోతాదును నిర్ణయిస్తుంది.'
      },
      {
        id: 2,
        startSec: 18,
        durationSec: 20,
        title: '02. స్మార్ట్ లక్షణాల తనిఖీ',
        caption: 'సమస్యను ఎంచుకోండి లేదా టైప్ చేయండి. ప్రశ్నలు వయస్సు, కారణం మరియు అలర్జీ ప్రకారం మారుతాయి.',
        narration:
          'హోమ్ స్క్రీన్‌పై జ్వరం, తలనొప్పి, జలుబు లేదా కడుపు నొప్పి ఎంచుకోండి. పది దశల పరీక్ష వయస్సు వర్గం, లక్షణాల కారణం మరియు మందుల అలర్జీ ఆధారంగా సరైన ప్రశ్నలు అడుగుతుంది.'
      },
      {
        id: 3,
        startSec: 38,
        durationSec: 18,
        title: '03. క్లినికల్ ఫలితం & డాక్టర్లు',
        caption: 'తీవ్రత మరియు అలర్జీలను తనిఖీ చేసి సురక్షిత మందులు, ఇంటి చిట్కాలు మరియు సమీప డాక్టర్లను చూపుతుంది.',
        narration:
          'పది సమాధానాల తర్వాత మెడిమిత్ర వ్యాధి తీవ్రత మరియు మందుల అలర్జీని పరిశీలించి సురక్షిత మందులు, ఇంటి చిట్కాలు సూచిస్తుంది. అత్యవసర సంకేతాలు ఉంటే మ్యాప్‌లో సమీప డాక్టర్లను చూపిస్తుంది.'
      },
      {
        id: 4,
        startSec: 56,
        durationSec: 18,
        title: '04. క్లౌడ్ సింక్ & ఆన్‌లైన్ స్థితి',
        caption: 'Dispense Medicine నొక్కగానే క్లౌడ్ ఫైర్‌స్టోర్ ద్వారా ఆదేశం వెళ్తుంది; పైభాగంలో ఆన్‌లైన్ కనిపిస్తుంది.',
        narration:
          'మందు తీసుకోవడానికి డిస్పెన్స్ బటన్ నొక్కి చెల్లింపు నిర్ధారించండి. వెబ్ యాప్ వెంటనే క్లౌడ్ ఫైర్‌స్టోర్‌కు ఆదేశం పంపుతుంది, మరియు కుడి పైభాగంలోని చిహ్నం ESP32 ఆన్‌లైన్‌లో ఉందో లేదో చూపిస్తుంది.'
      },
      {
        id: 5,
        startSec: 74,
        durationSec: 24,
        title: '05. ESP32 మాడ్యూల్ & వైరింగ్',
        caption: 'ESP32 2.4 GHz వై-ఫై లేదా హాట్‌స్పాట్‌తో కనెక్ట్ అయి GPIO 18 మరియు 5V ద్వారా సర్వోను నడుపుతుంది.',
        narration:
          'హార్డ్‌వేర్ లోపల ESP32 మాడ్యూల్ మీ 2.4 గిగాహెర్ట్జ్ మొబైల్ హాట్‌స్పాట్ లేదా వై-ఫైకి కనెక్ట్ అయి ప్రతి పది సెకన్లకు క్లౌడ్‌కు సిగ్నల్ పంపుతుంది. పిన్ 18 ఆరెంజ్ సిగ్నల్ వైర్‌ను నియంత్రిస్తుంది మరియు 5 వోల్ట్ 2 ఆంప్ సప్లై శక్తిని ఇస్తుంది.'
      },
      {
        id: 6,
        startSec: 98,
        durationSec: 22,
        title: '06. మందు విడుదల & నీలి LED',
        caption: 'సర్వో 0° నుండి 25° తిరిగి 0° కు వస్తుంది, నీలి LED నెమ్మదిగా ఒకసారి వెలిగి యాప్ అప్‌డేట్ అవుతుంది.',
        narration:
          'ఆదేశం రాగానే ESP32 సర్వో మోటార్‌ను సున్నా నుండి ఇరవై ఐదు డిగ్రీలకు తిప్పి మందును విడుదల చేసి తిరిగి సున్నాకు తెస్తుంది. ఆపై నీలి LED ఒకసారి నెమ్మదిగా వెలిగి యాప్‌లో ప్రక్రియ పూర్తయినట్లు చూపిస్తుంది.'
      }
    ]
  },

  gu: {
    modalTitle: 'મેડિમિત્રા 2-મિનિટ એનિમેટેડ માર્ગદર્શિકા',
    modalSubtitle: 'દર્દીનો ઉપયોગ, સિસ્ટમ પ્રક્રિયા અને ESP32 ડિસ્પેન્સર મોડ્યુલની માહિતી',
    buttonLabel: '2-મિનિટ એપ અને ESP32 વિડિઓ જુઓ',
    voiceLangBcp47: ['gu-IN', 'gu'],
    voiceLangDisplay: 'ગુજરાતી અવાજ',
    playBtn: 'ચલાવો',
    pauseBtn: 'રોકો',
    replayBtn: 'ફરીથી જુઓ',
    muteBtn: 'અવાજ બંધ',
    unmuteBtn: 'અવાજ ચાલુ',
    voiceActiveLabel: 'વૉઇસઓવર ચાલુ',
    voiceMutedLabel: 'અવાજ મ્યૂટ',
    closeBtn: 'બંધ કરો',
    scenes: [
      {
        id: 1,
        startSec: 0,
        durationSec: 18,
        title: '01. દર્દી સાઇન-ઇન અને પ્રોફાઇલ',
        caption: 'ભાષા પસંદ કરો, દર્દીનું નામ, ઉંમર વર્ગ (બાળક, પુખ્ત, વરિષ્ઠ) અને પુરુષ કે મહિલા પસંદ કરો.',
        narration:
          'મેડિમિત્રામાં આપનું સ્વાગત છે. પ્રથમ તમારી ભાષા પસંદ કરો અને દર્દીનું નામ, ઉંમર વર્ગ જેમ કે બાળક, પુખ્ત અથવા વરિષ્ઠ, તથા જાતિ દાખલ કરો. તેનાથી એપ પ્રથમ પગલાથી જ સુરક્ષિત દવાનો ડોઝ નક્કી કરે છે.'
      },
      {
        id: 2,
        startSec: 18,
        durationSec: 20,
        title: '02. સ્માર્ટ લક્ષણોની તપાસ',
        caption: 'સમસ્યા પસંદ કરો કે લખો. પ્રશ્નો ઉંમર વર્ગ, કારણ અને એલર્જી મુજબ બદલાય છે.',
        narration:
          'હોમ સ્ક્રીન પર તાવ, માથાનો દુખાવો, શરદી કે પેટની તકલીફ પસંદ કરો. દસ તબક્કાની તપાસ ઉંમર વર્ગ, લક્ષણોના કારણ અને દવાની એલર્જી મુજબ યોગ્ય પ્રશ્નો પૂછે છે.'
      },
      {
        id: 3,
        startSec: 38,
        durationSec: 18,
        title: '03. ક્લિનિકલ પરિણામ અને ડૉક્ટર',
        caption: 'ગંભીરતા અને એલર્જી તપાસીને સુરક્ષિત દવા, ઘરેલુ ઉપાય અને નજીકના ડૉક્ટર બતાવે છે.',
        narration:
          'દસ જવાબ પછી મેડિમિત્રા ગંભીરતા અને દવાની એલર્જી તપાસે છે અને સુરક્ષિત દવા તેમજ ઘરેલુ ઉપાય આપે છે. જો ગંભીર લક્ષણો દેખાય તો તરત નજીકના ડૉક્ટર અને ક્લિનિક નકશા પર બતાવે છે.'
      },
      {
        id: 4,
        startSec: 56,
        durationSec: 18,
        title: '04. ક્લાઉડ સિંક અને લાઇવ સ્ટેટસ',
        caption: 'Dispense Medicine ક્લિક કરતાં જ ક્લાઉડમાં આદેશ જાય છે અને ઉપર ઓનલાઇન દેખાય છે.',
        narration:
          'દવા લેવા માટે ડિસ્પેન્સ બટન દબાવીને પેમેન્ટની પુષ્ટિ કરો. વેબ એપ તરત ક્લાઉડ ફાયરસ્ટોર પર આદેશ મોકલે છે અને ઉપર જમણી બાજુનો આઇકન બતાવે છે કે ESP32 ઓનલાઇન છે કે ઓફલાઇન.'
      },
      {
        id: 5,
        startSec: 74,
        durationSec: 24,
        title: '05. ESP32 મોડ્યુલ અને વાયરિંગ',
        caption: 'ESP32 2.4 GHz વાઇ-ફાઇ કે હોટસ્પોટથી જોડાઈ GPIO 18 અને 5V સપ્લાય દ્વારા સર્વો ચલાવે છે.',
        narration:
          'હાર્ડવેરની અંદર ESP32 મોડ્યુલ તમારા 2.4 ગીગાહર્ટ્ઝ મોબાઇલ હોટસ્પોટ કે વાઇ-ફાઇ સાથે જોડાઈને દર દસ સેકન્ડે ક્લાઉડને સિગ્નલ આપે છે. પિન 18 સર્વોના નારંગી તારને નિયંત્રિત કરે છે અને બાહ્ય 5 વોલ્ટ 2 એમ્પિયર સપ્લાય પાવર આપે છે.'
      },
      {
        id: 6,
        startSec: 98,
        durationSec: 22,
        title: '06. દવા વિતરણ અને વાદળી LED',
        caption: 'સર્વો 0° થી 25° ફરીને 0° પર પાછો આવે છે, વાદળી LED ધીમેથી એકવાર ઝબકે છે.',
        narration:
          'આદેશ મળતાં જ ESP32 સર્વો મોટરને શૂન્યથી પચ્ચીસ ડિગ્રી ફેરવી દવા બહાર કાઢે છે અને ફરી શૂન્ય પર લાવે છે. ત્યારબાદ વાદળી LED એકવાર ધીમેથી ઝબકે છે અને એપમાં કામ પૂર્ણ થયું તે દેખાય છે.'
      }
    ]
  }
};
