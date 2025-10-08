'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange, getCurrentDemoUser } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import { useHolidayRequests } from '@/lib/hooks/useHolidayRequests'
import { useGeneratedShifts } from '@/lib/hooks/useGeneratedShifts'
import { useStaff } from '@/lib/hooks/useStaff'
import RealtimeNotifications from '@/components/notifications/RealtimeNotifications'
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  FileText,
  CheckCircle,
  Clock4,
  XCircle,
  Plus,
  Trash2
} from 'lucide-react'

export default function StaffShiftsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('shifts') // 'shifts' or 'requests'
  const router = useRouter()

  // 📅 管理ページと完全同期: 統一された日付計算ロジック（来月ベース）
  const baseDate = new Date()
  const nextMonthDate = new Date(baseDate)
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1)
  const targetYear = nextMonthDate.getFullYear()
  const targetMonthNum = nextMonthDate.getMonth() + 1
  const targetMonth = `${targetYear}-${targetMonthNum.toString().padStart(2, '0')}`

  // カレンダー表示用も同じ日付を使用
  const [currentDate, setCurrentDate] = useState(new Date(targetYear, targetMonthNum - 1, 1))

  console.log('🔄 スタッフページ同期確認:', {
    今日: new Date().toLocaleDateString('ja-JP'),
    対象月: `${targetYear}年${targetMonthNum}月`,
    targetMonth,
    管理ページとの同期: '✅'
  })

  // Use the EXACT same hooks as admin page for data consistency
  const { requests: holidayRequests, loading: requestsLoading, deleteRequest } = useHolidayRequests(targetMonth)
  const { shifts: generatedShifts, loading: shiftsLoading, error: shiftsError, forceRefresh } = useGeneratedShifts(targetMonth)

  // 🎯 管理者ページからの自動生成完了通知を監視（無限ループ防止版）
  useEffect(() => {
    let refreshTimeout: NodeJS.Timeout | null = null
    let isRefreshing = false

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'shiftGenerationCompleted' && !isRefreshing) {
        const notification = JSON.parse(e.newValue || '{}')
        if (notification.targetMonth === targetMonth) {
          console.log('🔄 管理者ページから自動生成完了通知を受信:', notification)
          isRefreshing = true

          // 単発リフレッシュのみ（重複防止）
          forceRefresh()

          // 3秒後にリフレッシュ許可をリセット
          refreshTimeout = setTimeout(() => {
            isRefreshing = false
          }, 3000)
        }
      }
    }

    // LocalStorage変更を監視
    window.addEventListener('storage', handleStorageChange)

    // 初期チェック（同一タブでの変更検出） - 1回のみ実行
    const checkInitialNotification = () => {
      const stored = localStorage.getItem('shiftGenerationCompleted')
      if (stored && !isRefreshing) {
        try {
          const notification = JSON.parse(stored)
          // 1分以内の通知のみ有効（5分→1分に短縮）
          if (Date.now() - notification.timestamp < 60000 &&
              notification.targetMonth === targetMonth) {
            console.log('🔄 初期同期通知を検出:', notification)
            isRefreshing = true
            forceRefresh()
            // LocalStorageから削除して重複実行を防止
            localStorage.removeItem('shiftGenerationCompleted')
          }
        } catch (error) {
          console.warn('LocalStorage通知の解析エラー:', error)
        }
      }
    }

    // 初期チェックを1回だけ実行
    checkInitialNotification()

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      if (refreshTimeout) {
        clearTimeout(refreshTimeout)
      }
    }
  }, [targetMonth]) // forceRefreshを依存配列から削除

  // 🚨 スタッフページシステム診断ログ
  useEffect(() => {
    console.log('🚨 ===== スタッフページ診断レポート =====', {
      現在時刻: new Date().toLocaleString('ja-JP'),
      対象月: targetMonth,
      年月詳細: {
        年: targetYear,
        月: targetMonthNum,
        表示: `${targetYear}年${targetMonthNum}月`
      },
      Supabaseデータ: {
        シフト数: generatedShifts.length,
        休日希望数: holidayRequests.length,
        シフト読込中: shiftsLoading,
        休日希望読込中: requestsLoading,
        エラー: shiftsError || 'なし'
      },
      認証情報: {
        ユーザーID: safeUser?.id,
        ユーザー名: safeUser?.displayName,
        役割: safeUser?.role
      },
      フィルタ結果: {
        全シフト数: generatedShifts.length
      }
    })
  }, [targetMonth, generatedShifts.length, holidayRequests.length, shiftsLoading, requestsLoading])

  const { staff, getStaffById } = useStaff()

  // ユーザー認証
  useEffect(() => {
    const unsubscribe = onAuthStateChange((authUser) => {
      if (authUser) {
        setUser(authUser)
      } else {
        router.push('/')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  // 安全にユーザー情報を取得
  const safeUser = user || getCurrentDemoUser()

  // Use Supabase ONLY for consistency with admin page
  const allShifts = generatedShifts

  // Filter shifts for current staff user with enhanced matching (デバッグログ削減版)
  const userShifts = allShifts.filter((shift: any) => {
    // Enhanced matching using multiple strategies
    const shiftUserId = shift.user_id || shift.userId
    const shiftStaffName = shift.staff_name || shift.staffName

    // Strategy 1: Direct ID match
    const idMatch = shiftUserId === safeUser?.id || shiftUserId === safeUser?.uid

    // Strategy 2: Name match
    const nameMatch = shiftStaffName === safeUser?.name ||
                     shiftStaffName === safeUser?.displayName

    // Strategy 3: Special case for 山田花子（ケアマネジャー）
    const specialMatch = (safeUser?.displayName === '山田花子（ケアマネジャー）' ||
                         safeUser?.name === '山田花子（ケアマネジャー）') &&
                        shiftUserId === '3'

    const result = idMatch || nameMatch || specialMatch

    // デバッグログは結果がtrueの場合のみ出力（ログ量削減）
    if (result) {
      console.log('✓ シフト一致:', {
        shiftId: shift.shift_id,
        staffName: shiftStaffName,
        userId: shiftUserId,
        matchType: idMatch ? 'ID' : nameMatch ? 'Name' : 'Special'
      })
    }

    return result
  })

  // Transform generated shifts to match expected format (handle both formats)
  const shifts = userShifts.map((shift: any) => ({
    date: shift.date,
    shiftType: shift.shift_type || shift.shiftType || 'day',
    startTime: shift.start_time || shift.startTime || '08:30',
    endTime: shift.end_time || shift.endTime || '17:30',
    location: '相談支援室', // Default location
    notes: '自動生成シフト',
    staffName: shift.staff_name || shift.staffName
  }))

  // シフト種別の表示テキスト
  const getShiftTypeText = (type: string) => {
    switch (type) {
      case 'early':
        return '早番'
      case 'day':
        return '日勤'
      case 'late':
        return '遅番'
      case 'night':
        return '夜勤'
      case 'off':
        return '公休'
      default:
        return '不明'
    }
  }

  // シフト種別の色
  const getShiftTypeColor = (type: string) => {
    switch (type) {
      case 'early':
        return 'bg-blue-100 text-blue-800'
      case 'day':
        return 'bg-green-100 text-green-800'
      case 'late':
        return 'bg-orange-100 text-orange-800'
      case 'night':
        return 'bg-purple-100 text-purple-800'
      case 'off':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 月の移動 (targetMonthと同期)
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  // カレンダーの日付生成（タイムゾーン安全版）
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const currentDateObj = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      // 📅 タイムゾーン安全な日付文字列生成
      const year = currentDateObj.getFullYear()
      const month = (currentDateObj.getMonth() + 1).toString().padStart(2, '0')
      const day = currentDateObj.getDate().toString().padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`

      const shift = shifts.find(s => s.date === dateStr)
      const isCurrentMonth = currentDateObj.getMonth() === currentDate.getMonth()

      // 今日の判定もタイムゾーン安全に
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
      const isToday = dateStr === todayStr

      days.push({
        date: new Date(currentDateObj),
        dateStr,
        shift,
        isCurrentMonth,
        isToday
      })

      currentDateObj.setDate(currentDateObj.getDate() + 1)
    }

    return days
  }

  const calendarDays = generateCalendarDays()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!safeUser) {
    return null
  }

  // 自分の休日希望をフィルタリング
  const myHolidayRequests = holidayRequests.filter(req =>
    req.staff_user_id === safeUser.id ||
    req.staff_user_id === safeUser.uid ||
    req.staff_user_id === 'demo-staff'
  )

  // 休日希望を削除する処理
  const handleDeleteRequest = async (requestId: string, targetMonth: string) => {
    if (!confirm('この休日希望を削除してもよろしいですか？\n\n削除すると元に戻すことはできません。')) {
      return
    }

    try {
      await deleteRequest(requestId)
      alert(`${targetMonth}の休日希望を削除しました`)
    } catch (error) {
      console.error('Error deleting holiday request:', error)
      alert('削除中にエラーが発生しました。もう一度お試しください。')
    }
  }

  // 審査中の休日希望を全て削除する処理
  const handleDeleteAllPendingRequests = async () => {
    const pendingRequests = myHolidayRequests.filter(req => req.status === 'pending')

    if (pendingRequests.length === 0) {
      alert('削除可能な休日希望がありません')
      return
    }

    if (!confirm(`審査中の休日希望${pendingRequests.length}件を全て削除してもよろしいですか？\n\n削除すると元に戻すことはできません。`)) {
      return
    }

    try {
      // 順次削除
      for (const request of pendingRequests) {
        await deleteRequest(request.id)
      }
      alert(`${pendingRequests.length}件の休日希望を削除しました`)
    } catch (error) {
      console.error('Error deleting holiday requests:', error)
      alert('削除中にエラーが発生しました。一部の希望は削除されている可能性があります。')
    }
  }

  // 管理者が直接アクセスした場合の処理
  if (safeUser.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-4">
          <div className="text-gray-600 mb-4">
            このページはスタッフ専用です
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            管理者ダッシュボードに戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        <Navbar userRole="staff" />
        {/* リアルタイム通知 */}
        <div className="absolute top-4 right-4 z-50">
          <RealtimeNotifications
            userId={safeUser.id}
            userRole={safeUser.role || 'staff'}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/staff-dashboard')}
                className="mr-3 p-2 text-gray-600 hover:text-gray-900 btn-touch"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  シフト確認
                </h1>
                <p className="text-gray-600">
                  自分のシフト予定を確認できます
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/shift-request')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center btn-touch"
            >
              <Calendar className="w-4 h-4 mr-2" />
              シフト希望提出
            </button>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('shifts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'shifts'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  シフト予定
                </div>
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  休日希望状況
                  {myHolidayRequests.length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {myHolidayRequests.length}
                    </span>
                  )}
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'shifts' ? (
          <div>
            <div className="bg-white rounded-lg shadow-sm">
              {/* カレンダーヘッダー */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg btn-touch"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date(targetYear, targetMonthNum - 1, 1))}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg btn-touch"
                    >
                      今月
                    </button>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg btn-touch"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* カレンダー */}
              <div className="p-6">
                {/* 曜日ヘッダー */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                    <div key={day} className={`p-2 text-center text-sm font-medium ${
                      index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* カレンダーグリッド */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => (
                    <div
                      key={index}
                      className={`min-h-24 p-1 border rounded-lg ${
                        day.isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
                      } ${day.isToday ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${day.isToday ? 'text-blue-600' : ''}`}>
                        {day.date.getDate()}
                      </div>

                      {day.shift && day.isCurrentMonth && (
                        <div className="space-y-1">
                          <div className={`text-xs px-2 py-1 rounded ${getShiftTypeColor(day.shift.shiftType)}`}>
                            {getShiftTypeText(day.shift.shiftType)}
                          </div>
                          {day.shift.startTime && (
                            <div className="text-xs text-gray-600 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {day.shift.startTime}
                            </div>
                          )}
                          {day.shift.location && (
                            <div className="text-xs text-gray-600 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {day.shift.location.split(' ')[1]}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* シフト詳細リスト */}
            <div className="mt-6 bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">来月のシフト詳細</h3>
                <p className="text-sm text-gray-600 mt-1">対象月: {targetYear}年{targetMonthNum}月</p>
              </div>
              <div className="divide-y divide-gray-200">
                {shiftsLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">読み込み中...</p>
                  </div>
                ) : shifts.length === 0 ? (
                  <div className="p-6 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">シフトデータがありません</h4>
                    <p className="text-gray-600 mb-4">まだ{targetYear}年{targetMonthNum}月（来月）のシフトが生成されていません</p>
                  </div>
                ) : (
                  shifts.slice(0, 10).map((shift, index) => (
                    <div key={index} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="font-medium text-gray-900">
                              {new Date(shift.date).toLocaleDateString('ja-JP', {
                                month: 'long',
                                day: 'numeric',
                                weekday: 'short'
                              })}
                            </span>
                            <span className={`ml-3 px-2 py-1 text-xs rounded ${getShiftTypeColor(shift.shiftType)}`}>
                              {getShiftTypeText(shift.shiftType)}
                            </span>
                          </div>

                          {shift.startTime && (
                            <div className="flex items-center mb-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-2" />
                              {shift.startTime} - {shift.endTime}
                            </div>
                          )}

                          {shift.location && (
                            <div className="flex items-center mb-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              {shift.location}
                            </div>
                          )}

                          {shift.notes && (
                            <div className="flex items-start text-sm text-gray-600">
                              <Users className="w-4 h-4 mr-2 mt-0.5" />
                              {shift.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 凡例 */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-3">シフト種別（相談支援施設）</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { type: 'early', label: '早番', time: '07:30-16:30' },
                  { type: 'day', label: '日勤', time: '08:30-17:30' },
                  { type: 'late', label: '遅番', time: '10:00-19:00' },
                  { type: 'off', label: '公休', time: '土日・祝日' },
                ].map((item) => (
                  <div key={item.type} className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${getShiftTypeColor(item.type)}`}>
                      {item.label}
                    </span>
                    <span className="text-xs text-blue-700">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 休日希望状況 */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">提出済み休日希望</h3>
                    <p className="text-sm text-gray-600 mt-1">あなたが提出した休日希望の一覧です</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* 一括削除ボタン - 審査中の希望がある場合のみ表示 */}
                    {myHolidayRequests.filter(req => req.status === 'pending').length > 1 && (
                      <button
                        onClick={handleDeleteAllPendingRequests}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center btn-touch"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        審査中を全削除
                      </button>
                    )}
                    <button
                      onClick={() => router.push('/shift-request')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center btn-touch"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      新しい希望を提出
                    </button>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {requestsLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">読み込み中...</p>
                  </div>
                ) : myHolidayRequests.length === 0 ? (
                  <div className="p-6 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">休日希望がありません</h4>
                    <p className="text-gray-600 mb-4">まだ休日希望を提出していません</p>
                    <button
                      onClick={() => router.push('/shift-request')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg btn-touch"
                    >
                      休日希望を提出する
                    </button>
                  </div>
                ) : (
                  myHolidayRequests.map((request) => (
                    <div key={request.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <h4 className="text-lg font-medium text-gray-900">
                              {(() => {
                                const [year, month] = request.target_month.split('-').map(Number)
                                return `${year}年${month}月の休日希望`
                              })()}
                            </h4>
                            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status === 'pending' && (
                                <><Clock4 className="w-3 h-3 mr-1" />審査中</>
                              )}
                              {request.status === 'approved' && (
                                <><CheckCircle className="w-3 h-3 mr-1" />承認済み</>
                              )}
                              {request.status === 'rejected' && (
                                <><XCircle className="w-3 h-3 mr-1" />却下</>
                              )}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">希望休日</p>
                              <div className="flex flex-wrap gap-2">
                                {request.requested_dates && request.requested_dates.map((date: string, index: number) => (
                                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                                    {(() => {
                                      const [year, month, day] = date.split('-').map(Number)
                                      const localDate = new Date(year, month - 1, day)
                                      return localDate.toLocaleDateString('ja-JP', {
                                        month: 'short',
                                        day: 'numeric',
                                        weekday: 'short'
                                      })
                                    })()}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {request.reason && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">理由</p>
                                <p className="text-sm text-gray-600">{request.reason}</p>
                              </div>
                            )}

                            {request.priority && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">希望の強さ</p>
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                  request.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {request.priority === 'high' ? '強く希望' :
                                   request.priority === 'medium' ? '希望' : '可能なら'}
                                </span>
                              </div>
                            )}

                            <div className="text-xs text-gray-500">
                              提出日: {new Date(request.submitted_at).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>

                        {/* 削除ボタン - pending状態の時のみ表示 */}
                        {request.status === 'pending' && (
                          <div className="ml-4">
                            <button
                              onClick={() => {
                                const [year, month] = request.target_month.split('-').map(Number)
                                const monthText = `${year}年${month}月`
                                handleDeleteRequest(request.id, monthText)
                              }}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg btn-touch transition-colors"
                              title="この休日希望を削除"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ヘルプセクション */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-sm font-medium text-blue-900 mb-3">休日希望について</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p>• 休日希望は原則として月単位で受け付けています</p>
                <p>• 提出された希望は管理者が確認し、可能な限り配慮してシフト作成を行います</p>
                <p>• <strong>審査中（pending）</strong>の希望は削除できます（🗑️ボタンをクリック）</p>
                <p>• 承認済み・却下済みの希望は削除できません</p>
                <p>• 緊急の場合は直接管理者にご相談ください</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}