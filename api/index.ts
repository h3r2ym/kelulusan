import 'dotenv/config'
import { initDB } from '../server/database.js'
import app from '../server/index.js'

// Initialize DB once per cold start; subsequent calls await the same promise
const ready = initDB()

export default async function handler(req: object, res: object) {
  await ready
  // Call Express app directly; it handles req/res and sends response
  app(req as any, res as any)
}
