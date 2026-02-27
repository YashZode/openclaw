import { AnimatePresence } from "framer-motion";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AppShell from "./components/AppShell";
import OwnerGate from "./components/OwnerGate";
import { useAuth } from "./lib/auth";
import Auth from "./routes/Auth";
import HangDetail from "./routes/HangDetail";
import Home from "./routes/Home";
import OwnerHub from "./routes/OwnerHub";
import Profile from "./routes/Profile";
import VenueDiscovery from "./routes/VenueDiscovery";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (import.meta.env.VITE_DEV_MODE === "true") {
    return <>{children}</>;
  }
  if (loading) {
    return null;
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const location = useLocation();

  // Auth landing page — no shell
  if (location.pathname === "/") {
    return (
      <div className="min-h-screen bg-navy-900 paper-grain relative">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Auth />} />
          </Routes>
        </AnimatePresence>
      </div>
    );
  }

  // All authenticated routes — wrapped in AppShell
  return (
    <RequireAuth>
      <AppShell>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/home" element={<Home />} />
            <Route path="/discover" element={<VenueDiscovery />} />
            <Route path="/create" element={<Navigate to="/discover" replace />} />
            <Route path="/hang/:id" element={<HangDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/owner"
              element={
                <OwnerGate>
                  <OwnerHub />
                </OwnerGate>
              }
            />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </AnimatePresence>
      </AppShell>
    </RequireAuth>
  );
}
