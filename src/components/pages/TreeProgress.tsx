import { useEffect, useState } from 'react';
import { ImagePlus, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, Button, Badge } from '../ui';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { TreeRegistration, TreeProgress } from '../../types';

const MONTHS = [1, 2, 3, 4];
const PHOTOS = [
  'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg',
  'https://images.pexels.com/photos/60022/pexels-photo-60022.jpeg',
  'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg',
  'https://images.pexels.com/photos/60022/pexels-photo-60022.jpeg',
];

export function TreeProgress() {
  const { user } = useAuth();
  const [regs, setRegs] = useState<TreeRegistration[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [progress, setProgress] = useState<TreeProgress[]>([]);
  const [uploading, setUploading] = useState<number | null>(null);

  const loadRegs = () => api<{ data: TreeRegistration[] }>(`/registrations?user_id=${user!.id}`).then((r) => setRegs(r.data || []));
  useEffect(() => { if (user) loadRegs(); }, [user]);

  const loadProgress = async () => {
    if (!selected) return;
    const r = await api<{ data: TreeProgress[] }>(`/progress?registration_id=${selected}`);
    setProgress(r.data || []);
  };
  useEffect(() => { loadProgress(); }, [selected]);

  const upload = async (month: number) => {
    setUploading(month);
    try {
      await api('/progress', { method: 'POST', body: { registrationId: selected, monthNumber: month, photoUrl: PHOTOS[month - 1] } });
      await loadProgress();
      loadRegs();
    } catch { }
    setUploading(null);
  };

  if (regs.length === 0) {
    return <Card><p className="text-gray-400 text-sm">Register a tree first to upload progress.</p></Card>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tree Progress Tracking</h2>
        <p className="text-gray-500">Upload monthly photos for AI verification.</p>
      </div>

      <Card>
        <span className="text-sm font-medium text-gray-700 mb-1.5 block">Select Registration</span>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none bg-white">
          <option value="">Select a registration</option>
          {regs.map((r) => <option key={r.id} value={r.id}>{r.plant_id} · {r.location_number}</option>)}
        </select>
      </Card>

      {selected && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MONTHS.map((m) => {
            const p = progress.find((x) => x.month_number === m);
            return (
              <Card key={m}>
                <div className="aspect-square rounded-xl bg-gray-100 mb-3 overflow-hidden flex items-center justify-center">
                  {p?.photo_url ? (
                    <img src={p.photo_url} alt={`Month ${m}`} className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlus className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-gray-900">Month {m}</span>
                  {p && (
                    <Badge color={p.ai_status === 'Healthy' ? 'success' : p.ai_status === 'Moderate' ? 'warning' : 'error'}>
                      <Sparkles className="w-3 h-3 mr-1 inline" /> {p.ai_status}
                    </Badge>
                  )}
                </div>
                {p ? (
                  <p className="text-xs text-gray-500">{p.ai_note}</p>
                ) : (
                  <Button variant="outline" onClick={() => upload(m)} disabled={uploading === m} className="w-full text-sm py-2">
                    {uploading === m ? 'Verifying…' : 'Upload Photo'}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {progress.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-gray-900">AI Verification Summary</h3>
          </div>
          <div className="space-y-2">
            {progress.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-sm">
                <span>Month {p.month_number}</span>
                <span className="text-gray-500">{p.ai_note}</span>
                <Badge color={p.ai_status === 'Healthy' ? 'success' : p.ai_status === 'Moderate' ? 'warning' : 'error'}>{p.ai_status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
