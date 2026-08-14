/**
 * Comprehensive Security Engine & Defense-in-Depth Controls
 * Ministry Cooperative Contributory Fund
 */

export interface UserSession {
  sessionId: string;
  userId: string;
  userRole: string;
  ipAddress: string;
  userAgent: string;
  createdAt: number;
  lastActivityAt: number;
  expiresAt: number;
  isTwoFactorVerified: boolean;
  isValid: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTimeMs: number;
  lockoutRemainingMs?: number;
}

export class SecurityEngine {
  private static activeSessions = new Map<string, UserSession>();
  private static rateLimitBuckets = new Map<string, { count: number; windowStart: number; lockedUntil?: number }>();
  private static SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes inactivity timeout
  private static MAX_SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000; // 8 hours absolute max

  /**
   * 1. Secure Password Strength & Complexity Validator
   */
  public static validatePasswordStrength(password: string): { isValid: boolean; score: number; errors: string[] } {
    const errors: string[] = [];
    let score = 0;

    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long.');
    } else {
      score += 1;
    }

    if (/[A-Z]/.test(password)) score += 1;
    else errors.push('Password must contain at least one uppercase letter.');

    if (/[a-z]/.test(password)) score += 1;
    else errors.push('Password must contain at least one lowercase letter.');

    if (/[0-9]/.test(password)) score += 1;
    else errors.push('Password must contain at least one digit.');

    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 1;
    else errors.push('Password must contain at least one special character.');

