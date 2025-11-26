import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'

// Define mocks BEFORE any imports that use them
const mockNavigate = jest.fn()
const mockAddListener = jest.fn((event, callback) => {
  if (event === 'focus') {
    setTimeout(() => callback(), 0)
  }
  return jest.fn()
})

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    addListener: mockAddListener,
    setOptions: jest.fn(),
  }),
  useFocusEffect: jest.fn((callback) => {
    callback()
  }),
}))

// Mock LanguageService
jest.mock('../../services/languageService', () => ({
  LanguageService: {
    getCurrentLanguage: jest.fn().mockResolvedValue('telugu'),
  },
}))

// Mock translations
jest.mock('../../utils/translations', () => ({
  getTranslations: jest.fn(() => ({
    favorites: 'Favorites',
  })),
}))

// Mock WatermelonDB Q
jest.mock('@nozbe/watermelondb', () => ({
  Q: {
    where: jest.fn(() => ({})),
  },
}))

// Mock favorites data
const mockFavorites = [
  {
    id: '1',
    title: 'Test Stotra 1',
    titleTelugu: 'Test Stotra 1',
    titleKannada: 'Test Stotra 1 KN',
    content: 'Test content 1',
    isFavorite: true,
    update: jest.fn((callback) => {
      callback({ isFavorite: false })
      return Promise.resolve()
    }),
  },
  {
    id: '2',
    title: 'Test Stotra 2',
    titleTelugu: 'Test Stotra 2',
    titleKannada: 'Test Stotra 2 KN',
    content: 'Test content 2',
    isFavorite: true,
    update: jest.fn((callback) => {
      callback({ isFavorite: false })
      return Promise.resolve()
    }),
  },
]

// Create mock database functions
const mockFetch = jest.fn()
const mockQuery = jest.fn()
const mockGet = jest.fn()
const mockWrite = jest.fn()

// Mock the database module
jest.mock('../../database', () => {
  return {
    database: {
      get: (...args) => mockGet(...args),
      write: (...args) => mockWrite(...args),
    },
  }
})

// NOW import the component
import FavoritesScreen from '../FavoritesScreen'

describe('FavoritesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set up mock chain
    mockFetch.mockResolvedValue(mockFavorites)
    mockQuery.mockReturnValue({ fetch: mockFetch })
    mockGet.mockReturnValue({ query: mockQuery })
    mockWrite.mockImplementation((callback) => Promise.resolve(callback()))
  })

  it('should render favorites screen', async () => {
    const { getByText } = render(<FavoritesScreen />)

    await waitFor(() => {
      expect(getByText('Test Stotra 1')).toBeTruthy()
    }, { timeout: 3000 })
  })

  it('should display empty state when no favorites', async () => {
    mockFetch.mockResolvedValue([])

    const { getByText } = render(<FavoritesScreen />)

    await waitFor(() => {
      expect(getByText('No favorites yet')).toBeTruthy()
    }, { timeout: 3000 })
  })

  it('should handle navigation to stotra detail', async () => {
    const { getByText } = render(<FavoritesScreen />)

    await waitFor(() => {
      expect(getByText('Test Stotra 1')).toBeTruthy()
    }, { timeout: 3000 })

    const stotraText = getByText('Test Stotra 1')
    const stotraCard = stotraText.parent

    if (stotraCard) {
      fireEvent.press(stotraCard)
      expect(mockNavigate).toHaveBeenCalledWith('StotraDetail', {
        stotraId: '1',
        title: 'Test Stotra 1',
      })
    }
  })

  it('should remove favorite when delete button is pressed', async () => {
    const { getAllByText, getByText } = render(<FavoritesScreen />)

    await waitFor(() => {
      expect(getByText('Test Stotra 1')).toBeTruthy()
    }, { timeout: 3000 })

    const deleteButtons = getAllByText('🗑️')
    expect(deleteButtons.length).toBeGreaterThan(0)

    fireEvent.press(deleteButtons[0])

    await waitFor(() => {
      expect(mockWrite).toHaveBeenCalled()
    })
  })

  it('should call update on favorite item when removing', async () => {
    const { getAllByText, getByText } = render(<FavoritesScreen />)

    await waitFor(() => {
      expect(getByText('Test Stotra 1')).toBeTruthy()
    }, { timeout: 3000 })

    const deleteButtons = getAllByText('🗑️')
    fireEvent.press(deleteButtons[0])

    await waitFor(() => {
      expect(mockFavorites[0].update).toHaveBeenCalled()
    })
  })
})
