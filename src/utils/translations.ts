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
