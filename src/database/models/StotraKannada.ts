import { Model } from '@nozbe/watermelondb'
import { field, relation } from '@nozbe/watermelondb/decorators'

export default class StotraKannada extends Model {
    static table = 'stotras_kannada'
    static associations = {
        deities_kannada: { type: 'belongs_to', key: 'deity_id' },
    } as const

    @field('stotra_id') stotraId!: string
    @field('title') title!: string
    @field('title_english') titleEnglish!: string
    @field('content') content!: string
    @field('is_favorite') isFavorite!: boolean
    @field('version_timestamp') versionTimestamp!: number

    @relation('deities_kannada', 'deity_id') deity!: any
}
