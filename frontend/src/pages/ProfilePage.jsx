import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNavBar from '../components/SideNavBar';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, authAPI } from '../services/api';
import api from '../services/api';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Edit profile state
  const [editMode, setEditMode] = useState(false);
  const [editStep, setEditStep] = useState(1); // 1=form, 2=otp
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPassword, setEditPassword] = useState('');
  const [editConfirm, setEditConfirm] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [changeToken, setChangeToken] = useState('');
  const otpRefs = useRef([]);

  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openEditModal = () => {
    setEditMode(true);
    setEditStep(1);
    setEditError('');
    setEditSuccess('');
    setEditPassword('');
    setEditConfirm('');
    setOtpValue('');
    setChangeToken('');
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    if (editPassword && editPassword !== editConfirm) {
      setEditError('Passwords do not match');
      return;
    }

    // If changing password, go through OTP flow
    if (editPassword) {
      setEditLoading(true);
      try {
        await authAPI.sendChangeOtp();
        setEditStep(2);
      } catch (err) {
        setEditError(err.response?.data?.detail || 'Failed to send OTP');
      } finally {
        setEditLoading(false);
      }
      return;
    }

    // No password change — save directly
    await saveProfileData(null);
  };

  const handleOtpChange = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 6);
    setOtpValue(digits);
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) { setEditError('Enter the 6-digit OTP'); return; }
    setEditLoading(true);
    setEditError('');
    try {
      const res = await authAPI.verifyChangeOtp(otpValue);
      const token = res.data.change_token;
      setChangeToken(token);
      await saveProfileData(token);
    } catch (err) {
      setEditError(err.response?.data?.detail || 'Invalid OTP');
    } finally {
      setEditLoading(false);
    }
  };

  const saveProfileData = async (token) => {
    setEditLoading(true);
    try {
      const payload = { name: editName, email: editEmail };
      if (editPassword) payload.password = editPassword;
      if (token) payload.change_token = token;
      const res = await api.put('/api/auth/me', payload);
      localStorage.setItem('user', JSON.stringify(res.data));
      setEditSuccess('Profile updated successfully');
      setEditPassword('');
      setEditConfirm('');
      setOtpValue('');
      setChangeToken('');
      setEditStep(1);
      setTimeout(() => setEditMode(false), 1200);
    } catch (err) {
      setEditError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.delete('/api/auth/me');
      logout();
      navigate('/login');
    } catch {
      setDeleteLoading(false);
      setDeleteConfirm(false);
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="min-h-screen bg-background antialiased selection:bg-primary/30">
      <SideNavBar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopAppBar title="Profile" />

        <main className="p-6 md:p-10 flex-1 max-w-4xl mx-auto w-full pb-32">

          {/* Profile hero */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-container-low p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 border border-outline-variant/10 mb-8">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-on-primary text-2xl font-black shrink-0 shadow-lg">
              {initials}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-extrabold font-headline text-on-surface">{user?.name || 'User'}</h1>
              <p className="text-on-surface-variant text-sm mt-0.5">{user?.email}</p>
              <p className="text-on-surface-variant/60 text-xs mt-1 flex items-center gap-1 justify-center sm:justify-start">
                <span className="material-symbols-outlined text-xs">calendar_month</span>
                Member since {memberSince}
              </p>
            </div>
            <button
              onClick={() => openEditModal()}
              className="sm:ml-auto shrink-0 flex items-center gap-2 px-4 py-2 bg-surface-container-highest hover:bg-primary hover:text-on-primary text-on-surface text-sm font-semibold rounded-xl transition-all"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Edit Profile
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-surface-container-low rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Total Scans</p>
              <p className="text-3xl font-black font-headline text-on-surface">
                {statsLoading ? '—' : stats?.total_scans ?? 0}
              </p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Most Common</p>
              <p className="text-sm font-bold text-primary mt-2 leading-tight">
                {statsLoading ? '—' : (stats?.most_common_disease?.replace(/_/g, ' ') || 'N/A')}
              </p>
            </div>
          </div>

          {/* Settings list */}
          <div className="bg-surface-container-low rounded-2xl overflow-hidden mb-6">
            <button
              onClick={() => openEditModal()}
              className="w-full flex items-center justify-between p-5 hover:bg-surface-container-highest transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                  <span className="material-symbols-outlined text-base">manage_accounts</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-on-surface text-sm">Account Settings</p>
                  <p className="text-xs text-on-surface-variant">Name, email, password</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline text-base">chevron_right</span>
            </button>

            <div className="border-t border-outline-variant/10" />

            <button
              onClick={() => navigate('/history')}
              className="w-full flex items-center justify-between p-5 hover:bg-surface-container-highest transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                  <span className="material-symbols-outlined text-base">history</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-on-surface text-sm">Scan History</p>
                  <p className="text-xs text-on-surface-variant">View all past diagnostics</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline text-base">chevron_right</span>
            </button>
          </div>

          {/* Danger zone */}
          <div className="bg-surface-container-low rounded-2xl overflow-hidden border border-error/10">
            <div className="px-5 py-3 border-b border-outline-variant/10">
              <p className="text-xs font-bold uppercase tracking-widest text-error/70">Danger Zone</p>
            </div>
            <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-on-surface text-sm">Delete Account</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Permanently delete your account and all data</p>
              </div>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="shrink-0 flex items-center gap-2 px-4 py-2 bg-error/10 hover:bg-error text-error hover:text-on-error text-sm font-semibold rounded-xl transition-all border border-error/20"
              >
                <span className="material-symbols-outlined text-base">delete_forever</span>
                Delete Account
              </button>
            </div>
          </div>

          {/* Logout */}
          <div className="mt-6 px-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-on-surface-variant hover:text-error transition-colors font-semibold text-sm group"
            >
              <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center group-hover:bg-error/10 transition-all">
                <span className="material-symbols-outlined text-base">logout</span>
              </div>
              Log out
            </button>
          </div>
        </main>
      </div>

      {/* ── Edit Profile Modal ─────────────────────────────────────────── */}
      {editMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-low rounded-2xl w-full max-w-md shadow-2xl border border-outline-variant/20 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
              <h3 className="font-bold text-on-surface font-headline">
                {editStep === 1 ? 'Edit Profile' : 'Verify OTP'}
              </h3>
              <button onClick={() => setEditMode(false)} className="p-1.5 rounded-full hover:bg-surface-container-highest text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {editStep === 1 ? (
              <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
                {editError && (
                  <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">{editError}</div>
                )}
                {editSuccess && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm">{editSuccess}</div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 border-none"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 border-none"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                    New Password <span className="normal-case font-normal">(leave blank to keep current)</span>
                  </label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 border-none"
                    placeholder="••••••••"
                  />
                </div>

                {editPassword && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Confirm Password</label>
                    <input
                      type="password"
                      value={editConfirm}
                      onChange={e => setEditConfirm(e.target.value)}
                      className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 border-none"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                {editPassword && (
                  <p className="text-xs text-on-surface-variant bg-surface-container-highest/50 rounded-lg px-3 py-2">
                    An OTP will be sent to your email to confirm the password change.
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="flex-1 py-3 rounded-xl bg-surface-container-highest text-on-surface text-sm font-semibold hover:bg-surface-bright transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary text-sm font-bold hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {editLoading ? 'Sending OTP...' : editPassword ? 'Continue' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-5">
                {editError && (
                  <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">{editError}</div>
                )}
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-primary text-xl">mark_email_read</span>
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    We sent a 6-digit code to <span className="font-semibold text-on-surface">{user?.email}</span>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Enter OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpValue}
                    onChange={e => handleOtpChange(e.target.value)}
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-on-surface outline-none focus:ring-2 focus:ring-primary/30 border-none"
                    placeholder="------"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setEditStep(1); setEditError(''); setOtpValue(''); }}
                    className="flex-1 py-3 rounded-xl bg-surface-container-highest text-on-surface text-sm font-semibold hover:bg-surface-bright transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={editLoading || otpValue.length !== 6}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary text-sm font-bold hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {editLoading ? 'Verifying...' : 'Verify & Save'}
                  </button>
                </div>

                <button
                  onClick={async () => {
                    setEditError('');
                    try { await authAPI.sendChangeOtp(); }
                    catch { setEditError('Failed to resend OTP'); }
                  }}
                  className="w-full text-center text-xs text-primary hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ───────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-low rounded-2xl w-full max-w-sm shadow-2xl border border-error/20 overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-error text-2xl">warning</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface font-headline text-lg">Delete Account?</h3>
                <p className="text-on-surface-variant text-sm mt-2 leading-relaxed">
                  This will permanently delete your account and all scan history. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-surface-container-highest text-on-surface text-sm font-semibold hover:bg-surface-bright transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="flex-1 py-3 rounded-xl bg-error text-on-error text-sm font-bold hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
};

export default ProfilePage;
