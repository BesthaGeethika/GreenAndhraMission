import { useState, ReactNode } from 'react';
import {
  Sprout, LayoutDashboard, MapPin, TreePine, Image as ImageIcon, Wallet,
  Lightbulb, CloudRain, Settings, BarChart3, Users, LogOut, Map, Menu, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from './ui';
import type { Role } from '../types';

export type Page =
  | 'dashboard' | 'verification' | 'location' | 'climate' | 'registration'
  | 'planting' | 'progress' | 'rewards' | 'suggestions' | 'admin' | 'reports';

const CITIZEN_NAV: { id: Page; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { id: 'verification', label: 'Citizen Verification', icon: Users },
  { id: 'location', label: 'Location Selection', icon: MapPin },
  { id: 'registration', label: 'Tree Registration', icon: TreePine },
  { id: 'planting', label: 'Planting Locations', icon: Map },
  { id: 'progress', label: 'Tree Progress', icon: ImageIcon },
  { id: 'rewards', label: 'Rewards', icon: Wallet },
  { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
];

const OFFICER_NAV: { id: Page; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'climate', label: 'Climate Dashboard', icon: CloudRain },
  { id: 'planting', label: 'Planting Locations', icon: Map },
  { id: 'rewards', label: 'Reward Approval', icon: Wallet },
  { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
  { id: 'admin', label: 'Admin Panel', icon: Settings },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export function DashboardLayout({
  page,
  setPage,
  children,
}: {
  page: Page;
  setPage: (p: Page) => void;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user?.role !== 'citizen';
  const nav = isAdmin ? OFFICER_NAV : CITIZEN_NAV;

  const NavItem = ({ item }: { item: { id: Page; label: string; icon: any } }) => {
    const Icon = item.icon;
    const active = page === item.id;
    return (
      <button
        onClick={() => { setPage(item.id); setMobileOpen(false); }}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
          active ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
        }`}
      >
        <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
        {item.label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm text-gray-900 leading-tight">Green Andhra</div>
              <div className="text-xs text-gray-400">Mission Portal</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => <NavItem key={item.id} item={item} />)}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="px-3 py-2 mb-1">
            <div className="text-sm font-medium text-gray-700 truncate">{user?.full_name}</div>
            <div className="text-xs text-gray-400 truncate">{user?.email}</div>
            <div className="mt-1.5">
              <Badge color={isAdmin ? 'accent' : 'primary'}>
                {user?.role.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 lg:px-8 py-3.5">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-semibold text-gray-900 capitalize">
              {nav.find((n) => n.id === page)?.label || 'Dashboard'}
            </h1>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-primary-600" />
              {user?.district ? `${user.district}, ${user.mandal || ''}` : 'Andhra Pradesh'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
