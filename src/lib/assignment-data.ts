/**
 * 職員配置エリアのデモデータと管理機能
 */

import { AssignmentArea, StaffAssignment, DailyAssignmentSummary } from '@/types/assignment'

// 障害者施設の標準的な3つの配置エリア
export const assignmentAreas: AssignmentArea[] = [
  {
    id: 'area-1',
    name: '生活支援エリア',
    description: '日常生活支援、食事介助、入浴介助など',
    requiredStaff: {
      early: 2,
      day: 3,
      late: 2,
      night: 1
    },
    color: '#3B82F6', // Blue
    icon: 'home',
    maxCapacity: 5,
    priority: 1
  },
  {
    id: 'area-2',
    name: '活動支援エリア',
    description: 'レクリエーション、作業訓練、外出支援など',
    requiredStaff: {
      early: 1,
      day: 2,
      late: 1,
      night: 0
    },
    color: '#10B981', // Green
    icon: 'activity',
    maxCapacity: 3,
    priority: 2
  },
  {
    id: 'area-3',
    name: '管理・相談エリア',
    description: '事務作業、相談支援、家族対応など',
    requiredStaff: {
      early: 1,
      day: 2,
      late: 1,
      night: 0
    },
    color: '#F59E0B', // Orange
    icon: 'clipboard',
    maxCapacity: 3,
    priority: 3
  }
]

