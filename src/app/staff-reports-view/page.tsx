'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange, getCurrentDemoUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import {
  FileText,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit
} from 'lucide-react'

// 日報データの型定義
interface DailyReport {
  id: string
  date: string
  staffId: string
  staffName: string
  shiftType: 'early' | 'day' | 'late' | 'night'
  submittedAt: Date
  basic: {
    generalActivities: string
    teamNotes: string
  }
  userReports: UserDailyReport[]
  summary: {
    totalUsers: number
    completedReports: number
    incompletedReports: number
  }
}

interface UserDailyReport {
  userId: string
  userName: string
  vitalSigns: {
    temperature?: string
    bloodPressure?: string
    pulse?: string
    oxygen?: string
  }
  moodCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'concerning'
  appetiteCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'refused'
  sleepCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'sleepless'
  activities: string
  medicationStatus: string
  specialNotes: string
  concernsIssues: string
  completed: boolean
}

export default function StaffReportsViewPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<DailyReport[]>([])
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setUser(user)
        if (user.role !== 'staff') {
          router.push('/')
          return
        }
      } else {
        router.push('/')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  // Supabaseから自分の日報データを取得
  useEffect(() => {
    const fetchMyReports = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('daily_reports')
          .select('*')
          .eq('staff_id', user.uid)
          .order('report_date', { ascending: false })
          .order('created_at', { ascending: false })

        if (error) {
          console.error('日報取得エラー:', error)
          return
        }

        if (data && data.length > 0) {
          const formattedReports: DailyReport[] = data.map(report => ({
            id: report.id,
            date: report.report_date,
            staffId: report.staff_id,
            staffName: report.staff_name,
            shiftType: report.shift_type as 'early' | 'day' | 'late' | 'night',
            submittedAt: new Date(report.submitted_at),
            basic: {
              generalActivities: report.general_activities || '',
              teamNotes: report.team_notes || ''
            },
            userReports: report.user_reports || [],
            summary: {
              totalUsers: report.total_users || 0,
              completedReports: report.completed_reports || 0,
              incompletedReports: report.incompleted_reports || 0
            }
          }))

          setReports(formattedReports)
          console.log('自分の日報を取得しました:', formattedReports.length, '件')
        }
      } catch (error) {
        console.error('日報取得処理エラー:', error)
      }
    }

    if (user && user.role === 'staff') {
      fetchMyReports()
    }
  }, [user])

  const toggleReportExpansion = (reportId: string) => {
    setExpandedReports(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reportId)) {
        newSet.delete(reportId)
      } else {
        newSet.add(reportId)
      }
      return newSet
    })
  }

  const getShiftTypeText = (type: string) => {
    switch (type) {
      case 'early': return '早番'
      case 'day': return '日勤'
      case 'late': return '遅番'
      case 'night': return '夜勤'
      default: return type
    }
  }

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'excellent': return '非常に良い'
      case 'good': return '良い'
      case 'fair': return '普通'
      case 'poor': return '不良'
      case 'concerning': return '心配'
      case 'refused': return '拒否'
      case 'sleepless': return '不眠'
      default: return condition
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'fair': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-orange-100 text-orange-800'
      case 'concerning': return 'bg-red-100 text-red-800'
      case 'refused': return 'bg-red-100 text-red-800'
      case 'sleepless': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== 'staff') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole="staff" />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/staff-dashboard')}
                className="mr-3 p-2 text-gray-600 hover:text-gray-900 btn-touch"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  自分の日報確認
                </h1>
                <p className="text-gray-600">
                  提出した日報の確認
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/staff-reports')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center btn-touch"
            >
              <Edit className="w-4 h-4 mr-2" />
              新しい日報を作成
            </button>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">提出済み日報</p>
                <p className="text-xl font-bold text-gray-900">{reports.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Calendar className="w-6 h-6 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">今月の日報</p>
                <p className="text-xl font-bold text-gray-900">
                  {reports.filter(r => new Date(r.date).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">最終提出日</p>
                <p className="text-sm font-bold text-gray-900">
                  {reports.length > 0 ? new Date(reports[0].date).toLocaleDateString('ja-JP') : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 日報リスト */}
        {reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              提出済みの日報がありません
            </h3>
            <p className="text-gray-600 mb-6">
              日報を作成して提出すると、ここに表示されます
            </p>
            <button
              onClick={() => router.push('/staff-reports')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center btn-touch"
            >
              <Edit className="w-5 h-5 mr-2" />
              日報を作成する
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const isExpanded = expandedReports.has(report.id)

              return (
                <div key={report.id} className="bg-white rounded-lg shadow-sm">
                  {/* 日報ヘッダー */}
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleReportExpansion(report.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {new Date(report.date).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                weekday: 'short'
                              })}
                            </h3>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                              {getShiftTypeText(report.shiftType)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            提出時刻: {report.submittedAt.toLocaleString('ja-JP')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/staff-reports?id=${report.id}`)
                          }}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center text-sm btn-touch"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          編集
                        </button>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">記録完了</p>
                          <p className="text-lg font-bold text-gray-900">
                            {report.summary.completedReports} / {report.summary.totalUsers} 名
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 日報詳細（展開時） */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                      {/* 基本情報 */}
                      <div className="mb-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-3">全体活動内容</h4>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {report.basic.generalActivities || '記載なし'}
                          </p>
                        </div>

                        {report.basic.teamNotes && (
                          <div className="mt-3">
                            <h4 className="text-md font-semibold text-gray-900 mb-2">チーム申し送り</h4>
                            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {report.basic.teamNotes}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 利用者別レポート */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">利用者別記録</h4>
                        <div className="space-y-4">
                          {report.userReports.map((userReport, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                  <User className="w-5 h-5 text-gray-600 mr-2" />
                                  <h5 className="font-semibold text-gray-900">{userReport.userName}</h5>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded-full text-xs ${getConditionColor(userReport.moodCondition)}`}>
                                    気分: {getConditionText(userReport.moodCondition)}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${getConditionColor(userReport.appetiteCondition)}`}>
                                    食欲: {getConditionText(userReport.appetiteCondition)}
                                  </span>
                                </div>
                              </div>

                              {userReport.vitalSigns.temperature && (
                                <div className="grid grid-cols-4 gap-3 mb-3 text-sm">
                                  <div>
                                    <span className="text-gray-600">体温:</span>
                                    <span className="ml-2 font-medium">{userReport.vitalSigns.temperature}°C</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">血圧:</span>
                                    <span className="ml-2 font-medium">{userReport.vitalSigns.bloodPressure}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">脈拍:</span>
                                    <span className="ml-2 font-medium">{userReport.vitalSigns.pulse}回/分</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">酸素:</span>
                                    <span className="ml-2 font-medium">{userReport.vitalSigns.oxygen}%</span>
                                  </div>
                                </div>
                              )}

                              {userReport.activities && (
                                <div className="mb-2">
                                  <span className="text-xs font-medium text-gray-600">活動内容:</span>
                                  <p className="text-sm text-gray-700 mt-1">{userReport.activities}</p>
                                </div>
                              )}

                              {userReport.specialNotes && (
                                <div className="mb-2">
                                  <span className="text-xs font-medium text-gray-600">特記事項:</span>
                                  <p className="text-sm text-gray-700 mt-1">{userReport.specialNotes}</p>
                                </div>
                              )}

                              {userReport.concernsIssues && (
                                <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                                  <span className="text-xs font-medium text-red-800">懸念事項:</span>
                                  <p className="text-sm text-red-700 mt-1">{userReport.concernsIssues}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
