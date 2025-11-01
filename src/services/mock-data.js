/**
 * Mock data service for UI development
 */

// Mock staff data
export const mockStaff = [
  {
    id: 'STF001',
    name: 'Olaitan Adebayo',
    email: 'olaitan@lg.gov',
    department: 'Administration',
    role: 'Staff',
    status: 'active',
    password: 'password123', // In real app, this would be hashed
  },
  {
    id: 'STF002',
    name: 'Amina Mohammed',
    email: 'amina@lg.gov',
    department: 'Finance',
    role: 'Staff',
    status: 'active',
    password: 'password123',
  },
  {
    id: 'ADM001',
    name: 'Admin User',
    email: 'admin@lg.gov',
    department: 'IT',
    role: 'Admin',
    status: 'active',
    password: 'admin123',
  },
];

// Mock attendance data
export const mockAttendance = [
  {
    id: 'ATT001',
    staffId: 'STF001',
    staffName: 'Olaitan Adebayo',
    date: '2024-01-15',
    checkIn: '08:12 AM',
    checkOut: '05:30 PM',
    status: 'Present',
    isLate: false,
  },
  {
    id: 'ATT002',
    staffId: 'STF001',
    staffName: 'Olaitan Adebayo',
    date: '2024-01-14',
    checkIn: '08:05 AM',
    checkOut: '05:25 PM',
    status: 'Present',
    isLate: false,
  },
  {
    id: 'ATT003',
    staffId: 'STF001',
    staffName: 'Olaitan Adebayo',
    date: '2024-01-13',
    checkIn: '08:45 AM',
    checkOut: '05:20 PM',
    status: 'Present',
    isLate: true,
  },
  {
    id: 'ATT004',
    staffId: 'STF002',
    staffName: 'Amina Mohammed',
    date: '2024-01-15',
    checkIn: '08:00 AM',
    checkOut: '05:00 PM',
    status: 'Present',
    isLate: false,
  },
];

// Mock statistics
export const mockStats = {
  presentDays: 22,
  absences: 3,
  lateness: 2,
  totalWorkingDays: 25,
};

// Mock monthly report
export const mockMonthlyReport = {
  month: 'January 2024',
  totalWorkingDays: 22,
  presentDays: 20,
  absences: 2,
  lateness: 1,
  averageCheckIn: '08:15 AM',
  averageCheckOut: '05:25 PM',
};

// Get current user (mock - would come from auth in real app)
export function getCurrentUser() {
  return {
    id: 'STF001',
    name: 'Olaitan Adebayo',
    email: 'olaitan@lg.gov',
    department: 'Administration',
    role: 'Staff',
  };
}

// Get today's attendance overview (mock)
export function getTodayAttendance() {
  return {
    present: 45,
    absent: 5,
    late: 3,
    total: 50,
    staff: [
      { id: 'STF001', name: 'Olaitan Adebayo', checkIn: '08:12 AM', status: 'Present' },
      { id: 'STF002', name: 'Amina Mohammed', checkIn: '08:00 AM', status: 'Present' },
    ],
  };
}

// Get staff attendance history
export function getStaffAttendance(staffId, filter = 'all') {
  return mockAttendance.filter((att) => att.staffId === staffId);
}

// Get all attendance records
export function getAllAttendance(filters = {}) {
  return mockAttendance;
}

// Get all staff
export function getAllStaff() {
  return mockStaff;
}
