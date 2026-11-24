import { LanguageCode } from '../context/LanguageContext';

export interface WiringVideoScene {
  id: string;
  durationSec: number;
  chapterTitle: string;
  subtitle: string;
  voiceover: string;
  keyTip: string;
}

export interface WiringVideoLocaleBundle {
  buttonLabel: string;
  modalTitle: string;
  modalBadge: string;
  playBtn: string;
  pauseBtn: string;
  replayBtn: string;
  muteVoiceBtn: string;
  enableVoiceBtn: string;
  voiceLanguageLabel: string;
  voiceNotice: string;
  closeBtn: string;
  totalDurationLabel: string;
  noBreadboardBadge: string;
  scenes: WiringVideoScene[];
}

const EN_SCENES: WiringVideoScene[] = [
  {
    id: 'parts_checklist',
    durationSec: 30,
    chapterTitle: '01. Parts Checklist (Zero Breadboard Needed)',
    subtitle: 'Gather only 4 items: ESP32 DevKit V1 (30-Pin), SG90 Servo, 5V 2A DC Adapter, and 4 direct jumper wires.',
    voiceover: 'Welcome to the five minute step by step MediMitra wiring guide. You do not need any breadboard for this setup. Keep four items ready on your desk: your thirty pin ESP32 DevKit V1 board, one SG90 micro servo motor, one external five volt two amp DC adapter with a screw terminal block, and four direct jumper wires.',
    keyTip: 'No breadboard or soldering iron needed — a cheap 2-pin DC barrel screw adapter handles all power splits cleanly.'
  },
  {
    id: 'identify_pins',
    durationSec: 30,
    chapterTitle: '02. Count & Identify Your Exact Pins',
    subtitle: 'Hold ESP32 with USB port facing down. Find Right Pin 7 (D18), Right Pin 14 (GND), and Bottom-Left Pin 15 (VIN).',
    voiceover: 'First, hold your ESP32 with the USB port pointing down toward you. On the right row, count seven pins down from the top to locate D18, which is GPIO eighteen. Near the bottom right, the second pin up from the corner is Ground. On the left row, the very bottom corner pin is VIN, your five volt power input.',
    keyTip: 'Right Pin 7 = D18 (Signal) · Right Pin 14 = GND · Bottom-Left Pin 15 = VIN (+5V).'
  },
  {
    id: 'wire_orange_signal',
    durationSec: 30,
    chapterTitle: '03. Wire 1 — Direct Orange Signal Wire (D18 → Servo)',
    subtitle: 'Plug a Female-to-Male Orange jumper straight from ESP32 D18 pin into the Orange hole on the servo 3-pin plug.',
    voiceover: 'Now connect your first wire cleanly without a breadboard. Take an orange female to male jumper wire. Push the female socket straight onto ESP32 pin D18. Take the male pin at the other end and push it firmly into the orange outer hole of your SG90 servo plug. Check that it fits snug without bending nearby pins.',
    keyTip: 'Servo 3-pin plug layout: Orange (Signal) on one edge · Red (+5V) in center · Brown (GND) on opposite edge.'
  },
  {
    id: 'split_without_breadboard',
    durationSec: 30,
    chapterTitle: '04. How to Split 5V & GND Without a Breadboard',
    subtitle: 'Insert two Red wires together into the (+) screw terminal and two Black wires together into the (-) terminal.',
    voiceover: 'Next, how do we power both the servo and the ESP32 without a breadboard? Take a two pin green DC barrel screw adapter, or strip and twist two wire ends cleanly. Put two red wire ends together into the positive screw clamp and tighten the screw. Put two ground wires together into the negative clamp and tighten firmly.',
    keyTip: 'Always tug gently on each wire after tightening the screw terminal to verify a solid copper grip.'
  },
  {
    id: 'wire_red_servo',
    durationSec: 30,
    chapterTitle: '05. Wire 2 — Servo Red Power (+5V → Servo Center Pin)',
    subtitle: 'Connect the first Red wire from 5V Supply (+) straight into the middle Red hole of the SG90 servo plug.',
    voiceover: 'Now attach the first red wire coming from your five volt positive terminal directly into the middle red socket of the SG90 servo plug. Giving the servo its own direct five volt path prevents voltage drops when the motor starts spinning, keeping your ESP32 Wi-Fi connection rock solid.',
    keyTip: 'Never power the SG90 motor from ESP32 3.3V pin — always use external 5V.'
  },
  {
    id: 'wire_red_esp32_vin',
    durationSec: 30,
    chapterTitle: '06. Wire 3 — ESP32 Standalone Power (+5V → VIN Pin)',
    subtitle: 'Plug the second Red wire from 5V Supply (+) onto ESP32 bottom-left VIN pin so ESP32 boots after USB removal.',
    voiceover: 'This third wire solves why your ESP32 stays off after unplugging USB. Take the second red wire from your five volt positive clamp and push its female connector directly onto the ESP32 bottom left VIN pin. Alternatively, leave VIN empty and power the ESP32 using a standard five volt phone charger plugged into its USB port.',
    keyTip: 'Two choices: Wire +5V to VIN (shown here), OR plug a 5V phone charger into USB Port.'
  },
  {
    id: 'wire_common_ground',
    durationSec: 30,
    chapterTitle: '07. Wire 4 — Common Ground (Supply - → ESP32 GND → Servo Brown)',
    subtitle: 'Join 5V Supply (-), ESP32 GND (2nd pin from bottom-right), and Servo Brown pin together.',
    voiceover: 'Now wire the common ground so all three parts share zero volts as their reference. From the negative screw terminal, run one black jumper to the ESP32 GND pin, located second from the bottom right. Run the second ground jumper straight into the brown edge pin of your SG90 servo plug. Never skip common ground.',
    keyTip: 'If Common GND is missing, the servo will twitch randomly or refuse to respond to D18.'
  },
  {
    id: 'usb_vs_vin_safety',
    durationSec: 30,
    chapterTitle: '08. Critical Safety Rule — Uploading vs Running Standalone',
    subtitle: 'Unplug VIN wire (or switch off 5V adapter) whenever plugging a laptop USB cable into the ESP32.',
    voiceover: 'Before turning the switch on, check this vital safety rule. Never feed five volts into the VIN pin at the exact same moment a laptop USB cable is plugged into your ESP32. When uploading new code from your laptop, simply pull the red jumper off the VIN pin first. When running standalone on the wall adapter, unplug laptop USB and plug VIN back in.',
    keyTip: 'Laptop USB IN = VIN Wire OUT · Laptop USB OUT = VIN Wire IN.'
  },
  {
    id: 'wifi_blue_led_check',
    durationSec: 30,
    chapterTitle: '09. Power ON, Wi-Fi Link & Blue LED Verification',
    subtitle: 'Blue LED blinks while connecting, then turns completely OFF once linked to Wi-Fi and MediMitra Online.',
    voiceover: 'Now switch your external five volt power supply on. The ESP32 red power light glows steady. Its blue GPIO two LED blinks smoothly while joining your mobile hotspot or router. As soon as your ESP32 syncs with the MediMitra web app, the blue LED stops blinking and turns completely off, while your web screen switches to Online.',
    keyTip: 'Blue LED OFF + Green "Online" badge in app = Ready for instant medicine dispensing.'
  },
  {
    id: 'live_dispense_test',
    durationSec: 30,
    chapterTitle: '10. Live Dispense Test (0° → 25° → 0° & Slow Confirmation Blink)',
    subtitle: 'Tap Dispense in MediMitra: Orange D18 sends PWM, servo sweeps 25°, drops dose, returns to 0°, and blinks once.',
    voiceover: 'Let us test the complete system. Tap Dispense Medicine in MediMitra. Within two and a half seconds, the ESP32 reads the command and sends PWM pulses down the orange D18 wire. The servo horn sweeps smoothly to twenty five degrees, releases the medicine, returns to zero degrees, flashes one slow blue confirmation blink, and updates your screen to Completed.',
    keyTip: 'You are 100% wired and ready — zero breadboard required!'
  }
];

