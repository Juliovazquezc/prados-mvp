
import { Home, Plus, User, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomNavigation = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${path === "/" ? "active" : ""}`}>
        <Home size={20} />
        <span>Home</span>
      </Link>
      <Link to="/search" className={`nav-item ${path === "/search" ? "active" : ""}`}>
        <Search size={20} />
        <span>Search</span>
      </Link>
      <Link to="/create" className={`nav-item ${path === "/create" ? "active" : ""}`}>
        <Plus size={20} />
        <span>Sell</span>
      </Link>
      <Link to="/profile" className={`nav-item ${path === "/profile" ? "active" : ""}`}>
        <User size={20} />
        <span>Profile</span>
      </Link>
    </nav>
  );
};

export default BottomNavigation;
