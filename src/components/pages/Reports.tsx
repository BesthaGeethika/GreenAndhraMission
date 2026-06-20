import { useEffect, useState } from 'react';
import { BarChart3, Map, TrendingUp, Droplets, Award } from 'lucide-react';
import { Card, StatCard } from '../ui';
import { api } from '../../lib/api';

export function Reports() {
  const [data, setData] = useState<any>({});
  useEffect(() => { api('/analytics').then((r) => setData(r)); }, []);

  const regs: any[] = data.registrations || [];
  const cl: any[] = data.climate || [];
  const users: any[] = data.users || [];
  const suggestions: any[] = data.suggestions || [];

  const byDistrict: Record<string, number> = {};
  regs.forEach((r) => {
    const d = r.planting_locations?.district || 'Unknown';
    byDistrict[d] = (byDistrict[d] || 0) + (r.assigned_tree_count || 0);
  });
  const districtBars = Object.entries(byDistrict).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxBar = Math.max(1, ...districtBars.map(([, v]) => v));

  const gwAvg = cl.length ? Math.round(cl.reduce((a, c) => a + Number(c.groundwater_level || 0), 0) / cl.length) : 0;
  const rainAvg = cl.length ? Math.round(cl.reduce((a, c) => a + Number(c.rainfall || 0), 0) / cl.length) : 0;

  // Top contributors by registration count (mock: group by user_id)
  const contrib: Record<string, number> = {};
  regs.forEach((r) => { contrib[r.user_id] = (contrib[r.user_id] || 0) + (r.assigned_tree_count || 0); });
  const topContrib = Object.entries(contrib).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-500">District-wise climate and participation insights.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Registrations" value={regs.length} icon={<BarChart3 className="w-6 h-6" />} accent="primary" />
        <StatCard label="Avg Groundwater" value={`${gwAvg}m`} icon={<Droplets className="w-6 h-6" />} accent="accent" />
        <StatCard label="Avg Rainfall" value={`${rainAvg}mm`} icon={<TrendingUp className="w-6 h-6" />} accent="success" />
        <StatCard label="Participants" value={users.length} icon={<Award className="w-6 h-6" />} accent="warning" />
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-gray-900">District-wise Tree Coverage</h3>
        </div>
        {districtBars.length === 0 ? (
          <p className="text-gray-400 text-sm">No data yet.</p>
        ) : (
          <div className="space-y-3">
            {districtBars.map(([d, v]) => (
              <div key={d}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{d}</span>
                  <span className="font-semibold text-gray-900">{v} trees</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all" style={{ width: `${(v / maxBar) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-gray-900">Rainfall Trends</h3>
          </div>
          <div className="flex items-end gap-2 h-40">
            {cl.slice(0, 6).map((c, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end">
                <div className="w-full bg-sky-400 rounded-t-lg" style={{ height: `${Math.min(100, (Number(c.rainfall || 0) / 1000) * 100)}%` }} />
                <div className="text-[10px] text-gray-400 mt-1 truncate w-full text-center">{c.mandal?.slice(0, 6)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-gray-900">Top Contributors</h3>
          </div>
          {topContrib.length === 0 ? (
            <p className="text-gray-400 text-sm">No contributors yet.</p>
          ) : (
            <div className="space-y-2">
              {topContrib.map(([uid, count], i) => (
                <div key={uid} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                    {i + 1}
                  </div>
                  <div className="text-sm text-gray-700 font-medium">{uid.slice(0, 8)}…</div>
                  <div className="ml-auto text-sm font-semibold text-gray-900">{count} trees</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Map className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-gray-900">GIS Heat Map Preview</h3>
        </div>
        <div className="aspect-[2/1] rounded-xl bg-gradient-to-br from-emerald-50 to-amber-50 relative overflow-hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 35%, rgba(220,38,38,0.4) 0, transparent 18%), radial-gradient(circle at 55% 50%, rgba(217,119,6,0.4) 0, transparent 20%), radial-gradient(circle at 75% 40%, rgba(34,197,94,0.4) 0, transparent 18%), radial-gradient(circle at 40% 70%, rgba(217,119,6,0.3) 0, transparent 16%)',
          }} />
          <div className="absolute bottom-3 left-3 flex gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Healthy</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500" /> Moderate</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" /> At Risk</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
