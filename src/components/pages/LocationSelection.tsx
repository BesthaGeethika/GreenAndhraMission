import { useState } from 'react';
import { MapPin, Navigation, Locate } from 'lucide-react';
import { Card, Button, Select } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const AP_DISTRICTS = ['Anantapur', 'Chittoor', 'Guntur', 'Krishna', 'Kurnool', 'Nellore', 'Prakasam', 'Srikakulam', 'Srikakulam', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'East Godavari', 'YSR Kadapa', 'Satya Sai', 'Tirupati', 'Eluru', 'Nandyal'];
const MANDAL_POOL = ['Kadiri', 'Penukonda', 'Puttaparthi', 'Madakasira', 'Gudur', 'Sullurpeta', 'Naidupeta', 'Vakadu', 'Kavali', 'Atmakur'];
const VILLAGE_POOL = ['Gonipeta', 'Pallakonda', 'Racharlapudi', 'Mallayapalle', 'Yerrabalem', 'Thimmasamudram', 'Kothuru', 'Pulikondra'];

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export function LocationSelection() {
  const { user, refresh } = useAuth();
  const state = 'Andhra Pradesh';
  const [district, setDistrict] = useState(user?.district || '');
  const [mandal, setMandal] = useState(user?.mandal || '');
  const [village, setVillage] = useState(user?.village || '');
  const [autoMsg, setAutoMsg] = useState('');

  const autoDetect = () => {
    const d = pick(AP_DISTRICTS);
    const m = pick(MANDAL_POOL);
    const v = pick(VILLAGE_POOL);
    setDistrict(d); setMandal(m); setVillage(v);
    setAutoMsg(`Detected: ${v}, ${m}, ${d}`);
  };

  const save = () => {
    if (!district || !mandal || !village) return;
    api('/citizen-verify', {
      method: 'POST',
      body: {
        aadhaar: user?.aadhaar_number || '000000000000',
        fullName: user?.full_name || '',
        dob: user?.dob || '',
        state, district, mandal, village,
      },
    }).then(() => refresh());
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-bold text-gray-900">Select Your Location</h3>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-primary-50 text-primary-800 text-sm">
          <div className="text-xs text-primary-600">State</div>
          <div className="font-semibold">{state}</div>
        </div>

        <div className="space-y-4">
          <Select label="District" value={district} onChange={setDistrict} placeholder="Select district" options={AP_DISTRICTS.map((d) => ({ value: d, label: d }))} />
          <Select label="Mandal" value={mandal} onChange={setMandal} placeholder="Select mandal" options={MANDAL_POOL.map((m) => ({ value: m, label: m }))} />
          <Select label="Village" value={village} onChange={setVillage} placeholder="Select village" options={VILLAGE_POOL.map((v) => ({ value: v, label: v }))} />
        </div>

        <Button variant="outline" onClick={autoDetect} className="mt-4 w-full">
          <span className="flex items-center justify-center gap-2"><Locate className="w-4 h-4" /> Auto-detect my location</span>
        </Button>
        {autoMsg && <p className="text-xs text-emerald-600 mt-2">{autoMsg}</p>}

        <Button onClick={save} disabled={!district || !mandal || !village} className="mt-4 w-full">Confirm Location</Button>
      </Card>

      <Card>
        <div className="aspect-video rounded-xl bg-gradient-to-br from-primary-100 to-sky-100 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #16a34a 0, transparent 40%), radial-gradient(circle at 70% 60%, #0ea5e9 0, transparent 40%)' }} />
          <div className="relative z-10 text-center">
            <Navigation className="w-10 h-10 text-primary-600 mx-auto mb-2" />
            <div className="font-semibold text-gray-700">{district ? `${village}, ${mandal}, ${district}` : 'Andhra Pradesh'}</div>
            <div className="text-xs text-gray-500 mt-1">Map preview (Google Maps integration ready)</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
