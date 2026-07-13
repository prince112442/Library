import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiCheckCircle } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';

const roleLabel = { admin: 'Administrator', librarian: 'Librarian', student: 'Student' };

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { name: user?.name, phone: user?.phone || '', password: '' } });

  const onSubmit = async (values) => {
    setSubmitting(true);
    setSaved(false);
    const payload = { name: values.name, phone: values.phone };
    if (values.password) payload.password = values.password;
    const updated = await authService.updateMe(payload);
    updateUser(updated);
    setSubmitting(false);
    setSaved(true);
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-serif text-2xl font-semibold text-navy-dark">My Profile</h1>
      <p className="mt-1 text-sm text-navy/60">Manage your account details.</p>

      <div className="index-card mt-6">
        <div className="mb-6 flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy font-serif text-xl font-semibold text-parchment">
            {user?.name?.[0]?.toUpperCase()}
          </span>
          <div>
            <p className="font-serif text-lg font-semibold text-navy-dark">{user?.name}</p>
            <p className="text-sm text-navy/50">{roleLabel[user?.role]} · {user?.email}</p>
          </div>
        </div>

        {saved && (
          <div className="mb-4 flex items-center gap-2 rounded-sm border border-sage/30 bg-sage-light px-3 py-2.5 text-sm text-sage">
            <FiCheckCircle size={15} /> Profile updated successfully.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="field-label" htmlFor="name">Full name</label>
            <input id="name" className="field-input" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="mt-1 text-xs text-rust">{errors.name.message}</p>}
          </div>

          <div>
            <label className="field-label" htmlFor="phone">Phone number</label>
            <input id="phone" className="field-input" {...register('phone')} />
          </div>

          <div>
            <label className="field-label" htmlFor="password">New password</label>
            <input id="password" type="password" placeholder="Leave blank to keep current password" className="field-input" {...register('password', { minLength: { value: 6, message: 'Password must be at least 6 characters' } })} />
            {errors.password && <p className="mt-1 text-xs text-rust">{errors.password.message}</p>}
          </div>

          {user?.role === 'student' && (
            <div className="grid grid-cols-2 gap-4 border-t border-navy/10 pt-4">
              <div>
                <p className="field-label">Student ID</p>
                <p className="font-mono text-sm text-navy-dark">{user.studentId || '—'}</p>
              </div>
              <div>
                <p className="field-label">Department</p>
                <p className="text-sm text-navy-dark">{user.department || '—'}</p>
              </div>
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
