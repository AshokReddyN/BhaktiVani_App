import { Database } from '@nozbe/watermelondb'

export type SeedFunction = (database: Database) => Promise<void>
