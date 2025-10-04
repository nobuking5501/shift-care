import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { STAFF_DATA } from '@/lib/staff-data'

type Staff = Database['public']['Tables']['staff']['Row']
type StaffInsert = Database['public']['Tables']['staff']['Insert']
type StaffUpdate = Database['public']['Tables']['staff']['Update']

export const useStaff = () => {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStaff = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        // テーブルが存在しない場合は、共通データを返す
        if (error.message.includes('Could not find the table')) {
          console.log('staffテーブルが存在しません。共通スタッフデータを使用します。')
          const staffData: Staff[] = STAFF_DATA.map(staff => ({
            id: staff.id,
            name: staff.name,
            email: staff.email,
            role: staff.role,
            position: staff.role === 'admin' ? '施設長' : staff.qualifications[0] || '職員',
            department: staff.role === 'admin' ? '管理部' : '介護部',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: null
          }))
          setStaff(staffData)
          setError(null)
          return
        }
        throw error
      }

      setStaff(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching staff:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      // エラーの場合でも空配列を設定
      setStaff([])
    } finally {
      setLoading(false)
    }
  }

  const createStaff = async (staffData: StaffInsert) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .insert([staffData])
        .select()
        .single()

      if (error) {
        throw error
      }

      // Refresh the list
      await fetchStaff()
      return data
    } catch (err) {
      console.error('Error creating staff:', err)
      throw err
    }
  }

  const updateStaff = async (id: string, updates: StaffUpdate) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Update local state
      await fetchStaff()

      return data
    } catch (err) {
      console.error('Error updating staff:', err)
      throw err
    }
  }

  const deleteStaff = async (id: string) => {
    try {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('staff')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        throw error
      }

      // Remove from local state
      setStaff(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      console.error('Error deleting staff:', err)
      throw err
    }
  }

  const getStaffById = (id: string): Staff | undefined => {
    return staff.find(s => s.id === id)
  }

  const getStaffByName = (name: string): Staff | undefined => {
    return staff.find(s => s.name === name)
  }

  useEffect(() => {
    fetchStaff()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('staff_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'staff',
        },
        () => {
          fetchStaff()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return {
    staff,
    loading,
    error,
    createStaff,
    updateStaff,
    deleteStaff,
    getStaffById,
    getStaffByName,
    refetch: fetchStaff
  }
}