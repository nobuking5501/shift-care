// Demo Firebase configuration - 一時的なデモ用
// 実際のFirebase設定前のデモ表示用

// Mock Firebase functions for demo
export const auth = {
  currentUser: null,
  signInWithPopup: () => Promise.resolve({ user: { uid: 'demo-user', displayName: 'デモユーザー' } }),
  signOut: () => Promise.resolve(),
  onAuthStateChanged: (callback: any) => {
    // Demo user for testing
    setTimeout(() => callback(null), 100)
    return () => {}
  }
}

export const db = {
  // Mock Firestore for demo
}

// Mock auth functions
export const signInWithGoogle = async () => {
  return { uid: 'demo-user', displayName: 'デモユーザー', email: 'demo@example.com' }
}

export const logout = async () => {
  console.log('Demo logout')
}

export const onAuthStateChange = (callback: (user: any) => void) => {
  // For demo, return no user initially
  setTimeout(() => callback(null), 100)
  return () => {}
}

export default { auth, db }