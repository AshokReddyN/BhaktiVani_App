import { Platform } from 'react-native';
import { Language } from '../services/languageService';

/**
 * Voice Search Utilities
 * Provides helper functions for voice recognition with multilingual support
 */

/**
 * Maps app language to voice recognition locale codes
 */
export const getVoiceLocale = (language: Language): string => {
    const localeMap: Record<Language, string> = {
        'telugu': 'te-IN',
        'kannada': 'kn-IN',
    };
    return localeMap[language] || 'en-IN';
};

/**
 * Gets all supported voice locales for the app
 */
export const getSupportedVoiceLocales = (): string[] => {
    return ['te-IN', 'kn-IN', 'hi-IN', 'en-IN'];
};

/**
 * Gets language name in native script
 */
export const getLanguageName = (language: Language): string => {
    const nameMap: Record<Language, string> = {
        'telugu': 'తెలుగు',
        'kannada': 'ಕನ್ನಡ',
    };
    return nameMap[language] || 'English';
};

/**
 * Detects Android version
 * Returns the Android API level (e.g., 26 for Android 8.0)
 */
export const getAndroidApiLevel = (): number => {
    if (Platform.OS !== 'android') return 0;
    return typeof Platform.Version === 'string'
        ? parseInt(Platform.Version, 10)
        : Platform.Version;
};

/**
 * Checks if current Android version has known voice recognition issues
 * Android 8.0 (API 26) and 8.1 (API 27) have documented problems
 */
export const isProblematicAndroidVersion = (): boolean => {
    if (Platform.OS !== 'android') return false;
    const apiLevel = getAndroidApiLevel();
    return apiLevel >= 26 && apiLevel <= 27;
};

/**
 * Gets Android version name for display
 */
export const getAndroidVersionName = (): string => {
    const apiLevel = getAndroidApiLevel();
    const versionMap: Record<number, string> = {
        21: 'Android 5.0 (Lollipop)',
        22: 'Android 5.1 (Lollipop)',
        23: 'Android 6.0 (Marshmallow)',
        24: 'Android 7.0 (Nougat)',
        25: 'Android 7.1 (Nougat)',
        26: 'Android 8.0 (Oreo)',
        27: 'Android 8.1 (Oreo)',
        28: 'Android 9.0 (Pie)',
        29: 'Android 10',
        30: 'Android 11',
        31: 'Android 12',
        32: 'Android 12L',
        33: 'Android 13',
        34: 'Android 14',
        35: 'Android 15',
    };
    return versionMap[apiLevel] || `Android API ${apiLevel}`;
};

/**
 * Gets localized error messages for voice search
 */
export const getVoiceErrorMessage = (
    errorType: 'permission' | 'unavailable' | 'network' | 'no-speech' | 'generic',
    language: Language
): { title: string; message: string } => {
    const messages = {
        'telugu': {
            permission: {
                title: 'మైక్రోఫోన్ అనుమతి అవసరం',
                message: 'వాయిస్ సెర్చ్ ఉపయోగించడానికి దయచేసి మీ పరికర సెట్టింగ్‌లలో మైక్రోఫోన్ అనుమతిని ఎనేబుల్ చేయండి.',
            },
            unavailable: {
                title: 'వాయిస్ సెర్చ్ అందుబాటులో లేదు',
                message: 'ఈ పరికరంలో వాయిస్ సెర్చ్ అందుబాటులో లేదు. దయచేసి టెక్స్ట్ సెర్చ్ ఉపయోగించండి.',
            },
            network: {
                title: 'నెట్‌వర్క్ లోపం',
                message: 'వాయిస్ గుర్తింపు విఫలమైంది. దయచేసి మీ ఇంటర్నెట్ కనెక్షన్‌ని తనిఖీ చేయండి.',
            },
            'no-speech': {
                title: 'మాట్లాడటం వినబడలేదు',
                message: 'దయచేసి మళ్లీ ప్రయత్నించండి మరియు స్పష్టంగా మాట్లాడండి.',
            },
            generic: {
                title: 'వాయిస్ సెర్చ్ లోపం',
                message: 'మాట్లాడటం గుర్తించలేకపోయింది. దయచేసి మళ్లీ ప్రయత్నించండి లేదా టెక్స్ట్ సెర్చ్ ఉపయోగించండి.',
            },
        },
        'kannada': {
            permission: {
                title: 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ಅಗತ್ಯವಿದೆ',
                message: 'ಧ್ವನಿ ಹುಡುಕಾಟವನ್ನು ಬಳಸಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಾಧನ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿಯನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ.',
            },
            unavailable: {
                title: 'ಧ್ವನಿ ಹುಡುಕಾಟ ಲಭ್ಯವಿಲ್ಲ',
                message: 'ಈ ಸಾಧನದಲ್ಲಿ ಧ್ವನಿ ಹುಡುಕಾಟ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಪಠ್ಯ ಹುಡುಕಾಟವನ್ನು ಬಳಸಿ.',
            },
            network: {
                title: 'ನೆಟ್‌ವರ್ಕ್ ದೋಷ',
                message: 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ.',
            },
            'no-speech': {
                title: 'ಮಾತು ಕೇಳಿಸಲಿಲ್ಲ',
                message: 'ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಮತ್ತು ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ.',
            },
            generic: {
                title: 'ಧ್ವನಿ ಹುಡುಕಾಟ ದೋಷ',
                message: 'ಮಾತು ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಪಠ್ಯ ಹುಡುಕಾಟವನ್ನು ಬಳಸಿ.',
            },
        },
    };

    return messages[language]?.[errorType] || {
        title: 'Voice Search Error',
        message: 'Could not recognize speech. Please try again or use text search.',
    };
};

/**
 * Gets localized placeholder text for search input
 */
export const getSearchPlaceholder = (language: Language): string => {
    const placeholders: Record<Language, string> = {
        'telugu': 'దేవతలను వెతకండి...',
        'kannada': 'ದೇವತೆಗಳನ್ನು ಹುಡುಕಿ...',
    };
    return placeholders[language] || 'Search deities...';
};

/**
 * Gets localized voice search hint
 */
export const getVoiceSearchHint = (language: Language): string => {
    const hints: Record<Language, string> = {
        'telugu': 'మైక్ నొక్కి మాట్లాడండి',
        'kannada': 'ಮೈಕ್ ಒತ್ತಿ ಮಾತನಾಡಿ',
    };
    return hints[language] || 'Tap mic and speak';
};
