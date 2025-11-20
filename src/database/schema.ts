import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'deities',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'image', type: 'string' },
            ],
        }),
        tableSchema({
            name: 'stotras',
            columns: [
                { name: 'title', type: 'string' },
                { name: 'content', type: 'string' },
                { name: 'deity_id', type: 'string', isIndexed: true },
                { name: 'is_favorite', type: 'boolean' },
            ],
        }),
    ],
})
