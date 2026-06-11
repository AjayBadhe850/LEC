import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Menu, X, User, LogOut, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  const { activePage, setActivePage, isLoggedIn, isAdmin, isPastor, currentUser, handleLogout } = useContext(AppContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Sanctuary' },
    { id: 'services', label: 'Services' },
    { id: 'events', label: 'Events' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'live', label: 'Watch Live' },
    { id: 'prayer', label: 'Prayer Portal' }
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
  };

  const getDashboardId = () => {
    if (isAdmin) return 'admin-dashboard';
    if (isPastor) return 'pastor-dashboard';
    return 'member-dashboard';
  };

  return (
    <nav className="navbar glass-panel">
      <div className="nav-container">
        {/* Brand/Logo */}
        <div className="nav-brand" onClick={() => handleNavClick('home')}>
          <img 
  src="https://gedchbppehaurejmaorg.supabase.co/storage/v1/object/public/Church-loogo/image.png"
  alt="Life Edifiers Church"
  width="60"
/>
          <div className="brand-text-wrapper">
            <span className="brand-title">LIFE EDIFIERS</span>
            <span className="brand-subtitle">CHURCH</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="nav-links-desktop">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`nav-link-btn ${activePage === link.id ? 'active' : ''}`}
            >
              {link.label}
              {activePage === link.id && <span className="active-dot"></span>}
            </button>
          ))}
        </div>

        {/* Desktop Auth Controls */}
        <div className="nav-auth-desktop">
          {isLoggedIn ? (
            <div className="auth-user-menu">
              <button
                onClick={() => handleNavClick(getDashboardId())}
                className={`btn-secondary dashboard-nav-btn ${activePage === getDashboardId() ? 'active' : ''}`}
              >
                {isAdmin ? <ShieldAlert size={16} className="text-red" /> : (isPastor ? <ShieldAlert size={16} className="text-cyan" /> : <User size={16} />)}
                <span>Portal</span>
              </button>
              <button onClick={handleLogout} className="logout-btn" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button onClick={() => handleNavClick('auth')} className="btn-primary auth-btn-nav">
              Join Lord's Kingdom
            </button>
          )}
        </div>

        {/* Mobile Burger Menu Button */}
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-links">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`mobile-nav-link ${activePage === link.id ? 'active' : ''}`}
            >
              {link.label}
            </button>
          ))}

          <div className="mobile-drawer-divider"></div>

          {isLoggedIn ? (
            <div className="mobile-drawer-auth">
              <div className="user-profile-summary">
                <div className="user-avatar-placeholder">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <div className="user-details-summary">
                  <span className="user-name-summary">{currentUser?.name}</span>
                  <span className="user-role-summary">{currentUser?.role}</span>
                </div>
              </div>

              <button
                onClick={() => handleNavClick(getDashboardId())}
                className="btn-primary w-full mobile-portal-btn"
              >
                Go to Portal
              </button>

              <button onClick={handleLogout} className="btn-secondary w-full logout-btn-mobile">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button onClick={() => handleNavClick('auth')} className="btn-primary w-full mobile-join-btn">
              Join Lord's Kingdom
            </button>
          )}
        </div>
      </div>

      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          left: 0;
          width: 100%;
          height: 80px;
          z-index: 999;
          border-radius: 0;
          border-bottom: 1px solid var(--border-glass);
          background: rgba(5, 5, 5, 0.75);
          backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
        }

        .nav-container {
          max-width: 1300px;
          width: 100%;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          user-select: none;
        }

        .nav-logo-img {
          width: 44px;
          height: 44px;
          filter: drop-shadow(0 0 8px rgba(0, 80, 255, 0.3));
          transition: transform 0.3s ease;
        }

        .nav-brand:hover .nav-logo-img {
          transform: rotate(-5deg) scale(1.05);
        }

        .brand-text-wrapper {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 16px;
          letter-spacing: 0.15em;
          color: #FFF;
        }

        .brand-subtitle {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 10px;
          letter-spacing: 0.35em;
          color: var(--accent-cyan);
        }

        .nav-links-desktop {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        @media (max-width: 992px) {
          .nav-links-desktop {
            display: none;
          }
        }

        .nav-link-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-heading);
          font-weight: 500;
          font-size: 14px;
          letter-spacing: 0.02em;
          padding: 10px 18px;
          cursor: pointer;
          position: relative;
          transition: color 0.3s ease;
          border-radius: 20px;
        }

        .nav-link-btn:hover {
          color: #FFF;
          background: rgba(255, 255, 255, 0.03);
        }

        .nav-link-btn.active {
          color: var(--accent-cyan);
          background: rgba(0, 214, 255, 0.05);
        }

        .active-dot {
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background-color: var(--accent-cyan);
          border-radius: 50%;
          box-shadow: 0 0 6px var(--accent-cyan);
        }

        .nav-auth-desktop {
          display: flex;
          align-items: center;
        }

        @media (max-width: 992px) {
          .nav-auth-desktop {
            display: none;
          }
        }

        .auth-btn-nav {
          padding: 8px 20px;
          font-size: 14px;
        }

        .auth-user-menu {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dashboard-nav-btn {
          padding: 8px 20px;
          font-size: 14px;
          gap: 6px;
        }

        .dashboard-nav-btn.active {
          border-color: var(--accent-cyan);
          background: rgba(0, 214, 255, 0.05);
          color: #fff;
        }

        .text-red {
          color: var(--accent-red) !important;
          filter: drop-shadow(0 0 4px rgba(255, 0, 0, 0.5));
        }

        .logout-btn {
          background: transparent;
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          color: var(--accent-red);
          border-color: rgba(255, 0, 0, 0.3);
          background: rgba(255, 0, 0, 0.05);
        }

        .mobile-menu-toggle {
          display: none;
          background: transparent;
          border: none;
          color: #FFF;
          cursor: pointer;
        }

        @media (max-width: 992px) {
          .mobile-menu-toggle {
            display: block;
          }
        }

        /* Mobile Drawer */
        .mobile-drawer {
          position: fixed;
          top: 80px;
          left: 0;
          width: 100vw;
          height: calc(100vh - 80px);
          background-color: var(--bg-dark);
          border-top: 1px solid var(--border-glass);
          transform: translateY(-100%);
          opacity: 0;
          visibility: hidden;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          overflow-y: auto;
        }

        .mobile-drawer.open {
          transform: translateY(0);
          opacity: 1;
          visibility: visible;
        }

        .mobile-drawer-links {
          display: flex;
          flex-direction: column;
          padding: 24px;
          gap: 16px;
        }

        .mobile-nav-link {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-heading);
          font-weight: 500;
          font-size: 20px;
          text-align: left;
          padding: 12px 16px;
          width: 100%;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mobile-nav-link:hover {
          color: #FFF;
          background: rgba(255, 255, 255, 0.03);
        }

        .mobile-nav-link.active {
          color: var(--accent-cyan);
          background: rgba(0, 214, 255, 0.05);
          font-weight: 600;
        }

        .mobile-drawer-divider {
          height: 1px;
          background: var(--border-glass);
          margin: 12px 0;
        }

        .mobile-drawer-auth {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 0 16px;
        }

        .user-profile-summary {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 8px;
        }

        .user-avatar-placeholder {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
          color: #FFF;
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-details-summary {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .user-name-summary {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 15px;
          color: #FFF;
        }

        .user-role-summary {
          font-size: 12px;
          color: var(--accent-cyan);
        }

        .w-full {
          width: 100%;
        }

        .logout-btn-mobile {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>
    </nav>
  );
}
