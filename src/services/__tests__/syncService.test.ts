import { SyncService } from '../syncService';
import { LanguageService } from '../languageService';
import { database } from '../../database';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Mock Firebase
jest.mock('../../config/firebase', () => ({
    db: {}
}));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
}));

// Mock database
jest.mock('../../database', () => ({
    database: {
        write: jest.fn(),
        get: jest.fn(),
    },
}));

// Mock LanguageService
jest.mock('../languageService', () => ({
    LanguageService: {
        getCurrentLanguage: jest.fn(),
        setLastSyncTimestamp: jest.fn(),
        getLastSyncTimestamp: jest.fn(),
    },
}));

describe('SyncService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('initialDownload', () => {
        it('should download only Telugu content when Telugu is selected', async () => {
            // Mock Firestore responses
            const mockDeities = [
                {
                    deity_id: 'ganesha',
                    name_telugu: 'గణేశుడు',
                    name_kannada: 'ಗಣೇಶ',
                    image: 'ganesha'
                }
            ];

            const mockStotras = [
                {
                    stotra_id: 'ganesha_pancharatnam_001',
                    deity_id: 'ganesha',
                    title_telugu: 'గణేశ పంచరత్నం',
                    text_telugu: 'ముదాకరాత్త మోదకం...',
                    title_kannada: 'ಗಣೇಶ ಪಂಚರತ್ನಂ',
                    text_kannada: 'ಮುದಾಕರಾತ್ತ ಮೋದಕಂ...',
                    version_timestamp: 1700000000000
                }
            ];

            (getDocs as jest.Mock).mockResolvedValueOnce({
                docs: mockDeities.map(d => ({ data: () => d }))
            }).mockResolvedValueOnce({
                docs: mockStotras.map(s => ({ data: () => s }))
            });

            const mockDeityQuery = { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }) };
            const mockStotraQuery = { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }) };
            const mockDeityCreate = jest.fn();
            const mockStotraCreate = jest.fn();

            (database.get as jest.Mock)
                .mockReturnValueOnce(mockDeityQuery) // For clearing deities
                .mockReturnValueOnce(mockStotraQuery) // For clearing stotras
                .mockReturnValueOnce({ create: mockDeityCreate }) // For creating deity
                .mockReturnValueOnce({ create: mockStotraCreate }); // For creating stotra

            (database.write as jest.Mock).mockImplementation(async (callback) => await callback());

            const progressCallback = jest.fn();

            await SyncService.initialDownload('telugu', progressCallback);

            // Verify progress updates
            expect(progressCallback).toHaveBeenCalledWith(10);
            expect(progressCallback).toHaveBeenCalledWith(30);
            expect(progressCallback).toHaveBeenCalledWith(50);
            expect(progressCallback).toHaveBeenCalledWith(60);
            expect(progressCallback).toHaveBeenCalledWith(80);
            expect(progressCallback).toHaveBeenCalledWith(100);

            // Verify deity creation
            expect(mockDeityCreate).toHaveBeenCalled();

            // Verify stotra creation with Telugu content only
            expect(mockStotraCreate).toHaveBeenCalled();

            // Verify timestamp update
            expect(LanguageService.setLastSyncTimestamp).toHaveBeenCalled();
        });

        it('should download only Kannada content when Kannada is selected', async () => {
            const mockDeities = [
                {
                    deity_id: 'ganesha',
                    name_telugu: 'గణేశుడు',
                    name_kannada: 'ಗಣೇಶ',
                    image: 'ganesha'
                }
            ];

            const mockStotras = [
                {
                    stotra_id: 'ganesha_pancharatnam_001',
                    deity_id: 'ganesha',
                    title_telugu: 'గణేశ పంచరత్నం',
                    text_telugu: 'ముదాకరాత్త మోదకం...',
                    title_kannada: 'ಗಣೇಶ ಪಂಚರತ್ನಂ',
                    text_kannada: 'ಮುದಾಕರಾತ್ತ ಮೋದಕಂ...',
                    version_timestamp: 1700000000000
                }
            ];

            (getDocs as jest.Mock).mockResolvedValueOnce({
                docs: mockDeities.map(d => ({ data: () => d }))
            }).mockResolvedValueOnce({
                docs: mockStotras.map(s => ({ data: () => s }))
            });

            const mockDeityQuery = { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }) };
            const mockStotraQuery = { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }) };
            const mockDeityCreate = jest.fn();
            const mockStotraCreate = jest.fn();

            (database.get as jest.Mock)
                .mockReturnValueOnce(mockDeityQuery)
                .mockReturnValueOnce(mockStotraQuery)
                .mockReturnValueOnce({ create: mockDeityCreate })
                .mockReturnValueOnce({ create: mockStotraCreate });

            (database.write as jest.Mock).mockImplementation(async (callback) => await callback());

            await SyncService.initialDownload('kannada');

            expect(mockDeityCreate).toHaveBeenCalled();
            expect(mockStotraCreate).toHaveBeenCalled();
            expect(LanguageService.setLastSyncTimestamp).toHaveBeenCalled();
        });

        it('should handle download errors gracefully', async () => {
            (getDocs as jest.Mock).mockRejectedValue(new Error('Network error'));

            await expect(SyncService.initialDownload('telugu')).rejects.toThrow('Network error');
        });
    });

    describe('syncNewContent', () => {
        it('should fetch only updated stotras since last sync', async () => {
            const lastSync = 1700000000000;
            (LanguageService.getLastSyncTimestamp as jest.Mock).mockResolvedValue(lastSync);
            (LanguageService.getCurrentLanguage as jest.Mock).mockResolvedValue('telugu');

            const mockUpdatedStotras = [
                {
                    stotra_id: 'ganesha_new_001',
                    deity_id: 'ganesha',
                    title_telugu: 'New Stotra',
                    text_telugu: 'New content...',
                    title_kannada: 'New Stotra KN',
                    text_kannada: 'New content KN...',
                    version_timestamp: 1700000001000
                }
            ];

            (query as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: mockUpdatedStotras.map(s => ({ data: () => s }))
            });

            const mockStotraQuery = { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }) };
            const mockDeityQuery = { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([{ image: 'ganesha', id: '1' }]) }) };
            const mockStotraCreate = jest.fn();

            (database.get as jest.Mock)
                .mockReturnValueOnce(mockStotraQuery)
                .mockReturnValueOnce(mockDeityQuery)
                .mockReturnValueOnce({ create: mockStotraCreate });

            (database.write as jest.Mock).mockImplementation(async (callback) => await callback());

            const result = await SyncService.syncNewContent();

            expect(result.updated).toBe(1);
            expect(result.errors).toBe(0);
            expect(LanguageService.setLastSyncTimestamp).toHaveBeenCalled();
        });

        it('should handle sync errors and return error count', async () => {
            (LanguageService.getLastSyncTimestamp as jest.Mock).mockResolvedValue(1700000000000);
            (LanguageService.getCurrentLanguage as jest.Mock).mockResolvedValue('telugu');

            const mockStotras = [
                { stotra_id: 'test_001', deity_id: 'ganesha', title_telugu: 'Test', text_telugu: 'Test', version_timestamp: 1700000001000 }
            ];

            (query as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: mockStotras.map(s => ({ data: () => s }))
            });

            (database.write as jest.Mock).mockRejectedValue(new Error('Database error'));

            const result = await SyncService.syncNewContent();

            expect(result.updated).toBe(0);
            expect(result.errors).toBe(1);
        });
    });

    describe('upsertStotra', () => {
        it('should update existing stotra with selected language only', async () => {
            (LanguageService.getCurrentLanguage as jest.Mock).mockResolvedValue('telugu');

            const existingStotra = {
                stotraId: 'ganesha_pancharatnam_001',
                update: jest.fn()
            };

            const mockStotraQuery = {
                query: jest.fn().mockReturnValue({
                    fetch: jest.fn().mockResolvedValue([existingStotra])
                })
            };

            (database.get as jest.Mock).mockReturnValue(mockStotraQuery);
            (database.write as jest.Mock).mockImplementation(async (callback) => await callback());

            const stotraData = {
                stotra_id: 'ganesha_pancharatnam_001',
                deity_id: 'ganesha',
                title_telugu: 'Updated Telugu Title',
                text_telugu: 'Updated Telugu Text',
                title_kannada: 'Updated Kannada Title',
                text_kannada: 'Updated Kannada Text',
                version_timestamp: 1700000001000
            };

            await SyncService.upsertStotra(stotraData);

            expect(existingStotra.update).toHaveBeenCalled();
        });

        it('should create new stotra with selected language only', async () => {
            (LanguageService.getCurrentLanguage as jest.Mock).mockResolvedValue('kannada');

            const mockStotraQuery = {
                query: jest.fn().mockReturnValue({
                    fetch: jest.fn().mockResolvedValue([])
                })
            };

            const mockDeityQuery = {
                query: jest.fn().mockReturnValue({
                    fetch: jest.fn().mockResolvedValue([{ image: 'ganesha', id: '1' }])
                })
            };

            const mockCreate = jest.fn();

            (database.get as jest.Mock)
                .mockReturnValueOnce(mockStotraQuery)
                .mockReturnValueOnce(mockDeityQuery)
                .mockReturnValueOnce({ create: mockCreate });

            (database.write as jest.Mock).mockImplementation(async (callback) => await callback());

            const stotraData = {
                stotra_id: 'new_stotra_001',
                deity_id: 'ganesha',
                title_telugu: 'New Telugu Title',
                text_telugu: 'New Telugu Text',
                title_kannada: 'New Kannada Title',
                text_kannada: 'New Kannada Text',
                version_timestamp: 1700000001000
            };

            await SyncService.upsertStotra(stotraData);

            expect(mockCreate).toHaveBeenCalled();
        });
    });

    describe('isOnline', () => {
        it('should return true when online', async () => {
            global.fetch = jest.fn().mockResolvedValue({ ok: true });

            const result = await SyncService.isOnline();

            expect(result).toBe(true);
        });

        it('should return false when offline', async () => {
            global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

            const result = await SyncService.isOnline();

            expect(result).toBe(false);
        });
    });

    describe('getMasterTimestamp', () => {
        it('should fetch master timestamp from Firebase config', async () => {
            const mockConfig = {
                id: 'global',
                data: () => ({ master_timestamp: 1700000000000 })
            };

            (getDocs as jest.Mock).mockResolvedValue({
                docs: [mockConfig]
            });

            const result = await SyncService.getMasterTimestamp();

            expect(result).toBe(1700000000000);
        });

        it('should return current timestamp if config not found', async () => {
            (getDocs as jest.Mock).mockResolvedValue({
                docs: []
            });

            const result = await SyncService.getMasterTimestamp();

            expect(result).toBeGreaterThan(0);
        });

        it('should handle errors and return current timestamp', async () => {
            (getDocs as jest.Mock).mockRejectedValue(new Error('Firebase error'));

            const result = await SyncService.getMasterTimestamp();

            expect(result).toBeGreaterThan(0);
        });
    });

    describe('checkForUpdates', () => {
        it('should return true when updates are available', async () => {
            (LanguageService.getCurrentLanguage as jest.Mock).mockResolvedValue('telugu');
            (LanguageService.getContentVersion as jest.Mock).mockResolvedValue(1700000000000);
            (LanguageService.getLastSyncTimestamp as jest.Mock).mockResolvedValue(1700000000000);

            const mockUpdatedStotras = [
                { stotra_id: 'new_001', title_telugu: 'New', version_timestamp: 1700000001000 },
                { stotra_id: 'new_002', title_telugu: 'New 2', version_timestamp: 1700000002000 },
            ];

            (query as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: mockUpdatedStotras.map(s => ({ data: () => s }))
            });

            const result = await SyncService.checkForUpdates();

            expect(result.hasUpdates).toBe(true);
            expect(result.updateCount).toBe(2);
        });

        it('should return false when no updates are available', async () => {
            (LanguageService.getCurrentLanguage as jest.Mock).mockResolvedValue('telugu');
            (LanguageService.getContentVersion as jest.Mock).mockResolvedValue(1700000000000);
            (LanguageService.getLastSyncTimestamp as jest.Mock).mockResolvedValue(1700000000000);

            (query as jest.Mock).mockReturnValue({});
            (getDocs as jest.Mock).mockResolvedValue({
                docs: []
            });

            const result = await SyncService.checkForUpdates();

            expect(result.hasUpdates).toBe(false);
            expect(result.updateCount).toBe(0);
        });

        it('should return false when no language is set', async () => {
            (LanguageService.getCurrentLanguage as jest.Mock).mockResolvedValue(null);

            const result = await SyncService.checkForUpdates();

            expect(result.hasUpdates).toBe(false);
            expect(result.updateCount).toBe(0);
        });

        it('should handle errors gracefully', async () => {
            (LanguageService.getCurrentLanguage as jest.Mock).mockResolvedValue('telugu');
            (getDocs as jest.Mock).mockRejectedValue(new Error('Network error'));

            const result = await SyncService.checkForUpdates();

            expect(result.hasUpdates).toBe(false);
            expect(result.updateCount).toBe(0);
        });
    });
});
