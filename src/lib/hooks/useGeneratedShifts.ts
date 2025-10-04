import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type GeneratedShift = Database['public']['Tables']['generated_shifts']['Row']
type GeneratedShiftInsert = Database['public']['Tables']['generated_shifts']['Insert']

export const useGeneratedShifts = (targetMonth?: string) => {
  const [shifts, setShifts] = useState<GeneratedShift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchShifts = async () => {
    try {
      setLoading(true)

      // 🚨 Supabaseフック診断ログ
      console.log('🚨 ===== useGeneratedShifts診断 =====', {
        現在時刻: new Date().toLocaleString('ja-JP'),
        対象月: targetMonth,
        フェッチ開始: true
      })

      // Check current auth state
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('🔐 認証状態確認:', {
        ユーザーID: user?.id || 'anonymous',
        認証エラー: authError?.message || 'なし',
        認証成功: !!user
      })

      let query = supabase
        .from('generated_shifts')
        .select('*')
        .order('date', { ascending: true })

      if (targetMonth) {
        query = query.eq('target_month', targetMonth)
      }

      console.log('Supabaseクエリ実行中...', { targetMonth })
      const { data, error } = await query

      console.log('Supabaseクエリ結果:', {
        dataLength: data?.length || 0,
        sampleData: data?.length > 0 ? data[0] : 'no data',
        error: error ? {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        } : null
      })

      if (error) {
        // テーブルが存在しない場合は空配列を返す
        if (error.message.includes('Could not find the table') || error.code === '42P01') {
          console.error('🚨 generated_shiftsテーブルが存在しません!')
          console.error('📋 解決方法:')
          console.error('1. Supabaseダッシュボードに行く: https://supabase.com/dashboard')
          console.error('2. プロジェクトを選択')
          console.error('3. SQL Editorで supabase-setup.sql の内容を実行')
          console.error('4. 特に以下のテーブル作成部分を実行:')
          console.error('   CREATE TABLE generated_shifts (...)')
          setShifts([])
          setError('Table Not Found - Run supabase-setup.sql')
          return
        }
        // RLSポリシーエラーのチェック
        if (error.message.includes('Row Level Security') || error.code === 'PGRST116') {
          console.log('⚠️ RLSポリシーでアクセスが制限されています。デモモードで空データを返します。')
          setShifts([])
          setError('RLS Policy Restriction')
          return
        }
        throw error
      }

      console.log(`✓ Supabaseから${data?.length || 0}件のシフトデータを取得`)
      setShifts(data || [])
      setError(null)
    } catch (err) {
      console.error('=== Supabase Fetch Error ===', {
        error: err,
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        errorStack: err instanceof Error ? err.stack : null,
        timestamp: new Date().toISOString()
      })
      setError(err instanceof Error ? err.message : 'Unknown error')
      // エラーの場合でも空配列を設定
      setShifts([])
    } finally {
      console.log('フェッチ処理終了:', { loading: false })
      setLoading(false)
    }
  }

  const saveToSupabase = async (shiftsData: GeneratedShiftInsert[]) => {
    console.log('=== saveGeneratedShifts 開始 ===', {
      shiftsCount: shiftsData.length,
      targetMonth,
      sampleData: shiftsData[0]
    })

    try {
      // テーブルが存在しない場合は、ローカル状態のみ更新
      try {
        // First, delete existing shifts for the target month
        if (targetMonth) {
          console.log(`既存シフトを削除中 (${targetMonth})...`)
          const deleteResult = await supabase
            .from('generated_shifts')
            .delete()
            .eq('target_month', targetMonth)

          console.log('削除結果:', deleteResult.error || '成功')
        }

        // Then insert new shifts
        console.log('新しいシフトを挿入中...')
        const { data, error } = await supabase
          .from('generated_shifts')
          .insert(shiftsData)
          .select()

        console.log('挿入結果:', {
          insertedCount: data?.length || 0,
          error: error ? {
            message: error.message,
            code: error.code,
            details: error.details
          } : null
        })

        if (error) {
          throw error
        }

        // Refresh the list
        console.log('シフトリストを更新中...')
        await fetchShifts()
        console.log('✓ saveGeneratedShifts 成功')
        return data
      } catch (dbError: any) {
        // テーブルが存在しない場合は、ローカル状態のみ更新
        if (dbError.message?.includes('Could not find the table') || dbError.code === '42P01') {
          console.error('🚨 generated_shiftsテーブルが存在しません! シフト保存できません。')
          console.error('📋 Supabaseでテーブルを作成してください: supabase-setup.sql を実行')

          // Convert GeneratedShiftInsert to GeneratedShift format
          const mockShifts: GeneratedShift[] = shiftsData.map((shift, index) => ({
            id: index + 1,
            shift_id: shift.shift_id,
            user_id: shift.user_id,
            staff_name: shift.staff_name,
            date: shift.date,
            shift_type: shift.shift_type,
            start_time: shift.start_time,
            end_time: shift.end_time,
            is_confirmed: shift.is_confirmed || true,
            target_month: shift.target_month,
            generated_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          }))

          setShifts(mockShifts)
          return mockShifts
        }
        throw dbError
      }
    } catch (err) {
      console.error('Error saving generated shifts:', err)
      throw err
    }
  }

  const clearShifts = async (targetMonth: string) => {
    try {
      console.log('=== clearShifts開始 ===', { targetMonth })

      if (targetMonth && targetMonth.trim() !== '') {
        // 特定の月のシフトを削除
        const { error } = await supabase
          .from('generated_shifts')
          .delete()
          .eq('target_month', targetMonth)

        if (error) {
          throw error
        }

        console.log(`✓ ${targetMonth}の月次シフトを削除完了`)
        // Update local state
        setShifts(prev => prev.filter(shift => shift.target_month !== targetMonth))
      } else {
        // 全レコード削除：Supabaseでは直接的な全削除ができないため、
        // まず全データを取得してからIDベースで削除
        console.log('全シフト削除を開始...')

        const { data: allShifts, error: fetchError } = await supabase
          .from('generated_shifts')
          .select('id')

        if (fetchError) {
          console.error('全シフト取得エラー:', fetchError)
          throw fetchError
        }

        if (allShifts && allShifts.length > 0) {
          // バッチ削除：IDのリストで削除
          const ids = allShifts.map(shift => shift.id)
          const { error: deleteError } = await supabase
            .from('generated_shifts')
            .delete()
            .in('id', ids)

          if (deleteError) {
            console.error('バッチ削除エラー:', deleteError)
            throw deleteError
          }

          console.log(`✓ ${ids.length}件の全シフトを削除完了`)
        } else {
          console.log('削除対象のシフトがありません')
        }

        // Update local state
        setShifts([]) // Clear all shifts
      }
    } catch (err) {
      console.error('Error clearing shifts:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchShifts()

    // Subscribe to real-time changes only if table exists
    let channel: any = null
    try {
      channel = supabase
        .channel('generated_shifts_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'generated_shifts',
            filter: targetMonth ? `target_month=eq.${targetMonth}` : undefined,
          },
          () => {
            fetchShifts()
          }
        )
        .subscribe()
    } catch (error) {
      console.log('リアルタイム更新の購読に失敗しました:', error)
    }

    return () => {
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [targetMonth])

  return {
    shifts,
    loading,
    error,
    saveGeneratedShifts: async (shiftsData: GeneratedShiftInsert[]) => {
      try {
        const result = await saveToSupabase(shiftsData)
        // 🎯 保存後即座にデータを更新してコンポーネントに反映
        console.log('=== 保存後の即座更新 ===')
        setTimeout(() => {
          fetchShifts()
        }, 100)
        return result
      } catch (error) {
        console.error('saveGeneratedShifts wrapper error:', error)
        throw error
      }
    },
    clearShifts,
    refetch: fetchShifts,
    forceRefresh: () => {
      console.log('=== Force Refresh Triggered ===')
      setLoading(true)
      fetchShifts()
    }
  }
}