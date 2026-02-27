import { AnimatePresence } from "framer-motion";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
  const isFullWidth =
    location.pathname === "/" || location.pathname === "/home" || location.pathname === "/discover";

  return (
    <div className="min-h-screen bg-navy-900">
      {isFullWidth ? (
        <div className="min-h-screen bg-navy-900 paper-grain relative">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Auth />} />
              <Route
                path="/home"
                element={
                  <RequireAuth>
                    <Home />
                  </RequireAuth>
                }
              />
              <Route path="/discover" element={<VenueDiscovery />} />
            </Routes>
          </AnimatePresence>
        </div>
      ) : (
        <div className="min-h-screen bg-navy-900 flex items-center justify-center">
          <div className="w-full max-w-[402px] min-h-screen bg-navy-900 relative overflow-hidden paper-grain">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/create" element={<Navigate to="/discover" replace />} />
                <Route
                  path="/hang/:id"
                  element={
                    <RequireAuth>
                      <HangDetail />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <RequireAuth>
                      <Profile />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/owner"
                  element={
                    <RequireAuth>
                      <OwnerHub />
                    </RequireAuth>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
