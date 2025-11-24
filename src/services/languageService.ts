import AsyncStorage from '@react-native-async-storage/async-storage'

export type Language = 'telugu' | 'kannada'

const KEYS = {
    CURRENT_LANGUAGE: '@bhaktivani:currentLanguage',
    LAST_SYNC_TIMESTAMP: '@bhaktivani:lastSyncTimestamp',
    INITIAL_SETUP_COMPLETE: '@bhaktivani:initialSetupComplete',
    CONTENT_VERSION_PREFIX: '@bhaktivani:contentVersion:',
    SYNC_STATS: '@bhaktivani:syncStats',
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

    /**
     * Get content version for a specific language
     */
    async getContentVersion(language: Language): Promise<number> {
        try {
            const key = `${KEYS.CONTENT_VERSION_PREFIX}${language}`
            const value = await AsyncStorage.getItem(key)
            return value ? parseInt(value, 10) : 0
        } catch (error) {
            console.error('Error getting content version:', error)
            return 0
        }
    },

    /**
     * Set content version for a specific language
     */
    async setContentVersion(language: Language, version: number): Promise<void> {
        try {
            const key = `${KEYS.CONTENT_VERSION_PREFIX}${language}`
            await AsyncStorage.setItem(key, version.toString())
        } catch (error) {
            console.error('Error setting content version:', error)
        }
    },

    /**
     * Get sync statistics (deity count, stotra count, last sync time)
     */
    async getSyncStats(): Promise<{ deityCount: number; stotraCount: number; lastSync: number }> {
        try {
            const value = await AsyncStorage.getItem(KEYS.SYNC_STATS)
            if (value) {
                return JSON.parse(value)
            }
            return { deityCount: 0, stotraCount: 0, lastSync: 0 }
        } catch (error) {
            console.error('Error getting sync stats:', error)
            return { deityCount: 0, stotraCount: 0, lastSync: 0 }
        }
    },

    /**
     * Set sync statistics after successful sync
     */
    async setSyncStats(deityCount: number, stotraCount: number): Promise<void> {
        try {
            const stats = {
                deityCount,
                stotraCount,
                lastSync: Date.now(),
            }
            await AsyncStorage.setItem(KEYS.SYNC_STATS, JSON.stringify(stats))
        } catch (error) {
            console.error('Error setting sync stats:', error)
        }
    },
}
