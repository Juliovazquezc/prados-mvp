
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, User } from "lucide-react";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="marketplace-container mx-auto flex justify-between items-center h-16">
        <Link to="/" className="text-xl font-bold text-marketplace-primary">
          NeighborMarket
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-gray-700 hover:text-marketplace-primary">
            Home
          </Link>
          <Link to="/search" className="text-gray-700 hover:text-marketplace-primary">
            Search
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/create" className="text-gray-700 hover:text-marketplace-primary">
                Sell Item
              </Link>
              <div className="flex items-center ml-4">
                <Link to="/profile" className="flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImage} />
                    <AvatarFallback>{user?.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                </Link>
                <Button variant="ghost" onClick={logout} className="text-sm ml-4">
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-md">
          <div className="flex flex-col p-4 space-y-3">
            <Link
              to="/"
              className="p-2 hover:bg-gray-100 rounded-md"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              to="/search"
              className="p-2 hover:bg-gray-100 rounded-md"
              onClick={toggleMenu}
            >
              Search
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/create"
                  className="p-2 hover:bg-gray-100 rounded-md"
                  onClick={toggleMenu}
                >
                  Sell Item
                </Link>
                <Link
                  to="/profile"
                  className="p-2 hover:bg-gray-100 rounded-md"
                  onClick={toggleMenu}
                >
                  Profile
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    logout();
                    toggleMenu();
                  }}
                  className="justify-start"
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  onClick={toggleMenu}
                  className="w-full"
                  asChild
                >
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  onClick={toggleMenu}
                  className="w-full"
                  asChild
                >
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
