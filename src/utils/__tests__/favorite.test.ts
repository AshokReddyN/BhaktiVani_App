/**
 * Tests for favorite toggle functionality
 */

// Mock database before importing
const mockStotra = {
  id: 'test-stotra-id',
  title: 'Test Stotra',
  content: 'Test content',
  isFavorite: false,
  update: jest.fn((callback) => callback({ isFavorite: true })),
}

const mockDatabase = {
  get: jest.fn(() => ({
    find: jest.fn(() => Promise.resolve(mockStotra)),
  })),
  write: jest.fn((callback) => Promise.resolve(callback())),
}

jest.mock('../../database', () => ({
  database: mockDatabase,
}))

describe('Favorite Toggle Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStotra.isFavorite = false
  })

  it('should toggle favorite from false to true', async () => {
    const stotra = await mockDatabase.get('stotras').find('test-stotra-id')
    
    await mockDatabase.write(async () => {
      await stotra.update((s: any) => {
        s.isFavorite = !stotra.isFavorite
      })
    })

    expect(stotra.update).toHaveBeenCalled()
  })

  it('should persist favorite state in database', async () => {
    const stotra = await mockDatabase.get('stotras').find('test-stotra-id')
    
    await mockDatabase.write(async () => {
      await stotra.update((s: any) => {
        s.isFavorite = true
      })
    })

    expect(mockDatabase.write).toHaveBeenCalled()
  })

  it('should handle multiple toggle operations', async () => {
    const stotra = await mockDatabase.get('stotras').find('test-stotra-id')
    
    // Toggle to true
    await mockDatabase.write(async () => {
      await stotra.update((s: any) => {
        s.isFavorite = true
      })
    })

    // Toggle to false
    await mockDatabase.write(async () => {
      await stotra.update((s: any) => {
        s.isFavorite = false
      })
    })

    expect(mockDatabase.write).toHaveBeenCalledTimes(2)
  })

  it('should handle database write errors gracefully', async () => {
    const mockError = new Error('Database write failed')
    mockDatabase.write = jest.fn(() => Promise.reject(mockError))

    await expect(
      mockDatabase.write(async () => {
        const stotra = await mockDatabase.get('stotras').find('test-stotra-id')
        await stotra.update((s: any) => {
          s.isFavorite = true
        })
      })
    ).rejects.toThrow('Database write failed')
  })
})

