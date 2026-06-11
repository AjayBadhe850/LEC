import { useEffect, useRef, useState, useContext } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Compass, Check } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const Youtube = ({ size = 24, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export default function Contact() {
  const { churchInfo } = useContext(AppContext);
  const mapRef = useRef(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');

  const phoneVal1 = churchInfo?.contact_phone_1 || '9951155663';
  const phoneVal2 = churchInfo?.contact_phone_2 || '';
  const emailVal = churchInfo?.contact_email || 'office@lifeedifiers.org';
  const addressVal = churchInfo?.address || 'Rajaram Heights, 1st Floor, Masjid Banda Circle, Kondapur, Hyderabad, Telangana, India';

  // Form Submit Simulation
  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSubmitStatus('Message sent successfully! Our office will get back to you shortly.');
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSubmitStatus(''), 5000);
  };

  // Dark Map Canvas Render
  useEffect(() => {
    const canvas = mapRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let pulseRadius = 6;
    let pulseGrow = true;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = 400;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawMap = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Clear with dark bg
      ctx.fillStyle = '#060608';
      ctx.fillRect(0, 0, w, h);

      // Grid background
      ctx.strokeStyle = '#0f0f15';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw stylized river/water body (diagonal curvy curve)
      ctx.strokeStyle = '#071630';
      ctx.lineWidth = 45;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(-50, h * 0.2);
      ctx.bezierCurveTo(w * 0.3, h * 0.1, w * 0.5, h * 0.9, w + 50, h * 0.8);
      ctx.stroke();

      // Draw streets/roads
      ctx.strokeStyle = '#181820';
      ctx.lineWidth = 4;

      // Horizontal highway
      ctx.beginPath();
      ctx.moveTo(0, h * 0.4);
      ctx.lineTo(w, h * 0.45);
      ctx.stroke();

      // Diagonal avenue
      ctx.beginPath();
      ctx.moveTo(w * 0.25, 0);
      ctx.lineTo(w * 0.8, h);
      ctx.stroke();

      // Curve street
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#121217';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, 90, 0, Math.PI * 2);
      ctx.stroke();

      // Church location coordinate (center-right intersection)
      const pinX = w * 0.52;
      const pinY = h * 0.48;

      // Pulse Glow Circle
      ctx.fillStyle = 'rgba(0, 80, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(pinX, pinY, pulseRadius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Pulse outer glow stroke
      ctx.strokeStyle = 'rgba(0, 214, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pinX, pinY, pulseRadius * 1.8, 0, Math.PI * 2);
      ctx.stroke();

      // Pin Core
      ctx.fillStyle = '#0050FF';
      ctx.beginPath();
      ctx.arc(pinX, pinY, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(pinX, pinY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // HUD Marker Overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.strokeStyle = 'rgba(0, 214, 255, 0.3)';
      ctx.lineWidth = 1;

      // HUD Card rectangle
      const cardW = 180;
      const cardH = 54;
      const cardX = pinX - cardW / 2;
      const cardY = pinY - cardH - 18;

      // Rounded rectangle
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(cardX, cardY, cardW, cardH, 8) : ctx.rect(cardX, cardY, cardW, cardH);
      ctx.fill();
      ctx.stroke();

      // Pointer line
      ctx.beginPath();
      ctx.moveTo(pinX, pinY - 8);
      ctx.lineTo(pinX, cardY + cardH);
      ctx.stroke();

      // Card Content Text
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.fillText(churchInfo?.name?.toUpperCase() || 'LIFE EDIFIERS CHURCH', cardX + 12, cardY + 20);

      ctx.fillStyle = 'rgba(0, 214, 255, 0.8)';
      ctx.font = '9px Outfit, sans-serif';
      const shortAddr = (churchInfo?.address || 'RAJARAM HEIGHTS, KONDAPUR').toUpperCase();
      ctx.fillText(shortAddr.length > 30 ? shortAddr.substring(0, 28) + '...' : shortAddr, cardX + 12, cardY + 34);

      ctx.fillStyle = '#8A8A93';
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText('PULSING VECTOR RADAR SYSTEM', cardX + 12, cardY + 44);

      // Animate Pulse
      if (pulseGrow) {
        pulseRadius += 0.15;
        if (pulseRadius > 14) pulseGrow = false;
      } else {
        pulseRadius -= 0.15;
        if (pulseRadius < 6) pulseGrow = true;
      }

      animationId = requestAnimationFrame(drawMap);
    };

    drawMap();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [churchInfo]);

  return (
    <div className="contact-page section-padding">
      <div className="contact-container">

        <div className="contact-header">
          <span className="section-subtitle">COMMUNITY CONNECTION</span>
          <h2 className="section-title">Reach Out & Sanctuary Location</h2>
          <div className="header-divider"></div>
          <p className="contact-intro">
            Have questions about services, membership, or ministries? Drop us a line,
            chat on WhatsApp, or follow navigation to gather with us.
          </p>
        </div>

        <div className="contact-grid">

          {/* Left Form */}
          <div className="contact-form-column">
            <div className="form-box glass-panel">
              <h3>Send a Message</h3>
              <div className="form-divider"></div>

              {submitStatus && (
                <div className="success-banner-inline margin-bottom-20">
                  <Check size={16} />
                  <span>{submitStatus}</span>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="contact-inputs-form">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Your Message *</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write details of your question or prayer support request here..."
                    className="form-input form-textarea"
                    rows={4}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary w-full submit-contact-btn">
                  <Send size={16} />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Location/Info */}
          <div className="contact-info-column">

            {/* Quick Details Cards */}
            <div className="quick-info-cards-grid">

              <div className="info-item-card glass-panel">
                <div className="info-icon-wrapper">
                  <Phone size={18} />
                </div>
                <div className="info-texts">
                  <span className="info-label">CALL PASTORAL OFFICE</span>
                  <p className="info-val">
                    {phoneVal1}
                    {phoneVal2 ? ` / ${phoneVal2}` : ''}
                  </p>
                </div>
              </div>

              <div className="info-item-card glass-panel">
                <div className="info-icon-wrapper">
                  <Mail size={18} />
                </div>
                <div className="info-texts">
                  <span className="info-label">EMAIL SUPPORT</span>
                  <p className="info-val">{emailVal}</p>
                </div>
              </div>

              <div className="info-item-card glass-panel">
                <div className="info-icon-wrapper">
                  <MapPin size={18} />
                </div>
                <div className="info-texts">
                  <span className="info-label">SANCTUARY ADRESS</span>
                  <p className="info-val">{addressVal}</p>
                </div>
              </div>

            </div>

            {/* Canvas Radar Map */}
            <div className="radar-map-wrapper margin-top-24">
              <div className="map-canvas-container">
                <canvas ref={mapRef} className="radar-map-canvas"></canvas>
              </div>

              {/* Maps shortcuts CTAs */}
              <div className="map-shortcuts-row margin-top-16">
                <a
                  href={`https://wa.me/91${phoneVal1.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary map-shortcut-btn whatsapp-color"
                >
                  <MessageSquare size={16} />
                  <span>Chat on WhatsApp</span>
                </a>

                <a
                  href="https://share.google/TCsZjVUhMeJql045Z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary map-shortcut-btn"
                >
                  <Compass size={16} />
                  <span>Navigate Google Maps</span>
                </a>

                <a
                  href="https://www.youtube.com/@LifeEdifiersChurch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary map-shortcut-btn youtube-color"
                >
                  <Youtube size={16} />
                  <span>YouTube Channel</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>

      <style>{`
        .contact-page {
          background-color: var(--bg-dark);
          position: relative;
          z-index: 5;
        }

        .contact-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .contact-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 50px;
        }

        .contact-intro {
          max-width: 650px;
          margin-top: 20px;
          font-size: 16px;
          color: var(--text-secondary);
        }

        /* Grid */
        .contact-grid {
          display: grid;
          grid-template-columns: 460px 1fr;
          gap: 40px;
          align-items: start;
        }

        @media (max-width: 992px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }

        .form-box {
          padding: 40px;
          background: var(--bg-card);
          text-align: left;
        }

        .contact-inputs-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .submit-contact-btn {
          gap: 10px;
        }

        /* Info columns */
        .contact-info-column {
          display: flex;
          flex-direction: column;
        }

        .quick-info-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 576px) {
          .quick-info-cards-grid {
            grid-template-columns: 1fr;
          }
        }

        .info-item-card {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          text-align: left;
          background: rgba(10, 10, 12, 0.4);
        }

        .info-item-card:last-child {
          grid-column: span 2;
        }

        @media (max-width: 576px) {
          .info-item-card:last-child {
            grid-column: span 1;
          }
        }

        .info-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(0, 214, 255, 0.05);
          border: 1px solid rgba(0, 214, 255, 0.2);
          color: var(--accent-cyan);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .info-texts {
          display: flex;
          flex-direction: column;
        }

        .info-label {
          font-family: var(--font-heading);
          font-size: 9px;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .info-val {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 14.5px;
          color: #FFF;
        }

        /* Radar map styles */
        .radar-map-wrapper {
          display: flex;
          flex-direction: column;
        }

        .radar-map-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }

        .map-shortcuts-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .map-shortcuts-row {
            grid-template-columns: 1fr;
          }
        }

        .map-shortcut-btn {
          font-size: 13px;
          padding: 10px;
          gap: 6px;
        }

        .whatsapp-color:hover {
          color: #25D366;
          border-color: rgba(37, 211, 102, 0.4);
          background: rgba(37, 211, 102, 0.05);
        }

        .youtube-color:hover {
          color: #FF0000;
          border-color: rgba(255, 0, 0, 0.45);
          background: rgba(255, 0, 0, 0.05);
        }

        .margin-top-24 { margin-top: 24px; }
        .margin-top-16 { margin-top: 16px; }
      `}</style>
    </div>
  );
}
