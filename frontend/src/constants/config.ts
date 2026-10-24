import type { AppMode } from '../types/api';

const envMode = import.meta.env.VITE_APP_MODE;
const validatedMode: AppMode = envMode === 'api' ? 'api' : 'demo';

export const appConfig = {
  name: 'BloodBridge',
  tagline: 'Be a Donor. Be a Savior.',
  mode: validatedMode,
  isDemo: validatedMode === 'demo',
  isApi: validatedMode === 'api',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  version: '1.0.0-prod',
  defaultPageSize: 10,
  requestTimeoutMs: 15000,
  supportHelpline: '+1 (800) 555-BLOOD',
  emergencyUrgentLine: '+1 (800) 999-URGENT',
  supportEmail: 'support@bloodbridge.org',
  currentPolicyVersion: 'v2.4-2026',
};
