import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SettingsService, FontSize, Theme } from '../utils/settings'

const SettingsScreen = () => {
    const [fontSize, setFontSize] = useState<FontSize>('medium')
    const [theme, setTheme] = useState<Theme>('light')

    useEffect(() => {
        const loadSettings = async () => {
            const loadedFontSize = await SettingsService.getFontSize()
            const loadedTheme = await SettingsService.getTheme()
            setFontSize(loadedFontSize)
            setTheme(loadedTheme)
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

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>అక్షర పరిమాణం (Font Size)</Text>
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
                        చిన్న
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
                        మధ్యస్థం
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
                        పెద్ద
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>నేపథ్యం (Theme)</Text>
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
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
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
        borderWidth: 2,
        borderColor: '#F97316',
        backgroundColor: 'white',
    },
    themeButtonSepia: {
        backgroundColor: '#F5F0E6',
        marginLeft: 16,
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
})

export default SettingsScreen
