'use client'

import { useState, useEffect, Suspense } from 'react'
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
  Target,
  Clock,
  MapPin,
  BookOpen,
  Star
} from 'lucide-react'

// 支援計画書の型定義
interface SupportPlan {
  id: string
  userId: string
  userName: string
  monitoringRecordId?: string
  period: {
    startDate: string
    endDate: string
  }
  personalInfo: {
    age: number
    careLevel: string
    disabilityType: string[]
    medicalConditions: string[]
    currentNeeds: string[]
    strengths: string[]
  }
  assessmentSummary: {
    physicalFunction: 'excellent' | 'good' | 'fair' | 'declining' | 'poor'
    cognitiveFunction: 'excellent' | 'good' | 'fair' | 'declining' | 'poor'
    socialFunction: 'excellent' | 'good' | 'fair' | 'declining' | 'poor'
    emotionalWellbeing: 'excellent' | 'good' | 'fair' | 'declining' | 'poor'
    overallAssessment: string
  }
  supportGoals: {
    primary: {
      goal: string
      timeframe: string
      measurableOutcomes: string[]
      methods: string[]
    }[]
    secondary: {
      goal: string
      timeframe: string
      measurableOutcomes: string[]
      methods: string[]
    }[]
  }
  serviceDetails: {
    dailySupport: {
      type: string
      frequency: string
      duration: string
      staff: string
      location: string
      methods: string[]
    }[]
    specializedServices: {
      type: string
      provider: string
      frequency: string
      purpose: string
      expectedOutcome: string
    }[]
  }
  riskManagement: {
    identifiedRisks: {
      risk: string
      severity: 'low' | 'medium' | 'high'
      preventionMeasures: string[]
      responseProtocol: string
    }[]
    emergencyContacts: {
      name: string
      relationship: string
      phone: string
      priority: number
    }[]
  }
  reviewSchedule: {
    regularReview: string
    emergencyReview: string
    nextPlannedReview: string
    reviewCriteria: string[]
  }
  qualityAssurance: {
    monitoringMethods: string[]
    performanceIndicators: string[]
    feedbackSources: string[]
    improvementMechanisms: string[]
  }
  createdAt: Date
  updatedAt: Date
  submittedAt?: Date
  status: 'draft' | 'completed' | 'submitted'
  approvedBy?: string
  approvedAt?: Date
}

