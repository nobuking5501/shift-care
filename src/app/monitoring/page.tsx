'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { onAuthStateChange, getCurrentDemoUser } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import { 
  FileText,
  Calendar,
  User,
  Users,
  Download,
  ArrowLeft,
  Save,
  CheckCircle,
  AlertTriangle,
  Info,
  Printer,
  Building2,
  Clipboard,
  BarChart3,
  TrendingUp,
  Activity,
  Heart,
  Pill,
  Shield,
  FileCheck,
  X,
  Eye,
  BookOpen
} from 'lucide-react'

// モニタリング記録の型定義
interface MonitoringRecord {
  id: string
  userId: string
  userName: string
  period: {
    startDate: string
    endDate: string
  }
  personalInfo: {
    age: number
    careLevel: string
    disabilityType: string[]
    medicalConditions: string[]
    emergencyContact: {
      name: string
      relationship: string
      phone: string
    }
  }
  serviceGoals: {
    shortTerm: string[]
    longTerm: string[]
    specificObjectives: string[]
  }
  dailyLifeSupport: {
    mealAssistance: {
      frequency: number
      supportLevel: 'independent' | 'partial' | 'full'
      notes: string
    }
    bathingAssistance: {
      frequency: number
      supportLevel: 'independent' | 'partial' | 'full'
      notes: string
    }
    medicationManagement: {
      medicationCount: number
      administrationMethod: 'self' | 'reminder' | 'assistance' | 'full'
      notes: string
    }
    mobilitySupport: {
      assistiveDevices: string[]
      supportLevel: 'independent' | 'partial' | 'full'
      notes: string
    }
  }
  healthStatus: {
    vitalSigns: {
      bloodPressure: { average: string, range: string }
      pulse: { average: number, range: string }
      temperature: { average: number, range: string }
      weight: { current: number, change: string }
    }
    mentalStatus: {
      cognitiveFunction: 'good' | 'fair' | 'declining' | 'poor'
      socialInteraction: 'active' | 'moderate' | 'limited' | 'withdrawn'
      emotionalStability: 'stable' | 'occasionally_unstable' | 'unstable'
      notes: string
    }
    medicalEvents: {
      hospitalizations: number
      emergencyVisits: number
      newDiagnoses: string[]
      medicationChanges: string[]
    }
  }
  socialActivities: {
    groupActivities: {
      participation: 'active' | 'moderate' | 'limited' | 'none'
      preferredActivities: string[]
      notes: string
    }
    communityIntegration: {
      outings: number
      familyVisits: number
      friendInteractions: number
      notes: string
    }
  }
  serviceEvaluation: {
    goalAchievement: {
      shortTermProgress: 'exceeded' | 'achieved' | 'progressing' | 'not_achieved'
      longTermProgress: 'exceeded' | 'achieved' | 'progressing' | 'not_achieved'
      notes: string
    }
    serviceQuality: {
      userSatisfaction: 'very_satisfied' | 'satisfied' | 'neutral' | 'unsatisfied'
      familySatisfaction: 'very_satisfied' | 'satisfied' | 'neutral' | 'unsatisfied'
      staffAssessment: 'excellent' | 'good' | 'fair' | 'needs_improvement'
      notes: string
    }
    recommendations: {
      serviceContinuation: 'continue' | 'modify' | 'increase' | 'decrease' | 'discontinue'
      proposedChanges: string[]
      priorityAreas: string[]
      notes: string
    }
  }
  createdAt: Date
  updatedAt: Date
  submittedAt?: Date
  status: 'draft' | 'completed' | 'submitted'
  reviewedBy?: string
  reviewedAt?: Date
}

