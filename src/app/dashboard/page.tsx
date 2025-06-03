'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange, getCurrentDemoUser } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import { 
  Calendar, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Download,
  ClipboardCheck,
  MessageSquare,
  Shield,
  Activity
} from 'lucide-react'
import { exportToPDF, exportToExcel, transformStaffData } from '@/lib/staffExport'
import { demoUsers } from '@/lib/demo-data'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      console.log('Auth state changed in admin dashboard:', user)
      if (user) {
        setUser(user)
        // スタッフがアクセスした場合はスタッフダッシュボードにリダイレクト
        if (user.role === 'staff') {
          router.push('/staff-dashboard')
          return
        }
      } else {
        router.push('/login')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  // ユーザー役割を取得（デモ用）
  const currentUser = getCurrentDemoUser()
  const userRole = currentUser?.role || 'staff'

  // デバッグログ
  console.log('Admin Dashboard - Current user:', currentUser)
  console.log('Admin Dashboard - User role:', userRole)
  console.log('Admin Dashboard - Loading:', loading)

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

  // スタッフがアクセスした場合はスタッフダッシュボードにリダイレクト
  if (userRole === 'staff') {
    router.push('/staff-dashboard')
    return null
  }

  // Demo data - 管理者向け統計
  const stats = {
    totalStaff: 16, // 管理者1名 + 正社員10名 + パート・アルバイト5名
    todayShifts: 12, // 今日のシフト数
    totalIncidents: 3, // 総事故・ヒヤリハット数
    pendingIncidents: 1, // 未対応事故・ヒヤリハット数
    accidents: 1, // 事故数
    nearMisses: 2, // ヒヤリハット数
    totalComplaints: 3, // 総苦情・要望数
    pendingComplaints: 1, // 未対応苦情・要望数
    resolvedComplaints: 1, // 解決済み苦情・要望数
    totalDrills: 3, // 総防災訓練数
    totalInfections: 2 // 総感染症対応数
  }

  const recentActivities = [
    { id: 1, user: '山田花子（スタッフ）', action: '苦情・要望を報告', time: '15分前', type: 'complaint' },
    { id: 2, user: '田中太郎（スタッフ）', action: 'ヒヤリハットを報告', time: '30分前', type: 'incident' },
    { id: 3, user: '佐藤太郎（スタッフ）', action: '火災避難訓練記録を送信', time: '1日前', type: 'drill' },
    { id: 4, user: '山田花子（スタッフ）', action: 'インフルエンザ対応記録を送信', time: '2日前', type: 'infection' },
    { id: 5, user: '田中太郎（スタッフ）', action: '事故報告を送信', time: '3日前', type: 'incident' },
    { id: 6, user: '高橋美咲（管理者）', action: '苦情対応記録を更新', time: '3時間前', type: 'complaint' },
  ]

  const upcomingShifts = [
    { id: 1, date: '2025-06-02', shift: '早番', staff: '鈴木一郎' },
    { id: 2, date: '2025-06-02', shift: '日勤', staff: '高橋美咲' },
    { id: 3, date: '2025-06-02', shift: '日勤', staff: '渡辺麻衣' },
    { id: 4, date: '2025-06-02', shift: '遅番', staff: '加藤大輔' },
    { id: 5, date: '2025-06-02', shift: '夜勤', staff: '田中太郎' },
    { id: 6, date: '2025-06-02', shift: '日勤（短時間）', staff: '松本真理（パート）' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* プロトタイプ版の注記 */}
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-yellow-600 text-sm">
              <strong>🎭 プロトタイプ版</strong> - デモ用データで機能をご体験いただけます
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ダッシュボード
          </h1>
          <p className="text-gray-600">
            おかえりなさい、{user?.displayName || 'ゲスト'}さん
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">総スタッフ数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">今日のシフト</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayShifts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">防災訓練記録</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDrills}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">感染症対応記録</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInfections}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 事故・ヒヤリハット統計カード */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">総報告数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalIncidents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">未対応</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingIncidents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-700" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">事故</p>
                <p className="text-2xl font-bold text-gray-900">{stats.accidents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">ヒヤリハット</p>
                <p className="text-2xl font-bold text-gray-900">{stats.nearMisses}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">最近の活動</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'incident' ? 'bg-red-600' :
                      activity.type === 'report' ? 'bg-green-600' :
                      activity.type === 'complaint' ? 'bg-orange-600' :
                      activity.type === 'drill' ? 'bg-blue-600' :
                      activity.type === 'infection' ? 'bg-purple-600' :
                      'bg-gray-600'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span>
                        が{activity.action}しました
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Shifts */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">明日のシフト</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingShifts.map((shift) => (
                  <div key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium text-gray-900">{shift.staff}</p>
                      <p className="text-sm text-gray-600">{shift.shift}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">{shift.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - 管理者向け */}
        {userRole === 'admin' ? (
          <div className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <button 
              onClick={() => router.push('/shifts')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-left btn-touch"
            >
              <Calendar className="w-8 h-8 mb-2" />
              <h3 className="text-lg font-semibold mb-1">シフト管理</h3>
              <p className="text-blue-100 text-sm">シフト表の確認・編集</p>
            </button>

            <button 
              onClick={() => router.push('/reports')}
              className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-left btn-touch"
            >
              <FileText className="w-8 h-8 mb-2" />
              <h3 className="text-lg font-semibold mb-1">日報管理</h3>
              <p className="text-green-100 text-sm">スタッフ日報の確認・管理</p>
            </button>

            <button 
              onClick={() => router.push('/incidents')}
              className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-lg text-left btn-touch"
            >
              <AlertCircle className="w-8 h-8 mb-2" />
              <h3 className="text-lg font-semibold mb-1">事故管理</h3>
              <p className="text-red-100 text-sm">事故・ヒヤリハット管理</p>
            </button>

            <button 
              onClick={() => router.push('/complaints')}
              className="bg-orange-600 hover:bg-orange-700 text-white p-6 rounded-lg text-left btn-touch"
            >
              <MessageSquare className="w-8 h-8 mb-2" />
              <h3 className="text-lg font-semibold mb-1">苦情管理</h3>
              <p className="text-orange-100 text-sm">苦情・要望管理</p>
            </button>

            <button 
              onClick={() => router.push('/safety-records')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-lg text-left btn-touch"
            >
              <Shield className="w-8 h-8 mb-2" />
              <h3 className="text-lg font-semibold mb-1">安全記録管理</h3>
              <p className="text-indigo-100 text-sm">防災・感染症記録管理</p>
            </button>

            <button 
              onClick={() => router.push('/support-plan')}
              className="bg-orange-600 hover:bg-orange-700 text-white p-6 rounded-lg text-left btn-touch"
            >
              <FileText className="w-8 h-8 mb-2" />
              <h3 className="text-lg font-semibold mb-1">支援計画書</h3>
              <p className="text-orange-100 text-sm">個別支援計画書の作成・管理</p>
            </button>

            <button 
              onClick={() => router.push('/staff')}
              className="bg-gray-600 hover:bg-gray-700 text-white p-6 rounded-lg text-left btn-touch"
            >
              <Users className="w-8 h-8 mb-2" />
              <h3 className="text-lg font-semibold mb-1">スタッフ管理</h3>
              <p className="text-gray-100 text-sm">スタッフ情報の管理</p>
            </button>
          </div>
        ) : (
          /* スタッフ向けクイックアクション */
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-left btn-touch"
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
        )}

        {/* Self Evaluation Section - Admin Only */}
        {userRole === 'admin' && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ClipboardCheck className="w-5 h-5 mr-2" />
                  自己点検・自己評価
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  年度末の報告や監査用に、施設の自己点検・自己評価表を作成できます
                </p>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => router.push('/evaluation')}
                    className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg text-left btn-touch transition-colors"
                  >
                    <div className="flex items-center mb-2">
                      <ClipboardCheck className="w-6 h-6 mr-2" />
                      <span className="font-medium">新規作成</span>
                    </div>
                    <p className="text-orange-100 text-sm">
                      {new Date().getFullYear()}年度の自己評価表を作成
                    </p>
                  </button>
                  
                  <button 
                    onClick={() => router.push('/evaluation/history')}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-left btn-touch transition-colors"
                  >
                    <div className="flex items-center mb-2">
                      <FileText className="w-6 h-6 mr-2" />
                      <span className="font-medium">履歴管理</span>
                    </div>
                    <p className="text-blue-100 text-sm">
                      過去の評価表の確認・PDF再出力
                    </p>
                  </button>
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">評価項目</h4>
                  <div className="text-xs text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <span>• サービス提供（5項目）</span>
                    <span>• 職員体制・研修（4項目）</span>
                    <span>• 運営管理（5項目）</span>
                    <span>• 環境整備（3項目）</span>
                    <span>• 利用者満足度・家族連携（3項目）</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    対象年度: {new Date().getFullYear()}年 | 出力形式: PDF
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Staff Export Section - Admin Only */}
        {userRole === 'admin' && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  勤務体制一覧表 出力
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  年度末の報告や監査用に、スタッフの勤務体制一覧表をダウンロードできます
                </p>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <button 
                    onClick={async () => {
                      try {
                        const staffData = transformStaffData(demoUsers)
                        await exportToPDF(staffData)
                      } catch (error) {
                        console.error('PDF export failed:', error)
                        alert('PDFの出力に失敗しました')
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg text-left btn-touch transition-colors"
                  >
                    <div className="flex items-center mb-2">
                      <FileText className="w-6 h-6 mr-2" />
                      <span className="font-medium">PDF出力</span>
                    </div>
                    <p className="text-red-100 text-sm">
                      勤務体制一覧表をPDF形式でダウンロード
                    </p>
                    <p className="text-red-200 text-xs mt-1">
                      ファイル名: staff-list-YYYYMMDD.pdf
                    </p>
                  </button>

                  <button 
                    onClick={() => {
                      try {
                        const staffData = transformStaffData(demoUsers)
                        exportToExcel(staffData)
                      } catch (error) {
                        console.error('Excel export failed:', error)
                        alert('Excelの出力に失敗しました')
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-left btn-touch transition-colors"
                  >
                    <div className="flex items-center mb-2">
                      <FileText className="w-6 h-6 mr-2" />
                      <span className="font-medium">Excel出力</span>
                    </div>
                    <p className="text-green-100 text-sm">
                      勤務体制一覧表をExcel形式でダウンロード
                    </p>
                    <p className="text-green-200 text-xs mt-1">
                      ファイル名: staff-list-YYYYMMDD.xlsx
                    </p>
                  </button>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">出力項目</h4>
                  <div className="text-xs text-gray-600 grid grid-cols-2 md:grid-cols-3 gap-2">
                    <span>• 氏名</span>
                    <span>• 職種</span>
                    <span>• 資格</span>
                    <span>• 雇用形態</span>
                    <span>• 週間勤務時間</span>
                    <span>• 夜勤可否</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    対象: スタッフ {demoUsers.filter(u => u.role === 'staff').length}名（管理者は除く）
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}