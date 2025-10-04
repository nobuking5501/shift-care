// 🚨 システム診断テスト

console.log('=== 日付計算テスト ===')

// 管理ページの日付計算ロジック (修正版)
const adminCurrentDate = new Date()
const adminNextMonthDate = new Date(adminCurrentDate)
adminNextMonthDate.setMonth(adminNextMonthDate.getMonth() + 1)
const adminCurrentYear = adminNextMonthDate.getFullYear()
const adminCurrentMonth = adminNextMonthDate.getMonth() + 1
const adminTargetMonth = `${adminCurrentYear}-${adminCurrentMonth.toString().padStart(2, '0')}`

// スタッフページの日付計算ロジック
const staffCurrentDateForTarget = new Date()
staffCurrentDateForTarget.setMonth(staffCurrentDateForTarget.getMonth() + 1)
const staffTargetYear = staffCurrentDateForTarget.getFullYear()
const staffTargetMonthNum = staffCurrentDateForTarget.getMonth() + 1
const staffTargetMonth = `${staffTargetYear}-${staffTargetMonthNum.toString().padStart(2, '0')}`

console.log('管理ページ計算:', {
  現在日時: new Date().toLocaleString('ja-JP'),
  対象年: adminCurrentYear,
  対象月: adminCurrentMonth,
  targetMonth: adminTargetMonth
})

console.log('スタッフページ計算:', {
  現在日時: new Date().toLocaleString('ja-JP'),
  対象年: staffTargetYear,
  対象月: staffTargetMonthNum,
  targetMonth: staffTargetMonth
})

console.log('同期確認:', {
  同一判定: adminTargetMonth === staffTargetMonth,
  管理側: adminTargetMonth,
  スタッフ側: staffTargetMonth
})

// 週5日勤務計算テスト
console.log('\n=== 週5日勤務テスト ===')

const daysInMonth = 30 // 仮定
const workingDaysInMonth = Math.floor(daysInMonth * (5/7)) // 平日のみ
const staffCount = 3
const expectedWorkDaysPerStaff = Math.floor(workingDaysInMonth / staffCount * 5)

console.log('勤務計算:', {
  月の日数: daysInMonth,
  営業日数: workingDaysInMonth,
  スタッフ数: staffCount,
  スタッフ1人あたり期待勤務日数: expectedWorkDaysPerStaff,
  週5日達成可能性: expectedWorkDaysPerStaff >= 20 ? '可能' : '困難'
})