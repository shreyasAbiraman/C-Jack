/**
 * Voice Guidance Service for CJack
 * 
 * Manages:
 * 1. 6 Supported Regional & International Languages:
 *    - English (en), Tamil (ta), Hindi (hi), Telugu (te), Kannada (kn), Malayalam (ml)
 * 2. 14 Guidance States with Medical Accuracy:
 *    - DEVICE_ACTIVATED, CHECKING_VITALS, POSITION_DEVICE, CARDIAC_ARREST_SUSPECTED,
 *      CONFIRMATION_IN_PROGRESS, CPR_STARTED, EMERGENCY_ALERT_SENT, GPS_UNAVAILABLE,
 *      NETWORK_UNAVAILABLE, BATTERY_LOW, SENSOR_DISCONNECTED, CPR_PAUSED,
 *      EMERGENCY_STOP, RESPONDER_APPROACHING
 * 3. Acoustic Hardware Parameters (MAX98357A I2S Mono DAC, 85 dBA SPL, SPI Flash Bank)
 * 4. Active Guidance Broadcast State
 */

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', bcp47: 'en-US', available: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', bcp47: 'ta-IN', available: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', bcp47: 'hi-IN', available: true },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', bcp47: 'te-IN', available: true },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', bcp47: 'kn-IN', available: true },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', bcp47: 'ml-IN', available: true }
];

const GUIDANCE_STATES = {
  DEVICE_ACTIVATED: {
    id: 'DEVICE_ACTIVATED',
    title: 'Device Activated',
    severity: 'NORMAL',
    visualTitle: 'CJACK FIRST-AID JACKET ONLINE',
    visualIcon: 'Power',
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
    title: 'Checking Vitals',
    severity: 'NORMAL',
    visualTitle: 'ANALYZING HEART RHYTHM & PERFUSION',
    visualIcon: 'Activity',
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
    title: 'Position Device',
    severity: 'ACTION',
    visualTitle: 'ALIGN DEVICE WITH STERNUM',
    visualIcon: 'Target',
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
    title: 'Cardiac Arrest Suspected',
    severity: 'CRITICAL',
    visualTitle: 'CARDIAC ARREST DETECTED — STAND BY',
    visualIcon: 'AlertOctagon',
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
    title: 'Confirmation in Progress',
    severity: 'CRITICAL',
    visualTitle: 'CONFIRMING ARREST — 3 SECOND COUNTDOWN',
    visualIcon: 'Clock',
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
    title: 'CPR Started',
    severity: 'CRITICAL',
    visualTitle: 'STAND CLEAR — AUTOMATED CPR ENGAGED',
    visualIcon: 'Zap',
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
    title: 'Emergency Alert Sent',
    severity: 'ADVISORY',
    visualTitle: 'SOS BROADCAST TRANSMITTED VIA LORA',
    visualIcon: 'Send',
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
    title: 'GPS Unavailable',
    severity: 'ADVISORY',
    visualTitle: 'SEARCHING FOR SATELLITE FIX — MOVE OUTDOORS',
    visualIcon: 'NavigationOff',
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
    title: 'Network Unavailable',
    severity: 'ADVISORY',
    visualTitle: 'OFFLINE MODE — TELEMETRY QUEUED IN FLASH',
    visualIcon: 'WifiOff',
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
    title: 'Battery Low',
    severity: 'ACTION',
    visualTitle: 'BATTERY LOW — CONNECT EXTERNAL POWER',
    visualIcon: 'BatteryWarning',
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
    title: 'Sensor Disconnected',
    severity: 'ACTION',
    visualTitle: 'CHECK ELECTRODES & OXIMETER CABLES',
    visualIcon: 'Unplug',
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
    title: 'CPR Paused',
    severity: 'ADVISORY',
    visualTitle: 'CPR PAUSED — ASSESSING PATIENT RHYTHM',
    visualIcon: 'PauseCircle',
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
    title: 'Emergency Stop',
    severity: 'CRITICAL',
    visualTitle: 'EMERGENCY STOP ACTIVATED — ACTUATORS VENTED',
    visualIcon: 'ShieldAlert',
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
    title: 'Responder Approaching',
    severity: 'ADVISORY',
    visualTitle: 'AMBULANCE NEARBY (ETA < 1 MINUTE)',
    visualIcon: 'Ambulance',
    prompts: {
      en: 'Ambulance approaching. Paramedics arriving in less than one minute.',
      ta: 'ஆம்புலன்ஸ் அருகில் வருகிறது. மருத்துவ குழு ஒரு நிமிடத்தில் வந்துவிடும்.',
      hi: 'एम्बुलेंस नजदीक आ रही है। पैरामेडिक्स एक मिनट से भी कम समय में पहुंच रहे हैं।',
      te: 'అంబులెన్స్ సమీపిస్తోంది. పారామెడిక్స్ ఒక నిమిషంలోపు చేరుకుంటున్నారు.',
      kn: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಹತ್ತಿರ ಬರುತ್ತಿದೆ. ತಂಡವು ಒಂದು ನಿಮಿಷದಲ್ಲಿ ತಲುಪಲಿದೆ.',
      ml: 'ആംബുലൻസ് അടുത്തെത്തി. വിദഗ്ധ സംഘം ഉടൻ എത്തും.'
    }
  }
};

