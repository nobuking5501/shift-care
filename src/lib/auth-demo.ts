'use client'

// Demo mode - Firebase設定前のデモ表示用
// 実際のFirebase設定後は auth.ts を使用してください

export const signInWithGoogle = async () => {
  try {
    // Demo user for testing
    return {
      uid: 'demo-user',
      displayName: 'デモユーザー',
      email: 'demo@example.com'
    }
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

export const logout = async () => {
  try {
    console.log('Demo logout')
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export const onAuthStateChange = (callback: (user: any) => void) => {
  // Demo mode: no user initially
  setTimeout(() => callback(null), 100)
  return () => {}
}