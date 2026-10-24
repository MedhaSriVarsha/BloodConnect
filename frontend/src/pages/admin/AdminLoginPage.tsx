import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { loginSchema, type LoginFormData } from '../../schemas/authSchemas';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ErrorBanner } from '../../components/ui/ErrorBanner';

export const AdminLoginPage: React.FC = () => {
  const { login, loginAsDemoAdmin, isDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authError, setAuthError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: 'admin@bloodbridge.org',
      password: 'AdminPassword2026!',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    try {
      const session = await login(data);
      if (session.user.role !== 'admin') {
        throw new Error('Access denied: Administrator privileges required for this portal.');
      }
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setAuthError((err as { message?: string })?.message || 'Authentication failed. Please verify admin credentials.');
    }
  };

  const handleQuickDemoAdmin = async () => {
    setAuthError(null);
    setValue('identifier', 'admin@bloodbridge.org');
    setValue('password', 'AdminSecret2026!');
    await loginAsDemoAdmin();
    navigate('/admin/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center ring-2 ring-amber-500/40">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">BloodBridge Operations</h1>
          <p className="text-xs text-slate-400">
            Administrative Management &amp; Emergency Dispatch Console
          </p>
        </div>

        <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-2xl">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {authError && <ErrorBanner message={authError} onRetry={() => setAuthError(null)} />}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Admin Identifier (Email / Account)"
                placeholder="admin@bloodbridge.org"
                autoComplete="username"
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-amber-500"
                error={errors.identifier?.message}
                {...register('identifier')}
              />

              <Input
                label="Security Key / Password"
                type="password"
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-amber-500"
                error={errors.password?.message}
                {...register('password')}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full justify-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg"
              >
                Authenticate Operator
              </Button>
            </form>

            {isDemo && (
              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 block">
                  Simulated Demo Environment:
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleQuickDemoAdmin}
                  className="w-full justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                >
                  Quick Sign In as Dr. Evelyn Reed (Admin)
                </Button>
              </div>
            )}

            <div className="text-center pt-2 border-t border-slate-800">
              <Link to="/auth/login" className="text-xs text-slate-400 hover:text-white inline-flex items-center min-h-[44px]">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Return to Donor Portal Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
