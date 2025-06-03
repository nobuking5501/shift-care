'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange, getCurrentDemoUser } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import { 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  Shield,
  Activity,
  User,
  Bell,
  BookOpen
} from 'lucide-react'

export default function StaffDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChange((authUser) => {
      console.log('Auth state changed in staff dashboard:', authUser)
      if (authUser) {
        setUser(authUser)
        // スタッフ以外は適切なページにリダイレクト
        if (authUser.role === 'admin') {
          router.push('/dashboard')
          return
        }
      } else {
        router.push('/staff-login')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  // 安全にユーザー情報を取得
  const safeUser = user || getCurrentDemoUser()
  const userRole = safeUser?.role || 'staff'
  const userName = safeUser?.displayName || 'ゲスト'
  
  // デバッグログ
  console.log('Staff Dashboard - Current user:', safeUser)
  console.log('Staff Dashboard - User role:', userRole)
  console.log('Staff Dashboard - Loading:', loading)

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

  // 管理者がアクセスした場合は管理者ダッシュボードにリダイレクト
  if (userRole === 'admin') {
    router.push('/dashboard')
    return null
  }

  // Demo data - スタッフ向け統計
  const stats = {
    todayShifts: '日勤', // 今日のシフト
    pendingReports: 1, // 未提出日報数
    recentIncidents: 0, // 自分が報告した事故・ヒヤリハット数
    notifications: 2 // 未読通知数
  }

  const todaySchedule = [
    { time: '09:00', task: 'シフト開始・申し送り', completed: true },
    { time: '09:30', task: '利用者様の朝の支援', completed: true },
    { time: '11:00', task: 'レクリエーション活動', completed: true },
    { time: '12:00', task: '昼食支援', completed: false },
    { time: '14:00', task: 'バイタルチェック', completed: false },
    { time: '15:00', task: 'おやつタイム', completed: false },
    { time: '17:00', task: '日報記入', completed: false },
    { time: '18:00', task: 'シフト終了・申し送り', completed: false },
  ]

  const notifications = [
    { id: 1, message: '明日のシフト変更のお知らせ', time: '30分前', type: 'info' },
    { id: 2, message: '研修資料が更新されました', time: '1時間前', type: 'update' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* スタッフ用の注記 */}
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-600 text-sm">
              <strong>👷‍♀️ スタッフ専用アプリ</strong> - 日常業務の記録と報告をサポートします
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            お疲れ様です、{userName}さん
          </h1>
          <p className="text-gray-600">
            今日も安全で質の高いケアをお願いします
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">今日のシフト</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayShifts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">未提出日報</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">報告済み件数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentIncidents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Bell className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">未読通知</p>
                <p className="text-2xl font-bold text-gray-900">{stats.notifications}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                今日のスケジュール
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {todaySchedule.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${item.completed ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {item.task}
                        </p>
                        <span className="text-xs text-gray-500">{item.time}</span>
                      </div>
                    </div>
                    {item.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                お知らせ
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-4 p-3 bg-blue-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === 'info' ? 'bg-blue-600' : 'bg-green-600'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - スタッフ用 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <button 
            onClick={() => router.push('/staff-reports')}
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-left btn-touch"
          >
            <FileText className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold mb-1">日報入力</h3>
            <p className="text-green-100 text-sm">今日の活動内容を記録</p>
          </button>

          <button 
            onClick={() => router.push('/staff-shifts')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-left btn-touch"
          >
            <Calendar className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold mb-1">シフト確認</h3>
            <p className="text-blue-100 text-sm">自分のシフト表を確認</p>
          </button>

          <button 
            onClick={() => router.push('/shift-request')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-lg text-left btn-touch"
          >
            <Calendar className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold mb-1">シフト希望</h3>
            <p className="text-indigo-100 text-sm">来月のシフト希望を提出</p>
          </button>

          <button 
            onClick={() => router.push('/incident-report')}
            className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-lg text-left btn-touch"
          >
            <AlertCircle className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold mb-1">緊急報告</h3>
            <p className="text-red-100 text-sm">事故・ヒヤリハット報告</p>
          </button>

          <button 
            onClick={() => router.push('/complaint-form')}
            className="bg-orange-600 hover:bg-orange-700 text-white p-6 rounded-lg text-left btn-touch"
          >
            <MessageSquare className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold mb-1">苦情受付</h3>
            <p className="text-orange-100 text-sm">苦情・要望の受付</p>
          </button>

          <button 
            onClick={() => router.push('/drill-form')}
            className="bg-blue-700 hover:bg-blue-800 text-white p-6 rounded-lg text-left btn-touch"
          >
            <Shield className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold mb-1">防災訓練</h3>
            <p className="text-blue-100 text-sm">防災訓練記録</p>
          </button>

          <button 
            onClick={() => router.push('/infection-form')}
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-left btn-touch"
          >
            <Activity className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold mb-1">感染症対応</h3>
            <p className="text-purple-100 text-sm">感染症対応記録</p>
          </button>
        </div>

        {/* Professional Development Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                研修・スキルアップ
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                継続的な学習で質の高いケアを提供しましょう
              </p>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">今月の研修</h4>
                  <p className="text-sm text-gray-600 mb-3">感染症予防対策の最新ガイドライン</p>
                  <button className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
                    研修資料を確認する →
                  </button>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">スキルチェック</h4>
                  <p className="text-sm text-gray-600 mb-3">移乗技術の自己評価（月1回）</p>
                  <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                    自己評価を開始する →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}