    return {
      isValid: errors.length === 0,
      score,
      errors,
    };
  }

  /**
   * 2. Simulated Hash & Salt Generation (PBKDF2-SHA256 representation)
   */
  public static hashPassword(password: string, salt: string = 'coop_salt_' + Math.random().toString(36).substring(2)): string {
    let hash = 0;
    const combined = `${salt}:${password}:antigravity_coop_key_2026`;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `$pbkdf2-sha256$i=100000$${salt}$${Math.abs(hash).toString(16).padStart(16, '0')}`;
  }

  public static verifyPassword(password: string, storedHash: string): boolean {
    const parts = storedHash.split('$');
    if (parts.length < 5) return false;
    const salt = parts[3];
    const computed = this.hashPassword(password, salt);
    return computed === storedHash;
  }

  /**
   * 3. Two-Factor Authentication (TOTP) Token Engine
   */
  public static generateTotpSecret(userId: string): { secret: string; uri: string } {
    const secret = `COOP${userId.toUpperCase().replace(/[^A-Z0-9]/g, '')}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const uri = `otpauth://totp/MinistryCoopFund:${userId}?secret=${secret}&issuer=MinistryCoopFund`;
    return { secret, uri };
  }

  public static generateCurrentTotp(secret: string, timestampMs: number = Date.now()): string {
    const step = Math.floor(timestampMs / 30000);
    let hash = 0;
    const combined = `${secret}_${step}`;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    const code = Math.abs(hash % 1000000).toString().padStart(6, '0');
    return code;
  }

  public static verifyTotp(secret: string, token: string, timestampMs: number = Date.now()): boolean {
    if (!/^\d{6}$/.test(token)) return false;
    // Check current 30s window and +/- 1 window drift
    for (let drift = -1; drift <= 1; drift++) {
      const valid = this.generateCurrentTotp(secret, timestampMs + drift * 30000);
      if (valid === token) return true;
    }
    return false;
  }

  /**
   * 4. AES-256 Sensitive Data Encryption / Decryption Simulator
   */
  public static encryptSensitiveField(plainText: string, key: string = 'COOP_MASTER_KEY_AES256_2026'): string {
    const iv = Math.random().toString(36).substring(2, 10);
    const encoded = btoa(encodeURIComponent(plainText));
    return `ENC:v1:${iv}:${encoded}`;
  }

  public static decryptSensitiveField(cipherText: string, key: string = 'COOP_MASTER_KEY_AES256_2026'): string {
    if (!cipherText.startsWith('ENC:v1:')) return cipherText;
    const parts = cipherText.split(':');
    const base64Str = parts[3];
    return decodeURIComponent(atob(base64Str));
  }

  /**
   * 5. Session Management & Inactivity Timeout Guard
   */
  public static createSession(userId: string, role: string, ip: string, userAgent: string): UserSession {
    const now = Date.now();
    const session: UserSession = {
      sessionId: `sess_${now}_${Math.random().toString(36).substring(2, 8)}`,
      userId,
      userRole: role,
      ipAddress: ip,
      userAgent,
      createdAt: now,
      lastActivityAt: now,
      expiresAt: now + this.MAX_SESSION_LIFETIME_MS,
      isTwoFactorVerified: role === 'MEMBER', // Admins must verify 2FA
      isValid: true,
    };
    this.activeSessions.set(session.sessionId, session);
    return session;
  }

  public static validateSession(sessionId: string): { isValid: boolean; session?: UserSession; reason?: string } {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.isValid) {
      return { isValid: false, reason: 'Session not found or invalidated.' };
    }

    const now = Date.now();
    if (now > session.expiresAt) {
      session.isValid = false;
      return { isValid: false, reason: 'Session expired (max lifetime reached).' };
    }

    if (now - session.lastActivityAt > this.SESSION_TIMEOUT_MS) {
      session.isValid = false;
      return { isValid: false, reason: 'Session timed out due to 15 minutes of inactivity.' };
    }

    // Refresh last activity (sliding session)
    session.lastActivityAt = now;
    return { isValid: true, session };
  }

  public static revokeSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isValid = false;
      this.activeSessions.delete(sessionId);
    }
  }

  /**
   * 6. Sliding Window Rate Limiter
   */
  public static checkRateLimit(
    clientId: string,
    limit: number = 60,
    windowMs: number = 60000,
    lockoutMs: number = 300000
  ): RateLimitResult {
    const now = Date.now();
    const bucket = this.rateLimitBuckets.get(clientId) || { count: 0, windowStart: now };

    if (bucket.lockedUntil && now < bucket.lockedUntil) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTimeMs: bucket.lockedUntil,
        lockoutRemainingMs: bucket.lockedUntil - now,
      };
    }

    if (now - bucket.windowStart > windowMs) {
      bucket.count = 0;
      bucket.windowStart = now;
      bucket.lockedUntil = undefined;
    }

    bucket.count += 1;
    this.rateLimitBuckets.set(clientId, bucket);

    if (bucket.count > limit) {
      bucket.lockedUntil = now + lockoutMs;
      return {
        allowed: false,
        remainingRequests: 0,
        resetTimeMs: bucket.lockedUntil,
        lockoutRemainingMs: lockoutMs,
      };
    }

    return {
      allowed: true,
      remainingRequests: limit - bucket.count,
      resetTimeMs: bucket.windowStart + windowMs,
    };
  }

  /**
   * 7. Secure File Upload Validator (MIME-Type, File Size & Extension Whitelisting)
   */
  public static validateFileUpload(file: {
    fileName: string;
    sizeBytes: number;
    mimeType: string;
    bufferSnippet?: ArrayBuffer;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB Max
    const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv', '.pdf', '.jpg', '.png'];
    const ALLOWED_MIMES = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/pdf',
      'image/jpeg',
      'image/png',
    ];

    if (file.sizeBytes > MAX_SIZE_BYTES) {
      errors.push(`File size (${(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB) exceeds statutory maximum of 5 MB.`);
    }

    const cleanName = file.fileName.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => cleanName.endsWith(ext));
    if (!hasValidExt) {
      errors.push('Disallowed file extension. Permitted formats: .xlsx, .xls, .csv, .pdf, .jpg, .png.');
    }

    if (cleanName.includes('..') || cleanName.includes('/') || cleanName.includes('\\')) {
      errors.push('Path traversal characters detected in file name.');
    }

    if (!ALLOWED_MIMES.includes(file.mimeType)) {
      errors.push(`Invalid MIME type '${file.mimeType}'.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
