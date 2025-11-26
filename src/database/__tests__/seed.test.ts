// Mock database and seed functions BEFORE any imports
const mockGet = jest.fn()
const mockWrite = jest.fn()
const mockQuery = jest.fn()
const mockFetchCount = jest.fn()

jest.mock('../index', () => ({
  database: {
    get: (...args) => mockGet(...args),
    write: (...args) => mockWrite(...args),
  },
}))

const mockSeedFunctions = {
  seedVenkateswara: jest.fn(() => Promise.resolve()),
  seedGanesha: jest.fn(() => Promise.resolve()),
  seedHanuman: jest.fn(() => Promise.resolve()),
  seedShiva: jest.fn(() => Promise.resolve()),
  seedLakshmi: jest.fn(() => Promise.resolve()),
  seedSaraswati: jest.fn(() => Promise.resolve()),
}

jest.mock('../seeds', () => ({
  seedVenkateswara: (...args) => mockSeedFunctions.seedVenkateswara(...args),
  seedGanesha: (...args) => mockSeedFunctions.seedGanesha(...args),
  seedHanuman: (...args) => mockSeedFunctions.seedHanuman(...args),
  seedShiva: (...args) => mockSeedFunctions.seedShiva(...args),
  seedLakshmi: (...args) => mockSeedFunctions.seedLakshmi(...args),
  seedSaraswati: (...args) => mockSeedFunctions.seedSaraswati(...args),
}))

// NOW import after mocks are defined
import { seedDatabase } from '../seed'

describe('seedDatabase', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set up default mock behavior
    mockFetchCount.mockResolvedValue(0)
    mockQuery.mockReturnValue({ fetchCount: mockFetchCount })
    mockGet.mockReturnValue({ query: mockQuery })
    mockWrite.mockImplementation((callback) => Promise.resolve(callback()))
  })

  it('should seed database when empty', async () => {
    mockFetchCount.mockResolvedValue(0)

    await seedDatabase()

    expect(mockFetchCount).toHaveBeenCalled()
    expect(mockWrite).toHaveBeenCalled()
    expect(mockSeedFunctions.seedVenkateswara).toHaveBeenCalledWith(expect.anything())
    expect(mockSeedFunctions.seedGanesha).toHaveBeenCalledWith(expect.anything())
    expect(mockSeedFunctions.seedHanuman).toHaveBeenCalledWith(expect.anything())
    expect(mockSeedFunctions.seedShiva).toHaveBeenCalledWith(expect.anything())
    expect(mockSeedFunctions.seedLakshmi).toHaveBeenCalledWith(expect.anything())
    expect(mockSeedFunctions.seedSaraswati).toHaveBeenCalledWith(expect.anything())
  })

  it('should not seed when database already has data', async () => {
    mockFetchCount.mockResolvedValue(6)

    await seedDatabase()

    expect(mockFetchCount).toHaveBeenCalled()
    expect(mockWrite).not.toHaveBeenCalled()
    expect(mockSeedFunctions.seedVenkateswara).not.toHaveBeenCalled()
  })

  it('should handle seeding errors gracefully', async () => {
    mockFetchCount.mockResolvedValue(0)
    mockWrite.mockRejectedValue(new Error('Seed error'))

    await expect(seedDatabase()).rejects.toThrow('Seed error')
  })

  it('should log when database is already seeded', async () => {
    const consoleSpy = jest.spyOn(console, 'log')
    mockFetchCount.mockResolvedValue(10)

    await seedDatabase()

    expect(consoleSpy).toHaveBeenCalledWith('Database already seeded')
    consoleSpy.mockRestore()
  })
})