const HI_SCENES: WiringVideoScene[] = [
  {
    id: 'parts_checklist',
    durationSec: 30,
    chapterTitle: '01. सामान की लिस्ट (बिना ब्रेडबोर्ड के)',
    subtitle: 'सिर्फ 4 चीज़ें रखें: ESP32 DevKit V1 (30-पिन), SG90 सर्वो मोटर, 5V 2A एडॉप्टर और 4 जम्पर वायर।',
    voiceover: 'मेडिमित्रा के इस पाँच मिनट के आसान वायरिंग वीडियो में आपका स्वागत है। इस कनेक्शन के लिए आपको किसी ब्रेडबोर्ड की ज़रूरत नहीं है। बस चार चीज़ें तैयार रखें: 30 पिन वाला ESP32 बोर्ड, एक SG90 सर्वो मोटर, एक 5 वोल्ट 2 एम्पियर का DC एडॉप्टर स्क्रू कनेक्टर के साथ, और चार सीधे जम्पर वायर।',
    keyTip: 'ब्रेडबोर्ड और सोल्डरिंग की ज़रूरत नहीं — सिर्फ 2-पिन स्क्रू कनेक्टर से सारी वायरिंग साफ हो जाती है।'
  },
  {
    id: 'identify_pins',
    durationSec: 30,
    chapterTitle: '02. ESP32 और सर्वो की सही पिन पहचानें',
    subtitle: 'USB पोर्ट नीचे की तरफ रखें। दाईं तरफ ऊपर से 7वीं पिन D18, नीचे से दूसरी पिन GND और बाईं नीचे वाली कोने की पिन VIN है।',
    voiceover: 'सबसे पहले ESP32 को ऐसे पकड़ें कि USB पोर्ट नीचे आपकी तरफ हो। दाईं लाइन में ऊपर से सातवीं पिन गिनें, यही D18 यानी GPIO 18 है। दाईं तरफ नीचे से दूसरी पिन GND यानी ग्राउंड है। और बाईं लाइन में सबसे नीचे कोने वाली पिन VIN है, जहाँ से बोर्ड को 5 वोल्ट पावर मिलती है।',
    keyTip: 'दाईं 7वीं पिन = D18 (सिग्नल) · दाईं 14वीं पिन = GND · बाईं सबसे नीचे 15वीं पिन = VIN (+5V).'
  },
  {
    id: 'wire_orange_signal',
    durationSec: 30,
    chapterTitle: '03. वायर 1 — नारंगी सिग्नल वायर (D18 → सर्वो ऑरेंज)',
    subtitle: 'ESP32 की D18 पिन से एक फीमेल-टू-मेल नारंगी वायर सीधे सर्वो प्लग के ऑरेंज छेद में लगाएं।',
    voiceover: 'अब बिना ब्रेडबोर्ड के पहला तार जोड़ते हैं। एक नारंगी फीमेल-टू-मेल जम्पर वायर लें। फीमेल सिरा सीधे ESP32 की D18 पिन पर लगाएं। दूसरा मेल पिन सर्वो के तीन पिन वाले प्लग में किनारे वाले नारंगी छेद में मजबूती से डाल दें। ध्यान रखें कि कोई पिन मुड़े नहीं।',
    keyTip: 'सर्वो प्लग क्रम: किनारे ऑरेंज (सिग्नल) · बीच में लाल (+5V) · दूसरे किनारे भूरा (GND).'
  },
  {
    id: 'split_without_breadboard',
    durationSec: 30,
    chapterTitle: '04. बिना ब्रेडबोर्ड के 5V और GND वायर कैसे बांटें',
    subtitle: 'दो लाल तार एक साथ (+) स्क्रू में और दो काले तार एक साथ (-) स्क्रू में कसें।',
    voiceover: 'अब सवाल है कि बिना ब्रेडबोर्ड के सर्वो और ESP32 दोनों को 5 वोल्ट कैसे दें। इसके लिए 2-पिन वाला हरा DC बैरल स्क्रू कनेक्टर लें, या दोनों तारों को छीलकर आपस में मोड़कर बिजली टेप लगा दें। दोनों लाल तार एक साथ (+) स्क्रू में डालकर कस दें, और दोनों ग्राउंड तार (-) स्क्रू में कस दें।',
    keyTip: 'स्क्रू कसने के बाद हर तार को हल्का सा खींचकर चेक करें कि वह ढीला तो नहीं है।'
  },
  {
    id: 'wire_red_servo',
    durationSec: 30,
    chapterTitle: '05. वायर 2 — सर्वो पावर (5V सप्लाई + → सर्वो बीच वाली लाल पिन)',
    subtitle: '5V सप्लाई के (+) टर्मिनल से पहला लाल तार सीधे सर्वो प्लग के बीच वाले लाल छेद में लगाएं।',
    voiceover: 'अब 5 वोल्ट (+) टर्मिनल से निकलने वाला पहला लाल तार सीधे सर्वो के तीन पिन प्लग में बीच वाले लाल हिस्से से जोड़ दें। सर्वो को अलग से 5 वोल्ट मिलने से मोटर पूरी ताकत से घूमती है और ESP32 का वाई-फाई कभी बंद या रीस्टार्ट नहीं होता।',
    keyTip: 'सर्वो मोटर को कभी भी ESP32 की 3.3V पिन से न चलाएं — हमेशा बाहर से 5V दें।'
  },
  {
    id: 'wire_red_esp32_vin',
    durationSec: 30,
    chapterTitle: '06. वायर 3 — ESP32 पावर (5V सप्लाई + → VIN पिन)',
    subtitle: 'दूसरा लाल तार 5V सप्लाई (+) से ESP32 की बाईं सबसे नीचे वाली VIN पिन में लगाएं ताकि USB हटाने पर भी बोर्ड चले।',
    voiceover: 'यही तीसरा तार बताता है कि USB केबल हटाने के बाद आपका ESP32 क्यों चालू नहीं हो रहा था। 5 वोल्ट (+) स्क्रू से दूसरा लाल जम्पर वायर सीधे ESP32 की बाईं सबसे नीचे वाली VIN पिन पर लगाएं। चाहें तो VIN खाली छोड़कर ESP32 के USB पोर्ट में साधारण 5 वोल्ट मोबाइल चार्जर भी लगा सकते हैं।',
    keyTip: 'दो तरीके: VIN पर लाल तार जोड़ें (जैसा दिखाया गया है), या USB पोर्ट में 5V मोबाइल चार्जर लगाएं।'
  },
  {
    id: 'wire_common_ground',
    durationSec: 30,
    chapterTitle: '07. वायर 4 — कॉमन ग्राउंड (सप्लाई - → ESP32 GND → सर्वो ब्राउन)',
    subtitle: '5V सप्लाई (-), ESP32 की GND पिन और सर्वो के भूरे तार को एक साथ जोड़ें।',
    voiceover: 'अब कॉमन ग्राउंड जोड़ें ताकि तीनों हिस्से एक ही ज़ीरो वोल्ट लेवल पर रहें। नेगेटिव (-) स्क्रू से एक काला तार ESP32 की दाईं तरफ नीचे से दूसरी पिन यानी GND में लगाएं। दूसरा ग्राउंड तार सीधे सर्वो के भूरे किनारे वाले पिन में लगाएं। कॉमन ग्राउंड के बिना मोटर कभी सही काम नहीं करेगी।',
    keyTip: 'कॉमन GND छूटने पर सर्वो अपने आप हिलती रहेगी या कमांड पर नहीं घूमेगी।'
  },
  {
    id: 'usb_vs_vin_safety',
    durationSec: 30,
    chapterTitle: '08. ज़रूरी सुरक्षा नियम — कोड अपलोड बनाम स्टैंडअलोन उपयोग',
    subtitle: 'लैपटॉप की USB केबल लगाते समय VIN तार को निकाल दें (या 5V एडॉप्टर बंद रखें)।',
    voiceover: 'स्विच ऑन करने से पहले यह ज़रूरी सुरक्षा नियम समझ लें। जब लैपटॉप की USB केबल ESP32 में लगी हो, तब VIN पिन पर बाहर से 5 वोल्ट न दें। कोड अपलोड करते समय VIN का लाल तार निकाल दें। और जब लैपटॉप हटाकर एडॉप्टर से चलाना हो, तब USB हटा दें और VIN तार लगा दें।',
    keyTip: 'लैपटॉप USB लगा है = VIN तार बाहर · लैपटॉप USB हटा है = VIN तार अंदर।'
  },
  {
    id: 'wifi_blue_led_check',
    durationSec: 30,
    chapterTitle: '09. पावर ऑन, वाई-फाई कनेक्शन और ब्लू LED जांच',
    subtitle: 'कनेक्ट होते समय नीली लाइट जलेगी-बुझेगी, और वेब ऐप से जुड़ते ही ब्लिंक होना बंद हो जाएगी।',
    voiceover: 'अब 5 वोल्ट पावर एडॉप्टर ऑन करें। ESP32 की लाल पावर लाइट जल जाएगी और नीली GPIO 2 लाइट हॉटस्पॉट या राउटर ढूंढते समय ब्लिंक करेगी। जैसे ही ESP32 आपके मेडिमित्रा वेब ऐप से जुड़ता है, नीली लाइट का ब्लिंक होना पूरी तरह बंद हो जाता है और स्क्रीन पर Online दिखने लगता है।',
    keyTip: 'नीली लाइट बंद + ऐप में हरा "Online" बटन = आपका डिस्पेंसर पूरी तरह तैयार है।'
  },
  {
    id: 'live_dispense_test',
    durationSec: 30,
    chapterTitle: '10. लाइव दवाई डिस्पेंस टेस्ट (0° → 25° → 0°)',
    subtitle: 'ऐप में Dispense दबाएं: D18 से सिग्नल जाएगा, सर्वो 25° घूमकर दवाई गिराएगी, वापस 0° आएगी और 1 धीमी ब्लिंक देगी।',
    voiceover: 'चलिए अब पूरा सिस्टम टेस्ट करते हैं। मेडिमित्रा में Dispense बटन दबाएं। ढाई सेकंड के अंदर ESP32 ऑरेंज D18 वायर से सिग्नल भेजता है। सर्वो मोटर 0 से 25 डिग्री घूमकर दवाई नीचे गिराती है, वापस 0 डिग्री पर आती है, नीली लाइट एक बार धीरे से चमकती है और स्क्रीन पर Completed आ जाता है।',
    keyTip: 'बधाई हो — बिना किसी ब्रेडबोर्ड के आपकी पूरी वायरिंग 100% तैयार है!'
  }
];

