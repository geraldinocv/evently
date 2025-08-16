import { neon } from "@neondatabase/serverless"

let sql: ReturnType<typeof neon> | null = null

function getConnection() {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      console.warn("DATABASE_URL environment variable is not set - using fallback data")
      return null
    }

    sql = neon(databaseUrl)
  }

  return sql
}

export { getConnection as sql }

// Helper functions for common queries
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  try {
    const connection = getConnection()
    if (!connection) {
      throw new Error("Database connection not available")
    }
    const result = await connection(query, params)
    return result as T[]
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export async function executeQuerySingle<T = any>(query: string, params: any[] = []): Promise<T | null> {
  const result = await executeQuery<T>(query, params)
  return result[0] || null
}
