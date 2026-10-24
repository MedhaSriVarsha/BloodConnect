export interface MemoryStoreData {
  users: any[];
  userRoles: any[];
  roles: any[];
  contactVerifications: any[];
  otpChallenges: any[];
  sessions: any[];
  donorProfiles: any[];
  bloodRequests: any[];
  donations: any[];
  eligibilityAssessments: any[];
  referrals: any[];
  bloodBanksHospitals: any[];
  notifications: any[];
  auditLogs: any[];
  adminActions: any[];
  trustedCircles: any[];
  trustedCircleMembers: any[];
  circleEmergencies: any[];
  donorAvailabilities: any[];
}

export const memoryStore: MemoryStoreData = {
  users: [
    {
      id: 'usr-admin-01',
      email: 'admin@bloodconnect.org',
      phone: '+919876543210',
      fullName: 'System Administrator',
      passwordHash: 'scrypt$a1b2c3d4$mockadminhash',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    },
    {
      id: 'usr-donor-01',
      email: 'rahul.sharma@example.com',
      phone: '+919811223344',
      fullName: 'Rahul Sharma',
      passwordHash: 'scrypt$b2c3d4e5$mockdonorhash',
      status: 'ACTIVE',
      createdAt: new Date('2026-02-15T00:00:00Z'),
      updatedAt: new Date('2026-02-15T00:00:00Z'),
    },
    {
      id: 'usr-donor-02',
      email: 'priya.patel@example.com',
      phone: '+919822334455',
      fullName: 'Dr. Priya Patel',
      passwordHash: 'scrypt$c3d4e5f6$mockdonorhash',
      status: 'ACTIVE',
      createdAt: new Date('2026-03-10T00:00:00Z'),
      updatedAt: new Date('2026-03-10T00:00:00Z'),
    }
  ],
  userRoles: [
    { id: 'ur-1', userId: 'usr-admin-01', roleId: 'role-admin' },
    { id: 'ur-2', userId: 'usr-donor-01', roleId: 'role-donor' },
    { id: 'ur-3', userId: 'usr-donor-02', roleId: 'role-donor' },
  ],
  roles: [
    { id: 'role-admin', name: 'ADMIN', description: 'System Administrator with privileged access' },
    { id: 'role-donor', name: 'DONOR', description: 'Verified Blood Donor' },
    { id: 'role-hospital', name: 'HOSPITAL_STAFF', description: 'Hospital / Blood Bank Staff' },
  ],
  contactVerifications: [
    { id: 'cv-1', userId: 'usr-admin-01', channel: 'EMAIL', destination: 'admin@bloodconnect.org', isVerified: true, verifiedAt: new Date() },
    { id: 'cv-2', userId: 'usr-admin-01', channel: 'PHONE', destination: '+919876543210', isVerified: true, verifiedAt: new Date() },
    { id: 'cv-3', userId: 'usr-donor-01', channel: 'EMAIL', destination: 'rahul.sharma@example.com', isVerified: true, verifiedAt: new Date() },
    { id: 'cv-4', userId: 'usr-donor-01', channel: 'PHONE', destination: '+919811223344', isVerified: true, verifiedAt: new Date() },
    { id: 'cv-5', userId: 'usr-donor-02', channel: 'EMAIL', destination: 'priya.patel@example.com', isVerified: true, verifiedAt: new Date() },
    { id: 'cv-6', userId: 'usr-donor-02', channel: 'PHONE', destination: '+919822334455', isVerified: true, verifiedAt: new Date() },
  ],
  otpChallenges: [],
  sessions: [],
  donorProfiles: [
    {
      id: 'dp-01',
      userId: 'usr-donor-01',
      bloodGroup: 'O_POSITIVE',
      dateOfBirth: new Date('1994-06-15'),
      gender: 'Male',
      address: '42 MG Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      latitude: 12.9784,
      longitude: 77.6408,
      isAvailable: true,
      consentToContact: true,
      lastDonationDate: new Date('2026-05-10'),
      totalDonationsCount: 6,
      badgeLevel: 'SILVER',
      createdAt: new Date('2026-02-15'),
      updatedAt: new Date('2026-05-10'),
    },
    {
      id: 'dp-02',
      userId: 'usr-donor-02',
      bloodGroup: 'AB_NEGATIVE',
      dateOfBirth: new Date('1991-09-22'),
      gender: 'Female',
      address: '77 Residency Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560025',
      latitude: 12.9698,
      longitude: 77.6015,
      isAvailable: true,
      consentToContact: true,
      lastDonationDate: new Date('2026-01-20'),
      totalDonationsCount: 12,
      badgeLevel: 'GOLD',
      createdAt: new Date('2026-03-10'),
      updatedAt: new Date('2026-01-20'),
    }
  ],
  bloodRequests: [
    {
      id: 'req-01',
      requesterId: 'usr-admin-01',
      patientName: 'Aarav Mehta',
      bloodGroup: 'O_POSITIVE',
      unitsNeeded: 3,
      fulfilledUnits: 1,
      urgency: 'CRITICAL',
      status: 'OPEN',
      hospitalName: 'Manipal Hospital, HAL Airport Rd',
      hospitalAddress: '98 HAL Old Airport Rd, Kodihalli',
      city: 'Bengaluru',
      latitude: 12.9592,
      longitude: 77.6534,
      contactNumber: '+919876500001',
      requiredBefore: new Date(Date.now() + 12 * 60 * 60 * 1000),
      notes: 'Emergency cardiac surgery scheduled. Immediate blood match requested.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'req-02',
      requesterId: 'usr-donor-01',
      patientName: 'Sunita Reddy',
      bloodGroup: 'B_NEGATIVE',
      unitsNeeded: 2,
      fulfilledUnits: 0,
      urgency: 'URGENT',
      status: 'OPEN',
      hospitalName: 'Apollo Hospitals, Bannerghatta',
      hospitalAddress: '154/11 Bannerghatta Main Rd',
      city: 'Bengaluru',
      latitude: 12.8953,
      longitude: 77.5983,
      contactNumber: '+919876500002',
      requiredBefore: new Date(Date.now() + 24 * 60 * 60 * 1000),
      notes: 'Platelet transfusion required for dengue complications.',
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(),
    },
    {
      id: 'req-03',
      requesterId: 'usr-admin-01',
      patientName: 'Vikram Joshi',
      bloodGroup: 'A_POSITIVE',
      unitsNeeded: 2,
      fulfilledUnits: 2,
      urgency: 'NORMAL',
      status: 'FULFILLED',
      hospitalName: 'Fortis Hospital, Cunningham Rd',
      hospitalAddress: '14 Cunningham Rd, Vasanth Nagar',
      city: 'Bengaluru',
      latitude: 12.9866,
      longitude: 77.5991,
      contactNumber: '+919876500003',
      requiredBefore: new Date(Date.now() - 48 * 60 * 60 * 1000),
      notes: 'Elective orthopedic surgery.',
      createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    }
  ],
  donations: [
    {
      id: 'don-01',
      donorId: 'usr-donor-01',
      bloodRequestId: 'req-03',
      hospitalName: 'Fortis Hospital, Cunningham Rd',
      donationDate: new Date('2026-05-10T11:00:00Z'),
      unitsDonated: 1,
      bloodGroup: 'O_POSITIVE',
      status: 'COMPLETED',
      certificateNumber: 'BC-CERT-2026-O821',
      notes: 'Whole blood donation. Vitals normal. Donor felt great.',
      createdAt: new Date('2026-05-10T11:30:00Z'),
    },
    {
      id: 'don-02',
      donorId: 'usr-donor-02',
      bloodRequestId: null,
      hospitalName: 'Red Cross Blood Center, Bengaluru',
      donationDate: new Date('2026-01-20T14:30:00Z'),
      unitsDonated: 1,
      bloodGroup: 'AB_NEGATIVE',
      status: 'COMPLETED',
      certificateNumber: 'BC-CERT-2026-AB74',
      notes: 'Voluntary plasma donation.',
      createdAt: new Date('2026-01-20T15:00:00Z'),
    }
  ],
  eligibilityAssessments: [
    {
      id: 'el-01',
      userId: 'usr-donor-01',
      weightKg: 72,
      age: 32,
      hemoglobin: 14.8,
      lastDonationDate: new Date('2026-05-10'),
      hasTattooLast6Months: false,
      hasRecentTravelSurgery: false,
      isMedicallyFit: true,
      isEligible: true,
      ineligibilityReason: null,
      nextEligibleDate: new Date('2026-08-10'),
      assessedAt: new Date('2026-05-10'),
    }
  ],
  referrals: [
    {
      id: 'ref-01',
      referrerUserId: 'usr-donor-01',
      referralCode: 'BC-HERO99',
      referredUserId: 'usr-donor-02',
      rewardPoints: 100,
      createdAt: new Date('2026-03-10'),
    }
  ],
  bloodBanksHospitals: [
    {
      id: 'inst-01',
      name: 'Rotary TTK Blood Bank',
      type: 'BLOOD_BANK',
      address: 'New Thippasandra Main Rd, HAL 3rd Stage',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560075',
      latitude: 12.9698,
      longitude: 77.6582,
      phone: '+918025282345',
      email: 'contact@rotaryttkbloodbank.org',
      verificationStatus: 'VERIFIED',
      operatingHours: '24 Hours Open',
      availableInventory: {
        'O_POSITIVE': 14,
        'O_NEGATIVE': 3,
        'A_POSITIVE': 8,
        'A_NEGATIVE': 2,
        'B_POSITIVE': 11,
        'B_NEGATIVE': 4,
        'AB_POSITIVE': 5,
        'AB_NEGATIVE': 1
      }
    },
    {
      id: 'inst-02',
      name: 'St. John’s Medical College Hospital Blood Bank',
      type: 'HOSPITAL',
      address: 'Sarjapur Main Road, John Nagar, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560034',
      latitude: 12.9312,
      longitude: 77.6212,
      phone: '+918022065000',
      email: 'bloodbank@stjohns.in',
      verificationStatus: 'VERIFIED',
      operatingHours: '24x7 Emergency Transfusion Services',
      availableInventory: {
        'O_POSITIVE': 22,
        'O_NEGATIVE': 5,
        'A_POSITIVE': 16,
        'A_NEGATIVE': 6,
        'B_POSITIVE': 19,
        'B_NEGATIVE': 4,
        'AB_POSITIVE': 7,
        'AB_NEGATIVE': 2
      }
    },
    {
      id: 'inst-03',
      name: 'Narayana Hrudayalaya Blood Center',
      type: 'HOSPITAL',
      address: '258/A Bommasandra Industrial Area, Anekal Taluk',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560099',
      latitude: 12.8123,
      longitude: 77.6921,
      phone: '+918071222222',
      email: 'transfusion@narayanahealth.org',
      verificationStatus: 'VERIFIED',
      operatingHours: '24x7 Emergency Services',
      availableInventory: {
        'O_POSITIVE': 30,
        'O_NEGATIVE': 8,
        'A_POSITIVE': 25,
        'A_NEGATIVE': 5,
        'B_POSITIVE': 28,
        'B_NEGATIVE': 6,
        'AB_POSITIVE': 10,
        'AB_NEGATIVE': 3
      }
    }
  ],
  notifications: [
    {
      id: 'notif-01',
      userId: 'usr-donor-01',
      type: 'BLOOD_MATCH',
      title: 'Emergency Blood Match nearby!',
      body: 'Urgent O+ blood needed at Manipal Hospital for patient Aarav Mehta (3 units).',
      readAt: null,
      createdAt: new Date(),
    }
  ],
  auditLogs: [
    {
      id: 'aud-01',
      actorId: 'usr-admin-01',
      action: 'SYSTEM_STARTUP',
      resourceType: 'SYSTEM',
      resourceId: null,
      details: { message: 'BloodConnect backend initialized successfully' },
      ipAddress: '127.0.0.1',
      createdAt: new Date(),
    }
  ],
  adminActions: [],
  trustedCircles: [
    {
      id: 'tc-01',
      ownerId: 'usr-donor-01',
      circleCode: 'BC-TC-7K9P2',
      name: "Rahul's Family & Friends Circle",
      status: 'ACTIVE',
      createdAt: new Date('2026-03-01T00:00:00Z'),
      updatedAt: new Date('2026-03-01T00:00:00Z'),
    }
  ],
  trustedCircleMembers: [
    {
      id: 'tcm-01',
      circleId: 'tc-01',
      memberUserId: 'usr-donor-02',
      relationship: 'Close Colleague',
      status: 'ACCEPTED',
      consentTimestamp: new Date('2026-03-02T10:00:00Z'),
      consentToContact: true,
    },
    {
      id: 'tcm-02',
      circleId: 'tc-01',
      memberUserId: 'usr-admin-01',
      relationship: 'Family Physician',
      status: 'ACCEPTED',
      consentTimestamp: new Date('2026-03-02T11:00:00Z'),
      consentToContact: true,
    }
  ],
  circleEmergencies: [],
  donorAvailabilities: [
    {
      id: 'da-01',
      userId: 'usr-donor-01',
      isOptedIn: true,
      lastConfirmedAt: new Date(),
      availabilityNote: 'Available 24x7 for Indiranagar / HAL Area',
    },
    {
      id: 'da-02',
      userId: 'usr-donor-02',
      isOptedIn: true,
      lastConfirmedAt: new Date(),
      availabilityNote: 'Ready within 30 mins notice',
    }
  ]
};
