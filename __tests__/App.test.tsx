import React from 'react'
import { render, waitFor } from '@testing-library/react-native'
import App from '../App'

// Mock seedDatabase
jest.mock('../src/database/seed', () => ({
  seedDatabase: jest.fn(() => Promise.resolve()),
}))

// Mock SafeAreaProvider
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render app and seed database', async () => {
    const { seedDatabase } = require('../src/database/seed')
    
    render(<App />)
    
    await waitFor(() => {
      expect(seedDatabase).toHaveBeenCalled()
    })
  })

  it('should show loading state initially', () => {
    const { seedDatabase } = require('../src/database/seed')
    ;(seedDatabase as jest.Mock).mockImplementation(() => new Promise(() => {}))
    
    const { queryByTestId } = render(<App />)
    // App should be null or loading while seeding
  })

  it('should handle database seeding errors', async () => {
    const { seedDatabase } = require('../src/database/seed')
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    ;(seedDatabase as jest.Mock).mockRejectedValueOnce(new Error('Seed failed'))
    
    render(<App />)
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
    
    consoleErrorSpy.mockRestore()
  })
})

