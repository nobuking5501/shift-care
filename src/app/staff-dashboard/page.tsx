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
  const [redirecting, setRedirecting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChange((authUser) => {
      console.log('Auth state changed in staff dashboard:', authUser)
      if (authUser) {
        setUser(authUser)
        // 管理者がアクセスした場合はすぐにリダイレクト
        if (authUser.role === 'admin') {
          console.log('Admin user detected - redirecting to admin dashboard')
          setRedirecting(true)
          setTimeout(() => {
            router.replace('/dashboard')
          }, 50) // 短い遅延で競合状態を回避
          return
        }
        setLoading(false) // スタッフの場合のみローディング終了
      } else {
        router.push('/')
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  // 安全にユーザー情報を取得
  const safeUser = user || getCurrentDemoUser()
  const userRole = safeUser?.role || 'staff'
  const userName = safeUser?.displayName || '山田花子（ケアマネジャー）'

  // デバッグログ
  console.log('Staff Dashboard - Current user:', safeUser)
  console.log('Staff Dashboard - User role:', userRole)
  console.log('Staff Dashboard - Loading:', loading)

  if (loading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        {redirecting && (
          <p className="ml-4 text-gray-600">適切なページに移動しています...</p>
        )}
      </div>
    )
  }

  if (!safeUser) {
    return null
  }

  // 管理者がアクセスした場合はリダイレクト済み（useEffectで処理）
  if (userRole === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Demo data - ケアマネジャー向け統計
  const stats = {
    managedUsers: 4, // 担当利用者数
    pendingPlans: 2, // 更新予定支援計画数
    monthlyMonitoring: 1, // 今月実施予定モニタリング数
    notifications: 3, // 未読通知数
    todayVisits: 2, // 今日の訪問予定
    pendingReports: 1, // 未提出報告書
    completedAssessments: 3, // 完了済みアセスメント
    upcomingDeadlines: 2 // 期限迫る業務
  }

  const todaySchedule = [
    { time: '09:00', task: '業務開始・メール確認', completed: true },
    { time: '09:30', task: '田中太郎さんアセスメント面談', completed: true },
    { time: '11:00', task: '支援計画書作成（佐藤美咲さん）', completed: true },
    { time: '13:00', task: '昼休憩', completed: true },
    { time: '14:00', task: 'サービス事業者連絡会議', completed: false },
    { time: '15:30', task: '山田花子さんモニタリング', completed: false },
    { time: '16:30', task: '支援計画更新作業', completed: false },
    { time: '17:30', task: '明日の訪問準備・記録整理', completed: false },
  ]

  const notifications = [
    { id: 1, message: '鈴木健一さんの支援計画更新期限が近づいています', time: '1時間前', type: 'info' },
    { id: 2, message: '来月のモニタリング予定表が更新されました', time: '2時間前', type: 'update' },
    { id: 3, message: 'サービス利用開始の相談依頼が届いています', time: '3時間前', type: 'info' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ケアマネジャー用の注記 */}
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-600 text-sm">
              <strong>🏥 ケアマネジャー専用アプリ</strong> - 利用者の支援計画と相談支援業務をサポートします
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            お疲れ様です、{userName}さん
          </h1>
          <p className="text-gray-600">
            今日も利用者お一人お一人に寄り添った相談支援をお願いします
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <User className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">担当利用者</p>
                <p className="text-2xl font-bold text-gray-900">{stats.managedUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">更新予定計画</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingPlans}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">今月モニタリング</p>
                <p className="text-2xl font-bold text-gray-900">{stats.monthlyMonitoring}</p>
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

        {/* 記録確認セクション */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">記録の確認・作成</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-amber-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FileText className="w-6 h-6 text-amber-600 mr-3" />
                  <h3 className="font-semibold text-gray-900">日報確認</h3>
                </div>
                <button
                  onClick={() => router.push('/staff-reports')}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1 rounded text-sm btn-touch"
                >
                  作成・確認
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">相談支援業務の日報を作成・確認できます</p>
              <div className="text-xs text-gray-500">本日の日報: 未作成</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Activity className="w-6 h-6 text-blue-600 mr-3" />
                  <h3 className="font-semibold text-gray-900">モニタリング記録</h3>
                </div>
                <button
                  onClick={() => router.push('/monitoring')}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm btn-touch"
                >
                  確認・作成
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">利用者のモニタリング記録を確認・作成できます</p>
              <div className="text-xs text-gray-500">今月のモニタリング: 2件完了</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <BookOpen className="w-6 h-6 text-green-600 mr-3" />
                  <h3 className="font-semibold text-gray-900">支援計画書</h3>
                </div>
                <button
                  onClick={() => router.push('/support-plan')}
                  className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-sm btn-touch"
                >
                  確認・作成
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">個別支援計画書を確認・作成できます</p>
              <div className="text-xs text-gray-500">更新予定: 2件あり</div>
            </div>
          </div>
        </div>

        {/* Quick Actions - ケアマネジャー用 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">主要業務</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => router.push('/staff-shifts')}
            className="bg-teal-600 hover:bg-teal-700 text-white p-6 rounded-lg text-left btn-touch"
          >
            <Calendar className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold mb-1">シフト確認</h3>
            <p className="text-teal-100 text-sm">自分のシフト確認・希望提出</p>
          </button>

          <button
            onClick={() => router.push('/staff-reports')}
            className="bg-amber-600 hover:bg-amber-700 text-white p-6 rounded-lg text-left btn-touch"
          >
            <FileText className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold mb-1">日報作成</h3>
            <p className="text-amber-100 text-sm">相談支援業務の日報入力</p>
          </button>

          <button
            onClick={() => router.push('/monitoring')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-left btn-touch"
          >
            <Activity className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold mb-1">モニタリング</h3>
            <p className="text-blue-100 text-sm">利用者の状況確認・評価</p>
          </button>

          <button
            onClick={() => router.push('/support-plan')}
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-left btn-touch"
          >
            <FileText className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold mb-1">支援計画作成</h3>
            <p className="text-green-100 text-sm">個別支援計画の作成・更新</p>
          </button>

          <button
            onClick={() => router.push('/evaluation')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-lg text-left btn-touch"
          >
            <CheckCircle className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold mb-1">アセスメント</h3>
            <p className="text-indigo-100 text-sm">利用者のニーズ評価</p>
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
            onClick={() => router.push('/users')}
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-left btn-touch"
          >
            <User className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold mb-1">利用者管理</h3>
            <p className="text-purple-100 text-sm">担当利用者の情報管理</p>
          </button>
          </div>
        </div>

        {/* Managed Users Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                担当利用者の状況
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                担当している利用者の最新情報をご確認ください
              </p>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">田中太郎さん</h4>
                  <p className="text-sm text-gray-600 mb-3">支援計画更新：来月予定</p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    詳細を確認する →
                  </button>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">佐藤美咲さん</h4>
                  <p className="text-sm text-gray-600 mb-3">モニタリング：今月実施予定</p>
                  <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                    モニタリング準備 →
                  </button>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">山田花子さん</h4>
                  <p className="text-sm text-gray-600 mb-3">相談記録：要更新</p>
                  <button className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
                    記録を更新する →
                  </button>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">鈴木健一さん</h4>
                  <p className="text-sm text-gray-600 mb-3">新規相談：支援計画作成中</p>
                  <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    計画書を作成する →
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