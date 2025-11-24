# BhaktiVani App 🙏

A beautiful offline-first Telugu devotional app built with React Native (Expo) for reading and managing Hindu stotras.

## Features

- 📱 **Offline-First**: All data stored locally using WatermelonDB
- 🎨 **Beautiful UI**: Clean, modern interface with deity images
- 🔍 **Search**: Find stotras quickly with search functionality
- ⭐ **Favorites**: Mark and access your favorite stotras
- 🔤 **Adjustable Font**: Change text size for comfortable reading
- 🌙 **Theme Support**: Light, Sepia, and Dark themes (Settings screen)

## Tech Stack

- **Framework**: React Native (Expo SDK 54)
- **Language**: TypeScript
- **Database**: WatermelonDB with SQLite adapter (production-ready persistence)
- **Backend**: Firebase (Firestore for data, Storage for assets)
- **Cache**: AsyncStorage for offline-first caching
- **Navigation**: React Navigation (Native Stack)
- **Styling**: React Native StyleSheet

## Project Structure

```
BhaktiVani_App/
├── src/
│   ├── assets/          # Deity images
│   ├── components/      # Reusable components
│   ├── database/        # WatermelonDB setup and models
│   │   ├── models/      # Deity and Stotra models
│   │   ├── schema.ts    # Database schema
│   │   ├── seed.ts      # Initial data seeding
│   │   └── index.ts     # Database initialization
│   ├── navigation/      # React Navigation setup
│   ├── screens/         # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── StotraListScreen.tsx
│   │   ├── StotraDetailScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── FavoritesScreen.tsx
│   └── types/           # TypeScript type definitions
├── docs/                # Documentation
│   └── ADDING_DEITIES_AND_STOTRAS.md
├── App.tsx              # Main app entry point
└── package.json

```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Yarn or npm
- Expo Go app on your mobile device

### Installation

1. Clone the repository
```bash
cd BhaktiVani_App
```

2. Install dependencies
```bash
yarn install
# or
npm install
```

3. Start the development server
```bash
yarn start
# or
npm start
```

4. Scan the QR code with Expo Go app on your device

## Adding New Content

See [docs/ADDING_DEITIES_AND_STOTRAS.md](docs/ADDING_DEITIES_AND_STOTRAS.md) for a detailed guide on adding new deities and stotras to the app.

## Current Deities

The app currently includes stotras for:
1. వెంకటేశ్వర స్వామి (Venkateswara Swamy)
2. గణేశుడు (Ganesha)
3. హనుమంతుడు (Hanuman)
4. శివుడు (Shiva)
5. లక్ష్మీదేవి (Lakshmi Devi)
6. సరస్వతీ దేవి (Saraswati Devi)

## Screens

- **Home**: Grid of deity tiles with images
- **Stotra List**: List of stotras for selected deity with search
- **Stotra Detail**: Full stotra text with font size controls and favorite toggle
- **Settings**: Theme and font size preferences
- **Favorites**: Quick access to favorited stotras

## Development Notes

### Offline-First Architecture
- The app uses SQLite adapter for WatermelonDB to ensure data persists across app restarts and device reboots
- Firebase is the single source of truth for content updates
- On first launch, users select a language (Telugu or Kannada) and download all content
- On subsequent launches, the app loads directly from local database (no Firebase calls)
- Language can be changed in Settings, which triggers a fresh download of the new language content
- Manual sync checks for updates and downloads only new/changed content

### Data Flow
1. **First Launch**: Language selection → Download from Firebase → Save to SQLite → Cache in AsyncStorage
2. **Subsequent Launches**: Load from SQLite (instant, offline-capable)
3. **Language Change**: Clear cache → Download new language → Update SQLite → Update cache
4. **Manual Sync**: Check for updates → Download only new items → Update SQLite → Update cache

### Database Persistence
- Uses SQLite adapter (not LokiJS) for production-ready persistence
- Data persists across app restarts and device reboots
- Favorites and settings are preserved
- Database is automatically backed up by AsyncStorage cache

## Troubleshooting

### App not loading?
- Clear Metro bundler cache: `yarn start --clear`
- Clear Expo Go app data on your device

### Images not showing?
- Verify images are in `src/assets/` folder
- Check that image names in `HomeScreen.tsx` match exactly

### Database not updating?
- Clear app data in Expo Go
- Or temporarily disable the seed check in `src/database/seed.ts`

## License

Private project

## Author

Built with ❤️ for devotional purposes
