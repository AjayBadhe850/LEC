import { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useFamilyStats } from '../hooks/useFamilyStats';
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Real-time family statistics hook
  const { familyCount, refreshCount: refreshFamilyCount, forceRefresh: forceFamilyRefresh } = useFamilyStats();

  // Navigation & Gate state
  const [welcomeEntered, setWelcomeEntered] = useState(() => {
    return localStorage.getItem('welcomeEntered') === 'true';
  });
  const [activePage, setActivePage] = useState('home');

  // Auth States
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPastor, setIsPastor] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  // Stats for Homepage
  const [publicStats, setPublicStats] = useState({
    totalFamilies: 0,
    upcomingEvents: 0,
    membersCount: 0,
    liveStatus: false,
    liveDetails: null,
    mission: ''
  });

  // DB States (Fetched from backend)
  const [prayers, setPrayers] = useState([]);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]); // map to announcements
  const [leaders, setLeaders] = useState([]);
  const [songs, setSongs] = useState([]);
  const [verses, setVerses] = useState([]);
  const [churchInfo, setChurchInfo] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [activeTheme, setActiveTheme] = useState('dark');

  // System Stats for Admin
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [rolesData, setRolesData] = useState({ roles: [], permissions: [], rolePermissions: [] });

  // Sync Welcome Gate
  useEffect(() => {
    localStorage.setItem('welcomeEntered', welcomeEntered);
  }, [welcomeEntered]);

  // Load Session and Public Data on Mount
  useEffect(() => {
    const initApp = async () => {
      await fetchSession();
      await fetchPublicStats();
      //await fetchChurchInfo();
      await fetchLeaders();
      await fetchEvents();
      await fetchPublicPrayers();
      //await fetchSongs();
     // await fetchBibleVerses();
      //await fetchAnnouncements();
      await fetchGallery();

      // Handle redirect query parameters from Google OAuth flow
      const params = new URLSearchParams(window.location.search);
      const page = params.get('activePage');
      if (page) {
        setActivePage(page);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      if (params.get('twoFactorRequired') === 'true') {
        setActivePage('auth');
      }
    };
    initApp();
  }, []);

  // Fetch Session status from server
async function fetchSession() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      setCurrentUser(session.user);
      setIsLoggedIn(true);
      return session;
    }

    setCurrentUser(null);
    setIsLoggedIn(false);
    return null;
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
};

  // Sync family count with public stats (real-time updates)
  useEffect(() => {
    setPublicStats(prevStats => ({
      ...prevStats,
      totalFamilies: familyCount
    }));
  }, [familyCount]);

  // Fetch Public Stats (with real-time family count)
  async function fetchPublicStats() {
    try {
      const res = await fetch('/api/public/stats');
      const data = await res.json();
      if (data.success) {
        setPublicStats({
          totalFamilies: familyCount,
          upcomingEvents: data.upcomingEvents,
          membersCount: data.membersCount,
          liveStatus: data.liveStatus,
          liveDetails: data.liveDetails,
          mission: data.mission
        });
      }
    } catch (err) {
      console.error('Error fetching public stats:', err);
    }
  };

  // Fetch Church Information Details
  async function fetchChurchInfo() {
    try {
      const res = await fetch('/api/church-info');
      const data = await res.json();
      if (data.success && data.info) {
        setChurchInfo(data.info);
        setActiveTheme(data.info.active_theme || 'dark');
        // Apply theme instantly
        document.documentElement.setAttribute('data-theme', data.info.active_theme || 'dark');
      }
    } catch (err) {
      console.error('Error fetching church info:', err);
    }
  };

  // Update global site theme (Super Admin Only)
  const updateTheme = async (theme) => {
    try {
      const res = await fetch('/api/church-info/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme })
      });
      const data = await res.json();
      if (data.success) {
        setActiveTheme(theme);
        document.documentElement.setAttribute('data-theme', theme);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Theme toggle failed: ' + err.message };
    }
  };

  // Fetch Leaders
  async function fetchLeaders() {
  try {
    const { data, error } = await supabase
      .from('leaders')
      .select('*');

    if (error) throw error;

    setLeaders(data || []);
  } catch (err) {
    console.error('Error fetching leaders:', err);
  }
};

  // Fetch Events
