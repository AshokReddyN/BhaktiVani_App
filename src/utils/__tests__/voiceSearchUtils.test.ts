import { Platform } from 'react-native';
import {
    getVoiceLocale,
    getSupportedVoiceLocales,
    getLanguageName,
    getAndroidApiLevel,
    isProblematicAndroidVersion,
    getAndroidVersionName,
    getVoiceErrorMessage,
    getSearchPlaceholder,
    getVoiceSearchHint,
} from '../voiceSearchUtils';

// Mock Platform
jest.mock('react-native', () => ({
    Platform: {
        OS: 'android',
        Version: 28,
    },
}));

describe('voiceSearchUtils', () => {
    describe('getVoiceLocale', () => {
        it('should return Telugu locale for telugu language', () => {
            expect(getVoiceLocale('telugu')).toBe('te-IN');
        });

        it('should return Kannada locale for kannada language', () => {
            expect(getVoiceLocale('kannada')).toBe('kn-IN');
        });

        it('should return English locale as fallback', () => {
            expect(getVoiceLocale('unknown' as any)).toBe('en-IN');
        });
    });

    describe('getSupportedVoiceLocales', () => {
        it('should return array of supported locales', () => {
            const locales = getSupportedVoiceLocales();
            expect(locales).toContain('te-IN');
            expect(locales).toContain('kn-IN');
            expect(locales).toContain('hi-IN');
            expect(locales).toContain('en-IN');
        });
    });

    describe('getLanguageName', () => {
        it('should return Telugu name in Telugu script', () => {
            expect(getLanguageName('telugu')).toBe('తెలుగు');
        });

        it('should return Kannada name in Kannada script', () => {
            expect(getLanguageName('kannada')).toBe('ಕನ್ನಡ');
        });
    });

    describe('getAndroidApiLevel', () => {
        it('should return API level for Android', () => {
            const apiLevel = getAndroidApiLevel();
            expect(apiLevel).toBe(28);
        });

        it('should return 0 for non-Android platforms', () => {
            (Platform as any).OS = 'ios';
            const apiLevel = getAndroidApiLevel();
            expect(apiLevel).toBe(0);
            (Platform as any).OS = 'android'; // Reset
        });
    });

    describe('isProblematicAndroidVersion', () => {
        it('should return true for Android 8.0 (API 26)', () => {
            (Platform as any).Version = 26;
            expect(isProblematicAndroidVersion()).toBe(true);
        });

        it('should return true for Android 8.1 (API 27)', () => {
            (Platform as any).Version = 27;
            expect(isProblematicAndroidVersion()).toBe(true);
        });

        it('should return false for Android 9.0 (API 28)', () => {
            (Platform as any).Version = 28;
            expect(isProblematicAndroidVersion()).toBe(false);
        });

        it('should return false for Android 7.1 (API 25)', () => {
            (Platform as any).Version = 25;
            expect(isProblematicAndroidVersion()).toBe(false);
        });

        it('should return false for iOS', () => {
            (Platform as any).OS = 'ios';
            expect(isProblematicAndroidVersion()).toBe(false);
            (Platform as any).OS = 'android'; // Reset
        });
    });

    describe('getAndroidVersionName', () => {
        it('should return version name for known API levels', () => {
            (Platform as any).Version = 28;
            expect(getAndroidVersionName()).toBe('Android 9.0 (Pie)');

            (Platform as any).Version = 33;
            expect(getAndroidVersionName()).toBe('Android 13');
        });

        it('should return generic name for unknown API levels', () => {
            (Platform as any).Version = 99;
            expect(getAndroidVersionName()).toBe('Android API 99');
        });
    });

    describe('getVoiceErrorMessage', () => {
        it('should return Telugu error messages', () => {
            const msg = getVoiceErrorMessage('permission', 'telugu');
            expect(msg.title).toContain('మైక్రోఫోన్');
            expect(msg.message).toContain('అనుమతి');
        });

        it('should return Kannada error messages', () => {
            const msg = getVoiceErrorMessage('permission', 'kannada');
            expect(msg.title).toContain('ಮೈಕ್ರೊಫೋನ್');
            expect(msg.message).toContain('ಅನುಮತಿ');
        });

        it('should return English fallback for unknown language', () => {
            const msg = getVoiceErrorMessage('permission', 'unknown' as any);
            expect(msg.title).toBe('Voice Search Error');
        });

        it('should handle different error types', () => {
            const permissionMsg = getVoiceErrorMessage('permission', 'telugu');
            const unavailableMsg = getVoiceErrorMessage('unavailable', 'telugu');
            const networkMsg = getVoiceErrorMessage('network', 'telugu');

            expect(permissionMsg.title).not.toBe(unavailableMsg.title);
            expect(unavailableMsg.title).not.toBe(networkMsg.title);
        });
    });

    describe('getSearchPlaceholder', () => {
        it('should return Telugu placeholder', () => {
            const placeholder = getSearchPlaceholder('telugu');
            expect(placeholder).toContain('దేవతలను');
        });

        it('should return Kannada placeholder', () => {
            const placeholder = getSearchPlaceholder('kannada');
            expect(placeholder).toContain('ದೇವತೆಗಳನ್ನು');
        });
    });

    describe('getVoiceSearchHint', () => {
        it('should return Telugu hint', () => {
            const hint = getVoiceSearchHint('telugu');
            expect(hint).toContain('మైక్');
        });

        it('should return Kannada hint', () => {
            const hint = getVoiceSearchHint('kannada');
            expect(hint).toContain('ಮೈಕ್');
        });
    });
});
