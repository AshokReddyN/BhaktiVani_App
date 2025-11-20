# Test Cases Documentation

## Overview

Comprehensive test suite for BhaktiVani app covering:
- Settings service (font size & theme)
- Screen components (Home, Settings, StotraDetail, Favorites)
- Database operations (seeding, models)
- Favorite toggle functionality
- Navigation flows

## Test Structure

```
__tests__/
├── App.test.tsx                    # App initialization tests
src/
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
npm test -- settings.test

# Run tests matching pattern
npm test -- --testPathPatterns="Settings"
```

## Test Commands

All commands are defined in `package.json`:
- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

## Coverage Goals

Target coverage areas:
- ✅ Settings Service: 100%
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

## Test Best Practices

1. **Isolation**: Each test is independent
2. **Mocking**: External dependencies are mocked
3. **Async Handling**: Proper use of `async/await` and `waitFor`
4. **Error Testing**: Tests include error scenarios
5. **Edge Cases**: Tests cover default values and error states

## Notes

- Tests use React Native Testing Library for component testing
- AsyncStorage is mocked for settings tests
- WatermelonDB is mocked for database tests
- Navigation is mocked for screen component tests

