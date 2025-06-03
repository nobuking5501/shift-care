'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange, getCurrentDemoUser } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import { InfectionType } from '@/types'
import { 
  Activity,
  Save,
  Calendar,
  Users,
  FileText,
  Stethoscope,
  CheckCircle,
  ArrowLeft,
  AlertTriangle,
  Thermometer
} from 'lucide-react'

export default function InfectionFormPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  // フォームデータの状態管理
  const [formData, setFormData] = useState({
    reportedAt: '',
    infectionType: 'influenza' as InfectionType,
    affectedCount: '',
    responseMeasures: '',
    outcome: ''
  })

  // エラー状態管理
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ユーザー認証
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setUser(user)
      } else {
        router.push('/login')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  // 初期値設定（今日の日付）
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setFormData(prev => ({
      ...prev,
      reportedAt: today
    }))
  }, [])

  // フォーム入力更新
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // エラークリア
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // バリデーション
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.reportedAt) {
      newErrors.reportedAt = '発生日は必須です'
    }
    if (!formData.affectedCount || parseInt(formData.affectedCount) <= 0) {
      newErrors.affectedCount = '発症者数は1以上の数値を入力してください'
    }
    if (!formData.responseMeasures.trim()) {
      newErrors.responseMeasures = '対応内容は必須です'
    }
    if (!formData.outcome.trim()) {
      newErrors.outcome = '収束状況・教訓は必須です'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 感染症対応記録送信
  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setSaving(true)
    try {
      // 実際の実装ではFirestoreに保存
      const currentUser = getCurrentDemoUser()
      const infectionData = {
        ...formData,
        reportedAt: new Date(formData.reportedAt),
        affectedCount: parseInt(formData.affectedCount),
        reportedBy: currentUser?.id || 'unknown',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // デモ用遅延
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSaved(true)
      
      // 3秒後にダッシュボードに戻る
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
      
    } catch (error) {
      console.error('感染症対応記録送信エラー:', error)
      alert('感染症対応記録の保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  // 感染症種別の表示テキスト
  const getInfectionTypeText = (type: InfectionType) => {
    switch (type) {
      case 'influenza':
        return 'インフルエンザ'
      case 'covid19':
        return 'COVID-19'
      case 'norovirus':
        return 'ノロウイルス'
      case 'other':
        return 'その他'
      default:
        return ''
    }
  }

  // 感染症種別のアイコン
  const getInfectionTypeIcon = (type: InfectionType) => {
    switch (type) {
      case 'influenza':
        return <Thermometer className="w-6 h-6" />
      case 'covid19':
        return <Activity className="w-6 h-6" />
      case 'norovirus':
        return <Stethoscope className="w-6 h-6" />
      case 'other':
        return <AlertTriangle className="w-6 h-6" />
      default:
        return <Activity className="w-6 h-6" />
    }
  }

  // 感染症種別の色
  const getInfectionTypeColor = (type: InfectionType) => {
    switch (type) {
      case 'influenza':
        return 'text-orange-600'
      case 'covid19':
        return 'text-red-600'
      case 'norovirus':
        return 'text-purple-600'
      case 'other':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
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

  if (saved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-4">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            管理者に報告しました
          </h2>
          <p className="text-gray-600 mb-4">
            感染症対応記録を管理者に送信しました。記録の管理・保管は管理者が行います。
          </p>
          <p className="text-sm text-gray-500">
            3秒後にダッシュボードに戻ります...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={getCurrentDemoUser()?.role || 'staff'} />
      
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="mr-3 p-2 text-gray-600 hover:text-gray-900 btn-touch"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                感染症対応記録（スタッフ用）
              </h1>
              <p className="text-gray-600">
                発生した感染症の対応内容と結果を管理者に報告します
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            {/* 発生日 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                発生日 *
              </label>
              <input
                type="date"
                value={formData.reportedAt}
                onChange={(e) => updateFormData('reportedAt', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  errors.reportedAt ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.reportedAt && (
                <p className="text-red-500 text-sm mt-1">{errors.reportedAt}</p>
              )}
            </div>

            {/* 感染症種別選択 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Activity className="w-4 h-4 inline mr-1" />
                感染症種別 *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {(['influenza', 'covid19', 'norovirus', 'other'] as InfectionType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateFormData('infectionType', type)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      formData.infectionType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <div className={`flex justify-center mb-2 ${getInfectionTypeColor(type)}`}>
                      {getInfectionTypeIcon(type)}
                    </div>
                    <div className="font-medium text-sm">{getInfectionTypeText(type)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 発症者数 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                発症者数 *
              </label>
              <input
                type="number"
                min="1"
                value={formData.affectedCount}
                onChange={(e) => updateFormData('affectedCount', e.target.value)}
                placeholder="発症した人数を入力"
                className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  errors.affectedCount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.affectedCount && (
                <p className="text-red-500 text-sm mt-1">{errors.affectedCount}</p>
              )}
            </div>

            {/* 対応内容 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                対応内容 *
              </label>
              <textarea
                value={formData.responseMeasures}
                onChange={(e) => updateFormData('responseMeasures', e.target.value)}
                rows={6}
                placeholder="実施した感染症対応の詳細を記載してください&#10;&#10;例：&#10;・隔離措置の実施状況&#10;・消毒・清掃の強化内容&#10;・職員や利用者への対応&#10;・医療機関との連携&#10;・家族への連絡・報告"
                className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.responseMeasures ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.responseMeasures && (
                <p className="text-red-500 text-sm mt-1">{errors.responseMeasures}</p>
              )}
            </div>

            {/* 収束状況・教訓 */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Stethoscope className="w-4 h-4 inline mr-1" />
                収束状況・教訓 *
              </label>
              <textarea
                value={formData.outcome}
                onChange={(e) => updateFormData('outcome', e.target.value)}
                rows={4}
                placeholder="感染症の収束状況と得られた教訓を記載してください&#10;&#10;例：&#10;・収束までの期間と経過&#10;・対応の効果と課題&#10;・今後の予防策&#10;・学んだ教訓や改善点"
                className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.outcome ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.outcome && (
                <p className="text-red-500 text-sm mt-1">{errors.outcome}</p>
              )}
            </div>

            {/* 送信ボタン */}
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium btn-touch"
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center btn-touch"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? '保存中...' : '記録を保存'}
              </button>
            </div>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <Activity className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">感染症対応記録について</p>
              <ul className="list-disc list-inside space-y-1">
                <li>感染症発生時は迅速な報告と記録が重要です</li>
                <li>行政への報告が必要な場合があります</li>
                <li>対応内容は詳細かつ正確に記録してください</li>
                <li>今後の予防策立案に活用されます</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}