import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { token, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleMenuLinkClick = () => {
    setIsMenuOpen(false);
  };

  const navLinkClasses = ({ isActive }) =>
    `px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
      isActive ? 'bg-white text-[var(--brand)] shadow-sm font-medium' : 'hover:bg-white/80 text-[var(--brand)]'
    }`;

  const mobileNavLinkClasses = ({ isActive }) =>
    `block px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
      isActive ? 'bg-white text-[var(--brand)] shadow-sm font-medium' : 'hover:bg-white/80 text-[var(--brand)]'
    }`;

  return (
    <header className="sticky top-0 z-30 border-b bg-[var(--bg)]/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="font-semibold tracking-tight text-[var(--brand)] hover:opacity-80 transition-opacity cursor-pointer"
        >
          ClientSphere
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 text-sm">
          <NavLink to="/" className={navLinkClasses} end>
            Home
          </NavLink>
          
          {token ? (
            <>
              <NavLink to="/dashboard" className={navLinkClasses}>
                Dashboard
              </NavLink>
              <button 
                onClick={logout} 
                className="px-3 py-2 rounded-lg bg-white text-[var(--brand)] hover:bg-white/90 transition-colors duration-200 shadow-sm cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClasses}>
                Login
              </NavLink>
              <NavLink to="/signup" className={navLinkClasses}>
                Signup
              </NavLink>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-lg hover:bg-white/80 transition-colors duration-200 cursor-pointer" 
          onClick={handleMenuToggle}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <XMarkIcon className="h-6 w-6 text-[var(--brand)]" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-[var(--brand)]" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <nav className="md:hidden px-6 pb-4 space-y-2 bg-[var(--bg)] border-b">
          <NavLink 
            to="/" 
            onClick={handleMenuLinkClick}
            className={mobileNavLinkClasses}
            end
          >
            Home
          </NavLink>
          
          {token ? (
            <>
              <NavLink 
                to="/dashboard" 
                onClick={handleMenuLinkClick}
                className={mobileNavLinkClasses}
              >
                Dashboard
              </NavLink>
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-lg bg-white text-[var(--brand)] hover:bg-white/90 transition-colors duration-200 shadow-sm cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink 
                to="/login" 
                onClick={handleMenuLinkClick}
                className={mobileNavLinkClasses}
              >
                Login
              </NavLink>
              <NavLink 
                to="/signup" 
                onClick={handleMenuLinkClick}
                className={mobileNavLinkClasses}
              >
                Signup
              </NavLink>
            </>
          )}
        </nav>
      )}
    </header>
  );
}