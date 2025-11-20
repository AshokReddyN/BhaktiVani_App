import { Model } from '@nozbe/watermelondb'
import { field, children } from '@nozbe/watermelondb/decorators'
import Stotra from './Stotra'

export default class Deity extends Model {
    static table = 'deities'
    static associations = {
        stotras: { type: 'has_many', foreignKey: 'deity_id' },
    } as const

    @field('name') name!: string
    @field('image') image!: string

    @children('stotras') stotras!: any // Type inference issue with decorators sometimes
}
