# Firebase Migration to Language-Specific Collections

This script migrates your BhaktiVani Firebase data from multi-language collections to language-specific collections.

## What It Does

**Before Migration:**
- `deities` collection (contains Telugu + Kannada names)
- `stotras` collection (contains Telugu + Kannada content)

**After Migration:**
- `deities_telugu` collection (Telugu names only)
- `deities_kannada` collection (Kannada names only)
- `stotras_telugu` collection (Telugu content only)
- `stotras_kannada` collection (Kannada content only)

## Prerequisites

1. **Service Account Key**: You need `serviceAccountKey.json` in the `scripts/` folder
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccountKey.json` in the `scripts/` folder

2. **Node.js**: Ensure Node.js is installed

3. **Dependencies**: Install firebase-admin if not already installed:
   ```bash
   npm install firebase-admin
   ```

## How to Run

1. **Backup Your Data** (Important!)
   - Go to Firebase Console
   - Export your current data as backup
   - Or ensure you have a recent backup

2. **Run the Migration Script**:
   ```bash
   cd scripts
   node migrateToLanguageSpecificCollections.js
   ```

3. **Verify the Results**:
   - Check the console output for summary
   - Go to Firebase Console
   - Verify the new collections have the correct data
   - Check document counts match expectations

## What the Script Does

1. **Reads** all documents from `deities` collection
2. **Splits** each deity into:
   - Telugu version → `deities_telugu`
   - Kannada version → `deities_kannada`
3. **Reads** all documents from `stotras` collection
4. **Splits** each stotra into:
   - Telugu version → `stotras_telugu`
   - Kannada version → `stotras_kannada`
5. **Verifies** the migration by counting documents
6. **Reports** summary and any warnings

## Expected Output

```
🚀 Starting Firebase Data Migration to Language-Specific Collections

📿 Migrating Deities...
  ✓ Telugu: గణేశుడు (ganesha)
  ✓ Kannada: ಗಣೇಶ (ganesha)
  ...

✅ Deities Migration Complete:
   - Telugu: 9 deities
   - Kannada: 9 deities

📖 Migrating Stotras...
  ✓ Telugu: గణేశ పంచరత్నం (ganesha_pancharatnam_001)
  ✓ Kannada: ಗಣೇಶ ಪಂಚರತ್ನಂ (ganesha_pancharatnam_001)
  ...

✅ Stotras Migration Complete:
   - Telugu: X stotras
   - Kannada: X stotras

🔍 Verifying Migration...
📊 Collection Counts:
   - deities_telugu: 9
   - deities_kannada: 9
   - stotras_telugu: X
   - stotras_kannada: X

🎉 Migration Complete!
```

## After Migration

1. **Verify Data in Firebase Console**:
   - Check `deities_telugu` collection
   - Check `deities_kannada` collection
   - Check `stotras_telugu` collection
   - Check `stotras_kannada` collection
   - Verify document counts are correct
   - Spot-check a few documents for data integrity

2. **Update Your App Code**:
   - Update database schema
   - Update sync service to use new collections
   - Update models to use language-specific tables
   - Test the app thoroughly

3. **Optional - Cleanup Old Collections**:
   - After verifying everything works, you can delete:
     - `deities` collection (keep as backup for a while)
     - `stotras` collection (keep as backup for a while)

## Rollback

If something goes wrong:
1. The original `deities` and `stotras` collections are **NOT** modified
2. You can delete the new collections and try again
3. Fix any issues and re-run the script

## Troubleshooting

### Error: "Cannot find module './serviceAccountKey.json'"
- Make sure you've downloaded the service account key
- Place it in the `scripts/` folder
- The file should be named exactly `serviceAccountKey.json`

### Error: "Permission denied"
- Check that your service account has the necessary permissions
- It needs Firestore read/write access

### Warning: "Counts do not match between languages"
- This might indicate missing data in one language
- Check the original collection for incomplete records
- Review the console output to see which documents failed

### Migration Takes Too Long
- This is normal for large datasets
- The script processes each document individually
- You can monitor progress in the console output

## Data Structure

### Deity Document (Language-Specific)
```javascript
{
  deity_id: 'ganesha',
  name: 'గణేశుడు',  // Language-specific name
  name_english: 'Ganesha',
  image: 'ganesha',
  order: 1,
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### Stotra Document (Language-Specific)
```javascript
{
  stotra_id: 'ganesha_pancharatnam_001',
  deity_id: 'ganesha',
  category: 'pancharatnam',
  title: 'గణేశ పంచరత్నం',  // Language-specific title
  title_english: 'Ganesha Pancharatnam',
  content: '...',  // Language-specific content
  version_timestamp: 1234567890,
  created_at: Timestamp,
  updated_at: Timestamp
}
```

## Notes

- The script is **idempotent** - you can run it multiple times safely
- It will overwrite existing documents in the new collections
- Original collections remain untouched
- All timestamps are preserved from original data
