import AsyncStorage from '@react-native-async-storage/async-storage'

export type FontSize = 'small' | 'medium' | 'large'
export type Theme = 'light' | 'sepia' | 'dark'

const SETTINGS_KEYS = {
    FONT_SIZE: '@bhaktivani:fontSize',
    THEME: '@bhaktivani:theme',
} as const

const DEFAULT_FONT_SIZE: FontSize = 'medium'
const DEFAULT_THEME: Theme = 'light'

export const SettingsService = {
    async getFontSize(): Promise<FontSize> {
        try {
            const value = await AsyncStorage.getItem(SETTINGS_KEYS.FONT_SIZE)
            return (value as FontSize) || DEFAULT_FONT_SIZE
        } catch (error) {
            console.error('Error getting font size:', error)
            return DEFAULT_FONT_SIZE
        }
    },

    async setFontSize(size: FontSize): Promise<void> {
        try {
            await AsyncStorage.setItem(SETTINGS_KEYS.FONT_SIZE, size)
        } catch (error) {
            console.error('Error setting font size:', error)
        }
    },

    async getTheme(): Promise<Theme> {
        try {
            const value = await AsyncStorage.getItem(SETTINGS_KEYS.THEME)
            return (value as Theme) || DEFAULT_THEME
        } catch (error) {
            console.error('Error getting theme:', error)
            return DEFAULT_THEME
        }
    },

    async setTheme(theme: Theme): Promise<void> {
        try {
            await AsyncStorage.setItem(SETTINGS_KEYS.THEME, theme)
        } catch (error) {
            console.error('Error setting theme:', error)
        }
    },

    getFontSizeValue(size: FontSize): number {
        switch (size) {
            case 'small':
                return 14
            case 'medium':
                return 18
            case 'large':
                return 22
            default:
                return 18
        }
    },

    getThemeColors(theme: Theme) {
        switch (theme) {
            case 'light':
                return {
                    background: '#FFFFFF',
                    text: '#1F2937',
                    surface: '#F9FAFB',
                }
            case 'sepia':
                return {
                    background: '#F5F0E6',
                    text: '#1F2937',
                    surface: '#F9F7F3',
                }
            case 'dark':
                return {
                    background: '#111827',
                    text: '#F9FAFB',
                    surface: '#1F2937',
                }
            default:
                return {
                    background: '#FFFFFF',
                    text: '#1F2937',
                    surface: '#F9FAFB',
                }
        }
    },
}

