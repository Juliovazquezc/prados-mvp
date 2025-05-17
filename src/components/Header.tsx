import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, User } from "lucide-react";
import { useIntl } from "react-intl";
import LanguageSwitcher from "./LanguageSwitcher";

const Header = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const intl = useIntl();

  console.log(user);

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
        <nav className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-gray-700 hover:text-marketplace-primary">
            {intl.formatMessage({ id: "nav.home" })}
          </Link>
          <Link
            to="/search"
            className="text-gray-700 hover:text-marketplace-primary"
          >
            {intl.formatMessage({ id: "nav.search" })}
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/create"
                className="text-gray-700 hover:text-marketplace-primary"
              >
                {intl.formatMessage({ id: "app.createListing.short" })}
              </Link>
              <div className="flex items-center ml-4">
                <Link to="/profile" className="flex items-center">
                  <Avatar className="h-8 w-8">
                    {/* <AvatarImage src={user?.profileImage} /> */}
                    <AvatarFallback></AvatarFallback>
                  </Avatar>
                </Link>
                <Button
                  variant="ghost"
                  onClick={signOut}
                  className="text-sm ml-4"
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
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <button onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
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
              {intl.formatMessage({ id: "nav.home" })}
            </Link>
            <Link
              to="/search"
              className="p-2 hover:bg-gray-100 rounded-md"
              onClick={toggleMenu}
            >
              {intl.formatMessage({ id: "nav.search" })}
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/create"
                  className="p-2 hover:bg-gray-100 rounded-md"
                  onClick={toggleMenu}
                >
                  {intl.formatMessage({ id: "app.createListing" })}
                </Link>
                <Link
                  to="/profile"
                  className="p-2 hover:bg-gray-100 rounded-md"
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
                  className="justify-start"
                >
                  {intl.formatMessage({ id: "nav.logout" })}
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
                  <Link to="/login">
                    {intl.formatMessage({ id: "nav.login" })}
                  </Link>
                </Button>
                <Button onClick={toggleMenu} className="w-full" asChild>
                  <Link to="/register">
                    {intl.formatMessage({ id: "nav.register" })}
                  </Link>
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
