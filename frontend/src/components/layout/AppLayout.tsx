import { Navigate, Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useCurrentUser } from "@/hooks/queries/useAuth";

export const AppLayout = () => {
  const { user, isLoading, hasToken, error, isError } = useCurrentUser();

  if (isLoading && hasToken) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError && hasToken) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-800">
          <p>Unable to verify your session.</p>
          {error instanceof Error && <p className="mt-2 text-sm">{error.message}</p>}
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container-custom py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
