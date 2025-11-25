import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react-native'
import StotraListScreen from '../StotraListScreen'
import { database } from '../../database'

// Mock navigation
const mockNavigate = jest.fn()
const mockGoBack = jest.fn()
const mockSetOptions = jest.fn()

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
        setOptions: mockSetOptions,
    }),
    useRoute: () => ({
        params: {
            deityId: 'deity-1',
            deityName: 'Test Deity',
        },
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

// Mock database
const mockStotras = [
    {
        id: 'stotra-1',
        title: 'Vishnu Sahasranama',
        titleEnglish: 'Vishnu Sahasranama',
        titleTelugu: 'విష్ణు సహస్రనామం',
        titleKannada: 'ವಿಷ್ಣು ಸಹಸ್ರನಾಮ',
        isFavorite: false,
    },
    {
        id: 'stotra-2',
        title: 'Lalita Sahasranama',
        titleEnglish: 'Lalita Sahasranama',
        titleTelugu: 'లలితా సహస్రనామం',
        titleKannada: 'ಲಲಿತಾ ಸಹಸ್ರನಾಮ',
        isFavorite: true,
    },
    {
        id: 'stotra-3',
        title: 'Hanuman Chalisa',
        titleEnglish: 'Hanuman Chalisa',
        titleTelugu: 'హనుమాన్ చాలీసా',
        titleKannada: 'ಹನುಮಾನ್ ಚಾಲೀಸಾ',
        isFavorite: false,
    },
]

const mockDeity = {
    id: 'deity-1',
    name: 'Test Deity',
    nameTelugu: 'టెస్ట్ దేవత',
    nameKannada: 'ಪರೀಕ್ಷಾ ದೇವತೆ',
}

jest.mock('../../database', () => ({
    database: {
        get: jest.fn((tableName) => {
            if (tableName === 'stotras') {
                return {
                    query: jest.fn(() => ({
                        fetch: jest.fn(() => Promise.resolve(mockStotras)),
                    })),
                }
            } else if (tableName === 'deities') {
                return {
                    find: jest.fn(() => Promise.resolve(mockDeity)),
                }
            }
            return {
                query: jest.fn(() => ({
                    fetch: jest.fn(() => Promise.resolve([])),
                })),
            }
        }),
    },
}))

jest.mock('../../database/models/Stotra', () => ({
    __esModule: true,
    default: class MockStotra {
        id = 'stotra-1'
        title = 'Test Stotra'
        titleEnglish = 'Test Stotra'
        titleTelugu = 'టెస్ట్ స్తోత్రం'
        titleKannada = 'ಪರೀಕ್ಷಾ ಸ್ತೋತ್ರ'
        isFavorite = false
    },
}))

jest.mock('../../database/models/Deity', () => ({
    __esModule: true,
    default: class MockDeity {
        id = 'deity-1'
        name = 'Test Deity'
        nameTelugu = 'టెస్ట్ దేవత'
        nameKannada = 'ಪರೀಕ್ಷಾ ದೇವತೆ'
    },
}))

describe('StotraListScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render stotra list screen with search input', async () => {
        const { getByPlaceholderText, getByText } = render(<StotraListScreen />)

        // Wait for data to load
        await waitFor(() => {
            expect(database.get).toHaveBeenCalled()
        })

        // Check if search input is visible
        await waitFor(() => {
            expect(getByPlaceholderText('స్తోత్రం కోసం వెతకండి')).toBeTruthy()
        })
    })

    it('should display all stotras when search is empty', async () => {
        const { getByText } = render(<StotraListScreen />)

        await waitFor(() => {
            expect(getByText('విష్ణు సహస్రనామం')).toBeTruthy()
            expect(getByText('లలితా సహస్రనామం')).toBeTruthy()
            expect(getByText('హనుమాన్ చాలీసా')).toBeTruthy()
        })
    })

    it('should filter stotras by Telugu title', async () => {
        const { getByPlaceholderText, getByText, queryByText } = render(<StotraListScreen />)

        await waitFor(() => {
            expect(database.get).toHaveBeenCalled()
        })

        const searchInput = getByPlaceholderText('స్తోత్రం కోసం వెతకండి')

        // Search for "విష్ణు"
        fireEvent.changeText(searchInput, 'విష్ణు')

        await waitFor(() => {
            // Should show Vishnu Sahasranama
            expect(getByText('విష్ణు సహస్రనామం')).toBeTruthy()
            // Should not show other stotras
            expect(queryByText('లలితా సహస్రనామం')).toBeNull()
            expect(queryByText('హనుమాన్ చాలీసా')).toBeNull()
        })
    })

    it('should filter stotras by Kannada title', async () => {
        const { getByPlaceholderText, getByText, queryByText } = render(<StotraListScreen />)

        await waitFor(() => {
            expect(database.get).toHaveBeenCalled()
        })

        const searchInput = getByPlaceholderText('స్తోత్రం కోసం వెతకండి')

        // Search for "ಹನುಮಾನ್"
        fireEvent.changeText(searchInput, 'ಹನುಮಾನ್')

        await waitFor(() => {
            // Should show Hanuman Chalisa
            expect(getByText('హనుమాన్ చాలీసా')).toBeTruthy()
            // Should not show other stotras
            expect(queryByText('విష్ణు సహస్రనామం')).toBeNull()
            expect(queryByText('లలితా సహస్రనామం')).toBeNull()
        })
    })

    it('should filter stotras by English title', async () => {
        const { getByPlaceholderText, getByText, queryByText } = render(<StotraListScreen />)

        await waitFor(() => {
            expect(database.get).toHaveBeenCalled()
        })

        const searchInput = getByPlaceholderText('స్తోత్రం కోసం వెతకండి')

        // Search for "Lalita"
        fireEvent.changeText(searchInput, 'Lalita')

        await waitFor(() => {
            // Should show Lalita Sahasranama
            expect(getByText('లలితా సహస్రనామం')).toBeTruthy()
            // Should not show other stotras
            expect(queryByText('విష్ణు సహస్రనామం')).toBeNull()
            expect(queryByText('హనుమాన్ చాలీసా')).toBeNull()
        })
    })

    it('should handle case-insensitive search', async () => {
        const { getByPlaceholderText, getByText } = render(<StotraListScreen />)

        await waitFor(() => {
            expect(database.get).toHaveBeenCalled()
        })

        const searchInput = getByPlaceholderText('స్తోత్రం కోసం వెతకండి')

        // Search for "vishnu" in lowercase
        fireEvent.changeText(searchInput, 'vishnu')

        await waitFor(() => {
            expect(getByText('విష్ణు సహస్రనామం')).toBeTruthy()
        })
    })

    it('should show all stotras when search is cleared', async () => {
        const { getByPlaceholderText, getByText } = render(<StotraListScreen />)

        await waitFor(() => {
            expect(database.get).toHaveBeenCalled()
        })

        const searchInput = getByPlaceholderText('స్తోత్రం కోసం వెతకండి')

        // Search for something
        fireEvent.changeText(searchInput, 'విష్ణు')

        // Clear search
        fireEvent.changeText(searchInput, '')

        await waitFor(() => {
            // All stotras should be visible again
            expect(getByText('విష్ణు సహస్రనామం')).toBeTruthy()
            expect(getByText('లలితా సహస్రనామం')).toBeTruthy()
            expect(getByText('హనుమాన్ చాలీసా')).toBeTruthy()
        })
    })

    it('should handle partial matches', async () => {
        const { getByPlaceholderText, getByText, queryByText } = render(<StotraListScreen />)

        await waitFor(() => {
            expect(database.get).toHaveBeenCalled()
        })

        const searchInput = getByPlaceholderText('స్తోత్రం కోసం వెతకండి')

        // Search for partial text "సహస్ర" which should match both Vishnu and Lalita Sahasranama
        fireEvent.changeText(searchInput, 'సహస్ర')

        await waitFor(() => {
            expect(getByText('విష్ణు సహస్రనామం')).toBeTruthy()
            expect(getByText('లలితా సహస్రనామం')).toBeTruthy()
            // Should not show Hanuman Chalisa
            expect(queryByText('హనుమాన్ చాలీసా')).toBeNull()
        })
    })

    it('should navigate to stotra detail when stotra is pressed', async () => {
        const { getByText } = render(<StotraListScreen />)

        await waitFor(() => {
            expect(database.get).toHaveBeenCalled()
        })

        const stotraCard = getByText('విష్ణు సహస్రనామం')
        fireEvent.press(stotraCard)

        expect(mockNavigate).toHaveBeenCalledWith('StotraDetail', {
            stotraId: 'stotra-1',
        })
    })
})
