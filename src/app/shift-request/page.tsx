'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange, getCurrentDemoUser } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import { ShiftWishEntry } from '@/types'
import { useHolidayRequests } from '@/lib/hooks/useHolidayRequests'
import {
  Calendar,
  Save,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Users
} from 'lucide-react'

export default function ShiftRequestPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [targetMonth, setTargetMonth] = useState(new Date())
  const router = useRouter()

  // シフト希望データ
  const [wishes, setWishes] = useState<Record<string, ShiftWishEntry>>({})
  const [globalReason, setGlobalReason] = useState('')

  // Supabase hooks
  const { createRequest } = useHolidayRequests()

  // ユーザー認証
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setUser(user)
      } else {
        router.push('/')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  // 初期値設定（来月）
  useEffect(() => {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    setTargetMonth(nextMonth)
  }, [])

  // 休日種別の表示テキスト
  const getHolidayTypeText = (type: string) => {
    switch (type) {
      case 'off':
        return '休日希望'
      case 'none':
        return '希望なし'
      default:
        return '未設定'
    }
  }

  // 休日種別の色
  const getHolidayTypeColor = (type: string) => {
    switch (type) {
      case 'off':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'none':
        return 'bg-gray-50 text-gray-500 border-gray-200'
      default:
        return 'bg-gray-50 text-gray-500 border-gray-200'
    }
  }

  // 優先度の色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-400'
    }
  }

  // 優先度のテキスト
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return '強く希望'
      case 'medium':
        return '希望'
      case 'low':
        return '可能なら'
      default:
        return '未設定'
    }
  }

  // 月の移動
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(targetMonth)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setTargetMonth(newDate)
  }

  // 日本のタイムゾーンで正確な日付文字列を生成
  const formatDateToString = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // カレンダーの日付生成
  const generateCalendarDays = () => {
    const year = targetMonth.getFullYear()
    const month = targetMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const currentDateObj = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      const dateStr = formatDateToString(currentDateObj)
      const isCurrentMonth = currentDateObj.getMonth() === month
      const isWeekend = currentDateObj.getDay() === 0 || currentDateObj.getDay() === 6
      const wish = wishes[dateStr]

      days.push({
        date: new Date(currentDateObj),
        dateStr,
        wish,
        isCurrentMonth,
        isWeekend
      })

      currentDateObj.setDate(currentDateObj.getDate() + 1)
    }

    return days
  }

  // シフト希望を更新
  const updateWish = (dateStr: string, field: keyof ShiftWishEntry, value: any) => {
    console.log(`updateWish called: ${dateStr}, ${field}, ${value}`)
    setWishes(prev => {
      const currentWish = prev[dateStr] || {
        date: dateStr,
        preferredShift: 'any',
        priority: 'medium'
      }
      
      const newWish = {
        ...currentWish,
        [field]: value
      }
      
      const newWishes = {
        ...prev,
        [dateStr]: newWish
      }
      
      console.log('New wishes state:', newWishes)
      return newWishes
    })
  }

  // シフト希望の削除
  const removeWish = (dateStr: string) => {
    setWishes(prev => {
      const newWishes = { ...prev }
      delete newWishes[dateStr]
      return newWishes
    })
  }

  // 提出処理
  const handleSubmit = async () => {
    const wishList = Object.values(wishes).filter(wish =>
      wish.preferredShift && wish.preferredShift !== 'any' || wish.reason
    )

    if (wishList.length === 0) {
      alert('少なくとも1つの希望を入力してください')
      return
    }

    setSaving(true)
    try {
      const currentUser = getCurrentDemoUser()

      // Convert wishes to holiday requests format
      const holidayRequests = Object.values(wishes)
        .filter(wish => wish.preferredShift === 'off')
        .map(wish => ({
          date: wish.date,
          reason: wish.reason || '休日希望',
          priority: wish.priority
        }))

      if (holidayRequests.length === 0) {
        alert('休日希望が選択されていません')
        return
      }

      // Save to Supabase
      const holidayRequestData = {
        staff_name: currentUser?.displayName || '山田花子（ケアマネジャー）',
        staff_user_id: currentUser?.id || 'demo-staff',
        requested_dates: holidayRequests.map(req => req.date),
        reason: globalReason || holidayRequests.map(req => req.reason).join(', '),
        priority: holidayRequests.some(req => req.priority === 'high') ? 'high' as const :
                  holidayRequests.some(req => req.priority === 'medium') ? 'medium' as const : 'low' as const,
        target_month: `${targetMonth.getFullYear()}-${String(targetMonth.getMonth() + 1).padStart(2, '0')}`
      }

      console.log('Submitting holiday request to Supabase:', holidayRequestData)

      await createRequest(holidayRequestData)

      setSaved(true)

      // 3秒後にスタッフダッシュボードに戻る
      setTimeout(() => {
        router.push('/staff-dashboard')
      }, 3000)

    } catch (error) {
      console.error('シフト希望提出エラー:', error)
      alert('シフト希望の提出に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'))
    } finally {
      setSaving(false)
    }
  }

  const calendarDays = generateCalendarDays()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-4">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
休日希望を提出しました
          </h2>
          <p className="text-gray-600 mb-4">