class VoiceGuidanceService {
  constructor() {
    this.selectedLanguage = 'en';
    this.activeStateKey = 'CPR_STARTED';
    this.volumeSPL = 85; // 85 dBA @ 1m
    this.hardwareAudio = {
      amplifier: 'MAX98357A I2S Mono Class-D Amplifier',
      speakerOutputSPL: '85 dBA @ 1 Meter',
      ambientNoiseAutoGain: true,
      audioBufferLatencyMs: 12,
      spiFlashROM: '16 MB Winbond W25Q128 (Pre-baked PCM Banks)',
      dacStatus: 'ONLINE_ACTIVE',
      status: 'OPERATIONAL'
    };
  }

  getLanguages() {
    return {
      success: true,
      languages: SUPPORTED_LANGUAGES,
      defaultLanguage: 'en',
      totalCount: SUPPORTED_LANGUAGES.length
    };
  }

  getGuidanceCatalog(lang = null) {
    const selectedLang = lang || this.selectedLanguage;
    return {
      success: true,
      selectedLanguage: selectedLang,
      states: Object.values(GUIDANCE_STATES).map(st => ({
        id: st.id,
        title: st.title,
        severity: st.severity,
        visualTitle: st.visualTitle,
        visualIcon: st.visualIcon,
        voicePrompt: st.prompts[selectedLang] || st.prompts.en,
        englishReference: st.prompts.en
      }))
    };
  }

  getStatus() {
    const activeState = GUIDANCE_STATES[this.activeStateKey] || GUIDANCE_STATES.CPR_STARTED;
    return {
      success: true,
      selectedLanguage: this.selectedLanguage,
      activeStateKey: this.activeStateKey,
      activePrompt: activeState.prompts[this.selectedLanguage] || activeState.prompts.en,
      visualTitle: activeState.visualTitle,
      severity: activeState.severity,
      hardware: this.hardwareAudio,
      volumeSPL: this.volumeSPL,
      timestamp: new Date().toISOString()
    };
  }

  broadcast(stateKey, language = null) {
    if (!GUIDANCE_STATES[stateKey]) {
      throw new Error(`Invalid guidance state: ${stateKey}`);
    }

    this.activeStateKey = stateKey;
    if (language) {
      this.selectedLanguage = language;
    }

    return this.getStatus();
  }

  setLanguage(langCode) {
    const exists = SUPPORTED_LANGUAGES.some(l => l.code === langCode);
    if (!exists) {
      throw new Error(`Unsupported language code: ${langCode}. Supported: ${SUPPORTED_LANGUAGES.map(l => l.code).join(', ')}`);
    }

    this.selectedLanguage = langCode;
    return this.getStatus();
  }
}

module.exports = new VoiceGuidanceService();
