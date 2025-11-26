import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { Language, LanguageService } from '../services/languageService'
import { SyncService } from '../services/syncService'

interface LanguageSelectionScreenProps {
    onComplete: () => void
}

const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({ onComplete }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

    const handleLanguageSelect = async (language: Language) => {
        setSelectedLanguage(language);
        
        try {
            // Save language preference first
            await LanguageService.setCurrentLanguage(language);

            // Mark setup as complete immediately so app can proceed
            await LanguageService.markInitialSetupComplete();

            // Try to download content in background (non-blocking)
            setIsDownloading(true);
            setDownloadProgress(0);

            try {
                // Download initial content with timeout
                const downloadPromise = SyncService.initialDownload(language, (progress) => {
                    setDownloadProgress(progress);
                });
                
                // Add timeout of 30 seconds
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Download timeout')), 30000);
                });

                await Promise.race([downloadPromise, timeoutPromise]);
                console.log('Content download completed successfully');
            } catch (downloadError) {
                console.error('Content download failed (non-blocking):', downloadError);
                // Don't block app - user can sync later from settings
                // Show a non-blocking message
                Alert.alert(
                    'Note',
                    'Content download failed. The app will work with local data. You can sync later from Settings.',
                    [{ text: 'OK' }]
                );
            } finally {
                setIsDownloading(false);
            }

            // Navigate to main app regardless of download status
            onComplete();
        } catch (error) {
            console.error('Language setup failed:', error);
            // Even if there's an error, proceed with the selected language
            await LanguageService.setCurrentLanguage(language);
            await LanguageService.markInitialSetupComplete();
            setIsDownloading(false);
            onComplete();
        }
    };

    if (isDownloading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text style={styles.loadingText}>
                        {selectedLanguage === 'telugu' ? 'కంటెంట్ డౌన్‌లోడ్ చేస్తోంది...' : 'ವಿಷಯವನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...'}
                    </Text>
                    <Text style={styles.progressText}>{Math.round(downloadProgress)}%</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>భక్తి వాణి</Text>
                <Text style={styles.subtitle}>ಭಕ್ತಿ ವಾಣಿ</Text>
                <Text style={styles.instruction}>ఎంచుకోండి / ಆಯ್ಕೆಮಾಡಿ</Text>

                <View style={styles.languageContainer}>
                    <TouchableOpacity
                        style={[
                            styles.languageButton,
                            selectedLanguage === 'telugu' && styles.languageButtonActive
                        ]}
                        onPress={() => handleLanguageSelect('telugu')}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.languageButtonText,
                            selectedLanguage === 'telugu' && styles.languageButtonTextActive
                        ]}>
                            తెలుగు
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.languageButton,
                            selectedLanguage === 'kannada' && styles.languageButtonActive
                        ]}
                        onPress={() => handleLanguageSelect('kannada')}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.languageButtonText,
                            selectedLanguage === 'kannada' && styles.languageButtonTextActive
                        ]}>
                            ಕನ್ನಡ
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.note}>
                    You can change the language later in Settings
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF7ED',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#F97316',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#EA580C',
        marginBottom: 48,
    },
    instruction: {
        fontSize: 20,
        color: '#1F2937',
        marginBottom: 32,
        fontWeight: '600',
    },
    languageContainer: {
        width: '100%',
        maxWidth: 400,
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 4,
        marginBottom: 24,
    },
    languageButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    languageButtonActive: {
        backgroundColor: 'white',
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    languageButtonText: {
        fontSize: 18,
        color: '#6B7280',
        fontWeight: '600',
    },
    languageButtonTextActive: {
        fontWeight: 'bold',
        color: '#1F2937',
    },
    note: {
        marginTop: 16,
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 24,
        fontSize: 18,
        color: '#1F2937',
        fontWeight: '600',
    },
    progressText: {
        marginTop: 12,
        fontSize: 24,
        color: '#F97316',
        fontWeight: 'bold',
    },
})

export default LanguageSelectionScreen
