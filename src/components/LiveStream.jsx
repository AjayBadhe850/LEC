import { useState, useEffect, useContext } from 'react';
import { Play, Pause, Volume2, Search, Video, Tv, Radio, Send, Users, ShieldCheck } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const Youtube = ({ size = 24, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function LiveStream() {
  const { publicStats } = useContext(AppContext);
  const liveDetails = publicStats?.liveDetails || {};

  const [isLive, setIsLive] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { user: 'Sister Angela', text: 'Good morning! Watching from London. Glory to God!', time: '10:02 AM', role: 'Member' },
    { user: 'Brother Ken', text: 'Amen! Ready to receive the word today.', time: '10:04 AM', role: 'Member' },
    { user: 'Elder Thomas', text: 'Welcome everyone. Blessings to your households.', time: '10:05 AM', role: 'Leader' }
  ]);
  const [myMessage, setMyMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  const initialSermons = [
    { id: 1, title: 'Walking in Divine Authority', speaker: 'Rev. C. Jonathan Edward', series: 'Kingdom Living', date: '2026-06-07', duration: '48:12', gradient: 'linear-gradient(135deg, #111e38, #0050ff)' },
    { id: 2, title: 'Covenants of Promise', speaker: 'Co-Pastor Nirmala Jonathan', series: 'Covenants', date: '2026-05-31', duration: '52:40', gradient: 'linear-gradient(135deg, #2c0e38, #ff0055)' },
    { id: 3, title: 'Equipped to Overcome', speaker: 'Rev. C. Jonathan Edward', series: 'Victory', date: '2026-05-24', duration: '41:15', gradient: 'linear-gradient(135deg, #0e2a38, #00d6ff)' },
    { id: 4, title: 'Guardians of the Sanctuary', speaker: 'Rev. C. Jonathan Edward', series: 'Family Covenant', date: '2026-05-17', duration: '55:04', gradient: 'linear-gradient(135deg, #111e38, #002bb0)' }
  ];

  const [activeSermon, setActiveSermon] = useState({
    title: 'LIVE: Sunday Morning Worship - The Outpouring',
    speaker: 'Rev. C. Jonathan Edward',
    series: 'Pentecost Series',
    date: 'TODAY',
    isLive: true
  });

  // Calculate dynamic countdown timer
  useEffect(() => {
    if (!liveDetails || liveDetails.is_live === 1 || !liveDetails.scheduled_time) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(liveDetails.scheduled_time) - +new Date();
      let timeLeftObj = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        timeLeftObj = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return timeLeftObj;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [liveDetails?.scheduled_time, liveDetails?.is_live]);

  // Sync active sermon properties with dynamic live status from db
  useEffect(() => {
    if (liveDetails && isLive) {
      setActiveSermon({
        title: liveDetails.is_live === 1 
          ? (liveDetails.banner_text || 'LIVE: Sunday Morning Worship - The Outpouring')
          : (liveDetails.banner_text || 'Next Broadcast Scheduled'),
        speaker: 'Rev. C. Jonathan Edward',
        series: liveDetails.is_live === 1 ? 'Pentecost Series' : 'Upcoming Worship',
        date: liveDetails.is_live === 1 ? 'TODAY' : (liveDetails.scheduled_time ? new Date(liveDetails.scheduled_time).toLocaleString() : 'Soon'),
        isLive: true
      });
    }
  }, [liveDetails, isLive]);

  // Simulate incoming chat messages while live streaming
  useEffect(() => {
    if (!isLive || (liveDetails && liveDetails.is_live === 0)) return;

    const names = ['Sister Grace', 'Brother Mark', 'Evangelist Sarah', 'Deacon James', 'Sister Chloe'];
    const greetings = [
      'Preach it, Pastor! 🙌',
      'The presence of God is so strong here!',
      'Hallelujah! Thank you Jesus.',
      'Amen! God is our refuge and strength.',
      'So glad I tuned in today. Blessing from Texas!',
      'Equipping lives indeed!'
    ];

    const interval = setInterval(() => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setChatMessages((prev) => [
        ...prev,
        { user: randomName, text: randomGreeting, time: timeStr, role: 'Member' }
      ]);
    }, 6000);

    return () => clearInterval(interval);
  }, [isLive, liveDetails?.is_live]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!myMessage.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [
      ...prev,
      { user: 'You', text: myMessage, time: timeStr, role: 'Member' }
    ]);
    setMyMessage('');
  };

  const handleSermonSelect = (sermon) => {
    setIsLive(false);
    setIsPlaying(true);
    setActiveSermon({
      title: sermon.title,
      speaker: sermon.speaker,
      series: sermon.series,
      date: sermon.date,
      isLive: false,
      gradient: sermon.gradient
    });
  };

  const handleGoLive = () => {
    setIsLive(true);
    setIsPlaying(false);
    setActiveSermon({
      title: liveDetails && liveDetails.is_live === 1 
        ? (liveDetails.banner_text || 'LIVE: Sunday Morning Worship - The Outpouring')
        : (liveDetails.banner_text || 'Next Broadcast Scheduled'),
      speaker: 'Rev. C. Jonathan Edward',
      series: liveDetails && liveDetails.is_live === 1 ? 'Pentecost Series' : 'Upcoming Worship',
      date: liveDetails && liveDetails.is_live === 1 ? 'TODAY' : (liveDetails.scheduled_time ? new Date(liveDetails.scheduled_time).toLocaleString() : 'Soon'),
      isLive: true
    });
  };

  const filteredSermons = initialSermons.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(query) ||
      s.speaker.toLowerCase().includes(query) ||
      s.series.toLowerCase().includes(query)
    );
  });

  return (
    <div className="livestream-page section-padding">
      <div className="livestream-container">
        
        <div className="livestream-header">
          <span className="section-subtitle">BROADCAST SANCTUARY</span>
          <h2 className="section-title">Live Streams & Sermon Archives</h2>
          <div className="header-divider"></div>
        </div>

        {/* Live Broadcast Layout */}
        <div className="broadcast-grid">
          
          {/* Left Player Area */}
          <div className="player-column">
            
            {/* Player Container */}
            <div className="video-player-box glass-panel">
              
              <div 
                className="player-viewport"
                style={{
                  position: 'relative',
                  background: activeSermon.isLive 
                    ? 'linear-gradient(135deg, #09090b, #001860, #050505)'
                    : activeSermon.gradient || '#0F172A'
                }}
              >
                {isLive && liveDetails && liveDetails.is_live === 1 && liveDetails.youtube_url ? (
                  // Real Youtube Embed when Live
                  <>
                    <iframe
                      width="100%"
                      height="100%"
                      src={liveDetails.youtube_url}
                      title={activeSermon.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{ border: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
                    ></iframe>
                    <div className="live-status-tag animate-pulse" style={{ zIndex: 2 }}>
                      <span className="live-red-dot"></span>
                      <span>LIVE BROADCAST</span>
                    </div>
                  </>
                ) : isLive && liveDetails && liveDetails.is_live === 0 ? (
                  // Premium Countdown Clock when Offline
                  <div className="countdown-container animate-fade-in" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    padding: '30px',
                    background: 'radial-gradient(circle, rgba(16, 24, 48, 0.95) 0%, rgba(9, 9, 11, 0.98) 100%)',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 2
                  }}>
                    <div className="offline-tag" style={{
                      fontSize: '11px',
                      color: 'var(--accent-cyan)',
                      border: '1px solid rgba(0, 214, 255, 0.4)',
                      padding: '4px 10px',
                      borderRadius: '50px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontWeight: '600',
                      marginBottom: '15px'
                    }}>
                      Upcoming Stream
                    </div>
                    <h3 style={{
                      fontSize: '24px',
                      fontWeight: '600',
                      color: '#fff',
                      marginBottom: '10px',
                      textAlign: 'center',
                      maxWidth: '80%'
                    }}>
                      {liveDetails.banner_text || 'Join our Next Live Worship'}
                    </h3>
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      marginBottom: '25px'
                    }}>
                      Scheduled for: {liveDetails.scheduled_time ? new Date(liveDetails.scheduled_time).toLocaleString() : 'TBD'}
                    </p>

                    <div className="countdown-timer" style={{
                      display: 'flex',
                      gap: '15px',
                      justifyContent: 'center'
                    }}>
                      {[
                        { label: 'DAYS', value: timeLeft.days },
                        { label: 'HOURS', value: timeLeft.hours },
                        { label: 'MINS', value: timeLeft.minutes },
                        { label: 'SECS', value: timeLeft.seconds }
                      ].map((unit, idx) => (
                        <div key={idx} className="timer-unit" style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-glass)',
                          borderRadius: '12px',
                          width: '70px',
                          padding: '10px 0',
                          backdropFilter: 'blur(10px)'
                        }}>
                          <span className="unit-value" style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: 'var(--accent-cyan)',
                            fontFamily: 'monospace'
                          }}>
                            {String(unit.value).padStart(2, '0')}
                          </span>
                          <span className="unit-label" style={{
                            fontSize: '9px',
                            color: 'var(--text-muted)',
                            letterSpacing: '0.05em',
                            marginTop: '4px'
                          }}>
                            {unit.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Archive Playback / Offline Fallback Player (Original Layout)
                  <>
                    {isLive && (
                      <div className="live-status-tag animate-pulse" style={{ zIndex: 2 }}>
                        <span className="live-red-dot"></span>
                        <span>LIVE BROADCAST</span>
                      </div>
                    )}

                    <div className="player-mid-icon" onClick={() => setIsPlaying(!isPlaying)} style={{ zIndex: 2 }}>
                      {isPlaying ? (
                        <div className="audio-bars">
                          <span className="bar b-1"></span>
                          <span className="bar b-2"></span>
                          <span className="bar b-3"></span>
                        </div>
                      ) : (
                        <Play size={48} className="play-overlay-icon" />
                      )}
                    </div>

                    <div className="player-controls-row" style={{ zIndex: 2 }}>
                      <button onClick={() => setIsPlaying(!isPlaying)} className="control-btn">
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                      <button className="control-btn">
                        <Volume2 size={18} />
                      </button>
                      
                      <div className="control-progress-wrapper">
                        {isLive ? (
                          <div className="live-stream-bar">Streaming Live...</div>
                        ) : (
                          <>
                            <div className="progress-bar-bg">
                              <div className="progress-bar-fill" style={{ width: isPlaying ? '35%' : '5%' }}></div>
                            </div>
                            <span className="duration-text">12:40 / {activeSermon.duration || '48:12'}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Sermon Metadata Info */}
              <div className="player-metadata">
                <div className="meta-left-info">
                  <span className="series-tag">{activeSermon.series}</span>
                  <h3>{activeSermon.title}</h3>
                  <div className="speaker-date-row">
                    <span>Preacher: <strong>{activeSermon.speaker}</strong></span>
                    <span className="meta-sep">&bull;</span>
                    <span>{activeSermon.date}</span>
                  </div>
                </div>

                <div className="player-meta-actions">
                  <a 
                    href="https://www.youtube.com/@LifeEdifiersChurch" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-youtube"
                  >
                    <Youtube size={16} />
                    <span>Subscribe on YouTube</span>
                  </a>
                  {!isLive && (
                    <button onClick={handleGoLive} className="btn-accent live-return-btn">
                      <Tv size={16} />
                      <span>Return to Live Broadcast</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Right Live Chat Area */}
          <div className="chat-column">
            <div className="chat-box-panel glass-panel">
              <div className="chat-header">
                <Users size={16} className="text-cyan" />
                <h4>Live Fellowship Chat</h4>
                {isLive && (
                  <span className="viewer-count">
                    142 online
                  </span>
                )}
              </div>

              <div className="chat-body-messages">
                {isLive && liveDetails && liveDetails.is_live === 1 ? (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className="chat-message-row">
                      <div className="msg-header">
                        <span className={`msg-user ${msg.user === 'You' ? 'text-cyan' : ''}`}>{msg.user}</span>
                        {msg.role === 'Leader' && <ShieldCheck size={12} className="leader-shield" />}
                        <span className="msg-time">{msg.time}</span>
                      </div>
                      <p className="msg-text">{msg.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="chat-disabled-state">
                    <Radio size={32} className="chat-disabled-icon" />
                    <p>{isLive && liveDetails && liveDetails.is_live === 0 ? 'Live chat is inactive while stream is offline.' : 'Live chat is only active during scheduled broadcast sessions.'}</p>
                    {(!isLive || (liveDetails && liveDetails.is_live === 0)) && (
                      <button onClick={handleGoLive} className="btn-secondary w-full">Join Live Broadcast</button>
                    )}
                  </div>
                )}
              </div>

              {isLive && liveDetails && liveDetails.is_live === 1 && (
                <form onSubmit={handleSendMessage} className="chat-footer-input">
                  <input
                    type="text"
                    value={myMessage}
                    onChange={(e) => setMyMessage(e.target.value)}
                    placeholder="Send prayer point or greeting..."
                    className="chat-input"
                  />
                  <button type="submit" className="chat-send-btn">
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Sermon Archives Section */}
        <div className="archives-section">
          <div className="archive-header-row">
            <h3>Past Sermons & Teachings</h3>
            
            <div className="search-bar-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic, speaker, or series..."
                className="search-input-box"
              />
            </div>
          </div>

          <div className="archives-grid">
            {filteredSermons.map((sermon) => (
              <div 
                key={sermon.id} 
                className="archive-card glass-panel"
                onClick={() => handleSermonSelect(sermon)}
              >
                <div 
                  className="archive-thumbnail"
                  style={{ background: sermon.gradient }}
                >
                  <span className="play-button-circle">
                    <Play size={20} fill="currentColor" />
                  </span>
                  <span className="archive-duration">{sermon.duration}</span>
                </div>
                <div className="archive-info">
                  <span className="archive-series">{sermon.series}</span>
                  <h4>{sermon.title}</h4>
                  <p className="archive-speaker">{sermon.speaker}</p>
                  <span className="archive-date">{sermon.date}</span>
                </div>
              </div>
            ))}

            {filteredSermons.length === 0 && (
              <div className="empty-search-state glass-panel">
                <p>No archived sermons match your search query.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        .livestream-page {
          background-color: var(--bg-dark);
          position: relative;
          z-index: 5;
        }

        .livestream-container {
          max-width: 1300px;
          margin: 0 auto;
        }

        .livestream-header {
          text-align: left;
          margin-bottom: 40px;
        }

        /* Broadcast Grid */
        .broadcast-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 30px;
          margin-bottom: 80px;
        }

        @media (max-width: 992px) {
          .broadcast-grid {
            grid-template-columns: 1fr;
          }
        }

        .player-column {
          display: flex;
          flex-direction: column;
        }

        .video-player-box {
          overflow: hidden;
          background: var(--bg-card);
        }

        .player-viewport {
          position: relative;
          height: 440px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        @media (max-width: 576px) {
          .player-viewport {
            height: 250px;
          }
        }

        .live-status-tag {
          position: absolute;
          top: 20px;
          left: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 0, 0, 0.85);
          color: #FFF;
          padding: 6px 14px;
          border-radius: 4px;
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.05em;
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.4);
        }

        .live-red-dot {
          width: 8px;
          height: 8px;
          background-color: #FFF;
          border-radius: 50%;
        }

        .player-mid-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .player-mid-icon:hover {
          background: rgba(0, 80, 255, 0.4);
          border-color: var(--accent-cyan);
          transform: scale(1.05);
        }

        .play-overlay-icon {
          color: #FFF;
          margin-left: 4px;
        }

        .audio-bars {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 24px;
        }

        .bar {
          width: 3px;
          background-color: var(--accent-cyan);
          border-radius: 2px;
          animation: danceBar 1s ease-in-out infinite alternate;
        }

        .b-1 { height: 10px; animation-delay: 0.1s; }
        .b-2 { height: 24px; animation-delay: 0.3s; }
        .b-3 { height: 16px; animation-delay: 0.5s; }

        @keyframes danceBar {
          0% { height: 6px; }
          100% { height: 24px; }
        }

        /* Controls row */
        .player-controls-row {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          z-index: 3;
        }

        .control-btn {
          background: none;
          border: none;
          color: #FFF;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.3s ease;
        }

        .control-btn:hover {
          opacity: 1;
        }

        .control-progress-wrapper {
          flex-grow: 1;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .live-stream-bar {
          font-family: var(--font-heading);
          font-size: 13px;
          color: var(--accent-cyan);
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .progress-bar-bg {
          flex-grow: 1;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;
          cursor: pointer;
        }

        .progress-bar-fill {
          height: 100%;
          background-color: var(--accent-cyan);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .duration-text {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .player-metadata {
          padding: 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          border-top: 1px solid var(--border-glass);
        }

        @media (max-width: 768px) {
          .player-metadata {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        .meta-left-info {
          text-align: left;
        }

        .series-tag {
          font-family: var(--font-heading);
          font-size: 11px;
          color: var(--accent-cyan);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .meta-left-info h3 {
          font-size: 22px;
          color: #FFF;
          margin: 6px 0 10px;
        }

        .speaker-date-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .meta-sep {
          color: var(--text-muted);
        }

        .live-return-btn {
          font-size: 13px;
          padding: 10px 20px;
        }

        .player-meta-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .btn-youtube {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 0, 0, 0.15);
          border: 1px solid rgba(255, 0, 0, 0.4);
          color: #FF4D4D;
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.05em;
          padding: 10px 20px;
          border-radius: 50px;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .btn-youtube:hover {
          background: #FF0000;
          border-color: #FF0000;
          color: #FFF;
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.4);
          transform: translateY(-2px);
        }

        /* Chat panel */
        .chat-box-panel {
          height: 560px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: rgba(10, 10, 12, 0.6);
        }

        @media (max-width: 992px) {
          .chat-box-panel {
            height: 400px;
          }
        }

        .chat-header {
          padding: 20px;
          border-bottom: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chat-header h4 {
          font-size: 15px;
          color: #FFF;
          font-weight: 600;
          margin-right: auto;
        }

        .viewer-count {
          font-size: 11px;
          font-family: var(--font-heading);
          background: rgba(0, 214, 255, 0.08);
          border: 1px solid rgba(0, 214, 255, 0.3);
          color: var(--accent-cyan);
          padding: 3px 8px;
          border-radius: 4px;
          font-weight: 600;
        }

        .chat-body-messages {
          flex-grow: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-align: left;
        }

        .chat-message-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .msg-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .msg-user {
          font-family: var(--font-heading);
          font-size: 13px;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .text-cyan {
          color: var(--accent-cyan) !important;
        }

        .leader-shield {
          color: var(--accent-cyan);
        }

        .msg-time {
          font-size: 10px;
          color: var(--text-muted);
          margin-left: auto;
        }

        .msg-text {
          font-size: 13.5px;
          color: #E4E4E7;
          line-height: 1.4;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          padding: 8px 12px;
          border-radius: 0 12px 12px 12px;
        }

        .chat-disabled-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          height: 100%;
          text-align: center;
          color: var(--text-secondary);
          padding: 20px;
        }

        .chat-disabled-icon {
          color: var(--text-muted);
        }

        .chat-footer-input {
          padding: 16px 20px;
          border-top: 1px solid var(--border-glass);
          display: flex;
          gap: 10px;
          background: rgba(10, 10, 12, 0.4);
        }

        .chat-input {
          flex-grow: 1;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          padding: 10px 14px;
          color: #FFF;
          font-size: 13px;
        }

        .chat-input:focus {
          outline: none;
          border-color: var(--accent-cyan);
        }

        .chat-send-btn {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          border: none;
          background: var(--accent-cyan);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .chat-send-btn:hover {
          background: #00beff;
        }

        /* Archives */
        .archives-section {
          text-align: left;
        }

        .archive-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .archive-header-row h3 {
          font-size: 26px;
          color: #FFF;
        }

        .search-bar-wrapper {
          position: relative;
          width: 320px;
        }

        @media (max-width: 576px) {
          .search-bar-wrapper {
            width: 100%;
          }
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input-box {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-glass);
          border-radius: 50px;
          padding: 10px 16px 10px 42px;
          color: #FFF;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .search-input-box:focus {
          outline: none;
          border-color: var(--accent-blue);
          background: rgba(255, 255, 255, 0.05);
        }

        .archives-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        @media (max-width: 992px) {
          .archives-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .archives-grid {
            grid-template-columns: 1fr;
          }
        }

        .archive-card {
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .archive-card:hover {
          transform: translateY(-4px);
        }

        .archive-thumbnail {
          height: 140px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .play-button-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.3);
          color: #FFF;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .archive-card:hover .play-button-circle {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          transform: scale(1.1);
        }

        .archive-duration {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(0,0,0,0.8);
          color: #FFF;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .archive-info {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-grow: 1;
        }

        .archive-series {
          font-family: var(--font-heading);
          font-size: 10px;
          color: var(--accent-cyan);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .archive-info h4 {
          font-size: 15px;
          color: #FFF;
          font-weight: 600;
          line-height: 1.3;
        }

        .archive-speaker {
          font-size: 12.5px;
          color: var(--text-secondary);
        }

        .archive-date {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: auto;
        }

        .empty-search-state {
          grid-column: 1 / -1;
          padding: 40px;
          text-align: center;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
