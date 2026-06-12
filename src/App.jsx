import { useContext } from 'react';
import { AppContext } from './context/AppContext';
import { Analytics } from '@vercel/analytics/react';

// Import Components
import WelcomeGate from './components/WelcomeGate';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Events from './components/Events';
import Gallery from './components/Gallery';
import LiveStream from './components/LiveStream';
import PrayerPortal from './components/PrayerPortal';
import AuthPages from './components/AuthPages';
import MemberDashboard from './components/MemberDashboard';
import AdminDashboard from './components/AdminDashboard';
import PastorDashboard from './components/PastorDashboard';
import Contact from './components/Contact';

// Lucide icon for floating contact action
import { MessageCircleHeart } from 'lucide-react';

const Youtube = ({ size = 24, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

function App() {
  const { activePage, setActivePage, welcomeEntered } = useContext(AppContext);

  // Render view dispatcher
  const renderView = () => {
    switch (activePage) {
      case 'home':
        return <Hero />;
      
      
      case 'services':
        return <Services />;
      case 'events':
        return <Events />;
      case 'gallery':
        return <Gallery />;
      case 'live':
        return <LiveStream />;
      case 'prayer':
        return <PrayerPortal />;
      case 'auth':
        return <AuthPages />;
      case 'member-dashboard':
        return <MemberDashboard />;
      case 'pastor-dashboard':
        return <PastorDashboard />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      default:
        return <Hero />;
    }
  };

  // Parallax Header for sub-pages
  const renderSubHeader = () => {
    if (activePage === 'home') return null;

    let title = '';
    let subtitle = '';
    let grad = 'linear-gradient(135deg, #050508, #001860)';

    switch (activePage) {
      
      
      case 'services':
        title = 'SERVICES & SCHEDULES';
        subtitle = 'Weekly worship assemblies & mid-week fellowships';
        break;
      case 'events':
        title = 'LIFE EVENTS';
        subtitle = 'Worship nights, outreach missions, and registrations';
        break;
      case 'gallery':
        title = 'MEDIA SANCTUARY';
        subtitle = 'Fellowship highlights & community pictures';
        break;
      case 'live':
        title = 'WATCH LIVE';
        subtitle = 'Corporate streaming and digital worship';
        break;
      case 'prayer':
        title = 'PRAYER WALL';
        subtitle = 'Agreeing in prayer & submitting petitions';
        break;
      case 'auth':
        title = "JOIN LORD'S KINGDOM";
        subtitle = 'Create your member account and register families';
        break;
      case 'member-dashboard':
        title = 'MEMBER PORTAL';
        subtitle = 'Manage details, profiles, and prayer trackers';
        break;
      case 'pastor-dashboard':
        title = 'PASTOR PORTAL';
        subtitle = 'Manage families, prayer requests, worship songs, and events';
        break;
      case 'admin-dashboard':
        title = 'ADMIN PORTAL';
        subtitle = 'Update prayers, schedule events, and check metrics';
        break;
      default:
        return null;
    }

    return (
      <div className="sub-page-header" style={{ background: grad }}>
        <div className="sub-header-vignette"></div>
        <div className="sub-header-content animate-text-reveal">
          <span className="sub-header-pill">LIFE EDIFIERS</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <div className="sub-header-line"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-layout">
      {/* 1. Introductory Gate */}
      <WelcomeGate />

      {/* Main layout (Only becomes accessible as main site structure opens) */}
      {welcomeEntered && (
        <div className="main-content-layout animate-fade-in">
          {/* 2. Top Header Navbar */}
          <Navbar />

          {/* 3. Page Title Block */}
          {renderSubHeader()}

          {/* 4. Active view */}
          <main className="view-wrapper">
            {renderView()}
          </main>

          {/* 5. Custom Map / Footer Section (Except on Home & Dashboards) */}
          {activePage !== 'home' && !activePage.includes('dashboard') && (
            <Contact />
          )}

          {/* 6. Main Footer */}
          <footer className="main-footer glass-panel">
            <div className="footer-cols">
              <div className="footer-brand-col">
                <div className="footer-brand">
                  <img src="/logo.png" alt="Life Edifiers Logo" className="footer-logo-img" />
                  <div>
                    <span className="f-title">LIFE EDIFIERS</span>
                    <span className="f-subtitle">CHURCH</span>
                  </div>
                </div>
                <p className="footer-tagline">
                  "EVANGELIZE • EQUIP • EDIFY"<br />
                  Building strong, victorious Christian lives on the absolute foundation of God’s Word.
                </p>
                <div className="footer-social-row">
                  <a
                    href="https://www.youtube.com/@LifeEdifiersChurch"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-link youtube-hover"
                    title="Subscribe to our YouTube Channel"
                  >
                    <Youtube size={16} />
                    <span>YouTube Channel</span>
                  </a>
                </div>
              </div>

              <div className="footer-links-col">
                <h4>Assemblies</h4>
                <ul>
                  <li><button onClick={() => setActivePage('services')}>Sunday Morning (9:00 AM)</button></li>
                  <li><button onClick={() => setActivePage('services')}>Sunday School (11:00 AM)</button></li>
                  <li><button onClick={() => setActivePage('services')}>Sunday Afternoon (12:30 PM)</button></li>
                  <li><button onClick={() => setActivePage('services')}>Sunday Evening (6:00 PM)</button></li>
                  <li><button onClick={() => setActivePage('services')}>Wednesday Study (6:30 PM)</button></li>
                  <li><button onClick={() => setActivePage('services')}>Friday Youth Fellowship (7:00 PM)</button></li>
                </ul>
              </div>

              <div className="footer-links-col">
                <h4>Sanctuary Navigation</h4>
                <ul>
                  
                  
                  <li><button onClick={() => setActivePage('events')}>Events</button></li>
                  <li><button onClick={() => setActivePage('live')}>Live Streaming</button></li>
                  <li><button onClick={() => setActivePage('prayer')}>Prayer Wall</button></li>
                </ul>
              </div>
            </div>

            <div className="footer-bottom-row">
              <p>&copy; 2026 Life Edifiers Church. All Covenant Rights Reserved.</p>
              <div className="footer-meta-badges">
                <span className="badge-legal">Statement of Faith</span>
                <span className="badge-legal">Privacy Policy</span>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Floating Prayer Request Action Widget */}
      {welcomeEntered && activePage !== 'prayer' && (
        <button
          onClick={() => setActivePage('prayer')}
          className="floating-prayer-widget"
          title="Submit Prayer Request"
        >
          <MessageCircleHeart size={24} />
          <span className="floating-widget-label">Need Prayer?</span>
        </button>
      )}

      <style>{`
        .app-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .main-content-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .view-wrapper {
          flex-grow: 1;
        }

        /* Sub Page Headers */
        .sub-page-header {
          position: relative;
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
          border-bottom: 1px solid var(--border-glass);
        }

        .sub-header-vignette {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(5,5,5,0.4), rgba(5,5,5,0.9));
          z-index: 1;
        }

        .sub-header-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .sub-header-pill {
          font-family: var(--font-heading);
          font-size: 10px;
          font-weight: 700;
          color: var(--accent-cyan);
          letter-spacing: 0.2em;
          border: 1px solid rgba(0, 214, 255, 0.25);
          background: rgba(0, 214, 255, 0.04);
          padding: 3px 8px;
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .sub-header-content h1 {
          font-family: var(--font-heading);
          font-size: 36px;
          color: #FFF;
          font-weight: 900;
          letter-spacing: -0.01em;
        }

        @media (max-width: 576px) {
          .sub-header-content h1 {
            font-size: 26px;
          }
        }

        .sub-header-content p {
          font-size: 14px;
          color: var(--text-secondary);
          margin-top: 6px;
        }

        .sub-header-line {
          height: 2px;
          width: 50px;
          background: var(--accent-cyan);
          margin-top: 14px;
          border-radius: 2px;
        }

        /* Footer styling */
        .main-footer {
          margin-top: auto;
          background: rgba(8, 8, 10, 0.85);
          border-radius: 0;
          border-top: 1px solid var(--border-glass);
          border-left: none;
          border-right: none;
          border-bottom: none;
          padding: 60px 40px 30px;
          text-align: left;
          z-index: 5;
        }

        @media (max-width: 576px) {
          .main-footer {
            padding: 40px 20px 20px;
          }
        }

        .footer-cols {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 60px;
          margin-bottom: 50px;
        }

        @media (max-width: 768px) {
          .footer-cols {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        .footer-brand-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .footer-logo-img {
          width: 38px;
          height: 38px;
          filter: drop-shadow(0 0 6px rgba(0, 80, 255, 0.3));
        }

        .f-title {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 15px;
          color: #FFF;
          letter-spacing: 0.1em;
          display: block;
        }

        .f-subtitle {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 9px;
          color: var(--accent-cyan);
          letter-spacing: 0.25em;
          display: block;
        }

        .footer-tagline {
          font-size: 13.5px;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .footer-social-row {
          margin-top: 12px;
          display: flex;
          gap: 12px;
        }

        .footer-social-link {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-glass);
          padding: 8px 16px;
          border-radius: 4px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .footer-social-link.youtube-hover:hover {
          color: #FF4D4D;
          border-color: rgba(255, 0, 0, 0.4);
          background: rgba(255, 0, 0, 0.05);
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.25);
          transform: translateY(-1px);
        }

        .footer-links-col h4 {
          font-size: 14px;
          color: #FFF;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 20px;
          font-weight: 700;
        }

        .footer-links-col ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-links-col button {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 13.5px;
          font-family: var(--font-sans);
          transition: color 0.3s ease;
          padding: 0;
          text-align: left;
        }

        .footer-links-col button:hover {
          color: var(--accent-cyan);
        }

        .footer-bottom-row {
          max-width: 1200px;
          margin: 0 auto;
          border-top: 1px solid var(--border-glass);
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--text-muted);
          flex-wrap: wrap;
          gap: 16px;
        }

        .footer-meta-badges {
          display: flex;
          gap: 20px;
        }

        .badge-legal {
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .badge-legal:hover {
          color: var(--text-secondary);
        }

        /* Floating action widget */
        .floating-prayer-widget {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 99;
          background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
          color: #FFF;
          border: none;
          border-radius: 50px;
          padding: 12px 20px;
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(0, 80, 255, 0.45);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .floating-prayer-widget:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 15px 30px rgba(0, 80, 255, 0.6);
        }

        .floating-widget-label {
          max-width: 0;
          overflow: hidden;
          white-space: nowrap;
          transition: max-width 0.4s ease;
        }

        .floating-prayer-widget:hover .floating-widget-label {
          max-width: 100px;
        }
      `}</style>
      <Analytics />
    </div>
  );
}

export default App;
