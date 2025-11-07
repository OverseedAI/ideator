import { Navigate, RouteObject } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import AuthCallback from "./pages/AuthCallback";
import { Dashboard } from "./pages/app/Dashboard";
import { NewIdea } from "./pages/app/NewIdea";
import { IdeaDetail } from "./pages/app/IdeaDetail";
import { Profile } from "./pages/app/Profile";
import { Settings } from "./pages/app/Settings";

export const routes: RouteObject[] = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/app",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "ideas/new",
        element: <NewIdea />,
      },
      {
        path: "ideas/:id",
        element: <IdeaDetail />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/app" replace />,
  },
  {
    path: "*",
    element: <Navigate to="/app" replace />,
  },
];