export default function MonitoringPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [record, setRecord] = useState<MonitoringRecord | null>(null)
  const [activeTab, setActiveTab] = useState('basic')
  const [showPreview, setShowPreview] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')

  // 利用者データ
  const serviceUsers = [
    {
      id: 'user1',
      name: '田中 花子',
      age: 78,
      careLevel: '要介護2',
      disabilityType: ['身体障害', '高次脳機能障害'],
      medicalConditions: ['高血圧', '糖尿病'],
      emergencyContact: {
        name: '田中 一郎',
        relationship: '長男',
        phone: '090-1234-5678'
      }
    },
    {
      id: 'user2',
      name: '佐藤 一郎',
      age: 82,
      careLevel: '要介護3',
      disabilityType: ['認知症', '身体障害'],
      medicalConditions: ['認知症', '関節炎'],
      emergencyContact: {
        name: '佐藤 花子',
        relationship: '配偶者',
        phone: '090-2345-6789'
      }
    },
    {
      id: 'user3',
      name: '山田 美智子',
      age: 75,
      careLevel: '要介護1',
      disabilityType: ['身体障害'],
      medicalConditions: ['腰痛'],
      emergencyContact: {
        name: '山田 太郎',
        relationship: '息子',
        phone: '090-3456-7890'
      }
    }
  ]

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setUser(user)
        if (user.role !== 'admin') {
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

  // モニタリング記録の初期化
  useEffect(() => {
    if (userId) {
      const targetUser = serviceUsers.find(u => u.id === userId)
      if (targetUser) {
        // 既存記録があるかチェック（実際の実装ではFirestoreから取得）
        const existingRecord = null // デモ用

        if (existingRecord) {
          setRecord(existingRecord)
        } else {
          // 新規モニタリング記録の作成
          const newRecord: MonitoringRecord = {
            id: `monitoring-${userId}-${Date.now()}`,
            userId: targetUser.id,
            userName: targetUser.name,
            period: {
              startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3か月前
              endDate: new Date().toISOString().split('T')[0]
            },
            personalInfo: {
              age: targetUser.age,
              careLevel: targetUser.careLevel,
              disabilityType: targetUser.disabilityType,
              medicalConditions: targetUser.medicalConditions,
              emergencyContact: targetUser.emergencyContact
            },
            serviceGoals: {
              shortTerm: ['日常生活動作の維持', '社会参加の促進'],
              longTerm: ['在宅生活の継続', '生活の質の向上'],
              specificObjectives: ['週3回の外出活動参加', '服薬管理の自立']
            },
            dailyLifeSupport: {
              mealAssistance: {
                frequency: 21, // 週7回×3食
                supportLevel: 'partial',
                notes: '食事摂取量は良好。咀嚼・嚥下に問題なし。'
              },
              bathingAssistance: {
                frequency: 3, // 週3回
                supportLevel: 'partial',
                notes: '見守りと一部介助。安全確保のため職員同伴。'
              },
              medicationManagement: {
                medicationCount: 5,
                administrationMethod: 'reminder',
                notes: '朝・昼・夕の定時薬。飲み忘れ防止のため声かけ実施。'
              },
              mobilitySupport: {
                assistiveDevices: ['歩行器', '車椅子'],
                supportLevel: 'partial',
                notes: '屋内は歩行器使用。外出時は車椅子併用。'
              }
            },
            healthStatus: {
              vitalSigns: {
                bloodPressure: { average: '135/80', range: '120-150/70-90' },
                pulse: { average: 72, range: '65-85' },
                temperature: { average: 36.4, range: '36.2-36.8' },
                weight: { current: 52.3, change: '-0.5kg（3か月）' }
              },
              mentalStatus: {
                cognitiveFunction: 'fair',
                socialInteraction: 'active',
                emotionalStability: 'stable',
                notes: '記憶力の軽度低下あり。日常会話は問題なし。レクリエーション活動に積極的。'
              },
              medicalEvents: {
                hospitalizations: 0,
                emergencyVisits: 0,
                newDiagnoses: [],
                medicationChanges: ['血圧薬の減量調整']
              }
            },
            socialActivities: {
              groupActivities: {
                participation: 'active',
                preferredActivities: ['音楽療法', '手芸', '園芸'],
                notes: '集団活動への参加意欲高い。他利用者との交流良好。'
              },
              communityIntegration: {
                outings: 12,
                familyVisits: 8,
                friendInteractions: 5,
                notes: '家族との面会定期的。地域行事への参加希望あり。'
              }
            },
            serviceEvaluation: {
              goalAchievement: {
                shortTermProgress: 'achieved',
                longTermProgress: 'progressing',
                notes: '設定目標の多くは達成。継続的支援により更なる改善期待。'
              },
              serviceQuality: {
                userSatisfaction: 'satisfied',
                familySatisfaction: 'very_satisfied',
                staffAssessment: 'good',
                notes: '本人・家族ともにサービスに満足。職員との信頼関係良好。'
              },
              recommendations: {
                serviceContinuation: 'continue',
                proposedChanges: ['外出支援の頻度増加', 'リハビリプログラムの追加'],
                priorityAreas: ['身体機能維持', '社会参加促進'],
                notes: '現在のサービス継続が適切。外出支援の充実を推奨。'
              }
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'draft'
          }
          setRecord(newRecord)
        }
      }
    }
  }, [userId])

  const handleSave = async () => {
    if (!record) return

    setSaving(true)
    try {
      // 実際の実装ではFirestoreに保存
      const updatedRecord = {
        ...record,
        updatedAt: new Date()
      }
      setRecord(updatedRecord)
      
      await new Promise(resolve => setTimeout(resolve, 1000)) // デモ用遅延
      
      alert('モニタリング記録を保存しました')
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = async () => {
    if (!record) return

    setSaving(true)
    try {
      // デモ用遅延
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // プレビューモーダルを表示
      setShowPreview(true)
      
    } catch (error) {
      console.error('プレビューエラー:', error)
      alert('プレビューの生成に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const updateRecord = (section: string, field: string, value: any) => {
    if (!record) return
    
    setRecord(prev => {
      if (!prev) return prev
      return {
        ...prev,
        [section]: {
          ...prev[section as keyof MonitoringRecord],
          [field]: value
        },
        updatedAt: new Date()
      }
    })
  }

  const updateNestedRecord = (section: string, subsection: string, field: string, value: any) => {
    if (!record) return
    
    setRecord(prev => {
      if (!prev) return prev
      return {
        ...prev,
        [section]: {
          ...prev[section as keyof MonitoringRecord],
          [subsection]: {
            ...(prev[section as keyof MonitoringRecord] as any)[subsection],
            [field]: value
          }
        },
        updatedAt: new Date()
      }
    })
  }

  const getProgressText = (progress: string) => {
    switch (progress) {
      case 'exceeded': return '目標を上回る'
      case 'achieved': return '目標達成'
      case 'progressing': return '順調に進歩'
      case 'not_achieved': return '未達成'
      default: return progress
    }
  }

  const getSatisfactionText = (satisfaction: string) => {
    switch (satisfaction) {
      case 'very_satisfied': return '非常に満足'
      case 'satisfied': return '満足'
      case 'neutral': return '普通'
      case 'unsatisfied': return '不満'
      default: return satisfaction
    }
  }

  const getSupportLevelText = (level: string) => {
    switch (level) {
      case 'independent': return '自立'
      case 'partial': return '一部介助'
      case 'full': return '全介助'
      default: return level
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  // ユーザーが選択されていない場合は選択画面を表示
  if (!record && !userId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar userRole="admin" />
        
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="mb-6">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/reports')}
                className="mr-3 p-2 text-gray-600 hover:text-gray-900 btn-touch"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  モニタリング記録作成
                </h1>
                <p className="text-gray-600">
                  記録を作成する利用者様を選択してください
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">利用者選択</h2>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceUsers.map((serviceUser) => (
                  <button
                    key={serviceUser.id}
                    onClick={() => router.push(`/monitoring?userId=${serviceUser.id}`)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{serviceUser.name}</h3>
                        <p className="text-sm text-gray-600">{serviceUser.age}歳 | {serviceUser.careLevel}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {serviceUser.disabilityType.slice(0, 2).map((type, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {type}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {serviceUser.medicalConditions.slice(0, 2).map((condition, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center text-purple-600">
                      <FileCheck className="w-4 h-4 mr-1" />
                      <span className="text-sm">モニタリング記録作成</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!record) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole="admin" />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/reports')}
                className="mr-3 p-2 text-gray-600 hover:text-gray-900 btn-touch"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  モニタリング記録作成
                </h1>
                <p className="text-gray-600">
                  {record.userName}様の国提出用モニタリング記録
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-500">
                    対象期間: {new Date(record.period.startDate).toLocaleDateString('ja-JP')} ～ {new Date(record.period.endDate).toLocaleDateString('ja-JP')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    record.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    record.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {record.status === 'draft' ? '下書き' :
                     record.status === 'completed' ? '作成完了' : '提出済み'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center btn-touch"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? '保存中...' : '保存'}
              </button>
              <button 
                onClick={handlePreview}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center btn-touch"
              >
                <Eye className="w-4 h-4 mr-2" />
                {saving ? 'プレビュー生成中...' : 'プレビュー'}
              </button>
              <button 
                onClick={() => router.push(`/support-plan?userId=${record.userId}&monitoringId=${record.id}`)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center btn-touch"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                支援計画書作成
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center btn-touch">
                <Download className="w-4 h-4 mr-2" />
                PDF出力
              </button>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'basic', label: '基本情報', icon: User },
                { id: 'goals', label: 'サービス目標', icon: BarChart3 },
                { id: 'daily', label: '日常生活支援', icon: Heart },
                { id: 'health', label: '健康状態', icon: Activity },
                { id: 'social', label: '社会活動', icon: Users },
                { id: 'evaluation', label: 'サービス評価', icon: Clipboard }
              ].map(tab => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* タブコンテンツ */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                基本情報・利用者概要
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">利用者氏名</label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <span className="text-gray-900">{record.userName}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">年齢</label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <span className="text-gray-900">{record.personalInfo.age}歳</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">要介護度</label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <span className="text-gray-900">{record.personalInfo.careLevel}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">対象期間</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={record.period.startDate}
                      onChange={(e) => updateRecord('period', 'startDate', e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="date"
                      value={record.period.endDate}
                      onChange={(e) => updateRecord('period', 'endDate', e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">障害の種類</label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex flex-wrap gap-2">
                    {record.personalInfo.disabilityType.map((type, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">主な医学的診断</label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex flex-wrap gap-2">
                    {record.personalInfo.medicalConditions.map((condition, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">緊急連絡先</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-blue-700">氏名</span>
                    <p className="font-medium text-blue-900">{record.personalInfo.emergencyContact.name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-blue-700">続柄</span>
                    <p className="font-medium text-blue-900">{record.personalInfo.emergencyContact.relationship}</p>
                  </div>
                  <div>
                    <span className="text-xs text-blue-700">電話番号</span>
                    <p className="font-medium text-blue-900">{record.personalInfo.emergencyContact.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                サービス目標・計画
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">短期目標（3-6か月）</label>
                <textarea
                  value={record.serviceGoals.shortTerm.join('\n')}
                  onChange={(e) => updateRecord('serviceGoals', 'shortTerm', e.target.value.split('\n'))}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="短期目標を1行ずつ入力してください"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">長期目標（6か月-1年）</label>
                <textarea
                  value={record.serviceGoals.longTerm.join('\n')}
                  onChange={(e) => updateRecord('serviceGoals', 'longTerm', e.target.value.split('\n'))}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="長期目標を1行ずつ入力してください"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">具体的達成指標</label>
                <textarea
                  value={record.serviceGoals.specificObjectives.join('\n')}
                  onChange={(e) => updateRecord('serviceGoals', 'specificObjectives', e.target.value.split('\n'))}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="具体的な達成指標を1行ずつ入力してください"
                />
              </div>
            </div>
          )}

          {activeTab === 'daily' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                日常生活支援の実施状況
              </h3>
              
              {/* 食事支援 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-semibold text-gray-900 mb-4">食事支援</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">支援頻度（週）</label>
                    <input
                      type="number"
                      value={record.dailyLifeSupport.mealAssistance.frequency}
                      onChange={(e) => updateNestedRecord('dailyLifeSupport', 'mealAssistance', 'frequency', parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">支援レベル</label>
                    <select
                      value={record.dailyLifeSupport.mealAssistance.supportLevel}
                      onChange={(e) => updateNestedRecord('dailyLifeSupport', 'mealAssistance', 'supportLevel', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="independent">自立</option>
                      <option value="partial">一部介助</option>
                      <option value="full">全介助</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
                    <textarea
                      value={record.dailyLifeSupport.mealAssistance.notes}
                      onChange={(e) => updateNestedRecord('dailyLifeSupport', 'mealAssistance', 'notes', e.target.value)}
                      rows={2}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 入浴支援 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-semibold text-gray-900 mb-4">入浴支援</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">支援頻度（週）</label>
                    <input
                      type="number"
                      value={record.dailyLifeSupport.bathingAssistance.frequency}
                      onChange={(e) => updateNestedRecord('dailyLifeSupport', 'bathingAssistance', 'frequency', parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">支援レベル</label>
                    <select
                      value={record.dailyLifeSupport.bathingAssistance.supportLevel}
                      onChange={(e) => updateNestedRecord('dailyLifeSupport', 'bathingAssistance', 'supportLevel', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="independent">自立</option>
                      <option value="partial">一部介助</option>
                      <option value="full">全介助</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
                    <textarea
                      value={record.dailyLifeSupport.bathingAssistance.notes}
                      onChange={(e) => updateNestedRecord('dailyLifeSupport', 'bathingAssistance', 'notes', e.target.value)}
                      rows={2}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 服薬管理 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  <Pill className="w-4 h-4 mr-2" />
                  服薬管理
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">薬剤数</label>
                    <input
                      type="number"
                      value={record.dailyLifeSupport.medicationManagement.medicationCount}
                      onChange={(e) => updateNestedRecord('dailyLifeSupport', 'medicationManagement', 'medicationCount', parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">管理方法</label>
                    <select
                      value={record.dailyLifeSupport.medicationManagement.administrationMethod}
                      onChange={(e) => updateNestedRecord('dailyLifeSupport', 'medicationManagement', 'administrationMethod', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="self">自己管理</option>
                      <option value="reminder">声かけ</option>
                      <option value="assistance">一部介助</option>
                      <option value="full">完全管理</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
                    <textarea
                      value={record.dailyLifeSupport.medicationManagement.notes}
                      onChange={(e) => updateNestedRecord('dailyLifeSupport', 'medicationManagement', 'notes', e.target.value)}
                      rows={2}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                健康状態・医療的ケア
              </h3>
              
              {/* バイタルサイン */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-semibold text-gray-900 mb-4">バイタルサイン（期間平均）</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">血圧（平均）</label>
                    <input
                      type="text"
                      value={record.healthStatus.vitalSigns.bloodPressure.average}
                      onChange={(e) => updateNestedRecord('healthStatus', 'vitalSigns', 'bloodPressure', {
                        ...record.healthStatus.vitalSigns.bloodPressure,
                        average: e.target.value
                      })}
                      placeholder="135/80"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">脈拍（平均）</label>
                    <input
                      type="number"
                      value={record.healthStatus.vitalSigns.pulse.average}
                      onChange={(e) => updateNestedRecord('healthStatus', 'vitalSigns', 'pulse', {
                        ...record.healthStatus.vitalSigns.pulse,
                        average: parseInt(e.target.value)
                      })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">体温（平均）</label>
                    <input
                      type="number"
                      step="0.1"
                      value={record.healthStatus.vitalSigns.temperature.average}
                      onChange={(e) => updateNestedRecord('healthStatus', 'vitalSigns', 'temperature', {
                        ...record.healthStatus.vitalSigns.temperature,
                        average: parseFloat(e.target.value)
                      })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">体重（現在）</label>
                    <input
                      type="number"
                      step="0.1"
                      value={record.healthStatus.vitalSigns.weight.current}
                      onChange={(e) => updateNestedRecord('healthStatus', 'vitalSigns', 'weight', {
                        ...record.healthStatus.vitalSigns.weight,
                        current: parseFloat(e.target.value)
                      })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 精神状態 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-semibold text-gray-900 mb-4">精神・認知機能</h4>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">認知機能</label>
                    <select
                      value={record.healthStatus.mentalStatus.cognitiveFunction}
                      onChange={(e) => updateNestedRecord('healthStatus', 'mentalStatus', 'cognitiveFunction', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="good">良好</option>
                      <option value="fair">普通</option>
                      <option value="declining">軽度低下</option>
                      <option value="poor">著明低下</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">社会的交流</label>
                    <select
                      value={record.healthStatus.mentalStatus.socialInteraction}
                      onChange={(e) => updateNestedRecord('healthStatus', 'mentalStatus', 'socialInteraction', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">積極的</option>
                      <option value="moderate">適度</option>
                      <option value="limited">限定的</option>
                      <option value="withdrawn">引きこもり傾向</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">情緒安定性</label>
                    <select
                      value={record.healthStatus.mentalStatus.emotionalStability}
                      onChange={(e) => updateNestedRecord('healthStatus', 'mentalStatus', 'emotionalStability', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="stable">安定</option>
                      <option value="occasionally_unstable">時々不安定</option>
                      <option value="unstable">不安定</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">詳細所見</label>
                  <textarea
                    value={record.healthStatus.mentalStatus.notes}
                    onChange={(e) => updateNestedRecord('healthStatus', 'mentalStatus', 'notes', e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 医療イベント */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-semibold text-gray-900 mb-4">期間中の医療イベント</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">入院回数</label>
                    <input
                      type="number"
                      value={record.healthStatus.medicalEvents.hospitalizations}
                      onChange={(e) => updateNestedRecord('healthStatus', 'medicalEvents', 'hospitalizations', parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">救急外来受診回数</label>
                    <input
                      type="number"
                      value={record.healthStatus.medicalEvents.emergencyVisits}
                      onChange={(e) => updateNestedRecord('healthStatus', 'medicalEvents', 'emergencyVisits', parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                社会活動・地域参加
              </h3>
              
              {/* 集団活動 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-semibold text-gray-900 mb-4">集団活動への参加</h4>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">参加度</label>
                    <select
                      value={record.socialActivities.groupActivities.participation}
                      onChange={(e) => updateNestedRecord('socialActivities', 'groupActivities', 'participation', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">積極的</option>
                      <option value="moderate">適度</option>
                      <option value="limited">限定的</option>
                      <option value="none">参加なし</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">好みの活動</label>
                    <input
                      type="text"
                      value={record.socialActivities.groupActivities.preferredActivities.join(', ')}
                      onChange={(e) => updateNestedRecord('socialActivities', 'groupActivities', 'preferredActivities', e.target.value.split(', '))}
                      placeholder="音楽療法, 手芸, 園芸"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">参加状況詳細</label>
                  <textarea
                    value={record.socialActivities.groupActivities.notes}
                    onChange={(e) => updateNestedRecord('socialActivities', 'groupActivities', 'notes', e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 地域社会参加 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-semibold text-gray-900 mb-4">地域社会参加</h4>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">外出回数</label>
                    <input
                      type="number"
                      value={record.socialActivities.communityIntegration.outings}
                      onChange={(e) => updateNestedRecord('socialActivities', 'communityIntegration', 'outings', parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">家族面会回数</label>
                    <input
                      type="number"
                      value={record.socialActivities.communityIntegration.familyVisits}
                      onChange={(e) => updateNestedRecord('socialActivities', 'communityIntegration', 'familyVisits', parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">友人交流回数</label>
                    <input
                      type="number"
                      value={record.socialActivities.communityIntegration.friendInteractions}
                      onChange={(e) => updateNestedRecord('socialActivities', 'communityIntegration', 'friendInteractions', parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">社会参加状況詳細</label>
                  <textarea
                    value={record.socialActivities.communityIntegration.notes}
                    onChange={(e) => updateNestedRecord('socialActivities', 'communityIntegration', 'notes', e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evaluation' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clipboard className="w-5 h-5 mr-2" />
                サービス評価・今後の方針
              </h3>
              
              {/* 目標達成度 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-semibold text-gray-900 mb-4">目標達成度評価</h4>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">短期目標達成度</label>
                    <select
                      value={record.serviceEvaluation.goalAchievement.shortTermProgress}
                      onChange={(e) => updateNestedRecord('serviceEvaluation', 'goalAchievement', 'shortTermProgress', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="exceeded">目標を上回る</option>
                      <option value="achieved">目標達成</option>
                      <option value="progressing">順調に進歩</option>
                      <option value="not_achieved">未達成</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">長期目標達成度</label>
                    <select
                      value={record.serviceEvaluation.goalAchievement.longTermProgress}
                      onChange={(e) => updateNestedRecord('serviceEvaluation', 'goalAchievement', 'longTermProgress', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="exceeded">目標を上回る</option>
                      <option value="achieved">目標達成</option>
                      <option value="progressing">順調に進歩</option>
                      <option value="not_achieved">未達成</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">達成度詳細評価</label>
                  <textarea
                    value={record.serviceEvaluation.goalAchievement.notes}
                    onChange={(e) => updateNestedRecord('serviceEvaluation', 'goalAchievement', 'notes', e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 満足度評価 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-semibold text-gray-900 mb-4">満足度評価</h4>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">利用者満足度</label>
                    <select
                      value={record.serviceEvaluation.serviceQuality.userSatisfaction}
                      onChange={(e) => updateNestedRecord('serviceEvaluation', 'serviceQuality', 'userSatisfaction', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="very_satisfied">非常に満足</option>
                      <option value="satisfied">満足</option>
                      <option value="neutral">普通</option>
                      <option value="unsatisfied">不満</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">家族満足度</label>
                    <select
                      value={record.serviceEvaluation.serviceQuality.familySatisfaction}
                      onChange={(e) => updateNestedRecord('serviceEvaluation', 'serviceQuality', 'familySatisfaction', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="very_satisfied">非常に満足</option>
                      <option value="satisfied">満足</option>
                      <option value="neutral">普通</option>
                      <option value="unsatisfied">不満</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">職員評価</label>
                    <select
                      value={record.serviceEvaluation.serviceQuality.staffAssessment}
                      onChange={(e) => updateNestedRecord('serviceEvaluation', 'serviceQuality', 'staffAssessment', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="excellent">優秀</option>
                      <option value="good">良好</option>
                      <option value="fair">普通</option>
                      <option value="needs_improvement">要改善</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 今後の方針 */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-base font-semibold text-blue-900 mb-4">今後のサービス方針</h4>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-blue-800 mb-1">サービス継続方針</label>
                  <select
                    value={record.serviceEvaluation.recommendations.serviceContinuation}
                    onChange={(e) => updateNestedRecord('serviceEvaluation', 'recommendations', 'serviceContinuation', e.target.value)}
                    className="w-full p-2 border border-blue-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="continue">現状継続</option>
                    <option value="modify">内容変更</option>
                    <option value="increase">増加</option>
                    <option value="decrease">減少</option>
                    <option value="discontinue">終了</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-blue-800 mb-1">提案される変更内容</label>
                  <textarea
                    value={record.serviceEvaluation.recommendations.proposedChanges.join('\n')}
                    onChange={(e) => updateNestedRecord('serviceEvaluation', 'recommendations', 'proposedChanges', e.target.value.split('\n'))}
                    rows={3}
                    placeholder="提案される変更内容を1行ずつ入力してください"
                    className="w-full p-2 border border-blue-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">優先的な支援領域</label>
                  <textarea
                    value={record.serviceEvaluation.recommendations.priorityAreas.join('\n')}
                    onChange={(e) => updateNestedRecord('serviceEvaluation', 'recommendations', 'priorityAreas', e.target.value.split('\n'))}
                    rows={3}
                    placeholder="優先的な支援領域を1行ずつ入力してください"
                    className="w-full p-2 border border-blue-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* フッター情報 */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              作成日: {record.createdAt.toLocaleDateString('ja-JP')}
              {record.updatedAt.getTime() !== record.createdAt.getTime() && (
                <span className="ml-4">
                  最終更新: {record.updatedAt.toLocaleDateString('ja-JP')} {record.updatedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            {record.submittedAt && (
              <div className="text-green-600">
                提出日: {record.submittedAt.toLocaleDateString('ja-JP')} {record.submittedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>

        {/* プレビューモーダル */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    モニタリング記録プレビュー
                  </h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {record.userName}様の国提出用モニタリング記録（デモ版）
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* 基本情報セクション */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    基本情報
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">利用者氏名:</span>
                      <span className="ml-2">{record.userName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">年齢:</span>
                      <span className="ml-2">{record.personalInfo.age}歳</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">要介護度:</span>
                      <span className="ml-2">{record.personalInfo.careLevel}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">対象期間:</span>
                      <span className="ml-2">
                        {new Date(record.period.startDate).toLocaleDateString('ja-JP')} ～ {new Date(record.period.endDate).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="font-medium text-gray-700">障害の種類:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {record.personalInfo.disabilityType.map((type, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* サービス目標セクション */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    サービス目標・達成状況
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">短期目標:</span>
                      <ul className="mt-1 ml-4 list-disc">
                        {record.serviceGoals.shortTerm.map((goal, index) => (
                          <li key={index}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">達成度:</span>
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {getProgressText(record.serviceEvaluation.goalAchievement.shortTermProgress)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 健康状態セクション */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    健康状態・医療的ケア
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">バイタルサイン平均:</span>
                      <div className="mt-1 space-y-1">
                        <div>血圧: {record.healthStatus.vitalSigns.bloodPressure.average}</div>
                        <div>脈拍: {record.healthStatus.vitalSigns.pulse.average}/分</div>
                        <div>体温: {record.healthStatus.vitalSigns.temperature.average}℃</div>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">精神・認知状態:</span>
                      <div className="mt-1 space-y-1">
                        <div>認知機能: {record.healthStatus.mentalStatus.cognitiveFunction === 'good' ? '良好' : record.healthStatus.mentalStatus.cognitiveFunction === 'fair' ? '普通' : '軽度低下'}</div>
                        <div>社会的交流: {record.healthStatus.mentalStatus.socialInteraction === 'active' ? '積極的' : '適度'}</div>
                        <div>情緒安定性: {record.healthStatus.mentalStatus.emotionalStability === 'stable' ? '安定' : '時々不安定'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 日常生活支援セクション */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    日常生活支援の実施状況
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">食事支援:</span>
                      <div className="mt-1">
                        週{record.dailyLifeSupport.mealAssistance.frequency}回 ({getSupportLevelText(record.dailyLifeSupport.mealAssistance.supportLevel)})
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">入浴支援:</span>
                      <div className="mt-1">
                        週{record.dailyLifeSupport.bathingAssistance.frequency}回 ({getSupportLevelText(record.dailyLifeSupport.bathingAssistance.supportLevel)})
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">服薬管理:</span>
                      <div className="mt-1">
                        {record.dailyLifeSupport.medicationManagement.medicationCount}種類の薬剤を{record.dailyLifeSupport.medicationManagement.administrationMethod === 'reminder' ? '声かけ' : '一部介助'}で管理
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">移動支援:</span>
                      <div className="mt-1">
                        {record.dailyLifeSupport.mobilitySupport.assistiveDevices.join('、')}使用 ({getSupportLevelText(record.dailyLifeSupport.mobilitySupport.supportLevel)})
                      </div>
                    </div>
                  </div>
                </div>

                {/* サービス評価セクション */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Clipboard className="w-5 h-5 mr-2" />
                    サービス評価・今後の方針
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">利用者満足度:</span>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {getSatisfactionText(record.serviceEvaluation.serviceQuality.userSatisfaction)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">家族満足度:</span>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {getSatisfactionText(record.serviceEvaluation.serviceQuality.familySatisfaction)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">サービス継続方針:</span>
                      <span className="ml-2">
                        {record.serviceEvaluation.recommendations.serviceContinuation === 'continue' ? '現状継続' : 
                         record.serviceEvaluation.recommendations.serviceContinuation === 'modify' ? '内容変更' : '要検討'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">職員評価:</span>
                      <span className="ml-2">
                        {record.serviceEvaluation.serviceQuality.staffAssessment === 'excellent' ? '優秀' :
                         record.serviceEvaluation.serviceQuality.staffAssessment === 'good' ? '良好' : '普通'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Claude API 説明セクション */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    実装予定機能について
                  </h4>
                  <div className="text-sm text-blue-800">
                    <p className="mb-2">
                      <strong>Claude API連携機能（開発予定）:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>日報データを基にClaude APIが詳細なモニタリング記録を自動生成</li>
                      <li>利用者の状況変化を分析し、適切な支援計画を提案</li>
                      <li>国の指針に基づいた正確な評価基準での自動評価</li>
                      <li>過去のモニタリング記録との比較分析</li>
                      <li>個別のニーズに応じた推奨事項の生成</li>
                    </ul>
                    <p className="mt-3 text-xs text-blue-600">
                      ※ 現在表示されているのはデモ用のサンプルデータです。実際の運用では、日報から収集されたデータを基にClaude APIがより詳細で専門的なモニタリング記録を生成します。
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
                  >
                    閉じる
                  </button>
                  <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg flex items-center justify-center">
                    <Download className="w-4 h-4 mr-2" />
                    PDF出力（デモ）
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}