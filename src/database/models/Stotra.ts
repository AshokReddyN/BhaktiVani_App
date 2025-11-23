import { Model } from '@nozbe/watermelondb'
import { field, relation } from '@nozbe/watermelondb/decorators'
import Deity from './Deity'

export default class Stotra extends Model {
    static table = 'stotras'
    static associations = {
        deities: { type: 'belongs_to', key: 'deity_id' },
    } as const

    @field('stotra_id') stotraId!: string
    @field('title') title!: string
    @field('content') content!: string
    @field('title_telugu') titleTelugu!: string
    @field('text_telugu') textTelugu!: string
    @field('title_kannada') titleKannada!: string
    @field('text_kannada') textKannada!: string
    @field('is_favorite') isFavorite!: boolean
    @field('version_timestamp') versionTimestamp!: number

    @relation('deities', 'deity_id') deity!: any
}
