import { database } from './index'
import Deity from './models/Deity'
import {
    seedVenkateswara,
    seedGanesha,
    seedHanuman,
    seedShiva,
    seedLakshmi,
    seedSaraswati
} from './seeds'

export async function seedDatabase() {
    // Check if initial setup is complete (user has selected language and synced from Firebase)
    // If setup is complete, don't seed - let Firebase data be the source of truth
    const { LanguageService } = require('../services/languageService');
    const isSetupComplete = await LanguageService.isInitialSetupComplete();

    if (isSetupComplete) {
        console.log('Initial setup complete - skipping local seed (using Firebase data)');
        return;
    }

    const deitiesCount = await database.get<Deity>('deities').query().fetchCount();

    if (deitiesCount > 0) {
        console.log('Database already seeded');
        return;
    }

    await database.write(async () => {
        // Seed all deities
        await seedVenkateswara(database);
        await seedGanesha(database);
        await seedHanuman(database);
        await seedShiva(database);
        await seedLakshmi(database);
        await seedSaraswati(database);

        console.log('Database seeded successfully');
    });
}
