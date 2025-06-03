'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import ShiftCalendar from '@/components/shifts/ShiftCalendar'
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'

export default function ShiftsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<'staff' | 'admin'>('staff')
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setUser(user)
        // In real app, fetch user role from Firestore
        setUserRole('admin') // Demo: set as admin
      } else {
        router.push('/login')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

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

  // Demo shift statistics
  const shiftStats = {
    totalShifts: 96,
    filledShifts: 89,
    pendingRequests: 3,
    coverage: 92.7
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              シフト管理
            </h1>
            <p className="text-gray-600">
              {userRole === 'admin' ? 'シフトの作成・編集・管理' : 'シフトの確認と希望提出'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {userRole === 'admin' && (
              <>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 btn-touch">
                  <Download className="w-4 h-4" />
                  <span>エクスポート</span>
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 btn-touch">
                  <RefreshCw className="w-4 h-4" />
                  <span>自動生成</span>
                </button>
              </>
            )}
            {userRole === 'staff' && (
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 btn-touch">
                <Plus className="w-4 h-4" />
                <span>希望提出</span>
              </button>
            )}
          </div>
        </div>

        {/* Statistics Cards (Admin only) */}
        {userRole === 'admin' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">総シフト数</p>
                  <p className="text-xl font-bold text-gray-900">{shiftStats.totalShifts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">配置済み</p>
                  <p className="text-xl font-bold text-gray-900">{shiftStats.filledShifts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">未配置</p>
                  <p className="text-xl font-bold text-gray-900">{shiftStats.pendingRequests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">%</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">カバー率</p>
                  <p className="text-xl font-bold text-gray-900">{shiftStats.coverage}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Toggle */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  カレンダー表示
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  リスト表示
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'calendar' ? (
          <ShiftCalendar 
            isAdmin={userRole === 'admin'} 
            userId={user?.uid}
            userRole={userRole}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                シフト一覧
              </h2>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">リスト表示は開発中です</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions for Staff */}
        {userRole === 'staff' && (
          <div className="mt-6 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              シフト希望の提出
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">来月のシフト希望</h4>
                <p className="text-sm text-gray-600 mb-3">
                  2025年7月分のシフト希望を提出してください
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm btn-touch">
                  希望を提出
                </button>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">シフト変更申請</h4>
                <p className="text-sm text-gray-600 mb-3">
                  急な予定変更がある場合はこちらから
                </p>
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm btn-touch">
                  変更申請
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}