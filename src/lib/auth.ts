'use client'

// プロトタイプ用デモ認証システム
// 実際のFirebase設定後は元のコードに戻してください

let currentDemoUser: any = null

const demoUsers = {
  admin: {
    uid: 'demo-admin',
    displayName: '管理者 田中',
    email: 'admin@demo.com',
    role: 'admin'
  },
  staff: {
    uid: '3',
    id: '3',
    displayName: '山田花子（ケアマネジャー）',
    name: '山田花子（ケアマネジャー）',
    email: 'yamada@facility.com',
    role: 'staff'
  }
}

export const signInWithGoogle = async () => {
  try {
    // デモ用：管理者としてログイン
    currentDemoUser = demoUsers.admin
    
    // ローカルストレージに保存（ページリロード時の状態維持）
    if (typeof window !== 'undefined') {
      localStorage.setItem('demoUser', JSON.stringify(currentDemoUser))
    }
    
    console.log('🎭 管理者デモログイン成功:', currentDemoUser.displayName, currentDemoUser)
    return currentDemoUser
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

export const logout = async () => {
  try {
    currentDemoUser = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demoUser')
    }
    console.log('🎭 デモログアウト')
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export const onAuthStateChange = (callback: (user: any) => void) => {
  // ページロード時にローカルストレージから復元
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('demoUser')
    if (savedUser) {
      currentDemoUser = JSON.parse(savedUser)
    }
  }
  
  // 即座にコールバックを実行
  setTimeout(() => callback(currentDemoUser), 100)
  
  return () => {}
}

// デモ用：現在のユーザーを取得
export const getCurrentDemoUser = () => {
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('demoUser')
    return savedUser ? JSON.parse(savedUser) : null
  }
  return currentDemoUser
}

// デモ用：スタッフとしてログイン
export const signInAsStaff = async () => {
  currentDemoUser = demoUsers.staff
  if (typeof window !== 'undefined') {
    localStorage.setItem('demoUser', JSON.stringify(currentDemoUser))
  }
  console.log('🎭 スタッフデモログイン成功:', currentDemoUser.displayName, currentDemoUser)
  return currentDemoUser
}