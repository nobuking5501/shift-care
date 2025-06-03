'use client'

import { useState, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns'
import { ja } from 'date-fns/locale'
import { demoUsers, demoShifts } from '@/lib/demo-data'
import { validateShift, hasAdminPermission, canEditShift, canDeleteShift } from '@/lib/shift-validation'
import { assignmentAreas, demoAssignments, getDailyAssignmentSummary } from '@/lib/assignment-data'
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
  }
}

interface ShiftCalendarProps {
  isAdmin?: boolean
  userId?: string
  userRole?: string
}

export default function ShiftCalendar({ isAdmin = false, userId, userRole = 'staff' }: ShiftCalendarProps) {
  const calendarRef = useRef<any>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedShift, setSelectedShift] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'add' | 'edit'>('view')
  const [validationErrors, setValidationErrors] = useState<any[]>([])
  const [assignments, setAssignments] = useState<StaffAssignment[]>(demoAssignments)
  const [formData, setFormData] = useState({
    staffId: '',
    shiftType: 'day',
    startTime: '09:00',
    endTime: '18:00',
    areaId: 'area-1'
  })

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

  // Convert demo data to calendar events
  const convertShiftsToEvents = () => {
    return demoShifts.map(shift => {
      const user = demoUsers.find(u => u.id === shift.userId)
      const colors = getShiftTypeColor(shift.shiftType)
      
      return {
        id: shift.id,
        title: `${user?.name} (${getShiftTypeName(shift.shiftType)})`,
        date: shift.date,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        extendedProps: {
          staffId: shift.userId,
          staffName: user?.name || '',
          shiftType: shift.shiftType,
          startTime: shift.startTime,
          endTime: shift.endTime,
          isConfirmed: shift.isConfirmed
        }
      }
    })
  }

  const [shifts, setShifts] = useState<ShiftEvent[]>(convertShiftsToEvents())

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
      const user = demoUsers.find(u => u.id === formData.staffId)
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
      const user = demoUsers.find(u => u.id === formData.staffId)
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
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
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
                                const staff = demoUsers.find(u => u.id === assignment.staffId)
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
                    {demoUsers.filter(user => user.role === 'staff').map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.position})
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