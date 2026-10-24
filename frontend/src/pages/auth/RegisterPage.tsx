import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema, type RegisterFormData } from '../../schemas/authSchemas';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { Card, CardContent } from '../../components/ui/Card';
import { ErrorBanner } from '../../components/ui/ErrorBanner';

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
      privacyAcknowledged: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setFormError(null);
    try {
      await registerAuth({
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        password: data.password,
        termsAccepted: data.termsAccepted,
        privacyAcknowledged: data.privacyAcknowledged,
      });
      navigate('/auth/verify-otp', { state: { phone: data.phone } });
    } catch (err: unknown) {
      setFormError((err as { message?: string })?.message || 'Registration failed. Please review your details.');
    }
  };

  return (
    <Card className="shadow-lg border-line-border">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-bold text-ink-main tracking-tight">Create Savior Account</h1>
          <p className="text-xs sm:text-sm text-ink-secondary">
            Sign up to build your referral circle and manage emergency donor settings.
          </p>
        </div>

        {formError && <ErrorBanner message={formError} onRetry={() => setFormError(null)} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Jordan Miller"
            required
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Primary Mobile Number"
            type="tel"
            placeholder="+1 (555) 015-6677"
            required
            helperText="Used strictly for emergency verification and dispatch alerts."
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="jordan.m@example.org"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              required
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-type password"
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          <div className="pt-2 space-y-2.5">
            <Checkbox
              label={
                <span>
                  I accept the{' '}
                  <Link to="/terms" target="_blank" className="text-brand-500 underline font-semibold">
                    Terms of Participation
                  </Link>
                </span>
              }
              error={errors.termsAccepted?.message}
              {...register('termsAccepted')}
            />

            <Checkbox
              label={
                <span>
                  I acknowledge the{' '}
                  <Link to="/privacy" target="_blank" className="text-brand-500 underline font-semibold">
                    Privacy Policy
                  </Link>{' '}
                  and agree to responsible savior communications.
                </span>
              }
              error={errors.privacyAcknowledged?.message}
              {...register('privacyAcknowledged')}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full justify-center mt-3 shadow-sm"
          >
            Create Account &amp; Proceed to Verify
          </Button>
        </form>

        <div className="text-center text-xs text-ink-secondary border-t border-line-border pt-4">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-bold text-brand-600 hover:text-brand-700 underline">
            Sign In here
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
