import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { SettingsService, FontSize, Theme } from '../utils/settings'
import { Language, LanguageService } from '../services/languageService'
import { SyncService } from '../services/syncService'
import { CacheService } from '../services/cacheService'
import { getTranslations } from '../utils/translations'

const SettingsScreen = () => {
    const navigation = useNavigation()
    const [fontSize, setFontSize] = useState<FontSize>('medium')
    const [theme, setTheme] = useState<Theme>('light')
    const [currentLanguage, setCurrentLanguage] = useState<Language>('telugu')
    const [lastSyncTime, setLastSyncTime] = useState<number>(0)
    const [isSyncing, setIsSyncing] = useState(false)

    useEffect(() => {
        const loadSettings = async () => {
            const loadedFontSize = await SettingsService.getFontSize()
            const loadedTheme = await SettingsService.getTheme()
            const lang = await LanguageService.getCurrentLanguage()
            const lastSync = await LanguageService.getLastSyncTimestamp()
            setFontSize(loadedFontSize)
            setTheme(loadedTheme)
            setCurrentLanguage(lang || 'telugu')
            setLastSyncTime(lastSync)

            // Update screen title based on language
            const t = getTranslations(lang || 'telugu')
            navigation.setOptions({ title: t.settings })
        }
        loadSettings()
    }, [])

    const handleFontSizeChange = async (size: FontSize) => {
        setFontSize(size)
        await SettingsService.setFontSize(size)
    }

    const handleThemeChange = async (selectedTheme: Theme) => {
        setTheme(selectedTheme)
        await SettingsService.setTheme(selectedTheme)
    }

    const handleLanguageChange = async (language: Language) => {
        // Show confirmation dialog before changing language
        Alert.alert(
            'Change Language',
            `This will download all content for ${language === 'telugu' ? 'Telugu' : 'Kannada'}. Continue?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Continue',
                    onPress: async () => {
                        setCurrentLanguage(language);
                        await LanguageService.setCurrentLanguage(language);

                        // Update screen title immediately
                        const t = getTranslations(language);
                        navigation.setOptions({ title: t.settings });

                        // Clear cache for old language
                        await CacheService.clearCache();

                        // Automatically sync content from Firebase for the new language
                        setIsSyncing(true);
                        try {
                            await SyncService.initialDownload(language, (progress) => {
                                console.log(`Language change sync progress: ${progress}%`);
                            });

                            const newSyncTime = await LanguageService.getLastSyncTimestamp();
                            setLastSyncTime(newSyncTime);

                            // Get sync stats for success message
                            const stats = await LanguageService.getSyncStats();

                            // Show success message with stats
                            Alert.alert(
                                'Language Changed',
                                `Successfully downloaded ${stats.deityCount} deities and ${stats.stotraCount} stotras in ${language === 'telugu' ? 'Telugu' : 'Kannada'}.`,
                                [{ text: 'OK' }]
                            );
                        } catch (error) {
                            console.error('Language change sync failed:', error);
                            Alert.alert(
                                'Language Changed',
                                'Language has been updated, but content sync failed. You can manually sync from the sync button.',
                                [{ text: 'OK' }]
                            );
                        } finally {
                            setIsSyncing(false);
                        }
                    }
                }
            ]
        );
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            // First, check if updates are available
            const { hasUpdates, updateCount } = await SyncService.checkForUpdates();

            if (!hasUpdates) {
                setIsSyncing(false);
                Alert.alert(
                    'Up to Date',
                    "You're already up to date! No new content available.",
                    [{ text: 'OK' }]
                );
                return;
            }

            // Show confirmation with update count
            setIsSyncing(false);
            Alert.alert(
                'Updates Available',
                `${updateCount} new ${updateCount === 1 ? 'stotra' : 'stotras'} available. Download now?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Download',
                        onPress: async () => {
                            setIsSyncing(true);
                            try {
                                // Download only new/updated content
                                const result = await SyncService.syncNewContent((progress) => {
                                    console.log(`Sync progress: ${progress}%`);
                                });

                                const newSyncTime = await LanguageService.getLastSyncTimestamp();
                                setLastSyncTime(newSyncTime);

                                Alert.alert(
                                    'Sync Complete',
                                    `Successfully synced ${result.updated} new ${result.updated === 1 ? 'stotra' : 'stotras'}.`,
                                    [{ text: 'OK' }]
                                );
                            } catch (error) {
                                console.error('Sync failed:', error);
                                Alert.alert(
                                    'Sync Failed',
                                    'Failed to sync content. Please check your internet connection and try again.',
                                    [{ text: 'OK' }]
                                );
                            } finally {
                                setIsSyncing(false);
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Update check failed:', error);
            setIsSyncing(false);
            Alert.alert(
                'Check Failed',
                'Failed to check for updates. Please check your internet connection and try again.',
                [{ text: 'OK' }]
            );
        }
    };

    const formatLastSyncTime = (timestamp: number): string => {
        if (timestamp === 0) return getTranslations(currentLanguage).never
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins} min ago`
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hr ago`
        return date.toLocaleDateString()
    }

    const t = getTranslations(currentLanguage)

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Language Section */}
            <Text style={styles.sectionTitle}>{t.language}</Text>
            <View style={styles.fontSizeContainer}>
                <TouchableOpacity
                    style={[
                        styles.fontSizeButton,
                        currentLanguage === 'telugu' && styles.fontSizeButtonActive
                    ]}
                    onPress={() => handleLanguageChange('telugu')}
                >
                    <Text style={[
                        styles.fontSizeButtonText,
                        currentLanguage === 'telugu' && styles.fontSizeButtonTextActive
                    ]}>
                        {t.telugu}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.fontSizeButton,
                        currentLanguage === 'kannada' && styles.fontSizeButtonActive
                    ]}
                    onPress={() => handleLanguageChange('kannada')}
                >
                    <Text style={[
                        styles.fontSizeButtonText,
                        currentLanguage === 'kannada' && styles.fontSizeButtonTextActive
                    ]}>
                        {t.kannada}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Sync Section */}
            <Text style={styles.sectionTitle}>{t.sync}</Text>
            <TouchableOpacity
                style={styles.syncButton}
                onPress={handleSync}
                disabled={isSyncing}
            >
                {isSyncing ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.syncButtonText}>{t.syncContent}</Text>
                )}
            </TouchableOpacity>
            <Text style={styles.lastSyncText}>
                {t.lastSynced}: {formatLastSyncTime(lastSyncTime)}
            </Text>

            {/* Font Size Section */}
            <Text style={styles.sectionTitle}>{t.fontSize}</Text>
            <View style={styles.fontSizeContainer}>
                <TouchableOpacity
                    style={[
                        styles.fontSizeButton,
                        fontSize === 'small' && styles.fontSizeButtonActive
                    ]}
                    onPress={() => handleFontSizeChange('small')}
                >
                    <Text style={[
                        styles.fontSizeButtonText,
                        fontSize === 'small' && styles.fontSizeButtonTextActive
                    ]}>
                        {t.small}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.fontSizeButton,
                        fontSize === 'medium' && styles.fontSizeButtonActive
                    ]}
                    onPress={() => handleFontSizeChange('medium')}
                >
                    <Text style={[
                        styles.fontSizeButtonText,
                        fontSize === 'medium' && styles.fontSizeButtonTextActive
                    ]}>
                        {t.medium}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.fontSizeButton,
                        fontSize === 'large' && styles.fontSizeButtonActive
                    ]}
                    onPress={() => handleFontSizeChange('large')}
                >
                    <Text style={[
                        styles.fontSizeButtonText,
                        fontSize === 'large' && styles.fontSizeButtonTextActive
                    ]}>
                        {t.large}
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>{t.theme}</Text>
            <View style={styles.themeRow}>
                <TouchableOpacity
                    style={[
                        styles.themeButton,
                        styles.themeButtonLight,
                        theme === 'light' && styles.themeButtonActive
                    ]}
                    onPress={() => handleThemeChange('light')}
                >
                    <Text style={styles.themeButtonText}>Light</Text>
                    {theme === 'light' && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.themeButton,
                        styles.themeButtonSepia,
                        theme === 'sepia' && styles.themeButtonActive
                    ]}
                    onPress={() => handleThemeChange('sepia')}
                >
                    <Text style={styles.themeButtonTextDark}>Sepia</Text>
                    {theme === 'sepia' && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                style={[
                    styles.themeButtonDark,
                    theme === 'dark' && styles.themeButtonDarkActive
                ]}
                onPress={() => handleThemeChange('dark')}
            >
                <Text style={styles.themeButtonTextWhite}>Dark</Text>
                {theme === 'dark' && <Text style={styles.checkmarkDark}>✓</Text>}
            </TouchableOpacity>

            {/* Preview Section */}
            <View style={styles.previewSection}>
                <View style={[
                    styles.previewCard,
                    {
                        backgroundColor: SettingsService.getThemeColors(theme).background,
                    }
                ]}>
                    <Text style={[
                        styles.previewText,
                        {
                            fontSize: SettingsService.getFontSizeValue(fontSize),
                            lineHeight: SettingsService.getFontSizeValue(fontSize) * 1.6,
                            color: SettingsService.getThemeColors(theme).text,
                        }
                    ]}>
                        ఓం భూర్భువస్సువః{'\n'}
                        తత్సవితుర్వరేణ్యం{'\n'}
                        భర్గో దేవస్య ధీమహి{'\n'}
                        ధియో యోనః ప్రచోదయాత్
                    </Text>
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contentContainer: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1F2937',
    },
    fontSizeContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 4,
        marginBottom: 32,
    },
    fontSizeButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
    },
    fontSizeButtonActive: {
        backgroundColor: 'white',
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    fontSizeButtonText: {
        fontSize: 14,
        color: '#6B7280',
    },
    fontSizeButtonTextActive: {
        fontWeight: 'bold',
        color: '#1F2937',
    },
    themeRow: {
        flexDirection: 'row',
    },
    themeButton: {
        flex: 1,
        minHeight: 120,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    themeButtonLight: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    themeButtonSepia: {
        backgroundColor: '#F5F0E6',
        marginLeft: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    themeButtonDark: {
        marginTop: 16,
        width: '100%',
        height: 128,
        borderRadius: 8,
        backgroundColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center',
    },
    themeButtonText: {
        fontWeight: 'bold',
    },
    themeButtonTextDark: {
        fontWeight: 'bold',
        color: '#1F2937',
    },
    themeButtonTextWhite: {
        fontWeight: 'bold',
        color: 'white',
    },
    themeButtonActive: {
        borderWidth: 3,
        borderColor: '#F97316',
    },
    themeButtonDarkActive: {
        borderWidth: 3,
        borderColor: '#F97316',
    },
    checkmark: {
        position: 'absolute',
        top: 8,
        right: 8,
        fontSize: 20,
        color: '#F97316',
        fontWeight: 'bold',
    },
    checkmarkDark: {
        position: 'absolute',
        top: 8,
        right: 8,
        fontSize: 20,
        color: '#F97316',
        fontWeight: 'bold',
    },
    previewSection: {
        marginTop: 32,
    },
    previewCard: {
        borderRadius: 12,
        padding: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    previewText: {
        textAlign: 'center',
        fontWeight: '500',
    },
    syncButton: {
        backgroundColor: '#F97316',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        minHeight: 56,
    },
    syncButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    lastSyncText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
    },
})

export default SettingsScreen
