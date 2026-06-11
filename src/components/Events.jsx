import { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { Calendar, Clock, MapPin, Users, CheckCircle, HelpCircle } from 'lucide-react';

export default function Events() {
  const { events, registerForEvent, isLoggedIn, currentUser, setActivePage } = useContext(AppContext);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const filters = ['All', 'Upcoming', 'Worship Nights', 'Outreach', 'Past'];

  const filteredEvents = events.filter((ev) => {
    if (activeFilter === 'All') return true;
    return ev.category === activeFilter;
  });

  const handleRegisterClick = (event) => {
    setSelectedEvent(event);
    setBookingConfirmed(false);
  };

  const handleConfirmRegistration = () => {
    if (!isLoggedIn) {
      alert("Please log in first. Redirecting to Join Lord's Kingdom portal.");
      setSelectedEvent(null);
      setActivePage('auth');
      return;
    }

    const res = registerForEvent(selectedEvent.id);
    if (res.success) {
      setBookingConfirmed(true);
    } else {
      alert(res.message);
    }
  };

  const isUserRegistered = (eventId) => {
    if (!currentUser || !currentUser.registeredEvents) return false;
    return currentUser.registeredEvents.includes(eventId);
  };

  const ticketIdRef = useRef(null);
  useEffect(() => {
    if (bookingConfirmed && !ticketIdRef.current) {
      ticketIdRef.current = `LE-${Date.now().toString().substring(6)}`;
    }
  }, [bookingConfirmed]);

  return (
    <div className="events-page section-padding">
      <div className="events-container">
        
        <div className="events-header">
          <span className="section-subtitle">OUR LIFE GATHERINGS</span>
          <h2 className="section-title">Events & Worship Gatherings</h2>
          <div className="header-divider"></div>
          <p className="events-intro">
            Connect with our family, attend empowering workshops, and participate in local outreach programs. 
            Register to reserve your seating for special gatherings.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="events-filter-bar">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`filter-tab-btn ${activeFilter === f ? 'active' : ''}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="events-grid">
          {filteredEvents.map((ev) => (
            <div key={ev.id} className="event-card glass-panel">
              {/* Event Header Banner (Stylized dynamic vector instead of standard image placeholders) */}
              <div className="event-banner-placeholder" style={{
                background: ev.category.includes('Worship') 
                  ? 'linear-gradient(135deg, #001860, #0050ff)' 
                  : ev.category.includes('Outreach') 
                  ? 'linear-gradient(135deg, #300060, #a33bff)' 
                  : 'linear-gradient(135deg, #0f172a, #1e293b)'
              }}>
                <div className="event-banner-pattern"></div>
                <span className="event-category-tag">{ev.category}</span>
              </div>

              <div className="event-body">
                <h3>{ev.title}</h3>
                <p className="event-desc-text">{ev.description}</p>
                
                <div className="event-details-list">
                  <div className="detail-item">
                    <Calendar size={14} className="detail-icon" />
                    <span>{ev.date}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={14} className="detail-icon" />
                    <span>{ev.time}</span>
                  </div>
                  <div className="detail-item">
                    <MapPin size={14} className="detail-icon" />
                    <span>{ev.location}</span>
                  </div>
                  <div className="detail-item">
                    <Users size={14} className="detail-icon" />
                    <span>{ev.registeredCount} attending</span>
                  </div>
                </div>

                <div className="event-footer">
                  {isUserRegistered(ev.id) ? (
                    <div className="registered-success-badge">
                      <CheckCircle size={16} />
                      <span>Registered</span>
                    </div>
                  ) : ev.category === 'Past' ? (
                    <span className="past-event-indicator">Concluded</span>
                  ) : (
                    <button 
                      onClick={() => handleRegisterClick(ev)} 
                      className="btn-primary event-reg-btn"
                    >
                      Register Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="empty-events-state glass-panel">
              <HelpCircle size={40} className="empty-icon" />
              <p>No scheduled events found under this category at the moment.</p>
            </div>
          )}
        </div>

        {/* Registration Modal Dialog Box */}
        {selectedEvent && (
          <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
            <div className="event-modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
              
              {!bookingConfirmed ? (
                <div className="modal-form-view">
                  <h3>Event Registration</h3>
                  <div className="modal-divider"></div>
                  
                  <div className="modal-event-summary">
                    <p className="summary-title">{selectedEvent.title}</p>
                    <p className="summary-date">{selectedEvent.date} &bull; {selectedEvent.time}</p>
                    <p className="summary-location">{selectedEvent.location}</p>
                  </div>

                  {!isLoggedIn ? (
                    <div className="auth-alert-message">
                      <p>You need a member account to book seatings. Don’t worry, it only takes a minute!</p>
                      <button onClick={handleConfirmRegistration} className="btn-primary w-full">
                        Sign In / Register
                      </button>
                    </div>
                  ) : (
                    <div className="registration-submission-box">
                      <p className="confirmation-pretext">
                        Confirming attendance for: <strong className="text-white">{currentUser?.name}</strong> ({currentUser?.email})
                      </p>
                      
                      <div className="form-group">
                        <label>Special Seating/Dietary Requirements (Optional)</label>
                        <input type="text" className="form-input" placeholder="e.g., wheelchair access, families seating" />
                      </div>

                      <div className="modal-actions-row">
                        <button onClick={() => setSelectedEvent(null)} className="btn-secondary">
                          Cancel
                        </button>
                        <button onClick={handleConfirmRegistration} className="btn-primary">
                          Confirm Seating
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="modal-success-view">
                  <div className="success-icon-wrapper">
                    <CheckCircle size={48} className="success-glow-icon" />
                  </div>
                  <h3>Seating Reserved!</h3>
                  <div className="modal-divider"></div>
                  <p className="success-message">
                    Hallelujah! Your registration for <strong>{selectedEvent.title}</strong> has been secured successfully. 
                    We have updated your member portal and emailed details to <strong>{currentUser?.email}</strong>.
                  </p>
                  
                  <div className="success-ticket-details">
                    <span className="ticket-label">TICKET ID</span>
                    <span className="ticket-value">LE-{Date.now().toString().substring(6)}</span>
                  </div>

                  <button onClick={() => setSelectedEvent(null)} className="btn-primary w-full">
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      <style>{`
        .events-page {
          background-color: var(--bg-dark);
          position: relative;
          z-index: 5;
        }

        .events-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .events-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 40px;
        }

        .events-intro {
          max-width: 650px;
          margin-top: 20px;
          font-size: 16px;
          color: var(--text-secondary);
        }

        /* Filter Tab Bar */
        .events-filter-bar {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 50px;
          flex-wrap: wrap;
        }

        .filter-tab-btn {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 14px;
          padding: 10px 22px;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .filter-tab-btn:hover {
          color: #FFF;
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .filter-tab-btn.active {
          background: var(--accent-blue);
          color: #FFF;
          border-color: var(--accent-blue);
          box-shadow: var(--shadow-glow);
        }

        /* Events Grid */
        .events-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        @media (max-width: 992px) {
          .events-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .events-grid {
            grid-template-columns: 1fr;
            padding: 0 10px;
          }
        }

        .event-card {
          overflow: hidden;
          display: flex;
          flex-direction: column;
          text-align: left;
          height: 100%;
          transition: transform 0.4s ease, border-color 0.3s ease;
        }

        .event-card:hover {
          transform: translateY(-5px);
          border-color: var(--border-glow);
        }

        .event-banner-placeholder {
          height: 140px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .event-banner-pattern {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.15;
          background-image: radial-gradient(circle at 1px 1px, #FFF 1px, transparent 0);
          background-size: 10px 10px;
        }

        .event-category-tag {
          position: absolute;
          top: 15px;
          left: 15px;
          font-family: var(--font-heading);
          font-size: 11px;
          font-weight: 700;
          background: rgba(0, 0, 0, 0.65);
          color: var(--accent-cyan);
          border: 1px solid rgba(0, 214, 255, 0.3);
          padding: 4px 10px;
          border-radius: 4px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .event-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex-grow: 1;
        }

        .event-body h3 {
          font-size: 20px;
          color: #FFF;
          font-weight: 700;
        }

        .event-desc-text {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          min-height: 68px;
        }

        .event-details-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 12px;
          border-top: 1px solid var(--border-glass);
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--text-muted);
        }

        .detail-icon {
          color: var(--accent-cyan);
        }

        .event-footer {
          margin-top: auto;
          padding-top: 20px;
        }

        .event-reg-btn {
          width: 100%;
          padding: 10px;
          font-size: 14px;
        }

        .registered-success-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid rgba(0, 214, 255, 0.4);
          background: rgba(0, 214, 255, 0.05);
          color: var(--accent-cyan);
          border-radius: 50px;
          padding: 10px;
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 14px;
        }

        .past-event-indicator {
          display: block;
          text-align: center;
          border: 1px dashed var(--border-glass);
          color: var(--text-muted);
          border-radius: 50px;
          padding: 10px;
          font-size: 13px;
        }

        .empty-events-state {
          grid-column: 1 / -1;
          padding: 60px;
          text-align: center;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .empty-icon {
          color: var(--text-muted);
        }

        /* Modal Settings */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(3, 3, 5, 0.85);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .event-modal-content {
          max-width: 500px;
          width: 100%;
          background-color: var(--bg-card);
          border-radius: 20px;
          padding: 36px;
          position: relative;
          animation: modalAppear 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-divider {
          width: 40px;
          height: 3px;
          background: var(--accent-cyan);
          margin: 12px 0 20px;
          border-radius: 2px;
        }

        .modal-event-summary {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }

        .summary-title {
          font-family: var(--font-heading);
          font-weight: 700;
          color: #FFF;
          font-size: 16px;
          margin-bottom: 6px;
        }

        .summary-date {
          font-size: 13px;
          color: var(--accent-cyan);
          margin-bottom: 4px;
        }

        .summary-location {
          font-size: 13px;
          color: var(--text-muted);
        }

        .auth-alert-message {
          text-align: center;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .text-white {
          color: #FFF;
        }

        .confirmation-pretext {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }

        .modal-actions-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 12px;
        }

        /* Success View */
        .modal-success-view {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .success-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(0, 214, 255, 0.08);
          border: 1px solid rgba(0, 214, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .success-glow-icon {
          color: var(--accent-cyan);
          filter: drop-shadow(0 0 10px var(--accent-cyan));
        }

        .success-message {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .success-ticket-details {
          background: rgba(0, 214, 255, 0.03);
          border: 1px dashed rgba(0, 214, 255, 0.2);
          border-radius: 8px;
          padding: 12px 24px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin: 12px 0 24px;
          width: 100%;
        }

        .ticket-label {
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.1em;
        }

        .ticket-value {
          font-family: var(--font-heading);
          font-size: 18px;
          font-weight: 700;
          color: var(--accent-cyan);
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}
