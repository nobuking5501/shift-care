'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange, getCurrentDemoUser } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import { IncidentType } from '@/types'
import { 
  AlertTriangle,
  Save,
  Plus,
  Minus,
  Calendar,
  MapPin,
  Users,
  FileText,
  Shield,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'

export default function IncidentReportPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  // フォームデータの状態管理
  const [formData, setFormData] = useState({
    incidentDate: '',
    incidentTime: '',
    incidentType: 'nearMiss' as IncidentType,
    location: '',
    involvedPersons: [''],
    description: '',
    response: '',
    preventiveMeasures: ''
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

  // 初期値設定（現在日時）
  useEffect(() => {
    const now = new Date()
    const date = now.toISOString().split('T')[0]
    const time = now.toTimeString().slice(0, 5)
    
    setFormData(prev => ({
      ...prev,
      incidentDate: date,
      incidentTime: time
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

  // 関係者追加
  const addInvolvedPerson = () => {
    setFormData(prev => ({
      ...prev,
      involvedPersons: [...prev.involvedPersons, '']
    }))
  }

  // 関係者削除
  const removeInvolvedPerson = (index: number) => {
    if (formData.involvedPersons.length > 1) {
      setFormData(prev => ({
        ...prev,
        involvedPersons: prev.involvedPersons.filter((_, i) => i !== index)
      }))
    }
  }

  // 関係者更新
  const updateInvolvedPerson = (index: number, value: string) => {
    const updated = [...formData.involvedPersons]
    updated[index] = value
    setFormData(prev => ({
      ...prev,
      involvedPersons: updated
    }))
  }

  // バリデーション
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.incidentDate) {
      newErrors.incidentDate = '発生日は必須です'
    }
    if (!formData.incidentTime) {
      newErrors.incidentTime = '発生時刻は必須です'
    }
    if (!formData.location.trim()) {
      newErrors.location = '発生場所は必須です'
    }
    if (!formData.description.trim()) {
      newErrors.description = '発生状況の詳細は必須です'
    }
    if (!formData.response.trim()) {
      newErrors.response = '対応・処置の内容は必須です'
    }

    // 関係者の少なくとも1人は入力必須
    const validPersons = formData.involvedPersons.filter(p => p.trim() !== '')
    if (validPersons.length === 0) {
      newErrors.involvedPersons = '関係者を少なくとも1人入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 報告送信
  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setSaving(true)
    try {
      // 実際の実装ではFirestoreに保存
      const currentUser = getCurrentDemoUser()
      const reportData = {
        ...formData,
        incidentDate: new Date(`${formData.incidentDate}T${formData.incidentTime}`),
        involvedPersons: formData.involvedPersons.filter(p => p.trim() !== ''),
        reportedBy: currentUser?.id || 'unknown',
        reportedAt: new Date(),
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
      console.error('報告送信エラー:', error)
      alert('報告の送信に失敗しました')
    } finally {
      setSaving(false)
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
            事故・ヒヤリハット報告を管理者に送信しました。管理者が確認後、適切に対応いたします。
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
                事故・ヒヤリハット報告（スタッフ用）
              </h1>
              <p className="text-gray-600">
                事故やヒヤリハットが発生した際は、管理者に迅速に報告してください
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            {/* 事故種別選択 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                事故種別 *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => updateFormData('incidentType', 'accident')}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    formData.incidentType === 'accident'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-red-400'
                  }`}
                >
                  <div className="font-medium">事故</div>
                  <div className="text-sm text-gray-600">実際に発生した事故</div>
                </button>
                <button
                  onClick={() => updateFormData('incidentType', 'nearMiss')}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    formData.incidentType === 'nearMiss'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 hover:border-orange-400'
                  }`}
                >
                  <div className="font-medium">ヒヤリハット</div>
                  <div className="text-sm text-gray-600">事故に至らなかった事例</div>
                </button>
              </div>
            </div>

            {/* 発生日時 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  発生日 *
                </label>
                <input
                  type="date"
                  value={formData.incidentDate}
                  onChange={(e) => updateFormData('incidentDate', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    errors.incidentDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.incidentDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.incidentDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  発生時刻 *
                </label>
                <input
                  type="time"
                  value={formData.incidentTime}
                  onChange={(e) => updateFormData('incidentTime', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    errors.incidentTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.incidentTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.incidentTime}</p>
                )}
              </div>
            </div>

            {/* 発生場所 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                発生場所 *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
                placeholder="例：リビング、トイレ、食堂など"
                className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>

            {/* 関係者 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                関係者 *
              </label>
              <div className="space-y-3">
                {formData.involvedPersons.map((person, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={person}
                      onChange={(e) => updateInvolvedPerson(index, e.target.value)}
                      placeholder={`関係者${index + 1}（利用者名・スタッフ名）`}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    {formData.involvedPersons.length > 1 && (
                      <button
                        onClick={() => removeInvolvedPerson(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded btn-touch"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addInvolvedPerson}
                  className="flex items-center text-blue-600 hover:text-blue-700 btn-touch"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  関係者を追加
                </button>
              </div>
              {errors.involvedPersons && (
                <p className="text-red-500 text-sm mt-1">{errors.involvedPersons}</p>
              )}
            </div>

            {/* 発生状況の詳細 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                発生状況の詳細 *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={4}
                placeholder="どのような状況で何が発生したかを詳しく記載してください"
                className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* 対応・処置の内容 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                対応・処置の内容 *
              </label>
              <textarea
                value={formData.response}
                onChange={(e) => updateFormData('response', e.target.value)}
                rows={3}
                placeholder="どのような対応・処置を行ったかを記載してください"
                className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.response ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.response && (
                <p className="text-red-500 text-sm mt-1">{errors.response}</p>
              )}
            </div>

            {/* 再発防止策 */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="w-4 h-4 inline mr-1" />
                再発防止策
              </label>
              <textarea
                value={formData.preventiveMeasures}
                onChange={(e) => updateFormData('preventiveMeasures', e.target.value)}
                rows={3}
                placeholder="今後の再発防止のための対策があれば記載してください（任意）"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
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
                {saving ? '送信中...' : '報告を送信'}
              </button>
            </div>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">報告時の注意事項</p>
              <ul className="list-disc list-inside space-y-1">
                <li>緊急の場合は、まず適切な処置を行ってから報告してください</li>
                <li>正確で詳細な情報の記録が安全向上に繋がります</li>
                <li>報告内容は管理者が確認し、必要に応じて対応策を検討します</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}