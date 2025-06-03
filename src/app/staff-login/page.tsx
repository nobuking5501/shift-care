'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInAsStaff, onAuthStateChange } from '@/lib/auth'
import Link from 'next/link'
import { 
  LogIn, 
  Calendar, 
  Smartphone, 
  User, 
  ArrowLeft,
  Users,
  FileText,
  Shield,
  Activity
} from 'lucide-react'

export default function StaffLoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user && user.role === 'staff') {
        router.push('/staff-dashboard')
      } else if (user && user.role === 'admin') {
        router.push('/dashboard')
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleStaffLogin = async () => {
    setLoading(true)
    setError('')
    
    try {
      console.log('Starting staff login...')
      const result = await signInAsStaff()
      console.log('Staff login result:', result)
      console.log('Redirecting to /staff-dashboard')
      router.push('/staff-dashboard')
    } catch (error) {
      setError('ログインに失敗しました。もう一度お試しください。')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* 戻るリンク */}
        <div className="flex items-center">
          <Link 
            href="/login"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="text-sm">管理者ログインに戻る</span>
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            スタッフログイン
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            ShiftCare スタッフ専用アプリ
          </p>
          <p className="text-sm text-gray-500">
            現場業務をサポートする専用システムです
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* ログインボタン */}
        <div className="space-y-4">
          <button
            onClick={handleStaffLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 px-6 rounded-lg font-medium text-lg flex items-center justify-center transition-colors btn-touch"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            ) : (
              <User className="w-5 h-5 mr-3" />
            )}
            {loading ? 'ログイン中...' : 'スタッフとしてログイン'}
          </button>
        </div>

        {/* スタッフアプリの機能紹介 */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            スタッフアプリの主な機能
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">日報入力</h4>
                <p className="text-sm text-gray-600">日々の活動内容と利用者様の様子を記録</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">シフト確認・希望提出</h4>
                <p className="text-sm text-gray-600">自分のシフト表確認と来月の希望提出</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">緊急報告</h4>
                <p className="text-sm text-gray-600">事故・ヒヤリハット・苦情などの迅速報告</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">安全記録</h4>
                <p className="text-sm text-gray-600">防災訓練・感染症対応の記録入力</p>
              </div>
            </div>
          </div>
        </div>

        {/* デモ版の注意書き */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <Smartphone className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">🎭 プロトタイプ版について</p>
              <ul className="list-disc list-inside space-y-1">
                <li>デモ用のデータで機能をお試しいただけます</li>
                <li>スマートフォンでの操作に最適化されています</li>
                <li>実際のデータは保存されません</li>
              </ul>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            ShiftCare - 障害者施設向けシフト・業務管理システム
          </p>
          <p className="text-xs text-gray-400 mt-1">
            現場スタッフの業務をサポートします
          </p>
        </div>
      </div>
    </div>
  )
}