import { database } from './index'
import Deity from './models/Deity'
import Stotra from './models/Stotra'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Migration version - increment this when adding new migrations
const CURRENT_MIGRATION_VERSION = 1;
const MIGRATION_VERSION_KEY = '@bhaktivani:migrationVersion';
const CHUNK_SIZE = 50; // Process records in chunks to avoid blocking UI

/**
 * Migration progress callback
 */
export type MigrationProgressCallback = (
    current: number,
    total: number,
    phase: 'deities' | 'stotras'
) => void;

/**
 * Check if migration has already been completed
 */
async function getMigrationVersion(): Promise<number> {
    try {
        const version = await AsyncStorage.getItem(MIGRATION_VERSION_KEY);
        return version ? parseInt(version, 10) : 0;
    } catch (error) {
        console.error('Error reading migration version:', error);
        return 0;
    }
}

/**
 * Save migration version after successful completion
 */
async function setMigrationVersion(version: number): Promise<void> {
    try {
        await AsyncStorage.setItem(MIGRATION_VERSION_KEY, version.toString());
        console.log(`Migration version saved: ${version}`);
    } catch (error) {
        console.error('Error saving migration version:', error);
    }
}

/**
 * Process items in chunks to avoid blocking the UI thread
 */
async function processInChunks<T>(
    items: T[],
    processor: (item: T) => Promise<void>,
    onProgress?: (current: number, total: number) => void
): Promise<void> {
    const total = items.length;

    for (let i = 0; i < total; i += CHUNK_SIZE) {
        const chunk = items.slice(i, Math.min(i + CHUNK_SIZE, total));

        // Process chunk in a single transaction
        await database.write(async () => {
            for (const item of chunk) {
                await processor(item);
            }
        });

        // Report progress
        if (onProgress) {
            onProgress(Math.min(i + CHUNK_SIZE, total), total);
        }

        // Small delay to allow UI updates
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}

/**
 * One-time migration to populate new language fields from existing data
 * DISABLED: This migration is no longer needed with schema v5 (language-specific tables)
 * The old 'deities' and 'stotras' tables no longer exist.
 */
export async function migrateExistingData(
    onProgress?: MigrationProgressCallback
): Promise<void> {
    console.log('Checking migration status...');

    // MIGRATION DISABLED - No longer needed with language-specific tables
    console.log('Data migration skipped - using language-specific tables (schema v5)');

    // Mark as complete to prevent retries
    await setMigrationVersion(CURRENT_MIGRATION_VERSION);
    return;

    /* OLD MIGRATION CODE - DISABLED
    try {
        // Check if migration has already been completed
        const currentVersion = await getMigrationVersion();

        if (currentVersion >= CURRENT_MIGRATION_VERSION) {
            console.log(`Migration already completed (version ${currentVersion})`);
            return;
        }

        console.log(`Starting data migration (version ${CURRENT_MIGRATION_VERSION})...`);

        // Fetch all records (read-only, outside transaction)
        const deities = await database.get<Deity>('deities').query().fetch();
        const stotras = await database.get<Stotra>('stotras').query().fetch();

        console.log(`Found ${deities.length} deities and ${stotras.length} stotras to migrate`);

        // Migrate deities in chunks
        if (deities.length > 0) {
            console.log('Migrating deities...');
            await processInChunks(
                deities,
                async (deity) => {
                    await deity.update(d => {
                        // Only set language fields if they are COMPLETELY empty
                        // Don't overwrite Firebase-synced data!
                        if (!d.nameTelugu || d.nameTelugu.trim() === '') {
                            d.nameTelugu = d.name;
                        }
                        if (!d.nameKannada || d.nameKannada.trim() === '') {
                            // Only set as placeholder if truly empty
                            // Firebase sync will provide the real Kannada name
                            d.nameKannada = d.name; // Placeholder
                        }
                    });
                },
                (current, total) => {
                    if (onProgress) {
                        onProgress(current, total, 'deities');
                    }
                }
            );
            console.log(`Migrated ${deities.length} deities`);
        }

        // Migrate stotras in chunks
        if (stotras.length > 0) {
            console.log('Migrating stotras...');
            await processInChunks(
                stotras,
                async (stotra) => {
                    await stotra.update(s => {
                        // Generate unique stotra_id if not set
                        if (!s.stotraId) {
                            s.stotraId = `stotra_${s.id}_${Date.now()}`;
                        }

                        // Only migrate if language fields are empty
                        if (!s.titleTelugu) {
                            s.titleTelugu = s.title;
                        }
                        if (!s.textTelugu) {
                            s.textTelugu = s.content;
                        }
                        if (!s.titleKannada) {
                            s.titleKannada = s.title; // Placeholder
                        }
                        if (!s.textKannada) {
                            s.textKannada = s.content; // Placeholder
                        }

                        // Set initial version timestamp if not set
                        if (!s.versionTimestamp) {
                            s.versionTimestamp = Date.now();
                        }
                    });
                },
                (current, total) => {
                    if (onProgress) {
                        onProgress(current, total, 'stotras');
                    }
                }
            );
            console.log(`Migrated ${stotras.length} stotras`);
        }

        // Mark migration as complete
        await setMigrationVersion(CURRENT_MIGRATION_VERSION);
        console.log('Data migration completed successfully!');

    } catch (error) {
        console.error('Data migration failed:', error);
        console.error('Migration will be retried on next app launch');
        // Don't save migration version on failure - will retry next time
        throw error;
    }
    */
}

/**
 * Reset migration version (for testing or forcing re-migration)
 * WARNING: Only use this if you know what you're doing!
 */
export async function resetMigrationVersion(): Promise<void> {
    try {
        await AsyncStorage.removeItem(MIGRATION_VERSION_KEY);
        console.log('Migration version reset');
    } catch (error) {
        console.error('Error resetting migration version:', error);
    }
}
