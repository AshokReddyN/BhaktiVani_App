const admin = require('firebase-admin');

// Initialize Firebase Admin (reuse existing service account)
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// Map of stotra IDs to English titles
// These are transliterated versions of the stotra names
const englishTitles = {
    // Ganesha
    'ganesha_pancharatnam_001': 'Ganesha Pancharatnam',

    // Rama
    'rama_ashtottara_001': 'Sri Rama Ashtottara Shatanamavali',
    'rama_stotram_002': 'Sri Rama Stotram',
    'rama_mantra_003': 'Sri Rama Mantra',

    // Krishna
    'krishna_ashtottara_001': 'Sri Krishna Ashtottara Shatanamavali',
    'krishna_stotram_002': 'Sri Krishna Stotram',
    'krishna_mantra_003': 'Sri Krishna Mantra',

    // Saraswati
    'saraswati_stotram_001': 'Saraswati Stotram',
    'saraswati_namavali_002': 'Saraswati Namavali',
    'saraswati_mantra_003': 'Saraswati Mantra',
};

async function addEnglishTitles() {
    try {
        console.log('🚀 Starting to add English titles to stotras...\\n');

        const stotrasRef = db.collection('stotras');
        const snapshot = await stotrasRef.get();

        if (snapshot.empty) {
            console.log('⚠️  No stotras found in database');
            return;
        }

        console.log(`📖 Found ${snapshot.size} stotras\\n`);

        let updated = 0;
        let skipped = 0;

        for (const doc of snapshot.docs) {
            const stotraId = doc.id;
            const englishTitle = englishTitles[stotraId];

            if (englishTitle) {
                await doc.ref.update({
                    title_english: englishTitle,
                    version_timestamp: Date.now()
                });
                console.log(`  ✓ Updated: ${stotraId} -> "${englishTitle}"`);
                updated++;
            } else {
                console.log(`  ⚠️  Skipped: ${stotraId} (no English title mapping)`);
                skipped++;
            }
        }

        console.log('\\n✅ Migration complete!');
        console.log(`   - Updated: ${updated} stotras`);
        console.log(`   - Skipped: ${skipped} stotras`);

        if (skipped > 0) {
            console.log('\\n💡 Tip: Add English title mappings for skipped stotras in the englishTitles object');
        }

    } catch (error) {
        console.error('❌ Error adding English titles:', error);
        process.exit(1);
    }
}

// Run the migration
addEnglishTitles()
    .then(() => {
        console.log('\\n👋 Migration complete. Exiting...');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
