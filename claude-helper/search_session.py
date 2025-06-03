#!/usr/bin/env python3
"""
ClaudeHelper Session Search Tool
障害者施設向けシフト管理アプリ開発専用版

Usage:
    python search_session.py --tag "frontend"
    python search_session.py --date "2025-06" --keyword "シフト"
    python search_session.py --keyword "エラー" --status "completed"
    python search_session.py --recent 10
"""

import os
import json
import argparse
import glob
from datetime import datetime, timedelta
import re
import logging

# Setup logging for better error tracking
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Optional fuzzy search support
try:
    from fuzzywuzzy import fuzz, process
    FUZZY_SEARCH_AVAILABLE = True
except ImportError:
    FUZZY_SEARCH_AVAILABLE = False
    logger.warning("fuzzywuzzy not installed. Fuzzy search disabled. Install with: pip install fuzzywuzzy python-Levenshtein")

class SessionSearcher:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.sessions_dir = os.path.join(self.base_dir, "sessions")
        self.metadata_dir = os.path.join(self.sessions_dir, "metadata")

    def search_sessions(self, tags=None, date_filter=None, keyword=None, status=None, session_type=None, recent=None, fuzzy_search=False, fuzzy_threshold=70):
        """セッション検索（ファジー検索対応）"""
        results = []
        corrupted_files = []
        
        # メタデータファイル取得
        metadata_files = glob.glob(os.path.join(self.metadata_dir, "*.json"))
        
        if not metadata_files:
            logger.warning(f"No metadata files found in {self.metadata_dir}")
            return results
        
        logger.info(f"Scanning {len(metadata_files)} metadata files...")
        
        for metadata_file in metadata_files:
            try:
                with open(metadata_file, "r", encoding="utf-8") as f:
                    metadata = json.load(f)
                
                # Validate required fields
                if not self._validate_metadata(metadata):
                    logger.warning(f"Invalid metadata structure: {metadata_file}")
                    continue
                
                # フィルタリング
                if self._matches_filters(metadata, tags, date_filter, keyword, status, session_type, fuzzy_search, fuzzy_threshold):
                    results.append(metadata)
            
            except json.JSONDecodeError as e:
                error_msg = f"JSON decode error in {metadata_file}: {e}"
                logger.error(error_msg)
                corrupted_files.append(metadata_file)
                continue
            except FileNotFoundError as e:
                error_msg = f"File not found: {metadata_file}"
                logger.error(error_msg)
                continue
            except Exception as e:
                error_msg = f"Unexpected error processing {metadata_file}: {e}"
                logger.error(error_msg)
                continue
        
        # Report corrupted files
        if corrupted_files:
            print(f"⚠️ {len(corrupted_files)} corrupted metadata files found:")
            for f in corrupted_files:
                print(f"   - {f}")
            print(f"💡 Consider running recovery: python search_session.py --repair")
        
        # ソート（新しい順）
        results.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        # recent制限
        if recent:
            results = results[:recent]
        
        return results

    def _validate_metadata(self, metadata):
        """メタデータ構造の検証"""
        required_fields = ['session_id', 'session_name', 'timestamp']
        return all(field in metadata for field in required_fields)

    def _matches_filters(self, metadata, tags, date_filter, keyword, status, session_type, fuzzy_search=False, fuzzy_threshold=70):
        """フィルタ条件マッチング（ファジー検索対応）"""
        # タグフィルタ
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",")]
            if not any(tag in metadata.get('tags', []) for tag in tag_list):
                return False
        
        # 日付フィルタ
        if date_filter:
            session_date = metadata.get('timestamp', '')
            if date_filter not in session_date:
                return False
        
        # キーワードフィルタ（ファジー検索対応）
        if keyword:
            search_text = f"{metadata.get('session_name', '')} {metadata.get('summary', '')}".lower()
            keyword_lower = keyword.lower()
            
            if fuzzy_search and FUZZY_SEARCH_AVAILABLE:
                # ファジー検索
                ratio = fuzz.partial_ratio(keyword_lower, search_text)
                if ratio < fuzzy_threshold:
                    return False
            else:
                # 通常の部分文字列検索
                if keyword_lower not in search_text:
                    return False
        
        # ステータスフィルタ
        if status:
            if metadata.get('status') != status:
                return False
        
        # タイプフィルタ
        if session_type:
            if metadata.get('type') != session_type:
                return False
        
        return True

    def display_results(self, results, show_detail=False):
        """検索結果表示"""
        if not results:
            print("🔍 検索結果: 該当するセッションが見つかりませんでした")
            return
        
        print(f"🔍 検索結果: {len(results)}件のセッションが見つかりました\n")
        
        for i, metadata in enumerate(results, 1):
            timestamp = datetime.fromisoformat(metadata['timestamp']).strftime('%Y/%m/%d %H:%M')
            tags = ', '.join(metadata.get('tags', []))
            status_emoji = "✅" if metadata.get('status') == "completed" else "🔄"
            
            print(f"{i:2d}. {status_emoji} {metadata['session_name']}")
            print(f"    📅 {timestamp}")
            print(f"    🏷️  {tags}")
            print(f"    📝 {metadata.get('summary', 'No summary')}")
            
            if show_detail:
                print(f"    📁 {metadata.get('file_path', 'N/A')}")
                print(f"    🆔 {metadata.get('session_id', 'N/A')}")
            
            print()

    def get_session_content(self, session_id):
        """セッション内容取得"""
        metadata_file = os.path.join(self.metadata_dir, f"{session_id}.json")
        
        try:
            with open(metadata_file, "r", encoding="utf-8") as f:
                metadata = json.load(f)
            
            session_file = metadata.get('file_path')
            if session_file and os.path.exists(session_file):
                with open(session_file, "r", encoding="utf-8") as f:
                    return f.read()
            else:
                return "セッションファイルが見つかりません"
        
        except (json.JSONDecodeError, FileNotFoundError):
            return "メタデータファイルが見つかりません"

    def generate_statistics(self, results):
        """統計情報生成"""
        if not results:
            return
        
        print("📊 統計情報")
        print("-" * 40)
        
        # ステータス別集計
        status_count = {}
        type_count = {}
        tag_count = {}
        
        for metadata in results:
            # ステータス集計
            status = metadata.get('status', 'unknown')
            status_count[status] = status_count.get(status, 0) + 1
            
            # タイプ集計
            session_type = metadata.get('type', 'unknown')
            type_count[session_type] = type_count.get(session_type, 0) + 1
            
            # タグ集計
            for tag in metadata.get('tags', []):
                tag_count[tag] = tag_count.get(tag, 0) + 1
        
        print(f"ステータス別: {dict(status_count)}")
        print(f"タイプ別: {dict(type_count)}")
        print(f"よく使われるタグ: {dict(sorted(tag_count.items(), key=lambda x: x[1], reverse=True)[:5])}")
        print()

    def repair_corrupted_files(self):
        """破損したメタデータファイルの修復"""
        print("🔧 破損ファイル修復を開始...")
        metadata_files = glob.glob(os.path.join(self.metadata_dir, "*.json"))
        repaired = 0
        
        for metadata_file in metadata_files:
            try:
                with open(metadata_file, "r", encoding="utf-8") as f:
                    json.load(f)
            except json.JSONDecodeError:
                print(f"🔧 修復中: {metadata_file}")
                backup_path = f"{metadata_file}.backup"
                os.rename(metadata_file, backup_path)
                repaired += 1
        
        print(f"✅ {repaired}個のファイルを修復しました")

