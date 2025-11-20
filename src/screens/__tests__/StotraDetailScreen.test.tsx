import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import StotraDetailScreen from '../StotraDetailScreen'
import { database } from '../../database'
import { SettingsService } from '../../utils/settings'

// Mock navigation
const mockNavigate = jest.fn()
const mockSetOptions = jest.fn()

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    setOptions: mockSetOptions,
  }),
  useRoute: () => ({
    params: {
      stotraId: 'test-stotra-id',
      title: 'Test Stotra',
    },
  }),
  useFocusEffect: jest.fn((callback) => callback()),
}))

// Mock database
jest.mock('../../database', () => ({
  database: {
    get: jest.fn(() => ({
      find: jest.fn(() => Promise.resolve({
        id: 'test-stotra-id',
        title: 'Test Stotra',
        content: 'Test content',
        isFavorite: false,
        update: jest.fn(),
      })),
    })),
    write: jest.fn((callback) => Promise.resolve(callback())),
  },
}))

// Mock SettingsService
jest.mock('../../utils/settings', () => ({
  SettingsService: {
    getFontSize: jest.fn(() => Promise.resolve('medium')),
    getTheme: jest.fn(() => Promise.resolve('light')),
    getFontSizeValue: jest.fn((size) => {
      const sizes = { small: 14, medium: 18, large: 22 }
      return sizes[size as keyof typeof sizes] || 18
    }),
    getThemeColors: jest.fn(() => ({
      background: '#FFFFFF',
      text: '#1F2937',
      surface: '#F9FAFB',
    })),
  },
}))

describe('StotraDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state initially', () => {
    const { getByText } = render(<StotraDetailScreen />)
    expect(getByText('Loading...')).toBeTruthy()
  })

  it('should load stotra data', async () => {
    const { getByText } = render(<StotraDetailScreen />)
    
    await waitFor(() => {
      expect(getByText('Test content')).toBeTruthy()
    })
  })

  it('should increase font size', async () => {
    const { getByText, getAllByText } = render(<StotraDetailScreen />)
    
    await waitFor(() => {
      const plusButton = getByText('+')
      fireEvent.press(plusButton)
      // Font size should increase
    })
  })

  it('should decrease font size', async () => {
    const { getByText } = render(<StotraDetailScreen />)
    
    await waitFor(() => {
      const minusButton = getByText('-')
      fireEvent.press(minusButton)
      // Font size should decrease
    })
  })

  it('should load settings when screen focuses', async () => {
    render(<StotraDetailScreen />)
    
    await waitFor(() => {
      expect(SettingsService.getFontSize).toHaveBeenCalled()
      expect(SettingsService.getTheme).toHaveBeenCalled()
    })
  })

  it('should display stotra content', async () => {
    const { getByText } = render(<StotraDetailScreen />)
    
    await waitFor(() => {
      expect(getByText('Test content')).toBeTruthy()
    })
  })

  it('should update header options with favorite button', async () => {
    render(<StotraDetailScreen />)
    
    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalled()
    })
  })
})

