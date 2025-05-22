import { Home, Plus, FileText, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const BottomNavigation = () => {
  const location = useLocation();
  const path = location.pathname;
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <nav className="bottom-nav text-center">
      <Link to="/" className={`nav-item ${path === "/" ? "active" : ""}`}>
        <Home size={20} />
        <span>Inicio</span>
      </Link>
      <Link
        to="/create"
        className={`nav-item ${path === "/create" ? "active" : ""}`}
      >
        <Plus size={20} />
        <span>Vender</span>
      </Link>
      <Link
        to="/my-listings"
        className={`nav-item ${path === "/my-listings" ? "active" : ""}`}
      >
        <User size={20} />
        <span>Mis Anuncios</span>
      </Link>
      <Link
        to="/profile/edit"
        className={`nav-item ${path === "/profile/edit" ? "active" : ""}`}
      >
        <User size={20} />
        <span>Perfil</span>
      </Link>
      <Link
        to="/disclaimer"
        className={`nav-item ${path === "/disclaimer" ? "active" : ""}`}
      >
        <FileText size={20} />
        <span>Aviso</span>
      </Link>
    </nav>
  );
};

export default BottomNavigation;
