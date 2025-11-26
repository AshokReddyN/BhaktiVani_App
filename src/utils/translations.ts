import { Language } from '../services/languageService'

export interface Translations {
    appName: string
    settings: string
    favorites: string
    language: string
    sync: string
    syncContent: string
    lastSynced: string
    never: string
    syncing: string
    syncSuccess: string
    syncError: string
    noInternet: string
    contentAttribution: string
    contentAttributionText: string
    changeLanguage: string
    changeLanguageConfirm: string
    cancel: string
    continue: string
    languageChanged: string
    languageChangeSuccess: string
    languageChangeFailed: string
    ok: string
    deities: string
    stotras: string
    selectLanguage: string
    downloadingContent: string
    telugu: string
    kannada: string
    fontSize: string
    theme: string
    small: string
    medium: string
    large: string
    light: string
    sepia: string
    dark: string
    searchStotra: string
    searchDeities: string
    noDeitiesFound: string
    tryDifferentSearch: string
    displaySettings: string
    contentSettings: string
    aboutSupport: string
    templeInfo: string
    templeName: string
    templeAddress: string
    feedback: string
    sendFeedback: string
    feedbackDescription: string
    appVersion: string
    contentAttribution: string
    contentAttributionText: string
}

export const translations: Record<Language, Translations> = {
    telugu: {
        appName: 'భక్తి వాణి',
        settings: 'సెట్టింగ్‌లు',
        favorites: 'నాకు ఇష్టమైనవి',
        language: 'భాష',
        sync: 'సమకాలీకరించు',
        syncContent: 'కంటెంట్ సమకాలీకరించండి',
        lastSynced: 'చివరిగా సమకాలీకరించబడింది',
        never: 'ఎప్పుడూ లేదు',
        syncing: 'సమకాలీకరిస్తోంది...',
        syncSuccess: 'విజయవంతంగా సమకాలీకరించబడింది!',
        syncError: 'సమకాలీకరణ విफలమైంది',
        noInternet: 'ఇంటర్నెట్ కనెక్షన్ లేదు',
        contentAttribution: 'కంటెంట్ ఆపాదన',
        contentAttributionText: 'శ్రీ లక్ష్మీ వేంకటేశ్వర స్వామి దేవస్థానం నుండి అందించబడింది',
        changeLanguage: 'భాషను మార్చండి',
        changeLanguageConfirm: 'కోసం అన్ని కంటెంట్‌ను డౌన్‌లోడ్ చేస్తుంది. కొనసాగించాలా?',
        cancel: 'రద్దు చేయండి',
        continue: 'కొనసాగించండి',
        languageChanged: 'భాష మార్చబడింది',
        languageChangeSuccess: 'లో దేవతలు మరియు స్తోత్రాలు విజయవంతంగా డౌన్‌లోడ్ చేయబడ్డాయి.',
        languageChangeFailed: 'భాష నవీకరించబడింది, కానీ కంటెంట్ సమకాలీకరణ విఫలమైంది. మీరు సమకాలీకరణ బటన్ నుండి మాన్యువల్‌గా సమకాలీకరించవచ్చు.',
        ok: 'సరే',
        deities: 'దేవతలు',
        stotras: 'స్తోత్రాలు',
        selectLanguage: 'భాషను ఎంచుకోండి',
        downloadingContent: 'కంటెంట్ డౌన్‌లోడ్ చేస్తోంది...',
        telugu: 'తెలుగు',
        kannada: 'ಕನ್ನಡ',
        fontSize: 'అక్షర పరిమాణం',
        theme: 'నేపథ్యం',
        small: 'చిన్న',
        medium: 'మధ్యస్థం',
        large: 'పెద్ద',
        light: 'Light',
        sepia: 'Sepia',
        dark: 'Dark',
        searchStotra: 'స్తోత్రం కోసం వెతకండి',
        searchDeities: 'దేవతలను వెతకండి...',
        noDeitiesFound: 'దేవతలు కనుగొనబడలేదు',
        tryDifferentSearch: 'వేరే పేరుతో వెతకండి',
        displaySettings: 'ప్రదర్శన సెట్టింగ్‌లు',
        contentSettings: 'కంటెంట్ సెట్టింగ్‌లు',
        aboutSupport: 'గురించి & మద్దతు',
        templeInfo: 'ఆలయ సమాచారం',
        templeName: 'శ్రీ లక్ష్మీ వేంకటేశ్వర స్వామి దేవస్థానం',
        templeAddress: 'తడంగిపల్లి\nశ్రీ సత్య సాయి జిల్లా\nఆంధ్ర ప్రదేశ్ 515123',
        feedback: 'అభిప్రాయం & మద్దతు',
        sendFeedback: 'అభిప్రాయం పంపండి',
        feedbackDescription: 'మీ సూచనలు మరియు అభిప్రాయాలను మాతో పంచుకోండి',
        appVersion: 'యాప్ వెర్షన్',
        contentAttribution: 'కంటెంట్ ఆపాదన',
        contentAttributionText: 'శ్రీ లక్ష్మీ వేంకటేశ్వర స్వామి దేవస్థానం నుండి అందించబడింది',
    },
    kannada: {
        appName: 'ಭಕ್ತಿ ವಾಣಿ',
        settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
        favorites: 'ನನ್ನ ಮೆಚ್ಚಿನವುಗಳು',
        language: 'ಭಾಷೆ',
        sync: 'ಸಿಂಕ್ ಮಾಡಿ',
        syncContent: 'ವಿಷಯವನ್ನು ಸಿಂಕ್ ಮಾಡಿ',
        lastSynced: 'ಕೊನೆಯದಾಗಿ ಸಿಂಕ್ ಮಾಡಲಾಗಿದೆ',
        never: 'ಎಂದಿಗೂ ಇಲ್ಲ',
        syncing: 'ಸಿಂಕ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
        syncSuccess: 'ಯಶಸ್ವಿಯಾಗಿ ಸಿಂಕ್ ಮಾಡಲಾಗಿದೆ!',
        syncError: 'ಸಿಂಕ್ ವಿಫಲವಾಗಿದೆ',
        noInternet: 'ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವಿಲ್ಲ',
        contentAttribution: 'ವಿಷಯ ಆರೋಪಣೆ',
        contentAttributionText: 'ಶ್ರೀ ಲಕ್ಷ್ಮೀ ವೆಂಕಟೇಶ್ವರ ಸ್ವಾಮಿ ದೇವಸ್ಥಾನಂದಿಂದ ಒದಗಿಸಲಾಗಿದೆ',
        changeLanguage: 'ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸಿ',
        changeLanguageConfirm: 'ಗಾಗಿ ಎಲ್ಲಾ ವಿಷಯವನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡುತ್ತದೆ. ಮುಂದುವರಿಸುವುದೇ?',
        cancel: 'ರದ್ದುಮಾಡಿ',
        continue: 'ಮುಂದುವರಿಸಿ',
        languageChanged: 'ಭಾಷೆ ಬದಲಾಯಿಸಲಾಗಿದೆ',
        languageChangeSuccess: 'ನಲ್ಲಿ ದೇವತೆಗಳು ಮತ್ತು ಸ್ತೋತ್ರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ.',
        languageChangeFailed: 'ಭಾಷೆಯನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ, ಆದರೆ ವಿಷಯ ಸಿಂಕ್ ವಿಫಲವಾಗಿದೆ. ನೀವು ಸಿಂಕ್ ಬಟನ್‌ನಿಂದ ಹಸ್ತಚಾಲಿತವಾಗಿ ಸಿಂಕ್ ಮಾಡಬಹುದು.',
        ok: 'ಸರಿ',
        deities: 'ದೇವತೆಗಳು',
        stotras: 'ಸ್ತೋತ್ರಗಳು',
        selectLanguage: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        downloadingContent: 'ವಿಷಯವನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
        telugu: 'తెలుగు',
        kannada: 'ಕನ್ನಡ',
        fontSize: 'ಅಕ್ಷರ ಗಾತ್ರ',
        theme: 'ಥೀಮ್',
        small: 'ಚಿಕ್ಕದು',
        medium: 'ಮಧ್ಯಮ',
        large: 'ದೊಡ್ಡದು',
        light: 'Light',
        sepia: 'Sepia',
        dark: 'Dark',
        searchStotra: 'ಸ್ತೋತ್ರವನ್ನು ಹುಡುಕಿ',
        searchDeities: 'ದೇವತೆಗಳನ್ನು ಹುಡುಕಿ...',
        noDeitiesFound: 'ದೇವತೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
        tryDifferentSearch: 'ಬೇರೆ ಹೆಸರಿನಿಂದ ಹುಡುಕಿ',
        displaySettings: 'ಪ್ರದರ್ಶನ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
        contentSettings: 'ವಿಷಯ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
        aboutSupport: 'ಬಗ್ಗೆ & ಬೆಂಬಲ',
        templeInfo: 'ದೇವಾಲಯ ಮಾಹಿತಿ',
        templeName: 'ಶ್ರೀ ಲಕ್ಷ್ಮೀ ವೆಂಕಟೇಶ್ವರ ಸ್ವಾಮಿ ದೇವಸ್ಥಾನಂ',
        templeAddress: 'ತಡಂಗಿಪಲ್ಲಿ\nಶ್ರೀ ಸತ್ಯ ಸಾಯಿ ಜಿಲ್ಲೆ\nಆಂಧ್ರ ಪ್ರದೇಶ 515123',
        feedback: 'ಪ್ರತಿಕ್ರಿಯೆ & ಬೆಂಬಲ',
        sendFeedback: 'ಪ್ರತಿಕ್ರಿಯೆ ಕಳುಹಿಸಿ',
        feedbackDescription: 'ನಿಮ್ಮ ಸಲಹೆಗಳು ಮತ್ತು ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ನಮ್ಮೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ',
        appVersion: 'ಆ್ಯಪ್ ಆವೃತ್ತಿ',
        contentAttribution: 'ವಿಷಯ ಆರೋಪಣೆ',
        contentAttributionText: 'ಶ್ರೀ ಲಕ್ಷ್ಮೀ ವೆಂಕಟೇಶ್ವರ ಸ್ವಾಮಿ ದೇವಸ್ಥಾನಂದಿಂದ ಒದಗಿಸಲಾಗಿದೆ',
    },
}

/**
 * Get a translated string for the given key and language
 */
export const getTranslation = (key: keyof Translations, language: Language): string => {
    return translations[language][key] || translations.telugu[key]
}

/**
 * Get all translations for a specific language
 */
export const getTranslations = (language: Language): Translations => {
    return translations[language]
}
