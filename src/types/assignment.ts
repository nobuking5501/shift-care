/**
 * 職員配置エリア関連の型定義
 */

export interface AssignmentArea {
  id: string
  name: string
  description: string
  requiredStaff: {
    early: number    // 早番必要人数
    day: number      // 日勤必要人数
    late: number     // 遅番必要人数
    night: number    // 夜勤必要人数
  }
  color: string
  icon: string
  maxCapacity: number
  priority: number
}

export interface StaffAssignment {
  id: string
  staffId: string
  areaId: string
  date: string
  shiftType: 'early' | 'day' | 'late' | 'night'
  startTime: string
  endTime: string
  isLeader: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface DailyAssignmentSummary {
  date: string
  areas: {
    [areaId: string]: {
      shifts: {
        [shiftType: string]: StaffAssignment[]
      }
      totalStaff: number
      requiredStaff: number
      coverage: number // パーセンテージ
    }
  }
  totalStaff: number
  uncoveredShifts: number
  alerts: AssignmentAlert[]
}

export interface AssignmentAlert {
  type: 'understaffed' | 'overstaffed' | 'no_leader' | 'skill_shortage'
  areaId: string
  shiftType: string
  message: string
  severity: 'low' | 'medium' | 'high'
}

export interface AssignmentTemplate {
  id: string
  name: string
  areas: AssignmentArea[]
  defaultAssignments: {
    [areaId: string]: {
      [shiftType: string]: {
        minStaff: number
        maxStaff: number
        requiredQualifications?: string[]
      }
    }
  }
}