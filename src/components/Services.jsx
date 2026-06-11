import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Calendar, Clock, MapPin, Video, BellRing, X, ZoomIn } from 'lucide-react';

export default function Services() {
  const { churchInfo, setActivePage } = useContext(AppContext);
  const [selectedFlyer, setSelectedFlyer] = useState(null);

  // Parse service timings
  let dbSchedules = [];
  if (churchInfo && churchInfo.service_timings) {
    try {
      dbSchedules = JSON.parse(churchInfo.service_timings);
    } catch (e) {
      console.error('Failed to parse dynamic schedules:', e);
    }
  }

  const defaultServices = [
    {
      title: 'Morning Service',
      day: 'Every Sunday',
      time: '9:00 AM',
      location: 'Rajaram Heights, 1st Floor, Masjid Banda Circle, Kondapur, Hyderabad',
      description: 'Join us for a powerful time of praise, prayer, and deep exposition of God\'s Word. Children’s Sunday School runs concurrently.',
      hasStream: true,
      accent: 'var(--accent-blue)'
    },
    {
      title: 'Sunday School',
      day: 'Every Sunday',
      time: '11:00 AM',
      location: 'Rajaram Heights, 1st Floor, Masjid Banda Circle, Kondapur, Hyderabad',
      description: 'Spiritual grounding and fun interactive Bible learning sessions for children of all age groups (toddlers to teens).',
      hasStream: false,
      accent: '#FF7F00'
    },
    {
      title: 'Afternoon Service',
      day: 'Every Sunday',
      time: '12:30 PM',
      location: 'Rajaram Heights, 1st Floor, Masjid Banda Circle, Kondapur, Hyderabad',
      description: 'A vibrant corporate worship and covenant gathering for families, professionals, and students.',
      hasStream: false,
      accent: 'var(--accent-cyan)'
    },
    {
      title: 'Evening Service',
      day: 'Every Sunday',
      time: '6:00 PM',
      location: 'Rajaram Heights, 1st Floor, Masjid Banda Circle, Kondapur, Hyderabad',
      description: 'Focused corporate intercession, spiritual study, communion, and worship.',
      hasStream: true,
      accent: '#FF0055'
    },
    {
      title: 'Youth Fire Fellowship',
      day: 'Every Friday',
      time: '7:00 PM - 9:00 PM',
      location: 'Rajaram Heights, 1st Floor, Masjid Banda Circle, Kondapur, Hyderabad',
      description: 'A dynamic, high-energy environment for teenagers and college students to worship together, study relevant issues, and build strong Christian friendships.',
      hasStream: false,
      accent: '#FF7F00'
    },
    {
      title: 'Mid-Week Bible Study & Communion',
      day: 'Every Wednesday',
      time: '6:30 PM - 8:00 PM',
      location: 'Rajaram Heights, 1st Floor, Masjid Banda Circle, Kondapur, Hyderabad',
      description: 'An interactive verse-by-verse study of Scripture followed by a solemn sharing of the Lord’s Supper and focused corporate intercession.',
      hasStream: false,
      accent: '#FFD600'
    }
  ];

  const servicesData = dbSchedules && dbSchedules.length > 0
    ? dbSchedules.map((s, idx) => ({
        title: s.name,
        day: s.name.toLowerCase().includes('sunday') ? 'Every Sunday' : (s.name.toLowerCase().includes('friday') ? 'Every Friday' : (s.name.toLowerCase().includes('wednesday') ? 'Every Wednesday' : 'Weekly')),
        time: s.time,
        location: s.location || 'Rajaram Heights, 1st Floor, Masjid Banda Circle, Kondapur, Hyderabad',
        description: `Gather with us for ${s.name}. All are welcome to join in person or via live stream.`,
        hasStream: s.name.toLowerCase().includes('worship') || s.name.toLowerCase().includes('morning') || s.name.toLowerCase().includes('evening'),
        accent: idx % 4 === 0 ? 'var(--accent-blue)' : (idx % 4 === 1 ? 'var(--accent-cyan)' : (idx % 4 === 2 ? '#FF7F00' : '#FF0055'))
      }))
    : defaultServices;

  const handleAddNotification = (serviceTitle) => {
    alert(`Reminder notification configured! We will alert you 15 minutes before the "${serviceTitle}" starts.`);
  };

  return (
    <div className="services-page section-padding">
      <div className="services-container">
        
        <div className="services-header">
          <span className="section-subtitle">GATHER WITH US</span>
          <h2 className="section-title">Service Timings & Assemblies</h2>
          <div className="header-divider"></div>
          <p className="services-intro">
            We offer multiple opportunities throughout the week to connect with God and fellow believers. 
            Join us in person or watch our live stream from anywhere in the world.
          </p>
        </div>

        {/* Bulletins & Sunday Banners Section */}
        <div className="flyers-section glass-panel">
          <div className="flyers-header-box">
            <Calendar className="flyers-icon" size={24} />
            <div>
              <h3>Sunday Announcements & Bulletins</h3>
              <p>Explore detailed info and preaching schedules for our Sunday gatherings (Click to enlarge flyers)</p>
            </div>
          </div>
          <div className="flyers-grid">
            <div className="flyer-card" onClick={() => setSelectedFlyer('/pastor_jonathan_sunday.png')}>
              <img src="/pastor_jonathan_sunday.png" alt="Sunday Service Flyer - Pastor C. Jonathan Edward" className="flyer-img" />
              <div className="flyer-overlay">
                <ZoomIn size={24} className="zoom-icon" />
                <span>Enlarge Flyer</span>
              </div>
            </div>
            <div className="flyer-card" onClick={() => setSelectedFlyer('/nirmala_jonathan_sunday.jpg')}>
              <img src="/nirmala_jonathan_sunday.jpg" alt="Sunday Service Flyer - Nirmala Jonathan" className="flyer-img" />
              <div className="flyer-overlay">
                <ZoomIn size={24} className="zoom-icon" />
                <span>Enlarge Flyer</span>
              </div>
            </div>
          </div>
        </div>

        <div className="services-list">
          {servicesData.map((service, idx) => (
            <div key={idx} className="service-card glass-panel" style={{ '--glow-color': service.accent }}>
              <div className="service-side-glow"></div>
              
              <div className="service-main-content">
                <div className="service-title-row">
                  <h3>{service.title}</h3>
                  <span className="service-badge">{service.day}</span>
                </div>
                
                <p className="service-desc">{service.description}</p>
                
                <div className="service-meta-grid">
                  <div className="meta-item">
                    <Clock size={16} className="meta-icon" />
                    <span>{service.time}</span>
                  </div>
                  <div className="meta-item">
                    <MapPin size={16} className="meta-icon" />
                    <span>{service.location}</span>
                  </div>
                </div>
              </div>

              <div className="service-actions">
                {service.hasStream ? (
                  <button 
                    onClick={() => setActivePage('live')} 
                    className="btn-primary stream-btn"
                  >
                    <Video size={16} />
                    <span>Watch Stream</span>
                  </button>
                ) : (
                  <div className="in-person-only-badge">In-Person Only</div>
                )}
                
                <button 
                  onClick={() => handleAddNotification(service.title)} 
                  className="btn-secondary reminder-btn"
                >
                  <BellRing size={16} />
                  <span>Set Reminder</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Flyer Lightbox Modal */}
      {selectedFlyer && (
        <div className="flyer-lightbox-overlay" onClick={() => setSelectedFlyer(null)}>
          <div className="flyer-lightbox-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="flyer-lightbox-close" onClick={() => setSelectedFlyer(null)}>
              <X size={20} />
            </button>
            <img src={selectedFlyer} alt="Enlarged Bulletin Flyer" className="flyer-lightbox-img" />
          </div>
        </div>
      )}

      <style>{`
        .services-page {
          background-color: var(--bg-dark);
          position: relative;
          z-index: 5;
        }

        .services-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .services-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 40px;
        }

        .services-intro {
          max-width: 650px;
          margin-top: 20px;
          font-size: 16px;
          color: var(--text-secondary);
        }

        /* Flyers Section */
        .flyers-section {
          padding: 30px;
          margin-bottom: 40px;
          border-radius: 16px;
          text-align: left;
          background: rgba(10, 10, 12, 0.4);
        }

        .flyers-header-box {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 16px;
        }

        .flyers-icon {
          color: var(--accent-cyan);
          filter: drop-shadow(0 0 8px rgba(0, 214, 255, 0.4));
        }

        .flyers-header-box h3 {
          font-size: 18px;
          color: #FFF;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .flyers-header-box p {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .flyers-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 768px) {
          .flyers-grid {
            grid-template-columns: 1fr;
          }
        }

        .flyer-card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 3 / 4;
          background: #000;
          border: 1px solid var(--border-glass);
          cursor: pointer;
          box-shadow: var(--shadow-premium);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.4s ease,
                      box-shadow 0.4s ease;
        }

        .flyer-card:hover {
          transform: translateY(-4px) scale(1.01);
          border-color: var(--border-glow);
          box-shadow: var(--shadow-glow);
        }

        .flyer-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .flyer-card:hover .flyer-img {
          transform: scale(1.03);
        }

        .flyer-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(3, 3, 5, 0.7);
          backdrop-filter: blur(2px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .flyer-card:hover .flyer-overlay {
          opacity: 1;
        }

        .zoom-icon {
          color: var(--accent-cyan);
          filter: drop-shadow(0 0 6px var(--accent-cyan));
        }

        .flyer-overlay span {
          font-family: var(--font-heading);
          font-size: 13px;
          color: #FFF;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* Lightbox Modal */
        .flyer-lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(3, 3, 5, 0.9);
          backdrop-filter: blur(10px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .flyer-lightbox-content {
          position: relative;
          max-width: 550px;
          width: 100%;
          max-height: 85vh;
          border-radius: 16px;
          overflow: hidden;
          background: var(--bg-card);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.8);
          animation: modalAppear 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .flyer-lightbox-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid var(--border-glass);
          color: #FFF;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .flyer-lightbox-close:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.05);
        }

        .flyer-lightbox-img {
          max-width: 100%;
          max-height: 85vh;
          object-fit: contain;
          display: block;
        }

        /* Services List styles */
        .services-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .service-card {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 240px;
          gap: 30px;
          padding: 36px;
          align-items: center;
          text-align: left;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .service-card {
            grid-template-columns: 1fr;
            padding: 24px;
            gap: 20px;
          }
        }

        .service-side-glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--glow-color);
          box-shadow: 0 0 15px var(--glow-color);
        }

        .service-main-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .service-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .service-title-row h3 {
          font-size: 22px;
          color: #FFF;
          font-weight: 700;
        }

        .service-badge {
          font-family: var(--font-heading);
          font-size: 11px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-glass);
          color: var(--accent-cyan);
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .service-desc {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .service-meta-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
        }

        .meta-icon {
          color: var(--accent-cyan);
        }

        .service-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          justify-content: center;
          align-items: stretch;
        }

        @media (max-width: 768px) {
          .service-actions {
            flex-direction: row;
            justify-content: flex-start;
          }
          .stream-btn, .reminder-btn, .in-person-only-badge {
            flex-grow: 1;
            max-width: 200px;
          }
        }

        @media (max-width: 576px) {
          .service-actions {
            flex-direction: column;
          }
          .stream-btn, .reminder-btn, .in-person-only-badge {
            max-width: 100%;
          }
        }

        .stream-btn {
          font-size: 14px;
          padding: 10px 20px;
        }

        .reminder-btn {
          font-size: 14px;
          padding: 10px 20px;
        }

        .in-person-only-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed var(--border-glass);
          color: var(--text-muted);
          font-family: var(--font-heading);
          font-weight: 500;
          font-size: 13px;
          padding: 10px;
          border-radius: 50px;
          text-align: center;
        }

        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
