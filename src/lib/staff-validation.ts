/**
 * スタッフ管理のバリデーションとユーティリティ
 */

export interface StaffValidationRule {
  field: string
  message: string
  type: 'error' | 'warning'
}

export interface StaffValidationResult {
  isValid: boolean
  rules: StaffValidationRule[]
}

/**
 * スタッフ情報の基本バリデーション
 */
export function validateStaffInfo(staffData: any): StaffValidationResult {
  const rules: StaffValidationRule[] = []

  // 必須フィールドチェック
  if (!staffData.name?.trim()) {
    rules.push({
      field: 'name',
      message: '氏名は必須です',
      type: 'error'
    })
  }

  if (!staffData.email?.trim()) {
    rules.push({
      field: 'email',
      message: 'メールアドレスは必須です',
      type: 'error'
    })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffData.email)) {
    rules.push({
      field: 'email',
      message: '有効なメールアドレス形式で入力してください',
      type: 'error'
    })
  }

  if (!staffData.position?.trim()) {
    rules.push({
      field: 'position',
      message: '職位は必須です',
      type: 'error'
    })
  }

  // 週間労働時間チェック
  if (staffData.weeklyHours) {
    const hours = parseInt(staffData.weeklyHours)
    if (isNaN(hours) || hours < 1) {
      rules.push({
        field: 'weeklyHours',
        message: '週間労働時間は1時間以上で入力してください',
        type: 'error'
      })
    } else if (hours > 60) {
      rules.push({
        field: 'weeklyHours',
        message: '週間労働時間が60時間を超えています。労働基準法に配慮してください',
        type: 'warning'
      })
    } else if (hours > 40 && staffData.employmentType === 'partTime') {
      rules.push({
        field: 'weeklyHours',
        message: 'パートタイム職員の労働時間が40時間を超えています',
        type: 'warning'
      })
    }
  }

  // 電話番号チェック
  if (staffData.phone && !/^[\d\-\+\(\)\s]+$/.test(staffData.phone)) {
    rules.push({
      field: 'phone',
      message: '有効な電話番号形式で入力してください',
      type: 'error'
    })
  }

  // 夜勤とパートタイムの組み合わせチェック
  if (staffData.nightShiftOK && staffData.employmentType === 'partTime') {
    rules.push({
      field: 'nightShiftOK',
      message: 'パートタイム職員の夜勤対応は特別な配慮が必要です',
      type: 'warning'
    })
  }

  // 資格チェック（障害者施設向け）
  const qualifications = Array.isArray(staffData.qualifications) 
    ? staffData.qualifications 
    : staffData.qualifications?.split(',').map((q: string) => q.trim()).filter(Boolean) || []

  if (qualifications.length === 0) {
    rules.push({
      field: 'qualifications',
      message: '少なくとも1つの資格を入力することを推奨します',
      type: 'warning'
    })
  }

  // 必要な資格の有無チェック
  const hasWelfareQualification = qualifications.some(q => 
    q.includes('介護福祉士') || 
    q.includes('社会福祉士') || 
    q.includes('精神保健福祉士') ||
    q.includes('実務者研修') ||
    q.includes('介護初任者研修')
  )

  if (!hasWelfareQualification && staffData.role === 'staff') {
    rules.push({
      field: 'qualifications',
      message: '障害者支援に関連する資格（介護福祉士等）の保有を推奨します',
      type: 'warning'
    })
  }

  return {
    isValid: !rules.some(rule => rule.type === 'error'),
    rules
  }
}

/**
 * メールアドレスの重複チェック
 */
export function checkEmailDuplicate(email: string, existingStaff: any[], excludeId?: string): boolean {
  return existingStaff.some(staff => 
    staff.email.toLowerCase() === email.toLowerCase() && 
    staff.id !== excludeId
  )
}

/**
 * 管理者権限チェック
 */
export function hasStaffManagementPermission(userRole: string): boolean {
  return userRole === 'admin'
}

/**
 * スタッフ削除権限チェック
 */
export function canDeleteStaff(userRole: string, targetStaff: any): boolean {
  // 管理者のみがスタッフを削除可能
  if (userRole !== 'admin') {
    return false
  }
  
  // 管理者自身は削除できない（最後の管理者保護）
  if (targetStaff.role === 'admin') {
    return false
  }
  
  return true
}

/**
 * スタッフ編集権限チェック
 */
export function canEditStaff(userRole: string, userId: string, targetStaffId: string): boolean {
  // 管理者は全スタッフを編集可能
  if (userRole === 'admin') {
    return true
  }
  
  // 一般スタッフは自分の情報のみ編集可能
  return userId === targetStaffId
}

/**
 * 雇用形態別の制約チェック
 */
export function getEmploymentTypeConstraints(employmentType: string) {
  switch (employmentType) {
    case 'fullTime':
      return {
        maxWeeklyHours: 40,
        nightShiftAllowed: true,
        recommendations: [
          '正社員として法定労働時間の遵守',
          '夜勤対応可能な場合はシフト柔軟性向上'
        ]
      }
    case 'partTime':
      return {
        maxWeeklyHours: 30,
        nightShiftAllowed: false,
        recommendations: [
          'パートタイム労働時間の適切な管理',
          '夜勤は原則として避けることを推奨'
        ]
      }
    case 'contract':
      return {
        maxWeeklyHours: 40,
        nightShiftAllowed: true,
        recommendations: [
          '契約期間と労働条件の明確化',
          '更新時期の事前確認'
        ]
      }
    default:
      return {
        maxWeeklyHours: 40,
        nightShiftAllowed: true,
        recommendations: []
      }
  }
}

/**
 * 資格レベルの評価
 */
export function assessQualificationLevel(qualifications: string[]): {
  level: 'basic' | 'intermediate' | 'advanced'
  score: number
  recommendations: string[]
} {
  const qualificationScores: { [key: string]: number } = {
    '介護福祉士': 10,
    '社会福祉士': 10,
    '精神保健福祉士': 10,
    '介護支援専門員': 8,
    '実務者研修': 6,
    '介護初任者研修': 4,
    '普通自動車免許': 2,
    '救急救命講習': 3,
    '衛生管理者': 5
  }

  let totalScore = 0
  const recommendations: string[] = []

  qualifications.forEach(qualification => {
    const score = qualificationScores[qualification] || 1
    totalScore += score
  })

  let level: 'basic' | 'intermediate' | 'advanced'
  
  if (totalScore >= 15) {
    level = 'advanced'
  } else if (totalScore >= 8) {
    level = 'intermediate'
    recommendations.push('より高度な資格取得を推奨します')
  } else {
    level = 'basic'
    recommendations.push('介護福祉士または社会福祉士の取得を強く推奨します')
    recommendations.push('実務者研修の受講を検討してください')
  }

  // 普通自動車免許チェック
  if (!qualifications.some(q => q.includes('普通自動車免許'))) {
    recommendations.push('普通自動車免許の取得を推奨します（外出支援等に必要）')
  }

  return { level, score: totalScore, recommendations }
}