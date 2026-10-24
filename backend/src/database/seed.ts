import { memoryStore } from './store.js';
import { logger } from '../utils/logger.js';

/**
 * Seeds and validates essential system records (roles, default admin, initial hospital inventory)
 */
export async function seedDatabase(): Promise<void> {
  logger.info('Verifying essential database seed records...');

  // Ensure default roles exist
  const requiredRoles = [
    { id: 'role-admin', name: 'ADMIN', description: 'System Administrator' },
    { id: 'role-donor', name: 'DONOR', description: 'Verified Blood Donor' },
    { id: 'role-hospital', name: 'HOSPITAL_STAFF', description: 'Healthcare & Hospital Staff' },
  ];

  for (const r of requiredRoles) {
    if (!memoryStore.roles.some(existing => existing.name === r.name)) {
      memoryStore.roles.push(r);
    }
  }

  // Ensure admin user exists
  if (!memoryStore.users.some(u => u.email === 'admin@bloodconnect.org')) {
    memoryStore.users.push({
      id: 'usr-admin-01',
      email: 'admin@bloodconnect.org',
      phone: '+919876543210',
      fullName: 'System Administrator',
      passwordHash: 'scrypt$a1b2c3d4$mockadminhash',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  logger.info(`Database seeded: ${memoryStore.users.length} users, ${memoryStore.roles.length} roles, ${memoryStore.bloodBanksHospitals.length} healthcare institutions.`);
}
