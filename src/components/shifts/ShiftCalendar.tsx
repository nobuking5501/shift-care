'use client'

import { useState, useRef, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns'
import { ja } from 'date-fns/locale'
import { demoUsers, demoShifts } from '@/lib/demo-data'
import { validateShift, hasAdminPermission, canEditShift, canDeleteShift } from '@/lib/shift-validation'
import { assignmentAreas, demoAssignments, getDailyAssignmentSummary } from '@/lib/assignment-data'
import { getStaffNameById, STAFF_DATA } from '@/lib/staff-data'
import { useGeneratedShifts } from '@/lib/hooks/useGeneratedShifts'
import type { StaffAssignment } from '@/types/assignment'
import { Edit, Trash2, Plus, Users, Clock, CheckCircle, AlertTriangle, Info, MapPin, Home, Activity, Clipboard, X } from 'lucide-react'

interface ShiftEvent {
  id: string
  title: string
  date: string
  backgroundColor: string
  borderColor: string
  extendedProps: {
    staffId: string
    staffName: string
    shiftType: string
    startTime: string
    endTime: string
    isConfirmed: boolean
  }
}

interface ShiftCalendarProps {
  isAdmin?: boolean
  userId?: string
  userRole?: string
  targetMonth: string
}

export default function ShiftCalendar({ isAdmin = false, userId, userRole = 'staff', targetMonth }: ShiftCalendarProps) {
  const calendarRef = useRef<any>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedShift, setSelectedShift] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'add' | 'edit'>('view')
  const [validationErrors, setValidationErrors] = useState<any[]>([])
  const [assignments, setAssignments] = useState<StaffAssignment[]>(demoAssignments)
  const [calendarKey, setCalendarKey] = useState(0) // カレンダー強制リレンダー用
  const [formData, setFormData] = useState({
    staffId: '',
    shiftType: 'day',
    startTime: '09:00',
    endTime: '18:00',
    areaId: 'area-1'
  })

  // Use Supabase hook for real-time shift data with provided targetMonth
  const { shifts: supabaseShifts, loading: supabaseLoading, error: supabaseError, forceRefresh } = useGeneratedShifts(targetMonth)

  // State definition before useEffect
  const [shifts, setShifts] = useState<ShiftEvent[]>([])

  // 🚨 カレンダー診断ログ（問題特定用）
  useEffect(() => {
    console.log('🚨 ===== カレンダー診断レポート =====', {
      現在時刻: new Date().toLocaleString('ja-JP'),
      Props: {
        targetMonth,
        userId,
        userRole,
        isAdmin
      },
      Supabaseデータ: {
        シフト数: supabaseShifts?.length || 0,
        読込中: supabaseLoading,
        エラー: supabaseError || 'なし',
        サンプルデータ: supabaseShifts?.[0] || 'なし'
      },
      カレンダー状態: {
        表示シフト数: shifts.length,
        カレンダーキー: calendarKey,
        最終更新: new Date().toLocaleTimeString()
      }
    })
  }, [supabaseShifts, supabaseLoading, supabaseError, targetMonth, shifts.length, calendarKey])

  // Helper functions defined first
  const getShiftTypeColor = (shiftType: string) => {
    switch (shiftType) {
      case 'early': return { bg: '#3b82f6', border: '#2563eb' }
      case 'day': return { bg: '#10b981', border: '#059669' }
      case 'late': return { bg: '#f59e0b', border: '#d97706' }
      case 'night': return { bg: '#8b5cf6', border: '#7c3aed' }
      default: return { bg: '#6b7280', border: '#4b5563' }
    }
  }

  const getShiftTypeName = (shiftType: string) => {
    switch (shiftType) {
      case 'early': return '早番'
      case 'day': return '日勤'
      case 'late': return '遅番'
      case 'night': return '夜勤'
      default: return '未定'
    }
  }

  // Convert shift data to calendar events (Supabase ONLY)
  const convertShiftsToEvents = (): ShiftEvent[] => {
    // Use ONLY Supabase data for consistent cross-page data
    let shiftsToUse
    if (supabaseShifts && supabaseShifts.length > 0) {
      // Use Supabase data (ONLY SOURCE)
      shiftsToUse = supabaseShifts.map(supabase => ({
        id: supabase.shift_id,
        userId: supabase.user_id,
        staffName: supabase.staff_name,
        date: supabase.date,
        shiftType: supabase.shift_type,
        startTime: supabase.start_time,
        endTime: supabase.end_time,
        isConfirmed: supabase.is_confirmed
      }))

      console.log('✓ Supabaseデータをカレンダー形式に変換:', {
        targetMonth,
        originalCount: supabaseShifts.length,
        convertedCount: shiftsToUse.length,
        sampleData: shiftsToUse[0]
      })
    } else {
      // 自動生成前はデモデータをフォールバック表示
      shiftsToUse = demoShifts
      console.log('⚠️ Supabaseデータなし - デモデータを表示:', {
        targetMonth,
        demoShiftsCount: demoShifts.length,
        supabaseLoading
      })
    }

    const finalEvents = shiftsToUse
      .map(shift => {
        // 共通スタッフデータを使用してスタッフ名を解決
        let staffName = 'staffName' in shift ? shift.staffName : undefined
        if (!staffName) {
          // userIdまたはuser_idから共通スタッフデータで検索
          const userId = 'userId' in shift ? shift.userId : ('user_id' in shift ? shift.user_id : undefined)
          staffName = userId ? getStaffNameById(userId) : '未割り当て'
          // フォールバック: 古いデモデータとの互換性のため
          if (staffName === '不明なスタッフ') {
            const user = demoUsers.find(u => u.id === userId)
            staffName = user?.name || '未割り当て'
          }
        }

        const shiftType = 'shiftType' in shift ? shift.shiftType : shift.shift_type || ''
        const colors = getShiftTypeColor(shiftType)
        const shiftUserId = 'userId' in shift ? shift.userId : ('user_id' in shift ? shift.user_id : '')
        const shiftId = 'id' in shift ? shift.id : ('shift_id' in shift ? shift.shift_id : '')
        const shiftDate = shift.date
        const shiftStartTime = 'startTime' in shift ? shift.startTime : ('start_time' in shift ? shift.start_time : '')
        const shiftEndTime = 'endTime' in shift ? shift.endTime : ('end_time' in shift ? shift.end_time : '')
        const isConfirmed = 'isConfirmed' in shift ? shift.isConfirmed : ('is_confirmed' in shift ? shift.is_confirmed : false)

        // For staff view, only show their own shifts
        if (!isAdmin && userId && shiftUserId !== userId && shiftUserId !== '3') {
          // Show Yamada Hanako's shifts (userId '3') for demo purposes
          console.log('🚫 スタッフフィルタで除外:', {
            shiftUserId,
            currentUserId: userId,
            isAdmin,
            staffName
          })
          return null
        }

        // console.log('✅ シフト表示承認:', {
        //   shiftId,
        //   staffName,
        //   date: shiftDate,
        //   shiftType,
        //   userId: shiftUserId,
        //   isAdmin,
        //   currentUserId: userId
        // })

        return {
          id: shiftId,
          title: `${staffName} (${getShiftTypeName(shiftType)})`,
          date: shiftDate,
          backgroundColor: colors.bg,
          borderColor: colors.border,
          extendedProps: {
            staffId: shiftUserId,
            staffName: staffName,
            shiftType: shiftType,
            startTime: shiftStartTime,
            endTime: shiftEndTime,
            isConfirmed: isConfirmed
          }
        }
      })
      .filter((event): event is ShiftEvent => event !== null)

    console.log('📅 カレンダーイベント生成完了:', {
      targetMonth,
      totalEvents: finalEvents.length,
      eventDates: finalEvents.map(e => e.date).slice(0, 5) // 最初の5日分の日付を表示
    })

    return finalEvents
  }

  // Update shifts when Supabase data changes (メインデータソース)
  useEffect(() => {
    // 無限ループ防止: loadingが完了してからのみ実行
    if (supabaseLoading) {
      console.log('🔄 Supabase読み込み中 - カレンダー更新待機')
      return
    }

    const newShifts = convertShiftsToEvents()

    console.log('🎯 カレンダー連動チェック:', {
      targetMonth,
      currentShiftsCount: shifts.length,
      newShiftsCount: newShifts.length,
      shouldUpdate: shifts.length !== newShifts.length
    })

    // シフト数が変わった場合は即座に更新（データ内容の詳細比較を避けて高速化）
    if (shifts.length !== newShifts.length || shifts.length === 0) {
      console.log('✅ カレンダー更新実行:', {
        reason: shifts.length !== newShifts.length ? '件数変更' : '初期化',
        calendarKey: calendarKey + 1
      })
      setShifts(newShifts)
      setCalendarKey(prev => prev + 1)
    }
  }, [supabaseShifts, supabaseLoading, targetMonth]) // userId, isAdminを削除して安定化

  // 🎯 強制リフレッシュ関数（外部から呼び出し可能）
  const forceCalendarRefresh = () => {
    console.log('🔄 カレンダー強制リフレッシュ実行')
    const newShifts = convertShiftsToEvents()
    setShifts(newShifts)
    setCalendarKey(prev => prev + 1)
  }

  // LocalStorage通知による外部更新検出
  useEffect(() => {
    const handleStorageRefresh = (e: StorageEvent) => {
      if (e.key === 'shiftGenerationCompleted') {
        const notification = JSON.parse(e.newValue || '{}')
        if (notification.targetMonth === targetMonth) {
          console.log('🔄 カレンダー: 外部更新通知を受信')
          setTimeout(() => forceCalendarRefresh(), 500)
        }
      }
    }

    window.addEventListener('storage', handleStorageRefresh)
    return () => window.removeEventListener('storage', handleStorageRefresh)
  }, [targetMonth])

  const handleDateClick = (arg: any) => {
    if (isAdmin) {
      setSelectedDate(arg.dateStr)
      setShowAssignmentModal(true)
    }
  }

  const handleEventClick = (arg: any) => {
    const shiftData = arg.event.extendedProps
    setSelectedShift({
      id: arg.event.id,
      date: arg.event.startStr,
      ...shiftData
    })
    
    if (isAdmin) {
      setModalMode('edit')
      setFormData({
        staffId: shiftData.staffId,
        shiftType: shiftData.shiftType,
        startTime: shiftData.startTime,
        endTime: shiftData.endTime,
        areaId: shiftData.areaId || 'area-1'
      })
    } else {
      setModalMode('view')
    }
    setShowModal(true)
  }

  const handleEventDrop = (arg: any) => {
    if (isAdmin) {
      // Update shift date
      const updatedShifts = shifts.map(shift => 
        shift.id === arg.event.id 
          ? { ...shift, date: arg.event.startStr }
          : shift
      )
      setShifts(updatedShifts)
      
      // Show success message
      alert(`シフトを${format(new Date(arg.event.startStr), 'MM月dd日', { locale: ja })}に移動しました`)
    }
  }

  const validateAndSaveShift = () => {
    // バリデーション実行
    const validation = validateShift(
      formData.staffId,
      selectedDate || (selectedShift?.date),
      formData.startTime,
      formData.endTime,
      formData.shiftType,
      shifts,
      modalMode === 'edit' ? selectedShift?.id : undefined
    )

    setValidationErrors(validation.rules)

    // エラーがある場合は保存しない
    if (!validation.isValid) {
      return
    }

    // 警告がある場合は確認
    const warnings = validation.rules.filter(rule => rule.type === 'warning')
    if (warnings.length > 0) {
      const warningMessages = warnings.map(w => w.message).join('\n')
      if (!window.confirm(`以下の警告があります:\n\n${warningMessages}\n\n続行しますか？`)) {
        return
      }
    }

    handleSaveShift()
  }

  const handleSaveShift = () => {
    if (modalMode === 'add') {
      // 権限チェック
      if (!hasAdminPermission(userRole)) {
        alert('シフト追加は管理者のみ可能です')
        return
      }

      // Add new assignment
      const staffList = [
        { id: '1', name: '施設長 田中', position: '施設長' },
        { id: '2', name: '佐藤太郎', position: '介護福祉士' },
        { id: '3', name: '山田花子（ケアマネジャー）', position: 'ケアマネジャー' },
        { id: '4', name: '高橋美咲', position: '介護福祉士' },
        { id: '5', name: '加藤大輔', position: '介護福祉士' }
      ]
      const user = staffList.find(s => s.id === formData.staffId)
      const area = assignmentAreas.find(a => a.id === formData.areaId)
      const newAssignment = {
        id: `assign-${Date.now()}`,
        staffId: formData.staffId,
        areaId: formData.areaId,
        date: selectedDate!,
        shiftType: formData.shiftType as 'early' | 'day' | 'late' | 'night',
        startTime: formData.startTime,
        endTime: formData.endTime,
        isLeader: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setAssignments([...assignments, newAssignment])

      // Also add to calendar view
      const colors = getShiftTypeColor(formData.shiftType)
      const newShift = {
        id: `shift-${Date.now()}`,
        title: `${user?.name} (${area?.name})`,
        date: selectedDate!,
        backgroundColor: area?.color || colors.bg,
        borderColor: area?.color || colors.border,
        extendedProps: {
          staffId: formData.staffId,
          staffName: user?.name || '',
          shiftType: formData.shiftType,
          startTime: formData.startTime,
          endTime: formData.endTime,
          areaId: formData.areaId,
          areaName: area?.name,
          isConfirmed: true
        }
      }
      setShifts([...shifts, newShift])
      alert(`${area?.name}にスタッフを配置しました`)
    } else if (modalMode === 'edit') {
      // 権限チェック
      if (!canEditShift(userRole, userId || '', selectedShift?.staffId)) {
        alert('このシフトを編集する権限がありません')
        return
      }

      // Update existing shift
      const staffList = [
        { id: '1', name: '施設長 田中', position: '施設長' },
        { id: '2', name: '佐藤太郎', position: '介護福祉士' },
        { id: '3', name: '山田花子（ケアマネジャー）', position: 'ケアマネジャー' },
        { id: '4', name: '高橋美咲', position: '介護福祉士' },
        { id: '5', name: '加藤大輔', position: '介護福祉士' }
      ]
      const user = staffList.find(s => s.id === formData.staffId)
      const area = assignmentAreas.find(a => a.id === formData.areaId)
      const colors = getShiftTypeColor(formData.shiftType)
      const updatedShifts = shifts.map(shift => 
        shift.id === selectedShift.id 
          ? {
              ...shift,
              title: `${user?.name} (${area?.name})`,
              backgroundColor: area?.color || colors.bg,
              borderColor: area?.color || colors.border,
              extendedProps: {
                ...shift.extendedProps,
                staffId: formData.staffId,
                staffName: user?.name || '',
                shiftType: formData.shiftType,
                startTime: formData.startTime,
                endTime: formData.endTime,
                areaId: formData.areaId,
                areaName: area?.name
              }
            }
          : shift
      )
      setShifts(updatedShifts)
      alert('配置を更新しました')
    }
    
    setValidationErrors([])
    setShowModal(false)
  }

  const handleDeleteShift = () => {
    // 権限チェック
    if (!canDeleteShift(userRole, userId || '', selectedShift?.staffId)) {
      alert('シフト削除は管理者のみ可能です')
      return
    }

    if (selectedShift && window.confirm('このシフトを削除しますか？')) {
      const updatedShifts = shifts.filter(shift => shift.id !== selectedShift.id)
      setShifts(updatedShifts)
      setShowModal(false)
      alert('シフトを削除しました')
    }
  }

  const getShiftTimeRange = (shiftType: string, customStart?: string, customEnd?: string) => {
    if (customStart && customEnd) {
      return `${customStart} - ${customEnd}`
    }
    
    switch (shiftType) {
      case 'early': return '07:00 - 16:00'
      case 'day': return '09:00 - 18:00'
      case 'late': return '12:00 - 21:00'
      case 'night': return '21:00 - 07:00'
      default: return '09:00 - 18:00'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            シフトカレンダー
          </h2>
          <div className="flex items-center space-x-4">
            {/* Shift Type Legend */}
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>早番</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>日勤</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-amber-500 rounded"></div>
                <span>遅番</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>夜勤</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <FullCalendar
          key={`calendar-${calendarKey}-${targetMonth}`}
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          initialDate={`${targetMonth}-01`}
          locale="ja"
          events={shifts}
          editable={isAdmin}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
          }}
          buttonText={{
            today: '今日',
            month: '月',
            week: '週',
            day: '日'
          }}
          height="auto"
          eventDisplay="block"
          displayEventTime={false}
          eventClassNames="cursor-pointer"
          eventDidMount={(info) => {
            // 🎯 イベントが正常にマウントされたことを確認
            console.log('イベントマウント:', {
              eventId: info.event.id,
              eventTitle: info.event.title,
              eventDate: info.event.startStr
            })
          }}
        />
      </div>

      {/* Assignment Area Modal */}
      {showAssignmentModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {format(new Date(selectedDate), 'yyyy年MM月dd日', { locale: ja })} の職員配置
              </h3>
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Daily Summary */}
            {(() => {
              const summary = getDailyAssignmentSummary(selectedDate, assignments)
              return (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">総配置人数</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600 mt-1">{summary.totalStaff}名</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-900">未配置シフト</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-600 mt-1">{summary.uncoveredShifts}件</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Info className="w-5 h-5 text-red-600" />
                        <span className="font-medium text-red-900">アラート</span>
                      </div>
                      <p className="text-2xl font-bold text-red-600 mt-1">{summary.alerts.length}件</p>
                    </div>
                  </div>

                  {/* Alerts */}
                  {summary.alerts.length > 0 && (
                    <div className="space-y-2 mb-6">
                      {summary.alerts.map((alert, index) => {
                        const area = assignmentAreas.find(a => a.id === alert.areaId)
                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                              alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                              'bg-blue-50 border-blue-200'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className={`w-4 h-4 ${
                                alert.severity === 'high' ? 'text-red-600' :
                                alert.severity === 'medium' ? 'text-yellow-600' :
                                'text-blue-600'
                              }`} />
                              <span className="text-sm font-medium">{area?.name}</span>
                              <span className="text-sm text-gray-600">{alert.message}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Area Assignments */}
            <div className="grid gap-6">
              {assignmentAreas.map(area => {
                const areaAssignments = assignments.filter(a => a.date === selectedDate && a.areaId === area.id)
                const IconComponent = area.icon === 'home' ? Home : area.icon === 'activity' ? Activity : Clipboard
                
                return (
                  <div key={area.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: area.color + '20' }}
                        >
                          <IconComponent className="w-5 h-5" style={{ color: area.color }} />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{area.name}</h4>
                          <p className="text-sm text-gray-600">{area.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setFormData({ ...formData, areaId: area.id })
                          setModalMode('add')
                          setShowModal(true)
                          setShowAssignmentModal(false)
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>配置追加</span>
                      </button>
                    </div>

                    {/* Shift Types Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {['early', 'day', 'late', 'night'].map(shiftType => {
                        const shiftAssignments = areaAssignments.filter(a => a.shiftType === shiftType)
                        const required = area.requiredStaff[shiftType as keyof typeof area.requiredStaff]
                        const assigned = shiftAssignments.length
                        
                        return (
                          <div key={shiftType} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                {getShiftTypeName(shiftType)}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                assigned >= required 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {assigned}/{required}
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              {shiftAssignments.map(assignment => {
                                const staffList = [
                                  { id: '1', name: '施設長 田中' },
                                  { id: '2', name: '佐藤太郎' },
                                  { id: '3', name: '山田花子（ケアマネジャー）' },
                                  { id: '4', name: '高橋美咲' },
                                  { id: '5', name: '加藤大輔' }
                                ]
                                const staff = staffList.find(s => s.id === assignment.staffId)
                                return (
                                  <div 
                                    key={assignment.id}
                                    className="flex items-center justify-between p-2 bg-white rounded border"
                                  >
                                    <div className="flex items-center space-x-2">
                                      {assignment.isLeader && (
                                        <span className="w-2 h-2 bg-yellow-400 rounded-full" title="リーダー"></span>
                                      )}
                                      <span className="text-xs font-medium">{staff?.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <button
                                        onClick={() => {
                                          // Edit assignment logic
                                        }}
                                        className="p-1 text-gray-400 hover:text-blue-600"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setAssignments(assignments.filter(a => a.id !== assignment.id))
                                        }}
                                        className="p-1 text-gray-400 hover:text-red-600"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                )
                              })}
                              
                              {assigned < required && (
                                <div className="p-2 border-2 border-dashed border-gray-300 rounded text-center">
                                  <span className="text-xs text-gray-500">
                                    {required - assigned}名不足
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Admin/Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === 'add' && selectedDate ? 
                  `${format(new Date(selectedDate), 'yyyy年MM月dd日', { locale: ja })} のシフト追加` :
                  modalMode === 'edit' && selectedShift ?
                  `${format(new Date(selectedShift.date), 'yyyy年MM月dd日', { locale: ja })} のシフト編集` :
                  modalMode === 'view' && selectedShift ?
                  `${format(new Date(selectedShift.date), 'yyyy年MM月dd日', { locale: ja })} のシフト詳細` :
                  'シフト管理'
                }
              </h3>
              {modalMode === 'edit' && isAdmin && (
                <button
                  onClick={handleDeleteShift}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="シフト削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {modalMode === 'view' ? (
              /* View Mode - Staff and Admin */
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">{selectedShift?.staffName}</span>
                    </div>
                    {selectedShift?.isConfirmed && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">確定</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{getShiftTypeName(selectedShift?.shiftType)}</span>
                    <span>•</span>
                    <span>{getShiftTimeRange(selectedShift?.shiftType, selectedShift?.startTime, selectedShift?.endTime)}</span>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    閉じる
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setModalMode('edit')}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>編集</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Add/Edit Mode - Admin Only */
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveShift(); }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    スタッフ *
                  </label>
                  <select 
                    value={formData.staffId}
                    onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">スタッフを選択してください</option>
                    {STAFF_DATA.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} ({staff.role === 'admin' ? '施設長' : staff.qualifications[0] || '職員'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    配置エリア *
                  </label>
                  <select 
                    value={formData.areaId}
                    onChange={(e) => setFormData({...formData, areaId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {assignmentAreas.map(area => (
                      <option key={area.id} value={area.id}>
                        {area.name} - {area.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    シフト種別 *
                  </label>
                  <select 
                    value={formData.shiftType}
                    onChange={(e) => {
                      const shiftType = e.target.value
                      const timeRange = getShiftTimeRange(shiftType)
                      const [start, end] = timeRange.split(' - ')
                      setFormData({
                        ...formData, 
                        shiftType,
                        startTime: start,
                        endTime: end
                      })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="early">早番 (07:00-16:00)</option>
                    <option value="day">日勤 (09:00-18:00)</option>
                    <option value="late">遅番 (12:00-21:00)</option>
                    <option value="night">夜勤 (21:00-07:00)</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      開始時間 *
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      終了時間 *
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* バリデーションエラー・警告表示 */}
                {validationErrors.length > 0 && (
                  <div className="space-y-2">
                    {validationErrors.map((error, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg flex items-start space-x-2 ${
                          error.type === 'error' 
                            ? 'bg-red-50 border border-red-200' 
                            : 'bg-yellow-50 border border-yellow-200'
                        }`}
                      >
                        {error.type === 'error' ? (
                          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${
                          error.type === 'error' ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                          {error.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setValidationErrors([])
                      if (modalMode === 'edit') {
                        setModalMode('view')
                      } else {
                        setShowModal(false)
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={validateAndSaveShift}
                    disabled={!formData.staffId}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{modalMode === 'add' ? '追加' : '更新'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}