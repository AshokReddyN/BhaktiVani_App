import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { database } from '../database';
import Deity from '../database/models/Deity';
import Stotra from '../database/models/Stotra';
import { LanguageService, Language } from './languageService';
import { CacheService } from './cacheService';

export interface StotraData {
    stotra_id: string;
    deity_id: string;
    category: string;
    title_telugu: string;
    text_telugu: string;
    title_kannada: string;
    text_kannada: string;
    version_timestamp: number;
}

export interface DeityData {
    deity_id: string;
    name_english: string;
    name_telugu: string;
    name_kannada: string;
    image: string;
}

/**
 * Firebase Sync Service
 * Handles synchronization between Firestore and local WatermelonDB
 */
export const SyncService = {
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

                const cachedData = await CacheService.loadFromCache();
                if (cachedData) {
                    if (onProgress) onProgress(50);

                    // Restore cache to database
                    await CacheService.restoreCacheToDatabase(cachedData);

                    if (onProgress) onProgress(100);
                    console.log('Loaded data from cache successfully');
                    return;
                }
            }

            // 2. If no cache or invalid, download from Firebase
            console.log('No valid cache - downloading from Firebase');
            if (onProgress) onProgress(10);

            // Fetch all deities from Firestore
            const deitiesSnapshot = await getDocs(collection(db, 'deities'));
            const deitiesData = deitiesSnapshot.docs.map(doc => doc.data() as DeityData);
            console.log(`Fetched ${deitiesData.length} deities from Firebase`);

            if (onProgress) onProgress(30);

            // Fetch all stotras from Firestore
            const stotrasSnapshot = await getDocs(collection(db, 'stotras'));
            const stotrasData = stotrasSnapshot.docs.map(doc => doc.data() as StotraData);
            console.log(`Fetched ${stotrasData.length} stotras from Firebase`);

            if (onProgress) onProgress(50);

            // Save to local database
            await database.write(async () => {
                // Clear existing data
                const existingDeities = await database.get<Deity>('deities').query().fetch();
                const existingStotras = await database.get<Stotra>('stotras').query().fetch();

                for (const deity of existingDeities) {
                    await deity.markAsDeleted();
                }
                for (const stotra of existingStotras) {
                    await stotra.markAsDeleted();
                }

                if (onProgress) onProgress(60);

                // Insert deities (both language names for display)
                const deityMap = new Map<string, Deity>();
                for (const deityData of deitiesData) {
                    const deity = await database.get<Deity>('deities').create(d => {
                        d.name = language === 'telugu' ? deityData.name_telugu : deityData.name_kannada;
                        d.nameEnglish = deityData.name_english;
                        d.nameTelugu = deityData.name_telugu;
                        d.nameKannada = deityData.name_kannada;
                        d.image = deityData.image;
                    });
                    deityMap.set(deityData.deity_id, deity);
                }

                if (onProgress) onProgress(80);

                // Insert stotras - ONLY selected language to save space
                for (const stotraData of stotrasData) {
                    const deity = deityMap.get(stotraData.deity_id);

                    if (deity) {
                        await database.get<Stotra>('stotras').create(stotra => {
                            stotra.stotraId = stotraData.stotra_id;

                            if (language === 'telugu') {
                                // Download only Telugu content
                                stotra.title = stotraData.title_telugu;
                                stotra.content = stotraData.text_telugu;
                                stotra.titleTelugu = stotraData.title_telugu;
                                stotra.textTelugu = stotraData.text_telugu;
                                // Leave Kannada fields empty to save space
                                stotra.titleKannada = '';
                                stotra.textKannada = '';
                            } else {
                                // Download only Kannada content
                                stotra.title = stotraData.title_kannada;
                                stotra.content = stotraData.text_kannada;
                                stotra.titleKannada = stotraData.title_kannada;
                                stotra.textKannada = stotraData.text_kannada;
                                // Leave Telugu fields empty to save space
                                stotra.titleTelugu = '';
                                stotra.textTelugu = '';
                            }

                            stotra.versionTimestamp = stotraData.version_timestamp || Date.now();
                            stotra.isFavorite = false;
                            stotra.deity.set(deity);
                        });
                    }
                }
            });

            // 3. Save downloaded data to cache for next time
            const allDeities = await database.get<Deity>('deities').query().fetch();
            const allStotras = await database.get<Stotra>('stotras').query().fetch();
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
                const cachedData = await CacheService.loadFromCache();
                if (cachedData) {
                    await CacheService.restoreCacheToDatabase(cachedData);
                    if (onProgress) {
                        onProgress(cachedData.deities.length, cachedData.deities.length, 'deities');
                        onProgress(cachedData.stotras.length, cachedData.stotras.length, 'stotras');
                    }
                    console.log('Loaded data from cache successfully');
                    return;
                }
            }

            // Download from Firebase
            const deitiesSnapshot = await getDocs(collection(db, 'deities'));
            const deitiesData = deitiesSnapshot.docs.map(doc => doc.data() as DeityData);
            console.log(`Fetched ${deitiesData.length} deities from Firebase`);

            const stotrasSnapshot = await getDocs(collection(db, 'stotras'));
            const stotrasData = stotrasSnapshot.docs.map(doc => doc.data() as StotraData);
            console.log(`Fetched ${stotrasData.length} stotras from Firebase`);

            // Save to local database with detailed progress
            await database.write(async () => {
                // Clear existing data
                const existingDeities = await database.get<Deity>('deities').query().fetch();
                const existingStotras = await database.get<Stotra>('stotras').query().fetch();

                for (const deity of existingDeities) {
                    await deity.markAsDeleted();
                }
                for (const stotra of existingStotras) {
                    await stotra.markAsDeleted();
                }

                // Insert deities with progress
                const deityMap = new Map<string, Deity>();
                for (let i = 0; i < deitiesData.length; i++) {
                    const deityData = deitiesData[i];
                    const deity = await database.get<Deity>('deities').create(d => {
                        d.name = language === 'telugu' ? deityData.name_telugu : deityData.name_kannada;
                        d.nameEnglish = deityData.name_english;
                        d.nameTelugu = deityData.name_telugu;
                        d.nameKannada = deityData.name_kannada;
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
                        await database.get<Stotra>('stotras').create(stotra => {
                            stotra.stotraId = stotraData.stotra_id;

                            if (language === 'telugu') {
                                stotra.title = stotraData.title_telugu;
                                stotra.content = stotraData.text_telugu;
                                stotra.titleTelugu = stotraData.title_telugu;
                                stotra.textTelugu = stotraData.text_telugu;
                                stotra.titleKannada = '';
                                stotra.textKannada = '';
                            } else {
                                stotra.title = stotraData.title_kannada;
                                stotra.content = stotraData.text_kannada;
                                stotra.titleKannada = stotraData.title_kannada;
                                stotra.textKannada = stotraData.text_kannada;
                                stotra.titleTelugu = '';
                                stotra.textTelugu = '';
                            }

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
            const allDeities = await database.get<Deity>('deities').query().fetch();
            const allStotras = await database.get<Stotra>('stotras').query().fetch();
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
     * Incremental sync - fetch only updated content since last sync
     */
    async syncNewContent(onProgress?: (progress: number) => void): Promise<{ updated: number; errors: number }> {
        try {
            console.log('Starting incremental sync...');

            const lastSync = await LanguageService.getLastSyncTimestamp();
            console.log('Last sync timestamp:', lastSync);

            if (onProgress) onProgress(20);

            // Query stotras updated since last sync
            const stotrasRef = collection(db, 'stotras');
            const q = query(stotrasRef, where('version_timestamp', '>', lastSync));
            const snapshot = await getDocs(q);

            console.log(`Found ${snapshot.docs.length} updated stotras`);

            if (onProgress) onProgress(50);

            let updated = 0;
            let errors = 0;

            for (const docSnapshot of snapshot.docs) {
                try {
                    const stotraData = docSnapshot.data() as StotraData;
                    await this.upsertStotra(stotraData);
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
     * Only updates the selected language fields to save bandwidth
     */
    async upsertStotra(stotraData: StotraData): Promise<void> {
        await database.write(async () => {
            const collection = database.get<Stotra>('stotras');
            const existing = await collection.query().fetch();
            const found = existing.find(s => s.stotraId === stotraData.stotra_id);

            // Get current language preference
            const currentLanguage = await LanguageService.getCurrentLanguage();

            if (found) {
                // Update existing stotra - only selected language
                await found.update(stotra => {
                    if (currentLanguage === 'telugu') {
                        stotra.titleTelugu = stotraData.title_telugu;
                        stotra.textTelugu = stotraData.text_telugu;
                        stotra.title = stotraData.title_telugu;
                        stotra.content = stotraData.text_telugu;
                        // Don't update Kannada fields
                    } else {
                        stotra.titleKannada = stotraData.title_kannada;
                        stotra.textKannada = stotraData.text_kannada;
                        stotra.title = stotraData.title_kannada;
                        stotra.content = stotraData.text_kannada;
                        // Don't update Telugu fields
                    }
                    stotra.versionTimestamp = stotraData.version_timestamp || Date.now();
                });
            } else {
                // Create new stotra - only selected language
                const deityCollection = database.get<Deity>('deities');
                const deities = await deityCollection.query().fetch();
                const deity = deities.find(d => d.image === stotraData.deity_id);

                if (deity) {
                    await collection.create(stotra => {
                        stotra.stotraId = stotraData.stotra_id;

                        if (currentLanguage === 'telugu') {
                            stotra.title = stotraData.title_telugu;
                            stotra.content = stotraData.text_telugu;
                            stotra.titleTelugu = stotraData.title_telugu;
                            stotra.textTelugu = stotraData.text_telugu;
                            stotra.titleKannada = '';
                            stotra.textKannada = '';
                        } else {
                            stotra.title = stotraData.title_kannada;
                            stotra.content = stotraData.text_kannada;
                            stotra.titleKannada = stotraData.title_kannada;
                            stotra.textKannada = stotraData.text_kannada;
                            stotra.titleTelugu = '';
                            stotra.textTelugu = '';
                        }

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
     * Get the master sync timestamp from backend
     */
    async getMasterTimestamp(): Promise<number> {
        try {
            const configDoc = await getDocs(collection(db, 'config'));
            const globalConfig = configDoc.docs.find(doc => doc.id === 'global');
            if (globalConfig) {
                const data = globalConfig.data();
                return data.master_timestamp || Date.now();
            }
            return Date.now();
        } catch (error) {
            console.error('Error fetching master timestamp:', error);
            return Date.now();
        }
    },

    /**
     * Check if updates are available without downloading
     * Compares local content version with Firebase master timestamp
     */
    async checkForUpdates(): Promise<{ hasUpdates: boolean; updateCount: number }> {
        try {
            const currentLanguage = await LanguageService.getCurrentLanguage();
            if (!currentLanguage) {
                return { hasUpdates: false, updateCount: 0 };
            }

            const localVersion = await LanguageService.getContentVersion(currentLanguage);
            const lastSync = await LanguageService.getLastSyncTimestamp();

            // Query stotras updated since last sync
            const stotrasRef = collection(db, 'stotras');
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
