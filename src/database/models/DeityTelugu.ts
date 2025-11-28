import { Model } from '@nozbe/watermelondb'
import { field, children } from '@nozbe/watermelondb/decorators'

export default class DeityTelugu extends Model {
    static table = 'deities_telugu'
    static associations = {
        stotras_telugu: { type: 'has_many', foreignKey: 'deity_id' },
    } as const

    @field('deity_id') deityId!: string
    @field('name') name!: string
    @field('name_english') nameEnglish!: string
    @field('image') image!: string

    @children('stotras_telugu') stotras!: any
}
