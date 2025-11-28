#!/usr/bin/env node

/**
 * Example script showing how to import scraped data to Firebase
 * 
 * Prerequisites:
 * 1. Install Firebase Admin SDK: npm install firebase-admin
 * 2. Download service account key from Firebase Console
 * 3. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
 */

import admin from 'firebase-admin';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
// Option 1: Using service account key file
// const serviceAccount = require('./path/to/serviceAccountKey.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// Option 2: Using environment variable
// Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
try {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK');
    console.error('Please set GOOGLE_APPLICATION_CREDENTIALS environment variable');
    console.error('or modify this script to use a service account key file');
    process.exit(1);
}

const db = admin.firestore();

/**
 * Import migration file to Firebase Firestore
 * @param {string} migrationFilePath - Path to migration JSON file
 */
async function importMigration(migrationFilePath) {
    try {
        console.log(`📥 Reading migration file: ${migrationFilePath}`);

        const fileContent = await fs.readFile(migrationFilePath, 'utf8');
        const migration = JSON.parse(fileContent);

        console.log(`\n📊 Migration Info:`);
        console.log(`   - Version: ${migration.version}`);
        console.log(`   - Source: ${migration.source}`);
        console.log(`   - Created: ${migration.createdAt}`);

        // Get the Firebase import data
        const collections = migration.firebaseImport.__collections__;

        if (!collections || Object.keys(collections).length === 0) {
            throw new Error('No collections found in migration file');
        }

        // Import each collection
        for (const [collectionName, documents] of Object.entries(collections)) {
            console.log(`\n📝 Importing collection: ${collectionName}`);

            const batch = db.batch();
            let count = 0;

            for (const [docId, docData] of Object.entries(documents)) {
                const docRef = db.collection(collectionName).doc(docId);

                // Convert timestamp fields
                const processedData = processTimestamps(docData);

                batch.set(docRef, processedData);
                count++;

                console.log(`   - Adding document: ${docId}`);
            }

            // Commit the batch
            await batch.commit();
            console.log(`✅ Imported ${count} documents to ${collectionName}`);
        }

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error(`\n❌ Error importing migration: ${error.message}`);
        throw error;
    }
}

/**
 * Process timestamp fields in document data
 * @param {Object} data - Document data
 * @returns {Object} Processed data with Firestore timestamps
 */
function processTimestamps(data) {
    const processed = { ...data };

    for (const [key, value] of Object.entries(processed)) {
        if (value && typeof value === 'object') {
            // Check if it's a timestamp field
            if (value.__datatype__ === 'timestamp' && value.value) {
                processed[key] = admin.firestore.Timestamp.fromDate(new Date(value.value));
            } else if (!Array.isArray(value)) {
                // Recursively process nested objects
                processed[key] = processTimestamps(value);
            }
        }
    }

    return processed;
}

/**
 * List all migration files in the migrations directory
 */
async function listMigrations() {
    try {
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = await fs.readdir(migrationsDir);

        const migrationFiles = files.filter(f =>
            f.startsWith('migration-') &&
            f.endsWith('.json') &&
            !f.includes('.simplified.')
        );

        return migrationFiles.map(f => path.join(migrationsDir, f));
    } catch (error) {
        console.error('❌ Error listing migrations:', error.message);
        return [];
    }
}

/**
 * Main function
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('📋 Available migrations:');
        const migrations = await listMigrations();

        if (migrations.length === 0) {
            console.log('   No migration files found in ./migrations directory');
            console.log('\nRun the scraper first to generate migration files:');
            console.log('   npm run scrape -- --url https://example.com');
            return;
        }

        migrations.forEach((m, i) => {
            console.log(`   ${i + 1}. ${path.basename(m)}`);
        });

        console.log('\nUsage:');
        console.log('   node example-import.js <migration-file-path>');
        console.log('\nExample:');
        console.log(`   node example-import.js ${migrations[0]}`);
        return;
    }

    const migrationFile = args[0];

    // Check if file exists
    try {
        await fs.access(migrationFile);
    } catch {
        console.error(`❌ Migration file not found: ${migrationFile}`);
        process.exit(1);
    }

    await importMigration(migrationFile);
}

// Run the main function
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
