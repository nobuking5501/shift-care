import { User, Shift, DailyReport } from '@/types'

export const demoUsers: User[] = [
  // 管理者（1名）
  {
    id: '1',
    name: '施設長 佐藤',
    email: 'sato@facility.com',
    role: 'admin',
    position: '施設長',
    qualifications: ['社会福祉士', '介護支援専門員', '普通自動車免許'],
    nightShiftOK: false,
    employmentType: 'fullTime',
    weeklyHours: 40,
    createdAt: new Date('2020-04-01'),
    updatedAt: new Date('2020-04-01')
  },
  
  // 正社員スタッフ（10名）
  {
    id: '2',
    name: '田中太郎',
    email: 'tanaka@facility.com',
    role: 'staff',
    position: '支援員',
    qualifications: ['介護福祉士', '普通自動車免許'],
    nightShiftOK: true,
    employmentType: 'fullTime',
    weeklyHours: 40,
    createdAt: new Date('2022-04-01'),
    updatedAt: new Date('2022-04-01')
  },
  {
    id: '3',
    name: '山田花子',
    email: 'yamada@facility.com',
    role: 'staff',
    position: '主任支援員',
    qualifications: ['社会福祉士', '介護福祉士', '普通自動車免許'],
    nightShiftOK: true,
    employmentType: 'fullTime',
    weeklyHours: 40,
    createdAt: new Date('2021-10-01'),
    updatedAt: new Date('2021-10-01')
  },
  {
    id: '4',
    name: '鈴木一郎',
    email: 'suzuki@facility.com',
    role: 'staff',
    position: '支援員',
    qualifications: ['介護福祉士', '実務者研修'],
    nightShiftOK: true,
    employmentType: 'fullTime',
    weeklyHours: 40,
    createdAt: new Date('2023-04-01'),
    updatedAt: new Date('2023-04-01')
  },
  {
    id: '5',
    name: '高橋美咲',
    email: 'takahashi@facility.com',
    role: 'staff',
    position: '支援員',
    qualifications: ['介護福祉士', '普通自動車免許'],
    nightShiftOK: false,
    employmentType: 'fullTime',
    weeklyHours: 40,
    createdAt: new Date('2022-10-01'),
    updatedAt: new Date('2022-10-01')
  },
  {
    id: '6',
    name: '伊藤健太',
    email: 'ito@facility.com',
    role: 'staff',
    position: '支援員',
    qualifications: ['介護福祉士', '普通自動車免許', '救急救命講習'],
    nightShiftOK: true,
    employmentType: 'fullTime',
    weeklyHours: 40,
    createdAt: new Date('2021-04-01'),
    updatedAt: new Date('2021-04-01')
  },
  {
    id: '7',
    name: '渡辺麻衣',
    email: 'watanabe@facility.com',
    role: 'staff',
    position: '相談支援員',
    qualifications: ['社会福祉士', '精神保健福祉士'],
    nightShiftOK: false,
    employmentType: 'fullTime',
    weeklyHours: 40,
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-01')
  },
  {
    id: '8',
    name: '中村雄介',
    email: 'nakamura@facility.com',
    role: 'staff',
    position: '支援員',
    qualifications: ['介護福祉士', '普通自動車免許'],
    nightShiftOK: true,
    employmentType: 'fullTime',
    weeklyHours: 40,
    createdAt: new Date('2022-01-15'),
    updatedAt: new Date('2022-01-15')
  },
  {
    id: '9',
    name: '小林さくら',
    email: 'kobayashi@facility.com',
    role: 'staff',
    position: '支援員',
    qualifications: ['介護福祉士', '実務者研修'],
    nightShiftOK: false,
    employmentType: 'fullTime',
    weeklyHours: 40,
    createdAt: new Date('2023-07-01'),
    updatedAt: new Date('2023-07-01')
  },
  {
    id: '10',
    name: '加藤大輔',
    email: 'kato@facility.com',
    role: 'staff',
    position: '支援員',
    qualifications: ['介護福祉士', '普通自動車免許', '衛生管理者'],
    nightShiftOK: true,
    employmentType: 'fullTime',
    weeklyHours: 40,
    createdAt: new Date('2020-10-01'),
    updatedAt: new Date('2020-10-01')
  },
  {
    id: '11',
    name: '吉田優子',
    email: 'yoshida@facility.com',
    role: 'staff',
    position: '支援員',
    qualifications: ['社会福祉士', '介護福祉士'],
    nightShiftOK: false,
    employmentType: 'fullTime',
    weeklyHours: 40,
    createdAt: new Date('2021-07-01'),
    updatedAt: new Date('2021-07-01')
  },

  // 非常勤パート・アルバイト（5名）
  {
    id: '12',
    name: '松本真理',
    email: 'matsumoto@facility.com',
    role: 'staff',
    position: '支援員（パート）',
    qualifications: ['介護初任者研修'],
    nightShiftOK: false,
    employmentType: 'partTime',
    weeklyHours: 20,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '13',
    name: '森田浩二',
    email: 'morita@facility.com',
    role: 'staff',
    position: '支援員（パート）',
    qualifications: ['実務者研修', '普通自動車免許'],
    nightShiftOK: false,
    employmentType: 'partTime',
    weeklyHours: 24,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  },
  {
    id: '14',
    name: '清水由美',
    email: 'shimizu@facility.com',
    role: 'staff',
    position: '支援員（アルバイト）',
    qualifications: ['介護初任者研修'],
    nightShiftOK: false,
    employmentType: 'partTime',
    weeklyHours: 16,
    createdAt: new Date('2024-04-10'),
    updatedAt: new Date('2024-04-10')
  },
  {
    id: '15',
    name: '橋本学',
    email: 'hashimoto@facility.com',
    role: 'staff',
    position: '支援員（パート）',
    qualifications: ['実務者研修'],
    nightShiftOK: false,
    employmentType: 'partTime',
    weeklyHours: 20,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20')
  },
  {
    id: '16',
    name: '西村香織',
    email: 'nishimura@facility.com',
    role: 'staff',
    position: '支援員（アルバイト）',
    qualifications: ['介護初任者研修'],
    nightShiftOK: false,
    employmentType: 'partTime',
    weeklyHours: 12,
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-01')
  }
]

