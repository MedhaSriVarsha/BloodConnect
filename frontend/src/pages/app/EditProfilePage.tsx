import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
import { updateDonorProfileSchema, type UpdateDonorProfileFormData } from '../../schemas/donorSchemas';
import type { BloodGroup } from '../../types/donor';
import { profileService } from '../../services';
import { useAuth } from '../../hooks/useAuth';
import { BLOOD_GROUPS } from '../../constants/bloodGroups';
import { LOCATIONS_DATA } from '../../constants/locations';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { ErrorBanner } from '../../components/ui/ErrorBanner';

export const EditProfilePage: React.FC = () => {
  const { user, refreshSession } = useAuth();
  const navigate = useNavigate();

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateDonorProfileFormData>({
    resolver: zodResolver(updateDonorProfileSchema),
    defaultValues: {
      name: user?.name || 'Marcus Vance',
      email: user?.email || 'marcus.vance@example.org',
      bloodGroup: 'O-',
      state: 'California',
      district: 'Los Angeles County',
      city: 'Pasadena',
      willingness: 'regular',
      emergencyAvailability: true,
      contactSharingConsent: true,
    },
  });

  const selectedState = watch('state');
  const currentStateObj = LOCATIONS_DATA.find((s) => s.state === selectedState) || LOCATIONS_DATA[0];

  const onSubmit = async (data: UpdateDonorProfileFormData) => {
    setErrorMsg(null);
    setSaveSuccess(false);
    try {
      await profileService.updateProfile({
        name: data.name,
        email: data.email,
        bloodGroup: data.bloodGroup as BloodGroup,
        location: {
          state: data.state,
          district: data.district,
          city: data.city,
        },
        willingness: data.willingness,
        emergencyAvailability: data.emergencyAvailability,
        contactSharingConsent: data.contactSharingConsent,
      });

      await refreshSession();
      setSaveSuccess(true);
      setTimeout(() => {
        navigate('/app/profile');
      }, 1500);
    } catch (err: unknown) {
      setErrorMsg((err as { message?: string })?.message || 'Failed to update profile settings.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/profile"
          className="text-xs font-semibold text-ink-secondary hover:text-brand-500 inline-flex items-center min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Cancel &amp; Return to Profile
        </Link>
        {isDirty && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium">
            Unsaved Changes
          </span>
        )}
      </div>

      <Card className="shadow-lg border-line-border">
        <CardHeader>
          <div>
            <h1 className="text-lg font-bold text-ink-main">Edit Savior Profile</h1>
            <p className="text-xs text-ink-secondary">
              Update personal details, blood group, and emergency dispatch location
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {errorMsg && <ErrorBanner message={errorMsg} onRetry={() => setErrorMsg(null)} />}

          {saveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-status-success font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Profile updated successfully! Returning to profile page...</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Full Name"
              required
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email Address"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Blood Group"
                required
                options={BLOOD_GROUPS.map((g) => ({
                  value: g.value,
                  label: `${g.label} ${g.isUniversalDonor ? '(Universal Donor)' : ''}`,
                }))}
                error={errors.bloodGroup?.message}
                {...register('bloodGroup')}
              />

              <Select
                label="Donation Willingness Mode"
                options={[
                  { value: 'regular', label: 'Regular Scheduled Donor' },
                  { value: 'emergency_only', label: 'Emergency Alerts Only' },
                  { value: 'plasma_only', label: 'Plasma / Platelets Only' },
                  { value: 'undecided', label: 'Undecided' },
                ]}
                error={errors.willingness?.message}
                {...register('willingness')}
              />
            </div>

            {/* Matching Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Select
                label="State"
                required
                options={LOCATIONS_DATA.map((s) => ({ value: s.state, label: s.state }))}
                error={errors.state?.message}
                {...register('state')}
              />

              <Select
                label="District / County"
                required
                options={currentStateObj.districts.map((d) => ({ value: d.district, label: d.district }))}
                error={errors.district?.message}
                {...register('district')}
              />

              <Input
                label="City / Locality"
                required
                error={errors.city?.message}
                {...register('city')}
              />
            </div>

            <div className="pt-3 border-t border-line-border space-y-3">
              <Checkbox
                label="Immediate Emergency Dispatch Ready"
                description="Keep me listed for real-time mobile push and SMS alerts when urgent trauma shortages occur in my locality."
                {...register('emergencyAvailability')}
              />

              <Checkbox
                label="Contact-Sharing Consent"
                description="Allow verified coordinators to view my contact number for active matching."
                {...register('contactSharingConsent')}
              />
            </div>

            <div className="pt-4 border-t border-line-border flex items-center justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/app/profile')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
