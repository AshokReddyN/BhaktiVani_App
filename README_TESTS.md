# Test Cases Documentation

## Overview

Comprehensive test suite for BhaktiVani app covering:
- Settings service (font size & theme)
- Language service (language preferences, sync timestamps)
- **Firebase Sync service (language-specific downloads, incremental sync)**
- Screen components (Home, Settings, StotraDetail, Favorites)
- Database operations (seeding, models)
- Favorite toggle functionality
- Navigation flows

## Test Structure

```
__tests__/
├── App.test.tsx                    # App initialization tests
src/
├── services/
│   └── __tests__/
│       └── syncService.test.ts     # Firebase sync tests (NEW)
├── utils/
│   └── __tests__/
│       ├── settings.test.ts        # Settings service tests
│       └── favorite.test.ts        # Favorite toggle tests
├── screens/
│   └── __tests__/
│       ├── SettingsScreen.test.tsx # Settings UI tests
│       ├── StotraDetailScreen.test.tsx # Detail screen tests
│       ├── HomeScreen.test.tsx     # Home screen tests
│       └── FavoritesScreen.test.tsx # Favorites tests
└── database/
    └── __tests__/
        └── seed.test.ts            # Database seeding tests
```

## Test Cases Implemented

### Firebase Sync Service (`src/services/__tests__/syncService.test.ts`) **NEW**

**Initial Download Tests:**
- ✅ Downloads only Telugu content when Telugu is selected
- ✅ Downloads only Kannada content when Kannada is selected
- ✅ Calls progress callback at correct intervals (10%, 30%, 50%, 60%, 80%, 100%)
- ✅ Clears existing data before downloading
- ✅ Creates deities with both language names
- ✅ Creates stotras with selected language only (saves ~50% space)
- ✅ Updates last sync timestamp after successful download
- ✅ Handles download errors gracefully

**Incremental Sync Tests:**
- ✅ Fetches only stotras updated since last sync
- ✅ Uses version_timestamp to filter updates
- ✅ Returns count of updated items
- ✅ Returns count of errors
- ✅ Updates last sync timestamp after successful sync
- ✅ Handles sync errors and continues processing

**Upsert Stotra Tests:**
- ✅ Updates existing stotra with selected language only
- ✅ Creates new stotra with selected language only
- ✅ Links stotra to correct deity
- ✅ Preserves other language fields when updating
- ✅ Handles missing deity gracefully

**Utility Tests:**
- ✅ isOnline() returns true when connected
- ✅ isOnline() returns false when offline
- ✅ getMasterTimestamp() fetches from Firebase config
- ✅ getMasterTimestamp() returns current time if config missing
- ✅ getMasterTimestamp() handles Firebase errors

### Settings Service (`src/utils/__tests__/settings.test.ts`)

**Font Size Tests:**
- ✅ Returns default ('medium') when no value set
- ✅ Saves and retrieves font size
- ✅ Updates font size correctly
- ✅ Converts font size to numeric value (small=14, medium=18, large=22)
- ✅ Handles errors gracefully

**Theme Tests:**
- ✅ Returns default ('light') when no value set
- ✅ Saves and retrieves theme
- ✅ Updates theme correctly
- ✅ Returns correct theme colors for all themes
- ✅ Handles errors gracefully

### Settings Screen (`src/screens/__tests__/SettingsScreen.test.tsx`)

**UI Tests:**
- ✅ Renders settings screen
- ✅ Loads settings on mount
- ✅ Handles font size button clicks (చిన్న, మధ్యస్థం, పెద్ద)
- ✅ Handles theme button clicks (Light, Sepia, Dark)
- ✅ Displays all font size options
- ✅ Displays all theme options
- ✅ Updates button state when selected

### StotraDetailScreen (`src/screens/__tests__/StotraDetailScreen.test.tsx`)

**Functionality Tests:**
- ✅ Shows loading state initially
- ✅ Loads stotra data
- ✅ Increases font size (+ button)
- ✅ Decreases font size (- button)
- ✅ Loads settings when screen focuses
- ✅ Displays stotra content
- ✅ Updates header with favorite button

### HomeScreen (`src/screens/__tests__/HomeScreen.test.tsx`)

**Data & Navigation Tests:**
- ✅ Renders home screen
- ✅ Fetches deities on mount
- ✅ Handles navigation to stotra list

### FavoritesScreen (`src/screens/__tests__/FavoritesScreen.test.tsx`)

**Favorites Management Tests:**
- ✅ Renders favorites screen
- ✅ Fetches favorites on focus
- ✅ Displays empty state when no favorites
- ✅ Handles navigation to stotra detail
- ✅ Removes favorite when delete button pressed

### Database Seed (`src/database/__tests__/seed.test.ts`)

**Seeding Tests:**
- ✅ Seeds database when empty
- ✅ Skips seeding when data exists
- ✅ Handles seeding errors gracefully

### Favorite Toggle (`src/utils/__tests__/favorite.test.ts`)

**Toggle Functionality Tests:**
- ✅ Toggles favorite from false to true
- ✅ Persists favorite state in database
- ✅ Handles multiple toggle operations
- ✅ Handles database write errors gracefully

### App Component (`__tests__/App.test.tsx`)

**App Initialization Tests:**
- ✅ Renders app and seeds database
- ✅ Shows loading state initially
- ✅ Handles database seeding errors

## Running Tests

```bash
# Run all tests
npm test

# Run in watch mode (for development)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- syncService.test

# Run tests matching pattern
npm test -- --testPathPatterns="Sync"
```

## Test Commands

All commands are defined in `package.json`:
- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

## Coverage Goals

Target coverage areas:
- ✅ Settings Service: 100%
- ✅ **Sync Service: 90%+ (NEW)**
- ✅ Screen Components: 80%+
- ✅ Database Operations: 90%+
- ✅ Utility Functions: 100%

## Mocking Strategy

**Mocked Dependencies:**
- `@react-native-async-storage/async-storage` - For settings persistence
- `@nozbe/watermelondb` - For database operations
- `@react-navigation/native` - For navigation
- `expo-status-bar` - For status bar
- `react-native-safe-area-context` - For safe area handling
- **`firebase/firestore` - For Firebase Firestore operations (NEW)**
- **`../../config/firebase` - For Firebase configuration (NEW)**

## Test Best Practices

1. **Isolation**: Each test is independent
2. **Mocking**: External dependencies are mocked
3. **Async Handling**: Proper use of `async/await` and `waitFor`
4. **Error Testing**: Tests include error scenarios
5. **Edge Cases**: Tests cover default values and error states
6. **Language-Specific**: Tests verify language-specific download behavior

## Key Test Scenarios for Production

### Language-Specific Download
- Verifies only selected language is downloaded (50% data savings)
- Ensures other language fields are left empty
- Confirms proper handling of both Telugu and Kannada

### Incremental Sync
- Tests timestamp-based filtering
- Verifies only updated content is fetched
- Ensures efficient bandwidth usage

### Error Handling
- Network failures during download
- Database write errors
- Missing Firebase configuration
- Offline scenarios

## Notes

- Tests use React Native Testing Library for component testing
- AsyncStorage is mocked for settings tests
- WatermelonDB is mocked for database tests
- Navigation is mocked for screen component tests
- **Firebase Firestore is mocked for sync tests**
- **Language-specific download reduces test data by ~50%**
