-- Create ENUM types for role and status
CREATE TYPE user_role AS ENUM ('Admin', 'Staff');
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE attendance_status AS ENUM ('Present', 'Absent', 'Partial');

