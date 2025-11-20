import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { seedDatabase } from './src/database/seed';

export default function App() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                await seedDatabase();
            } catch (e) {
                console.error("Database seeding failed:", e);
            } finally {
                setIsReady(true);
            }
        };
        init();
    }, []);

    if (!isReady) {
        return null; // Or a splash screen
    }

    return (
        <SafeAreaProvider>
            <StatusBar style="auto" />
            <AppNavigator />
        </SafeAreaProvider>
    );
}
