import { Incident } from '@/types'

// デモ用の事故・ヒヤリハットデータ
export const demoIncidents: Incident[] = [
  {
    id: 'inc_001',
    reportedBy: '2', // 田中太郎
    reportedAt: new Date('2025-06-01T14:30:00'),
    incidentDate: new Date('2025-06-01T14:15:00'),
    incidentType: 'nearMiss',
    location: 'リビング',
    involvedPersons: ['利用者A', '田中太郎'],
    description: '利用者Aが車椅子から立ち上がろうとした際に、バランスを崩しかけました。すぐに支援し転倒は防げましたが、ヒヤリとしました。利用者Aは普段から立ち上がり時に急ぐ傾向があり、今回も声かけが間に合わない状況でした。',
    response: 'すぐに身体を支え、安全な姿勢に戻しました。けがはありませんでした。その後、利用者Aに立ち上がり時の注意点について説明し、今後は声かけをしてから立ち上がることを約束していただきました。',
    preventiveMeasures: '車椅子のブレーキ確認を徹底し、立ち上がり時は必ず声かけ・見守りを行う。利用者Aに対しては、立ち上がり前の確認を習慣化してもらう。スタッフ間で利用者Aの特性について情報共有する。',
    status: 'completed',
    updatedAt: new Date('2025-06-01T15:00:00'),
    updatedBy: '1'
  },
  {
    id: 'inc_002',
    reportedBy: '5', // 高橋美咲
    reportedAt: new Date('2025-05-30T10:20:00'),
    incidentDate: new Date('2025-05-30T10:00:00'),
    incidentType: 'accident',
    location: 'トイレ',
    involvedPersons: ['利用者B'],
    description: '利用者Bがトイレで滑って軽く転倒しました。清掃後でまだ床が湿っている状態でした。手すりにつかまっていたため大きなけがはありませんでしたが、右膝に軽い打撲を負いました。利用者Bは歩行に不安があり、普段から慎重に移動されている方です。',
    response: '看護師に連絡し、患部を確認しました。氷嚢による冷却処置を行い、腫れや内出血の状況を観察しました。ご家族に連絡し、状況を説明済みです。本日は安静にしていただき、明日の様子を見て必要に応じて医療機関受診を検討します。',
    preventiveMeasures: 'トイレの床の滑り止めマットを追加設置しました。定期的な清掃時の水気除去を徹底し、清掃後は十分に乾燥させてから利用再開します。歩行不安定な利用者の移動時は、より注意深く見守りを行います。',
    status: 'in_progress',
    updatedAt: new Date('2025-05-30T11:00:00'),
    updatedBy: '1'
  },
  {
    id: 'inc_003',
    reportedBy: '6', // 伊藤健太
    reportedAt: new Date('2025-05-28T16:45:00'),
    incidentDate: new Date('2025-05-28T16:30:00'),
    incidentType: 'nearMiss',
    location: '食堂',
    involvedPersons: ['利用者C', '伊藤健太'],
    description: '昼食後、利用者Cが食事中に咳き込み、食べ物が詰まりかけました。利用者Cは嚥下機能に軽度の障害があり、食事時は通常とろみをつけて提供していますが、本日は固形物をそのまま提供していました。大きめの食材を一度に口に入れたことが原因と思われます。',
    response: '背中を軽く叩いて咳を促し、水を飲んでもらい回復しました。呼吸に問題なく、その後の体調変化もありませんでした。食事の残りは中止し、改めてとろみをつけた食事を提供しました。',
    preventiveMeasures: '食事時の見守りを強化し、一口量を調整します。利用者Cの食事形態について再度確認し、とろみ付けの検討を栄養士と相談します。嚥下機能に不安のある利用者の食事提供時は、必ず適切な食事形態で提供するよう徹底します。',
    status: 'pending',
    updatedAt: new Date('2025-05-28T17:00:00')
  },
  {
    id: 'inc_004',
    reportedBy: '8', // 中村雄介
    reportedAt: new Date('2025-05-25T09:15:00'),
    incidentDate: new Date('2025-05-25T09:00:00'),
    incidentType: 'nearMiss',
    location: '作業室',
    involvedPersons: ['利用者D', '中村雄介'],
    description: '作業訓練中に、利用者Dがはさみを使用している際に、隣の利用者に向けてはさみを向けそうになりました。すぐに声かけし、事故には至りませんでしたが、危険な状況でした。',
    response: 'はさみの使用を一時中止し、利用者Dに安全な使用方法について再度説明しました。作業訓練は別の道具を使用して継続しました。',
    preventiveMeasures: '危険物使用時の見守り体制を強化し、利用者同士の距離を適切に保つよう配置を見直します。',
    status: 'completed',
    updatedAt: new Date('2025-05-25T10:00:00'),
    updatedBy: '1'
  },
  {
    id: 'inc_005',
    reportedBy: '11', // 吉田優子
    reportedAt: new Date('2025-05-20T15:30:00'),
    incidentDate: new Date('2025-05-20T15:20:00'),
    incidentType: 'accident',
    location: '廊下',
    involvedPersons: ['利用者E'],
    description: '利用者Eが廊下を歩行中に、床に置かれていた荷物につまずいて転倒しました。軽い擦り傷を負いました。',
    response: '傷の手当てを行い、看護師に報告しました。消毒と絆創膏による処置を実施しました。',
    preventiveMeasures: '廊下や通路には物を置かないよう徹底し、定期的な環境整備を行います。',
    status: 'completed',
    updatedAt: new Date('2025-05-20T16:00:00'),
    updatedBy: '1'
  }
]

// 事故・ヒヤリハット統計の計算
export const getIncidentStats = () => {
  const total = demoIncidents.length
  const pending = demoIncidents.filter(i => i.status === 'pending').length
  const inProgress = demoIncidents.filter(i => i.status === 'in_progress').length
  const completed = demoIncidents.filter(i => i.status === 'completed').length
  const accidents = demoIncidents.filter(i => i.incidentType === 'accident').length
  const nearMisses = demoIncidents.filter(i => i.incidentType === 'nearMiss').length

  return {
    total,
    pending,
    inProgress,
    completed,
    accidents,
    nearMisses
  }
}

// 最近の事故・ヒヤリハット活動
export const getRecentIncidentActivities = () => {
  return demoIncidents
    .sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime())
    .slice(0, 3)
    .map(incident => ({
      id: incident.id,
      user: `報告者: ${incident.reportedBy}`, // 実際の実装では報告者名を取得
      action: `${incident.incidentType === 'accident' ? '事故' : 'ヒヤリハット'}を報告`,
      time: formatTimeAgo(incident.reportedAt),
      location: incident.location,
      status: incident.status
    }))
}

// 時間経過の表示
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `${diffDays}日前`
  } else if (diffHours > 0) {
    return `${diffHours}時間前`
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return `${diffMinutes}分前`
  }
}