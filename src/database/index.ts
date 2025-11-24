import { Database } from '@nozbe/watermelondb'
import { schema } from './schema'
import migrations from './migrations'
import Deity from './models/Deity'
import Stotra from './models/Stotra'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

// Use SQLite adapter for production-ready persistence in React Native
// This ensures data persists across app restarts and device reboots
const adapter = new SQLiteAdapter({
    schema,
    migrations,
    dbName: 'bhaktivani',
    jsi: true, // Use JSI for better performance (Expo SDK 54+ supports this)
    onSetUpError: error => {
        console.error('Database failed to load', error)
    }
})

console.log('Using SQLite adapter for persistent storage')

export const database = new Database({
    adapter,
    modelClasses: [
        Deity,
        Stotra,
    ],
})

