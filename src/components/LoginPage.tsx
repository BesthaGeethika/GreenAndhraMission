import { useState } from 'react';
import { Sprout, Shield, HelpCircle, Mail, Lock, User as UserIcon, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui';

const PASSWORD_RE = /^GreenAndhra@(\d{2})(\d{2})(\d{4})$/;

export function LoginPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState(''); // DDMMYYYY
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const pwValid = PASSWORD_RE.test(password);
  const dobMatch = password.endsWith('@' + dob);

  const formatDobInput = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 8);
    return d;
  };

  const submit = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill all fields.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!pwValid) {
      setError('Password must follow the pattern GreenAndhra@DDMMYYYY');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!fullName || !dob) {
          setError('Full name and Date of Birth are required.');
          setBusy(false);
          return;
        }
        if (!dobMatch) {
          setError('The DOB in your password must match your Date of Birth.');
          setBusy(false);
          return;
        }
        await signup(email, password, fullName, dob);
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-primary-50 via-white to-sky-50">
      {/* Hero side */}
      <div className="lg:w-1/2 bg-gradient-to-br from-primary-700 to-primary-900 text-white p-10 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center ring-1 ring-white/20">
              <Sprout className="w-8 h-8" />
            </div>
            <div>
              <div className="font-bold text-xl leading-tight">Green Andhra Mission</div>
              <div className="text-primary-200 text-sm">Government of Andhra Pradesh</div>
            </div>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
            Restore balance.<br />Plant the future.
          </h1>
          <p className="text-primary-100 text-lg max-w-md leading-relaxed">
            A citizen-driven mission to revive rainfall, recharge groundwater, and rebuild a greener Andhra Pradesh — one tree at a time.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4 mt-10">
          {[
            { label: 'Trees planted', value: '12,480' },
            { label: 'Districts', value: '13' },
            { label: 'Citizens', value: '8,920' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur rounded-xl p-3 ring-1 ring-white/10">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-primary-200">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form side */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{mode === 'login' ? 'Citizen Login' : 'Create Account'}</h2>
            <p className="text-gray-500 mt-1">
              {mode === 'login' ? 'Sign in to continue your green journey.' : 'Join the Green Andhra Mission today.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          <div className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Any valid email address is accepted.</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="GreenAndhra@DDMMYYYY"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition font-mono"
                />
              </div>
              <p className={`text-xs mt-1 ${pwValid ? 'text-emerald-600' : 'text-gray-400'}`}>
                Format: GreenAndhra@DDMMYYYY (your Aadhaar date of birth)
              </p>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Date of Birth (DDMMYYYY)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={dob}
                    onChange={(e) => setDob(formatDobInput(e.target.value))}
                    placeholder="15082001"
                    maxLength={8}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition font-mono"
                  />
                </div>
                {dob && dobMatch && <p className="text-xs text-emerald-600 mt-1">Matches password DOB ✓</p>}
                {dob && !dobMatch && <p className="text-xs text-red-500 mt-1">Must match the DOB in your password.</p>}
              </div>
            )}
          </div>

          <Button onClick={submit} disabled={busy} className="w-full mt-6 py-3">
            {busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create Account'}
          </Button>

          <div className="flex items-center justify-between mt-5">
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-sm text-primary-700 font-medium hover:underline">
              {mode === 'login' ? 'New user? Sign up' : 'Already have an account? Login'}
            </button>
            <button onClick={() => setShowHelp(true)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Forgot Password
            </button>
          </div>

          <button onClick={() => setShowHelp(true)} className="mt-6 w-full text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1.5">
            <HelpCircle className="w-4 h-4" /> Help & password format
          </button>
        </div>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-lg">Password Format</h3>
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          <p>Your password must follow this exact pattern:</p>
          <div className="bg-primary-50 rounded-xl p-4 font-mono text-primary-800 text-center">GreenAndhra@DDMMYYYY</div>
          <p>
            Where <b>DDMMYYYY</b> is your Aadhaar date of birth. Example: if your DOB is 15 August 2001, your password is:
          </p>
          <div className="bg-primary-50 rounded-xl p-4 font-mono text-primary-800 text-center">GreenAndhra@15082001</div>
          <p className="text-xs text-gray-500">This same DOB is used to verify your identity across the application.</p>
        </div>
        <Button onClick={onClose} className="w-full mt-5">Got it</Button>
      </div>
    </div>
  );
}
