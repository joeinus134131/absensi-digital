import { db } from './database.js';

export function runSeed() {
  console.log('Seeding database WajibAbsen Enterprise...');
  db.clearAll();

  // 1. Company
  const company = db.insert('companies', {
    id: 'comp_01',
    name: 'PT WajibAbsen Teknologi Nusantara',
    code: 'WAN-HQ',
    industry: 'Enterprise Software & Cloud SaaS',
    address: 'Sudirman Central Business District (SCBD) Tower 3, Lt. 15, Jakarta Selatan'
  });

  // 2. Branches
  const branchHQ = db.insert('branches', {
    id: 'branch_hq',
    company_id: 'comp_01',
    name: 'HQ Sudirman Tower Jakarta',
    code: 'JKT-HQ',
    latitude: -6.225012,
    longitude: 106.806034,
    radius_meters: 100,
    bssid_whitelist: '00:1A:2B:3C:4D:5E',
    timezone: 'Asia/Jakarta'
  });

  const branchBekasi = db.insert('branches', {
    id: 'branch_bks',
    company_id: 'comp_01',
    name: 'Logistics & Tech Hub Bekasi',
    code: 'BKS-HUB',
    latitude: -6.248612,
    longitude: 106.992415,
    radius_meters: 150,
    bssid_whitelist: '00:2B:3C:4D:5E:6F',
    timezone: 'Asia/Jakarta'
  });

  // 3. QR Stations
  db.insert('qr_stations', {
    id: 'station_hq_01',
    branch_id: 'branch_hq',
    station_name: 'Lobby Kiosk Lt. 15 HQ',
    station_code: 'KIOSK-JKT-01',
    location_note: 'Pintu Utama SCBD Tower 3',
    active_secret: 'WAJIB_ABSEN_TOTP_SECRET_HQ_2026'
  });

  db.insert('qr_stations', {
    id: 'station_bks_01',
    branch_id: 'branch_bks',
    station_name: 'Kiosk Gerbang Masuk Bekasi',
    station_code: 'KIOSK-BKS-01',
    location_note: 'Pos Keamanan & Lobi Gudang',
    active_secret: 'WAJIB_ABSEN_TOTP_SECRET_BKS_2026'
  });

  // 4. Shifts
  const shiftRegular = db.insert('shifts', {
    id: 'shift_reg_01',
    branch_id: 'branch_hq',
    name: 'Regular Pagi (08:00 - 17:00)',
    start_time: '08:00',
    end_time: '17:00',
    grace_period_minutes: 15,
    is_overnight: false,
    flexible_hours: false
  });

  const shiftFlexi = db.insert('shifts', {
    id: 'shift_flex_01',
    branch_id: 'branch_hq',
    name: 'Flexi Engineering (09:00 - 18:00)',
    start_time: '09:00',
    end_time: '18:00',
    grace_period_minutes: 20,
    is_overnight: false,
    flexible_hours: true
  });

  // 5. Users (5 Roles based on BRD ACL Matrix)
  const usersData = [
    {
      id: 'usr_superadmin',
      nik: 'SA-0001',
      full_name: 'Aditya Wiratama (Super Admin)',
      email: 'superadmin@wajibabsen.id',
      password: 'password123',
      role: 'SUPER_ADMIN',
      department: 'Platform Architecture',
      position: 'Chief Architect / SaaS Admin',
      branch_id: 'branch_hq',
      shift_id: 'shift_reg_01',
      device_fingerprint: 'DEV_MAC_SA_001',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_hradmin',
      nik: 'HR-0102',
      full_name: 'Clarissa Maharani (HR Admin)',
      email: 'hr@wajibabsen.id',
      password: 'password123',
      role: 'HR_ADMIN',
      department: 'Human Capital & People Ops',
      position: 'VP of Human Resources',
      branch_id: 'branch_hq',
      shift_id: 'shift_reg_01',
      device_fingerprint: 'DEV_IPHONE_HR_002',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_manager',
      nik: 'MGR-0201',
      full_name: 'Bramantyo Kusuma (Manager)',
      email: 'manager@wajibabsen.id',
      password: 'password123',
      role: 'MANAGER',
      department: 'Product & Engineering',
      position: 'Engineering Manager',
      branch_id: 'branch_hq',
      shift_id: 'shift_flex_01',
      device_fingerprint: 'DEV_MAC_MGR_003',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_karyawan',
      nik: 'EMP-0301',
      full_name: 'Rayhan Putra Pratama (Staff)',
      email: 'karyawan@wajibabsen.id',
      password: 'password123',
      role: 'EMPLOYEE',
      department: 'Product & Engineering',
      position: 'Senior Frontend Engineer',
      branch_id: 'branch_hq',
      shift_id: 'shift_flex_01',
      device_fingerprint: 'DEV_ANDROID_EMP_004',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_payroll',
      nik: 'FIN-0401',
      full_name: 'Nadia Salsabila (Payroll Auditor)',
      email: 'payroll@wajibabsen.id',
      password: 'password123',
      role: 'PAYROLL_AUDITOR',
      department: 'Finance & Accounting',
      position: 'Payroll Lead Specialist',
      branch_id: 'branch_hq',
      shift_id: 'shift_reg_01',
      device_fingerprint: 'DEV_MAC_FIN_005',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    },
    // Extra Employees for realistic Team & HR Reports
    {
      id: 'usr_emp_2',
      nik: 'EMP-0302',
      full_name: 'Gita Saraswati',
      email: 'gita@wajibabsen.id',
      password: 'password123',
      role: 'EMPLOYEE',
      department: 'Product & Engineering',
      position: 'UI/UX Designer',
      branch_id: 'branch_hq',
      shift_id: 'shift_reg_01',
      device_fingerprint: 'DEV_IPHONE_EMP_006',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_emp_3',
      nik: 'EMP-0303',
      full_name: 'Dimas Anggara',
      email: 'dimas@wajibabsen.id',
      password: 'password123',
      role: 'EMPLOYEE',
      department: 'Logistics & Operations',
      position: 'Operations Supervisor',
      branch_id: 'branch_bks',
      shift_id: 'shift_reg_01',
      device_fingerprint: 'DEV_ANDROID_EMP_007',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80'
    }
  ];

  usersData.forEach(u => db.insert('users', u));

  // 6. Attendance Logs (Past 7 Days & Today)
  const today = new Date().toISOString().split('T')[0];
  db.insert('attendance_logs', {
    id: 'att_today_01',
    user_id: 'usr_karyawan',
    branch_id: 'branch_hq',
    shift_id: 'shift_flex_01',
    date: today,
    check_in_time: `${today}T08:52:10Z`,
    check_out_time: null,
    check_in_method: 'DYNAMIC_QR_KIOSK',
    latitude: -6.225010,
    longitude: 106.806030,
    distance_meters: 12,
    trust_score: 98,
    flags: ['VERIFIED_GPS', 'VERIFIED_TOTP_QR'],
    is_late: false,
    late_minutes: 0,
    is_early_leave: false,
    status: 'CHECKED_IN'
  });

  db.insert('attendance_logs', {
    id: 'att_today_02',
    user_id: 'usr_emp_2',
    branch_id: 'branch_hq',
    shift_id: 'shift_reg_01',
    date: today,
    check_in_time: `${today}T08:18:40Z`,
    check_out_time: null,
    check_in_method: 'GEOLOCATION_GPS',
    latitude: -6.225025,
    longitude: 106.806040,
    distance_meters: 18,
    trust_score: 94,
    flags: ['VERIFIED_GPS', 'LATE_WITHIN_GRACE'],
    is_late: true,
    late_minutes: 18,
    is_early_leave: false,
    status: 'CHECKED_IN'
  });

  db.insert('attendance_logs', {
    id: 'att_yesterday_01',
    user_id: 'usr_karyawan',
    branch_id: 'branch_hq',
    shift_id: 'shift_flex_01',
    date: '2026-07-13',
    check_in_time: '2026-07-13T08:45:00Z',
    check_out_time: '2026-07-13T17:55:00Z',
    check_in_method: 'DYNAMIC_QR_KIOSK',
    latitude: -6.225010,
    longitude: 106.806030,
    distance_meters: 10,
    trust_score: 99,
    flags: ['VERIFIED_GPS', 'VERIFIED_TOTP_QR'],
    is_late: false,
    late_minutes: 0,
    is_early_leave: false,
    status: 'COMPLETED'
  });

  // 7. Leave & Overtime Requests
  db.insert('leave_requests', {
    id: 'req_001',
    user_id: 'usr_karyawan',
    type: 'CUTI_TAHUNAN',
    start_date: '2026-07-20',
    end_date: '2026-07-22',
    reason: 'Acara pernikahan keluarga kandung di Bandung',
    status: 'PENDING_MANAGER',
    created_at: new Date().toISOString()
  });

  db.insert('leave_requests', {
    id: 'req_002',
    user_id: 'usr_emp_2',
    type: 'LEMBUR_PROYEK',
    start_date: '2026-07-14',
    end_date: '2026-07-14',
    reason: 'Persiapan Rilis Produk WajibAbsen V1 Enterprise',
    status: 'PENDING_MANAGER',
    created_at: new Date().toISOString()
  });

  console.log('Database seeded successfully with 5 Roles, Branches, QR Stations, and Attendance Records!');
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed();
}
