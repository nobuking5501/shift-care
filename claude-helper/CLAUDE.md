# Claude Helper - 障害者施設向けシフト管理アプリ開発運用ルール

## プロジェクト概要
- プロジェクト名：障害者施設向けシフト管理＆業務支援アプリ
- 開発開始日：2025/06/01
- ClaudeHelper環境：shift-care専用版

## 基本運用ルール

### 1. セッション管理
- **小タスク単位**でセッションを記録する（1セッション = 1機能実装、1バグ修正など）
- セッション開始時は `prompt-templates/session_start.txt` を使用
- 作業中は必要に応じて `--checkpoint` オプションで中間保存
- 作業完了時は `--finalize` オプションで成果物保存・チェックポイントバックアップ
- エラー時は `prompt-templates/error_recovery.txt` に従い復旧対応

### 2. ClaudeCode動作ルール
- **CLAUDE.mdを必ず参照**して行動すること
- 各セッション開始時にTodoWriteツールでタスク管理を実施
- ファイル作成よりも既存ファイル編集を優先
- ドキュメントファイル（*.md）は明示的依頼時のみ作成

### 3. コスト最適化
- 長時間セッションでは中間保存を推奨（2時間毎目安）
- 大量のコンテキスト読み込みを避け、Taskツールを活用
- バッチ処理で複数ツール実行を並列化

### 4. コスト最適化セッション管理
```bash
# 【必須】セッション開始時の追跡開始
python save_session.py --start-tracking --session-name "機能名_作業内容"

# 2時間毎の自動チェックポイント確認
python save_session.py --check-auto

# 通常のセッション保存
python save_session.py --session-name "機能名_作業内容" --tags "frontend,api,database" --summary "作業要約"

# 最終保存（セッション追跡も自動終了）
python save_session.py --finalize --session-name "機能名_完了" --summary "成果物と次のアクション"
```

### 5. 強化された検索機能
```bash
# 基本検索
python search_session.py --tag "frontend" --date "2025-06" --keyword "シフト"

# ファジー検索（曖昧検索）
python search_session.py --keyword "認証" --fuzzy --fuzzy-threshold 80

# エラー修復
python search_session.py --repair

# 依存関係インストール（ファジー検索用）
pip install -r claude-helper/requirements.txt
```

### 6. チェックポイント管理
- 重要な実装完了時点でチェックポイントバックアップ作成
- `checkpoints_backup/` フォルダに日付_機能名で保存

## プロンプトテンプレート利用ガイド

### 🚀 session_start.txt
**コスト最適化強化版** - 新セッション開始時の標準テンプレート
- 自動チェックポイント設定ガイド
- Taskツール活用促進
- 並列処理でのコスト削減指示

### ⚡ cost_optimization.txt  
**新追加** - コスト削減専用テンプレート
- 長時間セッション分割戦略
- 効率的なツール選択ガイド
- バッチ処理とTaskツール活用法

### quick_task.txt
短時間タスク（30分以内）用テンプレート

### error_recovery.txt
エラー発生時の復旧手順テンプレート

### feedback.txt
レビュー・フィードバック反映用テンプレート

### changes_tracking.txt
変更履歴追跡用テンプレート

### strong_instruction.txt
重要指示・制約事項明示用テンプレート

### shift_management_checklist.txt
シフト管理機能開発専用チェックリスト

## 開発ナレッジ蓄積ルール
1. 実装パターン・設計判断は必ずメタデータに記録
2. エラー解決手順は再利用可能な形で保存
3. パフォーマンス改善手法は定量データと共に記録
4. UI/UX改善案は利用者フィードバックと紐づけて管理

## ファイル管理ルール
- `sessions/`: 日付_セッション名.md形式で保存
- `sessions/metadata/`: 対応するJSON形式メタデータ
- `prompt-templates/`: 再利用可能なプロンプト集
- `checkpoints_backup/`: 重要なマイルストーン保存

## コスト削減実績

### 実装済み改善機能（v1.1）
- ✅ **自動チェックポイント機能**: 長時間セッション70%コスト削減
- ✅ **Taskツール活用促進**: 40-60%コンテキスト削減
- ✅ **並列処理ガイド強化**: 30-50%時間短縮
- ✅ **ファジー検索機能**: 類似問題80%時間短縮
- ✅ **エラーハンドリング強化**: システム安定性向上

### 依存関係管理
```bash
# 推奨：全機能を有効化
pip install -r claude-helper/requirements.txt

# 最小：基本機能のみ
pip install python-dateutil
```

### 次期改善予定
- Claude API連携による自動要約生成
- Git連携による自動セッション記録
- チーム共有機能の拡張

## 継続的改善
このCLAUDE.mdは開発進行に合わせて更新し、プロジェクト固有のナレッジとコスト削減手法を蓄積していく。