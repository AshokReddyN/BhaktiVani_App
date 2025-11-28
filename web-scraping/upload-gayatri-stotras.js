import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Initialize Firebase Admin
const serviceAccount = require('../scripts/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Upload Telugu Gayatri stotras to Firebase
 */
async function uploadTeluguGayatriStotras() {
    try {
        console.log('🚀 Starting upload of Telugu Gayatri stotras to Firebase...\n');

        const stotrasDir = path.join(__dirname, 'stotras');
        const files = fs.readdirSync(stotrasDir);

        // Filter for Telugu Gayatri stotra JSON files (not Firebase migration files)
        const teluguGayatriFiles = files.filter(f =>
            f.includes('gayatri') &&
            f.endsWith('.json') &&
            !f.includes('.firebase.json') &&
            !f.includes('vakratunda') // Exclude Ganesha stotras
        );

        console.log(`Found ${teluguGayatriFiles.length} Telugu Gayatri stotra files:\n`);
        teluguGayatriFiles.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
        console.log('');

        let uploadCount = 0;
        let skipCount = 0;

        for (const filename of teluguGayatriFiles) {
            const filePath = path.join(stotrasDir, filename);
            const stotraData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            // Generate document ID from title
            const docId = generateDocId(stotraData.title);

            // Check if document already exists
            const docRef = db.collection('stotras').doc(docId);
            const doc = await docRef.get();

            if (doc.exists) {
                console.log(`⏭️  Skipping (already exists): ${stotraData.title}`);
                skipCount++;
                continue;
            }

            // Prepare Firestore document
            const firestoreDoc = {
                title: stotraData.title,
                content: stotraData.content,
                language: 'telugu',
                deity: 'Gayatri',
                category: getCategoryFromTitle(stotraData.title),
                totalVerses: stotraData.metadata.totalVerses,
                sourceUrl: stotraData.metadata.url,
                createdAt: admin.firestore.Timestamp.now(),
                updatedAt: admin.firestore.Timestamp.now()
            };

            // Upload to Firestore
            await docRef.set(firestoreDoc);
            console.log(`✅ Uploaded: ${stotraData.title} (${stotraData.metadata.totalVerses} verses)`);
            uploadCount++;

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Upload Summary:');
        console.log(`   ✅ Uploaded: ${uploadCount} stotras`);
        console.log(`   ⏭️  Skipped (already exist): ${skipCount} stotras`);
        console.log(`   📁 Total processed: ${teluguGayatriFiles.length} files`);
        console.log('='.repeat(60));
        console.log('\n🎉 Upload completed successfully!');

    } catch (error) {
        console.error('❌ Error uploading stotras:', error);
        throw error;
    } finally {
        // Close Firebase connection
        await admin.app().delete();
    }
}

/**
 * Generate document ID from title
 */
function generateDocId(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\u0C00-\u0C7F]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);
}

/**
 * Determine category from title
 */
function getCategoryFromTitle(title) {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('sahasranama')) return 'Sahasranama';
    if (lowerTitle.includes('ashtottara')) return 'Ashtottara Shatanamavali';
    if (lowerTitle.includes('chalisa')) return 'Chalisa';
    if (lowerTitle.includes('kavacham') || lowerTitle.includes('kavach')) return 'Kavacham';
    if (lowerTitle.includes('tarpanam') || lowerTitle.includes('తర్పణం')) return 'Tarpanam';
    if (lowerTitle.includes('lahari') || lowerTitle.includes('లహరీ')) return 'Lahari';
    if (lowerTitle.includes('ashtakam') || lowerTitle.includes('అష్టకం')) return 'Ashtakam';
    if (lowerTitle.includes('hrudayam') || lowerTitle.includes('హృదయం')) return 'Hrudayam';
    if (lowerTitle.includes('panjara') || lowerTitle.includes('పంజర')) return 'Panjara Stotram';
    if (lowerTitle.includes('stavaraja') || lowerTitle.includes('స్తవరాజ')) return 'Stavaraja';
    if (lowerTitle.includes('bhujanga')) return 'Bhujanga Stotram';
    if (lowerTitle.includes('aksharavalli')) return 'Aksharavalli';
    if (lowerTitle.includes('shapa') || lowerTitle.includes('శాప')) return 'Shapa Vimochanam';
    if (lowerTitle.includes('tattva') || lowerTitle.includes('తత్త్వ')) return 'Tattva Mala';

    return 'Stotram';
}

// Run the upload
uploadTeluguGayatriStotras()
    .then(() => {
        console.log('\n✨ All done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Fatal error:', error);
        process.exit(1);
    });
