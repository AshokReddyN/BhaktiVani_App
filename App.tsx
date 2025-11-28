import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { seedDatabase } from './src/database/seed';
import { LanguageService } from './src/services/languageService';
import { migrateExistingData } from './src/database/dataMigration';
import { database } from './src/database';
import LanguageSelectionScreen from './src/screens/LanguageSelectionScreen';
import { BackgroundSyncService } from './src/services/backgroundSyncService';

export default function App() {
    const [isReady, setIsReady] = useState(false);
    const [needsLanguageSelection, setNeedsLanguageSelection] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                if (__DEV__) console.log('App: Starting initialization...');

                // Database is already initialized via import
                // No need to check - schema v5 uses language-specific tables

                // Run migration to ensure schema is up to date
                await migrateExistingData();

                // Check if initial setup is complete
                const setupComplete = await LanguageService.isInitialSetupComplete();
                if (__DEV__) console.log(`App: Setup complete: ${setupComplete}`);

                // Show language selection screen if setup is not complete
                setNeedsLanguageSelection(!setupComplete);

                // Initialize background sync service
                await BackgroundSyncService.initialize();
                if (__DEV__) console.log('App: Background sync initialized');
            } catch (e) {
                console.error("App: Initialization failed:", e);
                // On error, show language selection as fallback
                setNeedsLanguageSelection(true);
            } finally {
                setIsReady(true);
                if (__DEV__) console.log('App: Initialization complete');
            }
        };
        init();
    }, []);

    if (!isReady) {
        return null; // Or a splash screen
    }

    // Language selection is now optional - app proceeds with default language
    // User can change language in settings
    if (needsLanguageSelection) {
        return <LanguageSelectionScreen onComplete={() => setNeedsLanguageSelection(false)} />;
    }

    return (
        <SafeAreaProvider>
            <StatusBar style="auto" />
            <AppNavigator />
        </SafeAreaProvider>
    );
}