// デモ配置データ（2025年6月1-3日）
export const demoAssignments: StaffAssignment[] = [
  // ===== 2025-06-01 完全配置パターン =====
  
  // 生活支援エリア - 早番（2名必要）
  {
    id: 'assign-1',
    staffId: '2', // 田中太郎
    areaId: 'area-1',
    date: '2025-06-01',
    shiftType: 'early',
    startTime: '07:00',
    endTime: '16:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-2',
    staffId: '4', // 鈴木一郎
    areaId: 'area-1',
    date: '2025-06-01',
    shiftType: 'early',
    startTime: '07:00',
    endTime: '16:00',
    isLeader: false,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // 生活支援エリア - 日勤（3名必要）
  {
    id: 'assign-3',
    staffId: '3', // 山田花子
    areaId: 'area-1',
    date: '2025-06-01',
    shiftType: 'day',
    startTime: '09:00',
    endTime: '18:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-4',
    staffId: '5', // 高橋美咲
    areaId: 'area-1',
    date: '2025-06-01',
    shiftType: 'day',
    startTime: '09:00',
    endTime: '18:00',
    isLeader: false,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-5',
    staffId: '12', // 松本真理（パート）
    areaId: 'area-1',
    date: '2025-06-01',
    shiftType: 'day',
    startTime: '10:00',
    endTime: '15:00',
    isLeader: false,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // 生活支援エリア - 遅番（2名必要）
  {
    id: 'assign-6',
    staffId: '6', // 伊藤健太
    areaId: 'area-1',
    date: '2025-06-01',
    shiftType: 'late',
    startTime: '12:00',
    endTime: '21:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-7',
    staffId: '9', // 小林さくら
    areaId: 'area-1',
    date: '2025-06-01',
    shiftType: 'late',
    startTime: '12:00',
    endTime: '21:00',
    isLeader: false,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // 生活支援エリア - 夜勤（1名必要）
  {
    id: 'assign-8',
    staffId: '8', // 中村雄介
    areaId: 'area-1',
    date: '2025-06-01',
    shiftType: 'night',
    startTime: '21:00',
    endTime: '07:00',
    isLeader: true,
    notes: '生活支援メイン、他エリア見回り兼務',
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // 活動支援エリア - 早番（1名必要）
  {
    id: 'assign-9',
    staffId: '10', // 加藤大輔
    areaId: 'area-2',
    date: '2025-06-01',
    shiftType: 'early',
    startTime: '07:00',
    endTime: '16:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // 活動支援エリア - 日勤（2名必要）
  {
    id: 'assign-10',
    staffId: '11', // 吉田優子
    areaId: 'area-2',
    date: '2025-06-01',
    shiftType: 'day',
    startTime: '09:00',
    endTime: '18:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-11',
    staffId: '13', // 森田浩二（パート）
    areaId: 'area-2',
    date: '2025-06-01',
    shiftType: 'day',
    startTime: '13:00',
    endTime: '17:00',
    isLeader: false,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // 活動支援エリア - 遅番（1名必要）
  {
    id: 'assign-12',
    staffId: '14', // 清水由美（アルバイト）
    areaId: 'area-2',
    date: '2025-06-01',
    shiftType: 'late',
    startTime: '15:00',
    endTime: '19:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // 管理・相談エリア - 早番（1名必要）
  {
    id: 'assign-13',
    staffId: '7', // 渡辺麻衣
    areaId: 'area-3',
    date: '2025-06-01',
    shiftType: 'early',
    startTime: '08:00',
    endTime: '17:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // 管理・相談エリア - 日勤（2名必要）
  {
    id: 'assign-14',
    staffId: '1', // 施設長 佐藤
    areaId: 'area-3',
    date: '2025-06-01',
    shiftType: 'day',
    startTime: '09:00',
    endTime: '17:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-15',
    staffId: '15', // 橋本学（パート）
    areaId: 'area-3',
    date: '2025-06-01',
    shiftType: 'day',
    startTime: '10:00',
    endTime: '16:00',
    isLeader: false,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // 管理・相談エリア - 遅番（1名必要）
  {
    id: 'assign-16',
    staffId: '16', // 西村香織（アルバイト）
    areaId: 'area-3',
    date: '2025-06-01',
    shiftType: 'late',
    startTime: '14:00',
    endTime: '18:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // ===== 2025-06-02 部分的不足パターン =====
  
  // 生活支援エリア - 早番（2名必要だが1名のみ）
  {
    id: 'assign-17',
    staffId: '3', // 山田花子
    areaId: 'area-1',
    date: '2025-06-02',
    shiftType: 'early',
    startTime: '07:00',
    endTime: '16:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // 生活支援エリア - 日勤（3名必要だが2名のみ）
  {
    id: 'assign-18',
    staffId: '4', // 鈴木一郎
    areaId: 'area-1',
    date: '2025-06-02',
    shiftType: 'day',
    startTime: '09:00',
    endTime: '18:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-19',
    staffId: '12', // 松本真理（パート）
    areaId: 'area-1',
    date: '2025-06-02',
    shiftType: 'day',
    startTime: '10:00',
    endTime: '15:00',
    isLeader: false,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // 生活支援エリア - 遅番（2名必要だが1名のみ）
  {
    id: 'assign-20',
    staffId: '6', // 伊藤健太
    areaId: 'area-1',
    date: '2025-06-02',
    shiftType: 'late',
    startTime: '12:00',
    endTime: '21:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // 生活支援エリア - 夜勤（適正）
  {
    id: 'assign-21',
    staffId: '2', // 田中太郎
    areaId: 'area-1',
    date: '2025-06-02',
    shiftType: 'night',
    startTime: '21:00',
    endTime: '07:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // 活動支援エリア - 日勤のみ配置（早番・遅番不足）
  {
    id: 'assign-22',
    staffId: '11', // 吉田優子
    areaId: 'area-2',
    date: '2025-06-02',
    shiftType: 'day',
    startTime: '09:00',
    endTime: '18:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // 管理・相談エリア - 日勤のみ（早番・遅番不足）
  {
    id: 'assign-23',
    staffId: '1', // 施設長 佐藤
    areaId: 'area-3',
    date: '2025-06-02',
    shiftType: 'day',
    startTime: '09:00',
    endTime: '17:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-24',
    staffId: '7', // 渡辺麻衣
    areaId: 'area-3',
    date: '2025-06-02',
    shiftType: 'day',
    startTime: '10:00',
    endTime: '18:00',
    isLeader: false,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // ===== 2025-06-03 バランス型配置 =====
  
  // 生活支援エリア - 完全配置
  {
    id: 'assign-25',
    staffId: '5', // 高橋美咲
    areaId: 'area-1',
    date: '2025-06-03',
    shiftType: 'early',
    startTime: '07:00',
    endTime: '16:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-26',
    staffId: '8', // 中村雄介
    areaId: 'area-1',
    date: '2025-06-03',
    shiftType: 'early',
    startTime: '07:00',
    endTime: '16:00',
    isLeader: false,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-27',
    staffId: '2', // 田中太郎
    areaId: 'area-1',
    date: '2025-06-03',
    shiftType: 'day',
    startTime: '09:00',
    endTime: '18:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-28',
    staffId: '3', // 山田花子
    areaId: 'area-1',
    date: '2025-06-03',
    shiftType: 'day',
    startTime: '09:00',
    endTime: '18:00',
    isLeader: false,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-29',
    staffId: '13', // 森田浩二（パート）
    areaId: 'area-1',
    date: '2025-06-03',
    shiftType: 'day',
    startTime: '13:00',
    endTime: '17:00',
    isLeader: false,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-30',
    staffId: '4', // 鈴木一郎
    areaId: 'area-1',
    date: '2025-06-03',
    shiftType: 'late',
    startTime: '12:00',
    endTime: '21:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-31',
    staffId: '6', // 伊藤健太
    areaId: 'area-1',
    date: '2025-06-03',
    shiftType: 'late',
    startTime: '12:00',
    endTime: '21:00',
    isLeader: false,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-32',
    staffId: '10', // 加藤大輔
    areaId: 'area-1',
    date: '2025-06-03',
    shiftType: 'night',
    startTime: '21:00',
    endTime: '07:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // 活動支援・管理エリアも適切に配置
  {
    id: 'assign-33',
    staffId: '9', // 小林さくら
    areaId: 'area-2',
    date: '2025-06-03',
    shiftType: 'early',
    startTime: '07:00',
    endTime: '16:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-34',
    staffId: '11', // 吉田優子
    areaId: 'area-2',
    date: '2025-06-03',
    shiftType: 'day',
    startTime: '09:00',
    endTime: '18:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-35',
    staffId: '14', // 清水由美（アルバイト）
    areaId: 'area-2',
    date: '2025-06-03',
    shiftType: 'day',
    startTime: '10:00',
    endTime: '14:00',
    isLeader: false,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-36',
    staffId: '12', // 松本真理（パート）
    areaId: 'area-2',
    date: '2025-06-03',
    shiftType: 'late',
    startTime: '15:00',
    endTime: '19:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // 管理・相談エリア
  {
    id: 'assign-37',
    staffId: '7', // 渡辺麻衣
    areaId: 'area-3',
    date: '2025-06-03',
    shiftType: 'early',
    startTime: '08:00',
    endTime: '17:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-38',
    staffId: '1', // 施設長 佐藤
    areaId: 'area-3',
    date: '2025-06-03',
    shiftType: 'day',
    startTime: '09:00',
    endTime: '17:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-39',
    staffId: '15', // 橋本学（パート）
    areaId: 'area-3',
    date: '2025-06-03',
    shiftType: 'day',
    startTime: '10:00',
    endTime: '16:00',
    isLeader: false,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 'assign-40',
    staffId: '16', // 西村香織（アルバイト）
    areaId: 'area-3',
    date: '2025-06-03',
    shiftType: 'late',
    startTime: '14:00',
    endTime: '18:00',
    isLeader: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  }
]

/**
 * 指定日の配置サマリーを取得
 */
export function getDailyAssignmentSummary(date: string, assignments: StaffAssignment[] = demoAssignments): DailyAssignmentSummary {
  const dayAssignments = assignments.filter(a => a.date === date)
  const summary: DailyAssignmentSummary = {
    date,
    areas: {},
    totalStaff: 0,
    uncoveredShifts: 0,
    alerts: []
  }

  // エリア別集計
  assignmentAreas.forEach(area => {
    const areaAssignments = dayAssignments.filter(a => a.areaId === area.id)
    
    summary.areas[area.id] = {
      shifts: {
        early: areaAssignments.filter(a => a.shiftType === 'early'),
        day: areaAssignments.filter(a => a.shiftType === 'day'),
        late: areaAssignments.filter(a => a.shiftType === 'late'),
        night: areaAssignments.filter(a => a.shiftType === 'night')
      },
      totalStaff: areaAssignments.length,
      requiredStaff: Object.values(area.requiredStaff).reduce((sum, req) => sum + req, 0),
      coverage: 0
    }

    // カバー率計算
    let totalRequired = 0
    let totalAssigned = 0
    Object.entries(area.requiredStaff).forEach(([shiftType, required]) => {
      const assigned = summary.areas[area.id].shifts[shiftType].length
      totalRequired += required
      totalAssigned += Math.min(assigned, required)
      
      // 不足アラート
      if (assigned < required) {
        summary.alerts.push({
          type: 'understaffed',
          areaId: area.id,
          shiftType,
          message: `${area.name}の${getShiftTypeName(shiftType)}が${required - assigned}名不足`,
          severity: required - assigned > 1 ? 'high' : 'medium'
        })
        summary.uncoveredShifts += (required - assigned)
      }
      
      // 過剰配置アラート
      if (assigned > area.maxCapacity) {
        summary.alerts.push({
          type: 'overstaffed',
          areaId: area.id,
          shiftType,
          message: `${area.name}の${getShiftTypeName(shiftType)}が定員超過`,
          severity: 'low'
        })
      }
      
      // リーダー不在アラート
      if (required > 0 && assigned > 0) {
        const hasLeader = summary.areas[area.id].shifts[shiftType].some(a => a.isLeader)
        if (!hasLeader) {
          summary.alerts.push({
            type: 'no_leader',
            areaId: area.id,
            shiftType,
            message: `${area.name}の${getShiftTypeName(shiftType)}にリーダーが不在`,
            severity: 'medium'
          })
        }
      }
    })
    
    summary.areas[area.id].coverage = totalRequired > 0 ? (totalAssigned / totalRequired) * 100 : 100
  })

  summary.totalStaff = dayAssignments.length
  
  return summary
}

/**
 * シフト種別の日本語名取得
 */
function getShiftTypeName(shiftType: string): string {
  switch (shiftType) {
    case 'early': return '早番'
    case 'day': return '日勤'
    case 'late': return '遅番'
    case 'night': return '夜勤'
    default: return shiftType
  }
}

/**
 * エリア間でのスタッフ移動
 */
export function moveStaffToArea(
  assignmentId: string, 
  newAreaId: string, 
  assignments: StaffAssignment[]
): StaffAssignment[] {
  return assignments.map(assignment => 
    assignment.id === assignmentId 
      ? { ...assignment, areaId: newAreaId, updatedAt: new Date() }
      : assignment
  )
}

/**
 * 新しい配置の追加
 */
export function addStaffAssignment(
  staffId: string,
  areaId: string,
  date: string,
  shiftType: 'early' | 'day' | 'late' | 'night',
  startTime: string,
  endTime: string,
  isLeader: boolean = false
): StaffAssignment {
  return {
    id: `assign-${Date.now()}`,
    staffId,
    areaId,
    date,
    shiftType,
    startTime,
    endTime,
    isLeader,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

/**
 * 配置エリアの色とアイコン取得
 */
export function getAreaColorAndIcon(areaId: string) {
  const area = assignmentAreas.find(a => a.id === areaId)
  return {
    color: area?.color || '#6B7280',
    icon: area?.icon || 'map-pin'
  }
}

/**
 * エリア別必要人数チェック
 */
export function validateAreaStaffing(areaId: string, shiftType: string, currentCount: number): {
  isValid: boolean
  message?: string
  severity?: 'info' | 'warning' | 'error'
} {
  const area = assignmentAreas.find(a => a.id === areaId)
  if (!area) return { isValid: true }
  
  const required = area.requiredStaff[shiftType as keyof typeof area.requiredStaff]
  
  if (currentCount < required) {
    return {
      isValid: false,
      message: `${area.name}の${getShiftTypeName(shiftType)}は${required}名必要です（現在${currentCount}名）`,
      severity: 'error'
    }
  }
  
  if (currentCount > area.maxCapacity) {
    return {
      isValid: false,
      message: `${area.name}の定員は${area.maxCapacity}名です`,
      severity: 'warning'
    }
  }
  
  if (currentCount === required) {
    return {
      isValid: true,
      message: `${area.name}の配置は適正です`,
      severity: 'info'
    }
  }
  
  return { isValid: true }
}