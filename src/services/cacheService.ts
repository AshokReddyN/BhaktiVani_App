import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../database';
import { Language } from './languageService';

const CACHE_KEY_PREFIX = 'bhaktivani_data_cache';
const CACHE_VERSION_KEY = 'bhaktivani_cache_version';
const CURRENT_CACHE_VERSION = '2.0'; // Bumped for language-specific caching

interface CachedData {
    deities: any[];
    stotras: any[];
    language: string;
    timestamp: number;
    version: string;
}

/**
 * Persistent cache service using AsyncStorage (Language-Specific)
 * Stores Firebase data locally so it doesn't need to be re-downloaded every time
 */
export const CacheService = {
    /**
     * Get cache key for specific language
     */
    getCacheKey(language: Language): string {
        return `${CACHE_KEY_PREFIX}_${language}`;
    },

    /**
     * Save data to persistent cache (language-specific)
     */
    async saveToCache(deities: any[], stotras: any[], language: Language): Promise<void> {
        try {
            const cacheData: CachedData = {
                deities: deities.map((d: any) => ({
                    id: d.id,
                    deityId: d.deityId,
                    name: d.name,
                    nameEnglish: d.nameEnglish,
                    image: d.image
                })),
                stotras: stotras.map((s: any) => ({
                    id: s.id,
                    stotraId: s.stotraId,
                    deityId: (s as any)._raw.deity_id, // Access raw field for relation ID
                    title: s.title,
                    titleEnglish: s.titleEnglish,
                    content: s.content,
                    isFavorite: s.isFavorite,
                    versionTimestamp: s.versionTimestamp
                })),
                language,
                timestamp: Date.now(),
                version: CURRENT_CACHE_VERSION
            };

            const cacheKey = this.getCacheKey(language);
            await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
            await AsyncStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
            console.log(`Cache: Saved ${deities.length} deities and ${stotras.length} stotras for ${language}`);
        } catch (error) {
            console.error('Cache: Error saving to cache:', error);
        }
    },

    /**
     * Load data from persistent cache (language-specific)
     */
    async loadFromCache(language: Language): Promise<CachedData | null> {
        try {
            const cacheKey = this.getCacheKey(language);
            const cachedDataString = await AsyncStorage.getItem(cacheKey);
            const cacheVersion = await AsyncStorage.getItem(CACHE_VERSION_KEY);

            if (!cachedDataString || cacheVersion !== CURRENT_CACHE_VERSION) {
                console.log(`Cache: No valid cache found for ${language}`);
                return null;
            }

            const cachedData: CachedData = JSON.parse(cachedDataString);
            console.log(`Cache: Loaded ${cachedData.deities.length} deities and ${cachedData.stotras.length} stotras for ${language}`);
            return cachedData;
        } catch (error) {
            console.error('Cache: Error loading from cache:', error);
            return null;
        }
    },

    /**
     * Restore cached data to database (language-specific)
     */
    async restoreCacheToDatabase(cachedData: CachedData, language: Language): Promise<void> {
        try {
            const tableName = language === 'telugu' ? 'deities_telugu' : 'deities_kannada';
            const stotraTableName = language === 'telugu' ? 'stotras_telugu' : 'stotras_kannada';

            await database.write(async () => {
                const deitiesCollection = database.get(tableName);
                const stotrasCollection = database.get(stotraTableName);

                // Create deities
                for (const deityData of cachedData.deities) {
                    await deitiesCollection.create((deity: any) => {
                        deity._raw.id = deityData.id;
                        deity.deityId = deityData.deityId;
                        deity.name = deityData.name;
                        deity.nameEnglish = deityData.nameEnglish;
                        deity.image = deityData.image;
                    });
                }

                // Create stotras
                for (const stotraData of cachedData.stotras) {
                    await stotrasCollection.create((stotra: any) => {
                        stotra._raw.id = stotraData.id;
                        (stotra as any)._raw.deity_id = stotraData.deityId; // Set raw relation ID
                        stotra.stotraId = stotraData.stotraId;
                        stotra.title = stotraData.title;
                        stotra.titleEnglish = stotraData.titleEnglish;
                        stotra.content = stotraData.content;
                        stotra.isFavorite = stotraData.isFavorite;
                        stotra.versionTimestamp = stotraData.versionTimestamp;
                    });
                }
            });

            console.log(`Cache: Restored cache to database for ${language}`);
        } catch (error) {
            console.error('Cache: Error restoring cache to database:', error);
            throw error;
        }
    },

    /**
     * Clear cache for all languages
     */
    async clearCache(): Promise<void> {
        try {
            await AsyncStorage.removeItem(this.getCacheKey('telugu'));
            await AsyncStorage.removeItem(this.getCacheKey('kannada'));
            await AsyncStorage.removeItem(CACHE_VERSION_KEY);
            console.log('Cache: Cleared all language caches');
        } catch (error) {
            console.error('Cache: Error clearing cache:', error);
        }
    },

    /**
     * Clear cache for specific language
     */
    async clearLanguageCache(language: Language): Promise<void> {
        try {
            await AsyncStorage.removeItem(this.getCacheKey(language));
            console.log(`Cache: Cleared cache for ${language}`);
        } catch (error) {
            console.error('Cache: Error clearing language cache:', error);
        }
    },

    /**
     * Update favorite status for a single stotra in cache
     */
    async updateStotraFavorite(stotraId: string, isFavorite: boolean, language: Language): Promise<void> {
        try {
            const cachedData = await this.loadFromCache(language);
            if (!cachedData) return;

            const stotraIndex = cachedData.stotras.findIndex(s => s.stotraId === stotraId);
            if (stotraIndex !== -1) {
                cachedData.stotras[stotraIndex].isFavorite = isFavorite;

                const cacheKey = this.getCacheKey(language);
                await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedData));
                console.log(`Cache: Updated favorite status for stotra ${stotraId} to ${isFavorite}`);
            }
        } catch (error) {
            console.error('Cache: Error updating favorite status:', error);
        }
    },

    /**
     * Check if cache is valid for current language
     */
    async isCacheValidForLanguage(language: Language): Promise<boolean> {
        const cachedData = await this.loadFromCache(language);
        if (!cachedData) return false;

        const isValid = cachedData.language === language;
        console.log(`Cache: Valid for ${language}? ${isValid}`);
        return isValid;
    },

    /**
     * Get cache statistics for monitoring
     */
    async getCacheStats(language: Language): Promise<{ size: number; itemCount: number; lastUpdated: number }> {
        try {
            const cachedData = await this.loadFromCache(language);
            if (!cachedData) {
                return { size: 0, itemCount: 0, lastUpdated: 0 };
            }

            const itemCount = cachedData.deities.length + cachedData.stotras.length;
            const cacheString = JSON.stringify(cachedData);
            const size = new Blob([cacheString]).size;

            return {
                size,
                itemCount,
                lastUpdated: cachedData.timestamp,
            };
        } catch (error) {
            console.error('Cache: Error getting cache stats:', error);
            return { size: 0, itemCount: 0, lastUpdated: 0 };
        }
    },
};
