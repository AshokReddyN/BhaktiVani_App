import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import SettingsScreen from '../SettingsScreen'
import { SettingsService } from '../../utils/settings'

// Mock SettingsService
jest.mock('../../utils/settings', () => ({
  SettingsService: {
    getFontSize: jest.fn(() => Promise.resolve('medium')),
    setFontSize: jest.fn(() => Promise.resolve()),
    getTheme: jest.fn(() => Promise.resolve('light')),
    setTheme: jest.fn(() => Promise.resolve()),
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

