import { useEffect, useState } from 'react';
import { Lightbulb, Plus } from 'lucide-react';
import { Card, Button, Input, Badge } from '../ui';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { Suggestion } from '../../types';

const CATEGORIES = ['Electric Buses', 'Solar Energy', 'Rainwater Harvesting', 'Pollution Control', 'Afforestation', 'Environmental Policy', 'Waste Management'];

export function Suggestions() {
  const { user } = useAuth();
  const isAdmin = user?.role !== 'citizen';
  const [items, setItems] = useState<Suggestion[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: CATEGORIES[0] });

  const load = () => api<{ data: Suggestion[] }>('/suggestions').then((r) => setItems(r.data || []));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.title) return;
    await api('/suggestions', { method: 'POST', body: form });
    setForm({ title: '', description: '', category: CATEGORIES[0] });
    setShowForm(false); load();
  };

  const update = async (id: string, status: string) => {
    await api(`/suggestions/${id}`, { method: 'PUT', body: { status } });
    load();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Improvement Suggestions</h2>
          <p className="text-gray-500">Submit and review environmental ideas.</p>
        </div>
        {!isAdmin && <Button onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4 mr-1" /> New Suggestion</Button>}
      </div>

      {showForm && (
        <Card>
          <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="e.g. Solar panels for govt schools" />
          <div className="mt-3">
            <span className="text-sm font-medium text-gray-700 mb-1.5 block">Description</span>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" placeholder="Describe your suggestion…" />
          </div>
          <div className="mt-3">
            <span className="text-sm font-medium text-gray-700 mb-1.5 block">Category</span>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none bg-white">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Button onClick={submit} className="mt-4">Submit</Button>
        </Card>
      )}

      {items.length === 0 ? (
        <Card><p className="text-gray-400 text-sm">No suggestions yet.</p></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((s) => (
            <Card key={s.id}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">{s.title}</div>
                  <Badge color="accent">{s.category}</Badge>
                </div>
                <Badge color={s.status === 'approved' ? 'success' : s.status === 'rejected' ? 'error' : s.status === 'reviewed' ? 'primary' : 'warning'}>{s.status}</Badge>
              </div>
              {s.description && <p className="text-sm text-gray-600 mt-3">{s.description}</p>}
              <div className="text-xs text-gray-400 mt-3">By {s.users?.full_name || 'Citizen'} · {new Date(s.created_at).toLocaleDateString()}</div>
              {isAdmin && s.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" onClick={() => update(s.id, 'approved')} className="text-xs py-1.5">Approve</Button>
                  <Button variant="danger" onClick={() => update(s.id, 'rejected')} className="text-xs py-1.5">Reject</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
