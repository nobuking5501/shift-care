-- Enhanced Supabase Setup for Shift Care Application
-- このファイルはSupabaseの高度な機能を設定します

-- ================================
-- 1. スタッフテーブルの作成
-- ================================

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('staff', 'admin')) DEFAULT 'staff',
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- スタッフテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(is_active) WHERE is_active = true;

-- スタッフテーブルのデモデータ
INSERT INTO staff (id, name, email, role, position, department) VALUES
  ('3', '山田花子（ケアマネジャー）', 'yamada@example.com', 'staff', 'ケアマネジャー', '相談支援'),
  ('admin', '管理者', 'admin@example.com', 'admin', '施設長', '管理部')
ON CONFLICT (id) DO NOTHING;

-- ================================
-- 2. RLS (行レベルセキュリティ) の設定
-- ================================

-- shift_requestsテーブルのRLS有効化
ALTER TABLE shift_requests ENABLE ROW LEVEL SECURITY;

-- スタッフは自分の休日希望のみ閲覧・編集可能
CREATE POLICY "staff_own_requests" ON shift_requests
  FOR ALL USING (auth.uid()::text = staff_id OR current_setting('app.current_user_role', true) = 'admin');

-- generated_shiftsテーブルのRLS有効化
ALTER TABLE generated_shifts ENABLE ROW LEVEL SECURITY;

-- スタッフは自分のシフトのみ閲覧可能、管理者は全て閲覧可能
CREATE POLICY "staff_own_shifts" ON generated_shifts
  FOR SELECT USING (auth.uid()::text = user_id OR current_setting('app.current_user_role', true) = 'admin');

-- 管理者のみシフト作成・更新可能
CREATE POLICY "admin_manage_shifts" ON generated_shifts
  FOR ALL USING (current_setting('app.current_user_role', true) = 'admin');

-- staffテーブルのRLS有効化
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが有効なスタッフ情報を閲覧可能
CREATE POLICY "view_active_staff" ON staff
  FOR SELECT USING (is_active = true);

-- 管理者のみスタッフ情報を管理可能
CREATE POLICY "admin_manage_staff" ON staff
  FOR ALL USING (current_setting('app.current_user_role', true) = 'admin');

-- ================================
-- 3. 自動更新トリガーの設定
-- ================================

-- updated_at自動更新用のトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

-- shift_requestsテーブルのupdated_atトリガー
DROP TRIGGER IF EXISTS update_shift_requests_updated_at ON shift_requests;
CREATE TRIGGER update_shift_requests_updated_at
  BEFORE UPDATE ON shift_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- staffテーブルのupdated_atトリガー
DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 4. リアルタイム機能の有効化
-- ================================

-- テーブルのリアルタイム機能を有効化
ALTER publication supabase_realtime ADD TABLE shift_requests;
ALTER publication supabase_realtime ADD TABLE generated_shifts;
ALTER publication supabase_realtime ADD TABLE staff;

-- ================================
-- 5. 通知テーブルの作成
-- ================================

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('shift_update', 'request_approved', 'request_rejected', 'new_shift', 'info')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 通知テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read, created_at DESC);

-- 通知テーブルのRLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の通知のみ閲覧・更新可能
CREATE POLICY "own_notifications" ON notifications
  FOR ALL USING (auth.uid()::text = user_id);

-- ================================
-- 6. 自動通知トリガーの設定
-- ================================

-- シフト変更時の自動通知関数
CREATE OR REPLACE FUNCTION notify_shift_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- シフト作成時の通知
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.user_id,
      'new_shift',
      '新しいシフトが作成されました',
      NEW.date::date || ' ' || NEW.shift_type || 'のシフトが追加されました',
      jsonb_build_object('shift', row_to_json(NEW))
    );
    RETURN NEW;
  END IF;

  -- シフト更新時の通知
  IF TG_OP = 'UPDATE' AND (OLD.shift_type != NEW.shift_type OR OLD.start_time != NEW.start_time) THEN
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.user_id,
      'shift_update',
      'シフト変更通知',
      NEW.date::date || 'のシフトが変更されました',
      jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
    );
    RETURN NEW;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ language plpgsql;

-- generated_shiftsテーブルに通知トリガーを追加
DROP TRIGGER IF EXISTS notify_shift_changes_trigger ON generated_shifts;
CREATE TRIGGER notify_shift_changes_trigger
  AFTER INSERT OR UPDATE ON generated_shifts
  FOR EACH ROW EXECUTE FUNCTION notify_shift_changes();

-- 休日希望承認/却下時の自動通知関数
CREATE OR REPLACE FUNCTION notify_request_status_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- ステータス変更時の通知（pending以外）
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status != 'pending' THEN
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.staff_id,
      CASE
        WHEN NEW.status = 'approved' THEN 'request_approved'
        ELSE 'request_rejected'
      END,
      CASE
        WHEN NEW.status = 'approved' THEN '休日希望が承認されました'
        ELSE '休日希望が却下されました'
      END,
      NEW.target_month || 'の休日希望が' ||
      CASE
        WHEN NEW.status = 'approved' THEN '承認'
        ELSE '却下'
      END || 'されました',
      jsonb_build_object('request', row_to_json(NEW))
    );
    RETURN NEW;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ language plpgsql;

-- shift_requestsテーブルに通知トリガーを追加
DROP TRIGGER IF EXISTS notify_request_status_changes_trigger ON shift_requests;
CREATE TRIGGER notify_request_status_changes_trigger
  AFTER UPDATE ON shift_requests
  FOR EACH ROW EXECUTE FUNCTION notify_request_status_changes();

-- ================================
-- 7. データクリーンアップ関数
-- ================================

-- 古い通知を削除する関数（30日以上前）
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ language plpgsql;

-- ================================
-- 8. 統計・分析用ビューの作成
-- ================================

-- シフトサマリービュー
CREATE OR REPLACE VIEW shift_summary AS
SELECT
  target_month,
  COUNT(*) as total_shifts,
  COUNT(CASE WHEN is_confirmed THEN 1 END) as confirmed_shifts,
  COUNT(DISTINCT user_id) as active_staff,
  COUNT(CASE WHEN shift_type = 'day' THEN 1 END) as day_shifts,
  COUNT(CASE WHEN shift_type = 'night' THEN 1 END) as night_shifts,
  COUNT(CASE WHEN shift_type = 'early' THEN 1 END) as early_shifts,
  COUNT(CASE WHEN shift_type = 'late' THEN 1 END) as late_shifts
FROM generated_shifts
GROUP BY target_month
ORDER BY target_month DESC;

-- 休日希望サマリービュー
CREATE OR REPLACE VIEW request_summary AS
SELECT
  target_month,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
  COUNT(DISTINCT staff_id) as requesting_staff
FROM shift_requests
GROUP BY target_month
ORDER BY target_month DESC;

-- ================================
-- 9. セキュリティ関数
-- ================================

-- 現在のユーザーロールを設定する関数
CREATE OR REPLACE FUNCTION set_current_user_role(user_role text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_role', user_role, true);
END;
$$ language plpgsql SECURITY DEFINER;

-- ================================
-- 完了メッセージ
-- ================================

DO $$
BEGIN
  RAISE NOTICE 'Supabase enhanced setup completed successfully!';
  RAISE NOTICE '- Staff table created with RLS policies';
  RAISE NOTICE '- Notification system implemented';
  RAISE NOTICE '- Real-time triggers configured';
  RAISE NOTICE '- Security policies applied';
  RAISE NOTICE '- Analytics views created';
END $$;