async function fetchEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    console.log("Events loaded:", data);

    setEvents(data || []);
  } catch (err) {
    console.error('Error fetching events:', err);
  }
};

  // Fetch Public Prayers for general wall
  async function fetchPublicPrayers() {
  try {
    const { data, error } = await supabase
      .from('prayers')
      .select('*');

    if (error) throw error;

    setPrayers(data || []);
  } catch (err) {
    console.error('Error fetching prayers:', err);
  }
};

  // Fetch User specific prayers (including confidential)
  async function fetchUserPrayers() {
    try {
      const res = await fetch('/api/prayers/all');
      const data = await res.json();
      if (data.success) setPrayers(data.prayers);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Songs
  async function fetchSongs() {
    try {
      const res = await fetch('/api/songs');
      const data = await res.json();
      if (data.success) setSongs(data.songs);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Bible Verses
  async function fetchBibleVerses() {
    try {
      const res = await fetch('/api/bible-verses');
      const data = await res.json();
      if (data.success) setVerses(data.verses);
    } catch (err) {
      console.error(err);
    }
  };
// Fetch Events
async function fetchEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    console.log("Events loaded:", data);

    setEvents(data || []);
  } catch (err) {
    console.error('Error fetching events:', err);
  }
};
  // Fetch Announcements
  async function fetchAnnouncements() {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      if (data.success) setNotifications(data.announcements);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Gallery Items
  async function fetchGallery() {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*');

    if (error) throw error;

    setGallery(data || []);
  } catch (err) {
    console.error('Error fetching gallery:', err);
  }
};

  // Admin users loader
  const fetchAdminUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) setAdminUsers(data.users);
    } catch (err) {
      console.error(err);
    }
  };

  // Admin logs loader
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      if (data.success) setAdminLogs(data.logs);
    } catch (err) {
      console.error(err);
    }
  };

  // Admin roles permissions loader
  const fetchRolesPermissions = async () => {
    try {
      const res = await fetch('/api/admin/roles-permissions');
      const data = await res.json();
      if (data.success) {
        setRolesData({
          roles: data.roles,
          permissions: data.permissions,
          rolePermissions: data.rolePermissions
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

// Login handler
const handleLogin = async (email, password) => {
  try {
   const { data, error } =
await supabase.auth.signInWithPassword({
  email,
  password
});

    if (error) {
      return {
        success: false,
        message: error.message
      };
    }

    setCurrentUser(data.user);
    setIsLoggedIn(true);

    return {
      success: true,
      user: data.user,
      message: "Logged in successfully"
    };
  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
};
     
  // Verify TOTP 2FA Login
  const handleVerify2FA = async (tempToken, totpCode) => {
    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, totpCode })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        setIsAdmin(data.user.roleName === 'Super Admin');
        setIsPastor(data.user.roleName === 'Pastor');
        
        fetchUserPrayers();
        if (data.user.roleName === 'Super Admin' || data.user.roleName === 'Pastor') {
          fetchAdminUsers();
          fetchRolesPermissions();
        }
        if (data.user.roleName === 'Super Admin') {
          fetchAuditLogs();
        }
        fetchPublicStats();
        return { success: true, user: data.user, message: '2FA authentication successful.' };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Verification connection failed: ' + err.message };
    }
  };

  // Google authentication
  const handleGoogleSignIn = async (payload) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        if (data.twoFactorRequired) {
          return { success: true, twoFactorRequired: true, tempToken: data.tempToken };
        }
        
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        setIsAdmin(data.user.roleName === 'Super Admin');
        setIsPastor(data.user.roleName === 'Pastor');
        
        fetchUserPrayers();
        fetchPublicStats();
        return { success: true, message: 'Logged in via Google.' };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Google Sign-In failed: ' + err.message };
    }
  };

  // Registration handler
  const handleRegister = async (userInfo) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: userInfo.email,
      password: userInfo.password,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: "Registration successful",
      user: data.user,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
    setCurrentUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    setIsPastor(false);
    setActivePage('home');
  };

  // Prayer submit
  const submitPrayerRequest = async (name, mobile, request, isPublic) => {
    try {
      const res = await fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          mobile, 
          request, 
          isPublic: isPublic ? 1 : 0,
          userId: currentUser ? currentUser.id : null 
        })
      });
      const data = await res.json();
      if (data.success) {
        if (isLoggedIn) fetchUserPrayers();
        else fetchPublicPrayers();
        fetchPublicStats();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Change Prayer status (Pastor / Admin)
  const updatePrayerStatus = async (prayerId, newStatus) => {
    try {
      const res = await fetch(`/api/prayers/${prayerId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchUserPrayers();
        fetchAnnouncements();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Increment Amen on prayer card
  const submitAmen = async (prayerId) => {
    try {
      await fetch(`/api/prayers/${prayerId}/amen`, { method: 'POST' });
      if (isLoggedIn) fetchUserPrayers();
      else fetchPublicPrayers();
    } catch (err) {
      console.error(err);
    }
  };

  // Broadcast Bulletin Notification (Admin / Pastor)
  const broadcastNotification = async (title, message) => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message })
      });
      const data = await res.json();
      if (data.success) {
        fetchAnnouncements();
        if (isAdmin) fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Event Scheduler
  const createEvent = async (eventData) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      const data = await res.json();
      if (data.success) {
        fetchEvents();
        fetchAnnouncements();
        fetchPublicStats();
        if (isAdmin) fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Update Event
  const updateEventDetails = async (eventId, eventData) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      const data = await res.json();
      if (data.success) {
        fetchEvents();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Delete Event (Super Admin)
  const deleteEvent = async (eventId) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchEvents();
        fetchPublicStats();
        if (isAdmin) fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Update Leader Profile
  const updateLeaderProfile = async (leaderId, leaderData) => {
    try {
      const res = await fetch(`/api/leadership/${leaderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaderData)
      });
      const data = await res.json();
      if (data.success) {
        fetchLeaders();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Update Live Stream Manager Settings
  const updateLiveStreamSettings = async (streamData) => {
    try {
      const res = await fetch('/api/live-stream', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(streamData)
      });
      const data = await res.json();
      if (data.success) {
        fetchPublicStats();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Add Gallery Image (with mock compression)
  const addGalleryItem = async (galleryData) => {
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(galleryData)
      });
      const data = await res.json();
      if (data.success) {
        fetch('/api/gallery').then(r => r.json()).then(d => { if (d.success) setGallery(d.gallery); });
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Delete Family Record (Super Admin)
  const deleteFamilyRecord = async (familyId) => {
    try {
      const res = await fetch(`/api/families/${familyId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchPublicStats();
        refreshFamilyCount();
        if (isAdmin) fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Delete Song (Super Admin)
  const deleteSong = async (songId) => {
    try {
      const res = await fetch(`/api/songs/${songId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchSongs();
        if (isAdmin) fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Delete Gallery Item (Super Admin)
  const deleteGalleryItem = async (galleryId) => {
    try {
      const res = await fetch(`/api/gallery/${galleryId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchGallery();
        if (isAdmin) fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Delete Leader Profile (Super Admin)
  const deleteLeaderProfile = async (leaderId) => {
    try {
      const res = await fetch(`/api/leadership/${leaderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchLeaders();
        if (isAdmin) fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Update Service Timings schedules (Pastor / Admin)
  const updateServiceTimings = async (serviceTimings) => {
    try {
      const res = await fetch('/api/church-info/schedules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceTimings })
      });
      const data = await res.json();
      if (data.success) {
        fetchChurchInfo();
        if (isAdmin) fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // System Backup (Super Admin)
  const triggerSystemBackup = async () => {
    try {
      const res = await fetch('/api/admin/backup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Create Staff Account (Super Admin)
  const createStaffAccount = async (payload) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminUsers();
        fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Delete User Account (Super Admin)
  const deleteUserAccount = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAdminUsers();
        fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Save Custom Role Permissions
  const saveRolePermissions = async (roleId, permissionIds) => {
    try {
      const res = await fetch(`/api/admin/roles/${roleId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionIds })
      });
      const data = await res.json();
      if (data.success) {
        fetchRolesPermissions();
        fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Create Custom Role
  const createCustomRole = async (roleName, description) => {
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roleName, description })
      });
      const data = await res.json();
      if (data.success) {
        fetchRolesPermissions();
        fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Create Family Record (Auto-added to real-time count)
  const createFamily = async (familyData) => {
    try {
      const res = await fetch('/api/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(familyData)
      });
      const data = await res.json();
      if (data.success) {
        refreshFamilyCount();
        fetchPublicStats();
        if (isAdmin) fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Update Family Record
  const updateFamily = async (familyId, familyData) => {
    try {
      const res = await fetch(`/api/families/${familyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(familyData)
      });
      const data = await res.json();
      if (data.success) {
        refreshFamilyCount();
        if (isAdmin) fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Restore Soft-Deleted Family Record
  const restoreFamily = async (familyId) => {
    try {
      const res = await fetch(`/api/families/${familyId}/restore`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        refreshFamilyCount();
        fetchPublicStats();
        if (isAdmin) fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Approve/Update Family Status
  const approveFamilyStatus = async (familyId, status) => {
    try {
      const res = await fetch(`/api/families/${familyId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        refreshFamilyCount();
        if (isAdmin) fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <AppContext.Provider value={{
      welcomeEntered,
      setWelcomeEntered,
      activePage,
      setActivePage,
      currentUser,
      isLoggedIn,
      isAdmin,
      isPastor,
      loadingSession,
      publicStats,
      activeTheme,
      updateTheme,
      prayers,
      events,
      notifications,
      leaders,
      songs,
      verses,
      churchInfo,
      gallery,
      adminUsers,
      adminLogs,
      rolesData,
      handleLogin,
      handleVerify2FA,
      handleGoogleSignIn,
      handleRegister,
      handleLogout,
      submitPrayerRequest,
      updatePrayerStatus,
      submitAmen,
      broadcastNotification,
      createEvent,
      updateEventDetails,
      deleteEvent,
      deleteFamilyRecord,
      createFamily,
      updateFamily,
      restoreFamily,
      approveFamilyStatus,
      deleteSong,
      deleteGalleryItem,
      deleteLeaderProfile,
      updateServiceTimings,
      updateLeaderProfile,
      updateLiveStreamSettings,
      addGalleryItem,
      triggerSystemBackup,
      createStaffAccount,
      deleteUserAccount,
      saveRolePermissions,
      createCustomRole,
      refreshStats: fetchPublicStats,
      refreshSession: fetchSession,
      familyCount,
      refreshFamilyCount,
      forceFamilyRefresh
    }}>
      {children}
    </AppContext.Provider>
  );
};
