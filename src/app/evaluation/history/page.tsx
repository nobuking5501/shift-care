'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange, getCurrentDemoUser } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import { Evaluation } from '@/types'
import { 
  FileText, 
  Calendar,
  Eye,
  Download,
  Plus,
  ArrowLeft
} from 'lucide-react'

// デモ用の過去の評価データ
const demoEvaluations: Evaluation[] = [
  {
    id: 'eval_2024',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-20'),
    createdBy: 'admin_sato',
    year: 2024,
    responses: [], // 実際の回答データ
    isCompleted: true,
    completedAt: new Date('2024-03-20')
  },
  {
    id: 'eval_2023',
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-03-18'),
    createdBy: 'admin_sato',
    year: 2023,
    responses: [],
    isCompleted: true,
    completedAt: new Date('2023-03-18')
  },
  {
    id: 'eval_2025_draft',
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-15'),
    createdBy: 'admin_sato',
    year: 2025,
    responses: [],
    isCompleted: false
  }
]

export default function EvaluationHistoryPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [evaluations] = useState<Evaluation[]>(demoEvaluations)
  const router = useRouter()

  // ユーザー認証とロール確認
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

  // 管理者権限チェック
  const currentUser = getCurrentDemoUser()
  const userRole = currentUser?.role || 'staff'

  // 管理者以外はアクセス拒否
  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      router.push('/dashboard')
    }
  }, [loading, userRole, router])

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

  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="mr-3 p-2 text-gray-600 hover:text-gray-900 btn-touch"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  自己評価 履歴管理
                </h1>
              </div>
              <p className="text-gray-600">
                過去の自己点検・自己評価表の確認と新規作成
              </p>
            </div>
            <button 
              onClick={() => router.push('/evaluation')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center btn-touch"
            >
              <Plus className="w-4 h-4 mr-2" />
              新規作成
            </button>
          </div>
        </div>

        {/* 評価履歴リスト */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">評価履歴</h2>
            <p className="text-sm text-gray-600 mt-1">
              {evaluations.length}件の評価記録
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {evaluations.map((evaluation) => (
              <div key={evaluation.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">
                        {evaluation.year}年度 自己評価表
                      </h3>
                      <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                        evaluation.isCompleted 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {evaluation.isCompleted ? '完了' : '作成中'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>作成日: {evaluation.createdAt.toLocaleDateString()}</p>
                      <p>最終更新: {evaluation.updatedAt.toLocaleDateString()}</p>
                      {evaluation.completedAt && (
                        <p>完了日: {evaluation.completedAt.toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        if (evaluation.year === currentYear) {
                          router.push('/evaluation')
                        } else {
                          alert('過去の評価の詳細表示機能は今後実装予定です')
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center btn-touch"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {evaluation.year === currentYear ? '編集' : '確認'}
                    </button>
                    
                    {evaluation.isCompleted && (
                      <button 
                        onClick={() => alert('PDF再出力機能は今後実装予定です')}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center btn-touch"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 評価が存在しない場合 */}
        {evaluations.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              評価記録がありません
            </h3>
            <p className="text-gray-600 mb-6">
              自己点検・自己評価表を作成してください
            </p>
            <button 
              onClick={() => router.push('/evaluation')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg flex items-center mx-auto btn-touch"
            >
              <Plus className="w-4 h-4 mr-2" />
              新規作成
            </button>
          </div>
        )}

        {/* 説明セクション */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            自己評価について
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• 障害者支援施設は年1回の自己点検・自己評価の実施が推奨されています</p>
            <p>• 20項目の評価を通じて、サービスの質向上を図ります</p>
            <p>• 完了した評価表はPDF形式で保存・提出できます</p>
            <p>• 過去の評価結果と比較して改善状況を確認できます</p>
          </div>
        </div>
      </div>
    </div>
  )
}