import { Database } from '@nozbe/watermelondb'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'
import { schema } from './schema'
import migrations from './migrations'
import Deity from './models/Deity'
import Stotra from './models/Stotra'

const adapter = new LokiJSAdapter({
    schema,
    // (You might want to comment out migrations if you haven't created them yet)
    // migrations,
    useWebWorker: false,
    useIncrementalIndexedDB: true,
    onSetUpError: error => {
        // Database failed to load -- offer the user to reload the app or log out
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
