'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import {
  FileText,
  Calendar,
  User,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Edit,
  Plus
} from 'lucide-react'

// モニタリング記録の型定義
interface MonitoringRecord {
  id: string
  userId: string
  userName: string
  recordDate: string
  createdBy: string
  createdByName: string
  createdAt: Date
  healthStatus: {
    physical: {
      mobility: string
      selfCare: string
      excretion: string
      eating: string
      notes: string
    }
    cognitive: {
      memory: string
      orientation: string
      communication: string
      notes: string
    }
    mentalStatus: {
      mood: string
      motivation: string
      socialInteraction: string
      notes: string
    }
  }
  serviceUsage: {
    frequency: string
    satisfaction: string
    concerns: string
  }
  goalProgress: {
    shortTermGoals: Array<{
      goal: string
      progress: string
      achieved: boolean
    }>
    longTermGoals: Array<{
      goal: string
      progress: string
      achieved: boolean
    }>
  }
  familyFeedback: string
  nextSteps: string
  overallAssessment: string
}

export default function StaffMonitoringViewPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<MonitoringRecord[]>([])
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set())
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

  // LocalStorageから自分が作成したモニタリング記録を取得
  useEffect(() => {
    if (user && user.role === 'staff') {
      const savedRecords = localStorage.getItem('monitoringRecords')
      if (savedRecords) {
        try {
          const allRecords: MonitoringRecord[] = JSON.parse(savedRecords)
          // 自分が作成した記録のみフィルタ
          const myRecords = allRecords.filter(r => r.createdBy === user.uid)
          setRecords(myRecords.sort((a, b) =>
            new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
          ))
        } catch (error) {
          console.error('モニタリング記録の読み込みエラー:', error)
        }
      }
    }
  }, [user])

  const toggleRecordExpansion = (recordId: string) => {
    setExpandedRecords(prev => {
      const newSet = new Set(prev)
      if (newSet.has(recordId)) {
        newSet.delete(recordId)
      } else {
        newSet.add(recordId)
      }
      return newSet
    })
  }

  const handleCreateNew = () => {
    router.push('/monitoring')
  }

  const handleEdit = (recordId: string) => {
    router.push(`/monitoring?id=${recordId}`)
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={user.role} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/staff-dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            ダッシュボードに戻る
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileText className="w-8 h-8 mr-3 text-blue-600" />
                モニタリング記録管理
              </h1>
              <p className="mt-2 text-gray-600">
                作成したモニタリング記録の確認と編集
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center font-medium btn-touch"
            >
              <Plus className="w-5 h-5 mr-2" />
              新規作成
            </button>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総記録数</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{records.length}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">今月の記録</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {records.filter(r => {
                    const recordMonth = new Date(r.recordDate).getMonth()
                    const currentMonth = new Date().getMonth()
                    return recordMonth === currentMonth
                  }).length}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">対象利用者</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {new Set(records.map(r => r.userId)).size}
                </p>
              </div>
              <User className="w-12 h-12 text-amber-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* 記録リスト */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">記録一覧</h2>
          </div>

          {records.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">モニタリング記録がありません</p>
              <p className="text-gray-400 text-sm mt-2">「新規作成」ボタンから記録を作成してください</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {records.map((record) => (
                <div key={record.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {record.userName}
                        </h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          利用者ID: {record.userId}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          記録日: {new Date(record.recordDate).toLocaleDateString('ja-JP')}
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          作成者: {record.createdByName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(record.id)}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center text-sm btn-touch"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        編集
                      </button>
                      <button
                        onClick={() => toggleRecordExpansion(record.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg btn-touch"
                      >
                        {expandedRecords.has(record.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedRecords.has(record.id) && (
                    <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
                      {/* 身体状況 */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 mb-3">身体状況</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">移動能力:</span>
                            <span className="ml-2 font-medium">{record.healthStatus.physical.mobility}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">セルフケア:</span>
                            <span className="ml-2 font-medium">{record.healthStatus.physical.selfCare}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">排泄:</span>
                            <span className="ml-2 font-medium">{record.healthStatus.physical.excretion}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">食事:</span>
                            <span className="ml-2 font-medium">{record.healthStatus.physical.eating}</span>
                          </div>
                        </div>
                        {record.healthStatus.physical.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {record.healthStatus.physical.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* 認知機能 */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 mb-3">認知機能</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">記憶力:</span>
                            <span className="ml-2 font-medium">{record.healthStatus.cognitive.memory}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">見当識:</span>
                            <span className="ml-2 font-medium">{record.healthStatus.cognitive.orientation}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">コミュニケーション:</span>
                            <span className="ml-2 font-medium">{record.healthStatus.cognitive.communication}</span>
                          </div>
                        </div>
                        {record.healthStatus.cognitive.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {record.healthStatus.cognitive.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* 精神状態 */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 mb-3">精神状態</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">気分:</span>
                            <span className="ml-2 font-medium">{record.healthStatus.mentalStatus.mood}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">意欲:</span>
                            <span className="ml-2 font-medium">{record.healthStatus.mentalStatus.motivation}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">社会的交流:</span>
                            <span className="ml-2 font-medium">{record.healthStatus.mentalStatus.socialInteraction}</span>
                          </div>
                        </div>
                        {record.healthStatus.mentalStatus.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {record.healthStatus.mentalStatus.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* サービス利用状況 */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 mb-3">サービス利用状況</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">利用頻度:</span>
                            <span className="ml-2 font-medium">{record.serviceUsage.frequency}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">満足度:</span>
                            <span className="ml-2 font-medium">{record.serviceUsage.satisfaction}</span>
                          </div>
                          {record.serviceUsage.concerns && (
                            <div className="pt-2 border-t border-gray-200">
                              <span className="text-gray-600">懸念事項:</span>
                              <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                                {record.serviceUsage.concerns}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 総合評価 */}
                      {record.overallAssessment && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-bold text-gray-900 mb-2">総合評価</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {record.overallAssessment}
                          </p>
                        </div>
                      )}

                      {/* 今後の方針 */}
                      {record.nextSteps && (
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-bold text-gray-900 mb-2">今後の方針</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {record.nextSteps}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