function buildLocalizedWrapper(
  base: Omit<WiringVideoLocaleBundle, 'scenes'>,
  scenes: WiringVideoScene[]
): WiringVideoLocaleBundle {
  return { ...base, scenes };
}

export const WIRING_VIDEO_TRANSLATIONS: Record<LanguageCode, WiringVideoLocaleBundle> = {
  en: buildLocalizedWrapper(
    {
      buttonLabel: '5-Min Wiring Video',
      modalTitle: 'Complete 5-Minute Wiring Guide (No Breadboard)',
      modalBadge: '5-Min Breadboard-Free Animation',
      playBtn: 'Play',
      pauseBtn: 'Pause',
      replayBtn: 'Replay',
      muteVoiceBtn: 'Mute Voice',
      enableVoiceBtn: 'Voice On',
      voiceLanguageLabel: 'Voice Language',
      voiceNotice: 'Step-by-step voice guide active with synchronized pin highlights & safety prompts.',
      closeBtn: 'Close Video',
      totalDurationLabel: '05:00',
      noBreadboardBadge: 'NO BREADBOARD'
    },
    EN_SCENES
  ),

  hi: buildLocalizedWrapper(
    {
      buttonLabel: '5-मिनट वायरिंग वीडियो',
      modalTitle: 'पूरा 5-मिनट वायरिंग वीडियो गाइड (बिना ब्रेडबोर्ड)',
      modalBadge: '5-मिनट बिना ब्रेडबोर्ड एनिमेशन',
      playBtn: 'चलाएं',
      pauseBtn: 'रोकें',
      replayBtn: 'फिर देखें',
      muteVoiceBtn: 'आवाज़ बंद',
      enableVoiceBtn: 'आवाज़ चालू',
      voiceLanguageLabel: 'आवाज़ की भाषा',
      voiceNotice: 'आपकी भाषा में स्टेप-बाय-स्टेप आवाज़ और पिन हाइलाइट साथ चल रहे हैं।',
      closeBtn: 'बंद करें',
      totalDurationLabel: '05:00',
      noBreadboardBadge: 'बिना ब्रेडबोर्ड'
    },
    HI_SCENES
  ),

  hinglish: buildLocalizedWrapper(
    {
      buttonLabel: '5-Min Wiring Video',
      modalTitle: 'Complete 5-Min Wiring Guide (Bina Breadboard Ke)',
      modalBadge: '5-Min No-Breadboard Animation',
      playBtn: 'Play',
      pauseBtn: 'Pause',
      replayBtn: 'Replay',
      muteVoiceBtn: 'Mute Voice',
      enableVoiceBtn: 'Voice On',
      voiceLanguageLabel: 'Voice Language',
      voiceNotice: 'Guided Hindi-English voiceover aur step-by-step pin highlights active hain.',
      closeBtn: 'Close Video',
      totalDurationLabel: '05:00',
      noBreadboardBadge: 'NO BREADBOARD'
    },
    [
      {
        id: 'parts_checklist',
        durationSec: 30,
        chapterTitle: '01. Saman Check Karein (Bina Breadboard Ke)',
        subtitle: 'Sirf 4 cheezein rakhein: ESP32 DevKit V1, SG90 Servo, 5V 2A Adapter aur 4 jumper wires.',
        voiceover: 'MediMitra ke is five minute step by step wiring guide mein aapka swagat hai. Is connection ke liye aapko kisi breadboard ki zaroorat nahi hai. Apne desk par chaar cheezein rakhein: tees pin wala ESP32 board, ek SG90 servo motor, ek five volt two amp DC adapter screw block ke saath, aur chaar jumper wires.',
        keyTip: 'Bina breadboard aur bina soldering — ek 2-pin DC barrel screw terminal se wiring clean rehti hai.'
      },
      {
        id: 'identify_pins',
        durationSec: 30,
        chapterTitle: '02. Sahi Pins Pehchanein (D18, GND, VIN)',
        subtitle: 'ESP32 ka USB port neeche rakhein: Right 7th pin D18, Right bottom se 2nd pin GND, aur Left corner pin VIN hai.',
        voiceover: 'Sabse pehle ESP32 ko is tarah rakhein ki USB port neeche ki taraf ho. Right side mein upar se seventh pin count karein, woh D18 yani GPIO eighteen hai. Right side mein neeche se doosri pin Ground hai. Aur left side mein sabse neeche corner wali pin VIN hai jo board ko five volt power deti hai.',
        keyTip: 'Right 7th = D18 (Signal) · Right 14th = GND · Bottom-Left = VIN (+5V).'
      },
      {
        id: 'wire_orange_signal',
        durationSec: 30,
        chapterTitle: '03. Wire 1 — Orange Signal Wire (D18 → Servo Orange)',
        subtitle: 'Female-to-Male Orange wire ESP32 ki D18 pin se seedha Servo plug ke Orange hole mein lagayein.',
        voiceover: 'Ab pehli wire bina breadboard ke seedhi lagate hain. Ek orange female to male jumper lein. Female end ko ESP32 ki D18 pin par dabayein. Doosre end ko SG90 servo ke teen pin plug ke edge wale orange hole mein ache se fit karein.',
        keyTip: 'Servo 3-pin order: Edge Orange (Signal) · Center Red (+5V) · Edge Brown (GND).'
      },
      {
        id: 'split_without_breadboard',
        durationSec: 30,
        chapterTitle: '04. Bina Breadboard 5V aur GND Wire Split Kaise Karein',
        subtitle: 'Dono Red wires ek saath (+) screw mein aur dono Ground wires (-) screw mein tight karein.',
        voiceover: 'Ab bina breadboard ke servo aur ESP32 dono ko power dene ke liye do pin wala green DC screw terminal lein, ya dono wires ko twist karke electrical tape laga dein. Dono red wires ko ek saath positive screw mein aur dono black wires ko negative screw mein tight kas dein.',
        keyTip: 'Screw tight karne ke baad har wire halka kheench kar check karein.'
      },
      {
        id: 'wire_red_servo',
        durationSec: 30,
        chapterTitle: '05. Wire 2 — Servo Red Power (+5V → Servo Center Pin)',
        subtitle: '5V Supply (+) se pehla Red wire seedha SG90 servo plug ke beech wale Red pin mein lagayein.',
        voiceover: 'Ab five volt positive se nikalne wala pehla red wire seedha SG90 servo plug ke beech wale red pin mein lagayein. Direct external five volt milne se motor ghoomte waqt ESP32 ka Wi-Fi kabhi reset nahi hota.',
        keyTip: 'Servo ko kabhi ESP32 ki 3.3V pin se power na dein.'
      },
      {
        id: 'wire_red_esp32_vin',
        durationSec: 30,
        chapterTitle: '06. Wire 3 — ESP32 Power (+5V → VIN Pin)',
        subtitle: 'Doosra Red wire 5V Supply (+) se ESP32 ki bottom-left VIN pin mein lagayein taaki USB hatane par board on ho.',
        voiceover: 'Yeh teesri wire batati hai ki USB hatane ke baad ESP32 start kyun nahi ho raha tha. Five volt positive se doosri red wire seedha ESP32 ki bottom left VIN pin par lagayein. Ya VIN khali chhodkar ESP32 ke USB port mein ek normal phone charger laga sakte hain.',
        keyTip: 'Option A: +5V ko VIN par lagayein · Option B: USB port mein 5V phone charger lagayein.'
      },
      {
        id: 'wire_common_ground',
        durationSec: 30,
        chapterTitle: '07. Wire 4 — Common Ground (Supply - → ESP32 GND → Servo Brown)',
        subtitle: '5V Supply (-), ESP32 GND aur Servo Brown wire ko ek saath common ground mein jodein.',
        voiceover: 'Ab common ground connect karein taaki teeno parts ek zero volt reference share karein. Negative screw se ek black wire ESP32 ke right GND pin mein lagayein aur doosra ground wire servo ke brown edge pin mein lagayein.',
        keyTip: 'Common GND ke bina servo kaam nahi karegi ya hilegi.'
      },
      {
        id: 'usb_vs_vin_safety',
        durationSec: 30,
        chapterTitle: '08. Zaroori Safety Rule — Laptop USB vs VIN',
        subtitle: 'Laptop USB cable lagate waqt VIN ki red wire zaroor nikal dein.',
        voiceover: 'Power on karne se pehle yeh safety rule yaad rakhein. Jab laptop USB cable ESP32 mein lagi ho, tab VIN pin par five volt wire mat lagayein. Code upload karte waqt VIN wire hata dein, aur standalone chalate waqt laptop USB hatakar VIN laga dein.',
        keyTip: 'Laptop USB IN = VIN Wire OUT · Laptop USB OUT = VIN Wire IN.'
      },
      {
        id: 'wifi_blue_led_check',
        durationSec: 30,
        chapterTitle: '09. Power ON, Wi-Fi Link aur Blue LED Check',
        subtitle: 'Wi-Fi aur MediMitra app se judte hi Blue LED blink hona band ho jaayegi aur app Online dikhega.',
        voiceover: 'Ab external five volt adapter on karein. ESP32 ki red power light jal jaayegi aur blue LED connect hote waqt blink karegi. Jaise hi ESP32 aapke MediMitra app se link hota hai, blue light blink karna band kar degi aur app par Online badge dikhega.',
        keyTip: 'Blue LED OFF + App mein Online = Hardware ready hai.'
      },
      {
        id: 'live_dispense_test',
        durationSec: 30,
        chapterTitle: '10. Live Dispense Test (0° → 25° → 0°)',
        subtitle: 'Dispense button dabane par servo 25° ghoomti hai, dawai girati hai, 0° wapas aati hai aur 1 slow blink deti hai.',
        voiceover: 'Ab system test karein. MediMitra mein Dispense button dabayein. Dhai second ke andar orange D18 wire se signal jaata hai, servo horn twenty five degrees ghoomkar dawai girata hai, zero degrees wapas aata hai, blue LED ek slow blink deti hai aur status Completed ho jaata hai.',
        keyTip: 'Bina breadboard ke aapki poori wiring 100% ready hai!'
      }
    ]
  ),

  mr: buildLocalizedWrapper(
    {
      buttonLabel: '5-मिनिट वायरिंग व्हिडिओ',
      modalTitle: 'संपूर्ण 5-मिनिटांचा वायरिंग व्हिडिओ (ब्रेडबोर्डशिवाय)',
      modalBadge: '5-मिनिट ब्रेडबोर्ड-मुक्त अ‍ॅनिमेशन',
      playBtn: 'चालवा',
      pauseBtn: 'थांबवा',
      replayBtn: 'पुन्हा पहा',
      muteVoiceBtn: 'आवाज बंद',
      enableVoiceBtn: 'आवाज चालू',
      voiceLanguageLabel: 'आवाजाची भाषा',
      voiceNotice: 'मराठी आवाज आणि सिंक्रोनाइझ पिन मार्गदर्शक सुरू आहे.',
      closeBtn: 'बंद करा',
      totalDurationLabel: '05:00',
      noBreadboardBadge: 'ब्रेडबोर्डशिवाय'
    },
    EN_SCENES.map((s, idx) => ({
      ...s,
      chapterTitle: HI_SCENES[idx].chapterTitle,
      voiceover: HI_SCENES[idx].voiceover
    }))
  ),

  bn: buildLocalizedWrapper(
    {
      buttonLabel: '৫-মিনিট ওয়্যারিং ভিডিও',
      modalTitle: 'সম্পূর্ণ ৫-মিনিটের ওয়্যারিং গাইড (ব্রেডবোর্ড ছাড়া)',
      modalBadge: '৫-মিনিট ব্রেডবোর্ড-মুক্ত অ্যানিমেশন',
      playBtn: 'চালান',
      pauseBtn: 'থামান',
      replayBtn: 'আবার দেখুন',
      muteVoiceBtn: 'আওয়াজ বন্ধ',
      enableVoiceBtn: 'আওয়াজ চালু',
      voiceLanguageLabel: 'ভয়েস ভাষা',
      voiceNotice: 'ধাপে ধাপে ভয়েস ও পিন হাইলাইট নির্দেশিকা চলছে।',
      closeBtn: 'বন্ধ করুন',
      totalDurationLabel: '05:00',
      noBreadboardBadge: 'ব্রেডবোর্ড ছাড়া'
    },
    EN_SCENES
  ),

  ta: buildLocalizedWrapper(
    {
      buttonLabel: '5-நிமிட வயரிங் வீடியோ',
      modalTitle: 'முழு 5-நிமிட வயரிங் வழிகாட்டி (பிரெட்போர்டு இல்லாமல்)',
      modalBadge: '5-நிமிட நேரடி அனிமேஷன்',
      playBtn: 'இயக்கு',
      pauseBtn: 'நிறுத்து',
      replayBtn: 'மீண்டும் பார்',
      muteVoiceBtn: 'ஒலி நிறுத்து',
      enableVoiceBtn: 'ஒலி இயக்கு',
      voiceLanguageLabel: 'குரல் மொழி',
      voiceNotice: 'படிப்படியான குரல் வழிகாட்டி மற்றும் பின் விளக்கம் இயக்கத்தில் உள்ளது.',
      closeBtn: 'மூடு',
      totalDurationLabel: '05:00',
      noBreadboardBadge: 'NO BREADBOARD'
    },
    EN_SCENES
  ),

  te: buildLocalizedWrapper(
    {
      buttonLabel: '5-నిమిషాల వైరింగ్ వీడియో',
      modalTitle: 'పూర్తి 5-నిమిషాల వైరింగ్ గైడ్ (బ్రెడ్‌బోర్డ్ లేకుండా)',
      modalBadge: '5-నిమిషాల యానిమేషన్ గైడ్',
      playBtn: 'ప్లే',
      pauseBtn: 'ఆపు',
      replayBtn: 'మళ్లీ చూడండి',
      muteVoiceBtn: 'వాయిస్ ఆఫ్',
      enableVoiceBtn: 'వాయిస్ ఆన్',
      voiceLanguageLabel: 'వాయిస్ భాష',
      voiceNotice: 'దశల వారీ వాయిస్ గైడ్ మరియు పిన్ హైలైట్స్ యాక్టివ్‌గా ఉన్నాయి.',
      closeBtn: 'మూసివేయండి',
      totalDurationLabel: '05:00',
      noBreadboardBadge: 'NO BREADBOARD'
    },
    EN_SCENES
  ),

  gu: buildLocalizedWrapper(
    {
      buttonLabel: '5-મિનિટ વાયરિંગ વિડિઓ',
      modalTitle: 'સંપૂર્ણ 5-મિનિટની વાયરિંગ ગાઇડ (બ્રેડબોર્ડ વિના)',
      modalBadge: '5-મિનિટ બ્રેડબોર્ડ-ફ્રી એનિમેશન',
      playBtn: 'ચલાવો',
      pauseBtn: 'રોકો',
      replayBtn: 'ફરી જુઓ',
      muteVoiceBtn: 'અવાજ બંધ',
      enableVoiceBtn: 'અવાજ ચાલુ',
      voiceLanguageLabel: 'અવાજની ભાષા',
      voiceNotice: 'સ્ટેપ-બાય-સ્ટેપ વૉઇસ ગાઇડ અને પિન હાઇલાઇટ્સ ચાલુ છે.',
      closeBtn: 'બંધ કરો',
      totalDurationLabel: '05:00',
      noBreadboardBadge: 'બ્રેડબોર્ડ વિના'
    },
    EN_SCENES
  )
};
