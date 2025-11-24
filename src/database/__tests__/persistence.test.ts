import { database } from '../index';
import Deity from '../models/Deity';
import Stotra from '../models/Stotra';

describe('Database Persistence', () => {
    beforeEach(async () => {
        // Clear database before each test
        await database.write(async () => {
            const deities = await database.get<Deity>('deities').query().fetch();
            const stotras = await database.get<Stotra>('stotras').query().fetch();

            for (const deity of deities) {
                await deity.markAsDeleted();
            }
            for (const stotra of stotras) {
                await stotra.markAsDeleted();
            }
        });
    });

    describe('SQLite Adapter', () => {
        it('should initialize database with SQLite adapter', () => {
            expect(database).toBeDefined();
            expect(database.adapter).toBeDefined();
            // SQLite adapter should be used (not LokiJS)
            expect(database.adapter.constructor.name).toBe('SQLiteAdapter');
        });

        it('should have correct schema version', () => {
            expect(database.schema.version).toBe(2);
        });

        it('should have deities and stotras tables', () => {
            const tables = database.schema.tables;
            expect(tables.find(t => t.name === 'deities')).toBeDefined();
            expect(tables.find(t => t.name === 'stotras')).toBeDefined();
        });
    });

    describe('Data Persistence', () => {
        it('should persist deity data', async () => {
            // Create a deity
            await database.write(async () => {
                await database.get<Deity>('deities').create(deity => {
                    deity.name = 'Test Deity';
                    deity.nameTelugu = 'టెస్ట్ దేవత';
                    deity.nameKannada = 'ಪರೀಕ್ಷಾ ದೇವತೆ';
                    deity.image = 'test';
                });
            });

            // Fetch and verify
            const deities = await database.get<Deity>('deities').query().fetch();
            expect(deities.length).toBe(1);
            expect(deities[0].name).toBe('Test Deity');
            expect(deities[0].nameTelugu).toBe('టెస్ట్ దేవత');
        });

        it('should persist stotra data with relationships', async () => {
            let deityId: string;

            // Create deity first
            await database.write(async () => {
                const deity = await database.get<Deity>('deities').create(d => {
                    d.name = 'Ganesha';
                    d.nameTelugu = 'గణేశుడు';
                    d.nameKannada = 'ಗಣೇಶ';
                    d.image = 'ganesha';
                });
                deityId = deity.id;

                // Create stotra
                await database.get<Stotra>('stotras').create(stotra => {
                    stotra.stotraId = 'test_001';
                    stotra.title = 'Test Stotra';
                    stotra.titleTelugu = 'టెస్ట్ స్తోత్రం';
                    stotra.titleKannada = 'ಪರೀಕ್ಷಾ ಸ್ತೋತ್ರ';
                    stotra.content = 'Test content';
                    stotra.textTelugu = 'టెస్ట్ కంటెంట్';
                    stotra.textKannada = 'ಪರೀಕ್ಷಾ ವಿಷಯ';
                    stotra.isFavorite = false;
                    stotra.versionTimestamp = Date.now();
                    stotra.deity.set(deity);
                });
            });

            // Fetch and verify
            const stotras = await database.get<Stotra>('stotras').query().fetch();
            expect(stotras.length).toBe(1);
            expect(stotras[0].title).toBe('Test Stotra');
            expect(stotras[0].stotraId).toBe('test_001');
        });

        it('should persist favorite status', async () => {
            let stotraId: string;

            // Create deity and stotra
            await database.write(async () => {
                const deity = await database.get<Deity>('deities').create(d => {
                    d.name = 'Test';
                    d.nameTelugu = 'టెస్ట్';
                    d.nameKannada = 'ಪರೀಕ್ಷೆ';
                    d.image = 'test';
                });

                const stotra = await database.get<Stotra>('stotras').create(s => {
                    s.stotraId = 'fav_test_001';
                    s.title = 'Favorite Test';
                    s.titleTelugu = 'ఇష్టమైన టెస్ట్';
                    s.titleKannada = 'ಮೆಚ್ಚಿನ ಪರೀಕ್ಷೆ';
                    s.content = 'Content';
                    s.textTelugu = 'కంటెంట్';
                    s.textKannada = 'ವಿಷಯ';
                    s.isFavorite = false;
                    s.versionTimestamp = Date.now();
                    s.deity.set(deity);
                });
                stotraId = stotra.id;
            });

            // Mark as favorite
            await database.write(async () => {
                const stotra = await database.get<Stotra>('stotras').find(stotraId);
                await stotra.update(s => {
                    s.isFavorite = true;
                });
            });

            // Verify favorite status persisted
            const stotra = await database.get<Stotra>('stotras').find(stotraId);
            expect(stotra.isFavorite).toBe(true);
        });

        it('should handle database queries correctly', async () => {
            // Create multiple deities
            await database.write(async () => {
                await database.get<Deity>('deities').create(d => {
                    d.name = 'Deity 1';
                    d.nameTelugu = 'దేవత 1';
                    d.nameKannada = 'ದೇವತೆ 1';
                    d.image = 'deity1';
                });
                await database.get<Deity>('deities').create(d => {
                    d.name = 'Deity 2';
                    d.nameTelugu = 'దేవత 2';
                    d.nameKannada = 'ದೇವತೆ 2';
                    d.image = 'deity2';
                });
            });

            // Query all deities
            const allDeities = await database.get<Deity>('deities').query().fetch();
            expect(allDeities.length).toBe(2);

            // Query by count
            const count = await database.get<Deity>('deities').query().fetchCount();
            expect(count).toBe(2);
        });
    });

    describe('Data Deletion', () => {
        it('should mark records as deleted', async () => {
            let deityId: string;

            // Create deity
            await database.write(async () => {
                const deity = await database.get<Deity>('deities').create(d => {
                    d.name = 'To Delete';
                    d.nameTelugu = 'తొలగించడానికి';
                    d.nameKannada = 'ಅಳಿಸಲು';
                    d.image = 'delete';
                });
                deityId = deity.id;
            });

            // Delete deity
            await database.write(async () => {
                const deity = await database.get<Deity>('deities').find(deityId);
                await deity.markAsDeleted();
            });

            // Verify deletion
            const deities = await database.get<Deity>('deities').query().fetch();
            expect(deities.length).toBe(0);
        });
    });
});
