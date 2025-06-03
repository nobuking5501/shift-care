'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange, getCurrentDemoUser } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import { Complaint, ComplaintStatus, ResponseRecord } from '@/types'
import { exportComplaintToPDF, exportComplaintsToPDF } from '@/lib/complaintExport'
import { 
  MessageSquare,
  Filter,
  Download,
  Eye,
  Plus,
  Calendar,
  User,
  Users,
  Clock,
  ArrowLeft,
  Search,
  Edit3,
  CheckCircle,
  Save
} from 'lucide-react'

// デモ用の苦情・要望データ
const demoComplaints: Complaint[] = [
  {
    id: 'comp_001',
    submittedBy: '3', // 山田花子
    submittedAt: new Date('2025-06-01T09:30:00'),
    complainantType: 'family',
    complainantName: '田中花子（母）',
    complaintDate: new Date('2025-06-01'),
    content: '息子の昼食時間がいつも遅く、他の利用者より30分も遅れて提供されています。息子は時間に敏感なので、決まった時間に食事を取らせてもらいたいです。また、食事の内容についても、アレルギー対応が不十分だと感じることがあります。',
    responseRecords: [
      {
        id: 'res_001',
        respondedAt: new Date('2025-06-01T14:00:00'),
        respondedBy: '1',
        content: 'ご指摘いただきありがとうございます。食事提供時間について調査し、スタッフ間で改善策を検討いたします。アレルギー対応についても栄養士と相談し、より安全な提供体制を構築いたします。'
      },
      {
        id: 'res_002',
        respondedAt: new Date('2025-06-02T10:00:00'),
        respondedBy: '1',
        content: '食事提供の流れを見直し、お客様のお子様を優先グループに変更いたしました。また、アレルギー表を更新し、調理スタッフ全員で共有いたします。今後このような問題が発生しないよう注意いたします。'
      }
    ],
    status: 'resolved',
    resolvedAt: new Date('2025-06-02T10:00:00'),
    updatedAt: new Date('2025-06-02T10:00:00')
  },
  {
    id: 'comp_002',
    submittedBy: '5', // 高橋美咲
    submittedAt: new Date('2025-05-28T15:20:00'),
    complainantType: 'user',
    complainantName: '佐藤太郎',
    complaintDate: new Date('2025-05-28'),
    content: 'トイレが汚れていることが多く、気持ちよく使用できません。特に午後の時間帯は清掃が行き届いていないようです。',
    responseRecords: [
      {
        id: 'res_003',
        respondedAt: new Date('2025-05-29T09:00:00'),
        respondedBy: '1',
        content: '清掃状況について確認し、清掃スケジュールを見直します。午後の清掃回数を増やし、定期的なチェックを実施いたします。'
      }
    ],
    status: 'in_progress',
    updatedAt: new Date('2025-05-29T09:00:00')
  },
  {
    id: 'comp_003',
    submittedBy: '6', // 伊藤健太
    submittedAt: new Date('2025-05-25T11:45:00'),
    complainantType: 'other',
    complainantName: '匿名',
    complaintDate: new Date('2025-05-25'),
    content: 'スタッフの対応が冷たく感じられることがあります。もう少し温かい対応をお願いしたいです。',
    responseRecords: [],
    status: 'pending',
    updatedAt: new Date('2025-05-25T11:45:00')
  }
]

