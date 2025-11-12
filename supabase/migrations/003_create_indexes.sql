-- Indexes for performance optimization

-- Staff table indexes
CREATE INDEX idx_staff_staff_id ON staff(staff_id);
CREATE INDEX idx_staff_auth_user_id ON staff(auth_user_id);
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_status ON staff(status);
CREATE INDEX idx_staff_role ON staff(role);
CREATE INDEX idx_staff_department ON staff(department);

-- Attendance table indexes
CREATE INDEX idx_attendance_staff_id ON attendance(staff_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_staff_date ON attendance(staff_id, date);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_attendance_check_in_time ON attendance(check_in_time);

-- Settings table indexes
CREATE INDEX idx_settings_key ON settings(key);

-- Reports table indexes
CREATE INDEX idx_reports_staff_id ON reports(staff_id);
CREATE INDEX idx_reports_month ON reports(month);
CREATE INDEX idx_reports_type ON reports(report_type);

