const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'church.db');
const db = new sqlite3.Database(dbPath);

// Create database schemas
function initDb() {
  db.serialize(() => {
    // Enable foreign keys
    db.run("PRAGMA foreign_keys = ON;");

    // 1. Roles table
    db.run(`
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT
      )
    `);

    // 2. Permissions table
    db.run(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        description TEXT
      )
    `);

    // 3. Role Permissions table (RBAC map)
    db.run(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INTEGER,
        permission_id INTEGER,
        PRIMARY KEY (role_id, permission_id),
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
      )
    `);

    // 4. Users table (Soft Delete & 2FA support)
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        mobile TEXT,
        address TEXT,
        role_id INTEGER,
        totp_secret TEXT,
        totp_enabled INTEGER DEFAULT 0,
        recovery_codes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
      )
    `);

    // 5. Families table (Empty by default)
    db.run(`
      CREATE TABLE IF NOT EXISTS families (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        head_name TEXT NOT NULL,
        head_member_id INTEGER,
        photo_url TEXT,
        members TEXT, -- JSON array of names/roles
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT,
        FOREIGN KEY (head_member_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // 6. Events table
    db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        location TEXT,
        image_url TEXT,
        registered_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT
      )
    `);

    // 7. Church Info table
    db.run(`
      CREATE TABLE IF NOT EXISTS church_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        logo_url TEXT,
        vision TEXT,
        text_mission TEXT,
        history TEXT,
        contact_email TEXT,
        contact_phone_1 TEXT,
        contact_phone_2 TEXT,
        address TEXT,
        service_timings TEXT, -- JSON array
        active_theme TEXT DEFAULT 'dark',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8. Leadership table
    db.run(`
      CREATE TABLE IF NOT EXISTS leadership (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        bio TEXT,
        image_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT
      )
    `);

    // 9. Gallery table
    db.run(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        url TEXT NOT NULL,
        type TEXT DEFAULT 'photo', -- photo or video
        size INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT
      )
    `);

    // 10. Prayer Requests table
    db.run(`
      CREATE TABLE IF NOT EXISTS prayer_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        mobile TEXT,
        request TEXT NOT NULL,
        status TEXT DEFAULT 'Pending', -- Pending, Praying, Answered
        is_public INTEGER DEFAULT 1,
        amen_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // 11. Songs table
    db.run(`
      CREATE TABLE IF NOT EXISTS songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        lyrics TEXT,
        category TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT
      )
    `);

    // 12. Bible Verses table
    db.run(`
      CREATE TABLE IF NOT EXISTS bible_verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verse_reference TEXT NOT NULL,
        verse_text TEXT NOT NULL,
        theme TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT
      )
    `);

    // 13. Live Streams table
    db.run(`
      CREATE TABLE IF NOT EXISTS live_streams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        youtube_url TEXT,
        scheduled_time TEXT,
        is_live INTEGER DEFAULT 0,
        banner_text TEXT,
        countdown_duration INTEGER, -- minutes
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 14. Announcements table
    db.run(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT
      )
    `);

    // 15. Audit Logs table (Audit Trails)
    db.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        username TEXT,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    seedData();
  });
}

