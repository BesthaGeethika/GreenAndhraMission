import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { WelcomePopup } from './components/WelcomePopup';
import { DashboardLayout, Page } from './components/DashboardLayout';
import { Chatbot } from './components/Chatbot';
import { CitizenDashboard } from './components/pages/CitizenDashboard';
import { CitizenVerification } from './components/pages/CitizenVerification';
import { LocationSelection } from './components/pages/LocationSelection';
import { ClimateDashboard } from './components/pages/ClimateDashboard';
import { TreeRegistration } from './components/pages/TreeRegistration';
import { PlantingLocations } from './components/pages/PlantingLocations';
import { TreeProgress } from './components/pages/TreeProgress';
import { Rewards } from './components/pages/Rewards';
import { Suggestions } from './components/pages/Suggestions';
import { AdminPanel } from './components/pages/AdminPanel';
import { Reports } from './components/pages/Reports';

function Shell() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (user && !localStorage.getItem('gam_welcomed')) setShowWelcome(true);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading Green Andhra Mission…</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const isAdmin = user.role !== 'citizen';

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return isAdmin ? <CitizenDashboard /> : <CitizenDashboard />;
      case 'verification': return <CitizenVerification />;
      case 'location': return <LocationSelection />;
      case 'climate': return <ClimateDashboard officer={isAdmin} />;
      case 'registration': return <TreeRegistration />;
      case 'planting': return <PlantingLocations />;
      case 'progress': return <TreeProgress />;
      case 'rewards': return <Rewards />;
      case 'suggestions': return <Suggestions />;
      case 'admin': return <AdminPanel />;
      case 'reports': return <Reports />;
      default: return <CitizenDashboard />;
    }
  };

  // Redirect citizen to their dashboard if they pick an officer-only page
  const allowedForCitizen: Page[] = ['dashboard', 'verification', 'location', 'registration', 'planting', 'progress', 'rewards', 'suggestions'];
  if (!isAdmin && !allowedForCitizen.includes(page)) setPage('dashboard');

  return (
    <>
      {showWelcome && <WelcomePopup onClose={() => setShowWelcome(false)} />}
      <DashboardLayout page={page} setPage={setPage}>
        {renderPage()}
      </DashboardLayout>
      <Chatbot />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
