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
  Plus,
  Target
} from 'lucide-react'

// 支援計画書の型定義
interface SupportPlan {
  id: string
  userId: string
  userName: string
  planPeriodStart: string
  planPeriodEnd: string
  createdBy: string
  createdByName: string
  createdAt: Date
  basicInfo: {
    careLevel: string
    disabilities: string[]
    medicalConditions: string[]
    livingArrangement: string
    familySupport: string
  }
  currentStatus: {
    physicalHealth: string
    mentalHealth: string
    dailyLifeActivities: string
    socialParticipation: string
    challenges: string
  }
  goals: {
    longTerm: Array<{
      goal: string
      targetDate: string
    }>
    shortTerm: Array<{
      goal: string
      targetDate: string
      approach: string
    }>
  }
  serviceContent: Array<{
    serviceType: string
    provider: string
    frequency: string
    purpose: string
  }>
  roleAllocation: {
    careManager: string
    serviceProvider: string
    familyRole: string
    userRole: string
  }
  reviewSchedule: {
    nextReviewDate: string
    reviewFrequency: string
    reviewMethod: string
  }
  specialConsiderations: string
}

export default function StaffSupportPlanViewPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<SupportPlan[]>([])
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set())
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

  // LocalStorageから自分が作成した支援計画書を取得
  useEffect(() => {
    if (user && user.role === 'staff') {
      const savedPlans = localStorage.getItem('supportPlans')
      if (savedPlans) {
        try {
          const allPlans: SupportPlan[] = JSON.parse(savedPlans)
          // 自分が作成した計画書のみフィルタ
          const myPlans = allPlans.filter(p => p.createdBy === user.uid)
          setPlans(myPlans.sort((a, b) =>
            new Date(b.planPeriodStart).getTime() - new Date(a.planPeriodStart).getTime()
          ))
        } catch (error) {
          console.error('支援計画書の読み込みエラー:', error)
        }
      }
    }
  }, [user])

  const togglePlanExpansion = (planId: string) => {
    setExpandedPlans(prev => {
      const newSet = new Set(prev)
      if (newSet.has(planId)) {
        newSet.delete(planId)
      } else {
        newSet.add(planId)
      }
      return newSet
    })
  }

  const handleCreateNew = () => {
    router.push('/support-plan')
  }

  const handleEdit = (planId: string) => {
    router.push(`/support-plan?id=${planId}`)
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
                <FileText className="w-8 h-8 mr-3 text-green-600" />
                支援計画書管理
              </h1>
              <p className="mt-2 text-gray-600">
                作成した支援計画書の確認と編集
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center font-medium btn-touch"
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
                <p className="text-sm text-gray-600">総計画書数</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{plans.length}</p>
              </div>
              <FileText className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">有効な計画書</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {plans.filter(p => {
                    const endDate = new Date(p.planPeriodEnd)
                    const today = new Date()
                    return endDate >= today
                  }).length}
                </p>
              </div>
              <Target className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">対象利用者</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {new Set(plans.map(p => p.userId)).size}
                </p>
              </div>
              <User className="w-12 h-12 text-amber-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* 計画書リスト */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">計画書一覧</h2>
          </div>

          {plans.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">支援計画書がありません</p>
              <p className="text-gray-400 text-sm mt-2">「新規作成」ボタンから計画書を作成してください</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {plans.map((plan) => {
                const isActive = new Date(plan.planPeriodEnd) >= new Date()
                return (
                  <div key={plan.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {plan.userName}
                          </h3>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            利用者ID: {plan.userId}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isActive
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isActive ? '有効' : '期限切れ'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            計画期間: {new Date(plan.planPeriodStart).toLocaleDateString('ja-JP')} 〜 {new Date(plan.planPeriodEnd).toLocaleDateString('ja-JP')}
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            作成者: {plan.createdByName}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(plan.id)}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center text-sm btn-touch"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          編集
                        </button>
                        <button
                          onClick={() => togglePlanExpansion(plan.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg btn-touch"
                        >
                          {expandedPlans.has(plan.id) ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    {expandedPlans.has(plan.id) && (
                      <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
                        {/* 基本情報 */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-bold text-gray-900 mb-3">基本情報</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">介護度:</span>
                              <span className="ml-2 font-medium">{plan.basicInfo.careLevel}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">居住形態:</span>
                              <span className="ml-2 font-medium">{plan.basicInfo.livingArrangement}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-600">障害:</span>
                              <span className="ml-2 font-medium">{plan.basicInfo.disabilities.join('、')}</span>
                            </div>
                          </div>
                        </div>

                        {/* 長期目標 */}
                        {plan.goals.longTerm.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-bold text-gray-900 mb-3">長期目標</h4>
                            <div className="space-y-2">
                              {plan.goals.longTerm.map((goal, idx) => (
                                <div key={idx} className="flex items-start text-sm">
                                  <Target className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="font-medium text-gray-900">{goal.goal}</p>
                                    <p className="text-gray-600 text-xs mt-1">
                                      目標日: {new Date(goal.targetDate).toLocaleDateString('ja-JP')}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 短期目標 */}
                        {plan.goals.shortTerm.length > 0 && (
                          <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="font-bold text-gray-900 mb-3">短期目標</h4>
                            <div className="space-y-3">
                              {plan.goals.shortTerm.map((goal, idx) => (
                                <div key={idx} className="text-sm">
                                  <div className="flex items-start">
                                    <Target className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">{goal.goal}</p>
                                      <p className="text-gray-600 text-xs mt-1">
                                        目標日: {new Date(goal.targetDate).toLocaleDateString('ja-JP')}
                                      </p>
                                      <p className="text-gray-700 mt-2">
                                        <span className="text-gray-600">アプローチ:</span> {goal.approach}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* サービス内容 */}
                        {plan.serviceContent.length > 0 && (
                          <div className="bg-purple-50 rounded-lg p-4">
                            <h4 className="font-bold text-gray-900 mb-3">サービス内容</h4>
                            <div className="space-y-3">
                              {plan.serviceContent.map((service, idx) => (
                                <div key={idx} className="text-sm bg-white rounded p-3">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <span className="text-gray-600">サービス:</span>
                                      <span className="ml-2 font-medium">{service.serviceType}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">提供者:</span>
                                      <span className="ml-2 font-medium">{service.provider}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">頻度:</span>
                                      <span className="ml-2 font-medium">{service.frequency}</span>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-gray-600">目的:</span>
                                      <span className="ml-2">{service.purpose}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 見直しスケジュール */}
                        <div className="bg-amber-50 rounded-lg p-4">
                          <h4 className="font-bold text-gray-900 mb-3">見直しスケジュール</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">次回見直し日:</span>
                              <span className="ml-2 font-medium">
                                {new Date(plan.reviewSchedule.nextReviewDate).toLocaleDateString('ja-JP')}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">頻度:</span>
                              <span className="ml-2 font-medium">{plan.reviewSchedule.reviewFrequency}</span>
                            </div>
                          </div>
                        </div>

                        {/* 特記事項 */}
                        {plan.specialConsiderations && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-bold text-gray-900 mb-2">特記事項</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {plan.specialConsiderations}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
