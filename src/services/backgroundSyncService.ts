import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncService } from './syncService';

const BACKGROUND_SYNC_TASK = 'BACKGROUND_SYNC_TASK';
const AUTO_SYNC_ENABLED_KEY = '@auto_sync_enabled';
const LAST_AUTO_SYNC_KEY = '@last_auto_sync';

/**
 * Background Sync Service
 * Handles automatic weekly synchronization of content from Firebase
 */
export const BackgroundSyncService = {
    /**
     * Initialize background sync
     * Call this on app startup
     */
    async initialize(): Promise<void> {
        try {
            console.log('Initializing background sync service...');

            // Check if auto-sync is enabled
            const isEnabled = await this.isAutoSyncEnabled();

            if (isEnabled) {
                await this.registerBackgroundTask();
                console.log('Background sync initialized and registered');
            } else {
                console.log('Auto-sync is disabled');
            }
        } catch (error) {
            console.error('Failed to initialize background sync:', error);
        }
    },

    /**
     * Register the background fetch task
     */
    async registerBackgroundTask(): Promise<void> {
        try {
            // Check if task is already registered
            const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);

            if (isRegistered) {
                console.log('Background task already registered');
                return;
            }

            // Register the task
            await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
                minimumInterval: 7 * 24 * 60 * 60, // 7 days in seconds (weekly)
                stopOnTerminate: false, // Continue after app is terminated
                startOnBoot: true, // Start on device boot
            });

            console.log('Background sync task registered successfully');
        } catch (error) {
            console.error('Failed to register background task:', error);
            throw error;
        }
    },

    /**
     * Unregister the background fetch task
     */
    async unregisterBackgroundTask(): Promise<void> {
        try {
            await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
            console.log('Background sync task unregistered');
        } catch (error) {
            console.error('Failed to unregister background task:', error);
        }
    },

    /**
     * Enable automatic sync
     */
    async enableAutoSync(): Promise<void> {
        try {
            await AsyncStorage.setItem(AUTO_SYNC_ENABLED_KEY, 'true');
            await this.registerBackgroundTask();
            console.log('Auto-sync enabled');
        } catch (error) {
            console.error('Failed to enable auto-sync:', error);
            throw error;
        }
    },

    /**
     * Disable automatic sync
     */
    async disableAutoSync(): Promise<void> {
        try {
            await AsyncStorage.setItem(AUTO_SYNC_ENABLED_KEY, 'false');
            await this.unregisterBackgroundTask();
            console.log('Auto-sync disabled');
        } catch (error) {
            console.error('Failed to disable auto-sync:', error);
            throw error;
        }
    },

    /**
     * Check if auto-sync is enabled
     */
    async isAutoSyncEnabled(): Promise<boolean> {
        try {
            const value = await AsyncStorage.getItem(AUTO_SYNC_ENABLED_KEY);
            // Default to true if not set
            return value === null ? true : value === 'true';
        } catch (error) {
            console.error('Failed to check auto-sync status:', error);
            return false;
        }
    },

    /**
     * Get last auto-sync timestamp
     */
    async getLastAutoSync(): Promise<number | null> {
        try {
            const value = await AsyncStorage.getItem(LAST_AUTO_SYNC_KEY);
            return value ? parseInt(value, 10) : null;
        } catch (error) {
            console.error('Failed to get last auto-sync timestamp:', error);
            return null;
        }
    },

    /**
     * Set last auto-sync timestamp
     */
    async setLastAutoSync(timestamp: number): Promise<void> {
        try {
            await AsyncStorage.setItem(LAST_AUTO_SYNC_KEY, timestamp.toString());
        } catch (error) {
            console.error('Failed to set last auto-sync timestamp:', error);
        }
    },

    /**
     * Get next scheduled sync time
     * Returns null if auto-sync is disabled or no last sync
     */
    async getNextSyncTime(): Promise<number | null> {
        try {
            const isEnabled = await this.isAutoSyncEnabled();
            if (!isEnabled) return null;

            const lastSync = await this.getLastAutoSync();
            if (!lastSync) return null;

            // Add 7 days to last sync
            return lastSync + (7 * 24 * 60 * 60 * 1000);
        } catch (error) {
            console.error('Failed to get next sync time:', error);
            return null;
        }
    },

    /**
     * Check background fetch status
     */
    async getBackgroundFetchStatus(): Promise<BackgroundFetch.BackgroundFetchStatus> {
        try {
            const status = await BackgroundFetch.getStatusAsync();
            return status ?? BackgroundFetch.BackgroundFetchStatus.Denied;
        } catch (error) {
            console.error('Failed to get background fetch status:', error);
            return BackgroundFetch.BackgroundFetchStatus.Denied;
        }
    },
};

/**
 * Define the background task
 * This runs in the background even when the app is closed
 */
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
    try {
        console.log('Background sync task started');

        // Check if auto-sync is still enabled
        const isEnabled = await BackgroundSyncService.isAutoSyncEnabled();
        if (!isEnabled) {
            console.log('Auto-sync is disabled, skipping');
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        // Check if device is online
        const isOnline = await SyncService.isOnline();
        if (!isOnline) {
            console.log('Device is offline, skipping sync');
            return BackgroundFetch.BackgroundFetchResult.Failed;
        }

        // Perform incremental sync
        const result = await SyncService.syncNewContent();

        // Update last sync timestamp
        await BackgroundSyncService.setLastAutoSync(Date.now());

        console.log(`Background sync completed: ${result.updated} updated, ${result.errors} errors`);

        if (result.updated > 0) {
            return BackgroundFetch.BackgroundFetchResult.NewData;
        } else {
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }
    } catch (error) {
        console.error('Background sync task failed:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});
