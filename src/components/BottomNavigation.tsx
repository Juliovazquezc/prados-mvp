import { Home, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomNavigation = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="bottom-nav">
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
    </nav>
  );
};

export default BottomNavigation;
