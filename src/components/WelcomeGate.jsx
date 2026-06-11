import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Compass } from 'lucide-react';

export default function WelcomeGate() {
  const { welcomeEntered, setWelcomeEntered } = useContext(AppContext);
  const [shouldRender, setShouldRender] = useState(!welcomeEntered);
  const [fadeOut, setFadeOut] = useState(false);
  const [showText, setShowText] = useState(false);
  

  useEffect(() => {
    if (welcomeEntered) {
      setShouldRender(false);
      return;
    }
    // Delay text reveal slightly for cinematic entry
    const timer = setTimeout(() => setShowText(true), 500);
    return () => clearTimeout(timer);
  }, [welcomeEntered]);

  const handleEnter = () => {
    setFadeOut(true);
    // Let fade-out animation play before unmounting
    setTimeout(() => {
      setWelcomeEntered(true);
      setShouldRender(false);
    }, 1000);
  };

  

  if (!shouldRender) return null;

  return (
    <div className={`welcome-gate ${fadeOut ? 'fade-out' : ''}`}>
      {/* Intro removed: simplified welcome gate */}
      {/* Background Volumetric Glow Ambient Rings */}
      <div className="ambient-glow ring-1"></div>
      <div className="ambient-glow ring-2"></div>
      <div className="ambient-glow ring-3"></div>

      <div className="welcome-container">
        {/* Glowing Logo Icon */}
        <div className={`welcome-logo ${showText ? 'visible' : ''}`}>
          <Compass className="compass-icon" size={64} />
          <div className="logo-sparkle"></div>
        </div>

        {/* Cinematic Scripture Fade In */}
        <div className={`welcome-scripture ${showText ? 'visible' : ''}`}>
          <p className="scripture-ref">PSALM 100:4</p>
          <h1 className="scripture-text">
            "Enter His gates with thanksgiving and His courts with praise; give thanks to Him and praise His name."
          </h1>
          <div className="divider-glow"></div>
        </div>

        {/* Enter Sanctuary Button */}
        <div className={`welcome-action ${showText ? 'visible' : ''}`}>
          <button className="btn-enter" onClick={handleEnter}>
            <span className="btn-glow-ring"></span>
            <span className="btn-content">Enter Sanctuary</span>
          </button>
          <span className="welcome-subtext">EVANGELIZE &bull; EQUIP &bull; EDIFY</span>
        </div>
      </div>

      <style>{`
        
        .welcome-gate {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: #030304;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: transform 1.2s cubic-bezier(0.85, 0, 0.15, 1), 
                      opacity 1.2s cubic-bezier(0.85, 0, 0.15, 1);
        }

        .welcome-gate.fade-out {
          opacity: 0;
          transform: scale(1.08);
          pointer-events: none;
        }

        /* Ambient glowing circles simulating volumetric holy lights */
        .ambient-glow {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 80, 255, 0.12) 0%, rgba(0, 0, 0, 0) 70%);
          filter: blur(40px);
          pointer-events: none;
        }

        .ambient-glow.ring-1 {
          width: 800px;
          height: 800px;
          top: -200px;
          left: -200px;
          animation: lightRayReveal 10s infinite alternate;
        }

        .ambient-glow.ring-2 {
          width: 600px;
          height: 600px;
          bottom: -100px;
          right: -100px;
          background: radial-gradient(circle, rgba(0, 214, 255, 0.08) 0%, rgba(0, 0, 0, 0) 70%);
          animation: lightRayReveal 12s infinite alternate-reverse;
        }

        .ambient-glow.ring-3 {
          width: 500px;
          height: 500px;
          top: 30%;
          left: 40%;
          background: radial-gradient(circle, rgba(255, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0) 60%);
        }

        .welcome-container {
          max-width: 800px;
          padding: 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 48px;
          position: relative;
        }

        .welcome-logo {
          opacity: 0;
          transform: translateY(20px) scale(0.9);
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .welcome-logo.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .compass-icon {
          color: #00D6FF;
          filter: drop-shadow(0 0 15px rgba(0, 214, 255, 0.6));
          animation: pulseGlow 4s infinite ease-in-out;
        }

        .welcome-scripture {
          opacity: 0;
          transform: translateY(20px);
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;
        }

        .welcome-scripture.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .scripture-ref {
          font-family: var(--font-heading);
          color: #0050FF;
          font-size: 14px;
          letter-spacing: 0.3em;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .scripture-text {
          font-family: var(--font-heading);
          font-weight: 300;
          color: #E4E4E7;
          font-size: 32px;
          line-height: 1.4;
          letter-spacing: -0.01em;
          max-width: 700px;
        }

        @media (max-width: 768px) {
          .scripture-text {
            font-size: 22px;
          }
        }

        .divider-glow {
          height: 1px;
          width: 80px;
          background: linear-gradient(90deg, transparent, #00D6FF, transparent);
          margin: 32px auto 0;
          box-shadow: 0 0 8px #00D6FF;
        }

        .welcome-action {
          opacity: 0;
          transform: translateY(20px);
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .welcome-action.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .btn-enter {
          position: relative;
          background: transparent;
          border: none;
          padding: 2px;
          cursor: pointer;
          border-radius: 50px;
          outline: none;
        }

        .btn-glow-ring {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50px;
          background: linear-gradient(90deg, #0050FF, #00D6FF, #FF0000, #0050FF);
          background-size: 300% 100%;
          animation: btnGlowMove 4s linear infinite;
          opacity: 0.6;
          filter: blur(4px);
          transition: opacity 0.3s ease;
        }

        .btn-enter:hover .btn-glow-ring {
          opacity: 1;
          filter: blur(8px);
        }

        .btn-content {
          position: relative;
          display: block;
          background: #09090b;
          color: #ffffff;
          padding: 16px 40px;
          border-radius: 48px;
          font-family: var(--font-heading);
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 0.05em;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .btn-enter:hover .btn-content {
          background: transparent;
          color: #ffffff;
          border-color: transparent;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
        }

        .welcome-subtext {
          font-family: var(--font-heading);
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.4em;
          margin-top: 8px;
        }

        @keyframes btnGlowMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
      `}</style>
    </div>
  );
}
