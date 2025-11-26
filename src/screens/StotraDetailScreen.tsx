import React, { useEffect, useLayoutEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { database } from '../database'
import Stotra from '../database/models/Stotra'
import { SettingsService, FontSize, Theme } from '../utils/settings'
import { Language, LanguageService } from '../services/languageService'

const StotraDetailScreen = () => {
    const navigation = useNavigation()
    const route = useRoute()
    const { stotraId } = route.params as { stotraId: string }
    const [stotra, setStotra] = useState<Stotra | null>(null)
    const [isFavorite, setIsFavorite] = useState(false)
    const [fontSize, setFontSize] = useState(18)
    const [fontSizeSetting, setFontSizeSetting] = useState<FontSize>('medium')
    const [theme, setTheme] = useState<Theme>('light')
    const [isToggling, setIsToggling] = useState(false)
    const [currentLanguage, setCurrentLanguage] = useState<Language>('telugu')

    // Load settings when screen focuses
    useFocusEffect(
        useCallback(() => {
            const loadSettings = async () => {
                const loadedFontSize = await SettingsService.getFontSize()
                const loadedTheme = await SettingsService.getTheme()
                const lang = await LanguageService.getCurrentLanguage()
                setFontSizeSetting(loadedFontSize)
                setTheme(loadedTheme)
                setFontSize(SettingsService.getFontSizeValue(loadedFontSize))
                setCurrentLanguage(lang || 'telugu')
                // Re-fetch stotra to trigger re-render
                const fetchedStotra = await database.get<Stotra>('stotras').find(stotraId)
                setStotra(fetchedStotra)
            }
            loadSettings()
        }, [stotraId])
    )

    useEffect(() => {
        const fetchStotra = async () => {
            const data = await database.get<Stotra>('stotras').find(stotraId)
            setStotra(data)
            setIsFavorite(data.isFavorite)
        }
        fetchStotra()
    }, [stotraId])

    const toggleFavorite = useCallback(async () => {
        if (!stotra || isToggling) return

        setIsToggling(true)

        // Optimistic update - update UI immediately
        const newFavoriteState = !isFavorite
        setIsFavorite(newFavoriteState)

        try {
            // Update database
            await database.write(async () => {
                await stotra.update(s => {
                    s.isFavorite = newFavoriteState
                })
            })

            // Update persistent cache
            const { CacheService } = require('../services/cacheService');
            await CacheService.updateStotraFavorite(stotraId, newFavoriteState);

            // Refetch to ensure sync with database
            const updated = await database.get<Stotra>('stotras').find(stotraId)
            setStotra(updated)
            setIsFavorite(updated.isFavorite)
        } catch (error) {
            console.error('Error toggling favorite:', error)
            // Revert on error
            setIsFavorite(!newFavoriteState)
        } finally {
            setIsToggling(false)
        }
    }, [stotra, stotraId, isFavorite, isToggling])

    useLayoutEffect(() => {
        // Get language-specific title with proper fallback
        // Handle empty strings as well as null/undefined
        let displayTitle = 'Loading...';
        if (stotra) {
            if (currentLanguage === 'telugu') {
                displayTitle = (stotra.titleTelugu && stotra.titleTelugu.trim()) || stotra.title || 'Untitled';
            } else {
                // For Kannada, prefer Kannada title, fallback to Telugu if Kannada is empty, then to generic title
                displayTitle = (stotra.titleKannada && stotra.titleKannada.trim())
                    || (stotra.titleTelugu && stotra.titleTelugu.trim())
                    || stotra.title
                    || 'Untitled';
            }
        }

        navigation.setOptions({
            title: displayTitle,
            headerRight: () => (
                <TouchableOpacity
                    onPress={toggleFavorite}
                    disabled={isToggling}
                    style={styles.favoriteButton}
                >
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={24}
                        color="#F97316"
                    />
                </TouchableOpacity>
            )
        });
    }, [navigation, isFavorite, toggleFavorite, isToggling, stotra, currentLanguage]);

    if (!stotra) return <View style={styles.loading}><Text>Loading...</Text></View>

    const themeColors = SettingsService.getThemeColors(theme)

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <ScrollView style={styles.scrollView}>
                <Text style={[
                    styles.content,
                    {
                        fontSize,
                        lineHeight: fontSize * 1.6,
                        color: themeColors.text,
                    }
                ]}>
                    {currentLanguage === 'telugu'
                        ? ((stotra.textTelugu && stotra.textTelugu.trim()) || stotra.content || 'Content not available')
                        : ((stotra.textKannada && stotra.textKannada.trim())
                            || (stotra.textTelugu && stotra.textTelugu.trim())
                            || stotra.content
                            || 'Content not available')
                    }
                </Text>
            </ScrollView>

            <View style={styles.fontControls}>
                <TouchableOpacity
                    style={styles.fontButton}
                    onPress={() => setFontSize(prev => Math.min(prev + 2, 30))}
                >
                    <Text style={styles.fontButtonText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.fontButton, styles.fontButtonSpacing]}
                    onPress={() => setFontSize(prev => Math.max(prev - 2, 12))}
                >
                    <Text style={styles.fontButtonText}>-</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF7ED',
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    content: {
        color: '#1F2937',
        fontWeight: '500',
        textAlign: 'center',
    },
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    favoriteButton: {
        marginRight: 16,
        padding: 4,
    },
    fontControls: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        flexDirection: 'column',
    },
    fontButton: {
        width: 48,
        height: 48,
        backgroundColor: '#374151',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.8,
    },
    fontButtonSpacing: {
        marginTop: 8,
    },
    fontButtonText: {
        color: 'white',
        fontSize: 24,
    },
})

export default StotraDetailScreen
