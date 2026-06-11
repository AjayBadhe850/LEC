import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Users, HeartHandshake, Music, BookOpen, Calendar, Clock, Plus, Edit2, Search, Filter, Trash2, Check, Sparkles, LogOut, Upload, FileText, Key } from 'lucide-react';
import TwoFactorSettings from './TwoFactorSettings';

export default function PastorDashboard() {
  const {
    prayers,
    updatePrayerStatus,
    events,
    createEvent,
    updateEventDetails,
    songs,
    leaders,
    verses,
    churchInfo,
    activeTheme,
    handleLogout,
    currentUser,
    updateServiceTimings
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('families');

  // Families state
  const [familiesList, setFamiliesList] = useState([]);
  const [familySearch, setFamilySearch] = useState('');
  const [loadingFamilies, setLoadingFamilies] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);

  // Family form inputs
  const [familyName, setFamilyName] = useState('');
  const [familyHead, setFamilyHead] = useState('');
  const [familyPhoto, setFamilyPhoto] = useState('');
  const [familyMembersInput, setFamilyMembersInput] = useState('');
  const [photoCompressing, setPhotoCompressing] = useState(false);
  const [compressRatio, setCompressRatio] = useState('');

  // Songs Repertoire Form state
  const [showSongModal, setShowSongModal] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [songTitle, setSongTitle] = useState('');
  const [songLyrics, setSongLyrics] = useState('');
  const [songCategory, setSongCategory] = useState('Worship');

  // Bible Verses Form state
  const [showVerseModal, setShowVerseModal] = useState(false);
  const [verseRef, setVerseRef] = useState('');
  const [verseText, setVerseText] = useState('');
  const [verseTheme, setVerseTheme] = useState('Sermon Theme');

  // Events Form state
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [evtTitle, setEvtTitle] = useState('');
  const [evtCategory, setEvtCategory] = useState('Upcoming');
  const [evtDate, setEvtDate] = useState('');
  const [evtTime, setEvtTime] = useState('');
  const [evtLocation, setEvtLocation] = useState('');
  const [evtDesc, setEvtDesc] = useState('');

  // Weekly Schedules state (service timings)
  const [schedules, setSchedules] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [schedName, setSchedName] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedLocation, setSchedLocation] = useState('');

  // UI Status banners
  const [successBanner, setSuccessBanner] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  // Load Families on mount/tab change
  useEffect(() => {
    if (activeTab === 'families') {
      loadFamilies();
    } else if (activeTab === 'schedules') {
      loadSchedules();
    }
  }, [activeTab]);

  async function loadFamilies(searchVal = '') {
    setLoadingFamilies(true);
    try {
      const url = searchVal ? `/api/families?search=${encodeURIComponent(searchVal)}` : '/api/families';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setFamiliesList(data.families);
      }
    } catch (err) {
      console.error('Failed to load families:', err);
    } finally {
      setLoadingFamilies(false);
    }
  }

  async function loadSchedules() {
    try {
      const res = await fetch('/api/church-info');
      const data = await res.json();
      if (data.success && data.info) {
        setSchedules(JSON.parse(data.info.service_timings || '[]'));
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleFamilySearch = (e) => {
    setFamilySearch(e.target.value);
    loadFamilies(e.target.value);
  };

  // Mock Photo Upload with high quality compression
  const uploadFamilyPhoto = async () => {
    setPhotoCompressing(true);
    try {
      const res = await fetch('/api/families/upload-photo', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setFamilyPhoto(data.photoUrl);
        setCompressRatio(`Optimized and compressed by ${data.compressionRatio}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPhotoCompressing(false);
    }
  };

  const handleSaveFamily = async (e) => {
    e.preventDefault();
    if (!familyName.trim() || !familyHead.trim()) return;

    const parsedMembers = familyMembersInput
      .split(',')
      .map(m => m.trim())
      .filter(m => m !== '');

    const payload = {
      name: familyName,
      headName: familyHead,
      photoUrl: familyPhoto,
      members: parsedMembers
    };

    try {
      let res;
      if (editingFamily) {
        res = await fetch(`/api/families/${editingFamily.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/families', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        setSuccessBanner(data.message);
        setShowFamilyModal(false);
        loadFamilies(familySearch);
        resetFamilyForm();
        setTimeout(() => setSuccessBanner(''), 4000);
      } else {
        setErrorBanner(data.message);
      }
    } catch (err) {
      setErrorBanner('Failed to save family record: ' + err.message);
    }
  };

  const handleEditFamilyClick = (fam) => {
    setEditingFamily(fam);
    setFamilyName(fam.name);
    setFamilyHead(fam.head_name);
    setFamilyPhoto(fam.photo_url || '');
    const membersList = JSON.parse(fam.members || '[]');
    setFamilyMembersInput(membersList.join(', '));
    setShowFamilyModal(true);
  };

  const resetFamilyForm = () => {
    setEditingFamily(null);
    setFamilyName('');
    setFamilyHead('');
    setFamilyPhoto('');
    setFamilyMembersInput('');
    setCompressRatio('');
  };

  // Songs management
  const handleSaveSong = async (e) => {
    e.preventDefault();
    if (!songTitle.trim() || !songLyrics.trim()) return;

    const payload = { title: songTitle, lyrics: songLyrics, category: songCategory };
    try {
      let res;
      if (editingSong) {
        res = await fetch(`/api/songs/${editingSong.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/songs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      const data = await res.json();
      if (data.success) {
        setSuccessBanner(data.message);
        setShowSongModal(false);
        setSongTitle('');
        setSongLyrics('');
        // Refresh local state by refetching songs (can force reload by mounting/context wiring)
        window.location.reload(); // Quick refresh to update state
      }
    } catch (err) {
      setErrorBanner(err.message);
    }
  };

  // Bible verse management
  const handleSaveVerse = async (e) => {
    e.preventDefault();
    if (!verseRef.trim() || !verseText.trim()) return;

    try {
      const res = await fetch('/api/bible-verses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: verseRef, text: verseText, theme: verseTheme })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessBanner(data.message);
        setShowVerseModal(false);
        setVerseRef('');
        setVerseText('');
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      setErrorBanner(err.message);
    }
  };

  // Events management
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!evtTitle.trim() || !evtDate.trim() || !evtTime.trim() || !evtLocation.trim() || !evtDesc.trim()) return;

    const payload = {
      title: evtTitle,
      category: evtCategory,
      date: evtDate,
      time: evtTime,
      location: evtLocation,
      description: evtDesc
    };

    try {
      let res;
      if (editingEvent) {
        res = await updateEventDetails(editingEvent.id, payload);
      } else {
        res = await createEvent(payload);
      }

      if (res.success) {
        setSuccessBanner(res.message);
        setShowEventModal(false);
        setEvtTitle('');
        setEvtDate('');
        setEvtTime('');
        setEvtLocation('');
        setEvtDesc('');
        setEditingEvent(null);
        setTimeout(() => setSuccessBanner(''), 4000);
      }
    } catch (err) {
      setErrorBanner(err.message);
    }
  };

  const handleEditEventClick = (evt) => {
    setEditingEvent(evt);
    setEvtTitle(evt.title);
    setEvtCategory(evt.category);
    setEvtDate(evt.date);
    setEvtTime(evt.time);
    setEvtLocation(evt.location);
    setEvtDesc(evt.description);
    setShowEventModal(true);
  };

  // Manage schedules
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!schedName.trim() || !schedTime.trim()) return;

    const updatedSchedules = schedules.map(s => {
      if (s.id === editingSchedule.id) {
        return { ...s, name: schedName, time: schedTime, location: schedLocation };
      }
      return s;
    });

    const res = await updateServiceTimings(updatedSchedules);
    if (res.success) {
      setSuccessBanner(res.message);
      setEditingSchedule(null);
      loadSchedules();
      setTimeout(() => setSuccessBanner(''), 4000);
    } else {
      setErrorBanner(res.message);
    }
  };

  return (
    <div className="dashboard-page section-padding" style={{ paddingTop: '40px' }}>
      <div className="dashboard-container">
        
        {/* Sidebar Menu */}
        <aside className="dashboard-sidebar">
          <div className="user-profile-widget">
            <div className="avatar-circle pastor-avatar">
              P
            </div>
            <h3>{currentUser ? currentUser.username : 'Pastor Workspace'}</h3>
            <span className="user-badge-role pastor-role">Covenant Shepherd</span>
          </div>

          <div className="sidebar-menu">
            <button onClick={() => setActiveTab('families')} className={`sidebar-link-btn ${activeTab === 'families' ? 'active' : ''}`}>
              <Users size={16} />
              <span>Families Registry</span>
            </button>
            <button onClick={() => setActiveTab('prayers')} className={`sidebar-link-btn ${activeTab === 'prayers' ? 'active' : ''}`}>
              <HeartHandshake size={16} />
              <span>Prayers wall ({prayers.length})</span>
            </button>
            <button onClick={() => setActiveTab('songs')} className={`sidebar-link-btn ${activeTab === 'songs' ? 'active' : ''}`}>
              <Music size={16} />
              <span>Worship Songs</span>
            </button>
            <button onClick={() => setActiveTab('scriptures')} className={`sidebar-link-btn ${activeTab === 'scriptures' ? 'active' : ''}`}>
              <BookOpen size={16} />
              <span>Verses & Sermons</span>
            </button>
            <button onClick={() => setActiveTab('events')} className={`sidebar-link-btn ${activeTab === 'events' ? 'active' : ''}`}>
              <Calendar size={16} />
              <span>Coordinator Events</span>
            </button>
            <button onClick={() => setActiveTab('schedules')} className={`sidebar-link-btn ${activeTab === 'schedules' ? 'active' : ''}`}>
              <Clock size={16} />
              <span>Weekly Schedules</span>
            </button>
            <button onClick={() => setActiveTab('security')} className={`sidebar-link-btn ${activeTab === 'security' ? 'active' : ''}`}>
              <Key size={16} />
              <span>Security & 2FA</span>
            </button>
            <div className="sidebar-divider"></div>
            <button onClick={handleLogout} className="sidebar-link-btn text-red">
              <LogOut size={16} />
              <span>Logout Portal</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="dashboard-content text-left">
          
          {successBanner && <div className="alert-banner success-banner margin-bottom-20 animate-fade-in">{successBanner}</div>}
          {errorBanner && <div className="alert-banner error-banner margin-bottom-20 animate-fade-in">{errorBanner}</div>}

          {/* TAB 1: FAMILIES REGISTRY */}
          {activeTab === 'families' && (
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header-row">
                <div>
                  <h2>Household Directory</h2>
                  <p>Manage family records. Register new households and upload optimized family portraits.</p>
                </div>
                <button 
                  onClick={() => {
                    resetFamilyForm();
                    setShowFamilyModal(true);
                  }}
                  className="btn-primary"
                  style={{ borderRadius: '8px', padding: '10px 20px', fontSize: '14px' }}
                >
                  <Plus size={16} />
                  <span>Add Family</span>
                </button>
              </div>
              <div className="panel-divider"></div>

              {/* Families Stats */}
              <div className="analytics-quick-stats margin-bottom-20" style={{ gridTemplateColumns: '1fr' }}>
                <div className="stat-box glass-panel">
                  <div className="stat-icon-wrapper blue"><Users size={20} /></div>
                  <div>
                    <span className="stat-label">TOTAL GATHERED COVENANT HOUSEHOLDS</span>
                    <p className="stat-value">Church Families: {familiesList.length}</p>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="search-bar-wrap margin-bottom-20">
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  value={familySearch}
                  onChange={handleFamilySearch}
                  placeholder="Search family name, head of household, members..." 
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                />
              </div>

              {/* List */}
              {loadingFamilies ? (
                <div className="loading-placeholder">Loading registry...</div>
              ) : familiesList.length === 0 ? (
                <div className="empty-placeholder">No family records found. Click "Add Family" to start the registry.</div>
              ) : (
                <div className="families-grid-layout">
                  {familiesList.map(fam => {
                    const membersList = JSON.parse(fam.members || '[]');
                    return (
                      <div key={fam.id} className="family-registry-card glass-panel">
                        <div className="portrait-wrap">
                          {fam.photo_url ? (
                            <img src={fam.photo_url} alt={fam.name} className="family-portrait-img" />
                          ) : (
                            <div className="portrait-fallback"><Users size={32} /></div>
                          )}
                        </div>
                        <div className="family-details-wrap text-left">
                          <h3>{fam.name}</h3>
                          <span className="head-badge">Head: {fam.head_name}</span>
                          <div className="members-pills-row">
                            {membersList.map((m, idx) => (
                              <span key={idx} className="member-pill">{m}</span>
                            ))}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleEditFamilyClick(fam)}
                          className="btn-status praying-btn active"
                          style={{ minWidth: '40px', padding: '8px' }}
                          title="Edit Details"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REVIEW PRAYERS */}
          {activeTab === 'prayers' && (
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header">
                <h2>Covenant Intercessory Wall</h2>
                <p>Manage and review prayer requests. Lift up petitions and toggle answered praise reports.</p>
              </div>
              <div className="panel-divider"></div>

              <div className="admin-prayers-table">
                {prayers.length === 0 ? (
                  <div className="empty-placeholder">No prayer requests active.</div>
                ) : (
                  prayers.map((prayer) => (
                    <div key={prayer.id} className="admin-prayer-row glass-panel">
                      <div className="prayer-info-block">
                        <div className="user-meta-row">
                          <span className="user-name-label">{prayer.name}</span>
                          <span className="user-phone">{prayer.mobile || 'Confidential'}</span>
                          <span className="date-tag">{prayer.created_at.split(' ')[0]}</span>
                          <span className="privacy-tag">
                            {prayer.is_public === 1 || prayer.is_public === 'true' ? 'Public Wall' : 'Confidential'}
                          </span>
                        </div>
                        <p className="prayer-desc-text">"{prayer.request}"</p>
                      </div>

                      <div className="prayer-actions-row">
                        <span className="action-label">Intercessors covered: <strong className="text-cyan">{prayer.amen_count || 0} Amens</strong></span>
                        <div className="action-buttons-group">
                          <button 
                            onClick={() => updatePrayerStatus(prayer.id, 'Pending')} 
                            className={`btn-status pending-btn ${prayer.status === 'Pending' ? 'active' : ''}`}
                          >
                            Pending
                          </button>
                          <button 
                            onClick={() => updatePrayerStatus(prayer.id, 'Praying')} 
                            className={`btn-status praying-btn ${prayer.status === 'Praying' ? 'active' : ''}`}
                          >
                            Praying
                          </button>
                          <button 
                            onClick={() => updatePrayerStatus(prayer.id, 'Answered')} 
                            className={`btn-status answered-btn ${prayer.status === 'Answered' ? 'active' : ''}`}
                          >
                            Answered
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WORSHIP SONGS */}
          {activeTab === 'songs' && (
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header-row">
                <div>
                  <h2>Worship Songs Catalog</h2>
                  <p>Maintain the weekly repertoire. Update lyrics, category keys, and chords sheets.</p>
                </div>
                <button onClick={() => { setEditingSong(null); setShowSongModal(true); }} className="btn-primary" style={{ borderRadius: '8px', padding: '10px 20px', fontSize: '14px' }}>
                  <Plus size={16} />
                  <span>Add Song</span>
                </button>
              </div>
              <div className="panel-divider"></div>

              <div className="songs-cards-list">
                {songs.map(song => (
                  <div key={song.id} className="song-catalog-card glass-panel text-left">
                    <div className="header-row">
                      <h3>{song.title}</h3>
                      <span className="badge">{song.category || 'Worship'}</span>
                    </div>
                    <pre className="lyrics-preview">{song.lyrics}</pre>
                    <button 
                      onClick={() => {
                        setEditingSong(song);
                        setSongTitle(song.title);
                        setSongLyrics(song.lyrics);
                        setSongCategory(song.category || 'Worship');
                        setShowSongModal(true);
                      }}
                      className="btn-status praying-btn active margin-top-12"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Edit2 size={12} /> Edit Lyrics
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SCRIPTURES & VERSES */}
          {activeTab === 'scriptures' && (
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header-row">
                <div>
                  <h2>Weekly Bible Verses & Sermon Themes</h2>
                  <p>Configure scriptures shown in About Us and the home section. Set weekly themes.</p>
                </div>
                <button onClick={() => setShowVerseModal(true)} className="btn-primary" style={{ borderRadius: '8px', padding: '10px 20px', fontSize: '14px' }}>
                  <Plus size={16} />
                  <span>Update Verse</span>
                </button>
              </div>
              <div className="panel-divider"></div>

              <div className="verses-grid">
                {verses.map(v => (
                  <div key={v.id} className="verse-panel-card glass-panel">
                    <span className="verse-theme-badge">{v.theme}</span>
                    <p className="verse-text">"{v.verse_text}"</p>
                    <span className="verse-ref">— {v.verse_reference}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: EVENT COORDINATOR */}
          {activeTab === 'events' && (
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header-row">
                <div>
                  <h2>Event Coordinator</h2>
                  <p>Schedule outreach missions, fasting prayers, and retreat programs.</p>
                </div>
                <button onClick={() => { setEditingEvent(null); setShowEventModal(true); }} className="btn-primary" style={{ borderRadius: '8px', padding: '10px 20px', fontSize: '14px' }}>
                  <Plus size={16} />
                  <span>Schedule Event</span>
                </button>
              </div>
              <div className="panel-divider"></div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Event Title</th>
                      <th>Date & Location</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(evt => (
                      <tr key={evt.id}>
                        <td><strong>{evt.title}</strong></td>
                        <td>{evt.date} <br/><span style={{ color: 'var(--text-muted)' }}>{evt.location}</span></td>
                        <td><span className="badge">{evt.category}</span></td>
                        <td style={{ fontSize: '12px', maxWidth: '300px' }}>{evt.description}</td>
                        <td>
                          <button onClick={() => handleEditEventClick(evt)} className="btn-status praying-btn active" style={{ padding: '6px' }}>
                            <Edit2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: SCHEDULES & TIMINGS */}
          {activeTab === 'schedules' && (
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header">
                <h2>Church schedules</h2>
                <p>Modify weekly worship timings. Applies across website components instantly.</p>
              </div>
              <div className="panel-divider"></div>

              {editingSchedule ? (
                <form onSubmit={handleSaveSchedule} className="admin-form glass-panel" style={{ padding: '30px', maxWidth: '500px' }}>
                  <h3>Modify Service Timing</h3>
                  <div className="form-divider"></div>
                  <div className="form-group">
                    <label>Gathering Name</label>
                    <input type="text" value={schedName} onChange={(e) => setSchedName(e.target.value)} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>Timing / Day Slot</label>
                    <input type="text" value={schedTime} onChange={(e) => setSchedTime(e.target.value)} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>Gathering Hall/Location</label>
                    <input type="text" value={schedLocation} onChange={(e) => setSchedLocation(e.target.value)} className="form-input" />
                  </div>
                  <div className="flex-row gap-10">
                    <button type="submit" className="btn-primary">Save Timings</button>
                    <button type="button" onClick={() => setEditingSchedule(null)} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="schedules-timings-grid">
                  {schedules.map(sc => (
                    <div key={sc.id} className="schedule-time-card glass-panel">
                      <div>
                        <h4>{sc.name}</h4>
                        <p className="time">{sc.time}</p>
                        <span className="loc">{sc.location}</span>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingSchedule(sc);
                          setSchedName(sc.name);
                          setSchedTime(sc.time);
                          setSchedLocation(sc.location || '');
                        }}
                        className="btn-status praying-btn active"
                        style={{ padding: '8px' }}
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header">
                <h2>Portal Security Settings</h2>
                <p>Configure authentication settings, manage backup recovery keys, or reset 2FA.</p>
              </div>
              <div className="panel-divider"></div>
              <TwoFactorSettings />
            </div>
          )}

        </main>
      </div>

      {/* FAMILY MODAL */}
      {showFamilyModal && (
        <div className="sim-modal-overlay">
          <div className="sim-modal-box glass-panel animate-text-reveal" style={{ maxWidth: '600px', textAlign: 'left' }}>
            <h3>{editingFamily ? 'Modify Family Record' : 'Add Family Record'}</h3>
            <div className="form-divider"></div>

            <form onSubmit={handleSaveFamily} className="admin-form">
              <div className="form-group">
                <label>Family Household Name *</label>
                <input 
                  type="text" 
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="e.g. Badhe Household" 
                  className="form-input"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Head of Household *</label>
                <input 
                  type="text" 
                  value={familyHead}
                  onChange={(e) => setFamilyHead(e.target.value)}
                  placeholder="e.g. Ajay Badhe" 
                  className="form-input"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Family Portrait Photo</label>
                <div className="flex-row gap-10">
                  <input 
                    type="url" 
                    value={familyPhoto}
                    onChange={(e) => setFamilyPhoto(e.target.value)}
                    placeholder="https://images.unsplash.com/..." 
                    className="form-input" 
                  />
                  <button 
                    type="button" 
                    onClick={uploadFamilyPhoto}
                    className="btn-secondary"
                    style={{ whiteSpace: 'nowrap', gap: '6px' }}
                  >
                    {photoCompressing ? 'Compressing...' : <Upload size={16} />}
                    <span>Auto-Compress</span>
                  </button>
                </div>
                {compressRatio && <span className="helper-text" style={{ color: 'var(--accent-cyan)' }}>{compressRatio}</span>}
              </div>

              <div className="form-group">
                <label>Family Members (Names separated by commas)</label>
                <input 
                  type="text" 
                  value={familyMembersInput}
                  onChange={(e) => setFamilyMembersInput(e.target.value)}
                  placeholder="Mary (Spouse), Grace (Daughter)" 
                  className="form-input" 
                />
              </div>

              <div className="flex-row gap-10 margin-top-20">
                <button type="submit" className="btn-primary">Save Household</button>
                <button type="button" onClick={() => { setShowFamilyModal(false); resetFamilyForm(); }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SONGS MODAL */}
      {showSongModal && (
        <div className="sim-modal-overlay">
          <div className="sim-modal-box glass-panel animate-text-reveal" style={{ maxWidth: '600px', textAlign: 'left' }}>
            <h3>{editingSong ? 'Edit Song lyrics' : 'Add Worship Song'}</h3>
            <div className="form-divider"></div>

            <form onSubmit={handleSaveSong} className="admin-form">
              <div className="form-group">
                <label>Song Title *</label>
                <input type="text" value={songTitle} onChange={(e) => setSongTitle(e.target.value)} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Lyrics & Chords Sheet *</label>
                <textarea value={songLyrics} onChange={(e) => setSongLyrics(e.target.value)} className="form-input form-textarea" rows={10} required></textarea>
              </div>
              <div className="form-group">
                <label>Category Key</label>
                <select value={songCategory} onChange={(e) => setSongCategory(e.target.value)} className="form-input">
                  <option value="Worship">Worship</option>
                  <option value="Praise">Praise</option>
                  <option value="Hymn">Hymn</option>
                </select>
              </div>
              <div className="flex-row gap-10">
                <button type="submit" className="btn-primary">Save Song</button>
                <button type="button" onClick={() => setShowSongModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BIBLE VERSE MODAL */}
      {showVerseModal && (
        <div className="sim-modal-overlay">
          <div className="sim-modal-box glass-panel animate-text-reveal" style={{ maxWidth: '500px', textAlign: 'left' }}>
            <h3>Add/Update Scripture</h3>
            <div className="form-divider"></div>
            <form onSubmit={handleSaveVerse} className="admin-form">
              <div className="form-group">
                <label>Scripture Reference (e.g. Psalms 23:1)</label>
                <input type="text" value={verseRef} onChange={(e) => setVerseRef(e.target.value)} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Verse Content *</label>
                <textarea value={verseText} onChange={(e) => setVerseText(e.target.value)} className="form-input form-textarea" rows={4} required></textarea>
              </div>
              <div className="form-group">
                <label>Belief Category (Theme)</label>
                <select value={verseTheme} onChange={(e) => setVerseTheme(e.target.value)} className="form-input">
                  <option value="Vision">Vision</option>
                  <option value="Mission">Mission</option>
                  <option value="Beliefs">Beliefs</option>
                  <option value="Sermon Theme">Sermon Theme</option>
                </select>
              </div>
              <div className="flex-row gap-10">
                <button type="submit" className="btn-primary">Publish Verse</button>
                <button type="button" onClick={() => setShowVerseModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EVENTS MODAL */}
      {showEventModal && (
        <div className="sim-modal-overlay">
          <div className="sim-modal-box glass-panel animate-text-reveal" style={{ maxWidth: '600px', textAlign: 'left' }}>
            <h3>{editingEvent ? 'Modify Event schedule' : 'Schedule New Event'}</h3>
            <div className="form-divider"></div>
            <form onSubmit={handleSaveEvent} className="admin-form event-form-grid">
              <div className="form-group">
                <label>Event Title</label>
                <input type="text" value={evtTitle} onChange={(e) => setEvtTitle(e.target.value)} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={evtCategory} onChange={(e) => setEvtCategory(e.target.value)} className="form-input">
                  <option value="Upcoming">Upcoming General</option>
                  <option value="Worship Nights">Worship Night</option>
                  <option value="Outreach">Outreach Mission</option>
                  <option value="Youth">Youth Activities</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={evtDate} onChange={(e) => setEvtDate(e.target.value)} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input type="text" value={evtTime} onChange={(e) => setEvtTime(e.target.value)} className="form-input" required />
              </div>
              <div className="form-group grid-span-2">
                <label>Location</label>
                <input type="text" value={evtLocation} onChange={(e) => setEvtLocation(e.target.value)} className="form-input" required />
              </div>
              <div className="form-group grid-span-2">
                <label>Description</label>
                <textarea value={evtDesc} onChange={(e) => setEvtDesc(e.target.value)} className="form-input form-textarea" rows={4} required></textarea>
              </div>
              <div className="flex-row gap-10 grid-span-2">
                <button type="submit" className="btn-primary">Schedule & Broadcast</button>
                <button type="button" onClick={() => { setShowEventModal(false); setEditingEvent(null); }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .pastor-avatar {
          background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan)) !important;
          box-shadow: 0 0 15px rgba(0, 214, 255, 0.4) !important;
        }

        .pastor-role {
          background: rgba(0, 214, 255, 0.08) !important;
          border: 1px solid rgba(0, 214, 255, 0.3) !important;
          color: var(--accent-cyan) !important;
        }

        .panel-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          text-align: left;
        }

        .flex-row {
          display: flex;
          align-items: center;
        }

        .gap-10 {
          gap: 10px;
        }

        .margin-top-12 { margin-top: 12px; }
        .margin-top-20 { margin-top: 20px; }
        .margin-bottom-20 { margin-bottom: 20px; }

        /* Families List styling */
        .families-grid-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .families-grid-layout {
            grid-template-columns: 1fr;
          }
        }

        .family-registry-card {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
        }

        .family-registry-card .portrait-wrap {
          width: 70px;
          height: 70px;
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .family-portrait-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .portrait-fallback {
          color: var(--text-muted);
        }

        .family-details-wrap {
          flex-grow: 1;
        }

        .family-details-wrap h3 {
          font-size: 16px;
          color: #FFF;
        }

        .head-badge {
          display: inline-block;
          font-size: 11.5px;
          color: var(--accent-cyan);
          background: rgba(0, 214, 255, 0.05);
          padding: 2px 8px;
          border-radius: 4px;
          margin-top: 4px;
        }

        .members-pills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .member-pill {
          font-size: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          padding: 1px 6px;
          border-radius: 4px;
        }

        /* Song Catalog */
        .songs-cards-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 992px) {
          .songs-cards-list {
            grid-template-columns: 1fr;
          }
        }

        .song-catalog-card {
          padding: 24px;
          background: var(--bg-card);
        }

        .song-catalog-card .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .lyrics-preview {
          font-family: monospace;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--border-glass);
          padding: 14px;
          border-radius: 8px;
          font-size: 12.5px;
          color: var(--text-secondary);
          max-height: 160px;
          overflow-y: auto;
          white-space: pre-wrap;
          line-height: 1.5;
        }

        /* Verses */
        .verses-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .verses-grid {
            grid-template-columns: 1fr;
          }
        }

        .verse-panel-card {
          padding: 24px;
          background: var(--bg-card);
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .verse-theme-badge {
          align-self: flex-start;
          font-family: var(--font-heading);
          font-size: 10px;
          font-weight: 700;
          color: var(--accent-cyan);
          letter-spacing: 0.1em;
          border: 1px solid rgba(0,214,255,0.3);
          background: rgba(0,214,255,0.05);
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .verse-panel-card .verse-text {
          font-family: var(--font-heading);
          font-weight: 300;
          font-size: 16px;
          color: #FFF;
          line-height: 1.5;
        }

        .verse-panel-card .verse-ref {
          font-size: 13px;
          color: var(--accent-blue);
          font-weight: 600;
        }

        /* Schedules */
        .schedules-timings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }

        .schedule-time-card {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-align: left;
        }

        .schedule-time-card h4 {
          font-size: 15px;
          color: #FFF;
        }

        .schedule-time-card .time {
          font-family: var(--font-heading);
          font-size: 18px;
          font-weight: 700;
          color: var(--accent-cyan);
          margin-top: 4px;
        }

        .schedule-time-card .loc {
          font-size: 12px;
          color: var(--text-muted);
          display: block;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
