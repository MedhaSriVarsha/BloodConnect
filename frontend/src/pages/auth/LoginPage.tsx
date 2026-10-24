import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import { loginSchema, type LoginFormData } from '../../schemas/authSchemas';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { ErrorBanner } from '../../components/ui/ErrorBanner';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemoUser, loginAsDemoAdmin, isDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authError, setAuthError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: 'marcus.vance@example.org',
      password: 'Password123!',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    try {
      const session = await login(data);
      if (session.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      setAuthError((err as { message?: string })?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleQuickDemoDonor = async () => {
    setAuthError(null);
    setValue('identifier', 'marcus.vance@example.org');
    setValue('password', 'Password123!');
    const session = await loginAsDemoUser();
    navigate('/app/dashboard', { replace: true });
  };

  const handleQuickDemoAdmin = async () => {
    setAuthError(null);
    setValue('identifier', 'admin@bloodbridge.org');
    setValue('password', 'AdminSecret2026!');
    const session = await loginAsDemoAdmin();
    navigate('/admin/dashboard', { replace: true });
  };

  return (
    <Card className="shadow-lg border-line-border">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-bold text-ink-main tracking-tight">Sign In to BloodBridge</h1>
          <p className="text-xs sm:text-sm text-ink-secondary">
            Access your savior dashboard, referral records, and alerts.
          </p>
        </div>

        {authError && <ErrorBanner message={authError} onRetry={() => setAuthError(null)} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Mobile Number or Email"
            placeholder="e.g. +1 (555) 019-2834 or you@example.org"
            autoComplete="username"
            required
            error={errors.identifier?.message}
            {...register('identifier')}
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="flex justify-end pt-1">
              <Link
                to="/auth/forgot-password"
                className="text-xs font-semibold text-brand-500 hover:text-brand-600 focus:outline-none"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full justify-center mt-2 shadow-sm"
          >
            Sign In to Dashboard
          </Button>
        </form>

        {/* Demo Mode Quick Access Pill */}
        {isDemo && (
          <div className="pt-4 border-t border-line-border space-y-3">
            <div className="flex items-center justify-between text-[11px] text-ink-secondary">
              <span className="font-semibold uppercase tracking-wider text-amber-700 flex items-center">
                <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-500" />
                Demo Credentials (Click to fill &amp; enter):
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickDemoDonor}
                className="p-2.5 rounded-lg border border-brand-200 bg-brand-50/70 hover:bg-brand-100 text-left transition-colors text-xs"
              >
                <div className="font-bold text-brand-700">Marcus Vance</div>
                <div className="text-[10px] text-ink-secondary">Donor (O- Universal)</div>
              </button>

              <button
                type="button"
                onClick={handleQuickDemoAdmin}
                className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-left transition-colors text-xs"
              >
                <div className="font-bold text-amber-800">Dr. Evelyn Reed</div>
                <div className="text-[10px] text-ink-secondary">System Administrator</div>
              </button>
            </div>
          </div>
        )}

        <div className="pt-2 text-center text-xs text-ink-secondary border-t border-line-border">
          New to the savior network?{' '}
          <Link to="/join/SAVIOR-MV2026" className="font-bold text-brand-600 hover:text-brand-700 underline">
            Join via Referral
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
