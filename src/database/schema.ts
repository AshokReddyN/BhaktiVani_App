import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
    version: 5,
    tables: [
        // Telugu-specific tables
        tableSchema({
            name: 'deities_telugu',
            columns: [
                { name: 'deity_id', type: 'string', isIndexed: true },
                { name: 'name', type: 'string' },
                { name: 'name_english', type: 'string' },
                { name: 'image', type: 'string' },
            ],
        }),
        tableSchema({
            name: 'stotras_telugu',
            columns: [
                { name: 'stotra_id', type: 'string', isIndexed: true },
                { name: 'title', type: 'string' },
                { name: 'title_english', type: 'string' },
                { name: 'content', type: 'string' },
                { name: 'deity_id', type: 'string', isIndexed: true },
                { name: 'is_favorite', type: 'boolean' },
                { name: 'version_timestamp', type: 'number' },
            ],
        }),
        // Kannada-specific tables
        tableSchema({
            name: 'deities_kannada',
            columns: [
                { name: 'deity_id', type: 'string', isIndexed: true },
                { name: 'name', type: 'string' },
                { name: 'name_english', type: 'string' },
                { name: 'image', type: 'string' },
            ],
        }),
        tableSchema({
            name: 'stotras_kannada',
            columns: [
                { name: 'stotra_id', type: 'string', isIndexed: true },
                { name: 'title', type: 'string' },
                { name: 'title_english', type: 'string' },
                { name: 'content', type: 'string' },
                { name: 'deity_id', type: 'string', isIndexed: true },
                { name: 'is_favorite', type: 'boolean' },
                { name: 'version_timestamp', type: 'number' },
            ],
        }),
    ],
})

