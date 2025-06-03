'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange, getCurrentDemoUser } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import { Drill, Infection } from '@/types'
import { 
  Shield,
  Activity,
  Download,
  Eye,
  Plus,
  Calendar,
  Users,
  ArrowLeft,
  Search,
  Filter,
  Flame,
  Home,
  Target,
  Thermometer,
  Stethoscope,
  AlertTriangle
} from 'lucide-react'

// デモ用の防災訓練データ
const demoDrills: Drill[] = [
  {
    id: 'drill_001',
    conductedBy: '1', // 施設長 佐藤
    conductedAt: new Date('2025-05-15'),
    drillType: 'fire',
    participantsCount: 28,
    details: '火災避難訓練を実施しました。避難開始から全員の安全確認まで5分30秒で完了。利用者の皆様は職員の誘導に従って冷静に避難できました。ただし、車椅子利用者の避難に時間がかかった点が課題として挙げられます。',
    improvements: '車椅子利用者専用の避難経路を再検討し、職員の役割分担を明確化します。次回は夜間を想定した訓練も実施予定です。',
    createdAt: new Date('2025-05-15T14:30:00'),
    updatedAt: new Date('2025-05-15T14:30:00')
  },
  {
    id: 'drill_002',
    conductedBy: '3', // 山田花子
    conductedAt: new Date('2025-04-20'),
    drillType: 'earthquake',
    participantsCount: 25,
    details: '地震避難訓練を実施。初期行動（机の下に避難）から避難完了まで8分で実施。利用者の多くが適切に身を守る行動を取れました。',
    improvements: '避難経路の表示をより分かりやすくし、定期的な訓練で習熟度を向上させます。',
    createdAt: new Date('2025-04-20T10:00:00'),
    updatedAt: new Date('2025-04-20T10:00:00')
  },
  {
    id: 'drill_003',
    conductedBy: '6', // 伊藤健太
    conductedAt: new Date('2025-03-10'),
    drillType: 'firefighting',
    participantsCount: 15,
    details: '消火訓練を職員対象に実施。消火器の使用方法と初期消火の手順を確認しました。',
    improvements: '全職員が確実に消火器を使用できるよう、定期的な訓練を継続します。',
    createdAt: new Date('2025-03-10T15:00:00'),
    updatedAt: new Date('2025-03-10T15:00:00')
  }
]

// デモ用の感染症対応データ
const demoInfections: Infection[] = [
  {
    id: 'inf_001',
    reportedBy: '3', // 山田花子
    reportedAt: new Date('2025-02-01'),
    infectionType: 'influenza',
    affectedCount: 5,
    responseMeasures: 'インフルエンザ発症者5名を個室に隔離し、接触者の健康観察を実施。施設内の消毒を強化し、面会制限を実施しました。全職員にマスク着用を徹底させ、手指消毒を頻繁に行いました。',
    outcome: '発症から2週間で全員が回復し、新たな感染者は発生しませんでした。早期の隔離措置と感染予防策が効果的でした。今後は予防接種率の向上に努めます。',
    createdAt: new Date('2025-02-01T09:00:00'),
    updatedAt: new Date('2025-02-15T17:00:00')
  },
  {
    id: 'inf_002',
    reportedBy: '5', // 高橋美咲
    reportedAt: new Date('2025-01-15'),
    infectionType: 'norovirus',
    affectedCount: 3,
    responseMeasures: 'ノロウイルス感染症状のある利用者3名を隔離し、嘔吐物の適切な処理を実施。トイレや共有部分の消毒を強化し、職員の健康管理を徹底しました。',
    outcome: '1週間で症状が改善し、感染拡大は防止できました。感染予防の重要性を再認識し、衛生管理マニュアルを見直しました。',
    createdAt: new Date('2025-01-15T11:30:00'),
    updatedAt: new Date('2025-01-22T16:00:00')
  }
]

