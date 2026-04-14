import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

/**
 * Database connection pool singleton.
 *
 * Why a pool?
 * - Reuses connections across requests (performance)
 * - Handles connection lifecycle automatically
 * - Prevents connection exhaustion under load
 *
 * The pool is created lazily on first use and cached in the module scope.
 */
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    // Validate required environment variable
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL environment variable is not set. " +
          "Please configure it in your .env file."
      );
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Reasonable defaults for a small-to-medium application
      max: 10, // Maximum connections in pool
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 5000, // Fail fast if can't connect in 5s
    });

    // Log connection errors but don't crash - let individual queries handle errors
    pool.on("error", (err) => {
      console.error("Unexpected database pool error:", err);
    });
  }

  return pool;
}

/**
 * Execute a parameterized query safely.
 *
 * @param text - SQL query with $1, $2, etc. placeholders
 * @param params - Values to substitute (automatically escaped)
 * @returns Query result with typed rows
 *
 * @example
 * const result = await query<Task>('SELECT * FROM tasks WHERE id = $1', [id]);
 * return result.rows[0];
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();

  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    // Log slow queries in development for debugging
    if (process.env.NODE_ENV === "development" && duration > 100) {
      console.log(`Slow query (${duration}ms):`, text);
    }

    return result;
  } catch (error) {
    // Re-throw with additional context for debugging
    console.error("Database query error:", { text, params, error });
    throw error;
  }
}

/**
 * Get a client from the pool for transaction support.
 *
 * IMPORTANT: Always release the client in a finally block!
 *
 * @example
 * const client = await getClient();
 * try {
 *   await client.query('BEGIN');
 *   // ... multiple queries
 *   await client.query('COMMIT');
 * } catch (e) {
 *   await client.query('ROLLBACK');
 *   throw e;
 * } finally {
 *   client.release();
 * }
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return pool.connect();
}

/**
 * Gracefully close the pool. Call this during shutdown.
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
