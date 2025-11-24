import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../database';
import Deity from '../database/models/Deity';
import Stotra from '../database/models/Stotra';

const CACHE_KEY = 'bhaktivani_data_cache';
const CACHE_VERSION_KEY = 'bhaktivani_cache_version';
const CURRENT_CACHE_VERSION = '1.0';

interface CachedData {
    deities: any[];
    stotras: any[];
    language: string;
    timestamp: number;
    version: string;
}

/**
 * Persistent cache service using AsyncStorage
 * Stores Firebase data locally so it doesn't need to be re-downloaded every time
 */
export const CacheService = {
    /**
     * Save data to persistent cache
     */
    async saveToCache(deities: Deity[], stotras: Stotra[], language: string): Promise<void> {
        try {
            const cacheData: CachedData = {
                deities: deities.map(d => ({
                    id: d.id,
                    name: d.name,
                    nameTelugu: d.nameTelugu,
                    nameKannada: d.nameKannada,
                    image: d.image
                })),
                stotras: stotras.map(s => ({
                    id: s.id,
                    deityId: (s as any)._raw.deity_id, // Access raw field for relation ID
                    title: s.title,
                    titleTelugu: s.titleTelugu,
                    titleKannada: s.titleKannada,
                    content: s.content,
                    textTelugu: s.textTelugu,
                    textKannada: s.textKannada,
                    isFavorite: s.isFavorite
                })),
                language,
                timestamp: Date.now(),
                version: CURRENT_CACHE_VERSION
            };

            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
            await AsyncStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
            console.log(`Cache: Saved ${deities.length} deities and ${stotras.length} stotras for ${language}`);
        } catch (error) {
            console.error('Cache: Error saving to cache:', error);
        }
    },

    /**
     * Load data from persistent cache
     */
    async loadFromCache(): Promise<CachedData | null> {
        try {
            const cachedDataString = await AsyncStorage.getItem(CACHE_KEY);
            const cacheVersion = await AsyncStorage.getItem(CACHE_VERSION_KEY);

            if (!cachedDataString || cacheVersion !== CURRENT_CACHE_VERSION) {
                console.log('Cache: No valid cache found');
                return null;
            }

            const cachedData: CachedData = JSON.parse(cachedDataString);
            console.log(`Cache: Loaded ${cachedData.deities.length} deities and ${cachedData.stotras.length} stotras for ${cachedData.language}`);
            return cachedData;
        } catch (error) {
            console.error('Cache: Error loading from cache:', error);
            return null;
        }
    },

    /**
     * Restore cached data to database
     */
    async restoreCacheToDatabase(cachedData: CachedData): Promise<void> {
        try {
            await database.write(async () => {
                const deitiesCollection = database.get<Deity>('deities');
                const stotrasCollection = database.get<Stotra>('stotras');

                // Create deities
                for (const deityData of cachedData.deities) {
                    await deitiesCollection.create(deity => {
                        deity._raw.id = deityData.id;
                        deity.name = deityData.name;
                        deity.nameTelugu = deityData.nameTelugu;
                        deity.nameKannada = deityData.nameKannada;
                        deity.image = deityData.image;
                    });
                }

                // Create stotras
                for (const stotraData of cachedData.stotras) {
                    await stotrasCollection.create(stotra => {
                        stotra._raw.id = stotraData.id;
                        (stotra as any)._raw.deity_id = stotraData.deityId; // Set raw relation ID
                        stotra.title = stotraData.title;
                        stotra.titleTelugu = stotraData.titleTelugu;
                        stotra.titleKannada = stotraData.titleKannada;
                        stotra.content = stotraData.content;
                        stotra.textTelugu = stotraData.textTelugu;
                        stotra.textKannada = stotraData.textKannada;
                        stotra.isFavorite = stotraData.isFavorite;
                    });
                }
            });

            console.log('Cache: Restored cache to database');
        } catch (error) {
            console.error('Cache: Error restoring cache to database:', error);
            throw error;
        }
    },

    /**
     * Clear cache (useful when changing language or forcing refresh)
     */
    async clearCache(): Promise<void> {
        try {
            await AsyncStorage.removeItem(CACHE_KEY);
            await AsyncStorage.removeItem(CACHE_VERSION_KEY);
            console.log('Cache: Cleared');
        } catch (error) {
            console.error('Cache: Error clearing cache:', error);
        }
    },

    /**
     * Update favorite status for a single stotra in cache
     */
    async updateStotraFavorite(stotraId: string, isFavorite: boolean): Promise<void> {
        try {
            const cachedData = await this.loadFromCache();
            if (!cachedData) return;

            const stotraIndex = cachedData.stotras.findIndex(s => s.id === stotraId);
            if (stotraIndex !== -1) {
                cachedData.stotras[stotraIndex].isFavorite = isFavorite;

                await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
                console.log(`Cache: Updated favorite status for stotra ${stotraId} to ${isFavorite}`);
            }
        } catch (error) {
            console.error('Cache: Error updating favorite status:', error);
        }
    },

    /**
     * Check if cache is valid for current language
     */
    async isCacheValidForLanguage(language: string): Promise<boolean> {
        const cachedData = await this.loadFromCache();
        if (!cachedData) return false;

        const isValid = cachedData.language === language;
        console.log(`Cache: Valid for ${language}? ${isValid}`);
        return isValid;
    },

    /**
     * Invalidate cache when language changes
     * This ensures fresh download for the new language
     */
    async invalidateCacheForLanguageChange(): Promise<void> {
        try {
            await this.clearCache();
            console.log('Cache: Invalidated for language change');
        } catch (error) {
            console.error('Cache: Error invalidating cache:', error);
        }
    },

    /**
     * Get cache statistics for monitoring
     */
    async getCacheStats(): Promise<{ size: number; itemCount: number; lastUpdated: number }> {
        try {
            const cachedData = await this.loadFromCache();
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
