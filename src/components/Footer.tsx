import { type FC } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Footer: FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <footer
      className={`bg-gray-50 border-t border-gray-200 ${
        isAuthenticated ? "hidden md:block" : "block"
      }`}
    >
      <div className="marketplace-container py-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 max-w-3xl mx-auto">
            <Link
              to="/disclaimer"
              className="text-marketplace-primary hover:underline"
            >
              Aviso de Privacidad y Responsabilidad
            </Link>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            © {new Date().getFullYear()} Los Prados Marketplace. Todos los
            derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
