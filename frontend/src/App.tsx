import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Dashboard } from "./pages/app/Dashboard";
import { NewIdea } from "./pages/app/NewIdea";
import { IdeaDetail } from "./pages/app/IdeaDetail";
import { Profile } from "./pages/app/Profile";
import { Settings } from "./pages/app/Settings";
import { useAuthRedirect } from "./hooks/queries/useAuth";

function AppRoutes() {
  // Listen for 401 unauthorized events globally
  useAuthRedirect();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="ideas/new" element={<NewIdea />} />
        <Route path="ideas/:id" element={<IdeaDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Redirect root to app */}
      <Route path="/" element={<Navigate to="/app" replace />} />

      {/* Catch all - redirect to app */}
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
