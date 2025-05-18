import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ListingsProvider } from "./contexts/ListingsContext";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense, type FC } from "react";
import { I18nProvider } from "@/i18n/I18nProvider";

// Pages
import { LoginForm } from "@/pages/Login";
import { SignUpForm } from "@/pages/Register";
import Index from "./pages/Index";
import CreateListing from "./pages/CreateListing";
import ListingDetail from "./pages/ListingDetail";
import NotFound from "./pages/NotFound";

// Components
import { LoadingSpinner } from "./components/ui/loading-spinner";
import { ErrorFallback } from "./components/ui/error-fallback";
import RequireAuth from "./components/auth/RequireAuth";

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
  { path: "/login", element: <LoginForm /> },
  { path: "/register", element: <SignUpForm /> },
  { path: "/create", element: <CreateListing />, requiresAuth: true },
  { path: "/listings/:id", element: <ListingDetail /> },
  { path: "*", element: <NotFound /> },
];

const App: FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <ListingsProvider>
              <I18nProvider>
                <Toaster />
                <Sonner />
                <Router>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      {routes.map(({ path, element, requiresAuth }) => (
                        <Route
                          key={path}
                          path={path}
                          element={
                            requiresAuth ? (
                              <RequireAuth>{element}</RequireAuth>
                            ) : (
                              element
                            )
                          }
                        />
                      ))}
                      <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                      />
                    </Routes>
                  </Suspense>
                </Router>
              </I18nProvider>
            </ListingsProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
