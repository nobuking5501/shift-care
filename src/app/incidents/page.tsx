'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange, getCurrentDemoUser } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import { Incident, IncidentStatus } from '@/types'
import { exportIncidentToPDF, exportIncidentsToPDF } from '@/lib/incidentExport'
import { 
  AlertTriangle,
  Filter,
  Download,
  Eye,
  Edit3,
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Search,
  ChevronDown
} from 'lucide-react'

// デモ用の事故・ヒヤリハットデータ
const demoIncidents: Incident[] = [
  {
    id: 'inc_001',
    reportedBy: '2', // 田中太郎
    reportedAt: new Date('2025-06-01T14:30:00'),
    incidentDate: new Date('2025-06-01T14:15:00'),
    incidentType: 'nearMiss',
    location: 'リビング',
    involvedPersons: ['利用者A', '田中太郎'],
    description: '利用者Aが車椅子から立ち上がろうとした際に、バランスを崩しかけました。すぐに支援し転倒は防げましたが、ヒヤリとしました。',
    response: 'すぐに身体を支え、安全な姿勢に戻しました。けがはありませんでした。',
    preventiveMeasures: '車椅子のブレーキ確認を徹底し、立ち上がり時は必ず声かけ・見守りを行う。',
    status: 'completed',
    updatedAt: new Date('2025-06-01T15:00:00'),
    updatedBy: '1'
  },
  {
    id: 'inc_002',
    reportedBy: '5', // 高橋美咲
    reportedAt: new Date('2025-05-30T10:20:00'),
    incidentDate: new Date('2025-05-30T10:00:00'),
    incidentType: 'accident',
    location: 'トイレ',
    involvedPersons: ['利用者B'],
    description: '利用者Bがトイレで滑って軽く転倒しました。手すりにつかまっていたため大きなけがはありませんでしたが、右膝に軽い打撲。',
    response: '看護師に連絡し、患部を確認。冷却処置を行い、ご家族に連絡済み。',
    preventiveMeasures: 'トイレの床の滑り止めマットを追加設置。定期的な清掃時の水気除去を徹底。',
    status: 'in_progress',
    updatedAt: new Date('2025-05-30T11:00:00'),
    updatedBy: '1'
  },
  {
    id: 'inc_003',
    reportedBy: '6', // 伊藤健太
    reportedAt: new Date('2025-05-28T16:45:00'),
    incidentDate: new Date('2025-05-28T16:30:00'),
    incidentType: 'nearMiss',
    location: '食堂',
    involvedPersons: ['利用者C', '伊藤健太'],
    description: '昼食後、利用者Cが食事中に咳き込み、食べ物が詰まりかけました。',
    response: '背中を軽く叩いて促し、水を飲んでもらい回復。呼吸に問題なし。',
    preventiveMeasures: '食事時の見守りを強化し、一口量を調整。とろみ付けの検討。',
    status: 'pending',
    updatedAt: new Date('2025-05-28T17:00:00')
  }
]

