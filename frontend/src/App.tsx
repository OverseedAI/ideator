import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { AppLayout } from "./components/layout/AppLayout";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Dashboard } from "./pages/app/Dashboard";
import { NewIdea } from "./pages/app/NewIdea";
import { IdeaDetail } from "./pages/app/IdeaDetail";
import { Profile } from "./pages/app/Profile";
import { Settings } from "./pages/app/Settings";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route
            path="/app"
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            }
          />
          <Route
            path="/app/ideas/new"
            element={
              <AppLayout>
                <NewIdea />
              </AppLayout>
            }
          />
          <Route
            path="/app/ideas/:id"
            element={
              <AppLayout>
                <IdeaDetail />
              </AppLayout>
            }
          />
          <Route
            path="/app/profile"
            element={
              <AppLayout>
                <Profile />
              </AppLayout>
            }
          />
          <Route
            path="/app/settings"
            element={
              <AppLayout>
                <Settings />
              </AppLayout>
            }
          />

          {/* Redirect root to app */}
          <Route path="/" element={<Navigate to="/app" replace />} />

          {/* Catch all - redirect to app */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