// サブコンポーネント: useSearchParams を使用する部分
function SupportPlanPageContent() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [plan, setPlan] = useState<SupportPlan | null>(null)
  const [activeTab, setActiveTab] = useState('basic')
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const monitoringId = searchParams.get('monitoringId')

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
        // スタッフも支援計画機能を利用可能
        // 管理者とスタッフ以外の場合のみリダイレクト
        if (user.role !== 'admin' && user.role !== 'staff') {
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

  // 支援計画書の初期化
  useEffect(() => {
    if (userId) {
      const targetUser = serviceUsers.find(u => u.id === userId)
      if (targetUser) {
        // 既存計画書があるかチェック（実際の実装ではFirestoreから取得）
        const existingPlan = null // デモ用

        if (existingPlan) {
          setPlan(existingPlan)
        } else {
          // 新規支援計画書の作成（モニタリング記録のデータを活用）
          const newPlan: SupportPlan = {
            id: `support-plan-${userId}-${Date.now()}`,
            userId: targetUser.id,
            userName: targetUser.name,
            monitoringRecordId: monitoringId || undefined,
            period: {
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1年後
            },
            personalInfo: {
              age: targetUser.age,
              careLevel: targetUser.careLevel,
              disabilityType: targetUser.disabilityType,
              medicalConditions: targetUser.medicalConditions,
              currentNeeds: ['日常生活動作の支援', '服薬管理', '社会参加の促進', '健康状態の維持'],
              strengths: ['協調性がある', 'コミュニケーション能力が良好', '前向きな姿勢', '家族のサポートが充実']
            },
            assessmentSummary: {
              physicalFunction: 'fair',
              cognitiveFunction: targetUser.id === 'user2' ? 'declining' : 'good',
              socialFunction: 'good',
              emotionalWellbeing: 'good',
              overallAssessment: 'モニタリング記録に基づき、現在の支援レベルは適切です。身体機能の維持と社会参加の促進を重点的に支援する必要があります。'
            },
            supportGoals: {
              primary: [
                {
                  goal: '日常生活動作の自立度向上',
                  timeframe: '6か月',
                  measurableOutcomes: ['食事摂取量90%以上の維持', '歩行距離50m以上の達成', '入浴時の安全確保100%'],
                  methods: ['個別リハビリテーション', '栄養管理', '安全確保のための見守り', '機能訓練の実施']
                },
                {
                  goal: '社会参加活動の継続',
                  timeframe: '継続的',
                  measurableOutcomes: ['月4回以上の集団活動参加', '地域行事への年2回以上参加', '家族との交流月2回以上'],
                  methods: ['集団レクリエーション', '外出支援', '家族との連携強化', 'コミュニティ活動の紹介']
                }
              ],
              secondary: [
                {
                  goal: '健康状態の安定維持',
                  timeframe: '継続的',
                  measurableOutcomes: ['バイタルサインの正常範囲維持', '服薬遵守率100%', '体重の適正範囲維持'],
                  methods: ['定期的なバイタルチェック', '服薬管理の徹底', '栄養バランスの調整', '健康教育']
                }
              ]
            },
            serviceDetails: {
              dailySupport: [
                {
                  type: '身体介護（食事・入浴・排泄支援）',
                  frequency: '週7回',
                  duration: '1日3時間',
                  staff: '介護職員2名体制',
                  location: 'デイサービス施設内',
                  methods: ['見守り', '一部介助', '声かけ', '環境整備']
                },
                {
                  type: '機能訓練・リハビリテーション',
                  frequency: '週3回',
                  duration: '1回30分',
                  staff: '機能訓練指導員',
                  location: '機能訓練室',
                  methods: ['歩行訓練', '筋力トレーニング', 'バランス訓練', 'ADL訓練']
                },
                {
                  type: '社会参加支援',
                  frequency: '週2回',
                  duration: '1回2時間',
                  staff: '生活相談員・介護職員',
                  location: '地域施設・事業所内',
                  methods: ['集団活動', '創作活動', '季節行事', '外出支援']
                }
              ],
              specializedServices: [
                {
                  type: '栄養指導',
                  provider: '管理栄養士',
                  frequency: '月1回',
                  purpose: '糖尿病・高血圧の食事管理',
                  expectedOutcome: '血糖値・血圧の安定化'
                },
                {
                  type: '服薬指導',
                  provider: '看護師',
                  frequency: '週1回',
                  purpose: '適切な服薬管理と副作用モニタリング',
                  expectedOutcome: '服薬遵守率の向上と副作用の予防'
                }
              ]
            },
            riskManagement: {
              identifiedRisks: [
                {
                  risk: '転倒による骨折',
                  severity: 'medium',
                  preventionMeasures: ['歩行器の使用', '滑り止めマットの設置', '十分な照明の確保', '定期的な環境整備'],
                  responseProtocol: '転倒発生時は即座にバイタル確認、医療機関受診、家族への連絡を実施'
                },
                {
                  risk: '血糖値の急激な変動',
                  severity: 'medium',
                  preventionMeasures: ['定期的な血糖測定', '食事時間の規則化', '医師との定期相談', '症状観察の徹底'],
                  responseProtocol: '異常値検出時は医療機関への即時連絡、緊急時対応マニュアルに従う'
                }
              ],
              emergencyContacts: [
                {
                  name: targetUser.emergencyContact.name,
                  relationship: targetUser.emergencyContact.relationship,
                  phone: targetUser.emergencyContact.phone,
                  priority: 1
                },
                {
                  name: '主治医（田中内科クリニック）',
                  relationship: '医療機関',
                  phone: '03-1234-5678',
                  priority: 2
                },
                {
                  name: '施設管理者',
                  relationship: '事業所',
                  phone: '03-9876-5432',
                  priority: 3
                }
              ]
            },
            reviewSchedule: {
              regularReview: '3か月ごと',
              emergencyReview: '状況変化時随時',
              nextPlannedReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              reviewCriteria: ['目標達成状況の評価', '健康状態の変化', '家族の意向変化', 'サービス満足度の確認']
            },
            qualityAssurance: {
              monitoringMethods: ['日次記録の確認', '月次カンファレンス', '利用者・家族面談', '多職種連携会議'],
              performanceIndicators: ['目標達成率', '利用者満足度', '家族満足度', 'インシデント発生率', 'サービス利用継続率'],
              feedbackSources: ['利用者本人', '家族', '関係職員', '関係機関', '医療従事者'],
              improvementMechanisms: ['定期的な計画見直し', '職員研修の実施', 'サービス改善提案制度', '外部評価の活用']
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'draft'
          }
          setPlan(newPlan)
        }
      }
    }
  }, [userId, monitoringId])

  const handleSave = async () => {
    if (!plan || !user) return

    setSaving(true)
    try {
      // LocalStorageに保存
      const updatedPlan = {
        ...plan,
        updatedAt: new Date(),
        createdBy: plan.createdBy || user.uid,
        createdByName: plan.createdByName || user.name,
        createdAt: plan.createdAt || new Date()
      }
      setPlan(updatedPlan)

      // 既存のデータを取得
      const existingData = localStorage.getItem('supportPlans')
      let plans = existingData ? JSON.parse(existingData) : []

      // 既存計画書を更新または新規追加
      const existingIndex = plans.findIndex((p: any) => p.id === updatedPlan.id)
      if (existingIndex >= 0) {
        plans[existingIndex] = updatedPlan
      } else {
        plans.push(updatedPlan)
      }

      // LocalStorageに保存
      localStorage.setItem('supportPlans', JSON.stringify(plans))

      await new Promise(resolve => setTimeout(resolve, 500)) // デモ用遅延

      alert('支援計画書を保存しました')
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = async () => {
    if (!plan) return

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

  // AI生成デモ機能（モニタリング記録を基に支援計画書を自動生成）
  const handleAIGenerate = async () => {
    if (!plan) return

    setIsGenerating(true)
    try {
      // デモ用：段階的なローディングメッセージ
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 生成されたデータで更新（実際のアプリではClaude APIを呼び出す）
      const enhancedAssessment = `【総合アセスメント結果】

モニタリング記録および日報データの詳細分析に基づき、${plan.userName}様の現状を以下のように評価します。

■ 身体機能評価
現在の身体機能は年齢相応で、基本的なADL（日常生活動作）は概ね自立されています。歩行器を使用した移動は安定しており、転倒リスクへの適切な対策が実施されています。バイタルサインは安定範囲内で推移しており、健康管理は良好です。今後も定期的な機能訓練により、現在の身体機能の維持・向上が期待できます。

■ 認知機能評価
日常会話や簡単な判断については問題なく、施設内での生活にも適応されています。軽度の記憶力低下は見られますが、声かけやサポートにより日常生活は円滑に営まれています。レクリエーション活動への参加意欲も高く、認知機能の維持に向けた取り組みが効果的に機能しています。

■ 社会性・コミュニケーション
他の利用者様やスタッフとの交流は良好で、積極的に集団活動に参加されています。家族との関係も良好に維持されており、定期的な面会が実施されています。地域社会との繋がりを大切にされており、外出支援プログラムへの参加希望も表明されています。

■ 精神的健康
情緒は安定しており、施設生活にも満足されています。創作活動や音楽療法など、ご自身の興味のある活動に意欲的に取り組まれており、生活の質は良好に保たれています。ご家族のサポートも充実しており、心理的な安定が図られています。`

      setPlan(prev => {
        if (!prev) return prev
        return {
          ...prev,
          assessmentSummary: {
            ...prev.assessmentSummary,
            overallAssessment: enhancedAssessment
          },
          supportGoals: {
            primary: [
              {
                goal: '身体機能の維持・向上による自立生活の継続',
                timeframe: '6か月',
                measurableOutcomes: [
                  '歩行距離100m以上の達成（現在50m）',
                  '階段昇降時の手すり使用のみでの自立',
                  '入浴動作の見守りレベルでの完遂',
                  'バランス評価テストでの得点5点向上'
                ],
                methods: [
                  '個別機能訓練プログラム（週3回、各30分）',
                  '歩行訓練とバランス訓練の組み合わせ',
                  '理学療法士による専門的指導',
                  '日常生活での実践的トレーニング'
                ]
              },
              {
                goal: '社会参加活動の充実と生活の質の向上',
                timeframe: '継続的',
                measurableOutcomes: [
                  '集団活動への参加頻度：週4回以上',
                  '外出支援プログラムへの参加：月4回以上',
                  '創作活動での作品制作：月2作品以上',
                  '家族・友人との交流：月4回以上'
                ],
                methods: [
                  '多様なレクリエーションプログラムの提供',
                  '地域イベントへの参加支援',
                  '趣味活動（手芸、音楽）の継続的サポート',
                  '家族との連携強化と面会機会の確保'
                ]
              },
              {
                goal: '認知機能の維持と心理的安定の確保',
                timeframe: '継続的',
                measurableOutcomes: [
                  '認知機能評価テストでの現状維持',
                  '服薬管理の自立継続（声かけレベル）',
                  '日常会話でのコミュニケーション能力の維持',
                  '情緒の安定と生活満足度の維持'
                ],
                methods: [
                  '認知症予防プログラムへの参加',
                  '回想法や音楽療法の活用',
                  '定期的な傾聴とコミュニケーション',
                  '家族との協力による環境整備'
                ]
              }
            ],
            secondary: [
              {
                goal: '健康状態の安定維持と疾病管理',
                timeframe: '継続的',
                measurableOutcomes: [
                  'バイタルサインの正常範囲維持率95%以上',
                  '服薬遵守率100%の継続',
                  '体重の適正範囲維持（±2kg以内）',
                  '定期健康診断での異常所見なし'
                ],
                methods: [
                  '毎日のバイタルチェックと記録',
                  '看護師による健康管理と服薬指導',
                  '栄養管理と適切な食事提供',
                  '主治医との定期的な連携'
                ]
              },
              {
                goal: '安全な生活環境の維持とリスク管理',
                timeframe: '継続的',
                measurableOutcomes: [
                  '転倒・事故発生件数：0件',
                  '環境安全チェックリスト遵守率100%',
                  '緊急時対応訓練の定期実施（月1回）',
                  'リスク評価の定期更新（3か月毎）'
                ],
                methods: [
                  '居室・共有スペースの安全確保',
                  '転倒予防対策の徹底',
                  '緊急時対応マニュアルの整備',
                  'スタッフへの安全教育の実施'
                ]
              }
            ]
          },
          serviceDetails: {
            ...prev.serviceDetails,
            specializedServices: [
              ...prev.serviceDetails.specializedServices,
              {
                type: '心理カウンセリング',
                provider: '臨床心理士',
                frequency: '月2回',
                purpose: '心理的安定の維持と生活満足度の向上',
                expectedOutcome: 'ストレス軽減と精神的健康の維持'
              },
              {
                type: '作業療法',
                provider: '作業療法士',
                frequency: '週2回',
                purpose: '手指機能の維持と創作活動の支援',
                expectedOutcome: '巧緻動作の維持と生活意欲の向上'
              }
            ]
          },
          qualityAssurance: {
            ...prev.qualityAssurance,
            improvementMechanisms: [
              '月次カンファレンスでの多職種による評価と改善策検討',
              '家族参加型のケア計画見直し会議の実施',
              '利用者様の意見・要望の定期的な聴取',
              '職員研修の実施による支援の質向上',
              '外部評価・第三者評価の活用',
              'PDCAサイクルに基づく継続的改善'
            ]
          },
          updatedAt: new Date()
        }
      })

      alert('AI生成が完了しました。モニタリング記録を基に詳細な支援計画書が作成されました。')

    } catch (error) {
      console.error('AI生成エラー:', error)
      alert('AI生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const updatePlan = (section: string, field: string, value: any) => {
    if (!plan) return
    
    setPlan(prev => {
      if (!prev) return prev
      return {
        ...prev,
        [section]: {
          ...(prev[section as keyof SupportPlan] as object),
          [field]: value
        },
        updatedAt: new Date()
      }
    })
  }

  const getAssessmentText = (level: string) => {
    switch (level) {
      case 'excellent': return '優秀'
      case 'good': return '良好'
      case 'fair': return '普通'
      case 'declining': return '低下傾向'
      case 'poor': return '不良'
      default: return level
    }
  }

  const getRiskSeverityText = (severity: string) => {
    switch (severity) {
      case 'low': return '低リスク'
      case 'medium': return '中リスク'
      case 'high': return '高リスク'
      default: return severity
    }
  }

  const getRiskSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
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

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return null
  }

  // ユーザーが選択されていない場合は選択画面を表示
  if (!plan && !userId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar userRole={user.role} />
        
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="mb-6">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/monitoring')}
                className="mr-3 p-2 text-gray-600 hover:text-gray-900 btn-touch"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  支援計画書作成
                </h1>
                <p className="text-gray-600">
                  計画書を作成する利用者様を選択してください
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
                    onClick={() => router.push(`/support-plan?userId=${serviceUser.id}`)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-orange-600" />
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
                    <div className="mt-3 flex items-center text-orange-600">
                      <BookOpen className="w-4 h-4 mr-1" />
                      <span className="text-sm">支援計画書作成</span>
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

  if (!plan) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={user.role} />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/monitoring')}
                className="mr-3 p-2 text-gray-600 hover:text-gray-900 btn-touch"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  支援計画書作成
                </h1>
                <p className="text-gray-600">
                  {plan.userName}様の国提出用個別支援計画書
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-500">
                    計画期間: {new Date(plan.period.startDate).toLocaleDateString('ja-JP')} ～ {new Date(plan.period.endDate).toLocaleDateString('ja-JP')}
                  </span>
                  {plan.monitoringRecordId && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      モニタリング記録連携
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    plan.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    plan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {plan.status === 'draft' ? '下書き' :
                     plan.status === 'completed' ? '作成完了' : '提出済み'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating}
                className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 flex items-center btn-touch shadow-lg"
              >
                <BookOpen className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-pulse' : ''}`} />
                {isGenerating ? 'AI作成中...' : 'AI自動作成'}
              </button>
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
                { id: 'assessment', label: '総合評価', icon: BarChart3 },
                { id: 'goals', label: '支援目標', icon: Target },
                { id: 'services', label: 'サービス詳細', icon: Heart },
                { id: 'risks', label: 'リスク管理', icon: Shield },
                { id: 'quality', label: '品質保証', icon: Star }
              ].map(tab => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
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
                    <span className="text-gray-900">{plan.userName}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">年齢</label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <span className="text-gray-900">{plan.personalInfo.age}歳</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">要介護度</label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <span className="text-gray-900">{plan.personalInfo.careLevel}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">計画期間</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={plan.period.startDate}
                      onChange={(e) => updatePlan('period', 'startDate', e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
                    />
                    <input
                      type="date"
                      value={plan.period.endDate}
                      onChange={(e) => updatePlan('period', 'endDate', e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">現在のニーズ</label>
                <textarea
                  value={plan.personalInfo.currentNeeds.join('\n')}
                  onChange={(e) => updatePlan('personalInfo', 'currentNeeds', e.target.value.split('\n'))}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  placeholder="現在のニーズを1行ずつ入力してください"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">本人の強み・特性</label>
                <textarea
                  value={plan.personalInfo.strengths.join('\n')}
                  onChange={(e) => updatePlan('personalInfo', 'strengths', e.target.value.split('\n'))}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  placeholder="本人の強みや特性を1行ずつ入力してください"
                />
              </div>
            </div>
          )}

          {activeTab === 'assessment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                総合評価・アセスメント
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">身体機能</label>
                  <select
                    value={plan.assessmentSummary.physicalFunction}
                    onChange={(e) => updatePlan('assessmentSummary', 'physicalFunction', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="excellent">優秀</option>
                    <option value="good">良好</option>
                    <option value="fair">普通</option>
                    <option value="declining">低下傾向</option>
                    <option value="poor">不良</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">認知機能</label>
                  <select
                    value={plan.assessmentSummary.cognitiveFunction}
                    onChange={(e) => updatePlan('assessmentSummary', 'cognitiveFunction', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="excellent">優秀</option>
                    <option value="good">良好</option>
                    <option value="fair">普通</option>
                    <option value="declining">低下傾向</option>
                    <option value="poor">不良</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">社会機能</label>
                  <select
                    value={plan.assessmentSummary.socialFunction}
                    onChange={(e) => updatePlan('assessmentSummary', 'socialFunction', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="excellent">優秀</option>
                    <option value="good">良好</option>
                    <option value="fair">普通</option>
                    <option value="declining">低下傾向</option>
                    <option value="poor">不良</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">精神的健康</label>
                  <select
                    value={plan.assessmentSummary.emotionalWellbeing}
                    onChange={(e) => updatePlan('assessmentSummary', 'emotionalWellbeing', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="excellent">優秀</option>
                    <option value="good">良好</option>
                    <option value="fair">普通</option>
                    <option value="declining">低下傾向</option>
                    <option value="poor">不良</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">総合的なアセスメント</label>
                <textarea
                  value={plan.assessmentSummary.overallAssessment}
                  onChange={(e) => updatePlan('assessmentSummary', 'overallAssessment', e.target.value)}
                  rows={5}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  placeholder="モニタリング記録や観察に基づく総合的な評価を記載してください"
                />
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                支援目標・計画
              </h3>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-base font-semibold text-blue-900 mb-4">主要目標</h4>
                {plan.supportGoals.primary.map((goal, index) => (
                  <div key={index} className="mb-4 p-4 bg-white rounded border">
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">目標</label>
                        <input
                          type="text"
                          value={goal.goal}
                          onChange={(e) => {
                            const updatedGoals = [...plan.supportGoals.primary]
                            updatedGoals[index].goal = e.target.value
                            updatePlan('supportGoals', 'primary', updatedGoals)
                          }}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">期間</label>
                        <input
                          type="text"
                          value={goal.timeframe}
                          onChange={(e) => {
                            const updatedGoals = [...plan.supportGoals.primary]
                            updatedGoals[index].timeframe = e.target.value
                            updatePlan('supportGoals', 'primary', updatedGoals)
                          }}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">測定可能な成果</label>
                      <textarea
                        value={goal.measurableOutcomes.join('\n')}
                        onChange={(e) => {
                          const updatedGoals = [...plan.supportGoals.primary]
                          updatedGoals[index].measurableOutcomes = e.target.value.split('\n')
                          updatePlan('supportGoals', 'primary', updatedGoals)
                        }}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
                        placeholder="測定可能な成果を1行ずつ入力してください"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                サービス詳細・提供内容
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-semibold text-gray-900 mb-4">日常的支援サービス</h4>
                {plan.serviceDetails.dailySupport.map((service, index) => (
                  <div key={index} className="mb-4 p-4 bg-white rounded border">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">サービス種類</label>
                        <input
                          type="text"
                          value={service.type}
                          className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">頻度</label>
                        <input
                          type="text"
                          value={service.frequency}
                          className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">時間</label>
                        <input
                          type="text"
                          value={service.duration}
                          className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                リスク管理・緊急時対応
              </h3>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="text-base font-semibold text-red-900 mb-4">特定されたリスク</h4>
                {plan.riskManagement.identifiedRisks.map((risk, index) => (
                  <div key={index} className="mb-4 p-4 bg-white rounded border">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">{risk.risk}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs ${getRiskSeverityColor(risk.severity)}`}>
                        {getRiskSeverityText(risk.severity)}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">予防措置</label>
                        <ul className="text-sm text-gray-700 list-disc list-inside">
                          {risk.preventionMeasures.map((measure, i) => (
                            <li key={i}>{measure}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">対応プロトコル</label>
                        <p className="text-sm text-gray-700">{risk.responseProtocol}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-base font-semibold text-blue-900 mb-4">緊急連絡先</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {plan.riskManagement.emergencyContacts.map((contact, index) => (
                    <div key={index} className="p-3 bg-white rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{contact.name}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          優先度 {contact.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{contact.relationship}</p>
                      <p className="text-sm font-mono text-gray-900">{contact.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                品質保証・モニタリング
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">モニタリング方法</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {plan.qualityAssurance.monitoringMethods.map((method, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {method}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">パフォーマンス指標</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {plan.qualityAssurance.performanceIndicators.map((indicator, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {indicator}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="text-base font-semibold text-yellow-900 mb-3">見直しスケジュール</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-yellow-800">定期見直し:</span>
                    <p className="text-yellow-700">{plan.reviewSchedule.regularReview}</p>
                  </div>
                  <div>
                    <span className="font-medium text-yellow-800">緊急見直し:</span>
                    <p className="text-yellow-700">{plan.reviewSchedule.emergencyReview}</p>
                  </div>
                  <div>
                    <span className="font-medium text-yellow-800">次回予定:</span>
                    <p className="text-yellow-700">{new Date(plan.reviewSchedule.nextPlannedReview).toLocaleDateString('ja-JP')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* フッター情報 */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              作成日: {plan.createdAt.toLocaleDateString('ja-JP')}
              {plan.updatedAt.getTime() !== plan.createdAt.getTime() && (
                <span className="ml-4">
                  最終更新: {plan.updatedAt.toLocaleDateString('ja-JP')} {plan.updatedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            {plan.submittedAt && (
              <div className="text-green-600">
                提出日: {plan.submittedAt.toLocaleDateString('ja-JP')} {plan.submittedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>

        {/* プレビューモーダル */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    個別支援計画書プレビュー
                  </h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {plan.userName}様の国提出用個別支援計画書（デモ版）
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* 基本情報セクション */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    利用者基本情報
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">利用者氏名:</span>
                      <span className="ml-2">{plan.userName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">年齢:</span>
                      <span className="ml-2">{plan.personalInfo.age}歳</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">要介護度:</span>
                      <span className="ml-2">{plan.personalInfo.careLevel}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">計画期間:</span>
                      <span className="ml-2">
                        {new Date(plan.period.startDate).toLocaleDateString('ja-JP')} ～ {new Date(plan.period.endDate).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <span className="font-medium text-gray-700">障害の種類:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {plan.personalInfo.disabilityType.map((type, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="font-medium text-gray-700">現在のニーズ:</span>
                    <ul className="mt-1 ml-4 list-disc text-sm">
                      {plan.personalInfo.currentNeeds.map((need, index) => (
                        <li key={index}>{need}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* アセスメントセクション */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    総合アセスメント
                  </h4>
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <span className="block text-xs text-gray-600">身体機能</span>
                      <span className="block font-medium text-lg text-blue-600">
                        {getAssessmentText(plan.assessmentSummary.physicalFunction)}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="block text-xs text-gray-600">認知機能</span>
                      <span className="block font-medium text-lg text-green-600">
                        {getAssessmentText(plan.assessmentSummary.cognitiveFunction)}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="block text-xs text-gray-600">社会機能</span>
                      <span className="block font-medium text-lg text-purple-600">
                        {getAssessmentText(plan.assessmentSummary.socialFunction)}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="block text-xs text-gray-600">精神的健康</span>
                      <span className="block font-medium text-lg text-orange-600">
                        {getAssessmentText(plan.assessmentSummary.emotionalWellbeing)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-700">{plan.assessmentSummary.overallAssessment}</p>
                  </div>
                </div>

                {/* 支援目標セクション */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    支援目標・計画
                  </h4>
                  {plan.supportGoals.primary.map((goal, index) => (
                    <div key={index} className="mb-4 p-3 bg-white rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{goal.goal}</h5>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {goal.timeframe}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">期待される成果:</span>
                        <ul className="mt-1 ml-4 list-disc text-sm text-gray-600">
                          {goal.measurableOutcomes.map((outcome, i) => (
                            <li key={i}>{outcome}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                {/* サービス詳細セクション */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    提供サービス詳細
                  </h4>
                  {plan.serviceDetails.dailySupport.map((service, index) => (
                    <div key={index} className="mb-3 p-3 bg-white rounded border">
                      <div className="grid md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">サービス:</span>
                          <p className="text-gray-900">{service.type}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">頻度:</span>
                          <p className="text-gray-900">{service.frequency}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">時間:</span>
                          <p className="text-gray-900">{service.duration}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">提供者:</span>
                          <p className="text-gray-900">{service.staff}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* リスク管理セクション */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    リスク管理・安全対策
                  </h4>
                  {plan.riskManagement.identifiedRisks.map((risk, index) => (
                    <div key={index} className="mb-3 p-3 bg-white rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{risk.risk}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getRiskSeverityColor(risk.severity)}`}>
                          {getRiskSeverityText(risk.severity)}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">予防措置:</span>
                        <p className="text-gray-600 mt-1">{risk.preventionMeasures.join('、')}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Claude API 説明セクション */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-orange-900 mb-2 flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    Claude API連携による支援計画書作成について
                  </h4>
                  <div className="text-sm text-orange-800">
                    <p className="mb-2">
                      <strong>実装予定の自動作成機能:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>モニタリング記録データを分析し、個別のニーズに基づいた支援計画を自動生成</li>
                      <li>利用者の状況変化や健康状態に基づいた適切な支援目標の設定</li>
                      <li>リスク要因の自動特定と予防策の提案</li>
                      <li>国の基準に準拠した計画書フォーマットでの出力</li>
                      <li>過去の計画書との比較分析による継続性の確保</li>
                      <li>多職種連携を考慮したサービス調整案の提示</li>
                    </ul>
                    <p className="mt-3 text-xs text-orange-600">
                      ※ このプレビューはデモ用のサンプルです。実際の運用では、モニタリング記録、日報データ、利用者の状況変化などを総合的に分析し、Claude APIがエビデンスに基づいた個別支援計画書を自動生成します。
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
                  <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg flex items-center justify-center">
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

// メインコンポーネント: Suspense でラップ
export default function SupportPlanPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SupportPlanPageContent />
    </Suspense>
  )
}