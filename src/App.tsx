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
import LoginForm from "@/pages/Login";
import RegisterForm from "./pages/Register";
import Index from "./pages/Index";
import CreateListing from "./pages/CreateListing";
import ListingDetail from "./pages/ListingDetail";
import NotFound from "./pages/NotFound";
import Disclaimer from "./pages/Disclaimer";
import MyListings from "./pages/MyListings";
import ProfileEdit from "./pages/ProfileEdit";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Components
import { LoadingSpinner } from "./components/ui/loading-spinner";
import { ErrorFallback } from "./components/ui/error-fallback";
import RequireAuth from "./components/auth/RequireAuth";
import RedirectIfAuthenticated from "./components/auth/RedirectIfAuthenticated";
import Footer from "./components/Footer";

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
  redirectIfAuth?: boolean;
};

const routes: RouteConfig[] = [
  { path: "/", element: <Index />, requiresAuth: true },
  { path: "/login", element: <LoginForm />, redirectIfAuth: true },
  { path: "/register", element: <RegisterForm />, redirectIfAuth: true },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    redirectIfAuth: true,
  },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/create", element: <CreateListing />, requiresAuth: true },
  { path: "/listings/:id", element: <ListingDetail />, requiresAuth: true },
  { path: "/my-listings", element: <MyListings />, requiresAuth: true },
  { path: "/profile/edit", element: <ProfileEdit />, requiresAuth: true },
  { path: "/disclaimer", element: <Disclaimer /> },
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
                <div className="flex flex-col min-h-screen">
                  <Toaster />
                  <Sonner />
                  <Router>
                    <Suspense fallback={<LoadingSpinner />}>
                      <main className="flex-1 pb-20 md:pb-0">
                        <Routes>
                          {routes.map(
                            ({
                              path,
                              element,
                              requiresAuth,
                              redirectIfAuth,
                            }) => (
                              <Route
                                key={path}
                                path={path}
                                element={
                                  requiresAuth ? (
                                    <RequireAuth>{element}</RequireAuth>
                                  ) : redirectIfAuth ? (
                                    <RedirectIfAuthenticated>
                                      {element}
                                    </RedirectIfAuthenticated>
                                  ) : (
                                    element
                                  )
                                }
                              />
                            )
                          )}
                          <Route
                            path="/"
                            element={<Navigate to="/dashboard" replace />}
                          />
                        </Routes>
                      </main>
                    </Suspense>
                    <Footer />
                  </Router>
                </div>
              </I18nProvider>
            </ListingsProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
