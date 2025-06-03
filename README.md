# 障害者施設向けシフト管理＆業務支援アプリ

障害者施設のスタッフ向けに開発されたシフト管理・日報管理・レポート作成を効率化するPWAアプリです。

## 🎯 機能概要

### スタッフ用機能
- **ログイン**: Googleアカウント認証
- **シフト確認**: 月間シフト表の確認
- **シフト希望提出**: カレンダーから希望日時を選択・提出
- **日報入力**: 日々の活動内容・特記事項の記録・提出
- **PWA対応**: スマホのホーム画面に追加可能

### 管理者用機能
- **ダッシュボード**: 全体統計とクイックアクション
- **スタッフ管理**: スタッフ情報・資格・権限の管理
- **シフト管理**: ドラッグ&ドロップ対応のシフトカレンダー
- **シフト自動生成**: 希望を考慮した自動割り当て
- **日報管理**: 提出状況確認・未提出者チェック
- **レポート生成**: 半年分データの集計・PDF出力

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + Shadcn/ui
- **カレンダー**: FullCalendar (ドラッグ&ドロップ対応)
- **バックエンド**: Firebase (Authentication + Firestore)
- **PWA**: next-pwa
- **デプロイ**: Vercel

## 🚀 開発環境セットアップ

### 1. リポジトリのクローンと依存関係のインストール

```bash
git clone <repository-url>
cd shift-care-app
npm install
```

### 2. Firebase設定

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. Authentication で Google ログインを有効化
3. Firestore Database を作成
4. プロジェクト設定から設定情報を取得

### 3. 環境変数の設定

`.env.local.example` を `.env.local` にコピーして Firebase の設定値を入力:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## 📱 PWA として使用

### スマートフォンでの追加手順

1. ブラウザでアプリにアクセス
2. ブラウザメニューから「ホーム画面に追加」を選択
3. アプリ名を確認して追加

### 対応機能
- オフライン対応（一部機能）
- プッシュ通知対応
- ネイティブアプリライクな操作感

## 🏗️ プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # ダッシュボード
│   ├── login/            # ログイン画面
│   ├── shifts/           # シフト管理
│   ├── staff/            # スタッフ管理
│   ├── reports/          # 日報管理
│   ├── globals.css       # グローバルCSS
│   └── layout.tsx        # ルートレイアウト
├── components/            # 共通コンポーネント
│   ├── ui/               # Shadcn/ui コンポーネント
│   ├── layout/           # レイアウトコンポーネント
│   ├── auth/             # 認証関連
│   ├── dashboard/        # ダッシュボード関連
│   ├── shifts/           # シフト関連
│   └── reports/          # 日報関連
├── lib/                  # ユーティリティ
│   ├── firebase.ts       # Firebase設定
│   ├── auth.ts           # 認証機能
│   ├── demo-data.ts      # デモデータ
│   └── utils.ts          # ヘルパー関数
└── types/                # TypeScript型定義
    └── index.ts
```

## 🔧 利用可能なスクリプト

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm run start

# リンター実行
npm run lint
```

## 📊 デモデータ

開発とテスト用に以下のデモデータが含まれています：

- **スタッフ**: 5名（管理者1名、一般スタッフ4名）
- **シフト**: 2025年6月分のサンプルシフト
- **日報**: 過去1週間分の日報データ

## 🚀 デプロイ

### Vercel デプロイ

1. [Vercel](https://vercel.com) にプロジェクトをインポート
2. 環境変数を設定
3. 自動デプロイの完了を待つ

### 環境変数（Vercel）

Vercel の環境変数設定で以下を追加：

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

## 📈 今後の機能拡張予定

### Phase 2: 機能拡張
- AI を活用したシフト最適化
- 自動リマインド通知
- 詳細な統計・分析機能
- データエクスポート機能強化

### Phase 3: 高度機能
- 多施設対応
- 外部システム連携
- 音声入力対応
- 予測分析機能

## 🤝 貢献

1. フォークを作成
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチをプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 📞 サポート

質問や問題がある場合は、Issues を作成するかプロジェクトチームまでお問い合わせください。

---

**開発チーム**: 障害者施設向けシフト管理アプリ開発チーム  
**作成日**: 2025年6月1日  
**バージョン**: 1.0.0