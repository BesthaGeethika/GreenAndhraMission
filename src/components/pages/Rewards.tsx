import { useEffect, useState } from 'react';
import { Wallet, Banknote, ShieldCheck } from 'lucide-react';
import { Card, Button, Input, StatCard, Badge } from '../ui';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { Reward } from '../../types';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export function Rewards() {
  const { user } = useAuth();
  const isAdmin = user?.role !== 'citizen';
  const [bank, setBank] = useState(user?.bank_account_number || '');
  const [ifsc, setIfsc] = useState(user?.ifsc_code || '');
  const [holder, setHolder] = useState(user?.account_holder_name || '');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [allRewards, setAllRewards] = useState<Reward[]>([]);
  const [saved, setSaved] = useState(false);

  const load = () => api<{ data: Reward[] }>('/rewards').then((r) => {
    setAllRewards(r.data || []);
    setRewards((r.data || []).filter((x) => x.user_id === user!.id));
  });
  useEffect(() => { if (user) load(); }, [user]);

  const saveBank = async () => {
    await api('/rewards/bank', { method: 'POST', body: { bankAccountNumber: bank, ifscCode: ifsc, accountHolderName: holder } });
    setSaved(true);
  };

  const approveReward = async (id: string, status: string) => {
    await api(`/rewards/${id}`, { method: 'PUT', body: { status } });
    load();
  };

  const totalEarned = rewards.filter((r) => r.status === 'paid').reduce((a, r) => a + r.amount, 0);
  const pending = rewards.filter((r) => r.status === 'pending').length;

  if (isAdmin) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Reward Approvals</h2>
        {allRewards.length === 0 ? (
          <Card><p className="text-gray-400 text-sm">No reward requests yet.</p></Card>
        ) : (
          <Card>
            <div className="space-y-2">
              {allRewards.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <div className="font-medium text-sm text-gray-900">{r.month} · ₹{r.amount}</div>
                    <div className="text-xs text-gray-500">User: {r.user_id.slice(0, 8)}…</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={r.status === 'paid' ? 'success' : r.status === 'approved' ? 'primary' : r.status === 'rejected' ? 'error' : 'warning'}>{r.status}</Badge>
                    {r.status === 'pending' && (
                      <>
                        <Button variant="outline" onClick={() => approveReward(r.id, 'approved')} className="text-xs py-1.5">Approve</Button>
                        <Button variant="danger" onClick={() => approveReward(r.id, 'rejected')} className="text-xs py-1.5">Reject</Button>
                      </>
                    )}
                    {r.status === 'approved' && <Button variant="primary" onClick={() => approveReward(r.id, 'paid')} className="text-xs py-1.5">Mark Paid</Button>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reward Management</h2>
        <p className="text-gray-500">Bank details and monthly incentives.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Total Earned" value={`₹${totalEarned}`} icon={<Wallet className="w-6 h-6" />} accent="success" />
        <StatCard label="Pending Rewards" value={pending} icon={<Banknote className="w-6 h-6" />} accent="warning" />
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Banknote className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-gray-900">Bank Account Details</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label="Account Number" value={bank} onChange={(v) => setBank(v.replace(/\D/g, ''))} placeholder="Account number" />
          <Input label="IFSC Code" value={ifsc} onChange={setIfsc} placeholder="SBIN0001234" />
          <div className="sm:col-span-2">
            <Input label="Account Holder Name" value={holder} onChange={setHolder} placeholder="As per bank records" />
          </div>
        </div>
        {saved && <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Bank details saved and submitted for verification.</p>}
        <Button onClick={saveBank} disabled={!bank || !ifsc || !holder} className="mt-4">Submit for Verification</Button>
      </Card>

      <Card>
        <h3 className="font-bold text-gray-900 mb-4">Reward History</h3>
        {rewards.length === 0 ? (
          <p className="text-gray-400 text-sm">No rewards yet. Maintain healthy trees to earn ₹100–₹300 monthly.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-gray-400 border-b border-gray-100">
              <tr><th className="py-2">Month</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rewards.map((r) => (
                <tr key={r.id} className="border-b border-gray-50">
                  <td className="py-2">{r.month}</td>
                  <td>₹{r.amount}</td>
                  <td><Badge color={r.status === 'paid' ? 'success' : r.status === 'approved' ? 'primary' : r.status === 'rejected' ? 'error' : 'warning'}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
