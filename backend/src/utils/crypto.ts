import crypto from 'crypto';

const HMAC_SECRET = process.env.HMAC_OTP_SECRET || 'bloodconnect_super_secret_hmac_key_prod_grade_32b!';

/**
 * Keyed HMAC computation for OTP storage
 * Uses HMAC-SHA256 with server-side protected secret
 */
export function computeOtpHmac(destination: string, otp: string, purpose: string): string {
  const payload = `${destination.toLowerCase().trim()}:${otp.trim()}:${purpose}`;
  return crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');
}

/**
 * Constant-time comparison to prevent timing attacks
 */
export function verifyOtpHmac(destination: string, candidateOtp: string, purpose: string, storedHmac: string): boolean {
  const candidateHmac = computeOtpHmac(destination, candidateOtp, purpose);
  try {
    return crypto.timingSafeEqual(Buffer.from(candidateHmac, 'hex'), Buffer.from(storedHmac, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Generate cryptographically secure numeric OTP (6 digits)
 */
export function generateNumericOtp(digits: number = 6): string {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return crypto.randomInt(min, max + 1).toString();
}

/**
 * Password Hashing with scrypt and unique random salt (constant time verification)
 * Format: scrypt$N=16384,r=8,p=1$salt$derivedKey
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt$${salt}$${derivedKey.toString('hex')}`);
    });
  });
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const parts = storedHash.split('$');
      if (parts.length !== 3 || parts[0] !== 'scrypt') {
        return resolve(false);
      }
      const salt = parts[1];
      const originalKey = Buffer.from(parts[2], 'hex');
      crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
        if (err) return resolve(false);
        resolve(crypto.timingSafeEqual(originalKey, derivedKey));
      });
    } catch {
      resolve(false);
    }
  });
}

/**
 * Generates an 8-character unique referral code
 */
export function generateReferralCode(prefix: string = 'BC'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `${prefix}-${code}`;
}

/**
 * Generates official verifiable donation certificate ID
 */
export function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `BC-CERT-${year}-${randomHex}`;
}

/**
 * Generates a unique, unpredictable Emergency Access Code for Trusted Circles
 * Format: BC-TC-XXXXX (e.g. BC-TC-7K9P2)
 */
export function generateCircleCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  const bytes = crypto.randomBytes(5);
  for (let i = 0; i < 5; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `BC-TC-${code}`;
}
