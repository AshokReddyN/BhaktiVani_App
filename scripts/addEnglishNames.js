const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// English transliterations for deity names
const deityEnglishNames = {
    'ganesha': 'Ganesha',
    'venkateswara': 'Venkateswara',
    'shiva': 'Shiva',
    'vishnu': 'Vishnu',
    'lakshmi': 'Lakshmi',
    'hanuman': 'Hanuman',
    'rama': 'Rama',
    'krishna': 'Krishna',
    'saraswati': 'Saraswati'
};

async function addEnglishNames() {
    try {
        console.log('🔤 Adding English names to Firestore deities...\n');

        for (const [deityId, englishName] of Object.entries(deityEnglishNames)) {
            console.log(`  Processing ${deityId}...`);
            console.log(`  English name: ${englishName}`);

            await db.collection('deities').doc(deityId).update({
                name_english: englishName
            });

            console.log(`  ✓ Updated Firestore document\n`);
        }

        console.log('✅ All deity documents updated with English names');
        console.log('📱 Please reload the app to sync the new data!');

    } catch (error) {
        console.error('❌ Error updating English names:', error);
        process.exit(1);
    }
}

addEnglishNames()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
