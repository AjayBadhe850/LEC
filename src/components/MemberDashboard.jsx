import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { User, Users, HeartHandshake, Bell, LogOut, Check, Mail, Phone, MapPin, Key } from 'lucide-react';
import TwoFactorSettings from './TwoFactorSettings';
import { supabase } from '../lib/supabase';
export default function MemberDashboard() {
  const {
  currentUser,
  handleLogout,
  prayers,
  notifications,
  markNotificationAsRead,
  userRole
} = useContext(AppContext);
const isAdmin = userRole === "Super Admin";
const isPastor = userRole === "Pastor";
const isMember = userRole === "Member";

  const [activeTab, setActiveTab] = useState('overview');
  const [myFamily, setMyFamily] = useState(null);
  const [loadingFamily, setLoadingFamily] = useState(true);

 useEffect(() => {
  const loadFamily = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error) throw error;

      setMyFamily(data);
    } catch (err) {
      console.error('Failed to load family:', err);
    } finally {
      setLoadingFamily(false);
    }
  };

  loadFamily();
}, [currentUser]);

  // Filter prayers submitted by this user
  const myPrayers = prayers.filter((p) => {
    return p.name.toLowerCase().includes(currentUser.username.toLowerCase()) || 
           (currentUser.email && p.name.toLowerCase().includes(currentUser.email.split('@')[0]));
  });

  const unreadNotifications = notifications.filter(n => !n.read);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Answered': return 'status-answered';
      case 'Praying': return 'status-praying';
      default: return 'status-pending';
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="user-profile-widget">
            <div className="avatar-circle">
              {currentUser?.username ? currentUser.username.charAt(0) : 'U'}
            </div>
            <h3>{currentUser?.username ?? ''}</h3>
            <span className="user-badge-role">{currentUser?.roleName ?? 'Covenant Member'}</span>
          </div>

          <div className="sidebar-menu">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`sidebar-link-btn ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <User size={16} />
              <span>Covenant Profile</span>
            </button>
            <button
  onClick={() => setActiveTab('overview')}
  className={`sidebar-link-btn ${activeTab === 'overview' ? 'active' : ''}`}
>
  <User size={16} />
  <span>Covenant Profile</span>
</button>

{/* Pastor + Admin */}
{(isPastor || isAdmin) && (
  <button
    onClick={() => setActiveTab('events')}
    className={`sidebar-link-btn ${activeTab === 'events' ? 'active' : ''}`}
  >
    <Bell size={16} />
    <span>Event Management</span>
  </button>
)}

{/* Admin Only */}
{isAdmin && (
  <button
    onClick={() => setActiveTab('users')}
    className={`sidebar-link-btn ${activeTab === 'users' ? 'active' : ''}`}
  >
    <Users size={16} />
    <span>User Management</span>
  </button>
)}

{/* Admin Only */}
{isAdmin && (
  <button
    onClick={() => setActiveTab('settings')}
    className={`sidebar-link-btn ${activeTab === 'settings' ? 'active' : ''}`}
  >
    <Key size={16} />
    <span>System Settings</span>
  </button>
)}
            
            <button 
              onClick={() => setActiveTab('prayers')} 
              className={`sidebar-link-btn ${activeTab === 'prayers' ? 'active' : ''}`}
            >
              <HeartHandshake size={16} />
              <span>Prayer Petitions ({myPrayers.length})</span>
            </button>

            <button 
              onClick={() => setActiveTab('notifications')} 
              className={`sidebar-link-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            >
              <Bell size={16} />
              <span>Alerts ({unreadNotifications.length})</span>
              {unreadNotifications.length > 0 && <span className="red-badge-count"></span>}
            </button>

            <button 
              onClick={() => setActiveTab('security')} 
              className={`sidebar-link-btn ${activeTab === 'security' ? 'active' : ''}`}
            >
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
          
          {activeTab === 'events' && (isPastor || isAdmin) && (
  <div>
    <h2>Event Management</h2>
    <p>Create, edit and manage church events.</p>
  </div>
)}

{activeTab === 'users' && isAdmin && (
  <div>
    <h2>User Management</h2>
    <p>Manage church members and roles.</p>
  </div>
)}

