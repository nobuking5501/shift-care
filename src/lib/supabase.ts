import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Enhanced Supabase client with optimized settings
export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10, // Rate limiting for realtime events
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Utility functions for enhanced Supabase integration

// Set user role for RLS policies
export const setUserRole = async (role: 'staff' | 'admin') => {
  const { data, error } = await supabase.rpc('set_current_user_role', {
    user_role: role
  })
  if (error) {
    console.warn('Could not set user role:', error.message)
  }
  return { data, error }
}

// Enhanced query with automatic retry
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries) {
        throw lastError
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
    }
  }

  throw lastError!
}

// Optimized batch insert
export const batchInsert = async <T>(
  tableName: string,
  data: T[],
  batchSize: number = 100
) => {
  const results = []

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(batch)
      .select()

    if (error) {
      throw error
    }

    if (result) {
      results.push(...result)
    }
  }

  return results
}

// Cache management for performance
class SupabaseCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear() {
    this.cache.clear()
  }

  delete(key: string) {
    this.cache.delete(key)
  }
}

export const supabaseCache = new SupabaseCache()

// Enhanced select with caching
export const cachedSelect = async (
  tableName: string,
  select: string = '*',
  cacheKey: string,
  cacheTTL: number = 300000
) => {
  // Check cache first
  const cached = supabaseCache.get(cacheKey)
  if (cached) {
    return { data: cached, error: null, fromCache: true }
  }

  // Fetch from database
  const { data, error } = await supabase
    .from(tableName)
    .select(select)

  if (!error && data) {
    supabaseCache.set(cacheKey, data, cacheTTL)
  }

  return { data, error, fromCache: false }
}

export type Database = {
  public: {
    Tables: {
      shift_requests: {
        Row: {
          id: string
          staff_id: string
          staff_name: string
          target_month: string
          wishes: any
          reason: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          staff_id: string
          staff_name: string
          target_month: string
          wishes?: any
          reason?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          staff_id?: string
          staff_name?: string
          target_month?: string
          wishes?: any
          reason?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string | null
        }
      }
      generated_shifts: {
        Row: {
          id: number
          shift_id: string
          user_id: string
          staff_name: string
          date: string
          shift_type: string
          start_time: string
          end_time: string
          is_confirmed: boolean
          target_month: string
          generated_at: string
          created_at: string
        }
        Insert: {
          id?: number
          shift_id: string
          user_id: string
          staff_name: string
          date: string
          shift_type: string
          start_time: string
          end_time: string
          is_confirmed?: boolean
          target_month: string
          generated_at?: string
          created_at?: string
        }
        Update: {
          id?: number
          shift_id?: string
          user_id?: string
          staff_name?: string
          date?: string
          shift_type?: string
          start_time?: string
          end_time?: string
          is_confirmed?: boolean
          target_month?: string
          generated_at?: string
          created_at?: string
        }
      }
      staff: {
        Row: {
          id: string
          name: string
          email: string
          role: 'staff' | 'admin'
          position: string
          department: string
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          role?: 'staff' | 'admin'
          position: string
          department: string
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'staff' | 'admin'
          position?: string
          department?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}