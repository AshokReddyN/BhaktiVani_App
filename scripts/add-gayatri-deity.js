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
 * Add Gayatri Devi to Firebase
 */
async function addGayatriDevi() {
    try {
        console.log('🚀 Adding Gayatri Devi to Firebase...\n');

        // Check if Gayatri already exists
        const gayatriRef = db.collection('deities').doc('gayatri');
        const doc = await gayatriRef.get();

        if (doc.exists) {
            console.log('⏭️  Gayatri Devi already exists in Firebase');
            console.log('   Updating to ensure correct data...\n');
        }

        // Gayatri Devi data
        const gayatriData = {
            name: 'Gayatri',
            teluguName: 'గాయత్రీ',
            kannadaName: 'ಗಾಯತ್ರೀ',
            description: 'Goddess Gayatri is the personification of the Gayatri Mantra, a sacred Vedic hymn. She is considered the mother of the Vedas and represents divine knowledge and spiritual enlightenment.',
            imageUrl: 'https://example.com/gayatri.jpg', // You can update this with actual image URL
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now()
        };

        // Upload to Firestore
        await gayatriRef.set(gayatriData);

        console.log('✅ Successfully added/updated Gayatri Devi!');
        console.log('\nDeity Details:');
        console.log(`   Name: ${gayatriData.name}`);
        console.log(`   Telugu: ${gayatriData.teluguName}`);
        console.log(`   Kannada: ${gayatriData.kannadaName}`);
        console.log(`   Document ID: gayatri`);

        // Count stotras for Gayatri
        const stotrasSnapshot = await db.collection('stotras')
            .where('deity', '==', 'Gayatri')
            .get();

        console.log(`\n📊 Total Gayatri stotras in Firebase: ${stotrasSnapshot.size}`);

        console.log('\n🎉 Gayatri Devi is now available on the home screen!');

    } catch (error) {
        console.error('❌ Error adding Gayatri Devi:', error);
        throw error;
    } finally {
        // Close Firebase connection
        await admin.app().delete();
    }
}

// Run the function
addGayatriDevi()
    .then(() => {
        console.log('\n✨ All done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Fatal error:', error);
        process.exit(1);
    });
