'use client'

import { useRouter } from 'next/navigation'
import { signInWithGoogle, signInAsStaff } from '@/lib/auth'
import {
  Calendar,
  Users,
  FileText,
  BarChart3,
  Shield,
  Heart,
  Clock,
  Award,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function Home() {
  const router = useRouter()

  const handleAdminLogin = async () => {
    try {
      await signInWithGoogle() // 管理者としてログイン
      router.push('/dashboard')
    } catch (error) {
      console.error('Admin login failed:', error)
    }
  }

  const handleStaffLogin = async () => {
    try {
      await signInAsStaff() // スタッフとしてログイン
      router.push('/staff-dashboard')
    } catch (error) {
      console.error('Staff login failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6 shadow-2xl">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                ShiftCare Pro
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-4 max-w-3xl mx-auto leading-relaxed">
              障害者施設向け総合管理システム
            </p>
            <p className="text-lg text-blue-200 mb-12 max-w-2xl mx-auto">
              スタッフ管理から利用者ケア記録まで、すべてを統合した次世代プラットフォーム
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="group bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">シフト管理</h3>
              <p className="text-blue-100 leading-relaxed">AI支援による最適なシフト自動生成と直感的な調整機能</p>
            </div>

            <div className="group bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">スタッフ管理</h3>
              <p className="text-blue-100 leading-relaxed">資格管理・勤怠管理・評価システムを一元化した統合管理</p>
            </div>

            <div className="group bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">記録管理</h3>
              <p className="text-blue-100 leading-relaxed">日報・モニタリング・支援計画まで包括的な記録システム</p>
            </div>

            <div className="group bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">分析・報告</h3>
              <p className="text-blue-100 leading-relaxed">高度な分析機能と自動レポート生成でデータ活用を促進</p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">安全管理</h4>
                <p className="text-blue-200 text-sm">事故報告・防災訓練・感染症対策</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">リアルタイム</h4>
                <p className="text-blue-200 text-sm">即座に情報共有・通知システム</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">品質向上</h4>
                <p className="text-blue-200 text-sm">継続的な改善とスキルアップ支援</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={handleAdminLogin}
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-4 rounded-xl text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 border border-blue-500/50"
              >
                <span className="flex items-center">
                  管理者ダッシュボード
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </button>
              <button
                onClick={handleStaffLogin}
                className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-4 rounded-xl text-lg font-semibold shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 border border-green-500/50"
              >
                <span className="flex items-center">
                  スタッフダッシュボード
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </button>
            </div>
            <p className="text-blue-200 mt-6 text-sm">
              <CheckCircle className="inline w-4 h-4 mr-1" />
              セキュアなクラウド環境で安全に運用
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}