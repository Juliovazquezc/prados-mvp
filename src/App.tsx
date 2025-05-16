import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ListingsProvider } from "./contexts/ListingsContext";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense, type FC } from "react";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CreateListing from "./pages/CreateListing";
import ListingDetail from "./pages/ListingDetail";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";

// Components
import { LoadingSpinner } from "./components/ui/loading-spinner";
import { ErrorFallback } from "./components/ui/error-fallback";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type RouteConfig = {
  path: string;
  element: React.ReactNode;
  requiresAuth?: boolean;
};

const routes: RouteConfig[] = [
  { path: "/", element: <Index /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/profile", element: <Profile />, requiresAuth: true },
  { path: "/create", element: <CreateListing />, requiresAuth: true },
  { path: "/listings/:id", element: <ListingDetail /> },
  { path: "/search", element: <Search /> },
  { path: "*", element: <NotFound /> },
];

const App: FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <ListingsProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {routes.map(({ path, element, requiresAuth }) => (
                      <Route
                        key={path}
                        path={path}
                        element={
                          requiresAuth ? (
                            <ProtectedRoute>{element}</ProtectedRoute>
                          ) : (
                            element
                          )
                        }
                      />
                    ))}
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </ListingsProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

const ProtectedRoute: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default App;
