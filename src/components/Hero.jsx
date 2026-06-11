import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Canvas3D from './Canvas3D';
import { Compass, Play, Calendar, HeartHandshake } from 'lucide-react';

export default function Hero() {
  const { setActivePage, publicStats } = useContext(AppContext);

  return (
    <section className="hero-section">
      {/* Background 3D Viewport */}
      <Canvas3D />

      {/* Floating Sparkles & Shadows to enhance depth */}
      <div className="hero-vignette"></div>

      {/* Text Overlay Layer */}
      <div className="hero-overlay-content">
        <div className="hero-brand-badge animate-fade-in">
          <span className="badge-line"></span>
          <span className="badge-text">EVANGELIZE &bull; EQUIP &bull; EDIFY</span>
          <span className="badge-line"></span>
        </div>

        <h1 className="hero-title animate-text-reveal">
          Building Lives Through <br />
          <span className="gradient-text">God's Living Word</span>
        </h1>

        {publicStats?.mission ? (
          <p className="hero-subtitle animate-text-reveal-delayed" style={{ fontStyle: 'italic', color: 'var(--accent-cyan)' }}>
            "{publicStats.mission}"
          </p>
        ) : (
          <p className="hero-subtitle animate-text-reveal-delayed">
            Welcome to Life Edifiers Church. A contemporary sanctuary dedicated to equipping the saints,
            edifying the body of Christ, and evangelizing the nations with hope and truth.
          </p>
        )}

        <div className="hero-actions animate-fade-in-delayed">
          <button onClick={() => setActivePage('auth')} className="btn-primary">
            <Compass size={18} />
            <span>Join Lord's Kingdom</span>
          </button>

          <button onClick={() => setActivePage('live')} className="btn-secondary">
            <Play size={18} fill="currentColor" />
            <span>Watch Live</span>
          </button>

          <button onClick={() => setActivePage('prayer')} className="btn-secondary">
            <HeartHandshake size={18} />
            <span>Prayer Request</span>
          </button>

          <button onClick={() => setActivePage('services')} className="btn-secondary">
            <Calendar size={18} />
            <span>Service Timings</span>
          </button>
        </div>

        {/* Premium Stats Grid */}
        <div className="hero-stats-grid animate-fade-in-delayed">
          <div className="hero-stat-card">
            <span className="stat-num">{publicStats?.totalFamilies || 0}</span>
            <span className="stat-name">Church Families</span>
          </div>
          <div className="hero-stat-card">
            <span className="stat-num">{publicStats?.upcomingEvents || 0}</span>
            <span className="stat-name">Upcoming Gatherings</span>
          </div>
          <div className="hero-stat-card">
            <span className="stat-num">{publicStats?.membersCount || 0}</span>
            <span className="stat-name">Covenant Members</span>
          </div>
          <div className="hero-stat-card">
            <span className="stat-num" style={{ color: publicStats?.liveStatus ? 'var(--accent-red)' : 'var(--text-muted)' }}>
              {publicStats?.liveStatus ? 'LIVE' : 'OFFLINE'}
            </span>
            <span className="stat-name">Sanctuary Stream</span>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="hero-scroll-indicator" onClick={() => setActivePage('services')}>
        <span className="scroll-label">DISCOVER OUR FAITH</span>
        <span className="scroll-arrow-down"></span>
      </div>

      <style>{`
        .hero-section {
          position: relative;
          width: 100%;
          height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }

        .hero-vignette {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, transparent 30%, rgba(3, 3, 5, 0.85) 100%),
                      linear-gradient(to bottom, rgba(5,5,5,0.4) 0%, transparent 20%, rgba(5,5,5,0.7) 100%);
          z-index: 2;
          pointer-events: none;
        }

        .hero-overlay-content {
          position: relative;
          z-index: 3;
          max-width: 900px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .hero-brand-badge {
          display: flex;
          align-items: center;
          gap: 16px;
          color: var(--accent-cyan);
          letter-spacing: 0.35em;
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 11px;
        }

        .badge-line {
          width: 30px;
          height: 1px;
          background: var(--accent-cyan);
          opacity: 0.5;
        }

        .hero-title {
          font-family: var(--font-heading);
          font-weight: 900;
          font-size: 58px;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: #FFF;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 38px;
          }
        }

        .gradient-text {
          background: linear-gradient(135deg, #FFF 20%, var(--accent-cyan) 60%, var(--accent-blue) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 4px 12px rgba(0, 214, 255, 0.25));
        }

        .hero-subtitle {
          font-family: var(--font-sans);
          font-weight: 400;
          font-size: 17px;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 720px;
          margin-bottom: 8px;
        }

        @media (max-width: 768px) {
          .hero-subtitle {
            font-size: 14px;
          }
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 16px;
        }

        @media (max-width: 576px) {
          .hero-actions {
            flex-direction: column;
            width: 100%;
            padding: 0 20px;
          }
          .hero-actions button {
            width: 100%;
          }
        }

        .hero-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          width: 100%;
          max-width: 800px;
          margin-top: 30px;
        }

        @media (max-width: 768px) {
          .hero-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }

        .hero-stat-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          padding: 16px;
          backdrop-filter: blur(10px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .hero-stat-card:hover {
          border-color: var(--accent-cyan);
          background: rgba(0, 214, 255, 0.04);
          box-shadow: 0 0 15px rgba(0, 214, 255, 0.15);
          transform: translateY(-2px);
        }

        .hero-stat-card .stat-num {
          font-family: var(--font-heading);
          font-size: 26px;
          font-weight: 800;
          color: #FFF;
          text-shadow: 0 0 10px rgba(0, 214, 255, 0.3);
        }

        .hero-stat-card .stat-name {
          font-size: 11px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 4px;
          text-align: center;
        }

        /* Scroll indicator */
        .hero-scroll-indicator {
          position: absolute;
          bottom: 25px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.3s ease;
        }

        .hero-scroll-indicator:hover {
          opacity: 1;
        }

        .scroll-label {
          font-family: var(--font-heading);
          font-size: 9px;
          color: var(--text-muted);
          letter-spacing: 0.3em;
        }

        .scroll-arrow-down {
          width: 12px;
          height: 12px;
          border-left: 2px solid var(--accent-cyan);
          border-bottom: 2px solid var(--accent-cyan);
          transform: rotate(-45deg);
          animation: bounceArrow 2s infinite ease-in-out;
        }

        /* Animations */
        .animate-fade-in {
          animation: textReveal 1s ease-out forwards;
        }

        .animate-text-reveal {
          animation: textReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-text-reveal-delayed {
          opacity: 0;
          animation: textReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
        }

        .animate-fade-in-delayed {
          opacity: 0;
          animation: textReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
        }

        @keyframes bounceArrow {
          0%, 100% {
            transform: rotate(-45deg) translate(0, 0);
          }
          50% {
            transform: rotate(-45deg) translate(-4px, 4px);
          }
        }
      `}</style>
    </section>
  );
}
