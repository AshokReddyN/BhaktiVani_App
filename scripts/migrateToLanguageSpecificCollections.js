const admin = require('firebase-admin');

// You'll need to download your service account key from Firebase Console
// Firebase Console → Project Settings → Service Accounts → Generate New Private Key
// Save it as 'serviceAccountKey.json' in the scripts folder

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Migration Script: Split Multi-Language Collections into Language-Specific Collections
 * 
 * This script migrates data from:
 * - deities → deities_telugu, deities_kannada
 * - stotras → stotras_telugu, stotras_kannada
 * 
 * Run this script ONCE to migrate your Firebase data structure.
 */

async function migrateDeities() {
    console.log('\n📿 Migrating Deities...\n');

    try {
        // Fetch all deities from the original collection
        const deitiesSnapshot = await db.collection('deities').get();

        if (deitiesSnapshot.empty) {
            console.log('⚠️  No deities found in the original collection');
            return { telugu: 0, kannada: 0 };
        }

        let teluguCount = 0;
        let kannadaCount = 0;

        // Process each deity
        for (const doc of deitiesSnapshot.docs) {
            const data = doc.data();
            const docId = doc.id; // Use Firestore document ID

            // Skip if essential fields are missing
            if (!data.name_telugu && !data.name_kannada) {
                console.log(`  ⚠️  Skipping ${docId} - missing language names`);
                continue;
            }

            // Create Telugu deity
            const teluguDeity = {
                deity_id: docId,
                name: data.name_telugu || data.name_english || 'Unknown',
                name_english: data.name_english || '',
                image: data.image || '',
                order: data.order || 0,
                created_at: data.created_at || admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('deities_telugu').doc(docId).set(teluguDeity);
            teluguCount++;
            console.log(`  ✓ Telugu: ${teluguDeity.name} (${docId})`);

            // Create Kannada deity
            const kannadaDeity = {
                deity_id: docId,
                name: data.name_kannada || data.name_english || 'Unknown',
                name_english: data.name_english || '',
                image: data.image || '',
                order: data.order || 0,
                created_at: data.created_at || admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('deities_kannada').doc(docId).set(kannadaDeity);
            kannadaCount++;
            console.log(`  ✓ Kannada: ${kannadaDeity.name} (${docId})`);
        }

        console.log(`\n✅ Deities Migration Complete:`);
        console.log(`   - Telugu: ${teluguCount} deities`);
        console.log(`   - Kannada: ${kannadaCount} deities`);

        return { telugu: teluguCount, kannada: kannadaCount };
    } catch (error) {
        console.error('❌ Error migrating deities:', error);
        throw error;
    }
}

async function migrateStotras() {
    console.log('\n📖 Migrating Stotras...\n');

    try {
        // Fetch all stotras from the original collection
        const stotrasSnapshot = await db.collection('stotras').get();

        if (stotrasSnapshot.empty) {
            console.log('⚠️  No stotras found in the original collection');
            return { telugu: 0, kannada: 0 };
        }

        let teluguCount = 0;
        let kannadaCount = 0;

        // Process each stotra
        for (const doc of stotrasSnapshot.docs) {
            const data = doc.data();
            const docId = doc.id; // Use Firestore document ID

            // Skip if essential fields are missing
            if (!data.title_telugu && !data.title_kannada) {
                console.log(`  ⚠️  Skipping ${docId} - missing language titles`);
                continue;
            }

            // Create Telugu stotra
            const teluguStotra = {
                stotra_id: docId,
                deity_id: data.deity_id || '',
                category: data.category || 'general',
                title: data.title_telugu || data.title_english || 'Untitled',
                title_english: data.title_english || '',
                content: data.text_telugu || '',
                version_timestamp: data.version_timestamp || Date.now(),
                created_at: data.created_at || admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('stotras_telugu').doc(docId).set(teluguStotra);
            teluguCount++;
            console.log(`  ✓ Telugu: ${teluguStotra.title} (${docId})`);

            // Create Kannada stotra
            const kannadaStotra = {
                stotra_id: docId,
                deity_id: data.deity_id || '',
                category: data.category || 'general',
                title: data.title_kannada || data.title_english || 'Untitled',
                title_english: data.title_english || '',
                content: data.text_kannada || '',
                version_timestamp: data.version_timestamp || Date.now(),
                created_at: data.created_at || admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('stotras_kannada').doc(docId).set(kannadaStotra);
            kannadaCount++;
            console.log(`  ✓ Kannada: ${kannadaStotra.title} (${docId})`);
        }

        console.log(`\n✅ Stotras Migration Complete:`);
        console.log(`   - Telugu: ${teluguCount} stotras`);
        console.log(`   - Kannada: ${kannadaCount} stotras`);

        return { telugu: teluguCount, kannada: kannadaCount };
    } catch (error) {
        console.error('❌ Error migrating stotras:', error);
        throw error;
    }
}

async function verifyMigration() {
    console.log('\n🔍 Verifying Migration...\n');

    try {
        // Count documents in each collection
        const teluguDeitiesCount = (await db.collection('deities_telugu').get()).size;
        const kannadaDeitiesCount = (await db.collection('deities_kannada').get()).size;
        const teluguStotrasCount = (await db.collection('stotras_telugu').get()).size;
        const kannadaStotrasCount = (await db.collection('stotras_kannada').get()).size;

        console.log('📊 Collection Counts:');
        console.log(`   - deities_telugu: ${teluguDeitiesCount}`);
        console.log(`   - deities_kannada: ${kannadaDeitiesCount}`);
        console.log(`   - stotras_telugu: ${teluguStotrasCount}`);
        console.log(`   - stotras_kannada: ${kannadaStotrasCount}`);

        // Verify counts match
        if (teluguDeitiesCount !== kannadaDeitiesCount) {
            console.warn('\n⚠️  Warning: Deity counts do not match between languages!');
        }
        if (teluguStotrasCount !== kannadaStotrasCount) {
            console.warn('\n⚠️  Warning: Stotra counts do not match between languages!');
        }

        // Sample verification - check first deity in each language
        const teluguDeityDoc = await db.collection('deities_telugu').limit(1).get();
        const kannadaDeityDoc = await db.collection('deities_kannada').limit(1).get();

        if (!teluguDeityDoc.empty && !kannadaDeityDoc.empty) {
            const teluguDeity = teluguDeityDoc.docs[0].data();
            const kannadaDeity = kannadaDeityDoc.docs[0].data();

            console.log('\n✅ Sample Data Verification:');
            console.log(`   Telugu Deity: ${teluguDeity.name} (${teluguDeity.deity_id})`);
            console.log(`   Kannada Deity: ${kannadaDeity.name} (${kannadaDeity.deity_id})`);
        }

        return {
            deities: { telugu: teluguDeitiesCount, kannada: kannadaDeitiesCount },
            stotras: { telugu: teluguStotrasCount, kannada: kannadaStotrasCount }
        };
    } catch (error) {
        console.error('❌ Error verifying migration:', error);
        throw error;
    }
}

async function runMigration() {
    console.log('🚀 Starting Firebase Data Migration to Language-Specific Collections\n');
    console.log('='.repeat(70));

    try {
        // Step 1: Migrate Deities
        const deityResults = await migrateDeities();

        // Step 2: Migrate Stotras
        const stotraResults = await migrateStotras();

        // Step 3: Verify Migration
        const verification = await verifyMigration();

        // Summary
        console.log('\n' + '='.repeat(70));
        console.log('\n🎉 Migration Complete!\n');
        console.log('📊 Summary:');
        console.log(`   Deities:  ${deityResults.telugu} Telugu, ${deityResults.kannada} Kannada`);
        console.log(`   Stotras:  ${stotraResults.telugu} Telugu, ${stotraResults.kannada} Kannada`);
        console.log('\n✨ Your Firebase database now has language-specific collections!');
        console.log('\n💡 Next Steps:');
        console.log('   1. Verify the data in Firebase Console');
        console.log('   2. Update your app code to use new collections');
        console.log('   3. (Optional) Backup and delete old collections after verification');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        console.log('\n🔄 Rollback Instructions:');
        console.log('   1. The original collections are still intact');
        console.log('   2. You can delete the new collections and try again');
        console.log('   3. Check the error message above for details');
        process.exit(1);
    }
}

// Run the migration
runMigration()
    .then(() => {
        console.log('\n👋 Migration script completed. Exiting...\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
