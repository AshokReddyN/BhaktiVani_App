# Firebase Upload Script

This script automatically uploads all deities, stotras, and configuration data to your Firebase Firestore database.

## Prerequisites

1. **Firebase Admin SDK** installed
2. **Service Account Key** downloaded from Firebase Console

## Setup Instructions

### Step 1: Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### Step 2: Download Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **bhaktivaniapp** project
3. Click the **gear icon** ⚙️ → **Project settings**
4. Go to **Service accounts** tab
5. Click **"Generate new private key"**
6. Click **"Generate key"** (downloads a JSON file)
7. Rename the file to `serviceAccountKey.json`
8. Move it to the `scripts` folder: `/Applications/Personal/BhaktiVani_App/scripts/serviceAccountKey.json`

### Step 3: Secure the Key File

**IMPORTANT**: Add to `.gitignore` to keep it private!

```bash
echo "scripts/serviceAccountKey.json" >> .gitignore
```

## Running the Script

```bash
cd /Applications/Personal/BhaktiVani_App
node scripts/uploadToFirebase.js
```

## What Gets Uploaded

### Deities (6 documents)
- Ganesha (గణేశుడు / ಗಣೇಶ)
- Venkateswara (వేంకటేశ్వరుడు / ವೆಂಕಟೇಶ್ವರ)
- Shiva (శివుడు / ಶಿವ)
- Vishnu (విష్ణువు / ವಿಷ್ಣು)
- Lakshmi (లక్ష్మి / ಲಕ್ಷ್ಮಿ)
- Hanuman (హనుమాన్ / ಹನುಮಾನ್)

### Stotras (1 sample)
- Ganesha Pancharatnam (full Telugu & Kannada text)

### Config (1 document)
- Global app configuration

## Expected Output

```
🚀 Starting Firebase data upload...

📿 Uploading deities...
  ✓ Uploaded: గణేశుడు (ganesha)
  ✓ Uploaded: వేంకటేశ్వరుడు (venkateswara)
  ...
✅ Uploaded 6 deities

📖 Uploading stotras...
  ✓ Uploaded: గణేశ పంచరత్నం (ganesha_pancharatnam_001)
✅ Uploaded 1 stotra(s)

⚙️  Setting global config...
  ✓ Global config set

🎉 All data uploaded successfully!
```

## Adding More Stotras

To add more stotras, edit `uploadToFirebase.js` and add to the `stotras` array:

```javascript
{
  stotra_id: 'deity_category_number',
  deity_id: 'deity_name',
  category: 'category_name',
  title_telugu: 'తెలుగు శీర్షిక',
  title_kannada: 'ಕನ್ನಡ ಶೀರ್ಷಿಕೆ',
  text_telugu: 'తెలుగు పాఠం...',
  text_kannada: 'ಕನ್ನಡ ಪಠ್ಯ...',
  version_timestamp: Date.now(),
  created_at: admin.firestore.FieldValue.serverTimestamp(),
  updated_at: admin.firestore.FieldValue.serverTimestamp()
}
```

## Troubleshooting

**Error: "Cannot find module 'firebase-admin'"**
- Run: `npm install firebase-admin`

**Error: "Cannot find module './serviceAccountKey.json'"**
- Make sure you downloaded the service account key
- Place it in the `scripts` folder
- Rename it to `serviceAccountKey.json`

**Error: "Permission denied"**
- Check your Firebase project permissions
- Ensure the service account has Firestore write access

## Next Steps

After successful upload:
1. ✅ Verify data in Firebase Console → Firestore Database
2. ✅ Update SyncService to fetch from Firestore
3. ✅ Test sync in your app
4. ✅ Add more stotras as needed
