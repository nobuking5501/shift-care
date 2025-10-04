// 共通スタッフデータファイル
// すべてのページでこのデータを使用して整合性を保つ

export interface Staff {
  id: string
  name: string
  email: string
  role: 'staff' | 'admin'
  qualifications: string[]
  nightShiftOK: boolean
  phone: string
  joinedDate: string
}

// メインスタッフデータ - すべてのページで共通使用
export const STAFF_DATA: Staff[] = [
  // 管理者
  {
    id: '1',
    name: '施設長 田中',
    email: 'tanaka-admin@facility.com',
    role: 'admin',
    qualifications: ['社会福祉士', '介護支援専門員', '普通自動車免許'],
    nightShiftOK: false,
    phone: '090-1000-0001',
    joinedDate: '2020-04-01'
  },
  // スタッフ
  {
    id: '2',
    name: '佐藤太郎',
    email: 'sato@facility.com',
    role: 'staff',
    qualifications: ['介護福祉士', '普通自動車免許'],
    nightShiftOK: true,
    phone: '090-1111-0001',
    joinedDate: '2022-04-01'
  },
  {
    id: '3',
    name: '山田花子（ケアマネジャー）',
    email: 'yamada@facility.com',
    role: 'staff',
    qualifications: ['介護支援専門員', '社会福祉士', '介護福祉士', '普通自動車免許'],
    nightShiftOK: false,
    phone: '090-1111-0002',
    joinedDate: '2021-10-01'
  },
  {
    id: '4',
    name: '高橋美咲',
    email: 'takahashi@facility.com',
    role: 'staff',
    qualifications: ['介護福祉士', '普通自動車免許'],
    nightShiftOK: false,
    phone: '090-1111-0004',
    joinedDate: '2022-10-01'
  },
  {
    id: '5',
    name: '加藤大輔',
    email: 'kato@facility.com',
    role: 'staff',
    qualifications: ['介護福祉士', '普通自動車免許', '衛生管理者'],
    nightShiftOK: true,
    phone: '090-1111-0009',
    joinedDate: '2020-10-01'
  }
]

// シフト生成用のスタッフリスト（IDと名前のみ）
export const getStaffListForShifts = () => {
  return STAFF_DATA.map(staff => ({
    id: staff.id,
    name: staff.name
  }))
}

// スタッフIDから名前を取得
export const getStaffNameById = (id: string): string => {
  const staff = STAFF_DATA.find(s => s.id === id)
  return staff ? staff.name : '不明なスタッフ'
}

// スタッフ名からIDを取得
export const getStaffIdByName = (name: string): string | null => {
  const staff = STAFF_DATA.find(s => s.name === name)
  return staff ? staff.id : null
}

// アクティブなスタッフのみを取得（roleがstaffのみ）
export const getActiveStaff = () => {
  return STAFF_DATA.filter(staff => staff.role === 'staff')
}

// 夜勤可能なスタッフを取得
export const getNightShiftStaff = () => {
  return STAFF_DATA.filter(staff => staff.role === 'staff' && staff.nightShiftOK)
}