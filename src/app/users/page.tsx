'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import {
  User,
  UserPlus,
  Edit3,
  Trash2,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

// デモ用利用者データ
const demoServiceUsers = [
  {
    id: '1',
    name: '田中太郎',
    age: 25,
    gender: '男性',
    disability: '知的障害',
    supportLevel: 'レベル2',
    guardianName: '田中花子',
    guardianPhone: '090-1111-1111',
    address: '東京都新宿区1-1-1',
    emergencyContact: '090-2222-2222',
    medicalInfo: 'てんかん（服薬中）',
    joinedDate: '2023-04-01',
    status: 'active'
  },
  {
    id: '2',
    name: '佐藤美咲',
    age: 30,
    gender: '女性',
    disability: '身体障害',
    supportLevel: 'レベル1',
    guardianName: '佐藤一郎',
    guardianPhone: '090-3333-3333',
    address: '東京都渋谷区2-2-2',
    emergencyContact: '090-4444-4444',
    medicalInfo: '車椅子使用',
    joinedDate: '2022-10-15',
    status: 'active'
  },
  {
    id: '3',
    name: '山田花子',
    age: 28,
    gender: '女性',
    disability: '精神障害',
    supportLevel: 'レベル3',
    guardianName: '山田次郎',
    guardianPhone: '090-5555-5555',
    address: '東京都世田谷区3-3-3',
    emergencyContact: '090-6666-6666',
    medicalInfo: 'うつ病（通院中）',
    joinedDate: '2023-08-20',
    status: 'active'
  },
  {
    id: '4',
    name: '鈴木健一',
    age: 35,
    gender: '男性',
    disability: '知的障害・身体障害',
    supportLevel: 'レベル4',
    guardianName: '鈴木京子',
    guardianPhone: '090-7777-7777',
    address: '東京都中央区4-4-4',
    emergencyContact: '090-8888-8888',
    medicalInfo: 'ダウン症・心疾患',
    joinedDate: '2021-03-10',
    status: 'active'
  }
]

export default function UsersPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [serviceUsers, setServiceUsers] = useState(demoServiceUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

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
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/staff-dashboard')
    }
  }, [user, router])

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

  // 管理者以外はアクセス不可
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">アクセス権限がありません</h2>
          <p className="text-gray-600">この機能は管理者専用です</p>
        </div>
      </div>
    )
  }

  const filteredUsers = serviceUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.disability.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.supportLevel.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('本当にこの利用者を削除しますか？')) {
      setServiceUsers(serviceUsers.filter(user => user.id !== userId))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole="admin" />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">利用者管理</h1>
            <p className="text-gray-600">
              利用者情報の管理・編集ができます
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center btn-touch">
            <UserPlus className="w-5 h-5 mr-2" />
            新規利用者登録
          </button>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">総利用者数</p>
                <p className="text-2xl font-bold text-gray-900">{serviceUsers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">アクティブ</p>
                <p className="text-2xl font-bold text-gray-900">
                  {serviceUsers.filter(u => u.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">レベル3以上</p>
                <p className="text-2xl font-bold text-gray-900">
                  {serviceUsers.filter(u => u.supportLevel.includes('3') || u.supportLevel.includes('4')).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">今月新規</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* 検索バー */}
        <div className="mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <input
              type="text"
              placeholder="利用者名、障害種別、支援レベルで検索..."
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 利用者リスト */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              利用者一覧 ({filteredUsers.length}名)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    利用者情報
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    障害・支援レベル
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    保護者・緊急連絡先
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    利用開始日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((serviceUser) => (
                  <tr key={serviceUser.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {serviceUser.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {serviceUser.age}歳・{serviceUser.gender}
                          </div>
                          <div className="text-xs text-gray-400">
                            <MapPin className="inline w-3 h-3 mr-1" />
                            {serviceUser.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {serviceUser.disability}
                      </div>
                      <div className="text-sm text-gray-500">
                        支援{serviceUser.supportLevel}
                      </div>
                      {serviceUser.medicalInfo && (
                        <div className="text-xs text-red-600 mt-1">
                          {serviceUser.medicalInfo}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {serviceUser.guardianName}
                      </div>
                      <div className="text-sm text-gray-500">
                        <Phone className="inline w-3 h-3 mr-1" />
                        {serviceUser.guardianPhone}
                      </div>
                      <div className="text-xs text-gray-400">
                        緊急: {serviceUser.emergencyContact}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {serviceUser.joinedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3 btn-touch">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(serviceUser.id)}
                        className="text-red-600 hover:text-red-900 btn-touch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? '検索条件に一致する利用者が見つかりません' : '利用者が登録されていません'}
              </p>
            </div>
          )}
        </div>

        {/* 注意事項 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
            <div className="text-sm text-yellow-700">
              <strong>プライバシーについて:</strong> 利用者の個人情報は厳重に管理し、
              必要最小限の範囲でのみ使用してください。個人情報保護法に基づく適切な取り扱いを徹底してください。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}