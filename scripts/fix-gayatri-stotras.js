import admin from 'firebase-admin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Fix Gayatri stotras to use correct field names
 */
async function fixGayatriStotras() {
    try {
        console.log('🔧 Fixing Gayatri stotra field names in Firebase...\n');

        // Get all Gayatri stotras
        const stotrasSnapshot = await db.collection('stotras')
            .where('deity', '==', 'Gayatri')
            .get();

        console.log(`Found ${stotrasSnapshot.size} Gayatri stotras to fix\n`);

        let fixedCount = 0;
        const batch = db.batch();

        stotrasSnapshot.forEach(doc => {
            const data = doc.data();
            const docRef = db.collection('stotras').doc(doc.id);

            // Prepare updated data with correct field names
            const updatedData = {
                // Keep original fields
                title: data.title || '',
                content: data.content || [],
                language: data.language || 'telugu',
                deity: 'Gayatri',
                category: data.category || 'Stotram',

                // Add language-specific fields
                title_telugu: data.title || '',
                text_telugu: Array.isArray(data.content) ? data.content.join('\n\n') : data.content || '',
                title_kannada: '', // Empty for now
                text_kannada: '', // Empty for now
                title_english: extractEnglishTitle(data.title || ''),

                // Metadata
                totalVerses: data.totalVerses || (Array.isArray(data.content) ? data.content.length : 0),
                sourceUrl: data.sourceUrl || '',
                createdAt: data.createdAt || admin.firestore.Timestamp.now(),
                updatedAt: admin.firestore.Timestamp.now()
            };

            batch.update(docRef, updatedData);
            console.log(`✅ Queued fix for: ${data.title}`);
            fixedCount++;
        });

        // Commit all updates
        await batch.commit();

        console.log('\n' + '='.repeat(60));
        console.log('📊 Fix Summary:');
        console.log(`   ✅ Fixed: ${fixedCount} stotras`);
        console.log('='.repeat(60));
        console.log('\n🎉 All Gayatri stotras have been fixed!');
        console.log('\n💡 Next steps:');
        console.log('   1. Reload your app (press "r" in Expo)');
        console.log('   2. The stotras should now display correctly');

    } catch (error) {
        console.error('❌ Error fixing stotras:', error);
        throw error;
    } finally {
        // Close Firebase connection
        await admin.app().delete();
    }
}

/**
 * Extract English title from Telugu title
 */
function extractEnglishTitle(title) {
    // Extract the part before the dash if it exists
    const parts = title.split('–');
    if (parts.length > 0) {
        return parts[0].trim();
    }
    return title;
}

// Run the function
fixGayatriStotras()
    .then(() => {
        console.log('\n✨ All done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Fatal error:', error);
        process.exit(1);
    });
