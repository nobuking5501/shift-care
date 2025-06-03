/**
 * シフト管理のバリデーションとビジネスロジック
 */

import { demoUsers } from './demo-data'

export interface ShiftValidationRule {
  type: 'error' | 'warning'
  message: string
  code: string
}

export interface ShiftValidationResult {
  isValid: boolean
  rules: ShiftValidationRule[]
}

export interface ShiftConflictCheck {
  hasConflict: boolean
  conflictingShifts: any[]
  message?: string
}

/**
 * シフト重複チェック
 */
export function checkShiftConflicts(
  staffId: string, 
  date: string, 
  startTime: string, 
  endTime: string,
  excludeShiftId?: string,
  existingShifts: any[] = []
): ShiftConflictCheck {
  const conflictingShifts = existingShifts.filter(shift => {
    // 自分自身は除外
    if (excludeShiftId && shift.id === excludeShiftId) {
      return false
    }
    
    // 同じスタッフの同じ日付をチェック
    if (shift.extendedProps.staffId === staffId && shift.date === date) {
      const existingStart = shift.extendedProps.startTime
      const existingEnd = shift.extendedProps.endTime
      
      // 時間の重複チェック
      return timeRangesOverlap(startTime, endTime, existingStart, existingEnd)
    }
    
    return false
  })

  return {
    hasConflict: conflictingShifts.length > 0,
    conflictingShifts,
    message: conflictingShifts.length > 0 
      ? `${conflictingShifts[0].extendedProps.staffName}は同じ時間帯に既にシフトが入っています`
      : undefined
  }
}

/**
 * 時間範囲の重複チェック
 */
function timeRangesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const parseTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const start1Minutes = parseTime(start1)
  const end1Minutes = parseTime(end1)
  const start2Minutes = parseTime(start2)
  const end2Minutes = parseTime(end2)

  // 夜勤の場合の日をまたぐケース処理
  const adjustForOvernight = (start: number, end: number) => {
    if (end < start) {
      return { start, end: end + 24 * 60 }
    }
    return { start, end }
  }

  const range1 = adjustForOvernight(start1Minutes, end1Minutes)
  const range2 = adjustForOvernight(start2Minutes, end2Minutes)

  return range1.start < range2.end && range2.start < range1.end
}

/**
 * スタッフのシフト適性チェック
 */
export function validateStaffEligibility(
  staffId: string, 
  shiftType: string,
  date: string
): ShiftValidationResult {
  const staff = demoUsers.find(u => u.id === staffId)
  const rules: ShiftValidationRule[] = []

  if (!staff) {
    return {
      isValid: false,
      rules: [{ 
        type: 'error', 
        message: 'スタッフが見つかりません', 
        code: 'STAFF_NOT_FOUND' 
      }]
    }
  }

  // 夜勤適性チェック
  if (shiftType === 'night' && !staff.nightShiftOK) {
    rules.push({
      type: 'error',
      message: `${staff.name}は夜勤対応不可のため、夜勤シフトに配置できません`,
      code: 'NIGHT_SHIFT_NOT_ALLOWED'
    })
  }

  // パートタイム職員の勤務時間チェック
  if (staff.employmentType === 'partTime') {
    if (shiftType === 'night') {
      rules.push({
        type: 'warning',
        message: `${staff.name}はパートタイム職員です。夜勤配置には特別な配慮が必要です`,
        code: 'PART_TIME_NIGHT_WARNING'
      })
    }
    
    if (shiftType === 'early' || shiftType === 'late') {
      rules.push({
        type: 'warning',
        message: `${staff.name}はパートタイム職員です。通常勤務時間外の配置です`,
        code: 'PART_TIME_EXTENDED_WARNING'
      })
    }
  }

  // 週末勤務チェック（土日）
  const dayOfWeek = new Date(date).getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    if (staff.employmentType === 'partTime') {
      rules.push({
        type: 'warning',
        message: `週末勤務: ${staff.name}はパートタイム職員です`,
        code: 'WEEKEND_PART_TIME_WARNING'
      })
    }
  }

  return {
    isValid: !rules.some(rule => rule.type === 'error'),
    rules
  }
}

