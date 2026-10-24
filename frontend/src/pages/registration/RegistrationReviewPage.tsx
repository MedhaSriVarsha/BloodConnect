import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, Edit3, Heart } from 'lucide-react';
import type { DonorRegistrationFormData } from '../../schemas/donorSchemas';
import type { BloodGroup } from '../../types/donor';
import { donorService } from '../../services';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { BloodGroupBadge } from '../../components/ui/Badge';
import { ErrorBanner } from '../../components/ui/ErrorBanner';

export const RegistrationReviewPage: React.FC = () => {
  const { referralCode = 'SAVIOR-MV2026' } = useParams<{ referralCode: string }>();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rawDraft = sessionStorage.getItem(`bftd_reg_draft_${referralCode}`);
  const data: DonorRegistrationFormData | null = rawDraft ? JSON.parse(rawDraft) : null;

  if (!data) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <Card className="p-8 space-y-4">
          <h2 className="text-lg font-bold text-ink-main">No Registration Data Found</h2>
          <p className="text-xs text-ink-secondary">
            Please start the registration process from the invitation page.
          </p>
          <Link to={`/join/${referralCode}/register`}>
            <Button variant="primary">Start Registration</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleConfirmRegistration = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const result = await donorService.registerDonor({
        ...data,
        bloodGroup: data.bloodGroup as BloodGroup,
      });
      // Clean up draft and pass result
      sessionStorage.removeItem(`bftd_reg_draft_${referralCode}`);
      navigate('/join/success', {
        state: {
          result,
          registeredName: data.fullName,
          bloodGroup: data.bloodGroup,
          referralCodeUsed: referralCode,
        },
      });
    } catch (err: unknown) {
      setErrorMsg(
        (err as { message?: string })?.message ||
          'Failed to record donor registration. Please try again or check network connectivity.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(`/join/${referralCode}/register`)}
          className="text-xs font-semibold text-ink-secondary hover:text-brand-500 inline-flex items-center min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Edit Registration Info
        </button>
        <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
          Step 2 of 2: Final Confirmation
        </span>
      </div>

      <Card className="shadow-lg border-line-border overflow-hidden">
        <div className="p-6 bg-brand-500 text-white flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Review Donor Information</h1>
            <p className="text-xs text-white/90 mt-0.5">
              Confirm your details before activating your savior profile
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {errorMsg && <ErrorBanner message={errorMsg} onRetry={handleConfirmRegistration} />}

          {/* Details Table */}
          <div className="bg-gray-50 rounded-xl border border-line-border divide-y divide-line-border text-sm">
            <div className="p-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-secondary">Full Name</span>
              <span className="font-bold text-ink-main">{data.fullName}</span>
            </div>

            <div className="p-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-secondary">Blood Group</span>
              <div className="flex items-center space-x-2">
                <BloodGroupBadge group={data.bloodGroup as BloodGroup} />
                <span className="text-xs text-ink-secondary font-medium">Verified Blood Type</span>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-secondary">Mobile Number</span>
              <span className="font-mono text-ink-main font-semibold">{data.phone}</span>
            </div>

            {data.email && (
              <div className="p-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-secondary">Email</span>
                <span className="text-ink-main">{data.email}</span>
              </div>
            )}

            <div className="p-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-secondary">Matching Location</span>
              <span className="text-ink-main font-medium">
                {data.city}, {data.district}, {data.state}
              </span>
            </div>

            <div className="p-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-secondary">Willingness Mode</span>
              <span className="capitalize text-ink-main font-medium">
                {data.willingness?.replace('_', ' ')}
              </span>
            </div>

            <div className="p-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-secondary">Inviting Referral Code</span>
              <span className="font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                {referralCode}
              </span>
            </div>

            <div className="p-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-secondary">Emergency Contact Consent</span>
              <span className="inline-flex items-center text-xs font-bold text-status-success">
                <ShieldCheck className="w-4 h-4 mr-1" />
                Explicitly Authorized
              </span>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold block mb-1">Voluntary Commitment:</span>
            By completing registration, you confirm readiness to be contacted for emergency transfusion shortages in your designated locality.
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => navigate(`/join/${referralCode}/register`)}
              leftIcon={<Edit3 className="w-4 h-4" />}
              className="w-full sm:w-1/3 justify-center"
              disabled={submitting}
            >
              Edit Details
            </Button>

            <Button
              variant="primary"
              size="lg"
              isLoading={submitting}
              onClick={handleConfirmRegistration}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="w-full sm:w-2/3 justify-center shadow-md font-bold text-base"
            >
              Confirm &amp; Join BloodBridge
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