{activeTab === 'settings' && isAdmin && (
  <div>
    <h2>System Settings</h2>
    <p>Configure church portal settings.</p>
  </div>
)}
            /* OVERVIEW TAB */
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header">
                <h2>Covenant Member Profile</h2>
                <p>Verify your details and family census records inside our church database.</p>
              </div>
              <div className="panel-divider"></div>

              <div className="dashboard-grid-cards">
                {/* Profile Details */}
                <div className="profile-details-card glass-panel">
                  <h3>Contact Registry</h3>
                  <div className="details-list">
                    <div className="details-item">
                      <Mail size={16} className="details-icon" />
                      <div>
                        <span className="details-label">EMAIL ADDRESS</span>
                        <p>{currentUser.email}</p>
                      </div>
                    </div>

                    <div className="details-item">
                      <Phone size={16} className="details-icon" />
                      <div>
                        <span className="details-label">MOBILE PHONE</span>
                        <p>{currentUser.mobile}</p>
                      </div>
                    </div>

                    <div className="details-item">
                      <MapPin size={16} className="details-icon" />
                      <div>
                        <span className="details-label">RESIDENTIAL ADRESS</span>
                        <p>{currentUser.address || 'Not registered'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Family Census details */}
                <div className="profile-details-card glass-panel">
                  <div className="title-row-icon">
                    <Users size={20} className="text-cyan" />
                    <h3>Family Census Logs</h3>
                  </div>
                  
                  {loadingFamily ? (
                    <p className="no-members-text">Loading household details...</p>
                  ) : myFamily ? (
                    <>
                      <div className="family-status-box">
                        <span className="details-label">HOUSEHOLD NAME</span>
                        <p className="head-name">{myFamily.name}</p>
                      </div>
                      <div className="family-status-box">
                        <span className="details-label">HEAD OF HOUSEHOLD</span>
                        <p className="head-name">{myFamily.head_name}</p>
                      </div>
                      <div className="family-members-display">
                        <span className="details-label">REGISTERED DEPENDENTS</span>
                        {JSON.parse(myFamily.members || '[]').length > 0 ? (
                          <ul className="family-list">
                            {JSON.parse(myFamily.members || '[]').map((member, idx) => (
                              <li key={idx} className="family-item-bullet">
                                <span className="bullet-cyan"></span>
                                <span>{member}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="no-members-text">No dependents registered.</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="no-members-text">No family record found. Update in Join Lord's Kingdom form if needed.</p>
                  )}
                </div>
              </div>
            </div>
          )

          {activeTab === 'prayers' && (
            /* PRAYERS TAB */
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header">
                <h2>Personal Prayer Petitions</h2>
                <p>Track the intercessory status of prayer requests you have submitted.</p>
              </div>
              <div className="panel-divider"></div>

              <div className="dashboard-prayers-list">
                {myPrayers.map((prayer) => (
                  <div key={prayer.id} className="prayer-status-card glass-panel">
                    <div className="prayer-card-header">
                      <span className="prayer-id-label">PETITION ID: {prayer.id}</span>
                      <span className={`status-badge ${getStatusClass(prayer.status)}`}>
                        {prayer.status}
                      </span>
                    </div>
                    <p className="prayer-request-body">"{prayer.request}"</p>
                    <div className="prayer-card-footer">
                      <span className="date-badge">Logged: {prayer.date}</span>
                      <span className="privacy-badge">{prayer.isPublic ? 'Public Wall' : 'Confidential (Pastors Only)'}</span>
                    </div>
                  </div>
                ))}

                {myPrayers.length === 0 && (
                  <div className="empty-dashboard-state glass-panel">
                    <HeartHandshake size={32} className="text-muted" />
                    <p>You have not logged any prayer requests yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            /* NOTIFICATIONS TAB */
            <div className="dashboard-tab-panel animate-text-reveal">
              <div className="panel-header">
                <h2>Ministry Announcements & Alerts</h2>
                <p>Read messages broadcasted to the church family by the Pastoral Office.</p>
              </div>
              <div className="panel-divider"></div>

              <div className="dashboard-notifications-list">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`notification-card glass-panel ${notif.read ? 'read-notif' : 'unread-notif'}`}>
                    <div className="notif-header-row">
                      <div className="notif-title-group">
                        {!notif.read && <span className="unread-dot"></span>}
                        <h4>{notif.title}</h4>
                      </div>
                      <span className="notif-date">{notif.date}</span>
                    </div>
                    <p className="notif-body-text">{notif.message}</p>
                    
                    {!notif.read && (
                      <button 
                        onClick={() => markNotificationAsRead(notif.id)} 
                        className="btn-mark-read"
                      >
                        <Check size={12} />
                        <span>Acknowledge</span>
                      </button>
                    )}
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="empty-dashboard-state glass-panel">
                    <Bell size={32} className="text-muted" />
                    <p>No new announcements from the ministry at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            /* SECURITY & 2FA TAB */
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

      <style>{`
        .dashboard-page {
          background-color: var(--bg-dark);
          position: relative;
          z-index: 5;
        }

        .user-profile-widget {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 30px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 24px;
        }

        .avatar-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
          color: #FFF;
          font-family: var(--font-heading);
          font-size: 30px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-glow);
        }

        .user-profile-widget h3 {
          font-size: 18px;
          color: #FFF;
          font-weight: 700;
        }

        .user-badge-role {
          font-family: var(--font-heading);
          font-size: 11px;
          background: rgba(0, 214, 255, 0.08);
          border: 1px solid rgba(0, 214, 255, 0.3);
          color: var(--accent-cyan);
          padding: 3px 10px;
          border-radius: 20px;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .sidebar-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-link-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          text-align: left;
        }

        .sidebar-link-btn:hover {
          background: rgba(255, 255, 255, 0.03);
          color: #FFF;
        }

        .sidebar-link-btn.active {
          background: rgba(0, 80, 255, 0.08);
          color: var(--accent-cyan);
          border-left: 3px solid var(--accent-cyan);
          border-radius: 0 8px 8px 0;
        }

        .sidebar-divider {
          height: 1px;
          background: var(--border-glass);
          margin: 16px 0;
        }

        .red-badge-count {
          width: 6px;
          height: 6px;
          background-color: var(--accent-red);
          border-radius: 50%;
          margin-left: auto;
          box-shadow: 0 0 6px var(--accent-red);
        }

        /* Panels styling */
        .panel-header h2 {
          font-size: 26px;
          color: #FFF;
        }

        .panel-header p {
          font-size: 14px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .panel-divider {
          width: 40px;
          height: 3px;
          background: var(--accent-cyan);
          margin: 16px 0 32px;
          border-radius: 2px;
        }

        /* Overview Tab */
        .dashboard-grid-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 768px) {
          .dashboard-grid-cards {
            grid-template-columns: 1fr;
          }
        }

        .profile-details-card {
          padding: 30px;
          background: var(--bg-card);
        }

        .profile-details-card h3 {
          font-size: 18px;
          color: #FFF;
          margin-bottom: 20px;
        }

        .title-row-icon {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .title-row-icon h3 {
          margin-bottom: 0;
        }

        .details-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .details-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .details-icon {
          color: var(--accent-cyan);
          margin-top: 2px;
        }

        .details-label {
          display: block;
          font-family: var(--font-heading);
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .details-item p {
          font-size: 14px;
          color: #FFF;
        }

        .family-status-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 20px;
        }

        .head-name {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 15px;
          color: #FFF;
        }

        .family-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 8px;
        }

        .family-item-bullet {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .bullet-cyan {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--accent-cyan);
          box-shadow: 0 0 6px var(--accent-cyan);
        }

        .no-members-text {
          font-size: 13.5px;
          color: var(--text-muted);
          margin-top: 8px;
        }

        /* Prayers Tab */
        .dashboard-prayers-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .prayer-status-card {
          padding: 24px;
          background: rgba(12, 12, 14, 0.4);
        }

        .prayer-id-label {
          font-family: var(--font-heading);
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .prayer-request-body {
          font-size: 14px;
          color: #E4E4E7;
          line-height: 1.5;
          margin: 12px 0;
          font-style: italic;
        }

        .date-badge {
          font-size: 12px;
          color: var(--text-muted);
        }

        .privacy-badge {
          font-size: 11px;
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-secondary);
          padding: 2px 8px;
          border-radius: 4px;
        }

        /* Notifications Tab */
        .dashboard-notifications-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .notification-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
        }

        .unread-notif {
          border-left: 3px solid var(--accent-blue) !important;
          background: rgba(0, 80, 255, 0.02);
        }

        .notif-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .notif-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .notif-title-group h4 {
          font-size: 16px;
          color: #FFF;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background-color: var(--accent-blue);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--accent-blue);
        }

        .notif-date {
          font-size: 12px;
          color: var(--text-muted);
        }

        .notif-body-text {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .btn-mark-read {
          display: flex;
          align-items: center;
          gap: 6px;
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          padding: 6px 12px;
          border-radius: 4px;
          font-family: var(--font-heading);
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
        }

        .btn-mark-read:hover {
          background: rgba(0, 214, 255, 0.05);
          color: var(--accent-cyan);
          border-color: var(--accent-cyan);
        }

        .empty-dashboard-state {
          padding: 60px;
          text-align: center;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
      `}</style>
    </div>
  );
}
