import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, User, LogOut, Settings, Crown, Store } from "lucide-react";
import Container from "./UI/Container";
import Button from "./UI/Button";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout, isAdmin, isPremiumMember, isPartner } =
    useAuth();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Deals", href: "/deals" },
    { name: "Partners", href: "/partners" },
    { name: "Membership", href: "/membership" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/12 backdrop-blur-sm border-b border-white/20">
      <Container>
        <div className="flex items-center justify-between h-18">
          {/* Logo - Left */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-royal-gold rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg font-sans">
                  G
                </span>
              </div>
              <span className="text-white font-sans font-bold text-xl">
                GoSave
              </span>
            </Link>
          </div>

          {/* Navigation Links - Center */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-sm font-sans font-medium transition-all duration-320 relative px-3 py-2 rounded-lg",
                  isActive(item.href)
                    ? "text-royal-gold bg-royal-gold/10"
                    : "text-white hover:text-royal-gold hover:bg-white/5"
                )}
              >
                {item.name}
                {isActive(item.href) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-royal-gold rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* User Avatar & Mobile Menu - Right */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="text-white"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>

            {/* User Avatar */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-royal-gold text-white hover:bg-royal-gold-dark transition-colors duration-320 relative"
                >
                  <User size={20} />
                  {isPremiumMember && (
                    <Crown
                      size={12}
                      className="absolute -top-1 -right-1 text-yellow-300"
                    />
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-lg rounded-lg shadow-lg border border-white/20 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.full_name}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      {user?.membership && (
                        <p className="text-xs text-royal-blue capitalize">
                          {user.membership.name} Member
                        </p>
                      )}
                    </div>

                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <Settings size={16} />
                        <span>Dashboard</span>
                      </div>
                    </Link>

                    {isPartner && (
                      <Link
                        to="/partner/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <Store size={16} />
                          <span>Partner Portal</span>
                        </div>
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <Crown size={16} />
                          <span>Admin Panel</span>
                        </div>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white border-white/30 hover:bg-white/10"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-sans font-medium rounded-lg transition-colors duration-320",
                    isActive(item.href)
                      ? "text-royal-gold bg-royal-gold/10"
                      : "text-white hover:text-royal-gold hover:bg-white/5"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Auth Links */}
              {!isAuthenticated && (
                <div className="pt-2 border-t border-white/20 mt-2 space-y-2">
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-sm font-sans font-medium text-white hover:text-royal-gold hover:bg-white/5 rounded-lg transition-colors duration-320"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2 text-sm font-sans font-medium text-royal-gold bg-royal-gold/10 hover:bg-royal-gold/20 rounded-lg transition-colors duration-320"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </Container>
    </nav>
  );
};

export default Navbar;
