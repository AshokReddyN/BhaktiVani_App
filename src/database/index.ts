import { Database } from '@nozbe/watermelondb'
import { schema } from './schema'
import migrations from './migrations'
// Old models removed - using language-specific models only
import DeityTelugu from './models/DeityTelugu'
import DeityKannada from './models/DeityKannada'
import StotraTelugu from './models/StotraTelugu'
import StotraKannada from './models/StotraKannada'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { Platform } from 'react-native'

import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'

// Conditionally enable JSI based on environment
// JSI is available in:
// - Expo SDK 54+ with custom dev client or EAS build
// - NOT available in Expo Go (uses legacy bridge)
const isExpoGo = __DEV__ && !process.env.EXPO_PUBLIC_USE_CUSTOM_CLIENT;

let adapter;

if (isExpoGo) {
    console.log('Database: Running in Expo Go - Using LokiJSAdapter (SQLite not supported without custom client)');
    adapter = new LokiJSAdapter({
        schema,
        migrations,
        useWebWorker: false,
        useIncrementalIndexedDB: true,
        onSetUpError: (error: any) => {
            console.error('Database: LokiJS load failed', error);
        }
    });
} else {
    const useJSI = true; // Always try JSI in custom client/production
    console.log('Database: Custom client/Production detected - Using SQLiteAdapter with JSI');

    adapter = new SQLiteAdapter({
        schema,
        migrations,
        dbName: 'bhaktivani',
        jsi: useJSI,
        onSetUpError: error => {
            console.error('Database: SQLite load failed', error);
        }
    });
}

console.log(`Database: Adapter initialized (${isExpoGo ? 'LokiJS' : 'SQLite'})`);

export const database = new Database({
    adapter,
    modelClasses: [
        // Only language-specific models
        DeityTelugu,
        DeityKannada,
        StotraTelugu,
        StotraKannada,
    ],
})

