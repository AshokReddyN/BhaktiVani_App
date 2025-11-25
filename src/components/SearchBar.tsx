import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Platform,
    Alert,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';
import { Language, LanguageService } from '../services/languageService';
import {
    getVoiceLocale,
    getVoiceErrorMessage,
    getSearchPlaceholder,
    isProblematicAndroidVersion,
    getAndroidVersionName,
} from '../utils/voiceSearchUtils';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChangeText,
    placeholder,
    onClear,
}) => {
    const [isListening, setIsListening] = useState(false);
    const [isVoiceAvailable, setIsVoiceAvailable] = useState(true);
    const [currentLanguage, setCurrentLanguage] = useState<Language>('telugu');
    const [hasShownAndroidWarning, setHasShownAndroidWarning] = useState(false);
    const [supportedLanguages, setSupportedLanguages] = useState<string[]>([]);

    useEffect(() => {
        // Load current language
        const loadLanguage = async () => {
            const lang = await LanguageService.getCurrentLanguage();
            setCurrentLanguage(lang || 'telugu');
        };
        loadLanguage();
    }, []);

    useEffect(() => {
        // Set up voice recognition event listeners
        const initVoice = async () => {
            try {
                console.log('SearchBar: Initializing voice module...');
                console.log('SearchBar: Voice object exists?', !!Voice);
                console.log('SearchBar: Voice.isAvailable exists?', typeof Voice?.isAvailable);
                console.log('SearchBar: Voice.start exists?', typeof Voice?.start);

                if (Voice && typeof Voice.isAvailable === 'function') {
                    const available = await Voice.isAvailable();
                    console.log('SearchBar: Voice.isAvailable() returned:', available);

                    Voice.onSpeechStart = onSpeechStart;
                    Voice.onSpeechEnd = onSpeechEnd;
                    Voice.onSpeechResults = onSpeechResults;
                    Voice.onSpeechError = onSpeechError;
                    Voice.onSpeechPartialResults = onSpeechPartialResults;
                    console.log('SearchBar: Voice event listeners set up');

                    // Check supported languages
                    try {
                        // Type assertion needed as getSupportedLanguages may not be in type definition
                        const voiceAny = Voice as any;
                        if (typeof voiceAny.getSupportedLanguages === 'function') {
                            const languages = await voiceAny.getSupportedLanguages();
                            setSupportedLanguages(languages || []);
                            console.log('SearchBar: Supported languages:', languages);
                        }
                    } catch (error) {
                        console.log('SearchBar: Could not get supported languages:', error);
                    }
                } else {
                    console.log('SearchBar: Voice module not properly loaded');
                }
            } catch (error) {
                console.log('SearchBar: Voice setup error:', error);
            }
        };

        initVoice();

        return () => {
            // Cleanup
            try {
                if (Voice && typeof Voice.destroy === 'function') {
                    Voice.destroy().then(Voice.removeAllListeners).catch(() => { });
                }
            } catch (error) {
                console.log('Error cleaning up voice:', error);
            }
        };
    }, []);

    const onSpeechStart = () => {
        console.log('SearchBar: Speech started');
        setIsListening(true);
    };

    const onSpeechEnd = () => {
        console.log('SearchBar: Speech ended');
        setIsListening(false);
    };

    const onSpeechPartialResults = (event: any) => {
        console.log('SearchBar: Partial results:', event.value);
        // Optionally show partial results in real-time
        if (event.value && event.value.length > 0) {
            const partialText = event.value[0];
            // You can update the search in real-time here if desired
            // onChangeText(partialText);
        }
    };

    const onSpeechResults = (event: any) => {
        console.log('SearchBar: Final results:', event.value);
        if (event.value && event.value.length > 0) {
            const spokenText = event.value[0];
            onChangeText(spokenText);
        }
        setIsListening(false);
    };

    const onSpeechError = (event: any) => {
        console.log('SearchBar: Speech recognition error:', event.error);
        setIsListening(false);

        // Determine error type
        let errorType: 'permission' | 'unavailable' | 'network' | 'no-speech' | 'generic' = 'generic';

        if (event.error?.code === 'permissions' || event.error?.message?.includes('permission')) {
            errorType = 'permission';
        } else if (event.error?.code === 'no-speech') {
            errorType = 'no-speech';
            // Don't show alert for no speech - user just didn't speak
            return;
        } else if (event.error?.code === 'network' || event.error?.message?.includes('network')) {
            errorType = 'network';
        }

        // Get localized error message
        const errorMsg = getVoiceErrorMessage(errorType, currentLanguage);

        // Show user-friendly error message
        if (errorType === 'permission') {
            Alert.alert(
                errorMsg.title,
                errorMsg.message,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Settings', onPress: () => Linking.openSettings() }
                ]
            );
        } else {
            Alert.alert(errorMsg.title, errorMsg.message, [{ text: 'OK' }]);
        }
    };

    const checkLanguagePackAvailability = (locale: string): boolean => {
        if (supportedLanguages.length === 0) {
            // If we couldn't get supported languages, assume it's available
            return true;
        }
        return supportedLanguages.includes(locale);
    };

    const showLanguagePackWarning = (locale: string, language: Language) => {
        const languageNames: Record<string, string> = {
            'te-IN': 'Telugu (తెలుగు)',
            'kn-IN': 'Kannada (ಕನ್ನಡ)',
            'hi-IN': 'Hindi (हिन्दी)',
            'en-IN': 'English',
        };

        const langName = languageNames[locale] || locale;
        const message = currentLanguage === 'telugu'
            ? `${langName} వాయిస్ గుర్తింపు మీ పరికరంలో అందుబాటులో లేకపోవచ్చు. మెరుగైన ఫలితాల కోసం, సెట్టింగ్‌లలో ${langName} భాషా ప్యాక్‌ను డౌన్‌లోడ్ చేయండి.`
            : `${langName} ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲದಿರಬಹುದು. ಉತ್ತಮ ಫಲಿತಾಂಶಗಳಿಗಾಗಿ, ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ${langName} ಭಾಷಾ ಪ್ಯಾಕ್ ಅನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.`;

        Alert.alert(
            currentLanguage === 'telugu' ? 'భాషా ప్యాక్ గమనిక' : 'ಭಾಷಾ ಪ್ಯಾಕ್ ಸೂಚನೆ',
            message,
            [
                { text: currentLanguage === 'telugu' ? 'తర్వాత' : 'ನಂತರ', style: 'cancel' },
                {
                    text: currentLanguage === 'telugu' ? 'సెట్టింగ్స్' : 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
                    onPress: () => Linking.openSettings()
                }
            ]
        );
    };

    const showAndroidVersionWarning = () => {
        if (hasShownAndroidWarning) return;

        const versionName = getAndroidVersionName();
        const message = currentLanguage === 'telugu'
            ? `మీరు ${versionName} ఉపయోగిస్తున్నారు. వాయిస్ సెర్చ్ నమ్మదగినది కాకపోవచ్చు. సమస్యలు ఎదురైతే దయచేసి టెక్స్ట్ సెర్చ్ ఉపయోగించండి.`
            : `ನೀವು ${versionName} ಬಳಸುತ್ತಿದ್ದೀರಿ. ಧ್ವನಿ ಹುಡುಕಾಟ ವಿಶ್ವಾಸಾರ್ಹವಾಗಿರದೇ ಇರಬಹುದು. ಸಮಸ್ಯೆಗಳು ಎದುರಾದರೆ ದಯವಿಟ್ಟು ಪಠ್ಯ ಹುಡುಕಾಟವನ್ನು ಬಳಸಿ.`;

        Alert.alert(
            currentLanguage === 'telugu' ? 'వాయిస్ సెర్చ్ గమనిక' : 'ಧ್ವನಿ ಹುಡುಕಾಟ ಸೂಚನೆ',
            message,
            [{ text: 'OK' }]
        );

        setHasShownAndroidWarning(true);
    };

    const startVoiceRecognition = async () => {
        try {
            console.log('SearchBar: Starting voice recognition...');
            console.log('SearchBar: Current language:', currentLanguage);

            // Check if Voice module exists
            if (!Voice || typeof Voice.start !== 'function') {
                console.log('SearchBar: Voice module not available');
                const errorMsg = getVoiceErrorMessage('unavailable', currentLanguage);
                Alert.alert(errorMsg.title, errorMsg.message, [{ text: 'OK' }]);
                return;
            }

            // Check for problematic Android versions
            if (isProblematicAndroidVersion()) {
                showAndroidVersionWarning();
            }

            // Get locale for current language
            const locale = getVoiceLocale(currentLanguage);
            console.log('SearchBar: Using voice locale:', locale);

            // Check if language pack is available
            if (!checkLanguagePackAvailability(locale)) {
                showLanguagePackWarning(locale, currentLanguage);
                // Continue anyway - it might still work
            }

            setIsListening(true);
            await Voice.start(locale);
            console.log('SearchBar: Voice.start() completed successfully');
        } catch (error: any) {
            console.log('SearchBar: Voice recognition error:', error);
            console.log('SearchBar: Error message:', error?.message);
            console.log('SearchBar: Error code:', error?.code);
            setIsListening(false);

            // Determine error type
            let errorType: 'permission' | 'unavailable' | 'network' | 'no-speech' | 'generic' = 'generic';
            const errorMessage = error?.message || '';

            if (errorMessage.includes('permission') || errorMessage.includes('Permission')) {
                errorType = 'permission';
            } else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
                errorType = 'network';
            }

            const errorMsg = getVoiceErrorMessage(errorType, currentLanguage);

            if (errorType === 'permission') {
                Alert.alert(
                    errorMsg.title,
                    errorMsg.message,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Settings', onPress: () => Linking.openSettings() }
                    ]
                );
            } else {
                Alert.alert(errorMsg.title, errorMsg.message, [{ text: 'OK' }]);
            }
        }
    };

    const stopVoiceRecognition = async () => {
        try {
            if (Voice && typeof Voice.stop === 'function') {
                await Voice.stop();
            }
            setIsListening(false);
        } catch (error) {
            console.log('Voice stop error:', error);
            setIsListening(false);
        }
    };

    const handleMicPress = () => {
        if (isListening) {
            stopVoiceRecognition();
        } else {
            startVoiceRecognition();
        }
    };

    const handleClear = () => {
        onChangeText('');
        if (onClear) {
            onClear();
        }
    };

    // Use localized placeholder if not provided
    const displayPlaceholder = placeholder || getSearchPlaceholder(currentLanguage);

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons
                    name="search"
                    size={20}
                    color="#666"
                    style={styles.searchIcon}
                />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={displayPlaceholder}
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                />
                {value.length > 0 && (
                    <TouchableOpacity
                        onPress={handleClear}
                        style={styles.clearButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                )}
                {isVoiceAvailable && (
                    <TouchableOpacity
                        onPress={handleMicPress}
                        style={[
                            styles.micButton,
                            isListening && styles.micButtonActive,
                        ]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityLabel={isListening ? 'Stop voice search' : 'Start voice search'}
                        accessibilityHint="Tap to use voice search"
                    >
                        {isListening ? (
                            <ActivityIndicator size="small" color="#FF6B6B" />
                        ) : (
                            <Ionicons
                                name="mic"
                                size={22}
                                color="#666"
                            />
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    clearButton: {
        padding: 4,
        marginLeft: 4,
    },
    micButton: {
        padding: 4,
        marginLeft: 8,
        borderRadius: 20,
    },
    micButtonActive: {
        backgroundColor: '#FFE5E5',
    },
});
