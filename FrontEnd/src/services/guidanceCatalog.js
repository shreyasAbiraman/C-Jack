/**
 * Extensible Multilingual Voice Guidance Catalog for CJack
 * 
 * Supports:
 * - 6 Built-in Languages: English (en), Tamil (ta), Hindi (hi), Telugu (te), Kannada (kn), Malayalam (ml)
 * - 14 Guidance States with exact visual equivalents:
 *   1. Device activated
 *   2. Checking vitals
 *   3. Position device
 *   4. Cardiac arrest suspected
 *   5. Confirmation in progress
 *   6. CPR started
 *   7. Emergency alert sent
 *   8. GPS unavailable
 *   9. Network unavailable
 *   10. Battery low
 *   11. Sensor disconnected
 *   12. CPR paused
 *   13. Emergency stop
 *   14. Responder approaching
 * 
 * Extensibility: Additional languages can be registered dynamically via registerLanguage().
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', bcp47: 'en-US', flag: '🇬🇧' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', bcp47: 'ta-IN', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', bcp47: 'hi-IN', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', bcp47: 'te-IN', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', bcp47: 'kn-IN', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', bcp47: 'ml-IN', flag: '🇮🇳' }
];

export const GUIDANCE_CATALOG = {
  DEVICE_ACTIVATED: {
    id: 'DEVICE_ACTIVATED',
    order: 1,
    title: 'Device activated',
    severity: 'NORMAL',
    visualTitle: 'CJACK SMART VEST ONLINE',
    visualSubtitle: 'AUTONOMOUS RESUSCITATION CORE ENGAGED',
    visualAction: 'KEEP PATIENT SUPINE ON FIRM LEVEL SURFACE',
    diagramType: 'POWER_ON',
    prompts: {
      en: 'CJack activated. System self-check in progress. Remain calm.',
      ta: 'சி-ஜாக் இயக்கப்பட்டது. கணினி சுய சரிபார்ப்பு நடக்கிறது. அமைதியாக இருங்கள்.',
      hi: 'सी-जैक सक्रिय हो गया है। सिस्टम स्व-परीक्षण जारी है। शांत रहें।',
      te: 'సి-జాక్ యాక్టివేట్ చేయబడింది. సిస్టమ్ సెల్ఫ్-చెక్ జరుగుతోంది. ప్రశాంతంగా ఉండండి.',
      kn: 'ಸಿ-ಜ್ಯಾಕ್ ಸಕ್ರಿಯಗೊಂಡಿದೆ. ಸಿಸ್ಟಮ್ ಸ್ವಯಂ-ಪರೀಕ್ಷೆ ನಡೆಯುತ್ತಿದೆ. ಶಾಂತರಾಗಿರಿ.',
      ml: 'സി-ജാക്ക് സജീവമാക്കി. സിസ്റ്റം സ്വയം പരിശോധന പുരോഗമിക്കുന്നു. ശാന്തത പാലിക്കുക.'
    }
  },
  CHECKING_VITALS: {
    id: 'CHECKING_VITALS',
    order: 2,
    title: 'Checking vitals',
    severity: 'NORMAL',
    visualTitle: 'ANALYZING HEART RHYTHM & PERFUSION',
    visualSubtitle: 'LEAD-II ECG & OPTICAL PPG DUAL-SAMPLING',
    visualAction: 'DO NOT MOVE OR TOUCH PATIENT DURING ANALYSIS',
    diagramType: 'ECG_CHECK',
    prompts: {
      en: 'Analyzing heart rhythm and oxygen levels. Do not move the patient.',
      ta: 'இதய துடிப்பு மற்றும் ஆக்ஸிஜன் அளவை பகுப்பாய்வு செய்கிறது. நோயாளியை அசைக்க வேண்டாம்.',
      hi: 'हृदय गति और ऑक्सीजन के स्तर का विश्लेषण किया जा रहा है। मरीज को न हिलाएं।',
      te: 'గుండె లయ మరియు ఆక్సిజన్ స్థాయిలను విశ్లేషిస్తోంది. రోగిని కదిలించవద్దు.',
      kn: 'ಹೃದಯ ಬಡಿತ ಮತ್ತು ಆಮ್ಲಜನಕದ ಮಟ್ಟವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ. ರೋಗಿಯನ್ನು ಚಲಿಸಬೇಡಿ.',
      ml: 'ഹൃദയ താളവും ഓക്സിജൻ്റെ അളവും പരിശോധിക്കുന്നു. രോഗിയെ അനക്കരുത്.'
    }
  },
  POSITION_DEVICE: {
    id: 'POSITION_DEVICE',
    order: 3,
    title: 'Position device',
    severity: 'ACTION',
    visualTitle: 'ALIGN DEVICE WITH STERNUM',
    visualSubtitle: 'CENTER PNEUMATIC ACTUATOR OVER LOWER STERNUM',
    visualAction: 'FASTEN CHEST HARNESS STRAPS FIRMLY',
    diagramType: 'CHEST_ALIGNMENT',
    prompts: {
      en: 'Position CJack correctly. Align chest compression pad with sternum.',
      ta: 'சி-ஜாக்கை சரியாக பொருத்தவும். மார்பு அழுத்த பட்டையை நடுமார்பில் சீரமைக்கவும்.',
      hi: 'सी-जैक को सही स्थिति में रखें। चेस्ट पैड को छाती के बीच में रखें।',
      te: 'సి-జాక్‌ను సరైన స్థానంలో ఉంచండి. చెస్ట్ ప్యాడ్‌ను ఛాతీ మధ్యలో సరిచేయండి.',
      kn: 'ಸಿ-ಜ್ಯಾಕ್ ಅನ್ನು ಸರಿಯಾಗಿ ಇರಿಸಿ. ಎದೆ ಸಂಕೋಚನ ಪ್ಯಾಡ್ ಅನ್ನು ಎದೆಯ ಮಧ್ಯಕ್ಕೆ ಹೊಂದಿಸಿ.',
      ml: 'സി-ജാക്ക് ശരിയായ സ്ഥാനത്ത് വെക്കുക. നെഞ്ച് കംപ്രഷൻ പാഡ് നെഞ്ചിന്റെ മധ്യഭാഗത്ത് ക്രമീകരിക്കുക.'
    }
  },
  CARDIAC_ARREST_SUSPECTED: {
    id: 'CARDIAC_ARREST_SUSPECTED',
    order: 4,
    title: 'Cardiac arrest suspected',
    severity: 'CRITICAL',
    visualTitle: 'CARDIAC ARREST DETECTED — STAND BY',
    visualSubtitle: 'ASYSTOLE / V-FIB COLLAPSE DETECTED ON DUAL SENSORS',
    visualAction: 'PREPARE FOR AUTOMATED CHEST COMPRESSIONS',
    diagramType: 'ARREST_DETECTED',
    prompts: {
      en: 'Warning: Cardiac arrest suspected. Dual-sensor confirmation in progress.',
      ta: 'எச்சரிக்கை: மாரடைப்பு சந்தேகிக்கப்படுகிறது. சென்சார் உறுதிப்படுத்தல் நடக்கிறது.',
      hi: 'चेतावनी: कार्डियक अरेस्ट की आशंका। दोहरे सेंसर द्वारा पुष्टि की जा रही है।',
      te: 'హెచ్చరిక: గుండెపోటు అనుమానించబడింది. డ్యూయల్ సెన్సార్ నిర్ధారణ జరుగుతోంది.',
      kn: 'ಎಚ್ಚರಿಕೆ: ಹೃದಯ ಸ್ತಂಭನ ಶಂಕಿಸಲಾಗಿದೆ. ಸಂವೇದಕ ದೃಢೀಕರಣ ಪ್ರಗತಿಯಲ್ಲಿದೆ.',
      ml: 'മുന്നറിയിപ്പ്: ഹൃദയാഘാതം സംശയിക്കുന്നു. സെൻസർ പരിശോധന പുരോഗമിക്കുന്നു.'
    }
  },
  CONFIRMATION_IN_PROGRESS: {
    id: 'CONFIRMATION_IN_PROGRESS',
    order: 5,
    title: 'Confirmation in progress',
    severity: 'CRITICAL',
    visualTitle: 'CONFIRMING ARREST — 3 SECOND COUNTDOWN',
    visualSubtitle: 'FALSE-POSITIVE REJECTION FILTER RUNNING',
    visualAction: 'STAND CLEAR OF ACTUATOR RANGE IMMEDIATELY',
    diagramType: 'COUNTDOWN',
    prompts: {
      en: 'Confirming cardiac arrest. Vest will arm in three seconds. Stand clear.',
      ta: 'மாரடைப்பு உறுதி செய்யப்படுகிறது. மூன்று வினாடிகளில் சிபிஆர் துவங்கும். விலகி இருங்கள்.',
      hi: 'कार्डियक अरेस्ट की पुष्टि हो रही है। तीन सेकंड में वेस्ट सक्रिय होगी। दूर रहें।',
      te: 'గుండెపోటు నిర్ధారించబడుతోంది. మూడు సెకన్లలో వెస్ట్ ప్రారంభమవుతుంది. దూరంగా ఉండండి.',
      kn: 'ಹೃದಯ ಸ್ತಂಭನ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ. ಮೂರು ಸೆಕೆಂಡುಗಳಲ್ಲಿ ವೆಸ್ಟ್ ಚಾಲನೆಗೊಳ್ಳುತ್ತದೆ. ದೂರವಿರಿ.',
      ml: 'ഹൃദയാഘാതം സ്ഥിരീകരിക്കുന്നു. മൂന്ന് സെക്കൻഡിനുള്ളിൽ വെസ്റ്റ് പ്രവർത്തിക്കും. മാറിനിൽക്കുക.'
    }
  },
  CPR_STARTED: {
    id: 'CPR_STARTED',
    order: 6,
    title: 'CPR started',
    severity: 'CRITICAL',
    visualTitle: 'STAND CLEAR — AUTOMATED CPR ENGAGED',
    visualSubtitle: 'CLOSED-LOOP CADENCE: 108 CPM • 52 MM TARGET DEPTH',
    visualAction: 'DO NOT INTERFERE WITH PNEUMATIC COMPRESSION',
    diagramType: 'CPR_ACTIVE',
    prompts: {
      en: 'Stand clear of patient. Automated chest compressions commencing now.',
      ta: 'நோயாளி பக்கத்தில் இருந்து விலகி இருங்கள். தானியங்கி மார்பு அழுத்தம் துவங்குகிறது.',
      hi: 'मरीज से दूर रहें। स्वचालित छाती संपीडन अभी शुरू हो रहा है।',
      te: 'రోగికి దూరంగా ఉండండి. ఆటోమేటెడ్ చెస్ట్ కంప్రెషన్స్ ఇప్పుడు ప్రారంభమవుతున్నాయి.',
      kn: 'ರೋಗಿಯಿಂದ ದೂರ ನಿಲ್ಲಿ. ಸ್ವಯಂಚಾಲಿತ ಎದೆ ಸಂಕೋಚನ ಪ್ರಾರಂಭವಾಗುತ್ತಿದೆ.',
      ml: 'രോഗിയിൽ നിന്ന് മാറിനിൽക്കുക. യാന്ത്രിക ചെസ്റ്റ് കംപ്രഷൻ ആരംഭിക്കുന്നു.'
    }
  },
  EMERGENCY_ALERT_SENT: {
    id: 'EMERGENCY_ALERT_SENT',
    order: 7,
    title: 'Emergency alert sent',
    severity: 'ADVISORY',
    visualTitle: 'SOS BROADCAST TRANSMITTED VIA LORA',
    visualSubtitle: 'DISPATCH ACKNOWLEDGED • AMBULANCE UNIT ALS-MED-04 EN ROUTE',
    visualAction: 'KEEP PATIENT CLEAR UNTIL PARAMEDICS ARRIVE',
    diagramType: 'ALERT_SENT',
    prompts: {
      en: 'Emergency alert transmitted via LoRa. Medical responders have been dispatched.',
      ta: 'அவசர எச்சரிக்கை அனுப்பப்பட்டது. மருத்துவ குழு விரைந்து வருகிறது.',
      hi: 'आपातकालीन चेतावनी प्रेषित की गई। मेडिकल रिस्पॉन्डर्स को भेज दिया गया है।',
      te: 'అత్యవసర హెచ్చరిక పంపబడింది. వైద్య సహాయకులు బయలుదేరారు.',
      kn: 'ತುರ್ತು ಎಚ್ಚರಿಕೆಯನ್ನು ಕಳುಹಿಸಲಾಗಿದೆ. ವೈದ್ಯಕೀಯ ತಂಡ ಹೊರಟಿದೆ.',
      ml: 'അടിയന്തര മുന്നറിയിപ്പ് അയച്ചു. ആംബുലൻസ് പുറപ്പെട്ടിട്ടുണ്ട്.'
    }
  },
  GPS_UNAVAILABLE: {
    id: 'GPS_UNAVAILABLE',
    order: 8,
    title: 'GPS unavailable',
    severity: 'ADVISORY',
    visualTitle: 'SEARCHING FOR SATELLITE FIX — MOVE OUTDOORS',
    visualSubtitle: 'FALLING BACK TO CELL TOWER & GATEWAY TRILATERATION',
    visualAction: 'IF SAFE, RELOCATE PATIENT OUT OF UNDERGROUND SHIELDING',
    diagramType: 'GPS_SEARCH',
    prompts: {
      en: 'Caution: GPS signal unavailable. Using cell tower and gateway trilateration.',
      ta: 'எச்சரிக்கை: ஜிபிஎஸ் சிக்னல் இல்லை. டவர் இருப்பிடம் பயன்படுத்தப்படுகிறது.',
      hi: 'सावधान: जीपीएस सिग्नल उपलब्ध नहीं है। नेटवर्क टावर का उपयोग किया जा रहा है।',
      te: 'హెచ్చరిక: GPS సిగ్నల్ అందుబాటులో లేదు. నెట్‌వర్క్ టవర్ స్థానం ఉపయోగించబడుతోంది.',
      kn: 'ಎಚ್ಚರಿಕೆ: ಜಿಪಿಎಸ್ ಸಿಗ್ನಲ್ ಲಭ್ಯವಿಲ್ಲ. ನೆಟ್‌ವರ್ಕ್ ಟವರ್ ಬಳಸಲಾಗುತ್ತಿದೆ.',
      ml: 'ശ്രദ്ധിക്കുക: ജിപിഎസ് ലഭ്യമല്ല. മൊബൈൽ ടവർ ലൊക്കേഷൻ ഉപയോഗിക്കുന്നു.'
    }
  },
  NETWORK_UNAVAILABLE: {
    id: 'NETWORK_UNAVAILABLE',
    order: 9,
    title: 'Network unavailable',
    severity: 'ADVISORY',
    visualTitle: 'OFFLINE MODE — TELEMETRY QUEUED IN FLASH',
    visualSubtitle: 'ZERO BIOMETRIC DATA LOSS • STORE-AND-FORWARD BUFFER ENGAGED',
    visualAction: 'STAND-ALONE RESUSCITATION CONTINUING NORMALLY',
    diagramType: 'OFFLINE_BUFFER',
    prompts: {
      en: 'Network unavailable. Vitals and GPS stored in offline memory buffer.',
      ta: 'நெட்வொர்க் கிடைக்கவில்லை. விவரங்கள் நினைவகத்தில் சேமிக்கப்படுகின்றன.',
      hi: 'नेटवर्क उपलब्ध नहीं है। डेटा ऑफलाइन मेमोरी में सुरक्षित किया जा रहा है।',
      te: 'నెట్‌వర్క్ అందుబాటులో లేదు. డేటా ఆఫ్‌లైన్ మెమరీలో భద్రపరచబడుతోంది.',
      kn: 'ನೆಟ್‌ವರ್ಕ್ ಲಭ್ಯವಿಲ್ಲ. ಡೇಟಾವನ್ನು ಆಫ್‌ಲೈನ್ ಮೆಮೊರಿಯಲ್ಲಿ ಉಳಿಸಲಾಗುತ್ತಿದೆ.',
      ml: 'നെറ്റ്‌വർക്ക് ലഭ്യമല്ല. വിവരങ്ങൾ ഓഫ്‌ലൈൻ മെമ്മറിയിൽ സൂക്ഷിക്കുന്നു.'
    }
  },
  BATTERY_LOW: {
    id: 'BATTERY_LOW',
    order: 10,
    title: 'Battery low',
    severity: 'ACTION',
    visualTitle: 'BATTERY LOW — CONNECT EXTERNAL POWER',
    visualSubtitle: 'VEST BATTERY BELOW 20% CAPACITY',
    visualAction: 'PLUG IN 14.8V AUXILIARY RESCUE BATTERY OR AMBULANCE DC LEAD',
    diagramType: 'BATTERY_WARN',
    prompts: {
      en: 'Warning: Battery low. Connect external power supply immediately.',
      ta: 'எச்சரிக்கை: பேட்டரி குறைவாக உள்ளது. உடனே சார்ஜரை இணைக்கவும்.',
      hi: 'चेतावनी: बैटरी कम है। तुरंत बाहरी पावर कनेक्ट करें।',
      te: 'హెచ్చరిక: బ్యాటరీ తక్కువగా ఉంది. వెంటనే పవర్ కనెక్ట్ చేయండి.',
      kn: 'ಎಚ್ಚರಿಕೆ: ಬ್ಯಾಟರಿ ಕಡಿಮೆಯಾಗಿದೆ. ತಕ್ಷಣ ಚಾರ್ಜ್ ಸಂಪರ್ಕಿಸಿ.',
      ml: 'മുന്നറിയിപ്പ്: ബാറ്ററി കുറവാണ്. ഉടൻ ചാർജ് ചെയ്യുക.'
    }
  },
  SENSOR_DISCONNECTED: {
    id: 'SENSOR_DISCONNECTED',
    order: 11,
    title: 'Sensor disconnected',
    severity: 'ACTION',
    visualTitle: 'CHECK ELECTRODES & OXIMETER CABLES',
    visualSubtitle: 'LEAD-II ECG IMPEDANCE EXCEEDS 2000 OHMS',
    visualAction: 'PRESS SENSOR PADS FIRMLY AGAINST PATIENT SKIN',
    diagramType: 'SENSOR_DISCONNECT',
    prompts: {
      en: 'Alert: Biometric sensor disconnected. Check chest electrodes and oximeter probe.',
      ta: 'எச்சரிக்கை: சென்சார் இணைப்பு துண்டிக்கப்பட்டது. எலக்ட்ரோடுகளை சரிபார்க்கவும்.',
      hi: 'चेतावनी: सेंसर डिस्कनेक्ट हो गया है। छाती के इलेक्ट्रोड की जांच करें।',
      te: 'హెచ్చరిక: సెన్సార్ డిస్‌కనెక్ట్ అయింది. ఛాతీ ఎలక్ట్రోడ్‌లను తనిఖీ చేయండి.',
      kn: 'ಎಚ್ಚರಿಕೆ: ಸಂವೇದಕ ಸಂಪರ್ಕ ಕಡಿತಗೊಂಡಿದೆ. ಎಲೆಕ್ಟ್ರೋಡ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
      ml: 'മുന്നറിയിപ്പ്: സെൻസർ വേർപെട്ടു. ഇലക്ട്രോഡുകൾ പരിശോധിക്കുക.'
    }
  },
  CPR_PAUSED: {
    id: 'CPR_PAUSED',
    order: 12,
    title: 'CPR paused',
    severity: 'ADVISORY',
    visualTitle: 'CPR PAUSED — ASSESSING PATIENT RHYTHM',
    visualSubtitle: 'CYCLIC 2-MINUTE MANDATORY VENTILATION & RHYTHM CHECK',
    visualAction: 'ASSESS CAROTID PULSE AND SPONTANEOUS BREATHING',
    diagramType: 'CPR_PAUSED',
    prompts: {
      en: 'Chest compressions paused for rhythm analysis. Check for signs of breathing.',
      ta: 'சிபிஆர் தற்காலிகமாக நிறுத்தப்பட்டுள்ளது. சுவாசத்தை சரிபார்க்கவும்.',
      hi: 'लय विश्लेषण के लिए सीपीआर रोका गया है। सांस लेने की जांच करें।',
      te: 'లయ విశ్లేషణ కోసం CPR తాత్కాలికంగా ఆపబడింది. శ్వాసను తనిఖీ చేయండి.',
      kn: 'ಲಯ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ಸಿಪಿಆರ್ ನಿಲ್ಲಿಸಲಾಗಿದೆ. ಉಸಿರಾಟವನ್ನು ಪರಿಶೀಲಿಸಿ.',
      ml: 'താളം പരിശോധിക്കാൻ സി.പി.ആർ നിർത്തിവെച്ചു. ശ്വാസമെടുക്കുന്നുണ്ടോ എന്ന് നോക്കുക.'
    }
  },
  EMERGENCY_STOP: {
    id: 'EMERGENCY_STOP',
    order: 13,
    title: 'Emergency stop',
    severity: 'CRITICAL',
    visualTitle: 'EMERGENCY STOP ACTIVATED — ACTUATORS VENTED',
    visualSubtitle: 'MANUAL OVERRIDE OR SAFETY FAULT TRIGGERED',
    visualAction: 'COMMENCE MANUAL BLS CHEST COMPRESSIONS IMMEDIATELY',
    diagramType: 'EMERGENCY_STOP',
    prompts: {
      en: 'Emergency stop activated. Vest vented. Manual intervention required.',
      ta: 'அவசர நிறுத்தம் இயக்கப்பட்டது. வெஸ்ட் அழுத்தமின்றி உள்ளது.',
      hi: 'आपातकालीन रोक सक्रिय। वेस्ट का दबाव हटा दिया गया है।',
      te: 'ఎమర్జెన్సీ స్టాప్ యాక్టివేట్ చేయబడింది. వెస్ట్ ఒత్తిడి తగ్గించబడింది.',
      kn: 'ತುರ್ತು ನಿಲುಗಡೆ ಸಕ್ರಿಯಗೊಂಡಿದೆ. ವೆಸ್ಟ್ ಒತ್ತಡವನ್ನು ಇಳಿಸಲಾಗಿದೆ.',
      ml: 'എമർജൻസി സ്റ്റോപ്പ് പ്രവർത്തിച്ചു. വെസ്റ്റ് മർദ്ദം ഒഴിവാക്കി.'
    }
  },
  RESPONDER_APPROACHING: {
    id: 'RESPONDER_APPROACHING',
    order: 14,
    title: 'Responder approaching',
    severity: 'ADVISORY',
    visualTitle: 'AMBULANCE NEARBY (ETA < 1 MINUTE)',
    visualSubtitle: 'PARAMEDIC CREW ALS-MED-04 ON SCENE PERIMETER',
    visualAction: 'SIGNAL TO PARAMEDICS AND CLEAR RESCUE ACCESS CORRIDOR',
    diagramType: 'AMBULANCE_ARRIVE',
    prompts: {
      en: 'Ambulance approaching. Paramedics arriving in less than one minute.',
      ta: 'ஆம்புலன்ஸ் அருகில் வருகிறது. மருத்துவ குழு ஒரு நிமிடத்தில் வந்துவிடும்.',
      hi: 'एम्बुलेंस नजदीक आ रही है। पैरामेडिक्स एक मिनट से भी कम समय में पहुंच रहे हैं।',
      te: 'అంబులెన్స్ సమీపిస్తోంది. పారామెడిక్స్ ఒక నిమిషంలోపు చేరుకుంటున్నారు.',
      kn: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಹತ್ತಿರ ಬರುತ್ತಿದೆ. ತಂಡವು ಒಂದು ನಿಮಿಷದಲ್ಲಿ ತಲುಪಲಿದೆ.',
      ml: 'ആംബുലൻസ് അടുത്തെത്തി. വിദഗ്ധ സംഘം ഉടൻ എത്തും.'
    }
  },
  HEART_RATE_LOW: {
    id: 'HEART_RATE_LOW',
    order: 15,
    title: 'Heart rate low (Bradycardia)',
    severity: 'WARNING',
    visualTitle: 'LOW HEART RATE DETECTED (< 50 BPM)',
    visualSubtitle: 'PATIENT CONDITION: LOW • HYPOXIA RISK',
    visualAction: 'TURN ON OXYGEN SUPPLY & APPLY OXYGEN MASK',
    diagramType: 'ECG_CHECK',
    prompts: {
      en: 'The heart rate is low. Please turn on the oxygen supply and place the oxygen mask on the patient.',
      ta: 'இதய துடிப்பு குறைவாக உள்ளது. தயவுசெய்து ஆக்ஸிஜன் விநியோகத்தை இயக்கி நோயாளியின் முகக்கவசத்தை பொருத்தவும்.',
      hi: 'हृदय गति कम है। कृपया ऑक्सीजन की आपूर्ति चालू करें और मरीज को ऑक्सीजन मास्क लगाएं।',
      te: 'గుండె బడితం తక్కువగా ఉంది. దయచేసి ఆక్సిజన్ సరఫరాను ఆన్ చేసి రోగికి ఆక్సిజన్ మాస్క్ ఉంచండి.',
      kn: 'ಹೃದಯ ಬಡಿತ ಕಡಿಮೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಆಮ್ಲಜನಕ ಸರಬರಾಜನ್ನು ಆನ್ ಮಾಡಿ ರೋಗಿಗೆ ಮಾಸ್ಕ್ ಹಾಕಿ.',
      ml: 'ഹൃദയമിടിപ്പ് കുറവാണ്. ദയവായി ഓക്സിജൻ വിതരണം ഓൺ ചെയ്ത് രോഗിക്ക് മാസ്ക് വെക്കുക.'
    }
  },
  HEART_RATE_NORMAL: {
    id: 'HEART_RATE_NORMAL',
    order: 16,
    title: 'Heart rate normal',
    severity: 'NORMAL',
    visualTitle: 'NORMAL HEART RATE (50 - 100 BPM)',
    visualSubtitle: 'PATIENT CONDITION: NORMAL • HEMODYNAMIC STABILITY',
    visualAction: 'CONTINUE ROUTINE MONITORING',
    diagramType: 'POWER_ON',
    prompts: {
      en: 'Patient heart rate is normal and stable. Continue monitoring.',
      ta: 'நோயாளியின் இதயத் துடிப்பு இயல்பாகவும் சீராகவும் உள்ளது. தொடர்ந்து கண்காணிக்கவும்.',
      hi: 'मरीज की हृदय गति सामान्य और स्थिर है। निगरानी जारी रखें।',
      te: 'రోగి గుండె బడితం సాధారణంగా మరియు స్థిరంగా ఉంది. పర్యవేక్షణను కొనసాగించండి.',
      kn: 'ರೋಗಿಯ ಹೃದಯ ಬಡಿತ ಸಾಮಾನ್ಯವಾಗಿದೆ. ಮೇಲ್ವಿಚಾರಣೆ ಮುಂದುವರಿಸಿ.',
      ml: 'രോഗിയുടെ ഹൃദയമിടിപ്പ് സാധാരണ നിലയിലാണ്. നിരീക്ഷണം തുടരുക.'
    }
  },
  HEART_RATE_CRITICAL: {
    id: 'HEART_RATE_CRITICAL',
    order: 17,
    title: 'Heart rate critical / Tachycardia',
    severity: 'CRITICAL',
    visualTitle: 'CRITICAL HEART RATE / ARREST RISK (> 100 BPM)',
    visualSubtitle: 'PATIENT CONDITION: CRITICAL • CARDIAC OVERLOAD',
    visualAction: 'PREPARE RESUSCITATION AND CHEST COMPRESSIONS',
    diagramType: 'ARREST_DETECTED',
    prompts: {
      en: 'Critical heart rate detected. Please begin chest compressions immediately.',
      ta: 'அபாயகரமான இதய துடிப்பு கண்டறியப்பட்டது. நோயாளிக்கு உடனடியாக மார்பு அழுத்தம் தொடங்கவும்.',
      hi: 'गंभीर हृदय गति पाई गई। कृपया तुरंत छाती पर दबाव देना शुरू करें।',
      te: 'తీవ్రమైన గుండె బడితం గుర్తించబడింది. దయచేసి వెంటనే CPR ప్రారంభించండి.',
      kn: 'ಗಂಭೀರ ಹೃದಯ ಬಡಿತ ಕಂಡುಬಂದಿದೆ. ದಯವಿಟ್ಟು ತಕ್ಷಣವೇ ಸಿಪಿಆರ್ ಪ್ರಾರಂಭಿಸಿ.',
      ml: 'ഗുരുതരമായ ഹൃദയമിടിപ്പ്. ദയവായി ഉടൻ തന്നെ സി.പി.ആർ ആരംഭിക്കുക.'
    }
  },
  SOS_TRIGGERED: {
    id: 'SOS_TRIGGERED',
    order: 18,
    title: 'Emergency SOS activated',
    severity: 'CRITICAL',
    visualTitle: 'EMERGENCY SOS ACTIVATED — DISPATCH STREAMING',
    visualSubtitle: 'CALLING CONFIGURED EMERGENCY CONTACTS',
    visualAction: 'MAINTAIN PATIENT AIRWAY AND STAND BY FOR ARRIVAL',
    diagramType: 'ALERT_SENT',
    prompts: {
      en: 'Emergency SOS has been triggered. Dispatching emergency response and calling emergency contact.',
      ta: 'அவசர SOS இயக்கப்பட்டது. அவசர அழைப்பு அனுப்பப்படுகிறது.',
      hi: 'इमरजेंसी एसओएस सक्रिय हो गया है। आपातकालीन कॉल की जा रही है।',
      te: 'ఎమర్జెన్సీ SOS యాక్టివేట్ చేయబడింది. అత్యవసర కాల్ ప్రారంభించబడింది.',
      kn: 'ತುರ್ತು SOS ಸಕ್ರಿಯಗೊಂಡಿದೆ. ತುರ್ತು ಕರೆ ಮಾಡಲಾಗುತ್ತಿದೆ.',
      ml: 'എമർജൻസി SOS സജീവമാക്കി. അടിയന്തര കോൾ ആരംഭിച്ചു.'
    }
  }
};

/**
 * Open extension function: allows dynamic registration of additional languages
 * without rewriting application logic.
 */
export const registerLanguage = (languageConfig, promptsMap) => {
  if (!languageConfig || !languageConfig.code) {
    throw new Error('Invalid language configuration');
  }

  const existingIndex = SUPPORTED_LANGUAGES.findIndex(l => l.code === languageConfig.code);
  if (existingIndex >= 0) {
    SUPPORTED_LANGUAGES[existingIndex] = { ...SUPPORTED_LANGUAGES[existingIndex], ...languageConfig };
  } else {
    SUPPORTED_LANGUAGES.push(languageConfig);
  }

  if (promptsMap) {
    Object.keys(promptsMap).forEach(stateKey => {
      if (GUIDANCE_CATALOG[stateKey]) {
        GUIDANCE_CATALOG[stateKey].prompts[languageConfig.code] = promptsMap[stateKey];
      }
    });
  }
};
