import { useEffect, useState } from 'react';
import { Users, ScrollText, CheckSquare } from 'lucide-react';
import { Card, StatCard, Badge } from '../ui';
import { api } from '../../lib/api';

export function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    api<{ data: any[] }>('/admin/users').then((r) => setUsers(r.data || []));
    api<{ data: any[] }>('/admin/logs').then((r) => setLogs(r.data || []));
  }, []);

  const officers = users.filter((u) => u.role !== 'citizen').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
        <p className="text-gray-500">Manage citizens, officers, and monitor activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Users" value={users.length} icon={<Users className="w-6 h-6" />} accent="primary" />
        <StatCard label="Officers" value={officers} icon={<CheckSquare className="w-6 h-6" />} accent="accent" />
        <StatCard label="Audit Logs" value={logs.length} icon={<ScrollText className="w-6 h-6" />} accent="warning" />
      </div>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Registered Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-400 border-b border-gray-100">
              <tr><th className="py-2">Name</th><th>Email</th><th>Role</th><th>District</th><th>DOB</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50">
                  <td className="py-2 font-medium text-gray-900">{u.full_name}</td>
                  <td className="text-gray-500">{u.email}</td>
                  <td><Badge color={u.role === 'citizen' ? 'primary' : 'accent'}>{u.role.replace(/_/g, ' ')}</Badge></td>
                  <td className="text-gray-500">{u.district || '—'}</td>
                  <td className="text-gray-500 font-mono text-xs">{u.dob}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Audit Logs</h3>
        {logs.length === 0 ? (
          <p className="text-gray-400 text-sm">No activity logged yet.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {logs.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 text-sm">
                <div>
                  <div className="font-medium text-gray-800">{l.action}</div>
                  <div className="text-xs text-gray-500">{l.detail} · {l.user_email}</div>
                </div>
                <span className="text-xs text-gray-400">{new Date(l.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
