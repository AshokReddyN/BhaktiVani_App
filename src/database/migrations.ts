import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'

export default schemaMigrations({
    migrations: [
        {
            toVersion: 2,
            steps: [
                {
                    type: 'add_columns',
                    table: 'deities',
                    columns: [
                        { name: 'name_telugu', type: 'string' },
                        { name: 'name_kannada', type: 'string' },
                    ],
                },
                {
                    type: 'add_columns',
                    table: 'stotras',
                    columns: [
                        { name: 'stotra_id', type: 'string', isIndexed: true },
                        { name: 'title_telugu', type: 'string' },
                        { name: 'text_telugu', type: 'string' },
                        { name: 'title_kannada', type: 'string' },
                        { name: 'text_kannada', type: 'string' },
                        { name: 'version_timestamp', type: 'number' },
                    ],
                },
            ],
        },
        {
            toVersion: 3,
            steps: [
                {
                    type: 'add_columns',
                    table: 'deities',
                    columns: [
                        { name: 'name_english', type: 'string' },
                    ],
                },
            ],
        },
        {
            toVersion: 4,
            steps: [
                {
                    type: 'add_columns',
                    table: 'stotras',
                    columns: [
                        { name: 'title_english', type: 'string' },
                    ],
                },
            ],
        },
        {
            toVersion: 5,
            steps: [
                // Create new language-specific tables
                {
                    type: 'create_table',
                    schema: {
                        name: 'deities_telugu',
                        columns: [
                            { name: 'deity_id', type: 'string', isIndexed: true },
                            { name: 'name', type: 'string' },
                            { name: 'name_english', type: 'string' },
                            { name: 'image', type: 'string' },
                        ],
                    },
                },
                {
                    type: 'create_table',
                    schema: {
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
                    },
                },
                {
                    type: 'create_table',
                    schema: {
                        name: 'deities_kannada',
                        columns: [
                            { name: 'deity_id', type: 'string', isIndexed: true },
                            { name: 'name', type: 'string' },
                            { name: 'name_english', type: 'string' },
                            { name: 'image', type: 'string' },
                        ],
                    },
                },
                {
                    type: 'create_table',
                    schema: {
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
                    },
                },
            ],
        },
    ],
})

