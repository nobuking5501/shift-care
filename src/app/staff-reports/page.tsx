'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange, getCurrentDemoUser } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import { 
  FileText,
  Save,
  Calendar,
  Clock,
  Users,
  Heart,
  CheckCircle,
  ArrowLeft,
  AlertTriangle,
  User,
  Plus,
  Edit,
  Trash2,
  Activity,
  Thermometer,
  Droplets,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

// 利用者データの型定義
interface ServiceUser {
  id: string
  name: string
  age: number
  careLevel: string
  medicalConditions: string[]
  allergies: string[]
  preferredActivities: string[]
}

// 個別日報の型定義
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

export default function StaffReportsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  // 基本フォームデータ
  const [basicFormData, setBasicFormData] = useState({
    date: '',
    shiftType: 'day',
    generalActivities: '',
    teamNotes: '',
    improvements: ''
  })

  // 利用者別日報データ
  const [userReports, setUserReports] = useState<UserDailyReport[]>([])
  
  // UI状態管理
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})

  // デモ利用者データ
  const serviceUsers: ServiceUser[] = [
    {
      id: 'user1',
      name: '田中 花子',
      age: 78,
      careLevel: '要介護2',
      medicalConditions: ['高血圧', '糖尿病'],
      allergies: ['卵', '甲殻類'],
      preferredActivities: ['手芸', '歌', '散歩']
    },
    {
      id: 'user2', 
      name: '佐藤 一郎',
      age: 82,
      careLevel: '要介護3',
      medicalConditions: ['認知症', '関節炎'],
      allergies: [],
      preferredActivities: ['将棋', '音楽鑑賞', 'ラジオ体操']
    },
    {
      id: 'user3',
      name: '山田 美智子',
      age: 75,
      careLevel: '要介護1',
      medicalConditions: ['腰痛'],
      allergies: ['そば'],
      preferredActivities: ['読書', '塗り絵', '園芸']
    },
    {
      id: 'user4',
      name: '鈴木 太郎',
      age: 86,
      careLevel: '要介護4',
      medicalConditions: ['脳梗塞後遺症', '嚥下障害'],
      allergies: [],
      preferredActivities: ['テレビ鑑賞', '音楽療法']
    },
    {
      id: 'user5',
      name: '高橋 和子',
      age: 79,
      careLevel: '要介護2',
      medicalConditions: ['パーキンソン病'],
      allergies: ['乳製品'],
      preferredActivities: ['折り紙', '昔話', 'リハビリ体操']
    }
  ]

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

  // 初期値設定
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setBasicFormData(prev => ({
      ...prev,
      date: today
    }))

    // 利用者別日報の初期化
    const initialReports = serviceUsers.map(user => ({
      userId: user.id,
      userName: user.name,
      vitalSigns: {},
      moodCondition: 'good' as const,
      appetiteCondition: 'good' as const,
      sleepCondition: 'good' as const,
      activities: '',
      medicationStatus: '',
      specialNotes: '',
      concernsIssues: '',
      completed: false
    }))
    setUserReports(initialReports)

    // 最初の利用者を展開状態にする
    if (serviceUsers.length > 0) {
      setExpandedUsers(new Set([serviceUsers[0].id]))
    }
  }, [])

  // 基本フォーム入力更新
  const updateBasicFormData = (field: string, value: any) => {
    setBasicFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // 利用者別日報更新
  const updateUserReport = (userId: string, field: string, value: any) => {
    setUserReports(prev => prev.map(report => 
      report.userId === userId 
        ? { ...report, [field]: value }
        : report
    ))
  }

  // バイタルサイン更新
  const updateVitalSigns = (userId: string, vitalType: string, value: string) => {
    setUserReports(prev => prev.map(report => 
      report.userId === userId 
        ? { 
            ...report, 
            vitalSigns: { ...report.vitalSigns, [vitalType]: value }
          }
        : report
    ))
  }

  // 利用者の展開/折りたたみ切り替え
  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  // 利用者日報の完了切り替え
  const toggleUserReportCompletion = (userId: string) => {
    setUserReports(prev => prev.map(report => 
      report.userId === userId 
        ? { ...report, completed: !report.completed }
        : report
    ))
  }

  // バリデーション
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!basicFormData.date) {
      newErrors.date = '日付は必須です'
    }
    if (!basicFormData.generalActivities.trim()) {
      newErrors.generalActivities = '全体活動内容は必須です'
    }

    // 利用者別日報の最低限チェック
    const incompleteUsers = userReports.filter(report => !report.completed)
    if (incompleteUsers.length === userReports.length) {
      newErrors.userReports = '最低1名の利用者様の日報を完了してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 日報送信
  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setSaving(true)
    try {
      const currentUser = getCurrentDemoUser()
      const completeReports = userReports.filter(report => report.completed)
      
      const reportData = {
        basic: {
          ...basicFormData,
          date: new Date(basicFormData.date),
          userId: currentUser?.uid || 'unknown',
          staffName: currentUser?.displayName || 'Unknown Staff'
        },
        userReports: completeReports,
        summary: {
          totalUsers: serviceUsers.length,
          completedReports: completeReports.length,
          incompletedReports: userReports.length - completeReports.length
        },
        submitted: true,
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      console.log('日報データ:', reportData)

      // デモ用遅延
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSaved(true)
      
      // 3秒後にスタッフダッシュボードに戻る
      setTimeout(() => {
        router.push('/staff-dashboard')
      }, 3000)
      
    } catch (error) {
      console.error('日報送信エラー:', error)
      alert('日報の保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  // ヘルパー関数
  const getShiftTypeText = (type: string) => {
    switch (type) {
      case 'early': return '早番'
      case 'day': return '日勤'
      case 'late': return '遅番'
      case 'night': return '夜勤'
      default: return '不明'
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

  // 完了率計算
  const completionRate = userReports.length > 0 
    ? Math.round((userReports.filter(r => r.completed).length / userReports.length) * 100)
    : 0

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

  if (saved) {
    const completedCount = userReports.filter(r => r.completed).length
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-4">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            日報を提出しました
          </h2>
          <p className="text-gray-600 mb-4">
            {completedCount}名の利用者様の日報が正常に提出されました。<br />
            お疲れ様でした。
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
      
      <div className="max-w-6xl mx-auto px-4 py-6">
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
                  利用者別日報入力
                </h1>
                <p className="text-gray-600">
                  各利用者様の状況を個別に記録してください
                </p>
              </div>
            </div>
            
            {/* 進捗表示 */}
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">
                記録進捗: {userReports.filter(r => r.completed).length}/{userReports.length}
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{completionRate}%完了</div>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {errors.userReports && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{errors.userReports}</span>
            </div>
          </div>
        )}

        {/* 基本情報セクション */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              基本情報
            </h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* 日付 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  日付 *
                </label>
                <input
                  type="date"
                  value={basicFormData.date}
                  onChange={(e) => updateBasicFormData('date', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>

              {/* シフト種別 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  シフト種別 *
                </label>
                <select
                  value={basicFormData.shiftType}
                  onChange={(e) => updateBasicFormData('shiftType', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="early">早番</option>
                  <option value="day">日勤</option>
                  <option value="late">遅番</option>
                  <option value="night">夜勤</option>
                </select>
              </div>
            </div>

            {/* 全体活動内容 */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Activity className="w-4 h-4 inline mr-1" />
                全体活動内容 *
              </label>
              <textarea
                value={basicFormData.generalActivities}
                onChange={(e) => updateBasicFormData('generalActivities', e.target.value)}
                rows={4}
                placeholder="今日のシフト全体で実施した活動内容を記載してください&#10;&#10;例：&#10;・朝の申し送り、バイタルチェック&#10;・集団レクリエーション（音楽療法）&#10;・食事介助、服薬管理"
                className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.generalActivities ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.generalActivities && (
                <p className="text-red-500 text-sm mt-1">{errors.generalActivities}</p>
              )}
            </div>

            {/* チーム申し送り */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                チーム申し送り・改善提案
              </label>
              <textarea
                value={basicFormData.teamNotes}
                onChange={(e) => updateBasicFormData('teamNotes', e.target.value)}
                rows={3}
                placeholder="チーム全体への申し送りや改善提案があれば記載してください（任意）"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* 利用者別日報セクション */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2" />
              利用者別日報 ({userReports.filter(r => r.completed).length}/{userReports.length}名完了)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              各利用者様の状況を個別に記録してください。記録完了後にチェックを入れてください。
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {serviceUsers.map((serviceUser) => {
              const userReport = userReports.find(r => r.userId === serviceUser.id)
              const isExpanded = expandedUsers.has(serviceUser.id)
              
              return (
                <div key={serviceUser.id}>
                  {/* 利用者ヘッダー */}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {serviceUser.name}
                          </h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <span>{serviceUser.age}歳</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {serviceUser.careLevel}
                            </span>
                            {userReport?.completed && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                記録完了
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={userReport?.completed || false}
                            onChange={() => toggleUserReportCompletion(serviceUser.id)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">記録完了</span>
                        </label>
                        <button
                          onClick={() => toggleUserExpansion(serviceUser.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 利用者詳細情報 */}
                    {isExpanded && userReport && (
                      <div className="mt-6 bg-gray-50 rounded-lg p-6">
                        {/* バイタルサイン */}
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                            <Thermometer className="w-4 h-4 mr-1" />
                            バイタルサイン
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">体温 (℃)</label>
                              <input
                                type="text"
                                value={userReport.vitalSigns.temperature || ''}
                                onChange={(e) => updateVitalSigns(serviceUser.id, 'temperature', e.target.value)}
                                placeholder="36.5"
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">血圧</label>
                              <input
                                type="text"
                                value={userReport.vitalSigns.bloodPressure || ''}
                                onChange={(e) => updateVitalSigns(serviceUser.id, 'bloodPressure', e.target.value)}
                                placeholder="120/80"
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">脈拍</label>
                              <input
                                type="text"
                                value={userReport.vitalSigns.pulse || ''}
                                onChange={(e) => updateVitalSigns(serviceUser.id, 'pulse', e.target.value)}
                                placeholder="72"
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">酸素飽和度 (%)</label>
                              <input
                                type="text"
                                value={userReport.vitalSigns.oxygen || ''}
                                onChange={(e) => updateVitalSigns(serviceUser.id, 'oxygen', e.target.value)}
                                placeholder="98"
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 状態評価 */}
                        <div className="grid md:grid-cols-3 gap-6 mb-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">気分・機嫌</label>
                            <select
                              value={userReport.moodCondition}
                              onChange={(e) => updateUserReport(serviceUser.id, 'moodCondition', e.target.value)}
                              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="excellent">非常に良い</option>
                              <option value="good">良い</option>
                              <option value="fair">普通</option>
                              <option value="poor">不良</option>
                              <option value="concerning">心配</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">食欲</label>
                            <select
                              value={userReport.appetiteCondition}
                              onChange={(e) => updateUserReport(serviceUser.id, 'appetiteCondition', e.target.value)}
                              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="excellent">非常に良い</option>
                              <option value="good">良い</option>
                              <option value="fair">普通</option>
                              <option value="poor">不良</option>
                              <option value="refused">拒否</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">睡眠</label>
                            <select
                              value={userReport.sleepCondition}
                              onChange={(e) => updateUserReport(serviceUser.id, 'sleepCondition', e.target.value)}
                              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="excellent">非常に良い</option>
                              <option value="good">良い</option>
                              <option value="fair">普通</option>
                              <option value="poor">不良</option>
                              <option value="sleepless">不眠</option>
                            </select>
                          </div>
                        </div>

                        {/* 個別活動・ケア内容 */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            個別活動・ケア内容
                          </label>
                          <textarea
                            value={userReport.activities}
                            onChange={(e) => updateUserReport(serviceUser.id, 'activities', e.target.value)}
                            rows={3}
                            placeholder="この利用者様に対して行った個別のケアや活動を記載してください"
                            className="w-full p-3 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 resize-none"
                          />
                        </div>

                        {/* 服薬状況 */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            服薬状況
                          </label>
                          <textarea
                            value={userReport.medicationStatus}
                            onChange={(e) => updateUserReport(serviceUser.id, 'medicationStatus', e.target.value)}
                            rows={2}
                            placeholder="服薬の状況や特記事項があれば記載してください"
                            className="w-full p-3 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 resize-none"
                          />
                        </div>

                        {/* 特記事項 */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            特記事項・様子
                          </label>
                          <textarea
                            value={userReport.specialNotes}
                            onChange={(e) => updateUserReport(serviceUser.id, 'specialNotes', e.target.value)}
                            rows={3}
                            placeholder="この利用者様の様子や特記すべき事項を記載してください"
                            className="w-full p-3 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 resize-none"
                          />
                        </div>

                        {/* 心配事・問題 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <AlertTriangle className="w-4 h-4 inline mr-1" />
                            心配事・問題・申し送り事項
                          </label>
                          <textarea
                            value={userReport.concernsIssues}
                            onChange={(e) => updateUserReport(serviceUser.id, 'concernsIssues', e.target.value)}
                            rows={3}
                            placeholder="申し送りが必要な心配事や問題があれば記載してください"
                            className="w-full p-3 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 resize-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/staff-dashboard')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium btn-touch"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || userReports.filter(r => r.completed).length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center btn-touch"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? '提出中...' : `日報を提出 (${userReports.filter(r => r.completed).length}名分)`}
            </button>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">利用者別日報について</p>
              <ul className="list-disc list-inside space-y-1">
                <li>各利用者様の状況を正確に記録してください</li>
                <li>記録完了後は必ずチェックボックスにチェックを入れてください</li>
                <li>最低1名分の記録完了で提出可能です</li>
                <li>緊急事項は別途管理者に直接報告してください</li>
                <li>利用者様のプライバシーに配慮してください</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}