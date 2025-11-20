import { Model } from '@nozbe/watermelondb'
import { field, relation } from '@nozbe/watermelondb/decorators'
import Deity from './Deity'

export default class Stotra extends Model {
    static table = 'stotras'
    static associations = {
        deities: { type: 'belongs_to', key: 'deity_id' },
    } as const

    @field('title') title!: string
    @field('content') content!: string
    @field('is_favorite') isFavorite!: boolean

    @relation('deities', 'deity_id') deity!: any
}
