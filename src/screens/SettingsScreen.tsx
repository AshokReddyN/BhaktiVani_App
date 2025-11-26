import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, LayoutAnimation, UIManager, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { SettingsService, FontSize, Theme } from '../utils/settings'
import { Language, LanguageService } from '../services/languageService'
import { SyncService } from '../services/syncService'
import { CacheService } from '../services/cacheService'
import { getTranslations } from '../utils/translations'
import { BackgroundSyncService } from '../services/backgroundSyncService'

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
}

// Collapsible Group Component
interface CollapsibleGroupProps {
    title: string
    isExpanded: boolean
    onToggle: () => void
    children: React.ReactNode
}

const CollapsibleGroup: React.FC<CollapsibleGroupProps> = ({ title, isExpanded, onToggle, children }) => {
    return (
        <View style={styles.groupContainer}>
            <TouchableOpacity
                style={styles.groupHeader}
                onPress={onToggle}
                activeOpacity={0.7}
            >
                <Text style={styles.groupHeaderText}>{title}</Text>
                <Ionicons
                    name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                    size={20}
                    color="#6B7280"
                />
            </TouchableOpacity>

            {isExpanded && (
                <>
                    <View style={styles.groupDivider} />
                    <View style={styles.groupContent}>
                        {children}
                    </View>
                </>
            )}
        </View>
    )
}

const SettingsScreen = () => {
    const navigation = useNavigation()
    const [fontSize, setFontSize] = useState<FontSize>('medium')
    const [theme, setTheme] = useState<Theme>('light')
    const [currentLanguage, setCurrentLanguage] = useState<Language>('telugu')
    const [lastSyncTime, setLastSyncTime] = useState<number>(0)
    const [isSyncing, setIsSyncing] = useState(false)
    const [autoSyncEnabled, setAutoSyncEnabled] = useState(true)
    const [nextSyncTime, setNextSyncTime] = useState<number | null>(null)
    const [displaySettingsExpanded, setDisplaySettingsExpanded] = useState(false)
    const [contentSettingsExpanded, setContentSettingsExpanded] = useState(false)

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

            // Load auto-sync settings
            const autoSync = await BackgroundSyncService.isAutoSyncEnabled()
            const nextSync = await BackgroundSyncService.getNextSyncTime()
            setAutoSyncEnabled(autoSync)
            setNextSyncTime(nextSync)

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
        // Get translations for the NEW language to show in the dialog
        const newLangT = getTranslations(language);
        const currentT = getTranslations(currentLanguage);

        // Show confirmation dialog before changing language
        Alert.alert(
            currentT.changeLanguage,
            `${newLangT.telugu === language ? currentT.telugu : currentT.kannada} ${currentT.changeLanguageConfirm}`,
            [
                { text: currentT.cancel, style: 'cancel' },
                {
                    text: currentT.continue,
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

                            // Show success message with stats in the NEW language
                            Alert.alert(
                                t.languageChanged,
                                `${stats.deityCount} ${t.deities} & ${stats.stotraCount} ${t.stotras} ${t.languageChangeSuccess}`,
                                [{ text: t.ok }]
                            );
                        } catch (error) {
                            console.error('Language change sync failed:', error);
                            const t = getTranslations(language);
                            Alert.alert(
                                t.languageChanged,
                                t.languageChangeFailed,
                                [{ text: t.ok }]
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

    const handleAutoSyncToggle = async () => {
        try {
            if (autoSyncEnabled) {
                await BackgroundSyncService.disableAutoSync();
                setAutoSyncEnabled(false);
                setNextSyncTime(null);
                Alert.alert(
                    'Auto-Sync Disabled',
                    'Automatic weekly sync has been disabled. You can still manually sync content.',
                    [{ text: 'OK' }]
                );
            } else {
                await BackgroundSyncService.enableAutoSync();
                setAutoSyncEnabled(true);
                // Set next sync time to 7 days from now
                const nextSync = Date.now() + (7 * 24 * 60 * 60 * 1000);
                setNextSyncTime(nextSync);
                Alert.alert(
                    'Auto-Sync Enabled',
                    'Content will automatically sync weekly in the background.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Failed to toggle auto-sync:', error);
            Alert.alert(
                'Error',
                'Failed to update auto-sync setting. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    const toggleDisplaySettings = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setDisplaySettingsExpanded(!displaySettingsExpanded);
    };

    const toggleContentSettings = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setContentSettingsExpanded(!contentSettingsExpanded);
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
            {/* Display Settings Group */}
            <CollapsibleGroup
                title="DISPLAY SETTINGS"
                isExpanded={displaySettingsExpanded}
                onToggle={toggleDisplaySettings}
            >
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
            </CollapsibleGroup>

            {/* Content Settings Group */}
            <CollapsibleGroup
                title="CONTENT SETTINGS"
                isExpanded={contentSettingsExpanded}
                onToggle={toggleContentSettings}
            >
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

                {/* Auto-Sync Section */}
                <View style={styles.autoSyncContainer}>
                    <View style={styles.autoSyncHeader}>
                        <Text style={styles.autoSyncTitle}>Auto-Sync (Weekly)</Text>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                autoSyncEnabled && styles.toggleButtonActive
                            ]}
                            onPress={handleAutoSyncToggle}
                        >
                            <View style={[
                                styles.toggleCircle,
                                autoSyncEnabled && styles.toggleCircleActive
                            ]} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.autoSyncDescription}>
                        {autoSyncEnabled
                            ? 'Content will automatically sync every 7 days'
                            : 'Automatic sync is disabled'}
                    </Text>
                    {autoSyncEnabled && nextSyncTime && (
                        <Text style={styles.nextSyncText}>
                            Next sync: {new Date(nextSyncTime).toLocaleDateString()}
                        </Text>
                    )}
                </View>
            </CollapsibleGroup>
        </ScrollView >
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
    autoSyncContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    autoSyncHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    autoSyncTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    autoSyncDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    nextSyncText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
    toggleButton: {
        width: 52,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#D1D5DB',
        padding: 2,
        justifyContent: 'center',
    },
    toggleButtonActive: {
        backgroundColor: '#10B981',
    },
    toggleCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleCircleActive: {
        alignSelf: 'flex-end',
    },
    groupContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F9FAFB',
    },
    groupHeaderText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    groupContent: {
        padding: 16,
        paddingTop: 0,
    },
    groupDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 16,
    },
})

export default SettingsScreen
