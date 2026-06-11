import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Heart, Send, CheckCircle2, ShieldAlert, HeartHandshake, EyeOff, Eye } from 'lucide-react';

export default function PrayerPortal() {
  const { prayers, submitPrayerRequest, isLoggedIn, currentUser } = useContext(AppContext);
  const [name, setName] = useState(currentUser?.name || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [request, setRequest] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  
  // Track local prayer clicks to show love/support simulation
  const [localPrayersState, setLocalPrayersState] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || !request.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    const res = submitPrayerRequest(name, mobile, request, isPublic);
    if (res.success) {
      setSubmitted(true);
      setRequest('');
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    }
  };

  const handleSupportClick = (id) => {
    setLocalPrayersState((prev) => ({
      ...prev,
      [id]: {
        prayed: true,
        count: (prev[id]?.count || 0) + 1
      }
    }));
  };

  const publicPrayers = prayers.filter((p) => p.isPublic);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Answered': return 'status-answered';
      case 'Praying': return 'status-praying';
      default: return 'status-pending';
    }
  };

  return (
    <div className="prayer-page section-padding">
      <div className="prayer-container">
        
        <div className="prayer-header">
          <span className="section-subtitle">PRAYER SHIELD</span>
          <h2 className="section-title">Intercessory & Prayer Portal</h2>
          <div className="header-divider"></div>
          <p className="prayer-intro">
            "For where two or three gather in my name, there am I with them." We invite you to 
            submit your petitions. Our pastoral team and intercessory chain pray over every request daily.
          </p>
        </div>

        <div className="prayer-grid">
          
          {/* Left Submit Form */}
          <div className="submit-column">
            <div className="submit-box glass-panel">
              <h3>Submit Prayer Request</h3>
              <div className="form-divider"></div>

              {submitted ? (
                <div className="submit-success-banner">
                  <HeartHandshake size={48} className="heart-shake-glow" />
                  <h4>Petition Submitted</h4>
                  <p>
                    Thank you. Your prayer request has been logged. Our intercession team is already lifting 
                    your request to the throne of grace.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="prayer-form">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Mobile Number (for pastoral support) *</label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Prayer Petition *</label>
                    <textarea
                      value={request}
                      onChange={(e) => setRequest(e.target.value)}
                      placeholder="Write your request details here... (e.g. healing, guidance, thanksgiving)"
                      className="form-input form-textarea"
                      rows={5}
                      required
                    ></textarea>
                  </div>

                  {/* Public/Private toggle widget */}
                  <div className="privacy-toggle-box" onClick={() => setIsPublic(!isPublic)}>
                    <div className="toggle-info">
                      <span className="toggle-label">Publish on public prayer wall?</span>
                      <p className="toggle-sublabel">
                        {isPublic 
                          ? 'Other members will see your request and join in prayer.' 
                          : 'Private. Only the Pastoral Team will receive your request.'}
                      </p>
                    </div>
                    <button type="button" className={`btn-toggle-circle ${isPublic ? 'active' : ''}`}>
                      {isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>

                  <button type="submit" className="btn-primary w-full submit-prayer-btn">
                    <Send size={16} />
                    <span>Submit Petition</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Live Wall */}
          <div className="wall-column">
            <div className="wall-box glass-panel">
              <div className="wall-header-row">
                <h3>Public Prayer Wall</h3>
                <span className="active-glow-tag">
                  <span className="glow-dot animate-pulse"></span>
                  <span>LIVE WALL</span>
                </span>
              </div>
              <div className="form-divider"></div>

              <div className="wall-feed">
                {publicPrayers.map((prayer) => {
                  const state = localPrayersState[prayer.id];
                  const supportCount = (state?.count || 0) + (prayer.status === 'Answered' ? 12 : prayer.status === 'Praying' ? 4 : 1);
                  const userPrayed = state?.prayed || false;

                  return (
                    <div key={prayer.id} className="wall-card glass-panel">
                      <div className="wall-card-header">
                        <span className="wall-user-name">{prayer.name}</span>
                        <span className={`status-badge ${getStatusClass(prayer.status)}`}>
                          {prayer.status}
                        </span>
                      </div>
                      
                      <p className="wall-petition-text">"{prayer.request}"</p>
                      
                      <div className="wall-card-footer">
                        <span className="wall-date">{prayer.date}</span>
                        
                        <button
                          onClick={() => handleSupportClick(prayer.id)}
                          className={`btn-pray-support ${userPrayed ? 'active' : ''}`}
                          disabled={userPrayed}
                        >
                          <Heart size={14} fill={userPrayed ? 'currentColor' : 'none'} />
                          <span>{userPrayed ? 'I Prayed' : 'Agree in Prayer'} ({supportCount})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {publicPrayers.length === 0 && (
                  <div className="empty-wall-state">
                    <ShieldAlert size={36} className="text-muted" />
                    <p>No public prayer requests currently on the wall.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        .prayer-page {
          background-color: var(--bg-dark);
          position: relative;
          z-index: 5;
        }

        .prayer-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .prayer-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 50px;
        }

        .prayer-intro {
          max-width: 680px;
          margin-top: 20px;
          font-size: 16px;
          color: var(--text-secondary);
        }

        /* Grid layout */
        .prayer-grid {
          display: grid;
          grid-template-columns: 460px 1fr;
          gap: 30px;
          align-items: start;
        }

        @media (max-width: 992px) {
          .prayer-grid {
            grid-template-columns: 1fr;
          }
        }

        .submit-box {
          padding: 40px;
          background: var(--bg-card);
          text-align: left;
        }

        .form-divider {
          width: 40px;
          height: 3px;
          background: var(--accent-blue);
          margin: 12px 0 24px;
          border-radius: 2px;
        }

        .form-textarea {
          resize: none;
        }

        .submit-prayer-btn {
          gap: 10px;
        }

        /* Privacy toggle widget */
        .privacy-toggle-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .privacy-toggle-box:hover {
          border-color: var(--border-glow);
          background: rgba(255, 255, 255, 0.04);
        }

        .toggle-info {
          text-align: left;
        }

        .toggle-label {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 14px;
          color: #FFF;
        }

        .toggle-sublabel {
          font-size: 11.5px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .btn-toggle-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--border-glass);
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-toggle-circle.active {
          background: var(--accent-blue);
          color: #FFF;
          border-color: var(--accent-blue);
          box-shadow: 0 0 10px rgba(0, 80, 255, 0.4);
        }

        /* Success Banner */
        .submit-success-banner {
          text-align: center;
          padding: 30px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .heart-shake-glow {
          color: var(--accent-cyan);
          filter: drop-shadow(0 0 10px var(--accent-cyan));
          animation: beat 1s infinite alternate;
        }

        @keyframes beat {
          to { transform: scale(1.1); }
        }

        .submit-success-banner h4 {
          font-size: 20px;
          color: #FFF;
        }

        .submit-success-banner p {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Live wall panel */
        .wall-box {
          padding: 40px;
          background: var(--bg-card);
          height: 720px;
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 576px) {
          .wall-box {
            padding: 24px;
            height: 600px;
          }
        }

        .wall-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
        }

        .active-glow-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 214, 255, 0.08);
          border: 1px solid rgba(0, 214, 255, 0.3);
          color: var(--accent-cyan);
          padding: 4px 10px;
          border-radius: 4px;
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 11px;
        }

        .glow-dot {
          width: 6px;
          height: 6px;
          background-color: var(--accent-cyan);
          border-radius: 50%;
          box-shadow: 0 0 6px var(--accent-cyan);
        }

        .wall-feed {
          flex-grow: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: left;
          padding-right: 6px;
        }

        .wall-card {
          padding: 24px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: border-color 0.3s ease;
        }

        .wall-card:hover {
          border-color: var(--border-glow);
        }

        .wall-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .wall-user-name {
          font-family: var(--font-heading);
          font-weight: 700;
          color: #FFF;
          font-size: 15px;
        }

        .status-badge {
          font-family: var(--font-heading);
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
        }

        .status-pending {
          background: rgba(255, 127, 0, 0.1);
          color: #FF7F00;
          border: 1px solid rgba(255, 127, 0, 0.3);
        }

        .status-praying {
          background: rgba(0, 80, 255, 0.1);
          color: var(--accent-blue);
          border: 1px solid rgba(0, 80, 255, 0.3);
        }

        .status-answered {
          background: rgba(0, 214, 255, 0.1);
          color: var(--accent-cyan);
          border: 1px solid rgba(0, 214, 255, 0.3);
          box-shadow: 0 0 6px rgba(0, 214, 255, 0.2);
        }

        .wall-petition-text {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          font-style: italic;
        }

        .wall-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px dashed var(--border-glass);
        }

        .wall-date {
          font-size: 11.5px;
          color: var(--text-muted);
        }

        .btn-pray-support {
          background: transparent;
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 50px;
          font-family: var(--font-heading);
          font-weight: 500;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-pray-support:hover {
          color: var(--accent-cyan);
          border-color: rgba(0, 214, 255, 0.3);
          background: rgba(0, 214, 255, 0.04);
        }

        .btn-pray-support.active {
          background: rgba(0, 214, 255, 0.1);
          color: var(--accent-cyan);
          border-color: var(--accent-cyan);
          box-shadow: 0 0 10px rgba(0, 214, 255, 0.25);
          cursor: default;
        }

        .empty-wall-state {
          padding: 40px;
          text-align: center;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
      `}</style>
    </div>
  );
}
