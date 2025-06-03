'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange, getCurrentDemoUser } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import { ComplainantType } from '@/types'
import { 
  MessageSquare,
  Save,
  Calendar,
  User,
  Users,
  FileText,
  CheckCircle,
  ArrowLeft,
  AlertCircle
} from 'lucide-react'

export default function ComplaintFormPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  // フォームデータの状態管理
  const [formData, setFormData] = useState({
    complainantType: 'user' as ComplainantType,
    complainantName: '',
    complaintDate: '',
    content: ''
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
      complaintDate: today
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

    if (!formData.complaintDate) {
      newErrors.complaintDate = '発生・受付日は必須です'
    }
    if (!formData.content.trim()) {
      newErrors.content = '苦情・要望内容は必須です'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 苦情受付送信
  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setSaving(true)
    try {
      // 実際の実装ではFirestoreに保存
      const currentUser = getCurrentDemoUser()
      const complaintData = {
        ...formData,
        complaintDate: new Date(formData.complaintDate),
        submittedBy: currentUser?.id || 'unknown',
        submittedAt: new Date(),
        responseRecords: [],
        status: 'pending',
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
      console.error('苦情受付送信エラー:', error)
      alert('苦情の受付に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  // 申し出人種別の表示テキスト
  const getComplainantTypeText = (type: ComplainantType) => {
    switch (type) {
      case 'user':
        return '利用者'
      case 'family':
        return '家族'
      case 'other':
        return 'その他'
      default:
        return ''
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
            苦情・要望を管理者に送信しました。管理者が確認後、適切に対応いたします。
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
                苦情・要望受付（スタッフ用）
              </h1>
              <p className="text-gray-600">
                利用者・ご家族からの苦情・要望を受付し、管理者に報告します
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            {/* 申し出人種別選択 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <User className="w-4 h-4 inline mr-1" />
                申し出人種別 *
              </label>
              <div className="grid grid-cols-3 gap-4">
                {(['user', 'family', 'other'] as ComplainantType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateFormData('complainantType', type)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      formData.complainantType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <div className="font-medium">{getComplainantTypeText(type)}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {type === 'user' && '利用者本人'}
                      {type === 'family' && 'ご家族・保護者'}
                      {type === 'other' && '外部関係者など'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 申し出人氏名 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                申し出人氏名（匿名可）
              </label>
              <input
                type="text"
                value={formData.complainantName}
                onChange={(e) => updateFormData('complainantName', e.target.value)}
                placeholder="氏名を入力（匿名の場合は空欄でも可）"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                個人情報保護のため、匿名での受付も可能です
              </p>
            </div>

            {/* 発生・受付日 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                発生・受付日 *
              </label>
              <input
                type="date"
                value={formData.complaintDate}
                onChange={(e) => updateFormData('complaintDate', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  errors.complaintDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.complaintDate && (
                <p className="text-red-500 text-sm mt-1">{errors.complaintDate}</p>
              )}
            </div>

            {/* 苦情・要望内容 */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                苦情・要望内容 *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => updateFormData('content', e.target.value)}
                rows={6}
                placeholder="苦情・要望の内容を詳しく記載してください&#10;&#10;例：&#10;・具体的な出来事や状況&#10;・いつ、どこで、誰が関与したか&#10;・ご要望や改善してほしい点"
                className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                可能な限り具体的に記載いただくと、適切な対応につながります
              </p>
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
                {saving ? '受付中...' : '受付を完了'}
              </button>
            </div>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">苦情・要望受付について</p>
              <ul className="list-disc list-inside space-y-1">
                <li>受け付けた苦情・要望は速やかに管理者に報告されます</li>
                <li>対応状況について、必要に応じてご連絡いたします</li>
                <li>個人情報は適切に管理し、関係者以外には開示いたしません</li>
                <li>緊急性の高い案件については、別途お電話等でご連絡ください</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}