import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex flex-col justify-center items-center px-4">
        <h1 className="text-5xl font-bold text-marketplace-primary mb-4">
          404
        </h1>
        <p className="text-xl text-gray-600 mb-6">¡Ups! Página no encontrada</p>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          La página que estás buscando puede haber sido eliminada, su nombre ha
          cambiado o no está disponible temporalmente.
        </p>
        <Button asChild size="lg">
          <Link to="/">Volver al Inicio</Link>
        </Button>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default NotFound;
