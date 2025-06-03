'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithGoogle, onAuthStateChange } from '@/lib/auth'
import Link from 'next/link'
import { LogIn, Calendar, Smartphone, User, Users } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      console.log('Auth state changed in login page:', user)
      if (user) {
        // ユーザーロールに基づいてリダイレクト先を決定
        if (user.role === 'admin') {
          console.log('Redirecting admin to dashboard')
          router.push('/dashboard')
        } else {
          console.log('Redirecting staff to staff-dashboard')
          router.push('/staff-dashboard')
        }
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    
    try {
      console.log('Starting admin login...')
      const result = await signInWithGoogle()
      console.log('Admin login result:', result)
      console.log('Redirecting to /dashboard')
      router.push('/dashboard') // 管理者用ダッシュボード
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
        <div className="text-center">
          <Calendar className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ShiftCare 管理者ログイン
          </h1>
          <p className="text-gray-600 text-accessible">
            障害者施設向けシフト・業務管理システム
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              管理者ログイン
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              施設管理者・責任者向けログイン
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-4 px-6 rounded-lg flex items-center justify-center space-x-2 text-lg font-medium btn-touch"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  <span>管理者としてログイン</span>
                </>
              )}
            </button>

            {/* スタッフログインへのリンク */}
            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">または</span>
                </div>
              </div>
            </div>

            <Link
              href="/staff-login"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg flex items-center justify-center space-x-2 text-lg font-medium btn-touch transition-colors"
            >
              <User className="w-5 h-5" />
              <span>スタッフログインはこちら</span>
            </Link>
          </div>

          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
              <strong>🎭 プロトタイプ版</strong><br />
              実際の機能をデモ用データで体験できます
            </div>
          </div>

          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              管理者向け機能
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>📊 スタッフからの報告受信・管理</p>
              <p>📅 シフト作成・管理</p>
              <p>📄 PDF出力・行政報告</p>
              <p>👥 スタッフ情報管理</p>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            ログインすることで、
            <a href="#" className="text-blue-600 hover:text-blue-800">利用規約</a>
            と
            <a href="#" className="text-blue-600 hover:text-blue-800">プライバシーポリシー</a>
            に同意したものとみなされます。
          </p>
        </div>
      </div>
    </div>
  )
}