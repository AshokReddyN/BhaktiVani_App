import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { schema } from './schema'
import migrations from './migrations'
import Deity from './models/Deity'
import Stotra from './models/Stotra'
import { Platform } from 'react-native'

// Use synchronous SQLite for better compatibility with Expo
const adapter = new SQLiteAdapter({
    schema,
    migrations,
    jsi: Platform.OS === 'ios', // Use JSI on iOS for better performance
    onSetUpError: error => {
        console.error('Database failed to load', error)
    }
})

export const database = new Database({
    adapter,
    modelClasses: [
        Deity,
        Stotra,
    ],
})

