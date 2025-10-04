'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { onAuthStateChange } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import { demoUsers } from '@/lib/demo-data'
import { validateStaffInfo, hasStaffManagementPermission, canEditStaff, assessQualificationLevel } from '@/lib/staff-validation'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Award,
  Moon,
  Edit,
  Save,
  X,
  ArrowLeft,
  Clock,
  MapPin,
  Briefcase,
  Shield
} from 'lucide-react'

export default function StaffDetailPage() {
  const params = useParams()
  const router = useRouter()
  const staffId = params.id as string
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [staffData, setStaffData] = useState<any>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setUser(user)
        
        // Demo care manager data for Yamada Hanako
        if (staffId === '3') {
          const yamadaData = {
            id: '3',
            name: '山田花子（ケアマネジャー）',
            email: 'yamada@facility.com',
            position: 'ケアマネジャー（相談支援専門員）',
            qualifications: ['介護支援専門員', '社会福祉士', '介護福祉士', '普通自動車免許'],
            nightShiftOK: false,
            employmentType: 'fullTime',
            weeklyHours: 40,
            role: 'staff',
            createdAt: '2021-10-01',
            experience: '相談支援業務 3年',
            specialization: '知的障害・精神障害の支援計画作成',
            managedUsers: 4,
            completedPlans: 15
          }
          setStaffData(yamadaData)
          setEditForm({
            name: yamadaData.name,
            email: yamadaData.email,
            position: yamadaData.position,
            qualifications: yamadaData.qualifications.join(', '),
            nightShiftOK: yamadaData.nightShiftOK,
            employmentType: yamadaData.employmentType,
            weeklyHours: yamadaData.weeklyHours,
            phone: '090-1111-0002'
          })
        } else {
          router.push('/staff')
        }
      } else {
        router.push('/')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router, staffId])

  // Demo phone number generator
  const generatePhoneNumber = (id: string) => {
    const base = parseInt(id) + 1000
    return `090-${base.toString().padStart(4, '0')}-${(base * 2).toString().slice(-4)}`
  }

  const validateForm = () => {
    const validation = validateStaffInfo(editForm)
    const errorMessages = validation.rules
      .filter(rule => rule.type === 'error')
      .map(rule => rule.message)
    
    setValidationErrors(errorMessages)
    return validation.isValid
  }

  const handleSave = () => {
    if (!validateForm()) {
      return
    }

    // In real app, this would be an API call
    const updatedStaff = {
      ...staffData,
      name: editForm.name,
      email: editForm.email,
      position: editForm.position,
      qualifications: editForm.qualifications.split(',').map((q: string) => q.trim()).filter(Boolean),
      nightShiftOK: editForm.nightShiftOK,
      employmentType: editForm.employmentType,
      weeklyHours: parseInt(editForm.weeklyHours) || 40,
      updatedAt: new Date()
    }
    
    setStaffData(updatedStaff)
    setIsEditing(false)
    setValidationErrors([])
    alert('スタッフ情報を更新しました')
  }

  const handleCancel = () => {
    // Reset form to original data
    setEditForm({
      name: staffData.name,
      email: staffData.email,
      position: staffData.position,
      qualifications: staffData.qualifications.join(', '),
      nightShiftOK: staffData.nightShiftOK,
      employmentType: staffData.employmentType,
      weeklyHours: staffData.weeklyHours,
      phone: generatePhoneNumber(staffData.id)
    })
    setIsEditing(false)
    setValidationErrors([])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !staffData) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getEmploymentTypeLabel = (type: string) => {
    switch (type) {
      case 'fullTime': return '正社員'
      case 'partTime': return 'パートタイム'
      case 'contract': return '契約社員'
      default: return type
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole="staff" />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/staff')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'スタッフ情報編集' : 'スタッフ詳細'}
              </h1>
              <p className="text-gray-600">
                ケアマネジャーの詳細情報
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>キャンセル</span>
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>保存</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>編集</span>
              </button>
            )}
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-medium mb-2">入力エラー</h3>
            <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
                
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="text-center text-xl font-bold text-gray-900 w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {staffData.name}
                  </h2>
                )}
                
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.position}
                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                    className="text-center text-gray-600 w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
                  />
                ) : (
                  <p className="text-gray-600 mb-4">{staffData.position}</p>
                )}

                <div className="flex justify-center space-x-2">
                  {staffData.role === 'admin' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <Shield className="w-3 h-3 mr-1" />
                      管理者
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    staffData.employmentType === 'fullTime' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    <Briefcase className="w-3 h-3 mr-1" />
                    {getEmploymentTypeLabel(staffData.employmentType)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{staffData.email}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電話番号
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{generatePhoneNumber(staffData.id)}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    入社日
                  </label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{formatDate(staffData.createdAt)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    雇用形態
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm.employmentType}
                      onChange={(e) => setEditForm({ ...editForm, employmentType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="fullTime">正社員</option>
                      <option value="partTime">パートタイム</option>
                      <option value="contract">契約社員</option>
                    </select>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{getEmploymentTypeLabel(staffData.employmentType)}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    週間労働時間
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={editForm.weeklyHours}
                      onChange={(e) => setEditForm({ ...editForm, weeklyHours: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{staffData.weeklyHours}時間/週</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    夜勤対応
                  </label>
                  {isEditing ? (
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editForm.nightShiftOK}
                        onChange={(e) => setEditForm({ ...editForm, nightShiftOK: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-gray-700">夜勤可能</span>
                    </label>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Moon className={`w-4 h-4 ${staffData.nightShiftOK ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={`${staffData.nightShiftOK ? 'text-blue-600' : 'text-gray-600'}`}>
                        {staffData.nightShiftOK ? '対応可能' : '対応不可'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Care Manager Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ケアマネジャー情報</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    担当利用者数
                  </label>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{staffData.managedUsers || 4}名</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    作成済み支援計画数
                  </label>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{staffData.completedPlans || 15}件</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    専門分野
                  </label>
                  <span className="text-gray-900">{staffData.specialization || '知的障害・精神障害の支援計画作成'}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    経験年数
                  </label>
                  <span className="text-gray-900">{staffData.experience || '相談支援業務 3年'}</span>
                </div>
              </div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">保有資格</h4>
              {isEditing ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    資格（カンマ区切りで入力）
                  </label>
                  <textarea
                    value={editForm.qualifications}
                    onChange={(e) => setEditForm({ ...editForm, qualifications: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="介護福祉士, 普通自動車免許, 社会福祉士"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    複数の資格はカンマ（,）で区切って入力してください
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {staffData.qualifications.map((qualification: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      <Award className="w-3 h-3 mr-1" />
                      {qualification}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Care Management Activities */}
            {!isEditing && (
              <div className="bg-blue-50 rounded-lg p-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">今月の活動実績</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">3</div>
                    <div className="text-xs text-gray-600">新規アセスメント</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">2</div>
                    <div className="text-xs text-gray-600">計画更新</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">8</div>
                    <div className="text-xs text-gray-600">モニタリング</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">5</div>
                    <div className="text-xs text-gray-600">サービス調整</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}