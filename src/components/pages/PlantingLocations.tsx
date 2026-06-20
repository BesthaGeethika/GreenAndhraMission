import { useEffect, useState } from 'react';
import { Map, MapPin, Plus, Navigation } from 'lucide-react';
import { Card, Button, Input, Badge } from '../ui';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { PlantingLocation } from '../../types';

export function PlantingLocations() {
  const { user } = useAuth();
  const isAdmin = user?.role !== 'citizen';
  const [locs, setLocs] = useState<PlantingLocation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');

  const load = () => api<{ data: PlantingLocation[] }>('/locations').then((r) => setLocs(r.data || []));
  useEffect(() => { load(); }, []);

  const addLoc = async () => {
    if (!name) return;
    const idx = `Location ${locs.length + 1}`;
    await api('/locations', { method: 'POST', body: { name: name || idx, district: user?.district, mandal: user?.mandal, village, gps_lat: 14 + Math.random(), gps_lng: 79 + Math.random() } });
    setName(''); setVillage(''); setShowForm(false); load();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Planting Locations</h2>
          <p className="text-gray-500">Available spots for tree plantation.</p>
        </div>
        {isAdmin && <Button onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4 mr-1" /> Add</Button>}
      </div>

      {showForm && (
        <Card>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="Location Name" value={name} onChange={setName} placeholder="Location 1" />
            <Input label="Village" value={village} onChange={setVillage} placeholder="Village" />
          </div>
          <Button onClick={addLoc} className="mt-4">Create Location</Button>
        </Card>
      )}

      <Card>
        <div className="aspect-[2/1] rounded-xl bg-gradient-to-br from-primary-100 via-emerald-50 to-sky-100 mb-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #16a34a 0, transparent 25%), radial-gradient(circle at 50% 60%, #0ea5e9 0, transparent 25%), radial-gradient(circle at 80% 40%, #16a34a 0, transparent 25%)' }} />
          {locs.slice(0, 6).map((l, i) => (
            <div key={l.id} className="absolute" style={{ left: `${15 + i * 13}%`, top: `${30 + (i % 3) * 20}%` }}>
              <MapPin className={`w-6 h-6 ${l.assigned ? 'text-gray-400' : 'text-primary-600'}`} />
            </div>
          ))}
          <div className="absolute bottom-3 left-3 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">GIS Map preview</div>
        </div>

        {locs.length === 0 ? (
          <p className="text-gray-400 text-sm">No planting locations created yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {locs.map((l) => (
              <div key={l.id} className="border border-gray-100 rounded-xl p-4 hover:border-primary-200 transition">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Map className="w-4 h-4 text-primary-600" />
                    <div className="font-medium text-gray-900">{l.name}</div>
                  </div>
                  <Badge color={l.assigned ? 'gray' : 'success'}>{l.assigned ? 'Assigned' : 'Available'}</Badge>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  {l.village && <div>{l.village}, {l.mandal}, {l.district}</div>}
                  {l.gps_lat && <div>GPS: {l.gps_lat?.toFixed(4)}, {l.gps_lng?.toFixed(4)}</div>}
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 flex items-center justify-center gap-1">
                    <Navigation className="w-3 h-3" /> Directions
                  </button>
                  <button className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100">Distance</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
