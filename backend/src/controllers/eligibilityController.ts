import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, EligibilityResult } from '../types/index.js';
import { memoryStore } from '../services/db.js';
import { logger } from '../utils/logger.js';

export const checkEligibilitySchema = z.object({
  age: z.number().int().min(10).max(100),
  weightKg: z.number().min(30).max(250),
  hemoglobin: z.number().min(5).max(25).optional(),
  lastDonationDate: z.string().optional(),
  hasTattooLast6Months: z.boolean(),
  hasRecentSurgeryOrPiercing: z.boolean(),
  isPregnantOrLactating: z.boolean().default(false),
  hasChronicCondition: z.boolean().default(false),
  isFeelingHealthyToday: z.boolean().default(true),
});

export const eligibilityController = {
  /**
   * Evaluate blood donation eligibility based on health assessment criteria
   */
  async evaluateEligibility(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = checkEligibilitySchema.parse(req.body);
      const reasons: string[] = [];
      const advice: string[] = [];

      // 1. Age check
      const ageOk = validated.age >= 18 && validated.age <= 65;
      if (!ageOk) {
        if (validated.age < 18) {
          reasons.push('Donors must be at least 18 years of age.');
        } else {
          reasons.push('Donors above 65 years require specialized medical clearance prior to donation.');
        }
      }

      // 2. Weight check
      const weightOk = validated.weightKg >= 45;
      if (!weightOk) {
        reasons.push('Donor body weight must be at least 45 kg to safely donate 350-450 ml of blood.');
      }

      // 3. Hemoglobin check (if provided)
      let hbOk = true;
      if (validated.hemoglobin !== undefined) {
        hbOk = validated.hemoglobin >= 12.5;
        if (!hbOk) {
          reasons.push(`Hemoglobin level (${validated.hemoglobin} g/dL) is below the minimum threshold of 12.5 g/dL.`);
          advice.push('Increase iron-rich foods (spinach, lentils, dates, pomegranate) and re-test in 2 weeks.');
        }
      }

      // 4. Interval since last donation check
      let intervalOk = true;
      let nextEligibleDate = new Date();

      if (validated.lastDonationDate) {
        const lastDate = new Date(validated.lastDonationDate);
        const requiredIntervalDays = 90; // Standard 3-month wait
        const targetDate = new Date(lastDate.getTime() + requiredIntervalDays * 24 * 60 * 60 * 1000);
        
        if (Date.now() < targetDate.getTime()) {
          intervalOk = false;
          nextEligibleDate = targetDate;
          const remainingDays = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          reasons.push(`A minimum 90-day recovery interval is required between donations. You will be eligible in ${remainingDays} day(s).`);
        }
      }

      // 5. Tattoo / Piercing check
      let tattooOk = !validated.hasTattooLast6Months;
      if (!tattooOk) {
        reasons.push('Recent tattoos or piercings carry a temporary 6-month deferral period to rule out bloodborne infections.');
      }

      // 6. Surgery / Health check
      let medicalOk = !validated.hasRecentSurgeryOrPiercing && !validated.isPregnantOrLactating && !validated.hasChronicCondition && validated.isFeelingHealthyToday;
      if (validated.hasRecentSurgeryOrPiercing) {
        reasons.push('Recent major surgery requires a 6-month deferral for full physiological recovery.');
      }
      if (validated.isPregnantOrLactating) {
        reasons.push('Pregnancy or lactation deferral is active to safeguard maternal and infant nutrition.');
      }
      if (!validated.isFeelingHealthyToday) {
        reasons.push('You must feel completely well with no active cold, cough, fever or antibiotic course on the day of donation.');
      }

      const isEligible = ageOk && weightOk && hbOk && intervalOk && tattooOk && medicalOk;

      const result: EligibilityResult = {
        isEligible,
        reasons,
        nextEligibleDate: nextEligibleDate.toISOString(),
        metrics: {
          ageOk,
          weightOk,
          intervalOk,
          medicalOk: tattooOk && medicalOk && hbOk,
        },
      };

      // If user is authenticated, save record to history
      if (req.user?.id) {
        memoryStore.eligibilityAssessments.unshift({
          id: `el-${Date.now()}`,
          userId: req.user.id,
          weightKg: validated.weightKg,
          age: validated.age,
          hemoglobin: validated.hemoglobin || null,
          lastDonationDate: validated.lastDonationDate ? new Date(validated.lastDonationDate) : null,
          hasTattooLast6Months: validated.hasTattooLast6Months,
          hasRecentTravelSurgery: validated.hasRecentSurgeryOrPiercing,
          isMedicallyFit: validated.isFeelingHealthyToday,
          isEligible,
          ineligibilityReason: reasons.join('; ') || null,
          nextEligibleDate,
          assessedAt: new Date(),
        });
      }

      return res.status(200).json({
        status: 'success',
        message: isEligible 
          ? 'Congratulations! You are medically eligible to donate blood and save lives.' 
          : 'You are currently not eligible for donation based on standard safety guidelines.',
        data: {
          ...result,
          advice: advice.length > 0 ? advice : ['Stay well-hydrated and have a light meal before donation.'],
        },
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ status: 'error', errors: err.errors });
      }
      logger.error('Eligibility assessment error', err);
      return res.status(500).json({ status: 'error', message: 'Failed to process eligibility assessment.' });
    }
  },

  /**
   * Get past eligibility assessments for user
   */
  async getMyAssessments(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ status: 'error', message: 'Auth required' });

    const assessments = memoryStore.eligibilityAssessments
      .filter(e => e.userId === userId)
      .sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime());

    return res.status(200).json({ status: 'success', data: assessments });
  }
};
