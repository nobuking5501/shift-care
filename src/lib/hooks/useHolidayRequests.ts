import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type ShiftRequest = Database['public']['Tables']['shift_requests']['Row']
type ShiftRequestInsert = Database['public']['Tables']['shift_requests']['Insert']
type ShiftRequestUpdate = Database['public']['Tables']['shift_requests']['Update']

export const useHolidayRequests = (targetMonth?: string) => {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('shift_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (targetMonth) {
        query = query.eq('target_month', targetMonth)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      // Transform data to match expected structure
      const transformedData = (data || []).map(item => {
        // Handle data from shift_requests table structure
        const requestedDates = item.wishes?.requestedDates || []
        const reason = item.reason || item.wishes?.reason || ''
        const priority = item.wishes?.priority || 'medium'

        return {
          id: item.id,
          staff_name: item.staff_name,
          staff_user_id: item.staff_id, // Map staff_id to staff_user_id for consistency
          requested_dates: requestedDates,
          reason: reason,
          priority: priority,
          status: item.status,
          target_month: item.target_month,
          submitted_at: item.created_at,
          created_at: item.created_at,
          updated_at: item.updated_at
        }
      })

      setRequests(transformedData)
      setError(null)
    } catch (err) {
      console.error('Error fetching holiday requests:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const createRequest = async (requestData: any) => {
    try {
      // Transform data to match shift_requests table structure
      const transformedData = {
        staff_id: requestData.staff_user_id,
        staff_name: requestData.staff_name,
        target_month: requestData.target_month,
        wishes: {
          requestedDates: requestData.requested_dates,
          reason: requestData.reason,
          priority: requestData.priority
        },
        reason: requestData.reason,
        status: 'pending'
      }

      const { data, error } = await supabase
        .from('shift_requests')
        .insert([transformedData])
        .select()
        .single()

      if (error) {
        throw error
      }

      // Refresh the list
      await fetchRequests()
      return data
    } catch (err) {
      console.error('Error creating holiday request:', err)
      throw err
    }
  }

  const updateRequest = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('shift_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Update local state
      await fetchRequests()

      return data
    } catch (err) {
      console.error('Error updating holiday request:', err)
      throw err
    }
  }

  const approveRequest = async (id: string) => {
    return updateRequest(id, { status: 'approved' })
  }

  const rejectRequest = async (id: string) => {
    return updateRequest(id, { status: 'rejected' })
  }

  const deleteRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shift_requests')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      // Remove from local state
      setRequests(prev => prev.filter(req => req.id !== id))
    } catch (err) {
      console.error('Error deleting holiday request:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchRequests()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('shift_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shift_requests',
          filter: targetMonth ? `target_month=eq.${targetMonth}` : undefined,
        },
        () => {
          fetchRequests()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [targetMonth])

  return {
    requests,
    loading,
    error,
    createRequest,
    updateRequest,
    approveRequest,
    rejectRequest,
    deleteRequest,
    refetch: fetchRequests
  }
}