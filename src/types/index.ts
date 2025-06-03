export interface User {
  id: string
  name: string
  email: string
  role: 'staff' | 'admin'
  position?: string // 役職・職種
  qualifications: string[]
  nightShiftOK: boolean
  employmentType?: 'fullTime' | 'partTime' // 雇用形態
  weeklyHours?: number // 週間勤務時間
  createdAt: Date
  updatedAt: Date
}

export interface Shift {
  id: string
  userId: string
  date: string // YYYY-MM-DD format
  shiftType: 'early' | 'day' | 'late' | 'night' | 'off'
  startTime?: string
  endTime?: string
  isRequest?: boolean
  isConfirmed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface DailyReport {
  id: string
  userId: string
  date: string // YYYY-MM-DD format
  activities: string
  notes: string
  submitted: boolean
  submittedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ShiftRequest {
  id: string
  userId: string
  requestedDate: string
  requestedShiftType: 'early' | 'day' | 'late' | 'night' | 'off'
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

// シフト希望提出用の型定義
export interface ShiftWish {
  id: string
  userId: string
  targetMonth: string // YYYY-MM format
  wishes: ShiftWishEntry[]
  submittedAt: Date
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  adminResponse?: string
  responseAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ShiftWishEntry {
  date: string // YYYY-MM-DD format
  preferredShift: 'early' | 'day' | 'late' | 'night' | 'off' | 'any'
  priority: 'high' | 'medium' | 'low' // 希望の強さ
  reason?: string // 希望理由（任意）
}

export interface Settings {
  id: string
  shiftRules: {
    maxConsecutiveDays: number
    minRestHours: number
    maxWeeklyHours: number
  }
  reportTemplate: {
    fields: string[]
    requiredFields: string[]
  }
  notifications: {
    reminderHours: number
    enabled: boolean
  }
}

export type ShiftType = 'early' | 'day' | 'late' | 'night' | 'off'
export type UserRole = 'staff' | 'admin'

// 自己評価関連の型定義
export interface EvaluationQuestion {
  id: string
  number: number
  title: string
  description?: string
  category: string
}

export interface EvaluationResponse {
  questionId: string
  score: number // 1-5の評価
  comment: string // 自由記述コメント
}

export interface Evaluation {
  id: string
  createdAt: Date
  updatedAt: Date
  createdBy: string // userId
  year: number // 対象年度（例：2025）
  responses: EvaluationResponse[]
  isCompleted: boolean
  completedAt?: Date
}

// 事故・ヒヤリハット関連の型定義
export interface Incident {
  id: string
  reportedBy: string // 報告者userId
  reportedAt: Date // 報告日時
  incidentDate: Date // 発生日時
  incidentType: 'accident' | 'nearMiss' // 事故 | ヒヤリハット
  location: string // 発生場所
  involvedPersons: string[] // 関係者（利用者名・スタッフ名）
  description: string // 発生状況の詳細
  response: string // 対応・処置の内容
  preventiveMeasures: string // 再発防止策
  status: 'pending' | 'in_progress' | 'completed' // 未対応/対応中/対応済み
  updatedAt: Date
  updatedBy?: string // 最終更新者
}

export type IncidentType = 'accident' | 'nearMiss'
export type IncidentStatus = 'pending' | 'in_progress' | 'completed'

// 苦情・要望関連の型定義
export interface ResponseRecord {
  id: string
  respondedAt: Date
  respondedBy: string // userId
  content: string // 対応内容
}

export interface Complaint {
  id: string
  submittedBy: string // 受付者userId
  submittedAt: Date // 受付日時
  complainantType: 'user' | 'family' | 'other' // 利用者/家族/その他
  complainantName: string // 申し出人氏名（匿名可）
  complaintDate: Date // 発生・受付日
  content: string // 苦情内容
  responseRecords: ResponseRecord[] // 対応履歴
  status: 'pending' | 'in_progress' | 'resolved' // 未対応/対応中/解決済み
  resolvedAt?: Date // 解決日
  updatedAt: Date
}

export type ComplainantType = 'user' | 'family' | 'other'
export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved'

// 防災訓練関連の型定義
export interface Drill {
  id: string
  conductedBy: string // 実施者userId
  conductedAt: Date // 実施日
  drillType: 'fire' | 'earthquake' | 'evacuation' | 'firefighting' | 'other' // 訓練種別
  participantsCount: number // 参加人数
  details: string // 訓練の内容・評価・課題
  improvements: string // 改善策・今後の対応
  createdAt: Date
  updatedAt: Date
}

// 感染症対応関連の型定義
export interface Infection {
  id: string
  reportedBy: string // 報告者userId
  reportedAt: Date // 発生日
  infectionType: 'influenza' | 'covid19' | 'norovirus' | 'other' // 感染症種別
  affectedCount: number // 発症者数
  responseMeasures: string // 対応内容
  outcome: string // 収束状況・教訓
  createdAt: Date
  updatedAt: Date
}

export type DrillType = 'fire' | 'earthquake' | 'evacuation' | 'firefighting' | 'other'
export type InfectionType = 'influenza' | 'covid19' | 'norovirus' | 'other'