export default function IncidentsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [incidents, setIncidents] = useState<Incident[]>(demoIncidents)
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>(demoIncidents)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [showDetails, setShowDetails] = useState(false)
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
    let filtered = [...incidents]

    // ステータスフィルター
    if (filters.status !== 'all') {
      filtered = filtered.filter(incident => incident.status === filters.status)
    }

    // 種別フィルター
    if (filters.type !== 'all') {
      filtered = filtered.filter(incident => incident.incidentType === filters.type)
    }

    // 検索フィルター
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(incident => 
        incident.location.toLowerCase().includes(search) ||
        incident.description.toLowerCase().includes(search) ||
        incident.involvedPersons.some(person => person.toLowerCase().includes(search))
      )
    }

    // ソート
    if (filters.sortBy === 'newest') {
      filtered.sort((a, b) => b.incidentDate.getTime() - a.incidentDate.getTime())
    } else if (filters.sortBy === 'oldest') {
      filtered.sort((a, b) => a.incidentDate.getTime() - b.incidentDate.getTime())
    }

    setFilteredIncidents(filtered)
  }, [incidents, filters])

  // ステータス更新
  const updateStatus = (incidentId: string, newStatus: IncidentStatus) => {
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { 
            ...incident, 
            status: newStatus, 
            updatedAt: new Date(),
            updatedBy: currentUser?.id 
          }
        : incident
    ))
  }

  // PDF出力（個別）
  const exportToPDF = async (incident: Incident) => {
    try {
      await exportIncidentToPDF(incident)
    } catch (error) {
      console.error('PDF出力エラー:', error)
      alert('PDF出力に失敗しました')
    }
  }

  // 一括PDF出力
  const exportAllToPDF = async () => {
    try {
      await exportIncidentsToPDF({
        incidents: filteredIncidents,
        facilityName: 'ShiftCare 障害者支援施設',
        exportDate: new Date()
      })
    } catch (error) {
      console.error('PDF出力エラー:', error)
      alert('PDF出力に失敗しました')
    }
  }

  // ステータス表示用のスタイル
  const getStatusStyle = (status: IncidentStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // ステータス表示用のテキスト
  const getStatusText = (status: IncidentStatus) => {
    switch (status) {
      case 'pending':
        return '未対応'
      case 'in_progress':
        return '対応中'
      case 'completed':
        return '対応済み'
      default:
        return '不明'
    }
  }

  // 事故種別のスタイル
  const getTypeStyle = (type: string) => {
    return type === 'accident' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-orange-100 text-orange-800'
  }

  // 事故種別のテキスト
  const getTypeText = (type: string) => {
    return type === 'accident' ? '事故' : 'ヒヤリハット'
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
                  事故・ヒヤリハット管理
                </h1>
              </div>
              <p className="text-gray-600">
                報告された事故・ヒヤリハット事例の管理と対応状況の確認
              </p>
            </div>
            <button
              onClick={exportAllToPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center btn-touch"
            >
              <Download className="w-4 h-4 mr-2" />
              一括PDF出力
            </button>
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
                placeholder="場所・内容・関係者で検索"
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
              <option value="completed">対応済み</option>
            </select>

            {/* 種別フィルター */}
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">すべての種別</option>
              <option value="accident">事故</option>
              <option value="nearMiss">ヒヤリハット</option>
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
              <AlertTriangle className="w-8 h-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">総報告数</p>
                <p className="text-2xl font-bold text-gray-900">{incidents.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">未対応</p>
                <p className="text-2xl font-bold text-gray-900">
                  {incidents.filter(i => i.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">事故</p>
                <p className="text-2xl font-bold text-gray-900">
                  {incidents.filter(i => i.incidentType === 'accident').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">ヒヤリハット</p>
                <p className="text-2xl font-bold text-gray-900">
                  {incidents.filter(i => i.incidentType === 'nearMiss').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 事故・ヒヤリハット一覧 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              報告一覧 ({filteredIncidents.length}件)
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredIncidents.map((incident) => (
              <div key={incident.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full mr-2 ${getTypeStyle(incident.incidentType)}`}>
                        {getTypeText(incident.incidentType)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full mr-2 ${getStatusStyle(incident.status)}`}>
                        {getStatusText(incident.status)}
                      </span>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {incident.incidentDate.toLocaleDateString()} {incident.incidentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {incident.location}
                      <Users className="w-4 h-4 ml-4 mr-1" />
                      {incident.involvedPersons.join(', ')}
                    </div>
                    
                    <p className="text-gray-900 mb-2 line-clamp-2">
                      {incident.description}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      報告: {incident.reportedAt.toLocaleDateString()} {incident.reportedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {/* ステータス変更 */}
                    <select
                      value={incident.status}
                      onChange={(e) => updateStatus(incident.id, e.target.value as IncidentStatus)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">未対応</option>
                      <option value="in_progress">対応中</option>
                      <option value="completed">対応済み</option>
                    </select>
                    
                    <button 
                      onClick={() => {
                        setSelectedIncident(incident)
                        setShowDetails(true)
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm btn-touch"
                    >
                      詳細
                    </button>
                    
                    <button 
                      onClick={() => exportToPDF(incident)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm btn-touch"
                    >
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredIncidents.length === 0 && (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                該当する報告がありません
              </h3>
              <p className="text-gray-600">
                フィルター条件を変更してください
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 詳細モーダル */}
      {showDetails && selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  事故・ヒヤリハット詳細
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
                    <label className="block text-sm font-medium text-gray-700">発生日時</label>
                    <p className="mt-1">{selectedIncident.incidentDate.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">種別</label>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${getTypeStyle(selectedIncident.incidentType)}`}>
                      {getTypeText(selectedIncident.incidentType)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">発生場所</label>
                  <p className="mt-1">{selectedIncident.location}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">関係者</label>
                  <p className="mt-1">{selectedIncident.involvedPersons.join(', ')}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">発生状況</label>
                  <p className="mt-1 whitespace-pre-wrap">{selectedIncident.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">対応・処置</label>
                  <p className="mt-1 whitespace-pre-wrap">{selectedIncident.response}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">再発防止策</label>
                  <p className="mt-1 whitespace-pre-wrap">{selectedIncident.preventiveMeasures}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ステータス</label>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${getStatusStyle(selectedIncident.status)}`}>
                      {getStatusText(selectedIncident.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">報告日時</label>
                    <p className="mt-1 text-sm">{selectedIncident.reportedAt.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button 
                  onClick={() => exportToPDF(selectedIncident)}
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
    </div>
  )
}