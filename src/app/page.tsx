'use client'

import { Calendar, Users, FileText, BarChart3 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            シフト管理アプリ
          </h1>
          <p className="text-xl text-gray-600">
            障害者施設向けシフト管理＆業務支援アプリ
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">シフト管理</h3>
            <p className="text-gray-600">直感的なカレンダーでシフト管理</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">スタッフ管理</h3>
            <p className="text-gray-600">スタッフ情報と資格を一元管理</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FileText className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">日報管理</h3>
            <p className="text-gray-600">簡単な日報入力と管理</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">レポート</h3>
            <p className="text-gray-600">自動レポート生成と出力</p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold btn-touch"
          >
            ログインして開始
          </button>
        </div>
      </div>
    </div>
  )
}