export default function ComplaintsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [complaints, setComplaints] = useState<Complaint[]>(demoComplaints)
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>(demoComplaints)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [newResponse, setNewResponse] = useState('')
  const router = useRouter()

  // フィルター状態
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: '',
    sortBy: 'newest'
  })

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

  // フィルタリング処理
  useEffect(() => {
    let filtered = [...complaints]

    // ステータスフィルター
    if (filters.status !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === filters.status)
    }

    // 種別フィルター
    if (filters.type !== 'all') {
      filtered = filtered.filter(complaint => complaint.complainantType === filters.type)
    }

    // 検索フィルター
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(complaint => 
        complaint.content.toLowerCase().includes(search) ||
        complaint.complainantName.toLowerCase().includes(search)
      )
    }

    // ソート
    if (filters.sortBy === 'newest') {
      filtered.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
    } else if (filters.sortBy === 'oldest') {
      filtered.sort((a, b) => a.submittedAt.getTime() - b.submittedAt.getTime())
    }

    setFilteredComplaints(filtered)
  }, [complaints, filters])

  // ステータス更新
  const updateStatus = (complaintId: string, newStatus: ComplaintStatus) => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === complaintId 
        ? { 
            ...complaint, 
            status: newStatus, 
            resolvedAt: newStatus === 'resolved' ? new Date() : complaint.resolvedAt,
            updatedAt: new Date()
          }
        : complaint
    ))
  }

  // 対応記録追加
  const addResponseRecord = (complaintId: string) => {
    if (!newResponse.trim()) return

    const response: ResponseRecord = {
      id: `res_${Date.now()}`,
      respondedAt: new Date(),
      respondedBy: currentUser?.id || 'unknown',
      content: newResponse.trim()
    }

    setComplaints(prev => prev.map(complaint => 
      complaint.id === complaintId 
        ? { 
            ...complaint, 
            responseRecords: [...complaint.responseRecords, response],
            status: complaint.status === 'pending' ? 'in_progress' : complaint.status,
            updatedAt: new Date()
          }
        : complaint
    ))

    setNewResponse('')
    setShowResponseForm(false)
    
    // 選択中の苦情も更新
    if (selectedComplaint && selectedComplaint.id === complaintId) {
      const updatedComplaint = complaints.find(c => c.id === complaintId)
      if (updatedComplaint) {
        setSelectedComplaint({
          ...updatedComplaint,
          responseRecords: [...updatedComplaint.responseRecords, response]
        })
      }
    }
  }

  // PDF出力（個別）
  const exportToPDF = async (complaint: Complaint) => {
    try {
      await exportComplaintToPDF(complaint)
    } catch (error) {
      console.error('PDF出力エラー:', error)
      alert('PDF出力に失敗しました')
    }
  }

  // 一括PDF出力
  const exportAllToPDF = async () => {
    try {
      await exportComplaintsToPDF({
        complaints: filteredComplaints,
        facilityName: 'ShiftCare 障害者支援施設',
        exportDate: new Date()
      })
    } catch (error) {
      console.error('PDF出力エラー:', error)
      alert('PDF出力に失敗しました')
    }
  }

  // ステータス表示用のスタイル
  const getStatusStyle = (status: ComplaintStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // ステータス表示用のテキスト
  const getStatusText = (status: ComplaintStatus) => {
    switch (status) {
      case 'pending':
        return '未対応'
      case 'in_progress':
        return '対応中'
      case 'resolved':
        return '解決済み'
      default:
        return '不明'
    }
  }

  // 申し出人種別のテキスト
  const getComplainantTypeText = (type: string) => {
    switch (type) {
      case 'user':
        return '利用者'
      case 'family':
        return '家族'
      case 'other':
        return 'その他'
      default:
        return '不明'
    }
  }

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
      
      <div className="max-w-7xl mx-auto px-4 py-6">
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
                  苦情・要望管理
                </h1>
              </div>
              <p className="text-gray-600">
                受け付けた苦情・要望の管理と対応状況の確認
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={exportAllToPDF}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center btn-touch"
              >
                <Download className="w-4 h-4 mr-2" />
                一括PDF出力
              </button>
              <button
                onClick={() => router.push('/complaint-form')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center btn-touch"
              >
                <Plus className="w-4 h-4 mr-2" />
                新規受付
              </button>
            </div>
          </div>
        </div>

        {/* フィルター・検索 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 検索 */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="内容・申し出人で検索"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* ステータスフィルター */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">すべてのステータス</option>
              <option value="pending">未対応</option>
              <option value="in_progress">対応中</option>
              <option value="resolved">解決済み</option>
            </select>

            {/* 種別フィルター */}
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">すべての種別</option>
              <option value="user">利用者</option>
              <option value="family">家族</option>
              <option value="other">その他</option>
            </select>

            {/* ソート */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
            </select>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">総件数</p>
                <p className="text-2xl font-bold text-gray-900">{complaints.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">未対応</p>
                <p className="text-2xl font-bold text-gray-900">
                  {complaints.filter(c => c.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">対応中</p>
                <p className="text-2xl font-bold text-gray-900">
                  {complaints.filter(c => c.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">解決済み</p>
                <p className="text-2xl font-bold text-gray-900">
                  {complaints.filter(c => c.status === 'resolved').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 苦情・要望一覧 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              苦情・要望一覧 ({filteredComplaints.length}件)
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredComplaints.map((complaint) => (
              <div key={complaint.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full mr-2 ${getStatusStyle(complaint.status)}`}>
                        {getStatusText(complaint.status)}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 mr-2">
                        {getComplainantTypeText(complaint.complainantType)}
                      </span>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {complaint.complaintDate.toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-2 text-sm text-gray-600">
                      <User className="w-4 h-4 mr-1" />
                      申し出人: {complaint.complainantName || '匿名'}
                    </div>
                    
                    <p className="text-gray-900 mb-2 line-clamp-2">
                      {complaint.content}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      受付: {complaint.submittedAt.toLocaleDateString()} {complaint.submittedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      {complaint.responseRecords.length > 0 && (
                        <span className="ml-4">対応記録: {complaint.responseRecords.length}件</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {/* ステータス変更 */}
                    <select
                      value={complaint.status}
                      onChange={(e) => updateStatus(complaint.id, e.target.value as ComplaintStatus)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">未対応</option>
                      <option value="in_progress">対応中</option>
                      <option value="resolved">解決済み</option>
                    </select>
                    
                    <button 
                      onClick={() => {
                        setSelectedComplaint(complaint)
                        setShowDetails(true)
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm btn-touch"
                    >
                      詳細
                    </button>
                    
                    <button 
                      onClick={() => exportToPDF(complaint)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm btn-touch"
                    >
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredComplaints.length === 0 && (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                該当する苦情・要望がありません
              </h3>
              <p className="text-gray-600">
                フィルター条件を変更してください
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 詳細モーダル */}
      {showDetails && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  苦情・要望詳細
                </h3>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">受付日時</label>
                    <p className="mt-1">{selectedComplaint.submittedAt.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">発生日</label>
                    <p className="mt-1">{selectedComplaint.complaintDate.toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">申し出人種別</label>
                    <p className="mt-1">{getComplainantTypeText(selectedComplaint.complainantType)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">申し出人氏名</label>
                    <p className="mt-1">{selectedComplaint.complainantName || '匿名'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">苦情・要望内容</label>
                  <p className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{selectedComplaint.content}</p>
                </div>
                
                {/* 対応履歴 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">対応履歴</label>
                    <button
                      onClick={() => setShowResponseForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm btn-touch"
                    >
                      対応記録を追加
                    </button>
                  </div>
                  
                  {selectedComplaint.responseRecords.length > 0 ? (
                    <div className="space-y-3">
                      {selectedComplaint.responseRecords.map((record) => (
                        <div key={record.id} className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-900">
                              対応日時: {record.respondedAt.toLocaleString()}
                            </span>
                            <span className="text-xs text-blue-600">
                              対応者: {record.respondedBy}
                            </span>
                          </div>
                          <p className="text-sm text-blue-800 whitespace-pre-wrap">{record.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">まだ対応記録はありません</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ステータス</label>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${getStatusStyle(selectedComplaint.status)}`}>
                      {getStatusText(selectedComplaint.status)}
                    </span>
                  </div>
                  {selectedComplaint.resolvedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">解決日</label>
                      <p className="mt-1 text-sm">{selectedComplaint.resolvedAt.toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button 
                  onClick={() => exportToPDF(selectedComplaint)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded btn-touch"
                >
                  PDF出力
                </button>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded btn-touch"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 対応記録追加モーダル */}
      {showResponseForm && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  対応記録を追加
                </h3>
                <button 
                  onClick={() => {
                    setShowResponseForm(false)
                    setNewResponse('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  対応内容
                </label>
                <textarea
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  rows={5}
                  placeholder="実施した対応内容を詳しく記載してください"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setShowResponseForm(false)
                    setNewResponse('')
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded btn-touch"
                >
                  キャンセル
                </button>
                <button 
                  onClick={() => addResponseRecord(selectedComplaint.id)}
                  disabled={!newResponse.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded flex items-center btn-touch"
                >
                  <Save className="w-4 h-4 mr-2" />
                  記録を追加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}