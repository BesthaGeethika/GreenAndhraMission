import { useEffect, useState } from 'react';
import { TreePine, Heart, Clock, Wallet, CloudSun, TrendingUp } from 'lucide-react';
import { StatCard, Card } from '../ui';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { TreeRegistration, Reward } from '../../types';

export function CitizenDashboard() {
  const { user } = useAuth();
  const [regs, setRegs] = useState<TreeRegistration[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    if (!user) return;
    api<{ data: TreeRegistration[] }>(`/registrations?user_id=${user.id}`).then((r) => setRegs(r.data || []));
    api<{ data: Reward[] }>(`/rewards?user_id=${user.id}`).then((r) => setRewards(r.data || []));
  }, [user]);

  const alive = regs.filter((r) => ['healthy', 'moderate'].includes(r.status)).length;
  const review = regs.filter((r) => r.status === 'pending' || r.status === 'needs_attention').length;
  const assigned = regs.reduce((a, r) => a + (r.assigned_tree_count || 0), 0);
  const earned = rewards.filter((r) => r.status === 'paid').reduce((a, r) => a + r.amount, 0);
  const score = assigned ? Math.round((alive / assigned) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name?.split(' ')[0]} 🌱</h2>
        <p className="text-gray-500">Your climate contribution overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Trees Assigned" value={assigned} icon={<TreePine className="w-6 h-6" />} accent="primary" />
        <StatCard label="Trees Alive" value={alive} icon={<Heart className="w-6 h-6" />} accent="success" />
        <StatCard label="Under Review" value={review} icon={<Clock className="w-6 h-6" />} accent="warning" />
        <StatCard label="Rewards Earned" value={`₹${earned}`} icon={<Wallet className="w-6 h-6" />} accent="accent" />
        <StatCard label="Climate Score" value={`${score}%`} icon={<TrendingUp className="w-6 h-6" />} accent="primary" />
        <StatCard label="Registrations" value={regs.length} icon={<CloudSun className="w-6 h-6" />} accent="accent" />
      </div>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">My Tree Registrations</h3>
        {regs.length === 0 ? (
          <p className="text-gray-400 text-sm">No registrations yet. Visit Tree Registration to plant your first tree.</p>
        ) : (
          <div className="space-y-2">
            {regs.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{r.plant_id}</div>
                  <div className="text-xs text-gray-500">{r.location_number} · {r.assigned_tree_count} trees</div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  r.status === 'healthy' ? 'bg-emerald-100 text-emerald-700' :
                  r.status === 'moderate' ? 'bg-amber-100 text-amber-700' :
                  r.status === 'needs_attention' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
