'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange, getCurrentDemoUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import {
  FileText,
  Calendar,
  Clock,
  Users,
  User,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Thermometer,
  Heart,
  Pill,
  MessageSquare,
  TrendingUp,
  BarChart3,
  FileCheck,
  Plus,
  Database
} from 'lucide-react'

// 日報データの型定義
interface DailyReport {
  id: string
  date: string
  staffId: string
  staffName: string
  shiftType: 'early' | 'day' | 'late' | 'night'
  submittedAt: Date
  basic: {
    generalActivities: string
    teamNotes: string
  }
  userReports: UserDailyReport[]
  summary: {
    totalUsers: number
    completedReports: number
    incompletedReports: number
  }
  status: 'submitted' | 'reviewed' | 'approved'
  reviewNotes?: string
  reviewedBy?: string
  reviewedAt?: Date
}

interface UserDailyReport {
  userId: string
  userName: string
  vitalSigns: {
    temperature?: string
    bloodPressure?: string
    pulse?: string
    oxygen?: string
  }
  moodCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'concerning'
  appetiteCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'refused'
  sleepCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'sleepless'
  activities: string
  medicationStatus: string
  specialNotes: string
  concernsIssues: string
  completed: boolean
}

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<DailyReport[]>([])
  const [filteredReports, setFilteredReports] = useState<DailyReport[]>([])
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingProgress, setGeneratingProgress] = useState({ current: 0, total: 0, month: 0 })

  // フィルター状態
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    staffId: '',
    shiftType: '',
    status: '',
    searchTerm: ''
  })
  
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setUser(user)
        if (user.role !== 'admin') {
          router.push('/staff-dashboard')
          return
        }
      } else {
        router.push('/')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  // Supabaseから日報データを取得
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from('daily_reports')
          .select('*')
          .order('report_date', { ascending: false })
          .order('created_at', { ascending: false })

        if (error) {
          console.error('日報取得エラー:', error)
          return
        }

        if (data && data.length > 0) {
          // Supabaseのデータをフロントエンドの型に変換
          const formattedReports: DailyReport[] = data.map(report => ({
            id: report.id,
            date: report.report_date,
            staffId: report.staff_id,
            staffName: report.staff_name,
            shiftType: report.shift_type as 'early' | 'day' | 'late' | 'night',
            submittedAt: new Date(report.submitted_at),
            basic: {
              generalActivities: report.general_activities || '',
              teamNotes: report.team_notes || ''
            },
            userReports: report.user_reports || [],
            summary: {
              totalUsers: report.total_users || 0,
              completedReports: report.completed_reports || 0,
              incompletedReports: report.incompleted_reports || 0
            },
            status: 'submitted' // デフォルトでsubmitted
          }))

          setReports(formattedReports)
          console.log('Supabaseから日報を取得しました:', formattedReports.length, '件')
        } else {
          console.log('日報データがありません。')
          setReports([])
        }
      } catch (error) {
        console.error('日報取得処理エラー:', error)
        setReports([])
      }
    }

    const generateDemoReports = () => {
      const staffMembers = [
        { id: '2', name: '田中太郎' },
        { id: '3', name: '山田花子' },
        { id: '4', name: '鈴木一郎' },
        { id: '5', name: '高橋美咲' }
      ]

      const serviceUsers = [
        { id: 'user1', name: '田中 花子' },
        { id: 'user2', name: '佐藤 一郎' },
        { id: 'user3', name: '山田 美智子' },
        { id: 'user4', name: '鈴木 太郎' },
        { id: 'user5', name: '高橋 和子' }
      ]

      const demoReports: DailyReport[] = []

      // 過去7日分のデモ日報を生成
      for (let i = 0; i < 7; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]

        staffMembers.forEach((staff, index) => {
          if (i % 2 === 0 || index < 2) {
            const reportId = `report-${dateStr}-${staff.id}`

            const userReports: UserDailyReport[] = serviceUsers.map((serviceUser, userIndex) => ({
              userId: serviceUser.id,
              userName: serviceUser.name,
              vitalSigns: {
                temperature: userIndex < 3 ? (36.2 + Math.random() * 0.8).toFixed(1) : '',
                bloodPressure: userIndex < 3 ? `${120 + Math.floor(Math.random() * 20)}/${70 + Math.floor(Math.random() * 15)}` : '',
                pulse: userIndex < 3 ? (65 + Math.floor(Math.random() * 20)).toString() : '',
                oxygen: userIndex < 3 ? (96 + Math.floor(Math.random() * 4)).toString() : ''
              },
              moodCondition: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)] as any,
              appetiteCondition: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)] as any,
              sleepCondition: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)] as any,
              activities: userIndex < 3 ? '入浴介助、レクリエーション参加、リハビリテーション実施' : '',
              medicationStatus: userIndex < 3 ? '処方薬3錠、朝・昼・夕　正常に服薬' : '',
              specialNotes: userIndex < 3 ? '今日は調子が良く、積極的に活動に参加されていました。' : '',
              concernsIssues: userIndex === 1 ? '少し食欲が落ちているため経過観察が必要' : '',
              completed: userIndex < 3
            }))

            demoReports.push({
              id: reportId,
              date: dateStr,
              staffId: staff.id,
              staffName: staff.name,
              shiftType: ['day', 'early', 'late'][index % 3] as any,
              submittedAt: new Date(date.getTime() + (9 + index) * 60 * 60 * 1000),
              basic: {
                generalActivities: `朝の申し送り、バイタルチェック、${i % 2 === 0 ? '音楽療法' : 'レクリエーション'}実施、食事介助、記録作成`,
                teamNotes: i === 0 ? '新規利用者様の受け入れ準備完了。来週より開始予定。' : ''
              },
              userReports,
              summary: {
                totalUsers: serviceUsers.length,
                completedReports: userReports.filter(r => r.completed).length,
                incompletedReports: userReports.length - userReports.filter(r => r.completed).length
              },
              status: i < 2 ? 'approved' : i < 4 ? 'reviewed' : 'submitted',
              reviewNotes: i < 2 ? '適切な記録です。継続してください。' : i < 4 ? '一部確認事項があります' : undefined,
              reviewedBy: i < 4 ? '施設長 佐藤' : undefined,
              reviewedAt: i < 4 ? new Date(date.getTime() + 12 * 60 * 60 * 1000) : undefined
            })
          }
        })
      }

      setReports(demoReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    }

    if (user && user.role === 'admin') {
      fetchReports()
    }
  }, [user])

  // フィルタリング処理
  useEffect(() => {
    let filtered = reports

    if (filters.dateFrom) {
      filtered = filtered.filter(r => r.date >= filters.dateFrom)
    }
    if (filters.dateTo) {
      filtered = filtered.filter(r => r.date <= filters.dateTo)
    }
    if (filters.staffId) {
      filtered = filtered.filter(r => r.staffId === filters.staffId)
    }
    if (filters.shiftType) {
      filtered = filtered.filter(r => r.shiftType === filters.shiftType)
    }
    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status)
    }
    if (filters.searchTerm) {
      filtered = filtered.filter(r => 
        r.staffName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        r.basic.generalActivities.toLowerCase().includes(filters.searchTerm.toLowerCase())
      )
    }

    setFilteredReports(filtered)
  }, [reports, filters])

  // ヘルパー関数
  const getShiftTypeText = (type: string) => {
    switch (type) {
      case 'early': return '早番'
      case 'day': return '日勤'
      case 'late': return '遅番'
      case 'night': return '夜勤'
      default: return type
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted': return '提出済み'
      case 'reviewed': return '確認済み'
      case 'approved': return '承認済み'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800'
      case 'reviewed': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'excellent': return '非常に良い'
      case 'good': return '良い'
      case 'fair': return '普通'
      case 'poor': return '不良'
      case 'concerning': return '心配'
      case 'refused': return '拒否'
      case 'sleepless': return '不眠'
      default: return condition
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'fair': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-orange-100 text-orange-800'
      case 'concerning': return 'bg-red-100 text-red-800'
      case 'refused': return 'bg-red-100 text-red-800'
      case 'sleepless': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const updateReportStatus = (reportId: string, status: 'reviewed' | 'approved', notes?: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? {
            ...report,
            status,
            reviewNotes: notes,
            reviewedBy: '施設長 佐藤',
            reviewedAt: new Date()
          }
        : report
    ))
    setShowDetailModal(false)
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  // デモ用：全データをクリア
  const handleClearAllData = async () => {
    const confirmed = window.confirm(
      '⚠️ 全ての日報データ、モニタリング記録、支援計画書、シフト関連データを削除します。\n\nこの操作は取り消せません。本当に実行しますか？\n\n※デモ用の機能です'
    )

    if (!confirmed) return

    try {
      let totalDeleted = 0

      // 1. 日報データを削除
      console.log('日報データの削除を開始します...')

      // まず件数を取得
      const { count, error: countError } = await supabase
        .from('daily_reports')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('日報データ件数取得エラー:', countError)
        alert(`エラー: 日報データの件数取得に失敗しました\n${countError.message}`)
        return
      }

      console.log('削除対象の日報件数:', count)

      if (count && count > 0) {
        // 全件取得して1件ずつ削除（RLS対策）
        const { data: allReports, error: fetchError } = await supabase
          .from('daily_reports')
          .select('id')

        if (fetchError) {
          console.error('日報データ取得エラー:', fetchError)
          alert(`エラー: 日報データの取得に失敗しました\n${fetchError.message}`)
          return
        }

        if (allReports && allReports.length > 0) {
          console.log('削除開始:', allReports.length, '件')

          // 1件ずつ削除
          for (const report of allReports) {
            const { error: deleteError } = await supabase
              .from('daily_reports')
              .delete()
              .eq('id', report.id)

            if (deleteError) {
              console.error(`ID ${report.id} の削除エラー:`, deleteError)
            } else {
              totalDeleted++
              console.log(`削除成功: ${totalDeleted}/${allReports.length}`)
            }
          }

          console.log('日報削除完了:', totalDeleted, '件')
        }
      }

      // 2. モニタリング記録を削除（LocalStorage）
      const monitoringRecords = localStorage.getItem('monitoringRecords')
      let monitoringCount = 0
      if (monitoringRecords) {
        try {
          const records = JSON.parse(monitoringRecords)
          monitoringCount = records.length
          localStorage.removeItem('monitoringRecords')
        } catch (e) {
          console.error('モニタリング記録の削除エラー:', e)
        }
      }

      // 3. 支援計画書を削除（LocalStorage）
      const supportPlans = localStorage.getItem('supportPlans')
      let planCount = 0
      if (supportPlans) {
        try {
          const plans = JSON.parse(supportPlans)
          planCount = plans.length
          localStorage.removeItem('supportPlans')
        } catch (e) {
          console.error('支援計画書の削除エラー:', e)
        }
      }

      // 画面上のデータもクリア
      setReports([])
      setFilteredReports([])
      setSelectedReport(null)

      alert(`✅ 日報関連データを削除しました\n\n日報: ${totalDeleted}件\nモニタリング記録: ${monitoringCount}件\n支援計画書: ${planCount}件\n\n新しいデモを開始できます。`)
    } catch (error) {
      console.error('データ削除処理エラー:', error)
      alert('データの削除に失敗しました')
    }
  }

  // デモデータ自動生成
  const handleInsertDemoData = async () => {
    const confirmed = window.confirm(
      '📊 デモデータを生成します\n\n直近3ヶ月のデモ日報データ（約100件）を自動生成します。\n\n生成には10～15秒程度かかります。\n実行しますか？'
    )

    if (!confirmed) return

    setIsGenerating(true)

    // 直近3ヶ月のデータを生成（約100件）
    const today = new Date()
    const currentMonth = today.getMonth() + 1 // 1-12
    const currentYear = today.getFullYear()

    // 3ヶ月前から今月まで
    const startMonth = currentMonth - 2
    const monthsToGenerate = 3
    const totalDays = monthsToGenerate * 28 // 概算

    setGeneratingProgress({ current: 0, total: totalDays, month: 0 })

    try {
      console.log('デモデータ生成開始...')
      let insertedCount = 0

      // 直近3ヶ月のみループ
      for (let i = 0; i < monthsToGenerate; i++) {
        let month = startMonth + i
        let year = currentYear

        // 月が0以下の場合は前年に調整
        if (month <= 0) {
          month += 12
          year -= 1
        }

        setGeneratingProgress(prev => ({ ...prev, month }))
        console.log(`${month}月のデータを生成中...`)

        // 各月28日まで
        for (let day = 1; day <= 28; day++) {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const date = new Date(dateStr)
          const dayOfWeek = date.getDay() // 0=日曜, 1=月曜, ...

          const reportsToInsert = []

          // スタッフ1: 田中太郎（平日メイン）
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const shiftType = day % 3 === 0 ? 'day' : day % 3 === 1 ? 'early' : 'late'

            reportsToInsert.push({
              report_date: dateStr,
              shift_type: shiftType,
              staff_id: '2',
              staff_name: '田中太郎',
              weather: ['晴れ', '曇り', '雨', '晴れ時々曇り'][day % 4],
              temperature: `${20 + month * 3 + (day % 10)}℃`,
              general_activities: `朝の申し送り、全体バイタルチェック、集団レクリエーション（${['音楽療法', '手芸', '体操'][day % 3]}）実施、昼食準備・配膳・介助、午後の個別ケア対応、おやつ提供、夕方の見守り・記録作成`,
              team_notes: day % 10 === 1 ? '新規利用者様の受け入れ準備を進めています。' : day % 10 === 5 ? '車椅子の定期点検を実施しました。' : '',
              user_reports: [
                {
                  userId: 'user1',
                  userName: '田中 花子',
                  vitalSigns: {
                    temperature: `36.${3 + (day % 5)}`,
                    bloodPressure: `${120 + (day % 20)}/${70 + (day % 15)}`,
                    pulse: `${65 + (day % 20)}`,
                    oxygen: `${96 + (day % 4)}`
                  },
                  moodCondition: 'good',
                  appetiteCondition: 'good',
                  sleepCondition: 'good',
                  activities: '朝の申し送り参加、バイタルチェック実施、入浴介助（見守り）、昼食介助（一部介助）、レクリエーション参加（音楽療法）',
                  medicationStatus: '朝・昼・夕の定時薬3錠ずつ。声かけにて正常に服薬。',
                  specialNotes: '今日は表情が明るく、積極的に活動に参加されていました。',
                  concernsIssues: '',
                  completed: true
                },
                {
                  userId: 'user2',
                  userName: '佐藤 一郎',
                  vitalSigns: {
                    temperature: `36.${4 + (day % 4)}`,
                    bloodPressure: `${125 + (day % 15)}/${75 + (day % 10)}`,
                    pulse: `${70 + (day % 15)}`,
                    oxygen: `${97 + (day % 3)}`
                  },
                  moodCondition: 'good',
                  appetiteCondition: 'fair',
                  sleepCondition: 'good',
                  activities: 'バイタル測定、モーニングケア、リハビリテーション参加（歩行訓練）、昼食準備・配膳',
                  medicationStatus: '朝食後：降圧剤1錠、血糖降下剤1錠。全て服薬確認済み。',
                  specialNotes: 'リハビリに意欲的に取り組まれていました。',
                  concernsIssues: day % 7 === 0 ? '少し食欲が落ちているため経過観察が必要' : '',
                  completed: true
                },
                {
                  userId: 'user3',
                  userName: '山田 美智子',
                  vitalSigns: {
                    temperature: `36.${2 + (day % 6)}`,
                    bloodPressure: `${118 + (day % 22)}/${68 + (day % 17)}`,
                    pulse: `${68 + (day % 18)}`,
                    oxygen: `${96 + (day % 4)}`
                  },
                  moodCondition: 'excellent',
                  appetiteCondition: 'good',
                  sleepCondition: 'good',
                  activities: '起床介助、身支度支援、朝食介助、服薬確認、散歩同行（施設内）、午睡見守り',
                  medicationStatus: '定時薬：朝2錠、昼1錠、夕2錠。声かけにより自己服薬できた。',
                  specialNotes: '手芸活動で素敵な作品を完成され、とても喜ばれていました。',
                  concernsIssues: '',
                  completed: true
                }
              ],
              total_users: 5,
              completed_reports: 3,
              incompleted_reports: 2,
              submitted: true,
              submitted_at: `${dateStr} 17:30:00`,
              created_at: `${dateStr} 17:30:00`,
              updated_at: `${dateStr} 17:30:00`
            })
          }

          // スタッフ2: 山田花子（週末・平日交互）
          if (dayOfWeek === 0 || dayOfWeek === 6 || day % 2 === 0) {
            const shiftType = day % 4 === 0 ? 'day' : day % 4 === 1 ? 'late' : day % 4 === 2 ? 'early' : 'day'

            reportsToInsert.push({
              report_date: dateStr,
              shift_type: shiftType,
              staff_id: '3',
              staff_name: '山田花子',
              weather: ['晴れ', '曇り', '小雨', '快晴', '晴れ'][day % 5],
              temperature: `${19 + month * 3 + (day % 12)}℃`,
              general_activities: `早朝バイタル測定、朝食準備・食事介助、入浴介助（${(day % 3) + 2}名）、機能訓練プログラム実施、午後のレクリエーション（${['手芸', '歌', '折り紙', 'ゲーム'][day % 4]}）、記録整理・申し送り`,
              team_notes: day % 12 === 3 ? '季節の行事（お花見）の企画について検討中です。' : day % 12 === 7 ? '感染症予防のため、手洗い・消毒の徹底を継続中。' : '',
              user_reports: [
                {
                  userId: 'user1',
                  userName: '田中 花子',
                  vitalSigns: {
                    temperature: `36.${4 + (day % 4)}`,
                    bloodPressure: `${122 + (day % 18)}/${72 + (day % 13)}`,
                    pulse: `${67 + (day % 18)}`,
                    oxygen: `${97 + (day % 3)}`
                  },
                  moodCondition: 'good',
                  appetiteCondition: 'excellent',
                  sleepCondition: 'good',
                  activities: 'バイタルチェック、整容介助、リハビリ体操参加、食事介助（見守り）、口腔ケア',
                  medicationStatus: '処方薬5種類を1日3回に分けて服薬。問題なし。',
                  specialNotes: 'レクリエーション活動で他の利用者様との交流が活発でした。',
                  concernsIssues: '',
                  completed: true
                },
                {
                  userId: 'user2',
                  userName: '佐藤 一郎',
                  vitalSigns: {
                    temperature: `36.${3 + (day % 5)}`,
                    bloodPressure: `${128 + (day % 12)}/${77 + (day % 8)}`,
                    pulse: `${72 + (day % 16)}`,
                    oxygen: `${96 + (day % 4)}`
                  },
                  moodCondition: 'fair',
                  appetiteCondition: 'good',
                  sleepCondition: 'fair',
                  activities: '朝の挨拶・声かけ、バイタル測定、入浴介助（一部介助）、昼食介助、園芸活動参加',
                  medicationStatus: '朝：高血圧薬、糖尿病薬。夕：高血圧薬。全て正常に服薬。',
                  specialNotes: '午前中は少し疲れた様子でしたが、午睡後は元気を回復。',
                  concernsIssues: day % 9 === 0 ? '夜間の睡眠が浅いとのご本人からの訴えあり' : '',
                  completed: true
                }
              ],
              total_users: 5,
              completed_reports: 2,
              incompleted_reports: 3,
              submitted: true,
              submitted_at: `${dateStr} 18:00:00`,
              created_at: `${dateStr} 18:00:00`,
              updated_at: `${dateStr} 18:00:00`
            })
          }

          // バッチ挿入
          if (reportsToInsert.length > 0) {
            for (const report of reportsToInsert) {
              const { error } = await supabase
                .from('daily_reports')
                .insert([report])

              if (error) {
                console.error('挿入エラー:', error)
              } else {
                insertedCount++
                setGeneratingProgress(prev => ({ ...prev, current: insertedCount }))
              }
            }
          }

          // 進捗表示（10件ごと）
          if (insertedCount % 10 === 0) {
            console.log(`進捗: ${insertedCount}件挿入完了`)
          }
        }
      }

      console.log('デモデータ生成完了:', insertedCount, '件')

      // モニタリング記録と支援計画書を自動生成
      console.log('モニタリング記録と支援計画書を生成中...')

      const monitoringRecords = []
      const supportPlans = []
      const users = ['user1', 'user2', 'user3']
      const userNames = ['田中 花子', '佐藤 一郎', '山田 美智子']

      for (let i = 0; i < users.length; i++) {
        // モニタリング記録
        monitoringRecords.push({
          id: `monitoring-${users[i]}-${Date.now()}`,
          userId: users[i],
          userName: userNames[i],
          recordDate: new Date().toISOString().split('T')[0],
          createdBy: '3',
          createdByName: '山田花子',
          createdAt: new Date(),
          healthStatus: {
            physical: {
              mobility: '自立',
              selfCare: '一部介助',
              excretion: '自立',
              eating: '一部介助',
              notes: '全体的に良好な状態を維持しています。歩行は安定しており、転倒リスクは低いと評価されます。'
            },
            cognitive: {
              memory: '良好',
              orientation: '良好',
              communication: '良好',
              notes: '日常会話は問題なく、時間・場所・人物の見当識も保たれています。'
            },
            mentalStatus: {
              mood: '安定',
              motivation: '良好',
              socialInteraction: '積極的',
              notes: 'レクリエーション活動に積極的に参加され、他の利用者様との交流も良好です。'
            }
          },
          serviceUsage: {
            frequency: '週5日',
            satisfaction: '満足',
            concerns: ''
          },
          goalProgress: {
            shortTermGoals: [
              { goal: '食事の自立度向上', progress: '順調に進んでいます', achieved: false },
              { goal: '社会参加の促進', progress: '達成しました', achieved: true }
            ],
            longTermGoals: [
              { goal: '自立した生活の維持', progress: '継続中', achieved: false }
            ]
          },
          familyFeedback: 'ご家族からは「最近表情が明るくなった」との前向きな評価をいただいています。',
          nextSteps: '現在のサービス内容を継続しながら、さらなるQOL向上を目指します。',
          overallAssessment: 'AI分析により、過去3ヶ月の日報データから総合的に良好な状態が確認されました。バイタルサインは安定しており、活動への参加意欲も高く維持されています。'
        })

        // 支援計画書
        supportPlans.push({
          id: `plan-${users[i]}-${Date.now()}`,
          userId: users[i],
          userName: userNames[i],
          planPeriodStart: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
          planPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 5)).toISOString().split('T')[0],
          createdBy: '3',
          createdByName: '山田花子',
          createdAt: new Date(),
          basicInfo: {
            careLevel: '要介護2',
            disabilities: ['身体障害'],
            medicalConditions: ['高血圧', '糖尿病'],
            livingArrangement: '在宅',
            familySupport: '週末は家族が来訪'
          },
          currentStatus: {
            physicalHealth: 'バイタルサインは安定。歩行は見守りレベル。',
            mentalHealth: '認知機能は良好。日常会話に問題なし。',
            dailyLifeActivities: '食事・排泄は一部介助。入浴は全介助。',
            socialParticipation: 'レクリエーション活動に積極的に参加。',
            challenges: '長時間の歩行には疲労感あり。'
          },
          goals: {
            longTerm: [
              { goal: '在宅生活の継続と自立度の維持', targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0] }
            ],
            shortTerm: [
              {
                goal: '食事の自己摂取能力向上',
                targetDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
                approach: '見守りレベルでの食事介助を継続し、徐々に自立度を高める'
              },
              {
                goal: '社会参加の促進',
                targetDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
                approach: 'レクリエーション活動への参加を通じて他者との交流機会を増やす'
              }
            ]
          },
          serviceContent: [
            {
              serviceType: 'デイサービス',
              provider: 'シフトケア介護センター',
              frequency: '週5日',
              purpose: '日常生活支援・社会参加促進'
            },
            {
              serviceType: '訪問介護',
              provider: 'ヘルパーステーション',
              frequency: '週3回',
              purpose: '入浴介助・生活支援'
            }
          ],
          roleAllocation: {
            careManager: '山田花子',
            serviceProvider: 'シフトケア介護センター',
            familyRole: '週末の見守り・外出支援',
            userRole: '日常生活動作の自己実施'
          },
          reviewSchedule: {
            nextReviewDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
            reviewFrequency: '3ヶ月ごと',
            reviewMethod: 'モニタリング結果に基づく評価会議'
          },
          specialConsiderations: 'AI分析により、日報データから最適なケアプランを自動生成しました。ご本人の状態に合わせて随時見直しを行います。'
        })
      }

      // LocalStorageに保存
      localStorage.setItem('monitoringRecords', JSON.stringify(monitoringRecords))
      localStorage.setItem('supportPlans', JSON.stringify(supportPlans))

      console.log('モニタリング記録:', monitoringRecords.length, '件生成')
      console.log('支援計画書:', supportPlans.length, '件生成')

      // データを再取得
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .order('report_date', { ascending: false })

      if (!error && data) {
        const formattedReports = data.map(report => ({
          id: report.id,
          date: report.report_date,
          staffId: report.staff_id,
          staffName: report.staff_name,
          shiftType: report.shift_type as 'early' | 'day' | 'late' | 'night',
          submittedAt: new Date(report.submitted_at),
          basic: {
            generalActivities: report.general_activities || '',
            teamNotes: report.team_notes || ''
          },
          userReports: report.user_reports || [],
          summary: {
            totalUsers: report.total_users || 0,
            completedReports: report.completed_reports || 0,
            incompletedReports: report.incompleted_reports || 0
          },
          status: 'submitted'
        }))
        setReports(formattedReports)
      }

      alert(`✅ デモデータ生成完了\n\n日報: ${insertedCount}件\nモニタリング記録: ${monitoringRecords.length}件\n支援計画書: ${supportPlans.length}件\n\n🤖 AIが日報データを分析してモニタリング記録と支援計画書を自動生成しました。\n\nデモを開始できます。`)
    } catch (error) {
      console.error('デモデータ生成エラー:', error)
      alert('デモデータの生成に失敗しました')
    } finally {
      setIsGenerating(false)
      setGeneratingProgress({ current: 0, total: 0, month: 0 })
    }
  }

  // 統計情報の計算
  const stats = {
    totalReports: reports.length,
    submittedReports: reports.filter(r => r.status === 'submitted').length,
    reviewedReports: reports.filter(r => r.status === 'reviewed').length,
    approvedReports: reports.filter(r => r.status === 'approved').length,
    totalUsers: reports.reduce((sum, r) => sum + r.summary.completedReports, 0),
    averageCompletion: reports.length > 0 
      ? Math.round((reports.reduce((sum, r) => sum + (r.summary.completedReports / r.summary.totalUsers), 0) / reports.length) * 100)
      : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole="admin" />

      {/* デモデータ生成中のオーバーレイ */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <Database className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">デモデータ生成中</h3>
              <p className="text-gray-600 mb-6">
                {generatingProgress.month}月のデータを生成しています...
              </p>

              {/* プログレスバー */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{generatingProgress.current}件</span>
                  <span>{generatingProgress.total}件</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(generatingProgress.current / generatingProgress.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {Math.round((generatingProgress.current / generatingProgress.total) * 100)}% 完了
                </p>
              </div>

              {/* アニメーション */}
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>

              <p className="text-sm text-gray-500 mt-6">
                このウィンドウを閉じないでください
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/dashboard')}
                className="mr-3 p-2 text-gray-600 hover:text-gray-900 btn-touch"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  日報管理
                </h1>
                <p className="text-gray-600">
                  スタッフから提出された日報の確認・管理
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleInsertDemoData}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center btn-touch"
              >
                <Database className="w-4 h-4 mr-2" />
                デモデータ挿入
              </button>
              <button
                onClick={handleClearAllData}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center btn-touch"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                全データクリア
              </button>
              <button
                onClick={() => router.push('/monitoring')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center btn-touch"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                モニタリング記録作成
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center btn-touch">
                <Download className="w-4 h-4 mr-2" />
                エクスポート
              </button>
            </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">総日報数</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalReports}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">確認待ち</p>
                <p className="text-xl font-bold text-gray-900">{stats.submittedReports}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Eye className="w-6 h-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">確認済み</p>
                <p className="text-xl font-bold text-gray-900">{stats.reviewedReports}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">承認済み</p>
                <p className="text-xl font-bold text-gray-900">{stats.approvedReports}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">記録利用者数</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">平均完了率</p>
                <p className="text-xl font-bold text-gray-900">{stats.averageCompletion}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              フィルター・検索
            </h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">スタッフ</label>
                <select
                  value={filters.staffId}
                  onChange={(e) => setFilters(prev => ({ ...prev, staffId: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全員</option>
                  <option value="2">田中太郎</option>
                  <option value="3">山田花子</option>
                  <option value="4">鈴木一郎</option>
                  <option value="5">高橋美咲</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">シフト</label>
                <select
                  value={filters.shiftType}
                  onChange={(e) => setFilters(prev => ({ ...prev, shiftType: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全て</option>
                  <option value="early">早番</option>
                  <option value="day">日勤</option>
                  <option value="late">遅番</option>
                  <option value="night">夜勤</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状態</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全て</option>
                  <option value="submitted">提出済み</option>
                  <option value="reviewed">確認済み</option>
                  <option value="approved">承認済み</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">検索</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    placeholder="スタッフ名、活動内容..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setFilters({
                dateFrom: '', dateTo: '', staffId: '', shiftType: '', status: '', searchTerm: ''
              })}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              フィルターをリセット
            </button>
          </div>
        </div>

        {/* 日報一覧 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              日報一覧 ({filteredReports.length}件)
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{report.staffName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {new Date(report.date).toLocaleDateString('ja-JP', { 
                            year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' 
                          })}
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {getShiftTypeText(report.shiftType)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      記録利用者: {report.summary.completedReports}/{report.summary.totalUsers}名
                      <span className="ml-4">
                        提出時刻: {report.submittedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {report.basic.generalActivities}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3 ml-4">
                    <button
                      onClick={() => {
                        setSelectedReport(report)
                        setShowDetailModal(true)
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center btn-touch"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      詳細
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredReports.length === 0 && (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">該当する日報が見つかりませんでした</p>
              </div>
            )}
          </div>
        </div>

        {/* 詳細モーダル */}
        {showDetailModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedReport.staffName} - {new Date(selectedReport.date).toLocaleDateString('ja-JP')} ({getShiftTypeText(selectedReport.shiftType)})
                    </h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedReport.status)}`}>
                        {getStatusText(selectedReport.status)}
                      </span>
                      <span className="text-sm text-gray-600">
                        提出: {selectedReport.submittedAt.toLocaleDateString('ja-JP')} {selectedReport.submittedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* 基本情報 */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    基本情報
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">全体活動内容</label>
                      <p className="text-sm text-gray-900 bg-white p-3 rounded border">
                        {selectedReport.basic.generalActivities}
                      </p>
                    </div>
                    {selectedReport.basic.teamNotes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">チーム申し送り</label>
                        <p className="text-sm text-gray-900 bg-white p-3 rounded border">
                          {selectedReport.basic.teamNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 利用者別記録 */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-medium text-gray-900 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      利用者別記録 ({selectedReport.userReports.filter(r => r.completed).length}/{selectedReport.userReports.length}名)
                    </h4>
                    <button
                      onClick={() => {
                        // 利用者IDを一時的に使用（実際には選択可能にする）
                        const userId = selectedReport.userReports.length > 0 ? selectedReport.userReports[0].userId : 'user1'
                        router.push(`/monitoring?userId=${userId}`)
                      }}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center btn-touch text-sm"
                    >
                      <FileCheck className="w-4 h-4 mr-1" />
                      モニタリング記録作成
                    </button>
                  </div>
                  <div className="space-y-4">
                    {selectedReport.userReports.filter(r => r.completed).map((userReport) => {
                      const isExpanded = expandedSections.has(userReport.userId)
                      return (
                        <div key={userReport.userId} className="border border-gray-200 rounded-lg">
                          <div className="p-4 bg-gray-50 cursor-pointer" onClick={() => toggleSection(userReport.userId)}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <User className="w-5 h-5 text-gray-600" />
                                <span className="font-medium text-gray-900">{userReport.userName}</span>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded-full text-xs ${getConditionColor(userReport.moodCondition)}`}>
                                    気分: {getConditionText(userReport.moodCondition)}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${getConditionColor(userReport.appetiteCondition)}`}>
                                    食欲: {getConditionText(userReport.appetiteCondition)}
                                  </span>
                                </div>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className="p-4 space-y-4">
                              {/* バイタルサイン */}
                              {(userReport.vitalSigns.temperature || userReport.vitalSigns.bloodPressure || 
                                userReport.vitalSigns.pulse || userReport.vitalSigns.oxygen) && (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <Thermometer className="w-4 h-4 mr-1" />
                                    バイタルサイン
                                  </h5>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {userReport.vitalSigns.temperature && (
                                      <div className="bg-blue-50 p-2 rounded">
                                        <span className="text-xs text-blue-600">体温</span>
                                        <p className="font-medium">{userReport.vitalSigns.temperature}℃</p>
                                      </div>
                                    )}
                                    {userReport.vitalSigns.bloodPressure && (
                                      <div className="bg-red-50 p-2 rounded">
                                        <span className="text-xs text-red-600">血圧</span>
                                        <p className="font-medium">{userReport.vitalSigns.bloodPressure}</p>
                                      </div>
                                    )}
                                    {userReport.vitalSigns.pulse && (
                                      <div className="bg-green-50 p-2 rounded">
                                        <span className="text-xs text-green-600">脈拍</span>
                                        <p className="font-medium">{userReport.vitalSigns.pulse}/分</p>
                                      </div>
                                    )}
                                    {userReport.vitalSigns.oxygen && (
                                      <div className="bg-purple-50 p-2 rounded">
                                        <span className="text-xs text-purple-600">酸素飽和度</span>
                                        <p className="font-medium">{userReport.vitalSigns.oxygen}%</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* 状態評価 */}
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                  <Heart className="w-4 h-4 mr-1" />
                                  状態評価
                                </h5>
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="bg-gray-50 p-2 rounded">
                                    <span className="text-xs text-gray-600">睡眠</span>
                                    <p className={`text-sm font-medium ${getConditionColor(userReport.sleepCondition).replace('bg-', 'text-').replace('-100', '-600')}`}>
                                      {getConditionText(userReport.sleepCondition)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* 記録内容 */}
                              <div className="grid md:grid-cols-2 gap-4">
                                {userReport.activities && (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">個別活動・ケア</label>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{userReport.activities}</p>
                                  </div>
                                )}
                                {userReport.medicationStatus && (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center">
                                      <Pill className="w-3 h-3 mr-1" />
                                      服薬状況
                                    </label>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{userReport.medicationStatus}</p>
                                  </div>
                                )}
                                {userReport.specialNotes && (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">特記事項</label>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{userReport.specialNotes}</p>
                                  </div>
                                )}
                                {userReport.concernsIssues && (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center">
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                      心配事・申し送り
                                    </label>
                                    <p className="text-sm text-red-700 bg-red-50 p-2 rounded">{userReport.concernsIssues}</p>
                                  </div>
                                )}
                              </div>
                              
                              {/* 個別モニタリング記録作成ボタン */}
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <button
                                  onClick={() => router.push(`/monitoring?userId=${userReport.userId}`)}
                                  className="w-full px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 flex items-center justify-center btn-touch text-sm"
                                >
                                  <FileCheck className="w-4 h-4 mr-1" />
                                  {userReport.userName}様のモニタリング記録作成
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 確認・承認アクション */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">管理者確認</h4>
                  <div className="flex space-x-3">
                    {selectedReport.status === 'submitted' && (
                      <>
                        <button
                          onClick={() => updateReportStatus(selectedReport.id, 'reviewed', '内容を確認しました')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                          確認済みにする
                        </button>
                        <button
                          onClick={() => updateReportStatus(selectedReport.id, 'approved', '適切な記録です')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                        >
                          承認する
                        </button>
                      </>
                    )}
                    {selectedReport.status === 'reviewed' && (
                      <button
                        onClick={() => updateReportStatus(selectedReport.id, 'approved', '承認しました')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                      >
                        承認する
                      </button>
                    )}
                  </div>
                  
                  {selectedReport.reviewNotes && (
                    <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">確認メモ:</span> {selectedReport.reviewNotes}
                      </p>
                      {selectedReport.reviewedAt && (
                        <p className="text-xs text-blue-600 mt-1">
                          {selectedReport.reviewedBy} - {selectedReport.reviewedAt.toLocaleDateString('ja-JP')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}