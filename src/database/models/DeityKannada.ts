import { Model } from '@nozbe/watermelondb'
import { field, children } from '@nozbe/watermelondb/decorators'

export default class DeityKannada extends Model {
    static table = 'deities_kannada'
    static associations = {
        stotras_kannada: { type: 'has_many', foreignKey: 'deity_id' },
    } as const

    @field('deity_id') deityId!: string
    @field('name') name!: string
    @field('name_english') nameEnglish!: string
    @field('image') image!: string

    @children('stotras_kannada') stotras!: any
}
