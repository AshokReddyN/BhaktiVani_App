import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import SettingsScreen from '../SettingsScreen'
import { SettingsService } from '../../utils/settings'

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
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
    setCurrentLanguage: jest.fn().mockResolvedValue(undefined),
    getLastSyncTimestamp: jest.fn().mockResolvedValue(Date.now()),
  },
}))

// Mock SyncService
jest.mock('../../services/syncService', () => ({
  SyncService: {
    syncNewContent: jest.fn().mockResolvedValue({ updated: 0, errors: 0 }),
    isOnline: jest.fn().mockResolvedValue(true),
  },
}))

// Mock SettingsService
jest.mock('../../utils/settings', () => ({
  SettingsService: {
    getFontSize: jest.fn(() => Promise.resolve('medium')),
    setFontSize: jest.fn(() => Promise.resolve()),
    getTheme: jest.fn(() => Promise.resolve('light')),
    setTheme: jest.fn(() => Promise.resolve()),
    getThemeColors: jest.fn(() => ({
      background: '#FFFFFF',
      text: '#1F2937',
      surface: '#F9FAFB',
    })),
    getFontSizeValue: jest.fn((size) => {
      const sizes = { small: 14, medium: 18, large: 22 };
      return sizes[size as keyof typeof sizes] || 18;
    }),
  },
}))

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render settings screen', async () => {
    const { getByText } = render(<SettingsScreen />)

    await waitFor(() => {
      expect(getByText('అక్షర పరిమాణం (Font Size)')).toBeTruthy()
      expect(getByText('నేపథ్యం (Theme)')).toBeTruthy()
    })
  })

  it('should load settings on mount', async () => {
    render(<SettingsScreen />)

    await waitFor(() => {
      expect(SettingsService.getFontSize).toHaveBeenCalled()
      expect(SettingsService.getTheme).toHaveBeenCalled()
    })
  })

  it('should handle font size change', async () => {
    const { getByText } = render(<SettingsScreen />)

    await waitFor(() => {
      const smallButton = getByText('చిన్న')
      fireEvent.press(smallButton)

      expect(SettingsService.setFontSize).toHaveBeenCalledWith('small')
    })
  })

  it('should handle theme change to dark', async () => {
    const { getByText } = render(<SettingsScreen />)

    await waitFor(() => {
      const darkButton = getByText('Dark')
      fireEvent.press(darkButton)

      expect(SettingsService.setTheme).toHaveBeenCalledWith('dark')
    })
  })

  it('should handle theme change to sepia', async () => {
    const { getByText } = render(<SettingsScreen />)

    await waitFor(() => {
      const sepiaButton = getByText('Sepia')
      fireEvent.press(sepiaButton)

      expect(SettingsService.setTheme).toHaveBeenCalledWith('sepia')
    })
  })

  it('should display all font size options', async () => {
    const { getByText } = render(<SettingsScreen />)

    await waitFor(() => {
      expect(getByText('చిన్న')).toBeTruthy()
      expect(getByText('మధ్యస్థం')).toBeTruthy()
      expect(getByText('పెద్ద')).toBeTruthy()
    })
  })

  it('should display all theme options', async () => {
    const { getByText } = render(<SettingsScreen />)

    await waitFor(() => {
      expect(getByText('Light')).toBeTruthy()
      expect(getByText('Sepia')).toBeTruthy()
      expect(getByText('Dark')).toBeTruthy()
    })
  })

  it('should update font size button state when selected', async () => {
    const { getByText } = render(<SettingsScreen />)

    await waitFor(() => {
      const largeButton = getByText('పెద్ద')
      fireEvent.press(largeButton)

      expect(SettingsService.setFontSize).toHaveBeenCalledWith('large')
    })
  })
})

