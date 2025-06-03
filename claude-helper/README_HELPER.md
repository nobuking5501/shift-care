# ClaudeHelper - Shift-Care App版 使い方マニュアル

## 概要
障害者施設向けシフト管理＆業務支援アプリ開発専用のClaudeHelper環境です。

開発作業ログの記録・管理、セッション検索、プロンプトテンプレート活用により、効率的な開発とナレッジ蓄積を支援します。

## ディレクトリ構成
```
claude-helper/
├── CLAUDE.md                 # 運用ルール・プロジェクト仕様
├── PROJECT_OVERVIEW.md       # プロジェクト設計仕様書
├── save_session.py          # セッション保存スクリプト
├── search_session.py        # セッション検索ツール
├── README_HELPER.md         # このファイル
├── sessions/                # セッション履歴
│   └── metadata/           # メタデータJSON保存
├── prompt-templates/        # プロンプトテンプレート集
│   ├── session_start.txt
│   ├── quick_task.txt
│   ├── error_recovery.txt
│   ├── feedback.txt
│   ├── changes_tracking.txt
│   ├── strong_instruction.txt
│   └── shift_management_checklist.txt
└── checkpoints_backup/      # チェックポイント保存
```

## 基本的な使い方

### 1. 新規セッション開始
```bash
# プロンプトテンプレートを使用
cat prompt-templates/session_start.txt
```

### 2. セッション保存
```bash
# 通常保存
python save_session.py --session-name "ユーザー認証機能_実装" --tags "backend,auth,security" --summary "JWT認証とログイン機能を実装"

# 中間保存（2時間超えた場合）
python save_session.py --checkpoint --session-name "シフト表UI_作成中" --summary "React コンポーネント作成途中"

# 最終保存＆バックアップ
python save_session.py --finalize --session-name "シフト表UI_完成" --summary "レスポンシブ対応完了"
```

### 3. セッション検索
```bash
# タグで検索
python search_session.py --tag "frontend"

# キーワードで検索
python search_session.py --keyword "シフト"

# 日付で検索
python search_session.py --date "2025-06"

# 複合検索
python search_session.py --tag "frontend,ui" --keyword "エラー" --status "completed"

# 最新10件表示
python search_session.py --recent 10

# 詳細表示
python search_session.py --tag "backend" --detail

# 統計情報表示
python search_session.py --stats

# セッション内容表示
python search_session.py --content "20250601_143022_a1b2c3d4"
```

## プロンプトテンプレート活用

### session_start.txt
新しいセッション開始時に使用。プロジェクト情報、タスク、制約条件を整理。

### quick_task.txt
30分以内の短時間タスク用。簡潔な指示でスピーディに実行。

### error_recovery.txt
エラー発生時の復旧作業用。エラー詳細、影響範囲、復旧手順を体系化。

### feedback.txt
ユーザーフィードバック反映時に使用。優先度付けと段階的実装をサポート。

### changes_tracking.txt
大きな変更を行う際の影響分析とリスク管理用。

### strong_instruction.txt
重要な制約事項や禁止事項を明示して作業依頼する際に使用。

### shift_management_checklist.txt
シフト管理機能特有のチェックリスト。障害者施設の要件を網羅。

## 運用のベストプラクティス

### セッション管理
- **小タスク単位**でセッションを分割（1機能、1バグ修正等）
- 作業開始時は必ずTodoWriteツールでタスク管理
- 2時間を超える場合は中間保存を実行
- 完了時は必ず最終保存とバックアップ作成

### タグ付けルール
```
# 技術領域
frontend, backend, database, api, ui, auth, security

# 機能領域  
shift, staff, client, report, notification, calendar

# 作業種別
implement, fix, refactor, test, docs, review

# 優先度・状態
urgent, important, completed, in-progress, blocked
```

### 検索活用
- 類似問題の解決方法を検索
- 過去の実装パターンを参照
- エラー対処法の蓄積を活用
- 定期的な統計確認でナレッジギャップを把握

## トラブルシューティング

### セッション保存エラー
```bash
# ディレクトリ権限確認
ls -la claude-helper/sessions/

# 手動ディレクトリ作成
mkdir -p claude-helper/sessions/metadata
mkdir -p claude-helper/checkpoints_backup
```

### 検索結果が見つからない場合
```bash
# メタデータファイル確認
ls claude-helper/sessions/metadata/

# 全セッション一覧表示
python search_session.py --recent 100
```

### Python スクリプトエラー
```bash
# Python バージョン確認（3.7以上推奨）
python --version

# 必要に応じてパッケージインストール
pip install python-dateutil
```

## カスタマイズ

### 新しいプロンプトテンプレート追加
1. `prompt-templates/` に新しい `.txt` ファイル作成
2. プロジェクト固有の要件に合わせて内容作成
3. `CLAUDE.md` に使用方法を追記

### タグカテゴリ拡張
1. `save_session.py` の使用例にタグを追加
2. `search_session.py` でのフィルタリング動作確認
3. チーム内でタグ命名規則を共有

## 連携・発展

### 他ツールとの連携
- GitHubリポジトリとの連携（commit message参照等）
- Slack通知との連携（重要なセッション完了時）
- CI/CDパイプラインとの連携（デプロイ時のセッション記録）

### 将来的な機能拡張
- Claude API連携による自動要約生成
- 統計分析機能の強化
- チーム間でのセッション共有機能
- 統合型ClaudeHelperへの移行対応

---

**更新履歴**
- v1.0: 初版作成（2025/06/01）

**サポート**
使用方法についての質問や改善提案は、プロジェクトチーム内で共有してください。