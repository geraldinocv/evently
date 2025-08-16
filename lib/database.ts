import { createClient } from "@supabase/supabase-js"

let supabaseClient: ReturnType<typeof createClient> | null = null

function getConnection() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn("Supabase environment variables are not set - using fallback data")
      return null
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey)
  }

  return supabaseClient
}

export { getConnection }
export const sql = async (query: string, params: any[] = []) => {
  const client = getConnection()
  if (!client) {
    return null
  }

  // Convert PostgreSQL parameterized query to Supabase format
  let supabaseQuery = query
  params.forEach((param, index) => {
    supabaseQuery = supabaseQuery.replace(`$${index + 1}`, `'${param}'`)
  })

  const { data, error } = await client.rpc("execute_sql", { query: supabaseQuery })

  if (error) {
    throw error
  }

  return data
}

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
