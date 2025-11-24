import { database } from './index'
import Deity from './models/Deity'

/**
 * Database seeding is no longer used.
 * All data comes from Firebase.
 * 
 * On first launch: User selects language → Firebase sync downloads all data
 * On subsequent launches: Firebase data is re-downloaded (LokiJS doesn't persist reliably)
 */
export async function seedDatabase() {
    const deitiesCount = await database.get<Deity>('deities').query().fetchCount();

    if (deitiesCount > 0) {
        console.log(`Database has ${deitiesCount} deities - no seeding needed`);
        return;
    }

    console.log('Database empty - waiting for Firebase sync to populate data');
    // No local seeding - Firebase sync will handle all data
}
