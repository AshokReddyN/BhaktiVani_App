import AsyncStorage from '@react-native-async-storage/async-storage'
import { SettingsService, FontSize, Theme } from '../settings'

// Clear AsyncStorage before each test
beforeEach(async () => {
  try {
    await AsyncStorage.clear()
  } catch (error) {
    // Ignore errors
  }
})

describe('SettingsService', () => {
  describe('Font Size', () => {
    it('should return default font size when no value is set', async () => {
      const fontSize = await SettingsService.getFontSize()
      expect(fontSize).toBe('medium')
    })

    it('should save and retrieve font size', async () => {
      await SettingsService.setFontSize('small')
      const fontSize = await SettingsService.getFontSize()
      expect(fontSize).toBe('small')
    })

    it('should update font size', async () => {
      await SettingsService.setFontSize('small')
      await SettingsService.setFontSize('large')
      const fontSize = await SettingsService.getFontSize()
      expect(fontSize).toBe('large')
    })

    it('should convert font size to numeric value', () => {
      expect(SettingsService.getFontSizeValue('small')).toBe(14)
      expect(SettingsService.getFontSizeValue('medium')).toBe(18)
      expect(SettingsService.getFontSizeValue('large')).toBe(22)
      expect(SettingsService.getFontSizeValue('unknown' as FontSize)).toBe(18)
    })
  })

  describe('Theme', () => {
    it('should return default theme when no value is set', async () => {
      const theme = await SettingsService.getTheme()
      expect(theme).toBe('light')
    })

    it('should save and retrieve theme', async () => {
      await SettingsService.setTheme('dark')
      const theme = await SettingsService.getTheme()
      expect(theme).toBe('dark')
    })

    it('should update theme', async () => {
      await SettingsService.setTheme('light')
      await SettingsService.setTheme('sepia')
      const theme = await SettingsService.getTheme()
      expect(theme).toBe('sepia')
    })

    it('should return correct theme colors', () => {
      const lightColors = SettingsService.getThemeColors('light')
      expect(lightColors.background).toBe('#FFFFFF')
      expect(lightColors.text).toBe('#1F2937')

      const sepiaColors = SettingsService.getThemeColors('sepia')
      expect(sepiaColors.background).toBe('#F5F0E6')
      expect(sepiaColors.text).toBe('#1F2937')

      const darkColors = SettingsService.getThemeColors('dark')
      expect(darkColors.background).toBe('#111827')
      expect(darkColors.text).toBe('#F9FAFB')
    })

    it('should handle all theme types', () => {
      const themes: Theme[] = ['light', 'sepia', 'dark']
      themes.forEach(theme => {
        const colors = SettingsService.getThemeColors(theme)
        expect(colors).toHaveProperty('background')
        expect(colors).toHaveProperty('text')
        expect(colors).toHaveProperty('surface')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle errors gracefully when getting font size', async () => {
      // Mock AsyncStorage to throw error
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Storage error'))
      
      const fontSize = await SettingsService.getFontSize()
      expect(fontSize).toBe('medium') // Should return default
    })

    it('should handle errors gracefully when setting font size', async () => {
      // Mock AsyncStorage to throw error
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'))
      
      // Should not throw
      await expect(SettingsService.setFontSize('large')).resolves.not.toThrow()
    })

    it('should handle errors gracefully when getting theme', async () => {
      // Mock AsyncStorage to throw error
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Storage error'))
      
      const theme = await SettingsService.getTheme()
      expect(theme).toBe('light') // Should return default
    })

    it('should handle errors gracefully when setting theme', async () => {
      // Mock AsyncStorage to throw error
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'))
      
      // Should not throw
      await expect(SettingsService.setTheme('dark')).resolves.not.toThrow()
    })
  })
})

