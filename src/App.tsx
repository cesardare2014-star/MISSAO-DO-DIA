import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Gatekeeper from './pages/Gatekeeper';
import ParentLogin from './pages/ParentLogin';
import ParentDashboard from './pages/ParentDashboard';
import ParentChildren from './pages/ParentChildren';
import ParentTasks from './pages/ParentTasks';
import ParentRewards from './pages/ParentRewards';
import ParentApprovals from './pages/ParentApprovals';
import ParentSettings from './pages/ParentSettings';
import ParentFamilyChest from './pages/ParentFamilyChest';
import ChildSelect from './pages/ChildSelect';
import ChildDashboard from './pages/ChildDashboard';
import Premium from './pages/Premium';

function ThemedApp({ children }: { children: React.ReactNode }) {
  const { state } = useApp();

  return (
    <div className={state.theme === 'dark' ? 'dark-theme' : 'light-theme'}>
      <div
        className="min-h-screen transition-colors duration-500"
        style={{
          background: state.theme === 'dark'
            ? 'linear-gradient(135deg, #0f0a2e 0%, #1a1050 40%, #0d0b2a 100%)'
            : 'linear-gradient(135deg, #fef9f0 0%, #f0e6ff 40%, #fef3c7 100%)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Gatekeeper />} />
      <Route path="/parent-login" element={<ParentLogin />} />
      <Route path="/parent" element={<ParentDashboard />} />
      <Route path="/parent/children" element={<ParentChildren />} />
      <Route path="/parent/tasks" element={<ParentTasks />} />
      <Route path="/parent/rewards" element={<ParentRewards />} />
      <Route path="/parent/approvals" element={<ParentApprovals />} />
      <Route path="/parent/settings" element={<ParentSettings />} />
      <Route path="/parent/family-chest" element={<ParentFamilyChest />} />
      <Route path="/child-select" element={<ChildSelect />} />
      <Route path="/child/:childId" element={<ChildDashboard />} />
      <Route path="/premium" element={<Premium />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ThemedApp>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemedApp>
    </AppProvider>
  );
}
