# Guide: Adding New Deities and Stotras to BhaktiVani App

This guide will help you add new deities and their stotras to your BhaktiVani application.

## Overview

The app uses WatermelonDB with LokiJS adapter for offline storage. All data is seeded when the app first launches.

## Step-by-Step Guide

### 1. Add Deity Image (Optional but Recommended)

**Location:** `/Applications/Personal/BhaktiVani_App/src/assets/`

1. Save your deity image as a PNG file
2. Name it descriptively (e.g., `rama.png`, `krishna.png`)
3. Copy it to the `src/assets/` folder

```bash
cp /path/to/your/image.png /Applications/Personal/BhaktiVani_App/src/assets/deity_name.png
```

---

### 2. Update Seed Data

**File:** `/Applications/Personal/BhaktiVani_App/src/database/seed.ts`

Add your deity and stotras in the `seedDatabase()` function:

```typescript
// Example: Adding Rama
const rama = await database.get<Deity>('deities').create(deity => {
    deity.name = 'రామ'  // Deity name in Telugu
    deity.image = 'rama'  // Image filename without extension
})

// Add first stotra for Rama
await database.get<Stotra>('stotras').create(stotra => {
    stotra.title = 'రామ స్తోత్రం'  // Stotra title in Telugu
    stotra.content = `రామ రామేతి రామేతి రమే రామే మనోరమే |
సహస్రనామ తత్తుల్యం రామనామ వరాననే ||

// Add more verses here...`
    stotra.deity.set(rama)  // Link to deity
    stotra.isFavorite = false
})

// Add second stotra for Rama
await database.get<Stotra>('stotras').create(stotra => {
    stotra.title = 'రామ రక్ష స్తోత్రం'
    stotra.content = `శ్రీ రామ రామ రామేతి రమే రామే మనోరమే |
సహస్ర నామ తత్తుల్యం రామ నామ వరాననే ||

// Add more verses here...`
    stotra.deity.set(rama)
    stotra.isFavorite = false
})
```

**Important Notes:**
- Place your code BEFORE the final `console.log('Database seeded successfully')` line
- Each deity can have multiple stotras
- Use Telugu script for names and content
- The `deity.image` should match your image filename (without .png extension)

---

### 3. Update HomeScreen to Display Image

**File:** `/Applications/Personal/BhaktiVani_App/src/screens/HomeScreen.tsx`

Add a new case in the switch statement (around line 23):

```typescript
switch (item.name) {
    case 'వెంకటేశ్వర స్వామి':
        imageSource = require('../assets/venkateswara.png');
        break;
    case 'గణేశుడు':
        imageSource = require('../assets/ganesha.png');
        break;
    // ... existing cases ...
    
    // ADD YOUR NEW DEITY HERE
    case 'రామ':  // Must match exactly with deity.name in seed.ts
        imageSource = require('../assets/rama.png');
        break;
        
    default:
        imageSource = null;
}
```

---

### 4. Clear Database and Restart

Since the database is only seeded once, you need to clear it to see new data:

**Option A: Clear app data on device**
- Go to Settings > Apps > Expo Go > Storage > Clear Data

**Option B: Modify seed check (for development)**

In `seed.ts`, temporarily comment out the check:

```typescript
export async function seedDatabase() {
    const deitiesCount = await database.get<Deity>('deities').query().fetchCount()

    // Comment this out temporarily to re-seed
    // if (deitiesCount > 0) {
    //     console.log('Database already seeded')
    //     return
    // }

    await database.write(async () => {
        // ... your seed data
    })
}
```

Then restart the app with:
```bash
yarn start --clear
```

**Remember to uncomment the check after testing!**

---

## Complete Example: Adding Krishna

### 1. Add Image
```bash
cp krishna.png /Applications/Personal/BhaktiVani_App/src/assets/krishna.png
```

### 2. Update seed.ts
```typescript
// Add after existing deities, before console.log
const krishna = await database.get<Deity>('deities').create(deity => {
    deity.name = 'కృష్ణ'
    deity.image = 'krishna'
})

await database.get<Stotra>('stotras').create(stotra => {
    stotra.title = 'కృష్ణ అష్టకం'
    stotra.content = `వసుదేవ సుతం దేవం కంస చాణూర మర్దనం |
దేవకీ పరమానందం కృష్ణం వందే జగద్గురుమ్ ||

అతసీ పుష్ప సంకాశం హార నూపుర శోభితమ్ |
రత్న కంకణ కేయూరం కృష్ణం వందే జగద్గురుమ్ ||`
    stotra.deity.set(krishna)
    stotra.isFavorite = false
})
```

### 3. Update HomeScreen.tsx
```typescript
case 'కృష్ణ':
    imageSource = require('../assets/krishna.png');
    break;
```

### 4. Clear data and restart app

---

## Tips

1. **Telugu Text:** Make sure to use proper Telugu Unicode characters
2. **Image Format:** Use PNG images with transparent or solid backgrounds
3. **Image Size:** Recommended 512x512px or higher for best quality
4. **Testing:** Always test on device after adding new content
5. **Backup:** Keep a backup of your seed.ts file before making changes

## Troubleshooting

**Images not showing?**
- Verify the case in switch statement matches deity.name exactly
- Check that image filename matches (case-sensitive)
- Ensure image is in `src/assets/` folder

**Data not appearing?**
- Clear app data or comment out the seed check
- Check console logs for "Database seeded successfully"
- Verify deity and stotra are properly linked with `stotra.deity.set()`

**App crashes?**
- Check for syntax errors in seed.ts
- Ensure all Telugu text is properly formatted
- Verify all require() statements point to existing files