function seedData() {
  // Check if roles are already seeded
  db.get("SELECT COUNT(*) as count FROM roles", (err, row) => {
    if (err || (row && row.count > 0)) return;

    console.log("Seeding initial database configurations...");

    db.serialize(() => {
      // Seed Roles with explicit IDs
      const roles = [
        { id: 1, name: 'Super Admin', description: 'Full website control and system administrator' },
        { id: 2, name: 'Pastor', description: 'Ministry leaders with content and family permissions' },
        { id: 3, name: 'Member', description: 'General church covenant members' },
        { id: 4, name: 'Worship Leader', description: 'Custom role - manages worship songs and lyrics' }
      ];

      const stmtRole = db.prepare("INSERT INTO roles (id, name, description) VALUES (?, ?, ?)");
      roles.forEach(r => stmtRole.run(r.id, r.name, r.description));
      stmtRole.finalize();

      // Seed Permissions with explicit IDs
      const permissions = [
        { id: 1, code: 'full_control', name: 'Full Control', description: 'Full access to edit settings, roles, delete data' },
        { id: 2, code: 'manage_users', name: 'Manage Users', description: 'Create, edit, block users' },
        { id: 3, code: 'manage_roles', name: 'Manage Roles', description: 'Create and edit permissions for roles' },
        { id: 4, code: 'manage_themes', name: 'Manage Themes', description: 'Change global theme' },
        { id: 5, code: 'manage_families', name: 'Manage Families', description: 'Create, update, and search family rosters' },
        { id: 6, code: 'manage_prayers', name: 'Manage Prayers', description: 'Moderate, approve, and track prayer wall' },
        { id: 7, code: 'manage_songs', name: 'Manage Songs', description: 'Add, update songs and lyrics' },
        { id: 8, code: 'manage_bible_verses', name: 'Manage Bible Verses', description: 'Update scripture verses and sermon themes' },
        { id: 9, code: 'manage_events', name: 'Manage Events', description: 'Create and update events' },
        { id: 10, code: 'manage_live_streams', name: 'Manage Live Streams', description: 'Schedule and toggle youtube live settings' },
        { id: 11, code: 'manage_content', name: 'Manage Content', description: 'Manage announcements, gallery, leadership profiles, church info' },
        { id: 12, code: 'manage_schedules', name: 'Manage Schedules', description: 'Update church weekly service timings and calendars' }
      ];

      const stmtPerm = db.prepare("INSERT INTO permissions (id, name, code, description) VALUES (?, ?, ?, ?)");
      permissions.forEach(p => stmtPerm.run(p.id, p.name, p.code, p.description));
      stmtPerm.finalize();

      // Map Permissions to Roles using explicit IDs
      // Super Admin (1) -> Full Control (1)
      db.run("INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 1)");

      // Pastor (2) -> manage_families(5), manage_prayers(6), manage_songs(7), manage_bible_verses(8), manage_events(9), manage_schedules(12)
      db.run("INSERT INTO role_permissions (role_id, permission_id) VALUES (2, 5)");
      db.run("INSERT INTO role_permissions (role_id, permission_id) VALUES (2, 6)");
      db.run("INSERT INTO role_permissions (role_id, permission_id) VALUES (2, 7)");
      db.run("INSERT INTO role_permissions (role_id, permission_id) VALUES (2, 8)");
      db.run("INSERT INTO role_permissions (role_id, permission_id) VALUES (2, 9)");
      db.run("INSERT INTO role_permissions (role_id, permission_id) VALUES (2, 12)");

      // Worship Leader (4) -> manage_songs(7), manage_bible_verses(8)
      db.run("INSERT INTO role_permissions (role_id, permission_id) VALUES (4, 7)");
      db.run("INSERT INTO role_permissions (role_id, permission_id) VALUES (4, 8)");

      // Seed Users
      const salt = bcrypt.genSaltSync(10);
      const superAdminHash = bcrypt.hashSync('Ajay_Badhe_2026!', salt);
      const pastorHash = bcrypt.hashSync('pastorpassword', salt);
      const memberHash = bcrypt.hashSync('memberpassword', salt);

      db.run(`
        INSERT INTO users (username, email, password_hash, mobile, address, role_id)
        VALUES (?, ?, ?, ?, ?, 1)
      `, 'Ajay_Badhe', 'ajay@lifeedifiers.org', superAdminHash, '9989912345', 'Kondapur, Hyderabad');

      db.run(`
        INSERT INTO users (username, email, password_hash, mobile, address, role_id)
        VALUES (?, ?, ?, ?, ?, 2)
      `, 'Pastor_Jonathan', 'pastor@lifeedifiers.org', pastorHash, '9951155663', 'Sanctuary House, Kondapur');

      db.run(`
        INSERT INTO users (username, email, password_hash, mobile, address, role_id)
        VALUES (?, ?, ?, ?, ?, 3)
      `, 'John_Doe', 'member@lifeedifiers.org', memberHash, '9876543210', 'Masjid Banda, Kondapur');

      // Seed default church information
      db.run(`
        INSERT INTO church_info (name, logo_url, vision, text_mission, history, contact_email, contact_phone_1, contact_phone_2, address, service_timings, active_theme)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'dark')
      `,
        'Life Edifiers Church',
        '/logo.png',
        'To see lives fully edified, families strengthened, and communities transformed by the power of the Gospel.',
        'To EVANGELIZE the lost with the good news of salvation, EQUIP believers with biblical truth and leadership skills, and EDIFY one another in love through active fellowship and service.',
        'Founded in Kondapur, Hyderabad, Life Edifiers Church began with a small group of families committed to prayer and Bible study. Today, it stands as a growing, modern sanctuary.',
        'contact@lifeedifierschurch.org',
        '+91 98765 43210',
        '+91 98765 43211',
        'Rajaram Heights, 1st Floor, Masjid Banda Circle, Kondapur, Hyderabad, Telangana, 500084',
        JSON.stringify([
          { id: 1, name: 'Sunday Morning Worship', time: '09:00 AM', location: 'Corporate Sanctuary' },
          { id: 2, name: 'Sunday School', time: '11:00 AM', location: 'Faith Hall' },
          { id: 3, name: 'Mid-Week Bible Study', time: 'Wednesday 07:00 PM', location: 'Zoom / Sanctuary' },
          { id: 4, name: 'Friday Youth Fellowship', time: 'Friday 07:00 PM', location: 'Worship Center' }
        ])
      );

      // Seed default leadership profiles
      db.run(`
        INSERT INTO leadership (name, role, bio, image_url)
        VALUES (?, ?, ?, ?)
      `,
        'Rev. C. Jonathan Edward',
        'Senior Pastor',
        'Rev. C. Jonathan Edward has been leading Life Edifiers Church with a strong passion for expository preaching, prayer, and discipleship. He is committed to equipping believers to live victorious Christian lives.',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'
      );

      db.run(`
        INSERT INTO leadership (name, role, bio, image_url)
        VALUES (?, ?, ?, ?)
      `,
        'Co-Pastor Nirmala Jonathan',
        'Co-Pastor & Women\'s Lead',
        'Co-Pastor Nirmala Jonathan co-pastors the church and leads the Women\'s Fellowship and Family counseling ministries. She dedicates her time to building strong covenant families.',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop'
      );

      // Seed Bible Verses
      const verses = [
        { ref: 'John 15:16', text: 'You did not choose me, but I chose you and appointed you so that you might go and bear fruit—fruit that will last.', theme: 'Vision' },
        { ref: 'Matthew 28:19-20', text: 'Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you.', theme: 'Mission' },
        { ref: 'Ephesians 4:12-13', text: 'To equip his people for works of service, so that the body of Christ may be built up until we all reach unity in the faith.', theme: 'Beliefs' }
      ];
      verses.forEach(v => {
        db.run("INSERT INTO bible_verses (verse_reference, verse_text, theme) VALUES (?, ?, ?)", v.ref, v.text, v.theme);
      });

      // Seed default Live Stream configuration
      db.run(`
        INSERT INTO live_streams (youtube_url, scheduled_time, is_live, banner_text, countdown_duration)
        VALUES (?, ?, 0, ?, 10)
      `, 'https://www.youtube.com/embed/live_stream?channel=UC-XXX', '2026-06-14T09:00:00', 'Sunday Morning Service Starts Soon!');

      // Seed initial Announcements
      db.run(`
        INSERT INTO announcements (title, message, date)
        VALUES (?, ?, ?)
      `, 'Special Worship Night This Friday', 'Join us at 7:00 PM for an extended time of worship and intercessory prayer. Invite friends and family!', '2026-06-09');

      // Seed default Events
      db.run(`
        INSERT INTO events (title, description, category, date, time, location, image_url, registered_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        'Pentecost Worship Night',
        'An evening of immersive worship, deep prayers, and spiritual awakening. Join us as we seek the Holy Spirit.',
        'Worship Nights',
        '2026-06-14',
        '6:30 PM - 9:00 PM',
        'Sanctuary Hall, Kondapur',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&fit=crop',
        42
      );

      console.log("Database seeded successfully.");
    });
  });
}

// Backup function
function backupDb(callback) {
  const backupFolder = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupFolder)) {
    fs.mkdirSync(backupFolder);
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupFolder, `church-backup-${timestamp}.db`);

  fs.copyFile(dbPath, backupPath, (err) => {
    if (err) {
      console.error("Backup failed: ", err);
      callback(err);
    } else {
      console.log(`Database backup created at ${backupPath}`);
      callback(null, backupPath);
    }
  });
}

initDb();

module.exports = {
  db,
  backupDb
};
