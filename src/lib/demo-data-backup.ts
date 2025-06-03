import { User, Shift, DailyReport } from '@/types'

export const demoUsers: User[] = [
  {
    id: '1',
    name: '田中太郎',
    email: 'tanaka@example.com',
    role: 'staff',
    qualifications: ['介護福祉士', '普通自動車免許'],
    nightShiftOK: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: '佐藤花子',
    email: 'sato@example.com',
    role: 'admin',
    qualifications: ['社会福祉士', '介護支援専門員', '普通自動車免許'],
    nightShiftOK: false,
    createdAt: new Date('2023-08-20'),
    updatedAt: new Date('2023-08-20')
  },
  {
    id: '3',
    name: '山田次郎',
    email: 'yamada@example.com',
    role: 'staff',
    qualifications: ['ヘルパー2級', '普通自動車免許'],
    nightShiftOK: true,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10')
  },
  {
    id: '4',
    name: '鈴木美和',
    email: 'suzuki@example.com',
    role: 'staff',
    qualifications: ['介護福祉士', '実務者研修'],
    nightShiftOK: false,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: '5',
    name: '高橋健一',
    email: 'takahashi@example.com',
    role: 'staff',
    qualifications: ['介護初任者研修', '普通自動車免許'],
    nightShiftOK: true,
    createdAt: new Date('2024-04-15'),
    updatedAt: new Date('2024-04-15')
  }
]

export const demoShifts: Shift[] = [
  // 2025-06-01
  {
    id: 's1',
    userId: '1',
    date: '2025-06-01',
    shiftType: 'early',
    startTime: '07:00',
    endTime: '16:00',
    isRequest: false,
    isConfirmed: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 's2',
    userId: '2',
    date: '2025-06-01',
    shiftType: 'day',
    startTime: '09:00',
    endTime: '18:00',
    isRequest: false,
    isConfirmed: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 's3',
    userId: '3',
    date: '2025-06-01',
    shiftType: 'late',
    startTime: '12:00',
    endTime: '21:00',
    isRequest: false,
    isConfirmed: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  // 2025-06-02
  {
    id: 's4',
    userId: '1',
    date: '2025-06-02',
    shiftType: 'night',
    startTime: '21:00',
    endTime: '07:00',
    isRequest: false,
    isConfirmed: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 's5',
    userId: '4',
    date: '2025-06-02',
    shiftType: 'early',
    startTime: '07:00',
    endTime: '16:00',
    isRequest: false,
    isConfirmed: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 's6',
    userId: '5',
    date: '2025-06-02',
    shiftType: 'day',
    startTime: '09:00',
    endTime: '18:00',
    isRequest: false,
    isConfirmed: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  // 2025-06-03
  {
    id: 's7',
    userId: '2',
    date: '2025-06-03',
    shiftType: 'early',
    startTime: '07:00',
    endTime: '16:00',
    isRequest: false,
    isConfirmed: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 's8',
    userId: '3',
    date: '2025-06-03',
    shiftType: 'day',
    startTime: '09:00',
    endTime: '18:00',
    isRequest: false,
    isConfirmed: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 's9',
    userId: '5',
    date: '2025-06-03',
    shiftType: 'late',
    startTime: '12:00',
    endTime: '21:00',
    isRequest: false,
    isConfirmed: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  }
]

export const demoDailyReports: DailyReport[] = [
  {
    id: 'r1',
    userId: '1',
    date: '2025-06-01',
    activities: '朝の支援準備、利用者A様の移動支援、昼食支援、レクリエーション活動の補助を行いました。午後は散歩の付き添いと、工作活動のサポートをしました。',
    notes: '利用者A様の体調が良好で、積極的にレクリエーションに参加されていました。工作では集中して取り組まれていたのが印象的でした。',
    submitted: true,
    submittedAt: new Date('2025-06-01T18:30:00'),
    createdAt: new Date('2025-06-01T18:30:00'),
    updatedAt: new Date('2025-06-01T18:30:00')
  },
  {
    id: 'r2',
    userId: '2',
    date: '2025-06-01',
    activities: '利用者B様の身体介護、薬の管理、家族との連絡調整を行いました。午後は個別支援計画の見直しと、関係機関との調整業務をしました。',
    notes: '利用者B様の血圧が若干高めでした（140/90）。看護師に報告済みです。来週の通院について家族と相談しました。',
    submitted: true,
    submittedAt: new Date('2025-06-01T17:45:00'),
    createdAt: new Date('2025-06-01T17:45:00'),
    updatedAt: new Date('2025-06-01T17:45:00')
  },
  {
    id: 'r3',
    userId: '3',
    date: '2025-06-01',
    activities: '利用者C様の入浴支援、夕食支援、就寝準備を担当しました。また、施設内の清掃と明日の準備作業も行いました。',
    notes: '利用者C様から体調不良の訴えがありましたが、検温では36.5度で正常範囲内でした。念のため夜勤者に申し送りました。',
    submitted: true,
    submittedAt: new Date('2025-06-01T21:15:00'),
    createdAt: new Date('2025-06-01T21:15:00'),
    updatedAt: new Date('2025-06-01T21:15:00')
  },
  {
    id: 'r4',
    userId: '4',
    date: '2025-06-02',
    activities: '朝の健康チェック、朝食支援、服薬管理を行いました。午前中は散歩の付き添い、午後は個別活動の支援をしました。',
    notes: '全利用者の体調は良好です。利用者D様が新しい活動に興味を示されていたので、来週から取り入れてみたいと思います。',
    submitted: true,
    submittedAt: new Date('2025-06-02T16:20:00'),
    createdAt: new Date('2025-06-02T16:20:00'),
    updatedAt: new Date('2025-06-02T16:20:00')
  },
  {
    id: 'r5',
    userId: '5',
    date: '2025-06-02',
    activities: '',
    notes: '',
    submitted: false,
    createdAt: new Date('2025-06-02'),
    updatedAt: new Date('2025-06-02')
  }
]

// Firestore seeding function (for demo purposes)
export const seedDemoData = () => {
  console.log('Demo data ready:', {
    users: demoUsers.length,
    shifts: demoShifts.length,
    reports: demoDailyReports.length
  })
}