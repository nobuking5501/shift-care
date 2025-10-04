// 共通シフトデータストレージ
// LocalStorageを使用してシフトデータを永続化

export interface StoredShift {
  id: string
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

const STORAGE_KEY = 'shiftcare_generated_shifts'
const STORAGE_VERSION = '1.0'

// シフトデータをLocalStorageに保存
export const saveGeneratedShifts = (shifts: StoredShift[], targetMonth: string): void => {
  try {
    const existingData = getStoredShiftsData()

    // 対象月の既存データを削除
    const filteredData = existingData.filter(shift => shift.target_month !== targetMonth)

    // 新しいシフトデータを追加
    const updatedData = [...filteredData, ...shifts]

    const storageData = {
      version: STORAGE_VERSION,
      lastUpdated: new Date().toISOString(),
      shifts: updatedData
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData))
    console.log(`シフトデータを保存しました: ${shifts.length}件 (${targetMonth})`)
  } catch (error) {
    console.error('シフトデータの保存に失敗しました:', error)
  }
}

// シフトデータをLocalStorageから取得
export const getGeneratedShifts = (targetMonth?: string): StoredShift[] => {
  try {
    const shifts = getStoredShiftsData()

    if (targetMonth) {
      return shifts.filter(shift => shift.target_month === targetMonth)
    }

    return shifts
  } catch (error) {
    console.error('シフトデータの取得に失敗しました:', error)
    return []
  }
}

// 内部用：ストレージからすべてのシフトデータを取得
const getStoredShiftsData = (): StoredShift[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []

    const parsedData = JSON.parse(data)

    // バージョンチェック
    if (parsedData.version !== STORAGE_VERSION) {
      console.log('ストレージバージョンが異なります。データをクリアします。')
      clearAllShifts()
      return []
    }

    return parsedData.shifts || []
  } catch (error) {
    console.error('シフトデータの読み込みに失敗しました:', error)
    return []
  }
}

// 特定月のシフトデータをクリア
export const clearShiftsForMonth = (targetMonth: string): void => {
  try {
    const existingData = getStoredShiftsData()
    const filteredData = existingData.filter(shift => shift.target_month !== targetMonth)

    const storageData = {
      version: STORAGE_VERSION,
      lastUpdated: new Date().toISOString(),
      shifts: filteredData
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData))
    console.log(`${targetMonth}のシフトデータをクリアしました`)
  } catch (error) {
    console.error('シフトデータのクリアに失敗しました:', error)
  }
}

// すべてのシフトデータをクリア（デモ用）
export const clearAllShifts = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('すべてのシフトデータをクリアしました')
  } catch (error) {
    console.error('シフトデータの全クリアに失敗しました:', error)
  }
}

// シフト統計を取得
export const getShiftStats = (targetMonth?: string) => {
  const shifts = getGeneratedShifts(targetMonth)

  return {
    totalShifts: shifts.length,
    confirmedShifts: shifts.filter(s => s.is_confirmed).length,
    staffCount: new Set(shifts.map(s => s.user_id)).size,
    shiftTypes: {
      early: shifts.filter(s => s.shift_type === 'early').length,
      day: shifts.filter(s => s.shift_type === 'day').length,
      late: shifts.filter(s => s.shift_type === 'late').length,
      night: shifts.filter(s => s.shift_type === 'night').length,
    }
  }
}

// スタッフ別のシフト数を取得
export const getStaffShiftCounts = (targetMonth?: string) => {
  const shifts = getGeneratedShifts(targetMonth)
  const staffCounts: Record<string, number> = {}

  shifts.forEach(shift => {
    const key = shift.staff_name || shift.user_id
    staffCounts[key] = (staffCounts[key] || 0) + 1
  })

  return staffCounts
}

// データが存在するかチェック
export const hasShiftData = (targetMonth?: string): boolean => {
  return getGeneratedShifts(targetMonth).length > 0
}

// 最終更新日時を取得
export const getLastUpdated = (): string | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return null

    const parsedData = JSON.parse(data)
    return parsedData.lastUpdated || null
  } catch (error) {
    return null
  }
}