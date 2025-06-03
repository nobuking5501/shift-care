'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange, getCurrentDemoUser } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import { 
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users
} from 'lucide-react'

export default function StaffShiftsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const router = useRouter()

  // ユーザー認証
  useEffect(() => {
    const unsubscribe = onAuthStateChange((authUser) => {
      if (authUser) {
        setUser(authUser)
      } else {
        router.push('/staff-login')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  // デモ用シフトデータ
  const shifts = [
    {
      date: '2025-06-01',
      shiftType: 'day',
      startTime: '09:00',
      endTime: '18:00',
      location: 'デイサービス A棟',
      notes: '新規利用者様の対応あり'
    },
    {
      date: '2025-06-02',
      shiftType: 'day',
      startTime: '09:00',
      endTime: '18:00',
      location: 'デイサービス A棟',
      notes: ''
    },
    {
      date: '2025-06-03',
      shiftType: 'late',
      startTime: '13:00',
      endTime: '22:00',
      location: 'デイサービス B棟',
      notes: 'レクリエーション担当'
    },
    {
      date: '2025-06-04',
      shiftType: 'off',
      startTime: '',
      endTime: '',
      location: '',
      notes: '公休'
    },
    {
      date: '2025-06-05',
      shiftType: 'early',
      startTime: '07:00',
      endTime: '16:00',
      location: 'デイサービス A棟',
      notes: '朝の申し送り重要'
    },
  ]

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

  // 月の移動
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  // カレンダーの日付生成
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
      const dateStr = currentDateObj.toISOString().split('T')[0]
      const shift = shifts.find(s => s.date === dateStr)
      const isCurrentMonth = currentDateObj.getMonth() === month
      const isToday = dateStr === new Date().toISOString().split('T')[0]
      
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

  // 安全にユーザー情報を取得
  const safeUser = user || getCurrentDemoUser()
  
  if (!safeUser) {
    return null
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
      <Navbar userRole="staff" />
      
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
                  onClick={() => setCurrentDate(new Date())}
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
            <h3 className="text-lg font-semibold text-gray-900">今週のシフト詳細</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {shifts.slice(0, 5).map((shift, index) => (
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
            ))}
          </div>
        </div>

        {/* 凡例 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-3">シフト種別</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { type: 'early', label: '早番', time: '07:00-16:00' },
              { type: 'day', label: '日勤', time: '09:00-18:00' },
              { type: 'late', label: '遅番', time: '13:00-22:00' },
              { type: 'night', label: '夜勤', time: '22:00-07:00' },
              { type: 'off', label: '公休', time: '休み' },
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
    </div>
  )
}