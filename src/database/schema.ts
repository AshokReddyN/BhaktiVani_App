import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
    version: 4,
    tables: [
        tableSchema({
            name: 'deities',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'name_english', type: 'string' },
                { name: 'name_telugu', type: 'string' },
                { name: 'name_kannada', type: 'string' },
                { name: 'image', type: 'string' },
            ],
        }),
        tableSchema({
            name: 'stotras',
            columns: [
                { name: 'stotra_id', type: 'string', isIndexed: true },
                { name: 'title', type: 'string' },
                { name: 'title_english', type: 'string' },
                { name: 'content', type: 'string' },
                { name: 'title_telugu', type: 'string' },
                { name: 'text_telugu', type: 'string' },
                { name: 'title_kannada', type: 'string' },
                { name: 'text_kannada', type: 'string' },
                { name: 'deity_id', type: 'string', isIndexed: true },
                { name: 'is_favorite', type: 'boolean' },
                { name: 'version_timestamp', type: 'number' },
            ],
        }),
    ],
})
