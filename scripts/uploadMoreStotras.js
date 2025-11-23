const admin = require('firebase-admin');

// Reuse existing service account
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Additional Ganesha stotras from your seed file
const additionalStotras = [
    {
        stotra_id: 'ganesha_ashtottara_002',
        deity_id: 'ganesha',
        category: 'ashtottara',
        title_telugu: 'గణేశ అష్టోత్తర శతనామావళి',
        title_kannada: 'ಗಣೇಶ ಅಷ್ಟೋತ್ತರ ಶತನಾಮಾವಳಿ',
        text_telugu: `ఓం గణాధిపాయ నమః |
ఓం ఉమాపుత్రాయ నమః |
ఓం అగ్నిగర్భచిదే నమః |
ఓం గజాననాయ నమః |
ఓం ద్వైమాతురాయ నమః |
ఓం గుణాత్మనే నమః |
ఓం కామినే నమః |
ఓం క్రోధహంత్రే నమః |
ఓం గణాధ్యక్షాయ నమః |
ఓం ఫాలనేత్రాయ నమః |
ఓం గజకర్ణకాయ నమః |
ఓం గౌరీసుతాయ నమః |
ఓం షడ్భుజాయ నమః |
ఓం గణేశ్వరాయ నమః |
ఓం గజాననాయ నమః |
ఓం ఏకదంతాయ నమః |
ఓం ఇదంప్రియాయ నమః |
ఓం సిద్ధిదాయకాయ నమః |
ఓం సిద్ధార్చితాయ నమః |
ఓం బీజపూరాయ నమః ||

ఇతి శ్రీ గణేశ అష్టోత్తర శతనామావళిః సంపూర్ణమ్ ||`,
        text_kannada: `ಓಂ ಗಣಾಧಿಪಾಯ ನಮಃ |
ಓಂ ಉಮಾಪುತ್ರಾಯ ನಮಃ |
ಓಂ ಅಗ್ನಿಗರ್ಭಚಿದೇ ನಮಃ |
ಓಂ ಗಜಾನನಾಯ ನಮಃ |
ಓಂ ದ್ವೈಮಾತುರಾಯ ನಮಃ |
ಓಂ ಗುಣಾತ್ಮನೇ ನಮಃ |
ಓಂ ಕಾಮಿನೇ ನಮಃ |
ಓಂ ಕ್ರೋಧಹಂತ್ರೇ ನಮಃ |
ಓಂ ಗಣಾಧ್ಯಕ್ಷಾಯ ನಮಃ |
ಓಂ ಫಾಲನೇತ್ರಾಯ ನಮಃ |
ಓಂ ಗಜಕರ್ಣಕಾಯ ನಮಃ |
ಓಂ ಗೌರೀಸುತಾಯ ನಮಃ |
ಓಂ ಷಡ್ಭುಜಾಯ ನಮಃ |
ಓಂ ಗಣೇಶ್ವರಾಯ ನಮಃ |
ಓಂ ಗಜಾನನಾಯ ನಮಃ |
ಓಂ ಏಕದಂತಾಯ ನಮಃ |
ಓಂ ಇದಂಪ್ರಿಯಾಯ ನಮಃ |
ಓಂ ಸಿದ್ಧಿದಾಯಕಾಯ ನಮಃ |
ಓಂ ಸಿದ್ಧಾರ್ಚಿತಾಯ ನಮಃ |
ಓಂ ಬೀಜಪೂರಾಯ ನಮಃ ||

ಇತಿ ಶ್ರೀ ಗಣೇಶ ಅಷ್ಟೋತ್ತರ ಶತನಾಮಾವಳಿಃ ಸಂಪೂರ್ಣಮ್ ||`,
        version_timestamp: Date.now(),
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
    },
    // Add more stotras here - you can copy from your seed files
    // For now, adding placeholders for other deities
    {
        stotra_id: 'venkateswara_suprabhatam_001',
        deity_id: 'venkateswara',
        category: 'suprabhatam',
        title_telugu: 'వేంకటేశ్వర సుప్రభాతం',
        title_kannada: 'ವೆಂಕಟೇಶ್ವರ ಸುಪ್ರಭಾತಂ',
        text_telugu: '[Telugu text - to be added from seed file]',
        text_kannada: '[Kannada text - to be added]',
        version_timestamp: Date.now(),
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        stotra_id: 'shiva_ashtakam_001',
        deity_id: 'shiva',
        category: 'ashtakam',
        title_telugu: 'శివ అష్టకం',
        title_kannada: 'ಶಿವ ಅಷ್ಟಕಂ',
        text_telugu: '[Telugu text - to be added from seed file]',
        text_kannada: '[Kannada text - to be added]',
        version_timestamp: Date.now(),
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
    }
];

async function uploadAdditionalStotras() {
    try {
        console.log('🚀 Uploading additional stotras to Firebase...\n');

        let uploaded = 0;
        let skipped = 0;

        for (const stotra of additionalStotras) {
            // Check if stotra already exists
            const existingDoc = await db.collection('stotras').doc(stotra.stotra_id).get();

            if (existingDoc.exists) {
                console.log(`  ⏭️  Skipped (already exists): ${stotra.title_telugu}`);
                skipped++;
            } else {
                await db.collection('stotras').doc(stotra.stotra_id).set(stotra);
                console.log(`  ✓ Uploaded: ${stotra.title_telugu} (${stotra.stotra_id})`);
                uploaded++;
            }
        }

        console.log(`\n✅ Upload complete!`);
        console.log(`   - Uploaded: ${uploaded}`);
        console.log(`   - Skipped: ${skipped}`);
        console.log(`   - Total: ${uploaded + skipped}`);

    } catch (error) {
        console.error('❌ Error uploading stotras:', error);
        process.exit(1);
    }
}

// Run the upload
uploadAdditionalStotras()
    .then(() => {
        console.log('\n👋 Upload complete. Exiting...');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
