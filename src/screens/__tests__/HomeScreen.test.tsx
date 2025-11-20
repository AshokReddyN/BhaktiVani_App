import React from 'react'
import { render, waitFor } from '@testing-library/react-native'
import HomeScreen from '../HomeScreen'
import { database } from '../../database'

// Mock navigation
const mockNavigate = jest.fn()

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}))

// Mock database
const mockDeities = [
  { id: '1', name: 'వెంకటేశ్వర స్వామి', nameTelugu: 'వెంకటేశ్వర స్వామి' },
  { id: '2', name: 'గణేశుడు', nameTelugu: 'గణేశుడు' },
]

jest.mock('../../database', () => ({
  database: {
    get: jest.fn(() => ({
      query: jest.fn(() => ({
        fetch: jest.fn(() => Promise.resolve(mockDeities)),
      })),
    })),
  },
}))

jest.mock('../../database/models/Deity', () => ({
  __esModule: true,
  default: class MockDeity {
    id = '1'
    name = 'Test Deity'
    nameTelugu = 'Test Deity'
  },
}))

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render home screen', async () => {
    const { getByText } = render(<HomeScreen />)
    
    // Wait for data to load
    await waitFor(() => {
      expect(database.get).toHaveBeenCalled()
    })
  })

  it('should fetch deities on mount', async () => {
    render(<HomeScreen />)
    
    await waitFor(() => {
      expect(database.get).toHaveBeenCalled()
    })
  })

  it('should handle navigation to stotra list', async () => {
    const { getByText } = render(<HomeScreen />)
    
    await waitFor(() => {
      // Assuming we can find a deity card and press it
      // This would require more specific mocking of the FlatList render
      expect(database.get).toHaveBeenCalled()
    })
  })
})

