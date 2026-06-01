import 'dotenv/config'
import { initDB } from '../server/database.js'
import app from '../server/index.js'

// Initialize DB once per cold start; subsequent calls await the same promise
const ready = initDB()

export default async function handler(req: object, res: object) {
  await ready
  return (app as (req: object, res: object) => void)(req, res)
}
