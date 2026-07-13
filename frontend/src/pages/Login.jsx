import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiBookOpen, FiAlertCircle } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ email, password }) => {
    setServerError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel: brand moment */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-navy p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-brass font-serif text-xl font-bold text-navy-dark">
            C
          </span>
          <span className="font-serif text-xl font-semibold text-parchment">Cedarbrook Library</span>
        </div>

        <div>
          <FiBookOpen size={32} className="mb-6 text-brass" />
          <h1 className="max-w-md font-serif text-4xl font-medium leading-tight text-parchment">
            Every book, borrower, and due date — catalogued in one place.
          </h1>
          <p className="mt-4 max-w-sm text-sm text-parchment/60">
            The circulation desk for Cedarbrook School Library. Sign in with the account issued by your librarian or administrator.
          </p>
        </div>

        <p className="text-xs text-parchment/40">© {new Date().getFullYear()} Cedarbrook School Library</p>
      </div>

      {/* Right panel: form */}
      <div className="flex w-full flex-col items-center justify-center bg-parchment px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-brass font-serif text-xl font-bold text-navy-dark">
              C
            </span>
          </div>

          <h2 className="font-serif text-2xl font-semibold text-navy-dark">Welcome back</h2>
          <p className="mt-1.5 text-sm text-navy/60">Sign in to access the circulation desk.</p>

          {serverError && (
            <div className="mt-5 flex items-start gap-2 rounded-sm border border-rust/20 bg-rust-light px-3 py-2.5 text-sm text-rust">
              <FiAlertCircle className="mt-0.5 shrink-0" size={15} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <div>
              <label className="field-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="field-input"
                placeholder="you@library.edu"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="mt-1 text-xs text-rust">{errors.email.message}</p>}
            </div>

            <div>
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="field-input"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <p className="mt-1 text-xs text-rust">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-navy/40">
            Trouble signing in? Contact your school librarian or system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
