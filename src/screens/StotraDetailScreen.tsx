import React, { useEffect, useLayoutEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { database } from '../database'
import Stotra from '../database/models/Stotra'
import { SettingsService, FontSize, Theme } from '../utils/settings'

const StotraDetailScreen = () => {
    const navigation = useNavigation()
    const route = useRoute()
    const { stotraId, title } = route.params as { stotraId: string, title: string }
    const [stotra, setStotra] = useState<Stotra | null>(null)
    const [isFavorite, setIsFavorite] = useState(false)
    const [fontSize, setFontSize] = useState(18)
    const [fontSizeSetting, setFontSizeSetting] = useState<FontSize>('medium')
    const [theme, setTheme] = useState<Theme>('light')
    const [isToggling, setIsToggling] = useState(false)

    // Load settings when screen focuses
    useFocusEffect(
        useCallback(() => {
            const loadSettings = async () => {
                const loadedFontSize = await SettingsService.getFontSize()
                const loadedTheme = await SettingsService.getTheme()
                setFontSizeSetting(loadedFontSize)
                setTheme(loadedTheme)
                setFontSize(SettingsService.getFontSizeValue(loadedFontSize))
            }
            loadSettings()
        }, [])
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
        navigation.setOptions({
            title: title,
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
        })
    }, [navigation, title, isFavorite, toggleFavorite, isToggling])

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
                    {stotra.content}
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
