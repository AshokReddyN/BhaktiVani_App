import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { database } from '../database';
import DeityTelugu from '../database/models/DeityTelugu';
import DeityKannada from '../database/models/DeityKannada';
import StotraTelugu from '../database/models/StotraTelugu';
import StotraKannada from '../database/models/StotraKannada';
import { LanguageService, Language } from './languageService';
import { CacheService } from './cacheService';

// Simplified interfaces - single language only
export interface StotraData {
    stotra_id: string;
    deity_id: string;
    category: string;
    title: string;
    title_english: string;
    content: string;
    version_timestamp: number;
}

export interface DeityData {
    deity_id: string;
    name: string;
    name_english: string;
    image: string;
}

/**
 * Firebase Sync Service (Language-Specific)
 * Handles synchronization between Firestore and local WatermelonDB
 * Downloads only the selected language data
 */
export const SyncService = {
    /**
     * Get Firebase collection names for current language
     */
    getCollectionNames(language: Language): { deities: string; stotras: string } {
        return {
            deities: `deities_${language}`,
            stotras: `stotras_${language}`,
        };
    },

    /**
     * Get local table names for current language
     */
    getTableNames(language: Language): { deities: string; stotras: string } {
        return {
            deities: `deities_${language}`,
            stotras: `stotras_${language}`,
        };
    },

    /**
     * Get model classes for current language
     */
    getModelClasses(language: Language) {
        if (language === 'telugu') {
            return {
                Deity: DeityTelugu,
                Stotra: StotraTelugu,
            };
        } else {
            return {
                Deity: DeityKannada,
                Stotra: StotraKannada,
            };
        }
    },

    /**
     * Initial download - fetch all content from Firebase (selected language only)
     * This reduces download size by ~50% by downloading only the selected language
     */
    async initialDownload(language: Language, onProgress?: (progress: number) => void): Promise<void> {
        try {
            console.log(`Starting initial download for ${language}...`);

            // 1. Check if we have valid cache for this language
            const isCacheValid = await CacheService.isCacheValidForLanguage(language);

            if (isCacheValid) {
                console.log('Valid cache found - loading from local storage');
                if (onProgress) onProgress(10);

                const cachedData = await CacheService.loadFromCache(language);
                if (cachedData) {
                    if (onProgress) onProgress(50);

                    // Restore cache to database
                    await CacheService.restoreCacheToDatabase(cachedData, language);

                    if (onProgress) onProgress(100);
                    console.log('Loaded data from cache successfully');
                    return;
                }
            }

            // 2. If no cache or invalid, download from Firebase
            console.log('No valid cache - downloading from Firebase');
            if (onProgress) onProgress(10);

            const collections = this.getCollectionNames(language);
            const tables = this.getTableNames(language);
            const models = this.getModelClasses(language);

            // Fetch all deities from Firestore (language-specific collection)
            const deitiesSnapshot = await getDocs(collection(db, collections.deities));
            const deitiesData = deitiesSnapshot.docs.map(doc => doc.data() as DeityData);
            console.log(`Fetched ${deitiesData.length} deities from Firebase (${language})`);

            if (onProgress) onProgress(30);

            // Fetch all stotras from Firestore (language-specific collection)
            const stotrasSnapshot = await getDocs(collection(db, collections.stotras));
            const stotrasData = stotrasSnapshot.docs.map(doc => doc.data() as StotraData);
            console.log(`Fetched ${stotrasData.length} stotras from Firebase (${language})`);

            if (onProgress) onProgress(50);

            // Save to local database
            await database.write(async () => {
                // Clear existing data for this language
                const existingDeities = await database.get(tables.deities).query().fetch();
                const existingStotras = await database.get(tables.stotras).query().fetch();

                for (const deity of existingDeities) {
                    await deity.markAsDeleted();
                }
                for (const stotra of existingStotras) {
                    await stotra.markAsDeleted();
                }

                if (onProgress) onProgress(60);

                // Insert deities
                const deityMap = new Map<string, any>();
                for (const deityData of deitiesData) {
                    const deity = await database.get(tables.deities).create((d: any) => {
                        d.deityId = deityData.deity_id;
                        d.name = deityData.name;
                        d.nameEnglish = deityData.name_english;
                        d.image = deityData.image;
                    });
                    deityMap.set(deityData.deity_id, deity);
                }

                if (onProgress) onProgress(80);

                // Insert stotras
                for (const stotraData of stotrasData) {
                    const deity = deityMap.get(stotraData.deity_id);

                    if (deity) {
                        await database.get(tables.stotras).create((stotra: any) => {
                            stotra.stotraId = stotraData.stotra_id;
                            stotra.title = stotraData.title;
                            stotra.titleEnglish = stotraData.title_english;
                            stotra.content = stotraData.content;
                            stotra.versionTimestamp = stotraData.version_timestamp || Date.now();
                            stotra.isFavorite = false;
                            stotra.deity.set(deity);
                        });
                    }
                }
            });

            // 3. Save downloaded data to cache for next time
            const allDeities = await database.get(tables.deities).query().fetch();
            const allStotras = await database.get(tables.stotras).query().fetch();
            await CacheService.saveToCache(allDeities, allStotras, language);

            if (onProgress) onProgress(100);

            // Update last sync timestamp and sync stats
            await LanguageService.setLastSyncTimestamp(Date.now());
            await LanguageService.setSyncStats(deitiesData.length, stotrasData.length);
            await LanguageService.setContentVersion(language, Date.now());

            console.log(`Initial download complete for ${language}`);
        } catch (error) {
            console.error('Initial download failed:', error);
            throw error;
        }
    },

    /**
     * Initial download with detailed progress (current/total items)
     * Provides more granular progress updates for better UX
     */
    async initialDownloadWithDetails(
        language: Language,
        onProgress?: (current: number, total: number, type: 'deities' | 'stotras') => void
    ): Promise<void> {
        try {
            console.log(`Starting detailed download for ${language}...`);

            // Check cache first
            const isCacheValid = await CacheService.isCacheValidForLanguage(language);
            if (isCacheValid) {
                const cachedData = await CacheService.loadFromCache(language);
                if (cachedData) {
                    await CacheService.restoreCacheToDatabase(cachedData, language);
                    if (onProgress) {
                        onProgress(cachedData.deities.length, cachedData.deities.length, 'deities');
                        onProgress(cachedData.stotras.length, cachedData.stotras.length, 'stotras');
                    }
                    console.log('Loaded data from cache successfully');
                    return;
                }
            }

            const collections = this.getCollectionNames(language);
            const tables = this.getTableNames(language);

            // Download from Firebase
            const deitiesSnapshot = await getDocs(collection(db, collections.deities));
            const deitiesData = deitiesSnapshot.docs.map(doc => doc.data() as DeityData);
            console.log(`Fetched ${deitiesData.length} deities from Firebase`);

            const stotrasSnapshot = await getDocs(collection(db, collections.stotras));
            const stotrasData = stotrasSnapshot.docs.map(doc => doc.data() as StotraData);
            console.log(`Fetched ${stotrasData.length} stotras from Firebase`);

            // Save to local database with detailed progress
            await database.write(async () => {
                // Clear existing data
                const existingDeities = await database.get(tables.deities).query().fetch();
                const existingStotras = await database.get(tables.stotras).query().fetch();

                for (const deity of existingDeities) {
                    await deity.markAsDeleted();
                }
                for (const stotra of existingStotras) {
                    await stotra.markAsDeleted();
                }

                // Insert deities with progress
                const deityMap = new Map<string, any>();
                for (let i = 0; i < deitiesData.length; i++) {
                    const deityData = deitiesData[i];
                    const deity = await database.get(tables.deities).create((d: any) => {
                        d.deityId = deityData.deity_id;
                        d.name = deityData.name;
                        d.nameEnglish = deityData.name_english;
                        d.image = deityData.image;
                    });
                    deityMap.set(deityData.deity_id, deity);

                    if (onProgress) {
                        onProgress(i + 1, deitiesData.length, 'deities');
                    }
                }

                // Insert stotras with progress
                for (let i = 0; i < stotrasData.length; i++) {
                    const stotraData = stotrasData[i];
                    const deity = deityMap.get(stotraData.deity_id);

                    if (deity) {
                        await database.get(tables.stotras).create((stotra: any) => {
                            stotra.stotraId = stotraData.stotra_id;
                            stotra.title = stotraData.title;
                            stotra.titleEnglish = stotraData.title_english;
                            stotra.content = stotraData.content;
                            stotra.versionTimestamp = stotraData.version_timestamp || Date.now();
                            stotra.isFavorite = false;
                            stotra.deity.set(deity);
                        });
                    }

                    if (onProgress) {
                        onProgress(i + 1, stotrasData.length, 'stotras');
                    }
                }
            });

            // Save to cache and update stats
            const allDeities = await database.get(tables.deities).query().fetch();
            const allStotras = await database.get(tables.stotras).query().fetch();
            await CacheService.saveToCache(allDeities, allStotras, language);
            await LanguageService.setLastSyncTimestamp(Date.now());
            await LanguageService.setSyncStats(deitiesData.length, stotrasData.length);
            await LanguageService.setContentVersion(language, Date.now());

            console.log(`Detailed download complete for ${language}`);
        } catch (error) {
            console.error('Detailed download failed:', error);
            throw error;
        }
    },

    /**
     * Switch language - clear current language data and download new language
     */
    async switchLanguage(newLanguage: Language, onProgress?: (progress: number) => void): Promise<void> {
        try {
            console.log(`Switching to ${newLanguage}...`);

            // Clear cache for language switch
            await CacheService.clearCache();

            if (onProgress) onProgress(20);

            // Download new language data
            await this.initialDownload(newLanguage, (progress) => {
                // Map 0-100 to 20-100
                if (onProgress) onProgress(20 + (progress * 0.8));
            });

            // Update current language
            await LanguageService.setCurrentLanguage(newLanguage);

            console.log(`Language switched to ${newLanguage}`);
        } catch (error) {
            console.error('Language switch failed:', error);
            throw error;
        }
    },

    /**
     * Incremental sync - fetch only updated content since last sync
     */
    async syncNewContent(onProgress?: (progress: number) => void): Promise<{ updated: number; errors: number }> {
        try {
            console.log('Starting incremental sync...');

            const currentLanguage = await LanguageService.getCurrentLanguage();
            if (!currentLanguage) {
                throw new Error('No language selected');
            }

            const lastSync = await LanguageService.getLastSyncTimestamp();
            console.log('Last sync timestamp:', lastSync);

            if (onProgress) onProgress(20);

            const collections = this.getCollectionNames(currentLanguage);

            // Query stotras updated since last sync
            const stotrasRef = collection(db, collections.stotras);
            const q = query(stotrasRef, where('version_timestamp', '>', lastSync));
            const snapshot = await getDocs(q);

            console.log(`Found ${snapshot.docs.length} updated stotras`);

            if (onProgress) onProgress(50);

            let updated = 0;
            let errors = 0;

            for (const docSnapshot of snapshot.docs) {
                try {
                    const stotraData = docSnapshot.data() as StotraData;
                    await this.upsertStotra(stotraData, currentLanguage);
                    updated++;
                } catch (error) {
                    console.error('Error syncing stotra:', error);
                    errors++;
                }
            }

            if (onProgress) onProgress(90);

            // Update last sync timestamp
            await LanguageService.setLastSyncTimestamp(Date.now());

            if (onProgress) onProgress(100);

            console.log(`Incremental sync complete: ${updated} updated, ${errors} errors`);
            return { updated, errors };
        } catch (error) {
            console.error('Incremental sync failed:', error);
            throw error;
        }
    },

    /**
     * Upsert a stotra (insert or update)
     */
    async upsertStotra(stotraData: StotraData, language: Language): Promise<void> {
        await database.write(async () => {
            const tables = this.getTableNames(language);
            const collection = database.get(tables.stotras);
            const existing = await collection.query().fetch();
            const found = existing.find((s: any) => s.stotraId === stotraData.stotra_id);

            if (found) {
                // Update existing stotra
                await found.update((stotra: any) => {
                    stotra.title = stotraData.title;
                    stotra.titleEnglish = stotraData.title_english;
                    stotra.content = stotraData.content;
                    stotra.versionTimestamp = stotraData.version_timestamp || Date.now();
                });
            } else {
                // Create new stotra
                const deityCollection = database.get(tables.deities);
                const deities = await deityCollection.query().fetch();
                const deity = deities.find((d: any) => d.deityId === stotraData.deity_id);

                if (deity) {
                    await collection.create((stotra: any) => {
                        stotra.stotraId = stotraData.stotra_id;
                        stotra.title = stotraData.title;
                        stotra.titleEnglish = stotraData.title_english;
                        stotra.content = stotraData.content;
                        stotra.versionTimestamp = stotraData.version_timestamp || Date.now();
                        stotra.isFavorite = false;
                        stotra.deity.set(deity);
                    });
                }
            }
        });
    },

    /**
     * Check if device is online
     */
    async isOnline(): Promise<boolean> {
        try {
            const response = await fetch('https://www.google.com', { method: 'HEAD', mode: 'no-cors' });
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Check if updates are available without downloading
     */
    async checkForUpdates(): Promise<{ hasUpdates: boolean; updateCount: number }> {
        try {
            const currentLanguage = await LanguageService.getCurrentLanguage();
            if (!currentLanguage) {
                return { hasUpdates: false, updateCount: 0 };
            }

            const lastSync = await LanguageService.getLastSyncTimestamp();
            const collections = this.getCollectionNames(currentLanguage);

            // Query stotras updated since last sync
            const stotrasRef = collection(db, collections.stotras);
            const q = query(stotrasRef, where('version_timestamp', '>', lastSync));
            const snapshot = await getDocs(q);

            const updateCount = snapshot.docs.length;
            const hasUpdates = updateCount > 0;

            console.log(`Update check: ${updateCount} updates available`);
            return { hasUpdates, updateCount };
        } catch (error) {
            console.error('Error checking for updates:', error);
            return { hasUpdates: false, updateCount: 0 };
        }
    },
};