export default function SafetyRecordsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'drills' | 'infections'>('drills')
  const [drills] = useState<Drill[]>(demoDrills)
  const [infections] = useState<Infection[]>(demoInfections)
  const [selectedRecord, setSelectedRecord] = useState<Drill | Infection | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const router = useRouter()

  // フィルター状態
  const [filters, setFilters] = useState({
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

  // PDF出力（個別）
  const exportToPDF = async (record: Drill | Infection) => {
    try {
      const { exportDrillToPDF, exportInfectionToPDF } = await import('@/lib/safetyExport')
      
      if (isDrill(record)) {
        await exportDrillToPDF(record)
      } else {
        await exportInfectionToPDF(record)
      }
    } catch (error) {
      console.error('PDF出力エラー:', error)
      alert('PDF出力に失敗しました')
    }
  }

  // 訓練種別の表示テキスト
  const getDrillTypeText = (type: string) => {
    switch (type) {
      case 'fire':
        return '火災避難訓練'
      case 'earthquake':
        return '地震避難訓練'
      case 'evacuation':
        return '避難誘導訓練'
      case 'firefighting':
        return '消火訓練'
      case 'other':
        return 'その他'
      default:
        return '不明'
    }
  }

  // 感染症種別の表示テキスト
  const getInfectionTypeText = (type: string) => {
    switch (type) {
      case 'influenza':
        return 'インフルエンザ'
      case 'covid19':
        return 'COVID-19'
      case 'norovirus':
        return 'ノロウイルス'
      case 'other':
        return 'その他'
      default:
        return '不明'
    }
  }

  // 訓練種別のアイコン
  const getDrillTypeIcon = (type: string) => {
    switch (type) {
      case 'fire':
        return <Flame className="w-5 h-5 text-red-600" />
      case 'earthquake':
        return <Home className="w-5 h-5 text-yellow-600" />
      case 'evacuation':
        return <Users className="w-5 h-5 text-blue-600" />
      case 'firefighting':
        return <Target className="w-5 h-5 text-orange-600" />
      case 'other':
        return <Shield className="w-5 h-5 text-gray-600" />
      default:
        return <Shield className="w-5 h-5 text-gray-600" />
    }
  }

  // 感染症種別のアイコン
  const getInfectionTypeIcon = (type: string) => {
    switch (type) {
      case 'influenza':
        return <Thermometer className="w-5 h-5 text-orange-600" />
      case 'covid19':
        return <Activity className="w-5 h-5 text-red-600" />
      case 'norovirus':
        return <Stethoscope className="w-5 h-5 text-purple-600" />
      case 'other':
        return <AlertTriangle className="w-5 h-5 text-gray-600" />
      default:
        return <Activity className="w-5 h-5 text-gray-600" />
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

  const isDrill = (record: Drill | Infection): record is Drill => {
    return 'drillType' in record
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
                  防災・感染症記録管理
                </h1>
              </div>
              <p className="text-gray-600">
                防災訓練と感染症対応の記録管理
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/drill-form')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center btn-touch"
              >
                <Shield className="w-4 h-4 mr-2" />
                防災訓練記録
              </button>
              <button
                onClick={() => router.push('/infection-form')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center btn-touch"
              >
                <Activity className="w-4 h-4 mr-2" />
                感染症対応記録
              </button>
            </div>
          </div>
        </div>

        {/* タブ切り替え */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('drills')}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'drills'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                防災訓練記録 ({drills.length})
              </button>
              <button
                onClick={() => setActiveTab('infections')}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'infections'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Activity className="w-4 h-4 inline mr-2" />
                感染症対応記録 ({infections.length})
              </button>
            </nav>
          </div>

          {/* フィルター・検索 */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 検索 */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="内容で検索"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

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
        </div>

        {/* 防災訓練記録一覧 */}
        {activeTab === 'drills' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                防災訓練記録 ({drills.length}件)
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {drills.map((drill) => (
                <div key={drill.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {getDrillTypeIcon(drill.drillType)}
                        <span className="font-medium text-gray-900 ml-2">
                          {getDrillTypeText(drill.drillType)}
                        </span>
                        <div className="flex items-center text-sm text-gray-600 ml-4">
                          <Calendar className="w-4 h-4 mr-1" />
                          {drill.conductedAt.toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        参加人数: {drill.participantsCount}名
                      </div>
                      
                      <p className="text-gray-900 mb-2 line-clamp-2">
                        {drill.details}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button 
                        onClick={() => {
                          setSelectedRecord(drill)
                          setShowDetails(true)
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm btn-touch"
                      >
                        詳細
                      </button>
                      
                      <button 
                        onClick={() => exportToPDF(drill)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm btn-touch"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {drills.length === 0 && (
              <div className="p-12 text-center">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  防災訓練記録がありません
                </h3>
                <p className="text-gray-600">
                  防災訓練を実施して記録を作成してください
                </p>
              </div>
            )}
          </div>
        )}

        {/* 感染症対応記録一覧 */}
        {activeTab === 'infections' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                感染症対応記録 ({infections.length}件)
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {infections.map((infection) => (
                <div key={infection.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {getInfectionTypeIcon(infection.infectionType)}
                        <span className="font-medium text-gray-900 ml-2">
                          {getInfectionTypeText(infection.infectionType)}
                        </span>
                        <div className="flex items-center text-sm text-gray-600 ml-4">
                          <Calendar className="w-4 h-4 mr-1" />
                          {infection.reportedAt.toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        発症者数: {infection.affectedCount}名
                      </div>
                      
                      <p className="text-gray-900 mb-2 line-clamp-2">
                        {infection.responseMeasures}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button 
                        onClick={() => {
                          setSelectedRecord(infection)
                          setShowDetails(true)
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm btn-touch"
                      >
                        詳細
                      </button>
                      
                      <button 
                        onClick={() => exportToPDF(infection)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm btn-touch"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {infections.length === 0 && (
              <div className="p-12 text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  感染症対応記録がありません
                </h3>
                <p className="text-gray-600">
                  感染症発生時に記録を作成してください
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 詳細モーダル */}
      {showDetails && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isDrill(selectedRecord) ? '防災訓練詳細' : '感染症対応詳細'}
                </h3>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {isDrill(selectedRecord) ? (
                  // 防災訓練の詳細
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">実施日</label>
                        <p className="mt-1">{selectedRecord.conductedAt.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">訓練種別</label>
                        <p className="mt-1">{getDrillTypeText(selectedRecord.drillType)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">参加人数</label>
                      <p className="mt-1">{selectedRecord.participantsCount}名</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">訓練内容・評価・課題</label>
                      <p className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{selectedRecord.details}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">改善策・今後の対応</label>
                      <p className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{selectedRecord.improvements}</p>
                    </div>
                  </>
                ) : (
                  // 感染症対応の詳細
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">発生日</label>
                        <p className="mt-1">{selectedRecord.reportedAt.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">感染症種別</label>
                        <p className="mt-1">{getInfectionTypeText(selectedRecord.infectionType)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">発症者数</label>
                      <p className="mt-1">{selectedRecord.affectedCount}名</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">対応内容</label>
                      <p className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{selectedRecord.responseMeasures}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">収束状況・教訓</label>
                      <p className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{selectedRecord.outcome}</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button 
                  onClick={() => exportToPDF(selectedRecord)}
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