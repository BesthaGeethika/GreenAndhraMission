import { useEffect, useState } from 'react';
import { TreePine, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, Button, Badge } from '../ui';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { TreeRegistration, PlantingLocation } from '../../types';

export function TreeRegistration() {
  const { user } = useAuth();
  const [regs, setRegs] = useState<TreeRegistration[]>([]);
  const [locations, setLocations] = useState<PlantingLocation[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState('');
  const [count, setCount] = useState(10);
  const [msg, setMsg] = useState('');

  const load = () => {
    api<{ data: TreeRegistration[] }>(`/registrations?user_id=${user!.id}`).then((r) => setRegs(r.data || []));
    api<{ data: PlantingLocation[] }>('/locations').then((r) => setLocations(r.data || []));
  };
  useEffect(() => { if (user) load(); }, [user]);

  const register = async () => {
    if (!selectedLoc) { setMsg('Please select a planting location.'); return; }
    const loc = locations.find((l) => l.id === selectedLoc);
    if (!loc) return;
    if (loc.assigned) { setMsg('This location is already assigned. Choose another.'); return; }
    const locationNumber = `${user!.district || 'AP'}-${user!.mandal || 'XX'}-${String(regs.length + 1).padStart(3, '0')}`;
    try {
      await api('/registrations', { method: 'POST', body: { locationId: selectedLoc, assignedTreeCount: count, locationNumber } });
      setMsg('Registration successful! Plant ID assigned.');
      setSelectedLoc(''); setAgreed(false);
      load();
    } catch (e: any) { setMsg(e.message); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tree Registration</h2>
        <p className="text-gray-500">Commit to planting trees in your assigned location.</p>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <TreePine className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-gray-900">Planting Agreement</h3>
        </div>
        <div className="rounded-xl bg-primary-50 p-4 mb-4 text-sm text-primary-800">
          I agree to plant and maintain the assigned trees at the selected location. I will upload monthly progress photos for AI verification and maintain tree health to earn rewards.
        </div>

        <label className="flex items-center gap-2 mb-4">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 rounded text-primary-600" />
          <span className="text-sm text-gray-700">I Agree to Plant Trees</span>
        </label>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <span className="text-sm font-medium text-gray-700 mb-1.5 block">Planting Location</span>
            <select value={selectedLoc} onChange={(e) => setSelectedLoc(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none bg-white">
              <option value="">Select location</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id} disabled={l.assigned}>{l.name} {l.assigned ? '(taken)' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 mb-1.5 block">Trees to Plant</span>
            <input type="number" value={count} min={1} onChange={(e) => setCount(+e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" />
          </div>
        </div>

        {msg && <div className="mt-3 flex items-center gap-2 text-sm text-amber-600"><AlertCircle className="w-4 h-4" /> {msg}</div>}

        <Button onClick={register} disabled={!agreed || !selectedLoc} className="mt-4 w-full">Register for Planting</Button>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">My Registrations</h3>
        {regs.length === 0 ? (
          <p className="text-gray-400 text-sm">No registrations yet.</p>
        ) : (
          <div className="space-y-2">
            {regs.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary-600" />
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{r.plant_id}</div>
                    <div className="text-xs text-gray-500">{r.location_number} · {r.assigned_tree_count} trees</div>
                  </div>
                </div>
                <Badge color={r.status === 'healthy' ? 'success' : r.status === 'moderate' ? 'warning' : 'error'}>{r.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
