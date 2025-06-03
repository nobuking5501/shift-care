// プロトタイプ用ダミーFirebase - 実際の実装時はfirebase-backup.tsを使用

// ダミーのFirebaseオブジェクト（エラー回避用）
export const auth = {
  currentUser: null,
  signInWithPopup: () => Promise.resolve({ user: null }),
  signOut: () => Promise.resolve(),
  onAuthStateChanged: () => () => {}
}

export const db = {
  // ダミーFirestore
}

const app = {
  // ダミーアプリ
}

export default app