/**
 * シフト時間の妥当性チェック
 */
export function validateShiftTiming(
  startTime: string, 
  endTime: string, 
  shiftType: string
): ShiftValidationResult {
  const rules: ShiftValidationRule[] = []

  // 基本的な時間検証
  if (!startTime || !endTime) {
    rules.push({
      type: 'error',
      message: '開始時間と終了時間は必須です',
      code: 'TIME_REQUIRED'
    })
    return { isValid: false, rules }
  }

  const parseTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const startMinutes = parseTime(startTime)
  const endMinutes = parseTime(endTime)

  // 夜勤以外で終了時間が開始時間より早い場合
  if (shiftType !== 'night' && endMinutes <= startMinutes) {
    rules.push({
      type: 'error',
      message: '終了時間は開始時間より後である必要があります',
      code: 'INVALID_TIME_RANGE'
    })
  }

  // 夜勤の場合の特別チェック
  if (shiftType === 'night' && endMinutes > startMinutes) {
    rules.push({
      type: 'warning',
      message: '夜勤は通常、日をまたぐシフトです。時間設定を確認してください',
      code: 'NIGHT_SHIFT_TIME_WARNING'
    })
  }

  // シフト時間の長さチェック
  const durationMinutes = shiftType === 'night' && endMinutes < startMinutes
    ? (24 * 60 - startMinutes) + endMinutes
    : endMinutes - startMinutes

  if (durationMinutes < 4 * 60) { // 4時間未満
    rules.push({
      type: 'warning',
      message: 'シフト時間が4時間未満です。適切な勤務時間か確認してください',
      code: 'SHORT_SHIFT_WARNING'
    })
  }

  if (durationMinutes > 12 * 60) { // 12時間超過
    rules.push({
      type: 'warning',
      message: 'シフト時間が12時間を超えています。労働基準法への配慮が必要です',
      code: 'LONG_SHIFT_WARNING'
    })
  }

  return {
    isValid: !rules.some(rule => rule.type === 'error'),
    rules
  }
}

/**
 * 総合的なシフト妥当性チェック
 */
export function validateShift(
  staffId: string,
  date: string,
  startTime: string,
  endTime: string,
  shiftType: string,
  existingShifts: any[] = [],
  excludeShiftId?: string
): ShiftValidationResult {
  const allRules: ShiftValidationRule[] = []

  // スタッフ適性チェック
  const staffValidation = validateStaffEligibility(staffId, shiftType, date)
  allRules.push(...staffValidation.rules)

  // 時間妥当性チェック
  const timeValidation = validateShiftTiming(startTime, endTime, shiftType)
  allRules.push(...timeValidation.rules)

  // 重複チェック
  const conflictCheck = checkShiftConflicts(staffId, date, startTime, endTime, excludeShiftId, existingShifts)
  if (conflictCheck.hasConflict) {
    allRules.push({
      type: 'error',
      message: conflictCheck.message || 'シフトが重複しています',
      code: 'SHIFT_CONFLICT'
    })
  }

  return {
    isValid: !allRules.some(rule => rule.type === 'error'),
    rules: allRules
  }
}

/**
 * 管理者権限チェック
 */
export function hasAdminPermission(userRole: string): boolean {
  return userRole === 'admin'
}

/**
 * シフト編集権限チェック
 */
export function canEditShift(userRole: string, userId: string, shiftUserId: string): boolean {
  // 管理者は全てのシフトを編集可能
  if (userRole === 'admin') {
    return true
  }
  
  // 一般スタッフは自分のシフトのみ編集可能（ただし確定前のみ）
  return userId === shiftUserId
}

/**
 * シフト削除権限チェック
 */
export function canDeleteShift(userRole: string, userId: string, shiftUserId: string): boolean {
  // 削除は管理者のみ
  return userRole === 'admin'
}