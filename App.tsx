import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { seedDatabase } from './src/database/seed';
import { LanguageService } from './src/services/languageService';
import { migrateExistingData } from './src/database/dataMigration';
import LanguageSelectionScreen from './src/screens/LanguageSelectionScreen';

export default function App() {
    const [isReady, setIsReady] = useState(false);
    const [needsLanguageSelection, setNeedsLanguageSelection] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                // Seed database with initial data
                await seedDatabase();

                // Run data migration to populate new language fields
                // This is safe to run multiple times (idempotent)
                await migrateExistingData();

                // Check if initial setup is complete
                const setupComplete = await LanguageService.isInitialSetupComplete();
                
                // Show language selection screen if setup is not complete
                setNeedsLanguageSelection(!setupComplete);
            } catch (e) {
                console.error("Initialization failed:", e);
                // If initialization fails, check if we have a language set
                // If not, show language selection screen
                try {
                    const currentLang = await LanguageService.getCurrentLanguage();
                    const setupComplete = await LanguageService.isInitialSetupComplete();
                    // Only show language selection if no language is set and setup is not complete
                    setNeedsLanguageSelection(!setupComplete && !currentLang);
                } catch (err) {
                    console.error("Error checking language:", err);
                    // On error, show language selection as fallback
                    setNeedsLanguageSelection(true);
                }
            } finally {
                setIsReady(true);
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
