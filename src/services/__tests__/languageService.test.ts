import { LanguageService } from '../languageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    multiRemove: jest.fn(),
}));

describe('LanguageService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Content Version Tracking', () => {
        it('should get content version for language', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue('1700000000000');

            const version = await LanguageService.getContentVersion('telugu');

            expect(AsyncStorage.getItem).toHaveBeenCalledWith('@bhaktivani:contentVersion:telugu');
            expect(version).toBe(1700000000000);
        });

        it('should return 0 if no version exists', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            const version = await LanguageService.getContentVersion('kannada');

            expect(version).toBe(0);
        });

        it('should set content version for language', async () => {
            const timestamp = Date.now();

            await LanguageService.setContentVersion('telugu', timestamp);

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                '@bhaktivani:contentVersion:telugu',
                timestamp.toString()
            );
        });

        it('should handle different languages separately', async () => {
            const teluguVersion = 1700000000000;
            const kannadaVersion = 1700000001000;

            await LanguageService.setContentVersion('telugu', teluguVersion);
            await LanguageService.setContentVersion('kannada', kannadaVersion);

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                '@bhaktivani:contentVersion:telugu',
                teluguVersion.toString()
            );
            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                '@bhaktivani:contentVersion:kannada',
                kannadaVersion.toString()
            );
        });
    });

    describe('Sync Statistics', () => {
        it('should get sync stats', async () => {
            const mockStats = {
                deityCount: 6,
                stotraCount: 45,
                lastSync: 1700000000000,
            };
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockStats));

            const stats = await LanguageService.getSyncStats();

            expect(AsyncStorage.getItem).toHaveBeenCalledWith('@bhaktivani:syncStats');
            expect(stats).toEqual(mockStats);
        });

        it('should return default stats if none exist', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            const stats = await LanguageService.getSyncStats();

            expect(stats).toEqual({
                deityCount: 0,
                stotraCount: 0,
                lastSync: 0,
            });
        });

        it('should set sync stats', async () => {
            const deityCount = 8;
            const stotraCount = 50;

            await LanguageService.setSyncStats(deityCount, stotraCount);

            expect(AsyncStorage.setItem).toHaveBeenCalled();
            const callArgs = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
            expect(callArgs[0]).toBe('@bhaktivani:syncStats');

            const savedStats = JSON.parse(callArgs[1]);
            expect(savedStats.deityCount).toBe(deityCount);
            expect(savedStats.stotraCount).toBe(stotraCount);
            expect(savedStats.lastSync).toBeGreaterThan(0);
        });
    });

    describe('Existing Functionality', () => {
        it('should get current language', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue('telugu');

            const language = await LanguageService.getCurrentLanguage();

            expect(AsyncStorage.getItem).toHaveBeenCalledWith('@bhaktivani:currentLanguage');
            expect(language).toBe('telugu');
        });

        it('should set current language', async () => {
            await LanguageService.setCurrentLanguage('kannada');

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                '@bhaktivani:currentLanguage',
                'kannada'
            );
        });

        it('should check if initial setup is complete', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');

            const isComplete = await LanguageService.isInitialSetupComplete();

            expect(AsyncStorage.getItem).toHaveBeenCalledWith('@bhaktivani:initialSetupComplete');
            expect(isComplete).toBe(true);
        });

        it('should mark initial setup as complete', async () => {
            await LanguageService.markInitialSetupComplete();

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                '@bhaktivani:initialSetupComplete',
                'true'
            );
        });
    });
});
