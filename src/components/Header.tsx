import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useIntl } from "react-intl";
import LanguageSwitcher from "./LanguageSwitcher";

const Header = () => {
  const { isAuthenticated, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const intl = useIntl();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="marketplace-container mx-auto flex justify-between items-center h-16">
        <Link to="/" className="text-xl font-bold text-marketplace-primary">
          {intl.formatMessage({ id: "app.title" })}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-4">
          <Link to="/" className="text-gray-700 hover:text-marketplace-primary">
            {intl.formatMessage({ id: "nav.home" })}
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/create"
                className="text-gray-700 hover:text-marketplace-primary"
              >
                {intl.formatMessage({ id: "app.createListing.short" })}
              </Link>
              <div className="flex items-center">
                <Button
                  // variant="ghost"
                  onClick={signOut}
                  className="text-sm "
                >
                  {intl.formatMessage({ id: "nav.logout" })}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">
                  {intl.formatMessage({ id: "nav.login" })}
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">
                  {intl.formatMessage({ id: "nav.register" })}
                </Link>
              </Button>
            </div>
          )}
          <LanguageSwitcher />
        </nav>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={toggleMenu}
            className="p-2 transition-transform duration-200 ease-in-out hover:scale-110"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-x-0 top-16 bg-white border-b border-gray-200 shadow-md transform transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? "translate-y-0 opacity-100 pointer-events-auto visible"
            : "-translate-y-full opacity-0 pointer-events-none invisible"
        }`}
      >
        <div className="flex flex-col p-4 space-y-3">
          <Link
            to="/"
            className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200"
            onClick={toggleMenu}
          >
            {intl.formatMessage({ id: "nav.home" })}
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/create"
                className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200"
                onClick={toggleMenu}
              >
                {intl.formatMessage({ id: "app.createListing" })}
              </Link>
              <Link
                to="/profile"
                className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200"
                onClick={toggleMenu}
              >
                {intl.formatMessage({ id: "nav.profile" })}
              </Link>
              <Button
                variant="ghost"
                onClick={() => {
                  signOut();
                  toggleMenu();
                }}
                className="justify-start transition-colors duration-200"
              >
                {intl.formatMessage({ id: "nav.logout" })}
              </Button>
            </>
          ) : (
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                onClick={toggleMenu}
                className="w-full transition-colors duration-200"
                asChild
              >
                <Link to="/login">
                  {intl.formatMessage({ id: "nav.login" })}
                </Link>
              </Button>
              <Button
                onClick={toggleMenu}
                className="w-full transition-colors duration-200"
                asChild
              >
                <Link to="/register">
                  {intl.formatMessage({ id: "nav.register" })}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