export const demoShifts: Shift[] = [
  // 2025-06-01 (日曜日)
  {
    id: 's1',
    userId: '2', // 田中太郎
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
    userId: '3', // 山田花子
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
    userId: '6', // 伊藤健太
    date: '2025-06-01',
    shiftType: 'late',
    startTime: '12:00',
    endTime: '21:00',
    isRequest: false,
    isConfirmed: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 's4',
    userId: '8', // 中村雄介
    date: '2025-06-01',
    shiftType: 'night',
    startTime: '21:00',
    endTime: '07:00',
    isRequest: false,
    isConfirmed: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // 2025-06-02 (月曜日)
  {
    id: 's5',
    userId: '4', // 鈴木一郎
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
    userId: '5', // 高橋美咲
    date: '2025-06-02',
    shiftType: 'day',
    startTime: '09:00',
    endTime: '18:00',
    isRequest: false,
    isConfirmed: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 's7',
    userId: '7', // 渡辺麻衣
    date: '2025-06-02',
    shiftType: 'day',
    startTime: '09:00',
    endTime: '18:00',
    isRequest: false,
    isConfirmed: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 's8',
    userId: '10', // 加藤大輔
    date: '2025-06-02',
    shiftType: 'late',
    startTime: '12:00',
    endTime: '21:00',
    isRequest: false,
    isConfirmed: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 's9',
    userId: '2', // 田中太郎
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
    id: 's10',
    userId: '12', // 松本真理（パート）
    date: '2025-06-02',
    shiftType: 'day',
    startTime: '10:00',
    endTime: '15:00',
    isRequest: false,
    isConfirmed: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },

  // 2025-06-03 (火曜日)
  {
    id: 's11',
    userId: '9', // 小林さくら
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
    id: 's12',
    userId: '11', // 吉田優子
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
    id: 's13',
    userId: '6', // 伊藤健太
    date: '2025-06-03',
    shiftType: 'late',
    startTime: '12:00',
    endTime: '21:00',
    isRequest: false,
    isConfirmed: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 's14',
    userId: '13', // 森田浩二（パート）
    date: '2025-06-03',
    shiftType: 'day',
    startTime: '13:00',
    endTime: '17:00',
    isRequest: false,
    isConfirmed: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  },
  {
    id: 's15',
    userId: '14', // 清水由美（アルバイト）
    date: '2025-06-03',
    shiftType: 'day',
    startTime: '10:00',
    endTime: '14:00',
    isRequest: false,
    isConfirmed: true,
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25')
  }
]

export const demoDailyReports: DailyReport[] = [
  {
    id: 'r1',
    userId: '2', // 田中太郎
    date: '2025-06-01',
    activities: '朝の健康チェック、利用者A様の移動支援、昼食支援、レクリエーション活動の補助を行いました。午後は散歩の付き添いと、工作活動のサポートをしました。',
    notes: '利用者A様の体調が良好で、積極的にレクリエーションに参加されていました。工作では集中して取り組まれていたのが印象的でした。',
    submitted: true,
    submittedAt: new Date('2025-06-01T16:30:00'),
    createdAt: new Date('2025-06-01T16:30:00'),
    updatedAt: new Date('2025-06-01T16:30:00')
  },
  {
    id: 'r2',
    userId: '3', // 山田花子
    date: '2025-06-01',
    activities: '利用者B様の身体介護、薬の管理、家族との連絡調整を行いました。午後は個別支援計画の見直しと、関係機関との調整業務をしました。',
    notes: '利用者B様の血圧が若干高めでした（140/90）。看護師に報告済みです。来週の通院について家族と相談しました。',
    submitted: true,
    submittedAt: new Date('2025-06-01T18:45:00'),
    createdAt: new Date('2025-06-01T18:45:00'),
    updatedAt: new Date('2025-06-01T18:45:00')
  },
  {
    id: 'r3',
    userId: '6', // 伊藤健太
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
    userId: '4', // 鈴木一郎
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
    userId: '5', // 高橋美咲
    date: '2025-06-02',
    activities: '利用者E様の身体介護、おやつ作りの活動支援、レクリエーション活動の企画・実施を行いました。',
    notes: 'おやつ作りで利用者E様がとても喜ばれていました。来月も継続して実施予定です。',
    submitted: true,
    submittedAt: new Date('2025-06-02T18:10:00'),
    createdAt: new Date('2025-06-02T18:10:00'),
    updatedAt: new Date('2025-06-02T18:10:00')
  },
  {
    id: 'r6',
    userId: '12', // 松本真理（パート）
    date: '2025-06-02',
    activities: '午前中の活動支援、昼食の配膳・下膳、利用者の話し相手、簡単な清掃作業を行いました。',
    notes: '利用者の皆さんとの会話が弾み、楽しい時間を過ごせました。明日も同じ時間帯でお願いします。',
    submitted: true,
    submittedAt: new Date('2025-06-02T15:30:00'),
    createdAt: new Date('2025-06-02T15:30:00'),
    updatedAt: new Date('2025-06-02T15:30:00')
  },
  {
    id: 'r7',
    userId: '9', // 小林さくら
    date: '2025-06-03',
    activities: '',
    notes: '',
    submitted: false,
    createdAt: new Date('2025-06-03'),
    updatedAt: new Date('2025-06-03')
  },
  {
    id: 'r8',
    userId: '13', // 森田浩二（パート）
    date: '2025-06-03',
    activities: '',
    notes: '',
    submitted: false,
    createdAt: new Date('2025-06-03'),
    updatedAt: new Date('2025-06-03')
  }
]

// Firestore seeding function (for demo purposes)
export const seedDemoData = () => {
  console.log('🎭 拡張デモデータ準備完了:', {
    users: demoUsers.length,
    shifts: demoShifts.length,
    reports: demoDailyReports.length,
    breakdown: {
      admin: demoUsers.filter(u => u.role === 'admin').length,
      fullTimeStaff: demoUsers.filter(u => u.role === 'staff' && !u.name.includes('パート') && !u.name.includes('アルバイト')).length,
      partTimeStaff: demoUsers.filter(u => u.name.includes('パート') || u.name.includes('アルバイト')).length
    }
  })
}