import AsyncStorage from '@react-native-async-storage/async-storage'

export type Language = 'telugu' | 'kannada'

const KEYS = {
    CURRENT_LANGUAGE: '@bhaktivani:currentLanguage',
    LAST_SYNC_TIMESTAMP: '@bhaktivani:lastSyncTimestamp',
    INITIAL_SETUP_COMPLETE: '@bhaktivani:initialSetupComplete',
} as const

export const LanguageService = {
    /**
     * Get the currently selected language
     */
    async getCurrentLanguage(): Promise<Language | null> {
        try {
            const value = await AsyncStorage.getItem(KEYS.CURRENT_LANGUAGE)
            return value as Language | null
        } catch (error) {
            console.error('Error getting current language:', error)
            return null
        }
    },

    /**
     * Set the current language preference
     */
    async setCurrentLanguage(language: Language): Promise<void> {
        try {
            await AsyncStorage.setItem(KEYS.CURRENT_LANGUAGE, language)
        } catch (error) {
            console.error('Error setting current language:', error)
        }
    },

    /**
     * Get the timestamp of the last successful sync
     */
    async getLastSyncTimestamp(): Promise<number> {
        try {
            const value = await AsyncStorage.getItem(KEYS.LAST_SYNC_TIMESTAMP)
            return value ? parseInt(value, 10) : 0
        } catch (error) {
            console.error('Error getting last sync timestamp:', error)
            return 0
        }
    },

    /**
     * Update the last sync timestamp
     */
    async setLastSyncTimestamp(timestamp: number): Promise<void> {
        try {
            await AsyncStorage.setItem(KEYS.LAST_SYNC_TIMESTAMP, timestamp.toString())
        } catch (error) {
            console.error('Error setting last sync timestamp:', error)
        }
    },

    /**
     * Check if initial setup (language selection + content download) is complete
     */
    async isInitialSetupComplete(): Promise<boolean> {
        try {
            const value = await AsyncStorage.getItem(KEYS.INITIAL_SETUP_COMPLETE)
            return value === 'true'
        } catch (error) {
            console.error('Error checking initial setup:', error)
            return false
        }
    },

    /**
     * Mark initial setup as complete
     */
    async markInitialSetupComplete(): Promise<void> {
        try {
            await AsyncStorage.setItem(KEYS.INITIAL_SETUP_COMPLETE, 'true')
        } catch (error) {
            console.error('Error marking initial setup complete:', error)
        }
    },

    /**
     * Reset all language-related settings (for testing/debugging)
     */
    async resetAll(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([
                KEYS.CURRENT_LANGUAGE,
                KEYS.LAST_SYNC_TIMESTAMP,
                KEYS.INITIAL_SETUP_COMPLETE,
            ])
        } catch (error) {
            console.error('Error resetting language settings:', error)
        }
    },
}
