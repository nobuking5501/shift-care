'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import { canDeleteStaff } from '@/lib/staff-validation'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone,
  Award,
  Moon
} from 'lucide-react'

interface Staff {
  id: string
  name: string
  email: string
  role: 'staff' | 'admin'
  qualifications: string[]
  nightShiftOK: boolean
  phone: string
  joinedDate: string
}

export default function StaffPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const router = useRouter()

  // Demo staff data - 拡張版 (管理者1名 + 正社員10名 + パート・アルバイト5名)
  const [staff, setStaff] = useState<Staff[]>([
    // 管理者
    { id: '1', name: '施設長 佐藤', email: 'sato@facility.com', role: 'admin', qualifications: ['社会福祉士', '介護支援専門員', '普通自動車免許'], nightShiftOK: false, phone: '090-1000-0001', joinedDate: '2020-04-01' },
    // 正社員スタッフ
    { id: '2', name: '田中太郎', email: 'tanaka@facility.com', role: 'staff', qualifications: ['介護福祉士', '普通自動車免許'], nightShiftOK: true, phone: '090-1111-0001', joinedDate: '2022-04-01' },
    { id: '3', name: '山田花子', email: 'yamada@facility.com', role: 'staff', qualifications: ['社会福祉士', '介護福祉士', '普通自動車免許'], nightShiftOK: true, phone: '090-1111-0002', joinedDate: '2021-10-01' },
    { id: '4', name: '鈴木一郎', email: 'suzuki@facility.com', role: 'staff', qualifications: ['介護福祉士', '実務者研修'], nightShiftOK: true, phone: '090-1111-0003', joinedDate: '2023-04-01' },
    { id: '5', name: '高橋美咲', email: 'takahashi@facility.com', role: 'staff', qualifications: ['介護福祉士', '普通自動車免許'], nightShiftOK: false, phone: '090-1111-0004', joinedDate: '2022-10-01' },
    { id: '6', name: '伊藤健太', email: 'ito@facility.com', role: 'staff', qualifications: ['介護福祉士', '普通自動車免許', '救急救命講習'], nightShiftOK: true, phone: '090-1111-0005', joinedDate: '2021-04-01' },
    { id: '7', name: '渡辺麻衣', email: 'watanabe@facility.com', role: 'staff', qualifications: ['社会福祉士', '精神保健福祉士'], nightShiftOK: false, phone: '090-1111-0006', joinedDate: '2023-10-01' },
    { id: '8', name: '中村雄介', email: 'nakamura@facility.com', role: 'staff', qualifications: ['介護福祉士', '普通自動車免許'], nightShiftOK: true, phone: '090-1111-0007', joinedDate: '2022-01-15' },
    { id: '9', name: '小林さくら', email: 'kobayashi@facility.com', role: 'staff', qualifications: ['介護福祉士', '実務者研修'], nightShiftOK: false, phone: '090-1111-0008', joinedDate: '2023-07-01' },
    { id: '10', name: '加藤大輔', email: 'kato@facility.com', role: 'staff', qualifications: ['介護福祉士', '普通自動車免許', '衛生管理者'], nightShiftOK: true, phone: '090-1111-0009', joinedDate: '2020-10-01' },
    { id: '11', name: '吉田優子', email: 'yoshida@facility.com', role: 'staff', qualifications: ['社会福祉士', '介護福祉士'], nightShiftOK: false, phone: '090-1111-0010', joinedDate: '2021-07-01' },
    // 非常勤パート・アルバイト
    { id: '12', name: '松本真理（パート）', email: 'matsumoto@facility.com', role: 'staff', qualifications: ['介護初任者研修'], nightShiftOK: false, phone: '090-2222-0001', joinedDate: '2024-01-15' },
    { id: '13', name: '森田浩二（パート）', email: 'morita@facility.com', role: 'staff', qualifications: ['実務者研修', '普通自動車免許'], nightShiftOK: false, phone: '090-2222-0002', joinedDate: '2024-03-01' },
    { id: '14', name: '清水由美（アルバイト）', email: 'shimizu@facility.com', role: 'staff', qualifications: ['介護初任者研修'], nightShiftOK: false, phone: '090-2222-0003', joinedDate: '2024-04-10' },
    { id: '15', name: '橋本学（パート）', email: 'hashimoto@facility.com', role: 'staff', qualifications: ['実務者研修'], nightShiftOK: false, phone: '090-2222-0004', joinedDate: '2024-02-20' },
    { id: '16', name: '西村香織（アルバイト）', email: 'nishimura@facility.com', role: 'staff', qualifications: ['介護初任者研修'], nightShiftOK: false, phone: '090-2222-0005', joinedDate: '2024-05-01' }
  ])

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

  const handleDeleteStaff = (staffId: string) => {
    const targetStaff = staff.find(member => member.id === staffId)
    if (!targetStaff) return
    
    // 権限チェック
    if (!canDeleteStaff('admin', targetStaff)) {
      alert('このスタッフは削除できません。管理者は削除できません。')
      return
    }
    
    if (window.confirm('このスタッフを削除しますか？この操作は取り消せません。')) {
      setStaff(staff.filter(member => member.id !== staffId))
      alert('スタッフを削除しました')
    }
  }

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole="admin" />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              スタッフ管理
            </h1>
            <p className="text-gray-600">
              スタッフ情報の確認・編集・追加
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 btn-touch"
          >
            <Plus className="w-4 h-4" />
            <span>新規追加</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="名前やメールアドレスで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Staff List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              スタッフ一覧 ({filteredStaff.length}名)
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredStaff.map((member) => (
              <div key={member.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {member.name}
                        {member.role === 'admin' && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            管理者
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{member.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{member.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => router.push(`/staff/${member.id}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      title="詳細・編集"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteStaff(member.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="削除"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">
                      資格: {member.qualifications.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Moon className={`w-4 h-4 ${member.nightShiftOK ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="text-sm text-gray-600">
                      夜勤: {member.nightShiftOK ? '可能' : '不可'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    入社日: {member.joinedDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              新しいスタッフを追加
            </h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  氏名
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="山田花子"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="yamada@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電話番号
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="090-1234-5678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  役職
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="staff">スタッフ</option>
                  <option value="admin">管理者</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">夜勤可能</span>
                </label>
              </div>
            </form>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => {
                  // Add staff logic here
                  setShowAddModal(false)
                }}
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}