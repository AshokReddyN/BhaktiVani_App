// Polyfill for structuredClone
global.structuredClone = global.structuredClone || ((val) => JSON.parse(JSON.stringify(val)))

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

// Mock WatermelonDB - must be before any imports
jest.mock('@nozbe/watermelondb', () => {
  const mockDatabase = {
    get: jest.fn(() => ({
      query: jest.fn(() => ({
        fetch: jest.fn(() => Promise.resolve([])),
        fetchCount: jest.fn(() => Promise.resolve(0)),
      })),
      find: jest.fn(() => Promise.resolve(null)),
      create: jest.fn(() => Promise.resolve({})),
    })),
    write: jest.fn((callback) => Promise.resolve(callback())),
  }
  return {
    Database: jest.fn(() => mockDatabase),
    Q: {
      where: jest.fn(() => ({})),
      like: jest.fn(() => ({})),
    },
    Model: class MockModel { },
    field: () => (target: any, key: string) => { },
    relation: () => (target: any, key: string) => { },
    children: () => (target: any, key: string) => { },
    appSchema: jest.fn(() => ({ version: 1, tables: [] })),
    tableSchema: jest.fn(() => ({ name: 'test', columns: [] })),
  }
})

// Mock database adapter
jest.mock('@nozbe/watermelondb/adapters/lokijs', () => {
  return jest.fn(() => ({}))
})

// Mock React Native modules
jest.mock('react-native/Libraries/Image/Image', () => 'Image')

// Mock Expo modules
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}))

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
}))

// Suppress console during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
}

// Mock Expo winter runtime
jest.mock('expo/src/winter/runtime.native.ts', () => ({
  require: jest.fn(),
}))

jest.mock('expo/src/winter/installGlobal.ts', () => ({
  getValue: jest.fn(),
}))

// Mock Expo vector icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
}))

// Mock global __ExpoImportMetaRegistry
global.__ExpoImportMetaRegistry = {}

// Global database mock factory for tests
global.createDatabaseMock = (mockData = []) => {
  const mockFetch = jest.fn(() => Promise.resolve(mockData))
  const mockQuery = jest.fn(() => ({ fetch: mockFetch }))
  const mockGet = jest.fn(() => ({ query: mockQuery }))
  const mockWrite = jest.fn((callback) => Promise.resolve(callback()))

  return {
    database: {
      get: mockGet,
      write: mockWrite,
    },
    mockFetch,
    mockQuery,
    mockGet,
    mockWrite,
  }
}