管理者が確認後、シフト作成時に配慮されます。
          </p>
          <p className="text-sm text-gray-500">
            3秒後にスタッフホームに戻ります...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole="staff" />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <button 
              onClick={() => router.push('/staff-dashboard')}
              className="mr-3 p-2 text-gray-600 hover:text-gray-900 btn-touch"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                休日希望提出
              </h1>
              <p className="text-gray-600">
                来月の休日希望を提出してください
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6">
          {/* カレンダーヘッダー */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {targetMonth.getFullYear()}年 {targetMonth.getMonth() + 1}月の休日希望
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg btn-touch"
                >
                  <ChevronLeft className="w-5 h-5" />
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
                  className={`min-h-32 p-2 border rounded-lg cursor-pointer transition-colors ${
                    day.isCurrentMonth ? 'bg-white border-gray-200 hover:bg-blue-50' : 'bg-gray-50 border-gray-100'
                  } ${day.isWeekend ? 'bg-red-50' : ''}`}
                  onClick={(e) => {
                    e.preventDefault()
                    if (day.isCurrentMonth) {
                      console.log(`Calendar clicked for ${day.dateStr}, current wish:`, day.wish)
                      if (day.wish) {
                        removeWish(day.dateStr)
                      } else {
                        updateWish(day.dateStr, 'preferredShift', 'off')
                      }
                    }
                  }}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  } ${day.isWeekend ? 'text-red-600' : ''}`}>
                    {day.date.getDate()}
                  </div>
                  
                  {day.wish && day.isCurrentMonth && (
                    <div className="space-y-1">
                      <div className={`text-xs px-2 py-1 rounded border ${getHolidayTypeColor(day.wish.preferredShift)}`}>
                        {getHolidayTypeText(day.wish.preferredShift)}
                      </div>
                      <div className={`flex items-center text-xs ${getPriorityColor(day.wish.priority)}`}>
                        <Star className="w-3 h-3 mr-1" />
                        {getPriorityText(day.wish.priority)}
                      </div>
                    </div>
                  )}
                  
                  {!day.wish && day.isCurrentMonth && (
                    <div className="text-xs text-gray-400 text-center">
                      タップして休日希望を追加
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 希望詳細編集 */}
        {Object.keys(wishes).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">希望詳細設定</h3>
            </div>
            <div className="p-6 space-y-4">
              {Object.entries(wishes).map(([dateStr, wish]) => (
                <div key={dateStr} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      {(() => {
                        // 日付文字列から正確にローカル日付を作成
                        const [year, month, day] = dateStr.split('-').map(Number)
                        const localDate = new Date(year, month - 1, day)
                        return localDate.toLocaleDateString('ja-JP', {
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short'
                        })
                      })()}
                    </h4>
                    <button
                      onClick={() => removeWish(dateStr)}
                      className="text-red-600 hover:text-red-700 text-sm btn-touch"
                    >
                      削除
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* シフト種別選択 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        休日希望
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'off', label: '休日希望', time: '1日お休み', color: 'border-red-500 bg-red-50 text-red-700' },
                          { value: 'none', label: '希望なし', time: '通常通り', color: 'border-gray-300 bg-gray-50 text-gray-700' }
                        ].map((holiday) => (
                          <button
                            key={holiday.value}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              console.log(`Setting holiday for ${dateStr} to ${holiday.value}`)
                              updateWish(dateStr, 'preferredShift', holiday.value)
                            }}
                            className={`p-3 text-center rounded-lg border-2 transition-all btn-touch ${
                              wish.preferredShift === holiday.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : holiday.color
                            }`}
                          >
                            <div className="font-medium text-sm">{holiday.label}</div>
                            <div className="text-xs mt-1">{holiday.time}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 優先度選択 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        希望の強さ
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'low', label: '可能なら', color: 'text-green-600', bgColor: 'border-green-300 bg-green-50' },
                          { value: 'medium', label: '希望', color: 'text-yellow-600', bgColor: 'border-yellow-300 bg-yellow-50' },
                          { value: 'high', label: '強く希望', color: 'text-red-600', bgColor: 'border-red-300 bg-red-50' }
                        ].map((priority) => (
                          <button
                            key={priority.value}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              console.log(`Setting priority for ${dateStr} to ${priority.value}`)
                              updateWish(dateStr, 'priority', priority.value)
                            }}
                            className={`p-3 text-center rounded-lg border-2 transition-all btn-touch ${
                              wish.priority === priority.value
                                ? `border-blue-500 bg-blue-50 text-blue-700`
                                : `border-gray-300 hover:border-blue-400 ${priority.color}`
                            }`}
                          >
                            <Star className={`w-4 h-4 mx-auto mb-1 ${
                              wish.priority === priority.value ? 'text-blue-700' : priority.color
                            }`} />
                            <div className="font-medium text-sm">{priority.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 理由入力 */}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      休日理由（任意）
                    </label>
                    <input
                      type="text"
                      value={wish.reason || ''}
                      onChange={(e) => updateWish(dateStr, 'reason', e.target.value)}
                      placeholder="例: 通院のため、家族の用事、リフレッシュ"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 全体的な希望・コメント */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              全体的な休日希望・コメント（任意）
            </label>
            <textarea
              value={globalReason}
              onChange={(e) => setGlobalReason(e.target.value)}
              rows={3}
              placeholder="休日希望全体に関するコメントがあれば記載してください&#10;例: 月4回程度の休日を希望、連続勤務は3日までにしたい"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* 提出ボタン */}
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/staff-dashboard')}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium btn-touch"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || Object.keys(wishes).length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center btn-touch"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? '提出中...' : '休日希望を提出'}
          </button>
        </div>

        {/* 使い方説明 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">シフト希望の提出について</p>
              <ul className="list-disc list-inside space-y-1">
                <li>カレンダーの日付をクリックして希望を追加・削除できます</li>
                <li>希望の強さは3段階で設定できます</li>
                <li>公休希望や理由がある場合は詳細に記載してください</li>
                <li>提出期限は毎月20日までです</li>
                <li>提出後の変更はできませんのでご注意ください</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}