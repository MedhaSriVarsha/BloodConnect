import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordFormData } from '../../schemas/authSchemas';
import { authService } from '../../services';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { ErrorBanner } from '../../components/ui/ErrorBanner';

export const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const identifier = (location.state as { identifier?: string })?.identifier || 'marcus.vance@example.org';

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: '123456',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setErrorMsg(null);
    try {
      await authService.resetPassword({
        identifier,
        code: data.code,
        newPassword: data.newPassword,
      });
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    } catch (err: unknown) {
      setErrorMsg((err as { message?: string })?.message || 'Password update failed. Please verify your code.');
    }
  };

  return (
    <Card className="shadow-lg border-line-border">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center mb-2 shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-ink-main tracking-tight">Set New Password</h1>
          <p className="text-xs text-ink-secondary">
            Account: <strong className="text-ink-main">{identifier}</strong>
          </p>
        </div>

        {errorMsg && <ErrorBanner message={errorMsg} onRetry={() => setErrorMsg(null)} />}

        {isSuccess ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-status-success mx-auto" />
            <h3 className="text-base font-bold text-ink-main">Password Updated!</h3>
            <p className="text-xs text-ink-secondary">
              Your password has been changed successfully. Redirecting you to sign in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="6-Digit Reset Code"
              placeholder="123456"
              maxLength={6}
              helperText="[Demo Mode] Enter simulated code (e.g., 123456)."
              error={errors.code?.message}
              {...register('code')}
            />

            <Input
              label="New Password"
              type="password"
              placeholder="Minimum 8 characters"
              required
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-type new password"
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <div className="bg-gray-50 p-3 rounded-lg border border-line-border text-xs text-ink-secondary space-y-1">
              <span className="font-semibold text-ink-main block">Password Requirements:</span>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
                <span>At least 8 characters long</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
                <span>Include letters and numbers</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full justify-center shadow-sm mt-2"
            >
              Update Password &amp; Sign In
            </Button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-ink-secondary border-t border-line-border">
          <Link to="/auth/login" className="font-semibold text-brand-600 hover:text-brand-700 underline">
            Cancel &amp; Return to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
