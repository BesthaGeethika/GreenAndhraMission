import { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../ui';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const DISTRICTS = ['Anantapur', 'Chittoor', 'Guntur', 'Krishna', 'Kurnool', 'Nellore', 'Prakasam', 'Sri Potti Sriramulu Nellore', 'Srikakulam', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'East Godavari', 'YSR Kadapa', 'Satya Sai'];

export function CitizenVerification() {
  const { user, refresh } = useAuth();
  const [aadhaar, setAadhaar] = useState(user?.aadhaar_number || '');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [dob, setDob] = useState('');
  const [district, setDistrict] = useState(user?.district || '');
  const [mandal, setMandal] = useState(user?.mandal || '');
  const [village, setVillage] = useState(user?.village || '');
  const [error, setError] = useState('');
  const [done, setDone] = useState(!!user?.aadhaar_number);

  const submit = async () => {
    setError('');
    if (!/^\d{12}$/.test(aadhaar)) { setError('Aadhaar must be a 12-digit number.'); return; }
    if (!fullName || !dob || !district || !mandal || !village) { setError('All fields are required.'); return; }
    try {
      await api('/citizen-verify', {
        method: 'POST',
        body: { aadhaar, fullName, dob, state: 'Andhra Pradesh', district, mandal, village },
      });
      await refresh();
      setDone(true);
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (done && user?.aadhaar_number) {
    return (
      <Card className="max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Verification Complete</h3>
        <p className="text-gray-500 mt-1">Your identity has been verified against your login DOB.</p>
        <div className="mt-6 grid sm:grid-cols-2 gap-3 text-left">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400">Aadhaar</div>
            <div className="font-medium text-gray-900">XXXX-XXXX-{user.aadhaar_number?.slice(-4)}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400">District / Mandal</div>
            <div className="font-medium text-gray-900">{user.district} / {user.mandal}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400">Village</div>
            <div className="font-medium text-gray-900">{user.village}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400">DOB used at login</div>
            <div className="font-medium text-gray-900">{user.dob}</div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-bold text-gray-900">Citizen Verification</h3>
        </div>
        <p className="text-sm text-gray-500 mb-5">Enter your Aadhaar and the DOB used at login. The DOB must match.</p>

        {error && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Aadhaar Number" value={aadhaar} onChange={(v) => setAadhaar(v.replace(/\D/g, '').slice(0, 12))} placeholder="123456789012" />
          <Input label="Full Name" value={fullName} onChange={setFullName} placeholder="Full name" />
          <Input label="Date of Birth (DDMMYYYY)" value={dob} onChange={(v) => setDob(v.replace(/\D/g, '').slice(0, 8))} placeholder="15082001" hint="Must match the DOB in your login password" />
          <Select label="District" value={district} onChange={setDistrict} placeholder="Select district" options={DISTRICTS.map((d) => ({ value: d, label: d }))} />
          <Input label="Mandal" value={mandal} onChange={setMandal} placeholder="e.g. Kadiri" />
          <Input label="Village" value={village} onChange={setVillage} placeholder="e.g. Gonipeta" />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Badge color={dob === user?.dob ? 'success' : dob ? 'error' : 'gray'}>
            {dob === user?.dob ? 'DOB matches login ✓' : dob ? 'DOB does NOT match login ✗' : 'Awaiting DOB'}
          </Badge>
        </div>

        <Button onClick={submit} className="w-full mt-6">Verify Identity</Button>
      </Card>
    </div>
  );
}
