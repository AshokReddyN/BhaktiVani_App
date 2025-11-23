import { database } from './index'
import Deity from './models/Deity'
import Stotra from './models/Stotra'

/**
 * One-time migration to populate new language fields from existing data
 * This should be run after the schema migration is complete
 */
export async function migrateExistingData() {
    console.log('Starting data migration...')

    try {
        await database.write(async () => {
            // Migrate deities
            const deities = await database.get<Deity>('deities').query().fetch()
            console.log(`Migrating ${deities.length} deities...`)

            // Migrate deity language fields
            for (const deity of deities) {
                await deity.update(d => {
                    // Only set language fields if they are COMPLETELY empty
                    // Don't overwrite Firebase-synced data!
                    if (!d.nameTelugu || d.nameTelugu.trim() === '') {
                        d.nameTelugu = d.name;
                    }
                    if (!d.nameKannada || d.nameKannada.trim() === '') {
                        // Only set as placeholder if truly empty
                        // Firebase sync will provide the real Kannada name
                        d.nameKannada = d.name; // Placeholder
                    }
                });
            }

            // Migrate stotras
            const stotras = await database.get<Stotra>('stotras').query().fetch()
            console.log(`Migrating ${stotras.length} stotras...`)

            for (let i = 0; i < stotras.length; i++) {
                const stotra = stotras[i]
                await stotra.update(s => {
                    // Generate unique stotra_id if not set
                    if (!s.stotraId) {
                        s.stotraId = `stotra_${s.id}_${Date.now()}`
                    }

                    // Only migrate if language fields are empty
                    if (!s.titleTelugu) {
                        s.titleTelugu = s.title
                    }
                    if (!s.textTelugu) {
                        s.textTelugu = s.content
                    }
                    if (!s.titleKannada) {
                        s.titleKannada = s.title // Placeholder
                    }
                    if (!s.textKannada) {
                        s.textKannada = s.content // Placeholder
                    }

                    // Set initial version timestamp if not set
                    if (!s.versionTimestamp) {
                        s.versionTimestamp = Date.now()
                    }
                })
            }
        })

        console.log('Data migration completed successfully!')
    } catch (error) {
        console.error('Data migration failed:', error)
        throw error
    }
}
