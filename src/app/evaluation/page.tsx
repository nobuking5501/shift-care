'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange, getCurrentDemoUser } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import { evaluationQuestions, scoreDescriptions, questionCategories } from '@/lib/evaluation-data'
import { EvaluationResponse, Evaluation } from '@/types'
import { exportEvaluationToPDF } from '@/lib/evaluationExport'
import { 
  FileText, 
  Save, 
  Download, 
  AlertCircle,
  CheckCircle,
  Star,
  Users
} from 'lucide-react'

export default function EvaluationPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<EvaluationResponse[]>([])
  const [currentYear] = useState(new Date().getFullYear())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  // ユーザー認証とロール確認
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

  // 管理者権限チェック
  const currentUser = getCurrentDemoUser()
  const userRole = currentUser?.role || 'staff'

  // 管理者以外はアクセス拒否
  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      router.push('/dashboard')
    }
  }, [loading, userRole, router])

  // 回答データ初期化
  useEffect(() => {
    const initialResponses: EvaluationResponse[] = evaluationQuestions.map(q => ({
      questionId: q.id,
      score: 0,
      comment: ''
    }))
    setResponses(initialResponses)
  }, [])

  // 回答更新
  const updateResponse = (questionId: string, field: 'score' | 'comment', value: number | string) => {
    setResponses(prev => prev.map(response => 
      response.questionId === questionId 
        ? { ...response, [field]: value }
        : response
    ))
    setSaved(false)
  }

  // 保存処理（デモ用）
  const handleSave = async () => {
    setSaving(true)
    try {
      // 実際の実装ではFirestoreに保存
      await new Promise(resolve => setTimeout(resolve, 1000)) // デモ用遅延
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  // PDF出力
  const handlePDFExport = async () => {
    try {
      await exportEvaluationToPDF({
        year: currentYear,
        responses: responses,
        facilityName: 'ShiftCare 障害者支援施設',
        exportDate: new Date()
      })
    } catch (error) {
      console.error('PDF出力エラー:', error)
      alert('PDF出力に失敗しました')
    }
  }

  // 完了済み回答数の計算
  const completedCount = responses.filter(r => r.score > 0).length
  const totalCount = evaluationQuestions.length
  const completionRate = Math.round((completedCount / totalCount) * 100)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || userRole !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                自己点検・自己評価表
              </h1>
              <p className="text-gray-600">
                対象年度: {currentYear}年
              </p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center btn-touch"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? '保存中...' : '保存'}
              </button>
              <button 
                onClick={handlePDFExport}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center btn-touch"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF出力
              </button>
            </div>
          </div>
        </div>

        {/* 進捗表示 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">回答状況</h2>
            {saved && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                保存済み
              </div>
            )}
          </div>
          <div className="flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">
              {completedCount}/{totalCount} ({completionRate}%)
            </span>
          </div>
        </div>

        {/* 質問フォーム */}
        <div className="space-y-6">
          {questionCategories.map(category => {
            const categoryQuestions = evaluationQuestions.filter(q => q.category === category.name)
            
            return (
              <div key={category.name} className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {category.count}項目
                  </p>
                </div>
                
                <div className="p-6 space-y-8">
                  {categoryQuestions.map(question => {
                    const response = responses.find(r => r.questionId === question.id)
                    
                    return (
                      <div key={question.id} className="border-l-4 border-blue-200 pl-6">
                        <div className="mb-4">
                          <h4 className="text-base font-medium text-gray-900 mb-2">
                            問{question.number}. {question.title}
                          </h4>
                          {question.description && (
                            <p className="text-sm text-gray-600 mb-4">
                              {question.description}
                            </p>
                          )}
                        </div>

                        {/* 評価スコア選択 */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            評価スコア (1: 不十分 〜 5: 優秀)
                          </label>
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map(score => (
                              <button
                                key={score}
                                onClick={() => updateResponse(question.id, 'score', score)}
                                className={`w-12 h-12 rounded-lg border-2 transition-all flex items-center justify-center ${
                                  response?.score === score
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-gray-300 hover:border-blue-400 text-gray-700'
                                }`}
                              >
                                {score}
                              </button>
                            ))}
                          </div>
                          {response?.score && response.score > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {scoreDescriptions[response.score as keyof typeof scoreDescriptions]}
                            </p>
                          )}
                        </div>

                        {/* コメント入力 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            コメント・改善点など
                          </label>
                          <textarea
                            value={response?.comment || ''}
                            onChange={(e) => updateResponse(question.id, 'comment', e.target.value)}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="具体的な取り組み内容や改善点があれば記入してください"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* フッターアクション */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <AlertCircle className="w-4 h-4 mr-2" />
              すべての項目に回答してからPDF出力してください
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg btn-touch"
              >
                ダッシュボードに戻る
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center btn-touch"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}