import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "../Spinner";

type RedirectIfAuthenticatedProps = {
  children: ReactNode;
};

const RedirectIfAuthenticated = ({
  children,
}: RedirectIfAuthenticatedProps) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isAuthenticated) {
    // Si el usuario ya está autenticado, redirigir al homepage
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RedirectIfAuthenticated;
