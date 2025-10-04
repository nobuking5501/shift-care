-- Create holiday_requests table
CREATE TABLE IF NOT EXISTS holiday_requests (
    id SERIAL PRIMARY KEY,
    staff_name TEXT NOT NULL,
    staff_user_id TEXT NOT NULL,
    requested_dates TEXT[] NOT NULL,
    reason TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    target_month TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_shifts table
CREATE TABLE IF NOT EXISTS generated_shifts (
    id SERIAL PRIMARY KEY,
    shift_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    staff_name TEXT NOT NULL,
    date DATE NOT NULL,
    shift_type TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_confirmed BOOLEAN DEFAULT true,
    target_month TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_holiday_requests_staff_user_id ON holiday_requests(staff_user_id);
CREATE INDEX IF NOT EXISTS idx_holiday_requests_target_month ON holiday_requests(target_month);
CREATE INDEX IF NOT EXISTS idx_holiday_requests_status ON holiday_requests(status);
CREATE INDEX IF NOT EXISTS idx_generated_shifts_user_id ON generated_shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_shifts_date ON generated_shifts(date);
CREATE INDEX IF NOT EXISTS idx_generated_shifts_target_month ON generated_shifts(target_month);

-- Enable Row Level Security (RLS)
ALTER TABLE holiday_requests ENABLE ROW LEVEL SECURITY;
-- TEMPORARY: Disable RLS for debugging (enable in production)
-- ALTER TABLE generated_shifts ENABLE ROW LEVEL SECURITY;

-- Create policies for holiday_requests
-- Allow users to read their own requests and admins to read all
CREATE POLICY "Users can view own holiday requests" ON holiday_requests
    FOR SELECT USING (auth.uid()::text = staff_user_id OR auth.jwt() ->> 'role' = 'admin');

-- Allow users to insert their own requests
CREATE POLICY "Users can insert own holiday requests" ON holiday_requests
    FOR INSERT WITH CHECK (auth.uid()::text = staff_user_id);

-- Allow users to update their own pending requests and admins to update all
CREATE POLICY "Users can update own pending requests, admins can update all" ON holiday_requests
    FOR UPDATE USING (
        (auth.uid()::text = staff_user_id AND status = 'pending') OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- Create policies for generated_shifts
-- TEMPORARY: Allow all operations for debugging (remove in production)
CREATE POLICY "Allow all for debugging" ON generated_shifts
    FOR ALL USING (true);

-- Allow all authenticated users to read shifts
-- CREATE POLICY "Authenticated users can view shifts" ON generated_shifts
--     FOR SELECT TO authenticated USING (true);

-- Only admins can insert/update/delete shifts
-- CREATE POLICY "Only admins can manage shifts" ON generated_shifts
--     FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_holiday_requests_updated_at
    BEFORE UPDATE ON holiday_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional)
INSERT INTO holiday_requests (staff_name, staff_user_id, requested_dates, reason, priority, status, target_month, submitted_at) VALUES
('山田花子（ケアマネジャー）', 'demo-staff', ARRAY['2025-09-15', '2025-09-22'], 'リフレッシュのため', 'medium', 'pending', '2025-09', NOW() - INTERVAL '1 day'),
('佐藤太郎', 'demo-staff-2', ARRAY['2025-09-18', '2025-09-25'], '家族の用事', 'high', 'pending', '2025-09', NOW() - INTERVAL '2 days'),
('高橋美咲', 'demo-staff-3', ARRAY['2025-09-20'], '通院のため', 'high', 'approved', '2025-09', NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;