def main():
    parser = argparse.ArgumentParser(description="ClaudeHelper Session Searcher for Shift-Care App")
    parser.add_argument("--tag", help="タグで検索（カンマ区切りで複数指定可）")
    parser.add_argument("--date", help="日付で検索（YYYY-MM形式）")
    parser.add_argument("--keyword", help="キーワードで検索")
    parser.add_argument("--fuzzy", action="store_true", help="ファジー検索を有効化")
    parser.add_argument("--fuzzy-threshold", type=int, default=70, help="ファジー検索の閾値（0-100）")
    parser.add_argument("--status", choices=["completed", "in_progress"], help="ステータスで検索")
    parser.add_argument("--type", choices=["regular", "checkpoint", "finalize"], help="セッションタイプで検索")
    parser.add_argument("--recent", type=int, help="最新N件を表示")
    parser.add_argument("--detail", action="store_true", help="詳細情報を表示")
    parser.add_argument("--stats", action="store_true", help="統計情報を表示")
    parser.add_argument("--content", help="指定されたSession IDの内容を表示")
    parser.add_argument("--repair", action="store_true", help="破損したメタデータファイルを修復")
    
    args = parser.parse_args()
    searcher = SessionSearcher()
    
    # 修復モード
    if args.repair:
        searcher.repair_corrupted_files()
        return
    
    # セッション内容表示
    if args.content:
        content = searcher.get_session_content(args.content)
        print(f"📄 Session ID: {args.content}")
        print("=" * 50)
        print(content)
        return
    
    # ファジー検索の警告
    if args.fuzzy and not FUZZY_SEARCH_AVAILABLE:
        print("⚠️ ファジー検索が無効です。依存関係をインストールしてください:")
        print("pip install fuzzywuzzy python-Levenshtein")
        args.fuzzy = False
    
    # 検索実行
    results = searcher.search_sessions(
        tags=args.tag,
        date_filter=args.date,
        keyword=args.keyword,
        status=args.status,
        session_type=args.type,
        recent=args.recent,
        fuzzy_search=args.fuzzy,
        fuzzy_threshold=args.fuzzy_threshold
    )
    
    # 結果表示
    searcher.display_results(results, show_detail=args.detail)
    
    # 統計情報表示
    if args.stats:
        searcher.generate_statistics(results)

if __name__ == "__main__":
    main()