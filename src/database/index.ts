import { Database } from '@nozbe/watermelondb'
import { schema } from './schema'
import migrations from './migrations'
import Deity from './models/Deity'
import Stotra from './models/Stotra'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'

// Use LokiJS adapter for Expo Go compatibility
// For production builds, switch to SQLiteAdapter
const adapter = new LokiJSAdapter({
    schema,
    migrations,
    useWebWorker: false,
    useIncrementalIndexedDB: true,
    dbName: 'bhaktivani',
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

