import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  ShieldCheck, HeartHandshake, Bell, Calendar, BarChart2, Plus, Users, Send, Check, Settings, 
  ShieldAlert, LogOut, Sun, Moon, Database, Clock, Upload, Trash2, Edit2, Key, Image, UserCheck 
} from 'lucide-react';
import TwoFactorSettings from './TwoFactorSettings';

export default function AdminDashboard() {
  const {
    prayers,
    updatePrayerStatus,
    events,
    createEvent,
    updateEventDetails,
    deleteEvent,
    leaders,
    updateLeaderProfile,
    deleteLeaderProfile,
    updateLiveStreamSettings,
    activeTheme,
    updateTheme,
    adminUsers,
    adminLogs,
    rolesData,
    createStaffAccount,
    deleteUserAccount,
    saveRolePermissions,
    createCustomRole,
    triggerSystemBackup,
    handleLogout,
    currentUser,
    deleteFamilyRecord,
    deleteSong,
    deleteGalleryItem,
    addGalleryItem,
    gallery,
    updateServiceTimings
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('analytics');

  // Privileged account form
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRoleId, setNewRoleId] = useState('2'); // default Pastor
  const [newMobile, setNewMobile] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Custom role form
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Selected permissions for role mapping
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [rolePermCheckboxes, setRolePermCheckboxes] = useState({});

  // CMS Details Form State
  const [cmsChurchName, setCmsChurchName] = useState('');
  const [cmsLogo, setCmsLogo] = useState('');
  const [cmsVision, setCmsVision] = useState('');
  const [cmsMission, setCmsMission] = useState('');
  const [cmsHistory, setCmsHistory] = useState('');
  const [cmsEmail, setCmsEmail] = useState('');
  const [cmsPhone1, setCmsPhone1] = useState('');
  const [cmsPhone2, setCmsPhone2] = useState('');
  const [cmsAddress, setCmsAddress] = useState('');
  const [cmsSchedules, setCmsSchedules] = useState([]);

  // Live stream settings form state
  const [cmsLiveUrl, setCmsLiveUrl] = useState('');
  const [cmsLiveScheduled, setCmsLiveScheduled] = useState('');
  const [cmsIsLive, setCmsIsLive] = useState(false);
  const [cmsLiveBanner, setCmsLiveBanner] = useState('');
  const [cmsLiveCountdown, setCmsLiveCountdown] = useState(10);

  // Gallery form state
  const [galTitle, setGalTitle] = useState('');
  const [galCategory, setGalCategory] = useState('photos');
  const [galUrl, setGalUrl] = useState('');
  const [galType, setGalType] = useState('photo');
  const [galCompressed, setGalCompressed] = useState(false);

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

  // Events Form state
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [evtTitle, setEvtTitle] = useState('');
  const [evtCategory, setEvtCategory] = useState('Upcoming');
  const [evtDate, setEvtDate] = useState('');
  const [evtTime, setEvtTime] = useState('');
  const [evtLocation, setEvtLocation] = useState('');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtImageUrl, setEvtImageUrl] = useState('');

  // Leadership form state
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [editingLeader, setEditingLeader] = useState(null);
  const [ldrName, setLdrName] = useState('');
  const [ldrRole, setLdrRole] = useState('');
  const [ldrBio, setLdrBio] = useState('');
  const [ldrImageUrl, setLdrImageUrl] = useState('');

  // Service Timing form state
  const [showTimingModal, setShowTimingModal] = useState(false);
  const [editingTiming, setEditingTiming] = useState(null);
  const [tName, setTName] = useState('');
  const [tTime, setTTime] = useState('');
  const [tLocation, setTLocation] = useState('');

  // UI Status banners
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Broadcast Alert Form State
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  // Load CMS Info on mount
  useEffect(() => {
    fetch('/api/church-info')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.info) {
          const info = data.info;
          setCmsChurchName(info.name);
          setCmsLogo(info.logo_url || '');
          setCmsVision(info.vision || '');
          setCmsMission(info.text_mission || '');
          setCmsHistory(info.history || '');
          setCmsEmail(info.contact_email || '');
          setCmsPhone1(info.contact_phone_1 || '');
          setCmsPhone2(info.contact_phone_2 || '');
          setCmsAddress(info.address || '');
          setCmsSchedules(JSON.parse(info.service_timings || '[]'));
        }
      });

    fetch('/api/live-stream')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.live) {
          const stream = data.live;
          setCmsLiveUrl(stream.youtube_url || '');
          setCmsLiveScheduled(stream.scheduled_time || '');
          setCmsIsLive(stream.is_live === 1);
          setCmsLiveBanner(stream.banner_text || '');
          setCmsLiveCountdown(stream.countdown_duration || 10);
        }
      });

    loadFamilies();
  }, []);

  // Update role permission mapping checkboxes on role select
  useEffect(() => {
    if (selectedRoleId && rolesData.rolePermissions) {
      const activeMapping = rolesData.rolePermissions
        .filter(rp => rp.role_id === parseInt(selectedRoleId))
        .map(rp => rp.permission_id);

      const updatedCheckboxes = {};
      rolesData.permissions.forEach(p => {
        updatedCheckboxes[p.id] = activeMapping.includes(p.id);
      });
      setRolePermCheckboxes(updatedCheckboxes);
    }
  }, [selectedRoleId, rolesData]);

  // Load Families API
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
      console.error(err);
    } finally {
      setLoadingFamilies(false);
    }
  }

  const handleFamilySearch = (e) => {
    setFamilySearch(e.target.value);
    loadFamilies(e.target.value);
  };

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
        setSuccessMsg(data.message);
        setShowFamilyModal(false);
        loadFamilies(familySearch);
        resetFamilyForm();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg('Failed to save family: ' + err.message);
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

  const handleDeleteFamily = async (familyId) => {
    if (confirm("Are you sure you want to permanently delete this family census record? Only Super Admin can delete records.")) {
      const res = await deleteFamilyRecord(familyId);
      if (res.success) {
        setSuccessMsg(res.message);
        loadFamilies(familySearch);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  const resetFamilyForm = () => {
    setEditingFamily(null);
    familyName('');
    familyHead('');
    familyPhoto('');
    familyMembersInput('');
    setCompressRatio('');
  };

  // Handle staff creation
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!newUsername || !newEmail || !newPassword) return;

    const res = await createStaffAccount({
      username: newUsername,
      email: newEmail,
      password: newPassword,
      roleId: newRoleId,
      mobile: newMobile,
      address: newAddress
    });

    if (res.success) {
      setSuccessMsg(res.message);
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewMobile('');
      setNewAddress('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.message);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Handle custom role creation
  const handleCreateCustomRole = async (e) => {
    e.preventDefault();
    if (!newRoleName) return;

    const res = await createCustomRole(newRoleName, newRoleDesc);
    if (res.success) {
      setSuccessMsg(res.message);
      setNewRoleName('');
      setNewRoleDesc('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.message);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Save role permissions
  const handleSaveRolePerms = async () => {
    if (!selectedRoleId) return;
    const permissionIds = Object.keys(rolePermCheckboxes)
      .filter(pId => rolePermCheckboxes[pId] === true)
      .map(pId => parseInt(pId));

    const res = await saveRolePermissions(selectedRoleId, permissionIds);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.message);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handlePermCheckboxChange = (permId, checked) => {
    setRolePermCheckboxes({
      ...rolePermCheckboxes,
      [permId]: checked
    });
  };

  // Save general church info
  const handleSaveCMS = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/church-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cmsChurchName,
          logoUrl: cmsLogo,
          vision: cmsVision,
          textMission: cmsMission,
          history: cmsHistory,
          contactEmail: cmsEmail,
          contactPhone1: cmsPhone1,
          contactPhone2: cmsPhone2,
          address: cmsAddress,
          serviceTimings: cmsSchedules
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Save YouTube Live settings
  const handleSaveLiveStream = async (e) => {
    e.preventDefault();
    const res = await updateLiveStreamSettings({
      youtubeUrl: cmsLiveUrl,
      scheduledTime: cmsLiveScheduled,
      isLive: cmsIsLive,
      bannerText: cmsLiveBanner,
      countdownDuration: parseInt(cmsLiveCountdown)
    });
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.message);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Handle media album compress upload
  const handleGalleryUpload = async (e) => {
    e.preventDefault();
    if (!galTitle || !galUrl) return;

    setGalCompressed(true);
    setTimeout(async () => {
      const res = await addGalleryItem({ title: galTitle, category: galCategory, url: galUrl, type: galType });
      if (res.success) {
        setSuccessMsg('Media uploaded and compressed.');
        setGalTitle('');
        setGalUrl('');
        setGalCompressed(false);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.message);
        setGalCompressed(false);
      }
    }, 1200);
  };

  // Handle gallery delete
  const handleDeleteGallery = async (galleryId) => {
    if (confirm("Are you sure you want to delete this media asset? Only Super Admin can delete assets.")) {
      const res = await deleteGalleryItem(galleryId);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.message);
      }
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
      description: evtDesc,
      imageUrl: evtImageUrl
    };

    try {
      let res;
      if (editingEvent) {
        res = await updateEventDetails(editingEvent.id, payload);
      } else {
        res = await createEvent(payload);
      }

      if (res.success) {
        setSuccessMsg(res.message);
        setShowEventModal(false);
        setEvtTitle('');
        setEvtDate('');
        setEvtTime('');
        setEvtLocation('');
        setEvtDesc('');
        setEvtImageUrl('');
        setEditingEvent(null);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg(err.message);
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
    setEvtImageUrl(evt.image_url || '');
    setShowEventModal(true);
  };

  const handleDeleteEventClick = async (eventId) => {
    if (confirm("Are you sure you want to permanently cancel and remove this event?")) {
      const res = await deleteEvent(eventId);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  // Leadership profiles management
  const handleSaveLeader = async (e) => {
    e.preventDefault();
    if (!ldrName.trim() || !ldrRole.trim() || !ldrBio.trim()) return;

    const payload = { name: ldrName, role: ldrRole, bio: ldrBio, imageUrl: ldrImageUrl };
    try {
      let res;
      if (editingLeader) {
        const fetchRes = await fetch(`/api/leadership/${editingLeader.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        res = await fetchRes.json();
      } else {
        const fetchRes = await fetch('/api/leadership', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        res = await fetchRes.json();
      }

      if (res.success) {
        setSuccessMsg(res.message);
        setShowLeaderModal(false);
        setLdrName('');
        setLdrRole('');
        setLdrBio('');
        setLdrImageUrl('');
        setEditingLeader(null);
        // reload profiles
        window.location.reload();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleEditLeaderClick = (ldr) => {
    setEditingLeader(ldr);
    setLdrName(ldr.name);
    setLdrRole(ldr.role);
    setLdrBio(ldr.bio);
    setLdrImageUrl(ldr.image_url || '');
    setShowLeaderModal(true);
  };

  const handleDeleteLeaderClick = async (leaderId) => {
    if (confirm("Are you sure you want to delete this leadership profile? Only Super Admin can delete leaders.")) {
      const res = await deleteLeaderProfile(leaderId);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  // Service Timing schedules management
  const handleSaveTiming = async (e) => {
    e.preventDefault();
    if (!tName.trim() || !tTime.trim()) return;

    let updatedSchedules;
    if (editingTiming) {
      updatedSchedules = cmsSchedules.map(s => {
        if (s.id === editingTiming.id) {
          return { ...s, name: tName, time: tTime, location: tLocation };
        }
        return s;
      });
    } else {
      const newId = cmsSchedules.length > 0 ? Math.max(...cmsSchedules.map(s => s.id)) + 1 : 1;
      updatedSchedules = [...cmsSchedules, { id: newId, name: tName, time: tTime, location: tLocation }];
    }

    const res = await updateServiceTimings(updatedSchedules);
    if (res.success) {
      setSuccessMsg(res.message);
      setCmsSchedules(updatedSchedules);
      setShowTimingModal(false);
      setEditingTiming(null);
      setTName('');
      setTTime('');
      setTLocation('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleDeleteTiming = async (timingId) => {
    if (confirm("Are you sure you want to delete this service timing slot?")) {
      const updatedSchedules = cmsSchedules.filter(s => s.id !== timingId);
      const res = await updateServiceTimings(updatedSchedules);
      if (res.success) {
        setSuccessMsg(res.message);
        setCmsSchedules(updatedSchedules);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  // Handle backup trigger
  const handleBackupClick = async () => {
    const res = await triggerSystemBackup();
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.message);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Handle broadcast notification
  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    if (!alertTitle || !alertMsg) return;

    const res = await broadcastNotification(alertTitle, alertMsg);
    if (res.success) {
      setSuccessMsg(res.message);
      setAlertTitle('');
      setAlertMsg('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (window.confirm("Are you sure you want to deactivate this account?")) {
      const res = await deleteUserAccount(userId);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.message);
        setTimeout(() => setErrorMsg(''), 4000);
      }
    }
  };

  return (
    <div className="dashboard-page section-padding" style={{ paddingTop: '40px' }}>
      <div className="dashboard-container">
        
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="user-profile-widget">
            <div className="avatar-circle admin-avatar">
              SA
            </div>
            <h3>{currentUser ? currentUser.username : 'Super Admin'}</h3>
            <span className="user-badge-role admin-role">Super Administrator</span>
          </div>

          <div className="sidebar-menu">
            <button onClick={() => setActiveTab('analytics')} className={`sidebar-link-btn ${activeTab === 'analytics' ? 'active' : ''}`}>
              <BarChart2 size={16} />
              <span>Sanctuary Metrics</span>
            </button>
            <button onClick={() => setActiveTab('users')} className={`sidebar-link-btn ${activeTab === 'users' ? 'active' : ''}`}>
              <Users size={16} />
              <span>Privileged Users</span>
            </button>
            <button onClick={() => setActiveTab('roles')} className={`sidebar-link-btn ${activeTab === 'roles' ? 'active' : ''}`}>
              <ShieldCheck size={16} />
              <span>Roles & Permissions</span>
            </button>
            <button onClick={() => setActiveTab('theme')} className={`sidebar-link-btn ${activeTab === 'theme' ? 'active' : ''}`}>
              <Sun size={16} />
              <span>Theme Controller</span>
            </button>
            <button onClick={() => setActiveTab('families')} className={`sidebar-link-btn ${activeTab === 'families' ? 'active' : ''}`}>
              <Users size={16} />
              <span>Family Directory</span>
            </button>
            <button onClick={() => setActiveTab('events')} className={`sidebar-link-btn ${activeTab === 'events' ? 'active' : ''}`}>
              <Calendar size={16} />
              <span>Scheduled Events</span>
            </button>
            <button onClick={() => setActiveTab('leadership')} className={`sidebar-link-btn ${activeTab === 'leadership' ? 'active' : ''}`}>
              <UserCheck size={16} />
              <span>Leadership Profiles</span>
            </button>
            <button onClick={() => setActiveTab('gallery')} className={`sidebar-link-btn ${activeTab === 'gallery' ? 'active' : ''}`}>
              <Image size={16} />
              <span>Media Gallery</span>
            </button>
            <button onClick={() => setActiveTab('cms_settings')} className={`sidebar-link-btn ${activeTab === 'cms_settings' ? 'active' : ''}`}>
              <Settings size={16} />
              <span>CMS Page Settings</span>
            </button>
            <button onClick={() => setActiveTab('prayers')} className={`sidebar-link-btn ${activeTab === 'prayers' ? 'active' : ''}`}>
              <HeartHandshake size={16} />
              <span>Moderate Prayers</span>
            </button>
            <button onClick={() => setActiveTab('audit_logs')} className={`sidebar-link-btn ${activeTab === 'audit_logs' ? 'active' : ''}`}>
              <Clock size={16} />
              <span>Logs & Backups</span>
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

        {/* Content */}
        <main className="dashboard-content text-left">
          
          {successMsg && <div className="alert-banner success-banner margin-bottom-20 animate-fade-in">{successMsg}</div>}
          {errorMsg && <div className="alert-banner error-banner margin-bottom-20 animate-fade-in">{errorMsg}</div>}

          {/* TAB: ANALYTICS METRICS */}
          {activeTab === 'analytics' && (
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header">
                <h2>Church Metrics & Growth Analytics</h2>
                <p>Real-time visual monitoring of membership numbers, events, and prayer shields.</p>
              </div>
              <div className="panel-divider"></div>

              <div className="analytics-quick-stats">
                <div className="stat-box glass-panel">
                  <div className="stat-icon-wrapper blue"><Users size={20} /></div>
                  <div>
                    <span className="stat-label">TOTAL USERS</span>
                    <p className="stat-value">{adminUsers.length} registered</p>
                  </div>
                </div>
                <div className="stat-box glass-panel">
                  <div className="stat-icon-wrapper cyan"><Calendar size={20} /></div>
                  <div>
                    <span className="stat-label">ACTIVE EVENTS</span>
                    <p className="stat-value">{events.length} scheduled</p>
                  </div>
                </div>
                <div className="stat-box glass-panel">
                  <div className="stat-icon-wrapper red"><HeartHandshake size={20} /></div>
                  <div>
                    <span className="stat-label">PRAYER WALL SIZE</span>
                    <p className="stat-value">{prayers.length} petitions</p>
                  </div>
                </div>
              </div>

              {/* Custom SVG Charts */}
              <div className="charts-grid-layout">
                <div className="chart-card-box glass-panel">
                  <h3>Covenant Attendance Growth (Worship Gatherings)</h3>
                  <p className="chart-sub-label">Weekly stats indicating average members participating online & offline.</p>
                  <div className="svg-chart-container margin-top-20">
                    <svg viewBox="0 0 500 220" width="100%" height="100%">
                      <defs>
                        <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#00d6ff" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#0050ff" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="5,5" />
                      <line x1="40" y1="80" x2="480" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="5,5" />
                      <line x1="40" y1="130" x2="480" y2="130" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="5,5" />
                      <line x1="40" y1="180" x2="480" y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      <path d="M 60 180 L 120 150 L 180 135 L 240 120 L 300 95 L 360 80 L 420 50 L 460 38 L 460 180 Z" fill="url(#chartGrad)" />
                      <path d="M 60 180 L 120 150 L 180 135 L 240 120 L 300 95 L 360 80 L 420 50 L 460 38" fill="none" stroke="#00D6FF" strokeWidth="3.5" strokeLinecap="round" />
                      <circle cx="120" cy="150" r="4" fill="#FFFFFF" stroke="#00D6FF" strokeWidth="2" />
                      <circle cx="240" cy="120" r="4" fill="#FFFFFF" stroke="#00D6FF" strokeWidth="2" />
                      <circle cx="360" cy="80" r="4" fill="#FFFFFF" stroke="#00D6FF" strokeWidth="2" />
                      <circle cx="460" cy="38" r="4" fill="#FFFFFF" stroke="#00D6FF" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                <div className="chart-card-box glass-panel">
                  <h3>Event Registrations Breakdown</h3>
                  <div className="svg-chart-container margin-top-20">
                    <svg viewBox="0 0 500 220" width="100%" height="100%">
                      <line x1="40" y1="180" x2="480" y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      <rect x="70" y="60" width="36" height="120" rx="4" fill="var(--accent-blue)" />
                      <rect x="180" y="110" width="36" height="70" rx="4" fill="var(--accent-cyan)" />
                      <rect x="290" y="85" width="36" height="95" rx="4" fill="#FF7F00" />
                      <rect x="400" y="40" width="36" height="140" rx="4" fill="var(--accent-red)" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRIVILEGED USERS */}
          {activeTab === 'users' && (
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header">
                <h2>Privileged Users & Staff Registry</h2>
                <p>Register Pastor or Admin accounts, and deactivate user profiles.</p>
              </div>
              <div className="panel-divider"></div>

              <div className="split-layout">
                <form onSubmit={handleCreateStaff} className="admin-form glass-panel" style={{ padding: '30px' }}>
                  <h3>Create Staff Account</h3>
                  <div className="form-divider"></div>
                  <div className="form-group">
                    <label>Username *</label>
                    <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="form-input" placeholder="e.g. Pastor_Samuel" required />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="form-input" placeholder="samuel@lifeedifiers.org" required />
                  </div>
                  <div className="form-group">
                    <label>Password *</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="form-input" placeholder="••••••••" required />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select value={newRoleId} onChange={(e) => setNewRoleId(e.target.value)} className="form-input">
                      {rolesData.roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn-primary w-full">Create Privileged Account</button>
                </form>

                <div className="table-responsive glass-panel" style={{ padding: '24px' }}>
                  <h3>Current Accounts</h3>
                  <div className="form-divider"></div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map(user => (
                        <tr key={user.id}>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td><span className={`head-badge ${user.role_name === 'Super Admin' ? 'text-red' : ''}`} style={{ background: 'rgba(255,255,255,0.02)' }}>{user.role_name}</span></td>
                          <td>
                            {user.role_name !== 'Super Admin' && (
                              <button onClick={() => handleDeactivateUser(user.id)} className="btn-status answered-btn active text-red" style={{ padding: '6px' }} title="Deactivate Account">
                                <Trash2 size={12} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ROLES & PERMISSIONS */}
          {activeTab === 'roles' && (
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header">
                <h2>Role-Based Access Control (RBAC)</h2>
                <p>Configure permissions for system roles and create custom ministry roles.</p>
              </div>
              <div className="panel-divider"></div>

              <div className="split-layout">
                {/* Create custom role */}
                <form onSubmit={handleCreateCustomRole} className="admin-form glass-panel" style={{ padding: '30px' }}>
                  <h3>Create Custom Role</h3>
                  <div className="form-divider"></div>
                  <div className="form-group">
                    <label>Role Name *</label>
                    <input type="text" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} className="form-input" placeholder="e.g. Media Team" required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea value={newRoleDesc} onChange={(e) => setNewRoleDesc(e.target.value)} className="form-input form-textarea" placeholder="Describe role responsibilities..."></textarea>
                  </div>
                  <button type="submit" className="btn-primary w-full">Create Custom Role</button>
                </form>

                {/* Permissions Map */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3>Edit Role Permissions Map</h3>
                  <div className="form-divider"></div>

                  <div className="form-group">
                    <label>Select Role to Map:</label>
                    <select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)} className="form-input">
                      <option value="">-- Choose Role --</option>
                      {rolesData.roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedRoleId && (
                    <div className="permissions-checkboxes-stack animate-text-reveal">
                      <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Grant/Revoke Privileges:</label>
                      <div className="checkboxes-grid margin-top-12">
                        {rolesData.permissions.map(p => (
                          <label key={p.id} className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                            <input 
                              type="checkbox" 
                              checked={rolePermCheckboxes[p.id] || false}
                              onChange={(e) => handlePermCheckboxChange(p.id, e.target.checked)}
                            />
                            <div>
                              <strong>{p.name}</strong> <br/>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.description}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                      <button onClick={handleSaveRolePerms} className="btn-primary w-full margin-top-20">
                        Save Role Mappings
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: THEME CONTROLLER */}
          {activeTab === 'theme' && (
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header text-left">
                <h2>Global Theme Controller</h2>
                <p>Enforce website appearance. The selected theme applies across the entire site instantly for all members.</p>
              </div>
              <div className="panel-divider"></div>

              <div className="theme-toggle-panel glass-panel text-center-input" style={{ padding: '60px', maxWidth: '500px' }}>
                <h3>Active Global Theme: <span className="text-cyan" style={{ textTransform: 'uppercase' }}>{activeTheme}</span></h3>
                <p style={{ marginTop: '10px' }}>Only Super Admin holds keys to alter the sanctuary theme.</p>
                <div className="flex-row justify-center gap-10 margin-top-20">
                  <button 
                    onClick={() => updateTheme('dark')}
                    className={`btn-secondary ${activeTheme === 'dark' ? 'active' : ''}`}
                    style={{ gap: '8px' }}
                  >
                    <Moon size={16} />
                    <span>Dark Theme</span>
                  </button>
                  <button 
                    onClick={() => updateTheme('light')}
                    className={`btn-secondary ${activeTheme === 'light' ? 'active' : ''}`}
                    style={{ gap: '8px' }}
                  >
                    <Sun size={16} />
                    <span>Light Theme</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FAMILY DIRECTORY */}
          {activeTab === 'families' && (
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2>Household Census Directory</h2>
                  <p>Manage church family records. Super Admin has delete privileges.</p>
                </div>
                <button 
                  onClick={() => { resetFamilyForm(); setShowFamilyModal(true); }}
                  className="btn-primary"
                  style={{ borderRadius: '8px', padding: '10px 20px', fontSize: '14px' }}
                >
                  <Plus size={16} />
                  <span>Add Family</span>
                </button>
              </div>
              <div className="panel-divider"></div>

              <div className="search-bar-wrap margin-bottom-20" style={{ position: 'relative' }}>
                <Clock size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  value={familySearch}
                  onChange={handleFamilySearch}
                  placeholder="Search family name, head, or dependents..." 
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                />
              </div>

              {loadingFamilies ? (
                <div className="loading-placeholder">Loading directory...</div>
              ) : familiesList.length === 0 ? (
                <div className="empty-placeholder">No family records found.</div>
              ) : (
                <div className="families-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  {familiesList.map(fam => {
                    const membersList = JSON.parse(fam.members || '[]');
                    return (
                      <div key={fam.id} className="family-registry-card glass-panel" style={{ display: 'flex', padding: '16px', gap: '16px', position: 'relative' }}>
                        <div className="portrait-wrap" style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-glass)' }}>
                          {fam.photo_url ? (
                            <img src={fam.photo_url} alt={fam.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Users size={24} className="text-muted" />
                          )}
                        </div>
                        <div style={{ flexGrow: 1, textAlign: 'left' }}>
                          <h4 style={{ color: '#fff', fontSize: '16px' }}>{fam.name}</h4>
                          <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', background: 'rgba(0,214,255,0.05)', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>Head: {fam.head_name}</span>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                            {membersList.map((m, idx) => (
                              <span key={idx} style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px' }}>{m}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <button 
                            onClick={() => handleEditFamilyClick(fam)}
                            className="btn-status praying-btn active"
                            style={{ padding: '6px', minWidth: '30px' }}
                            title="Edit details"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteFamily(fam.id)}
                            className="btn-status answered-btn active text-red"
                            style={{ padding: '6px', minWidth: '30px' }}
                            title="Delete census record"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: SCHEDULED EVENTS */}
          {activeTab === 'events' && (
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2>Scheduled Ministry Events</h2>
                  <p>Schedule outreach missions, retreat programs, and covenant celebrations.</p>
                </div>
                <button 
                  onClick={() => { setEditingEvent(null); setEvtTitle(''); setEvtDate(''); setEvtTime(''); setEvtLocation(''); setEvtDesc(''); setEvtImageUrl(''); setShowEventModal(true); }}
                  className="btn-primary"
                  style={{ borderRadius: '8px', padding: '10px 20px', fontSize: '14px' }}
                >
                  <Plus size={16} />
                  <span>Schedule Event</span>
                </button>
              </div>
              <div className="panel-divider"></div>

              <div className="table-responsive glass-panel" style={{ padding: '24px' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Event Title</th>
                      <th>Category</th>
                      <th>Timing & Location</th>
                      <th>Registrations</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(evt => (
                      <tr key={evt.id}>
                        <td><strong>{evt.title}</strong></td>
                        <td><span className="badge">{evt.category}</span></td>
                        <td>{evt.date} &bull; {evt.time} <br/><span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{evt.location}</span></td>
                        <td>{evt.registered_count} registered</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => handleEditEventClick(evt)} className="btn-status praying-btn active" style={{ padding: '6px' }} title="Edit Event"><Edit2 size={12} /></button>
                            <button onClick={() => handleDeleteEventClick(evt.id)} className="btn-status answered-btn active text-red" style={{ padding: '6px' }} title="Delete/Cancel Event"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: LEADERSHIP PROFILES */}
          {activeTab === 'leadership' && (
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2>Sanctuary Leadership Profiles</h2>
                  <p>Manage elder biography details, photos, and designations shown in About section.</p>
                </div>
                <button 
                  onClick={() => { setEditingLeader(null); setLdrName(''); setLdrRole(''); setLdrBio(''); setLdrImageUrl(''); setShowLeaderModal(true); }}
                  className="btn-primary"
                  style={{ borderRadius: '8px', padding: '10px 20px', fontSize: '14px' }}
                >
                  <Plus size={16} />
                  <span>Add Leader</span>
                </button>
              </div>
              <div className="panel-divider"></div>

              <div className="leaders-grid-dashboard" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {leaders.map(ldr => (
                  <div key={ldr.id} className="family-registry-card glass-panel" style={{ display: 'flex', padding: '16px', gap: '16px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--accent-cyan)' }}>
                      <img src={ldr.image_url} alt={ldr.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flexGrow: 1, textAlign: 'left' }}>
                      <h4 style={{ color: '#fff' }}>{ldr.name}</h4>
                      <strong style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>{ldr.role}</strong>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{ldr.bio}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <button onClick={() => handleEditLeaderClick(ldr)} className="btn-status praying-btn active" style={{ padding: '6px' }} title="Edit"><Edit2 size={12} /></button>
                      <button onClick={() => handleDeleteLeaderClick(ldr.id)} className="btn-status answered-btn active text-red" style={{ padding: '6px' }} title="Delete"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MEDIA GALLERY */}
          {activeTab === 'gallery' && (
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header">
                <h2>Media Sanctuary Assets</h2>
                <p>Upload new albums or remove media files from database.</p>
              </div>
              <div className="panel-divider"></div>

              <div className="split-layout">
                {/* Uploader Form */}
                <form onSubmit={handleGalleryUpload} className="admin-form glass-panel" style={{ padding: '30px' }}>
                  <h3>Upload Gallery Item</h3>
                  <div className="form-divider"></div>
                  <div className="form-group">
                    <label>Title *</label>
                    <input type="text" value={galTitle} onChange={(e) => setGalTitle(e.target.value)} className="form-input" placeholder="Worship Night Highlights" required />
                  </div>
                  <div className="form-group">
                    <label>Image URL *</label>
                    <input type="url" value={galUrl} onChange={(e) => setGalUrl(e.target.value)} className="form-input" placeholder="https://images.unsplash.com/..." required />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={galCategory} onChange={(e) => setGalCategory(e.target.value)} className="form-input">
                      <option value="Worship">Worship</option>
                      <option value="Community">Community</option>
                      <option value="Outreach">Outreach</option>
                      <option value="Youth">Youth</option>
                    </select>
                  </div>
                  <button type="submit" disabled={galCompressed} className="btn-primary w-full">
                    {galCompressed ? 'Compressing and Uploading...' : 'Upload & Compress'}
                  </button>
                </form>

                {/* Listing */}
                <div className="glass-panel" style={{ padding: '24px', overflowY: 'auto', maxHeight: '550px' }}>
                  <h3>Gallery Assets</h3>
                  <div className="form-divider"></div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {gallery.map(item => (
                      <div key={item.id} className="gallery-item-card" style={{ border: '1px solid var(--border-glass)', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ height: '80px', borderRadius: '6px', overflow: 'hidden' }}>
                          <img src={item.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontSize: '9px', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>{item.category}</span>
                          <h5 style={{ color: '#fff', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h5>
                        </div>
                        <button onClick={() => handleDeleteGallery(item.id)} className="btn-accent" style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '4px', gap: '4px' }}>
                          <Trash2 size={10} /> Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CMS PAGE SETTINGS */}
          {activeTab === 'cms_settings' && (
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header">
                <h2>Complete CMS Page Settings</h2>
                <p>Update any section of the website in real-time without editing source code.</p>
              </div>
              <div className="panel-divider"></div>

              <div className="cms-sub-layouts">
                {/* 1. General Church settings */}
                <form onSubmit={handleSaveCMS} className="admin-form glass-panel" style={{ padding: '30px' }}>
                  <h3>1. Church Information Details</h3>
                  <div className="form-divider"></div>
                  <div className="form-group">
                    <label>Church Name</label>
                    <input type="text" value={cmsChurchName} onChange={(e) => setCmsChurchName(e.target.value)} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Logo Asset URL</label>
                    <input type="text" value={cmsLogo} onChange={(e) => setCmsLogo(e.target.value)} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Vision Statement</label>
                    <textarea value={cmsVision} onChange={(e) => setCmsVision(e.target.value)} className="form-input form-textarea" rows={3}></textarea>
                  </div>
                  <div className="form-group">
                    <label>Mission Statement</label>
                    <textarea value={cmsMission} onChange={(e) => setCmsMission(e.target.value)} className="form-input form-textarea" rows={3}></textarea>
                  </div>
                  <div className="form-group">
                    <label>History</label>
                    <textarea value={cmsHistory} onChange={(e) => setCmsHistory(e.target.value)} className="form-input form-textarea" rows={4}></textarea>
                  </div>
                  <div className="form-group">
                    <label>Contact Email</label>
                    <input type="email" value={cmsEmail} onChange={(e) => setCmsEmail(e.target.value)} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Contact Phone 1</label>
                    <input type="text" value={cmsPhone1} onChange={(e) => setCmsPhone1(e.target.value)} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Contact Phone 2</label>
                    <input type="text" value={cmsPhone2} onChange={(e) => setCmsPhone2(e.target.value)} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Physical Address</label>
                    <input type="text" value={cmsAddress} onChange={(e) => setCmsAddress(e.target.value)} className="form-input" />
                  </div>
                  
                  {/* Service Timings Manager inside Church Info settings */}
                  <div className="form-group" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <label style={{ margin: 0 }}>Service Schedules & Timings</label>
                      <button type="button" onClick={() => { setEditingTiming(null); setTName(''); setTTime(''); setTLocation(''); setShowTimingModal(true); }} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '4px' }}>
                        <Plus size={10} /> Add Time Slot
                      </button>
                    </div>
                    <div className="timing-slots-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {cmsSchedules.map(slot => (
                        <div key={slot.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', padding: '8px 12px', borderRadius: '6px' }}>
                          <div>
                            <strong style={{ fontSize: '13px', color: '#fff' }}>{slot.name}</strong> <br/>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{slot.time} &bull; {slot.location}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button type="button" onClick={() => { setEditingTiming(slot); setTName(slot.name); setTTime(slot.time); setTLocation(slot.location || ''); setShowTimingModal(true); }} className="btn-status praying-btn active" style={{ padding: '4px' }}><Edit2 size={10} /></button>
                            <button type="button" onClick={() => handleDeleteTiming(slot.id)} className="btn-status answered-btn active text-red" style={{ padding: '4px' }}><Trash2 size={10} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="btn-primary w-full margin-top-20">Save General Settings</button>
                </form>

                {/* 2. YouTube Live manager */}
                <form onSubmit={handleSaveLiveStream} className="admin-form glass-panel" style={{ padding: '30px' }}>
                  <h3>2. YouTube Live Stream Manager</h3>
                  <div className="form-divider"></div>
                  <div className="form-group">
                    <label>YouTube Embed Link</label>
                    <input type="url" value={cmsLiveUrl} onChange={(e) => setCmsLiveUrl(e.target.value)} className="form-input" placeholder="https://www.youtube.com/embed/..." />
                  </div>
                  <div className="form-group">
                    <label>Scheduled Timing</label>
                    <input type="datetime-local" value={cmsLiveScheduled} onChange={(e) => setCmsLiveScheduled(e.target.value)} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Stream Banner Text</label>
                    <input type="text" value={cmsLiveBanner} onChange={(e) => setCmsLiveBanner(e.target.value)} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Countdown Buffer (minutes)</label>
                    <input type="number" value={cmsLiveCountdown} onChange={(e) => setCmsLiveCountdown(e.target.value)} className="form-input" />
                  </div>
                  <div className="form-group checkbox-label" style={{ display: 'flex', gap: '8px' }}>
                    <input type="checkbox" checked={cmsIsLive} onChange={(e) => setCmsIsLive(e.target.checked)} />
                    <strong>Set stream active as LIVE</strong>
                  </div>
                  <button type="submit" className="btn-primary w-full">Update Live Stream Portal</button>
                </form>

                {/* 3. Broadcast Notification Form */}
                <form onSubmit={handleBroadcastAlert} className="admin-form glass-panel" style={{ padding: '30px' }}>
                  <h3>3. Broadcast Bulletins to Dashboards</h3>
                  <div className="form-divider"></div>
                  <div className="form-group">
                    <label>Alert Title</label>
                    <input type="text" value={alertTitle} onChange={(e) => setAlertTitle(e.target.value)} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>Alert Description Message</label>
                    <textarea value={alertMsg} onChange={(e) => setAlertMsg(e.target.value)} className="form-input form-textarea" rows={4} required></textarea>
                  </div>
                  <button type="submit" className="btn-primary w-full">Send Broadcast Alert</button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: MODERATE PRAYERS */}
          {activeTab === 'prayers' && (
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header">
                <h2>Moderate Prayer Wall</h2>
                <p>Track intercessions and update prayer wall active listing status.</p>
              </div>
              <div className="panel-divider"></div>

              <div className="admin-prayers-table">
                {prayers.map((prayer) => (
                  <div key={prayer.id} className="admin-prayer-row glass-panel">
                    <div className="prayer-info-block">
                      <div className="user-meta-row">
                        <span className="user-name-label">{prayer.name}</span>
                        <span className="user-phone">{prayer.mobile || 'Confidential'}</span>
                        <span className="date-tag">{prayer.created_at}</span>
                      </div>
                      <p className="prayer-desc-text">"{prayer.request}"</p>
                    </div>

                    <div className="prayer-actions-row">
                      <span className="action-label">Current Status: <strong className="text-white">{prayer.status}</strong></span>
                      <div className="action-buttons-group">
                        <button onClick={() => updatePrayerStatus(prayer.id, 'Pending')} className={`btn-status pending-btn ${prayer.status === 'Pending' ? 'active' : ''}`}>Pending</button>
                        <button onClick={() => updatePrayerStatus(prayer.id, 'Praying')} className={`btn-status praying-btn ${prayer.status === 'Praying' ? 'active' : ''}`}>Praying</button>
                        <button onClick={() => updatePrayerStatus(prayer.id, 'Answered')} className={`btn-status answered-btn ${prayer.status === 'Answered' ? 'active' : ''}`}>Answered</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: AUDIT LOGS & BACKUPS */}
          {activeTab === 'audit_logs' && (
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header">
                <h2>Security Audit Logs & Backups</h2>
                <p>Monitor administrative operations and run system configuration backups.</p>
              </div>
              <div className="panel-divider"></div>

              <div className="analytics-quick-stats margin-bottom-20" style={{ gridTemplateColumns: '1fr' }}>
                <div className="stat-box glass-panel justify-between align-center">
                  <div>
                    <span className="stat-label">SYSTEM BACKUP MANAGEMENT</span>
                    <h3>Database Backup Snapshot</h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Generate a point-in-time snapshot copy of the SQLite db on local storage.</p>
                  </div>
                  <button onClick={handleBackupClick} className="btn-primary" style={{ gap: '8px', borderRadius: '8px' }}>
                    <Database size={16} />
                    <span>Run System Backup</span>
                  </button>
                </div>
              </div>

              {/* Logs table */}
              <div className="table-responsive glass-panel" style={{ padding: '24px' }}>
                <h3>Activity Logs (Last 200 items)</h3>
                <div className="form-divider"></div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Operator</th>
                      <th>Action</th>
                      <th>Details</th>
                      <th>IP Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminLogs.map(log => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '11px' }}>{log.created_at}</td>
                        <td><strong>{log.username}</strong></td>
                        <td><span className="head-badge" style={{ background: 'rgba(255,255,255,0.02)' }}>{log.action}</span></td>
                        <td style={{ fontSize: '12px' }}>{log.details}</td>
                        <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.ip_address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SECURITY & 2FA */}
          {activeTab === 'security' && (
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header">
                <h2>Super Admin Security Keys</h2>
                <p>Add 2FA protection keys to lock/unlock Super Admin access rights.</p>
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
                <div className="flex-row gap-10" style={{ display: 'flex', gap: '10px' }}>
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
                {compressRatio && <span className="helper-text" style={{ color: 'var(--accent-cyan)', fontSize: '11px' }}>{compressRatio}</span>}
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

              <div className="flex-row gap-10 margin-top-20" style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary">Save Household</button>
                <button type="button" onClick={() => { setShowFamilyModal(false); resetFamilyForm(); }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EVENT MODAL */}
      {showEventModal && (
        <div className="sim-modal-overlay">
          <div className="sim-modal-box glass-panel animate-text-reveal" style={{ maxWidth: '600px', textAlign: 'left' }}>
            <h3>{editingEvent ? 'Modify Scheduled Event' : 'Schedule New Outreach/Gathering'}</h3>
            <div className="form-divider"></div>

            <form onSubmit={handleSaveEvent} className="admin-form">
              <div className="form-group">
                <label>Event Title *</label>
                <input type="text" value={evtTitle} onChange={(e) => setEvtTitle(e.target.value)} placeholder="Pentecost Praise Night" className="form-input" required />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select value={evtCategory} onChange={(e) => setEvtCategory(e.target.value)} className="form-input">
                  <option value="Upcoming">Upcoming</option>
                  <option value="Worship Nights">Worship Nights</option>
                  <option value="Outreach">Outreach</option>
                  <option value="Past">Past</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input type="date" value={evtDate} onChange={(e) => setEvtDate(e.target.value)} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Time Slot *</label>
                <input type="text" value={evtTime} onChange={(e) => setEvtTime(e.target.value)} placeholder="6:30 PM - 9:00 PM" className="form-input" required />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input type="text" value={evtLocation} onChange={(e) => setEvtLocation(e.target.value)} placeholder="Sanctuary Hall, Kondapur" className="form-input" required />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={evtDesc} onChange={(e) => setEvtDesc(e.target.value)} placeholder="Detail the event agenda..." className="form-input form-textarea" rows={3} required></textarea>
              </div>
              <div className="form-group">
                <label>Banner Image URL</label>
                <input type="url" value={evtImageUrl} onChange={(e) => setEvtImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." className="form-input" />
              </div>
              <div className="flex-row gap-10 margin-top-20" style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary">Save Event</button>
                <button type="button" onClick={() => setShowEventModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEADERSHIP MODAL */}
      {showLeaderModal && (
        <div className="sim-modal-overlay">
          <div className="sim-modal-box glass-panel animate-text-reveal" style={{ maxWidth: '600px', textAlign: 'left' }}>
            <h3>{editingLeader ? 'Modify Leader Profile' : 'Add Leadership Profile'}</h3>
            <div className="form-divider"></div>

            <form onSubmit={handleSaveLeader} className="admin-form">
              <div className="form-group">
                <label>Leader Name *</label>
                <input type="text" value={ldrName} onChange={(e) => setLdrName(e.target.value)} placeholder="Rev. Jonathan Edward" className="form-input" required />
              </div>
              <div className="form-group">
                <label>Role / Designation *</label>
                <input type="text" value={ldrRole} onChange={(e) => setLdrRole(e.target.value)} placeholder="Senior Pastor" className="form-input" required />
              </div>
              <div className="form-group">
                <label>Biography *</label>
                <textarea value={ldrBio} onChange={(e) => setLdrBio(e.target.value)} placeholder="Enter biography details..." className="form-input form-textarea" rows={4} required></textarea>
              </div>
              <div className="form-group">
                <label>Profile Image URL *</label>
                <input type="url" value={ldrImageUrl} onChange={(e) => setLdrImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." className="form-input" required />
              </div>
              <div className="flex-row gap-10 margin-top-20" style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary">Save Profile</button>
                <button type="button" onClick={() => setShowLeaderModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE TIMINGS MODAL */}
      {showTimingModal && (
        <div className="sim-modal-overlay">
          <div className="sim-modal-box glass-panel animate-text-reveal" style={{ maxWidth: '500px', textAlign: 'left' }}>
            <h3>{editingTiming ? 'Modify Service Slot' : 'Add Weekly Service Slot'}</h3>
            <div className="form-divider"></div>

            <form onSubmit={handleSaveTiming} className="admin-form">
              <div className="form-group">
                <label>Service Name *</label>
                <input type="text" value={tName} onChange={(e) => setTName(e.target.value)} placeholder="Sunday Morning Worship" className="form-input" required />
              </div>
              <div className="form-group">
                <label>Timing Slot *</label>
                <input type="text" value={tTime} onChange={(e) => setTTime(e.target.value)} placeholder="09:00 AM - 11:00 AM" className="form-input" required />
              </div>
              <div className="form-group">
                <label>Hall / Location *</label>
                <input type="text" value={tLocation} onChange={(e) => setTLocation(e.target.value)} placeholder="Corporate Sanctuary" className="form-input" required />
              </div>
              <div className="flex-row gap-10 margin-top-20" style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary">Save Timing</button>
                <button type="button" onClick={() => setShowTimingModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
