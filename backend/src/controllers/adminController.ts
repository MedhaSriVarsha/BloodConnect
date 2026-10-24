import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { memoryStore } from '../services/db.js';
import { logger } from '../utils/logger.js';

export const adminController = {
  /**
   * Admin aggregate metrics and analytics dashboard
   */
  async getDashboardSummary(req: AuthenticatedRequest, res: Response) {
    try {
      const totalUsers = memoryStore.users.length;
      const totalDonors = memoryStore.donorProfiles.length;
      const availableDonors = memoryStore.donorProfiles.filter(d => d.isAvailable).length;
      const openRequests = memoryStore.bloodRequests.filter(r => r.status === 'OPEN').length;
      const criticalRequests = memoryStore.bloodRequests.filter(r => r.urgency === 'CRITICAL' && r.status === 'OPEN').length;
      const fulfilledRequests = memoryStore.bloodRequests.filter(r => r.status === 'FULFILLED').length;
      const totalDonations = memoryStore.donations.length;
      const totalHospitals = memoryStore.bloodBanksHospitals.length;

      // Group donors by blood group
      const bloodGroupCounts: Record<string, number> = {};
      memoryStore.donorProfiles.forEach(dp => {
        bloodGroupCounts[dp.bloodGroup] = (bloodGroupCounts[dp.bloodGroup] || 0) + 1;
      });

      return res.status(200).json({
        status: 'success',
        data: {
          metrics: {
            totalUsers,
            totalDonors,
            availableDonors,
            openRequests,
            criticalRequests,
            fulfilledRequests,
            totalDonations,
            totalHospitals,
            livesSavedEstimate: totalDonations * 3,
          },
          bloodGroupDistribution: bloodGroupCounts,
          recentAuditLogs: memoryStore.auditLogs.slice(0, 10),
          recentRequests: memoryStore.bloodRequests.slice(0, 5),
        },
      });
    } catch (err: any) {
      logger.error('Admin dashboard error', err);
      return res.status(500).json({ status: 'error', message: 'Failed to retrieve admin dashboard.' });
    }
  },

  /**
   * List all donors with admin management details
   */
  async getDonors(req: AuthenticatedRequest, res: Response) {
    const list = memoryStore.donorProfiles.map(dp => {
      const user = memoryStore.users.find(u => u.id === dp.userId);
      return {
        ...dp,
        user: {
          id: user?.id,
          fullName: user?.fullName,
          email: user?.email,
          phone: user?.phone,
          status: user?.status,
          createdAt: user?.createdAt,
        },
      };
    });

    return res.status(200).json({ status: 'success', data: list });
  },

  /**
   * Update user status (approve / suspend / activate) with audit logging
   */
  async updateUserStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      const user = memoryStore.users.find(u => u.id === id);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found.' });
      }

      const previousStatus = user.status;
      user.status = status;
      user.updatedAt = new Date();

      // Log admin action & audit log
      memoryStore.adminActions.unshift({
        id: `aa-${Date.now()}`,
        adminId: req.user!.id,
        action: `USER_STATUS_${status}`,
        targetId: id,
        reason: reason || 'Administrative policy update',
        createdAt: new Date(),
      });

      memoryStore.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorId: req.user!.id,
        action: 'USER_STATUS_CHANGE',
        resourceType: 'USER',
        resourceId: id,
        details: { previousStatus, newStatus: status, reason },
        ipAddress: req.ip,
        createdAt: new Date(),
      });

      return res.status(200).json({
        status: 'success',
        message: `User status changed to ${status}.`,
        data: user,
      });
    } catch (err: any) {
      return res.status(500).json({ status: 'error', message: 'Failed to update user status.' });
    }
  },

  /**
   * Audit logs
   */
  async getAuditLogs(req: AuthenticatedRequest, res: Response) {
    return res.status(200).json({
      status: 'success',
      count: memoryStore.auditLogs.length,
      data: memoryStore.auditLogs,
    });
  },

  /**
   * Get 3 SMTP Users pool status & Target Emails
   */
  async getSmtpConfig(req: AuthenticatedRequest, res: Response) {
    const { smsEmailService } = await import('../services/smsEmailService.js');
    return res.status(200).json({
      status: 'success',
      data: {
        targetEmails: smsEmailService.getTargetEmails(),
        smtpUsers: smsEmailService.getSmtpUsers(),
      },
    });
  },

  /**
   * Update one of the 3 SMTP User credentials dynamically
   */
  async updateSmtpUser(req: AuthenticatedRequest, res: Response) {
    const { smsEmailService } = await import('../services/smsEmailService.js');
    const { slotIndex, host, port, user, pass, label, fromName } = req.body;

    if (slotIndex === undefined || slotIndex < 0 || slotIndex > 2) {
      return res.status(400).json({ status: 'error', message: 'Valid slot index (0, 1, or 2) required.' });
    }

    smsEmailService.updateSmtpUser(slotIndex, {
      ...(host ? { host } : {}),
      ...(port ? { port: parseInt(port, 10) } : {}),
      ...(user ? { user } : {}),
      ...(pass ? { pass } : {}),
      ...(label ? { label } : {}),
      ...(fromName ? { fromName } : {}),
    });

    return res.status(200).json({
      status: 'success',
      message: `SMTP User Slot ${slotIndex + 1} updated successfully.`,
      data: smsEmailService.getSmtpUsers(),
    });
  },

  /**
   * Update the 3 Target Emails for simultaneous OTP delivery
   */
  async updateTargetEmails(req: AuthenticatedRequest, res: Response) {
    const { smsEmailService } = await import('../services/smsEmailService.js');
    const { emails } = req.body;

    if (!Array.isArray(emails)) {
      return res.status(400).json({ status: 'error', message: 'Emails array required.' });
    }

    smsEmailService.setTargetEmails(emails);

    return res.status(200).json({
      status: 'success',
      message: `Target delivery emails updated (${smsEmailService.getTargetEmails().length} emails active).`,
      data: smsEmailService.getTargetEmails(),
    });
  },

  /**
   * Test sending OTP to all 3 emails simultaneously via 3-SMTP user pool
   */
  async test3MailsOtp(req: AuthenticatedRequest, res: Response) {
    const { smsEmailService } = await import('../services/smsEmailService.js');
    const { generateNumericOtp } = await import('../utils/crypto.js');

    const testOtp = generateNumericOtp(6);
    const target = (req.body.primaryEmail || 'varshavegi009@gmail.com').trim();

    const dispatchResult = await smsEmailService.sendEmailOtp(target, testOtp, 'TEST_MULTI_DISPATCH');

    return res.status(200).json({
      status: 'success',
      message: `Test OTP dispatched to ${dispatchResult.recipients?.length || 1} emails.`,
      data: {
        otpGenerated: testOtp,
        ...dispatchResult,
      },
    });
  },

  /**
   * Database backup creation
   */
  async createBackup(req: AuthenticatedRequest, res: Response) {
    const { createDatabaseBackup } = await import('../database/index.js');
    const backup = createDatabaseBackup();
    return res.status(200).json({
      status: 'success',
      message: 'Database backup snapshot created successfully.',
      data: backup,
    });
  },

  /**
   * List available database backups
   */
  async listBackups(req: AuthenticatedRequest, res: Response) {
    const { listDatabaseBackups } = await import('../database/index.js');
    const backups = listDatabaseBackups();
    return res.status(200).json({
      status: 'success',
      count: backups.length,
      data: backups,
    });
  },

  /**
   * Restore database from backup
   */
  async restoreBackup(req: AuthenticatedRequest, res: Response) {
    const { backupId } = req.body;
    if (!backupId) {
      return res.status(400).json({ status: 'error', message: 'backupId is required.' });
    }
    const { restoreDatabaseBackup } = await import('../database/index.js');
    const success = restoreDatabaseBackup(backupId);
    if (!success) {
      return res.status(400).json({ status: 'error', message: 'Failed to restore database from backup.' });
    }
    return res.status(200).json({
      status: 'success',
      message: `Database successfully restored from ${backupId}.`,
    });
  }
};
