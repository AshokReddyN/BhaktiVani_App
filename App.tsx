import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { seedDatabase } from './src/database/seed';
import { LanguageService } from './src/services/languageService';
import { migrateExistingData } from './src/database/dataMigration';
import { database } from './src/database';
import LanguageSelectionScreen from './src/screens/LanguageSelectionScreen';

export default function App() {
    const [isReady, setIsReady] = useState(false);
    const [needsLanguageSelection, setNeedsLanguageSelection] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                console.log('App: Starting initialization...');

                // Ensure database is initialized and ready
                // The database is already initialized via the import, but we can verify it's working
                try {
                    const deityCount = await database.get('deities').query().fetchCount();
                    const stotraCount = await database.get('stotras').query().fetchCount();
                    console.log(`App: Database ready - ${deityCount} deities, ${stotraCount} stotras`);
                } catch (dbError) {
                    console.error('App: Database initialization check failed:', dbError);
                    // Continue anyway - database might be empty on first launch
                }

                // Run migration to ensure schema is up to date
                await migrateExistingData();

                // Check if initial setup is complete
                const setupComplete = await LanguageService.isInitialSetupComplete();
                console.log(`App: Setup complete: ${setupComplete}`);

                // Show language selection screen if setup is not complete
                setNeedsLanguageSelection(!setupComplete);
            } catch (e) {
                console.error("App: Initialization failed:", e);
                // On error, show language selection as fallback
                setNeedsLanguageSelection(true);
            } finally {
                setIsReady(true);
                console.log('App: Initialization complete');
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
