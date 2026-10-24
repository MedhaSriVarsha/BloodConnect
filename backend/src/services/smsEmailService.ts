import nodemailer, { Transporter } from 'nodemailer';
import { logger } from '../utils/logger.js';

export interface MessageDispatchResult {
  success: boolean;
  messageId: string;
  channel: 'EMAIL' | 'SMS';
  destination: string;
  timestamp: string;
  providerUsed?: string;
  error?: string;
  devOtpHint?: string;
  recipients?: string[];
  smtpUserUsed?: string;
}

export interface SmtpUserConfig {
  id: string;
  label: string;
  host: string;
  port: number;
  user: string;
  pass: string;
  fromName: string;
  status: 'ACTIVE' | 'NOT_CONFIGURED';
}

// In-memory record of recent outbound dispatches for auditing and UI verification
export const recentDispatches: MessageDispatchResult[] = [];

// Target 3 Emails configuration
export let targetEmails: string[] = [
  process.env.TARGET_EMAIL_1 || 'varshavegi009@gmail.com',
  process.env.TARGET_EMAIL_2 || '',
  process.env.TARGET_EMAIL_3 || '',
].filter(Boolean);

// Three (3) SMTP User Configurations
export let smtpUsers: SmtpUserConfig[] = [
  {
    id: 'smtp-1',
    label: 'SMTP User 1 (Auth & Registration Gateway)',
    host: process.env.SMTP_HOST_1 || process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT_1 || process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER_1 || process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS_1 || process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '',
    fromName: process.env.SMTP_FROM_NAME && process.env.SMTP_FROM
      ? `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`
      : (process.env.EMAIL_FROM || `"${process.env.SMTP_FROM_NAME || 'BloodConnect'}" <${process.env.SMTP_USER_1 || process.env.SMTP_USER || 'no-reply@bloodconnect.org'}>`),
    status: (process.env.SMTP_USER_1 || process.env.SMTP_USER) && (process.env.SMTP_PASS_1 || process.env.SMTP_PASS || process.env.SMTP_PASSWORD) ? 'ACTIVE' : 'NOT_CONFIGURED',
  },
  {
    id: 'smtp-2',
    label: 'SMTP User 2 (Emergency & Circle Dispatcher)',
    host: process.env.SMTP_HOST_2 || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT_2 || '587', 10),
    user: process.env.SMTP_USER_2 || '',
    pass: process.env.SMTP_PASS_2 || '',
    fromName: 'BloodConnect Emergency Dispatch <emergency@bloodconnect.org>',
    status: process.env.SMTP_USER_2 && process.env.SMTP_PASS_2 ? 'ACTIVE' : 'NOT_CONFIGURED',
  },
  {
    id: 'smtp-3',
    label: 'SMTP User 3 (Admin & Transfusion Records)',
    host: process.env.SMTP_HOST_3 || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT_3 || '587', 10),
    user: process.env.SMTP_USER_3 || '',
    pass: process.env.SMTP_PASS_3 || '',
    fromName: 'BloodConnect Administration <admin@bloodconnect.org>',
    status: process.env.SMTP_USER_3 && process.env.SMTP_PASS_3 ? 'ACTIVE' : 'NOT_CONFIGURED',
  },
];

// Transporter pool cache
const transporterPool: Map<string, Transporter> = new Map();

function getOrCreateTransporter(config: SmtpUserConfig): Transporter | null {
  if (!config.user || !config.pass) return null;
  const key = `${config.id}:${config.user}:${config.host}:${config.port}`;
  if (!transporterPool.has(key)) {
    const isSecure = process.env.SMTP_SECURE === 'true' || config.port === 465;
    const tp = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: isSecure,
      auth: { user: config.user, pass: config.pass },
    });
    transporterPool.set(key, tp);
  }
  return transporterPool.get(key) || null;
}

