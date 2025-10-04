'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange, getCurrentDemoUser } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import { DrillType } from '@/types'
import { 
  Shield,
  Save,
  Calendar,
  Users,
  FileText,
  Target,
  CheckCircle,
  ArrowLeft,
  Flame,
  Home
} from 'lucide-react'

export default function DrillFormPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  // フォームデータの状態管理
  const [formData, setFormData] = useState({
    conductedAt: '',
    drillType: 'fire' as DrillType,
    participantsCount: '',
    details: '',
    improvements: ''
  })

  // エラー状態管理
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ユーザー認証
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setUser(user)
      } else {
        router.push('/')
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
      conductedAt: today
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

    if (!formData.conductedAt) {
      newErrors.conductedAt = '実施日は必須です'
    }
    if (!formData.participantsCount || parseInt(formData.participantsCount) <= 0) {
      newErrors.participantsCount = '参加人数は1以上の数値を入力してください'
    }
    if (!formData.details.trim()) {
      newErrors.details = '訓練内容・評価・課題は必須です'
    }
    if (!formData.improvements.trim()) {
      newErrors.improvements = '改善策・対応は必須です'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 防災訓練記録送信
  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setSaving(true)
    try {
      // 実際の実装ではFirestoreに保存
      const currentUser = getCurrentDemoUser()
      const drillData = {
        ...formData,
        conductedAt: new Date(formData.conductedAt),
        participantsCount: parseInt(formData.participantsCount),
        conductedBy: currentUser?.id || 'unknown',
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
      console.error('防災訓練記録送信エラー:', error)
      alert('防災訓練記録の保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  // 訓練種別の表示テキスト
  const getDrillTypeText = (type: DrillType) => {
    switch (type) {
      case 'fire':
        return '火災避難訓練'
      case 'earthquake':
        return '地震避難訓練'
      case 'evacuation':
        return '避難誘導訓練'
      case 'firefighting':
        return '消火訓練'
      case 'other':
        return 'その他'
      default:
        return ''
    }
  }

  // 訓練種別のアイコン
  const getDrillTypeIcon = (type: DrillType) => {
    switch (type) {
      case 'fire':
        return <Flame className="w-6 h-6" />
      case 'earthquake':
        return <Home className="w-6 h-6" />
      case 'evacuation':
        return <Users className="w-6 h-6" />
      case 'firefighting':
        return <Target className="w-6 h-6" />
      case 'other':
        return <Shield className="w-6 h-6" />
      default:
        return <Shield className="w-6 h-6" />
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
            防災訓練記録を管理者に送信しました。記録の管理・保管は管理者が行います。
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
                防災訓練記録（スタッフ用）
              </h1>
              <p className="text-gray-600">
                実施した防災訓練の内容と結果を管理者に報告します
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            {/* 実施日 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                実施日 *
              </label>
              <input
                type="date"
                value={formData.conductedAt}
                onChange={(e) => updateFormData('conductedAt', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  errors.conductedAt ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.conductedAt && (
                <p className="text-red-500 text-sm mt-1">{errors.conductedAt}</p>
              )}
            </div>

            {/* 訓練種別選択 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Shield className="w-4 h-4 inline mr-1" />
                訓練種別 *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(['fire', 'earthquake', 'evacuation', 'firefighting', 'other'] as DrillType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateFormData('drillType', type)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      formData.drillType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex justify-center mb-2">
                      {getDrillTypeIcon(type)}
                    </div>
                    <div className="font-medium text-sm">{getDrillTypeText(type)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 参加人数 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                参加人数 *
              </label>
              <input
                type="number"
                min="1"
                value={formData.participantsCount}
                onChange={(e) => updateFormData('participantsCount', e.target.value)}
                placeholder="参加した人数を入力"
                className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  errors.participantsCount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.participantsCount && (
                <p className="text-red-500 text-sm mt-1">{errors.participantsCount}</p>
              )}
            </div>

            {/* 訓練内容・評価・課題 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                訓練内容・評価・課題 *
              </label>
              <textarea
                value={formData.details}
                onChange={(e) => updateFormData('details', e.target.value)}
                rows={6}
                placeholder="実施した訓練の詳細内容、評価、発見された課題などを記載してください&#10;&#10;例：&#10;・実施した訓練の流れ&#10;・参加者の反応や行動&#10;・所要時間や効果&#10;・発見された問題点や課題"
                className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.details ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.details && (
                <p className="text-red-500 text-sm mt-1">{errors.details}</p>
              )}
            </div>

            {/* 改善策・今後の対応 */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="w-4 h-4 inline mr-1" />
                改善策・今後の対応 *
              </label>
              <textarea
                value={formData.improvements}
                onChange={(e) => updateFormData('improvements', e.target.value)}
                rows={4}
                placeholder="発見された課題に対する改善策や今後の対応方針を記載してください&#10;&#10;例：&#10;・改善すべき点と具体的な対策&#10;・次回訓練での重点項目&#10;・設備や環境の改善点"
                className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.improvements ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.improvements && (
                <p className="text-red-500 text-sm mt-1">{errors.improvements}</p>
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
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center btn-touch"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? '保存中...' : '記録を保存'}
              </button>
            </div>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">防災訓練記録について</p>
              <ul className="list-disc list-inside space-y-1">
                <li>防災訓練は定期的な実施が法令で定められています</li>
                <li>記録は行政監査時の重要な資料となります</li>
                <li>具体的で詳細な記録を心がけてください</li>
                <li>改善点は次回訓練の計画に活用されます</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}