import { Database } from '@nozbe/watermelondb'
import { schema } from './schema'
import migrations from './migrations'
import Deity from './models/Deity'
import Stotra from './models/Stotra'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { Platform } from 'react-native'

// Use SQLite adapter for production-ready persistence in React Native
// This ensures data persists across app restarts and device reboots

// Conditionally enable JSI based on environment
// JSI is available in:
// - Expo SDK 54+ with custom dev client or EAS build
// - NOT available in Expo Go (uses legacy bridge)
const useJSI = (() => {
    try {
        // Check if we're in a custom dev client or production build
        // Expo Go doesn't support JSI for SQLite
        const isExpoGo = __DEV__ && !process.env.EXPO_PUBLIC_USE_CUSTOM_CLIENT;

        if (isExpoGo) {
            console.log('Database: Running in Expo Go - JSI disabled');
            return false;
        }

        console.log('Database: Custom client detected - JSI enabled');
        return true;
    } catch (error) {
        console.warn('Database: Could not detect environment, defaulting to JSI disabled');
        return false;
    }
})();

const adapter = new SQLiteAdapter({
    schema,
    migrations,
    dbName: 'bhaktivani',
    jsi: useJSI,
    onSetUpError: error => {
        console.error('Database failed to load', error);
        console.error('If using Expo Go, SQLite persistence may not work. Use a custom dev client or EAS build.');
    }
})

console.log(`Database: Using SQLite adapter (JSI: ${useJSI ? 'enabled' : 'disabled'})`);

export const database = new Database({
    adapter,
    modelClasses: [
        Deity,
        Stotra,
    ],
})