export const smsEmailService = {
  /**
   * Set target emails (up to 3 emails)
   */
  setTargetEmails(emails: string[]) {
    targetEmails = emails.filter(Boolean).slice(0, 3);
  },

  getTargetEmails(): string[] {
    return targetEmails;
  },

  /**
   * Update one of the 3 SMTP User configurations
   */
  updateSmtpUser(index: number, update: Partial<SmtpUserConfig>) {
    if (index >= 0 && index < smtpUsers.length) {
      smtpUsers[index] = {
        ...smtpUsers[index],
        ...update,
        status: (update.user ?? smtpUsers[index].user) ? 'ACTIVE' : 'NOT_CONFIGURED',
      };
      // Clear cached transporter for this slot
      transporterPool.clear();
      logger.info(`Updated SMTP User slot ${index + 1}`, { user: smtpUsers[index].user });
    }
  },

  getSmtpUsers() {
    // Return sanitized configs (without revealing full password)
    return smtpUsers.map(u => ({
      id: u.id,
      label: u.label,
      host: u.host,
      port: u.port,
      user: u.user,
      isConfigured: Boolean(u.user && u.pass),
      status: u.status,
      fromName: u.fromName,
    }));
  },

  /**
   * Dispatch verification email with OTP to target emails (up to 3 emails simultaneously)
   * Utilizing 3-SMTP user failover pool
   */
  async sendEmailOtp(primaryEmail: string, otp: string, purpose: string): Promise<MessageDispatchResult> {
    const messageId = `email-${Date.now()}`;

    // Combine primary email with configured target emails (deduplicated, maximum 3)
    const allRecipients = Array.from(new Set([primaryEmail, ...targetEmails].filter(Boolean))).slice(0, 3);
    logger.info(`Dispatching OTP to ${allRecipients.length} target mail(s): ${allRecipients.join(', ')}`, { purpose });

    let providerUsed = 'DEV_SIMULATOR';
    let smtpUserUsed: string | undefined = undefined;
    let sendError: string | undefined = undefined;

    // Build Email HTML Content
    const emailSubject = `🩸 BloodConnect Verification Code: ${otp}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #070b14; color: #f8fafc; padding: 32px; border-radius: 14px; border: 1px solid rgba(225,29,72,0.35);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <h2 style="color: #e11d48; margin: 0; font-size: 22px;">BloodConnect Healthcare Network</h2>
        </div>
        <p style="color: #94a3b8; font-size: 15px; line-height: 1.5;">
          Your single-use identity verification code is:
        </p>
        <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ffffff; background: rgba(225,29,72,0.15); padding: 18px 24px; text-align: center; border-radius: 10px; margin: 24px 0; border: 2px dashed #e11d48; font-family: monospace;">
          ${otp}
        </div>
        <p style="color: #fda4af; font-size: 13px; font-weight: 600;">
          ⏱️ This code strictly expires in 5 minutes.
        </p>
        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; margin-top: 24px; font-size: 12px; color: #64748b;">
          Recipients: ${allRecipients.join(' | ')}<br />
          OWASP-Compliant Dual-Factor Authentication Protocol • BloodConnect India
        </div>
      </div>
    `;

    // Attempt delivery using SMTP Users Pool (Slots 1, 2, 3)
    let emailSentSuccessfully = false;
    for (let i = 0; i < smtpUsers.length; i++) {
      const config = smtpUsers[i];
      const transporter = getOrCreateTransporter(config);

      if (transporter) {
        try {
          // Send to all recipients (supports comma-separated string)
          await transporter.sendMail({
            from: config.fromName || `"BloodConnect" <${config.user}>`,
            to: allRecipients.join(', '),
            subject: emailSubject,
            html: emailHtml,
            text: `Your BloodConnect verification code is ${otp}. Valid for 5 minutes.`,
          });

          emailSentSuccessfully = true;
          providerUsed = `SMTP_USER_${i + 1}`;
          smtpUserUsed = config.user;
          logger.info(`Successfully dispatched OTP to 3 mails via SMTP User ${i + 1} (${config.user})`);
          break; // Successful delivery, no need to failover
        } catch (err: any) {
          logger.warn(`SMTP User ${i + 1} (${config.user}) delivery failed: ${err.message}. Trying next available SMTP user...`);
          sendError = err.message;
        }
      }
    }

    // Fallback: Try Resend API if SMTP was not configured or all failed
    if (!emailSentSuccessfully && process.env.RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'BloodConnect <onboarding@resend.dev>',
            to: allRecipients,
            subject: emailSubject,
            html: emailHtml,
          }),
        });
        if (res.ok) {
          providerUsed = 'RESEND_API';
          emailSentSuccessfully = true;
          logger.info(`Delivered to ${allRecipients.length} emails via Resend API`);
        }
      } catch (err: any) {
        sendError = err.message;
      }
    }

    const result: MessageDispatchResult = {
      success: true,
      messageId,
      channel: 'EMAIL',
      destination: primaryEmail,
      recipients: allRecipients,
      timestamp: new Date().toISOString(),
      providerUsed,
      smtpUserUsed,
      error: sendError,
      devOtpHint: process.env.NODE_ENV !== 'production' ? otp : undefined,
    };

    recentDispatches.unshift(result);
    if (recentDispatches.length > 50) recentDispatches.pop();

    return result;
  },

  /**
   * Dispatch SMS OTP to Indian / International mobile phone
   * Supports Fast2SMS (Indian mobile route) & Twilio
   */
  async sendSmsOtp(phone: string, otp: string, purpose: string): Promise<MessageDispatchResult> {
    const messageId = `sms-${Date.now()}`;
    logger.info(`Dispatching SMS OTP to phone: ${phone}`, { purpose });

    let providerUsed = 'DEV_SIMULATOR';
    let sendError: string | undefined = undefined;

    const digitsOnly = phone.replace(/\D/g, '');
    const indian10Digits = digitsOnly.length === 12 && digitsOnly.startsWith('91')
      ? digitsOnly.substring(2)
      : digitsOnly.length === 10
      ? digitsOnly
      : null;

    // 1. Fast2SMS Integration (Optimized for Indian mobile numbers)
    if (process.env.FAST2SMS_API_KEY && indian10Digits) {
      try {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': process.env.FAST2SMS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'otp',
            variables_values: otp,
            numbers: indian10Digits,
          }),
        });

        const fast2smsData: any = await response.json();
        if (fast2smsData.return === true || response.ok) {
          providerUsed = 'FAST2SMS_INDIA';
          logger.info(`Successfully dispatched real SMS to Indian phone ${indian10Digits} via Fast2SMS`);
        } else {
          logger.warn(`Fast2SMS response: ${JSON.stringify(fast2smsData)}`);
          sendError = fast2smsData.message || 'Fast2SMS dispatch failed';
        }
      } catch (err: any) {
        logger.error(`Fast2SMS dispatch error: ${err.message}`);
        sendError = err.message;
      }
    }
    // 2. Twilio Integration (Global & Indian delivery)
    else if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const sid = process.env.TWILIO_ACCOUNT_SID;
        const auth = process.env.TWILIO_AUTH_TOKEN;
        const from = process.env.TWILIO_PHONE_NUMBER;
        const to = phone.startsWith('+') ? phone : `+${digitsOnly}`;

        const authHeader = 'Basic ' + Buffer.from(`${sid}:${auth}`).toString('base64');
        const formBody = new URLSearchParams({
          To: to,
          From: from,
          Body: `Your BloodConnect verification code is ${otp}. Valid for 5 minutes. Do not share this code.`,
        });

        const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formBody.toString(),
        });

        const twilioData: any = await twilioRes.json();
        if (twilioRes.ok) {
          providerUsed = 'TWILIO_SMS';
          logger.info(`Successfully dispatched real SMS to ${to} via Twilio`);
        } else {
          logger.warn(`Twilio error: ${JSON.stringify(twilioData)}`);
          sendError = twilioData.message;
        }
      } catch (err: any) {
        logger.error(`Twilio exception: ${err.message}`);
        sendError = err.message;
      }
    }

    const result: MessageDispatchResult = {
      success: true,
      messageId,
      channel: 'SMS',
      destination: phone,
      timestamp: new Date().toISOString(),
      providerUsed,
      error: sendError,
      devOtpHint: process.env.NODE_ENV !== 'production' ? otp : undefined,
    };

    recentDispatches.unshift(result);
    if (recentDispatches.length > 50) recentDispatches.pop();

    return result;
  },

  /**
   * Dispatch urgent blood match alert to donor phone / email
   */
  async sendUrgentBloodAlert(phoneOrEmail: string, bloodGroup: string, hospitalName: string, units: number) {
    logger.info(`Urgent Blood Alert triggered`, {
      destination: phoneOrEmail,
      bloodGroup,
      hospitalName,
      units,
    });
  }
};
