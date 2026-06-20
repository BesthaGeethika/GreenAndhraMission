import { useEffect, useState } from 'react';
import { CloudRain, Trees, Droplets, Wind, Factory, Thermometer, Plus } from 'lucide-react';
import { Card, Button, Input, StatCard, Badge } from '../ui';
import { api } from '../../lib/api';
import type { ClimateData } from '../../types';

export function ClimateDashboard({ officer = false }: { officer?: boolean }) {
  const [rows, setRows] = useState<ClimateData[]>([]);
  const [form, setForm] = useState<any>({ district: '', mandal: '', trees_existing: 100, trees_cut: 0, groundwater_level: 10, air_quality: 'Good', industrial_pollution: 'Low', rainfall: 600, temperature: 28 });

  const load = () => api<{ data: ClimateData[] }>('/climate').then((r) => setRows(r.data || []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.district || !form.mandal) return;
    await api('/climate', { method: 'POST', body: form });
    await load();
  };

  // Mock AI Tree Deficit Score
  const computeDeficit = (r: ClimateData) => {
    const required = Math.max(0, Math.round((r.trees_cut * 1.5) + (r.groundwater_level < 8 ? 20 : 0)));
    const greenCoverage = Math.min(100, Math.round((r.trees_existing / (r.trees_existing + r.trees_cut + 1)) * 100));
    return {
      required,
      greenCoverage,
      priority: required > 15 ? 'High' : required > 5 ? 'Medium' : 'Low',
      score: Math.min(100, Math.round(greenCoverage - r.industrial_pollution.length)),
    };
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Government Climate Analysis</h2>
        <p className="text-gray-500">AI-powered Tree Deficit Score per mandal.</p>
      </div>

      {officer && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-gray-900">Update Climate Data</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input label="District" value={form.district} onChange={(v) => setForm({ ...form, district: v })} placeholder="e.g. Anantapur" />
            <Input label="Mandal" value={form.mandal} onChange={(v) => setForm({ ...form, mandal: v })} placeholder="e.g. Kadiri" />
            <Input label="Trees Existing" type="number" value={String(form.trees_existing)} onChange={(v) => setForm({ ...form, trees_existing: +v })} />
            <Input label="Trees Cut" type="number" value={String(form.trees_cut)} onChange={(v) => setForm({ ...form, trees_cut: +v })} />
            <Input label="Groundwater Level (m)" type="number" value={String(form.groundwater_level)} onChange={(v) => setForm({ ...form, groundwater_level: +v })} />
            <Input label="Air Quality" value={form.air_quality} onChange={(v) => setForm({ ...form, air_quality: v })} />
            <Input label="Industrial Pollution" value={form.industrial_pollution} onChange={(v) => setForm({ ...form, industrial_pollution: v })} />
            <Input label="Rainfall (mm)" type="number" value={String(form.rainfall)} onChange={(v) => setForm({ ...form, rainfall: +v })} />
            <Input label="Temperature (°C)" type="number" value={String(form.temperature)} onChange={(v) => setForm({ ...form, temperature: +v })} />
          </div>
          <Button onClick={save} className="mt-4">Add Record</Button>
        </Card>
      )}

      {rows.length === 0 ? (
        <Card><p className="text-gray-400 text-sm">No climate records yet.</p></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {rows.map((r) => {
            const d = computeDeficit(r);
            return (
              <Card key={r.id}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{r.mandal}, {r.district}</div>
                    <div className="text-xs text-gray-400">Updated {new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                  <Badge color={d.priority === 'High' ? 'error' : d.priority === 'Medium' ? 'warning' : 'success'}>{d.priority} Priority</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2"><Trees className="w-4 h-4 text-primary-600" /> Trees: {r.trees_existing}</div>
                  <div className="flex items-center gap-2"><Wind className="w-4 h-4 text-sky-600" /> Cut: {r.trees_cut}</div>
                  <div className="flex items-center gap-2"><Droplets className="w-4 h-4 text-blue-600" /> GW: {r.groundwater_level}m</div>
                  <div className="flex items-center gap-2"><CloudRain className="w-4 h-4 text-indigo-600" /> Rain: {r.rainfall}mm</div>
                  <div className="flex items-center gap-2"><Thermometer className="w-4 h-4 text-orange-600" /> {r.temperature}°C</div>
                  <div className="flex items-center gap-2"><Factory className="w-4 h-4 text-gray-600" /> Pollution: {r.industrial_pollution}</div>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-primary-50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-700 font-medium">Green Coverage</span>
                    <span className="font-bold text-primary-800">{d.greenCoverage}%</span>
                  </div>
                  <div className="h-2 bg-white rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-primary-600" style={{ width: `${d.greenCoverage}%` }} />
                  </div>
                  <div className="mt-2 text-xs text-primary-700">Required Trees: <b>{d.required}</b> · Score: <b>{d.score}</b></div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
