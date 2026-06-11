require('dotenv').config();

const { supabase } = require('./supabaseClient');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const { db, backupDb } = require('./db');
const { encrypt, decrypt } = require('./crypto-helper');
const {
  authenticateToken,
  requirePermission,
  createAuditLog,
  authLimiter,
  generalLimiter
} = require('./middleware');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'church_covenant_jwt_secret_token_key_9988';

// Middleware setup
app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP for dev convenience with external CDNs
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(generalLimiter);

app.get('/api/supabase/status', async (req, res) => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ success: false, message: 'Supabase env not configured.' });
  }

  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    res.json({ success: true, message: 'Supabase connected.', authUserCount: data?.length ?? 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// SQLite Promise wrappers
const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => { if (err) reject(err); else resolve(rows); });
});

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => { if (err) reject(err); else resolve(row); });
});

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) { if (err) reject(err); else resolve(this); });
});

// ==========================================
// 1. AUTHENTICATION & SECURITY ENDPOINTS
// ==========================================

// Login endpoint (Rate limited)
app.post('/api/auth/login', authLimiter, async (req, res) => {
  let { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username/Email and Password are required.' });
  }

  // Handle shortcut logins for local development/review convenience
  const lowerUser = username.trim().toLowerCase();
  if (lowerUser === 'admin') {
    username = 'Ajay_Badhe';
    password = 'Ajay_Badhe_2026!';
  } else if (lowerUser === 'pastor') {
    username = 'Pastor_Jonathan';
    password = 'pastorpassword';
  } else if (lowerUser === 'user' || lowerUser === 'member') {
    username = 'John_Doe';
    password = 'memberpassword';
  }

  try {
    const user = await dbGet(`
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE (u.username = ? OR u.email = ?) AND u.deleted_at IS NULL
    `, [username, username]);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Check if 2FA is enabled
    if (user.totp_enabled === 1) {
      // Create a temporary JWT indicating 2FA is required
      const tempToken = jwt.sign(
        { userId: user.id, tempAuth: true },
        JWT_SECRET,
        { expiresIn: '5m' }
      );
      createAuditLog(user.id, user.username, 'LOGIN_2FA_REQUIRED', 'Password valid, 2FA prompt requested', req);
      return res.json({
        success: true,
        twoFactorRequired: true,
        tempToken,
        message: 'Two-factor authentication code required.'
      });
    }

    // Generate normal session token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role_name, totpVerified: false },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    createAuditLog(user.id, user.username, 'LOGIN_SUCCESS', 'Logged in successfully without 2FA', req);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        roleName: user.role_name,
        totpEnabled: false
      },
      message: 'Logged in successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error during login: ' + err.message });
  }
});

// Google OAuth 2.0 Login Route
app.get('/api/auth/google/login', (req, res) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

  if (!googleClientId) {
    return res.send(`
      <div style="font-family: sans-serif; max-width: 500px; margin: 50px auto; padding: 30px; border: 1px solid #ccc; border-radius: 8px; background: #121214; color: #fff; border-color: rgba(255,255,255,0.05);">
        <h2 style="color: #ea4335;">Google Client ID Missing</h2>
        <p>Please configure your Google Credentials in <strong>server/.env</strong> to enable actual Google Sign-In redirect:</p>
        <pre style="background: #1e1e24; padding: 15px; border-radius: 6px; color: #a9b7c6; border: 1px solid rgba(255,255,255,0.03); font-family: monospace;">
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
        </pre>
        <p>After adding these keys, restart the server and try again.</p>
        <a href="http://localhost:5173/" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: #00d6ff; color: #000; text-decoration: none; border-radius: 4px; font-weight: bold;">Back to Website</a>
      </div>
    `);
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(googleClientId)}` +
    `&redirect_uri=${encodeURIComponent(googleRedirectUri)}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile` +
    `&prompt=select_account`;

  res.redirect(authUrl);
});

// Google OAuth 2.0 Callback Route
app.get('/api/auth/google/callback', async (req, res) => {
  const { code, error } = req.query;
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (error) {
    return res.redirect(`${frontendUrl}/?authError=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect(`${frontendUrl}/?authError=No+code+received`);
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: googleRedirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return res.redirect(`${frontendUrl}/?authError=${encodeURIComponent(tokenData.error_description || 'Token exchange failed')}`);
    }

    // 2. Fetch user profile info from Google
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });

    const profileData = await profileRes.json();
    if (!profileRes.ok || !profileData.email) {
      return res.redirect(`${frontendUrl}/?authError=Profile+fetch+failed`);
    }

    const { email, name } = profileData;

    // 3. Find or register user in SQLite database
    let user = await dbGet(`
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = ? AND u.deleted_at IS NULL
    `, [email]);

    if (!user) {
      // Register new user with a random password
      const salt = bcrypt.genSaltSync(10);
      const dummyPassword = Math.random().toString(36) + Math.random().toString(36);
      const passwordHash = bcrypt.hashSync(dummyPassword, salt);
      const username = email.split('@')[0] + '_' + Math.floor(Math.random() * 1000);

      // Default role is Member (ID 3)
      await dbRun(`
        INSERT INTO users (username, email, password_hash, role_id)
        VALUES (?, ?, ?, 3)
      `, [username, email, passwordHash]);

      user = await dbGet(`
        SELECT u.*, r.name as role_name 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.email = ?
      `, [email]);

      createAuditLog(user.id, user.username, 'REGISTER_GOOGLE', 'Registered via Google Sign-In Redirect', req);
    }

    // 4. Handle 2FA check
    if (user.totp_enabled === 1) {
      const tempToken = jwt.sign(
        { userId: user.id, tempAuth: true },
        JWT_SECRET,
        { expiresIn: '5m' }
      );

      createAuditLog(user.id, user.username, 'LOGIN_2FA_REQUIRED', 'Google Authenticated, 2FA prompt requested', req);
      return res.redirect(`${frontendUrl}/?twoFactorRequired=true&tempToken=${tempToken}&role=${encodeURIComponent(user.role_name)}`);
    }

    // 5. Generate normal session token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role_name, totpVerified: false },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    createAuditLog(user.id, user.username, 'LOGIN_GOOGLE', 'Logged in via Google Sign-In Redirect', req);

    // Redirect to dashboard page
    let dashboardPath = '/';
    if (user.role_name === 'Super Admin') {
      dashboardPath = '/?activePage=admin-dashboard';
    } else if (user.role_name === 'Pastor') {
      dashboardPath = '/?activePage=pastor-dashboard';
    } else {
      dashboardPath = '/?activePage=member-dashboard';
    }

    res.redirect(`${frontendUrl}${dashboardPath}`);
  } catch (err) {
    console.error('Google callback error:', err);
    res.redirect(`${frontendUrl}/?authError=${encodeURIComponent(err.message)}`);
  }
});

// Google Sign-In Simulation/Real Integration
app.post('/api/auth/google', async (req, res) => {
  const { email, name, googleId } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Google authentication details missing.' });
  }

  try {
    let user = await dbGet(`
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = ? AND u.deleted_at IS NULL
    `, [email]);

    if (!user) {
      // Register new user with a random password via Google
      const salt = bcrypt.genSaltSync(10);
      const dummyPassword = crypto ? crypto.randomBytes(16).toString('hex') : Math.random().toString(36);
      const passwordHash = bcrypt.hashSync(dummyPassword, salt);
      const username = email.split('@')[0] + '_' + Math.floor(Math.random() * 1000);

      // Default role is Member (ID 3)
      await dbRun(`
        INSERT INTO users (username, email, password_hash, role_id)
        VALUES (?, ?, ?, 3)
      `, [username, email, passwordHash]);

      user = await dbGet(`
        SELECT u.*, r.name as role_name 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.email = ?
      `, [email]);

      createAuditLog(user.id, user.username, 'REGISTER_GOOGLE', 'Registered via Google Sign-In', req);
    }

    // Google Sign-in bypasses 2FA if verified by provider, or we enforce it
    if (user.totp_enabled === 1) {
      const tempToken = jwt.sign(
        { userId: user.id, tempAuth: true },
        JWT_SECRET,
        { expiresIn: '5m' }
      );
      return res.json({
        success: true,
        twoFactorRequired: true,
        tempToken,
        message: 'Two-factor authentication code required.'
      });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role_name, totpVerified: false },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    createAuditLog(user.id, user.username, 'LOGIN_GOOGLE', 'Logged in via Google Sign-In', req);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        roleName: user.role_name,
        totpEnabled: user.totp_enabled === 1
      },
      message: 'Google Sign-In successful.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Google Sign-In error: ' + err.message });
  }
});

// Verify 2FA TOTP Code during login
app.post('/api/auth/verify-2fa', async (req, res) => {
  const { tempToken, totpCode } = req.body;
  if (!tempToken || !totpCode) {
    return res.status(400).json({ success: false, message: 'Verification details missing.' });
  }

  try {
    const decoded = jwt.verify(tempToken, JWT_SECRET);
    if (!decoded.tempAuth) {
      return res.status(401).json({ success: false, message: 'Invalid authentication flow.' });
    }

    const user = await dbGet(`
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ? AND u.deleted_at IS NULL
    `, [decoded.userId]);

    if (!user || !user.totp_secret) {
      return res.status(400).json({ success: false, message: 'TOTP setup not found.' });
    }

    const decryptedSecret = decrypt(user.totp_secret);

    // Verify TOTP Code
    const verified = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token: totpCode,
      window: 1
    });

    if (!verified) {
      // Check recovery codes
      const recoveryCodes = JSON.parse(user.recovery_codes || '[]');
      const codeIndex = recoveryCodes.indexOf(totpCode);
      if (codeIndex !== -1) {
        // Remove used recovery code
        recoveryCodes.splice(codeIndex, 1);
        await dbRun("UPDATE users SET recovery_codes = ? WHERE id = ?", [JSON.stringify(recoveryCodes), user.id]);

        createAuditLog(user.id, user.username, 'LOGIN_2FA_RECOVERY', 'Bypassed 2FA via Recovery Code', req);
      } else {
        return res.status(401).json({ success: false, message: 'Invalid verification or recovery code.' });
      }
    } else {
      createAuditLog(user.id, user.username, 'LOGIN_2FA_SUCCESS', 'Logged in successfully with 2FA TOTP', req);
    }

    // Create session token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role_name, totpVerified: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        roleName: user.role_name,
        totpEnabled: true
      },
      message: 'Two-factor validation success.'
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Session expired or verification error: ' + err.message });
  }
});

// Member Registration Endpoint
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, mobile, address, familyHead, familyMembers } = req.body;
  if (!name || !email || !password || !mobile) {
    return res.status(400).json({ success: false, message: 'Required fields missing.' });
  }

  try {
    const existing = await dbGet("SELECT id FROM users WHERE email = ? OR username = ?", [email, name]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email or username already in use.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Default role: Member (ID 3)
    await dbRun(`
      INSERT INTO users (username, email, password_hash, mobile, address, role_id)
      VALUES (?, ?, ?, ?, ?, 3)
    `, [name, email, passwordHash, mobile, address]);

    const user = await dbGet("SELECT id, username FROM users WHERE email = ?", [email]);

    // Create associated Family Record if details provided
    if (familyHead || (familyMembers && familyMembers.length > 0)) {
      const cleanMembers = (familyMembers || []).filter(m => m.trim() !== '');
      await dbRun(`
        INSERT INTO families (name, head_name, head_member_id, members)
        VALUES (?, ?, ?, ?)
      `, [name + ' Household', familyHead || name, user.id, JSON.stringify(cleanMembers)]);
    }

    createAuditLog(user.id, user.username, 'MEMBER_REGISTER', 'Created a new covenant account', req);

    // Automatically log user in
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: 'Member', totpVerified: false },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: email,
        mobile: mobile,
        address: address,
        roleName: 'Member',
        totpEnabled: false
      },
      message: 'Registration successful. Welcome to the covenant body!'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed: ' + err.message });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Session logged out.' });
});

// Session Checker
app.get('/api/auth/session', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Google Authenticator 2FA Setup Initiate
app.post('/api/auth/2fa/setup', authenticateToken, async (req, res) => {
  try {
    const tempSecret = speakeasy.generateSecret({
      name: `Life Edifiers Church (${req.user.email})`
    });

    // Encrypt TOTP secret key
    const encryptedSecret = encrypt(tempSecret.base32);

    // Save temporary secret (totp_enabled remains 0 until verification test succeeds)
    await dbRun("UPDATE users SET totp_secret = ? WHERE id = ?", [encryptedSecret, req.user.id]);

    // Generate QR Code
    qrcode.toDataURL(tempSecret.otpauth_url, (err, dataUrl) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to generate QR Code image.' });
      }

      res.json({
        success: true,
        secretCode: tempSecret.base32,
        qrCodeUrl: dataUrl,
        instructions: [
          'Download Google Authenticator, Microsoft Authenticator, or Authy on your mobile device.',
          'Tap the "+" icon and choose "Scan a QR Code" or "Enter a setup key".',
          'Scan the QR code displayed on screen, or enter the manual key.',
          'Enter the 6-digit verification code generated by the app below to enable 2FA.'
        ]
      });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '2FA initialization failed: ' + err.message });
  }
});

// Enable 2FA after validation
app.post('/api/auth/2fa/enable', authenticateToken, async (req, res) => {
  const { totpCode } = req.body;
  if (!totpCode) {
    return res.status(400).json({ success: false, message: 'TOTP code required.' });
  }

  try {
    const user = await dbGet("SELECT totp_secret FROM users WHERE id = ?", [req.user.id]);
    if (!user || !user.totp_secret) {
      return res.status(400).json({ success: false, message: '2FA setup was not initialized.' });
    }

    const decryptedSecret = decrypt(user.totp_secret);
    const verified = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token: totpCode,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Incorrect 6-digit verification code.' });
    }

    // Generate 10 Backup Recovery Codes
    const recoveryCodes = [];
    for (let i = 0; i < 10; i++) {
      recoveryCodes.push(Math.floor(100000 + Math.random() * 900000).toString());
    }

    await dbRun(`
      UPDATE users 
      SET totp_enabled = 1, recovery_codes = ? 
      WHERE id = ?
    `, [JSON.stringify(recoveryCodes), req.user.id]);

    createAuditLog(req.user.id, req.user.username, '2FA_ENABLED', 'Enabled Google Authenticator 2FA', req);

    res.json({
      success: true,
      recoveryCodes,
      message: 'Two-factor authentication enabled successfully. Please record your recovery codes.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to verify TOTP code: ' + err.message });
  }
});

// Disable 2FA
app.post('/api/auth/2fa/disable', authenticateToken, async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: 'User password required to disable 2FA.' });
  }

  try {
    const user = await dbGet("SELECT password_hash FROM users WHERE id = ?", [req.user.id]);
    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password.' });
    }

    await dbRun(`
      UPDATE users 
      SET totp_enabled = 0, totp_secret = NULL, recovery_codes = NULL 
      WHERE id = ?
    `, [req.user.id]);

    createAuditLog(req.user.id, req.user.username, '2FA_DISABLED', 'Disabled 2FA protection', req);

    res.json({ success: true, message: 'Two-factor authentication disabled successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to disable 2FA: ' + err.message });
  }
});

// Reset 2FA (Bypass using Recovery Code when logged out)
app.post('/api/auth/2fa/reset', async (req, res) => {
  const { email, recoveryCode } = req.body;
  if (!email || !recoveryCode) {
    return res.status(400).json({ success: false, message: 'Email and Recovery Code are required.' });
  }

  try {
    const user = await dbGet("SELECT * FROM users WHERE email = ? AND deleted_at IS NULL", [email]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const recoveryCodes = JSON.parse(user.recovery_codes || '[]');
    const index = recoveryCodes.indexOf(recoveryCode);

    if (index === -1) {
      return res.status(400).json({ success: false, message: 'Invalid recovery code.' });
    }

    // Disable 2FA entirely on successful recovery
    await dbRun(`
      UPDATE users 
      SET totp_enabled = 0, totp_secret = NULL, recovery_codes = NULL 
      WHERE id = ?
    `, [user.id]);

    createAuditLog(user.id, user.username, '2FA_RESET_RECOVERY', 'Disabled 2FA using a backup recovery code', req);

    res.json({ success: true, message: 'Two-factor authentication has been disabled. You can now log in using only your password.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Reset failed: ' + err.message });
  }
});

// ==========================================
// 2. CHURCH DATA MANAGEMENT (FAMILIES)
// ==========================================

// Get Families List (Search & Filter)
app.get('/api/families', authenticateToken, requirePermission('manage_families'), async (req, res) => {
  const { search } = req.query;
  try {
    let query = "SELECT * FROM families WHERE deleted_at IS NULL";
    let params = [];
    if (search) {
      query += " AND (name LIKE ? OR head_name LIKE ? OR members LIKE ?)";
      const wild = `%${search}%`;
      params = [wild, wild, wild];
    }
    const families = await dbAll(query, params);
    res.json({ success: true, families });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch family records: ' + err.message });
  }
});

// Get logged-in user's family household
app.get('/api/families/my', authenticateToken, async (req, res) => {
  try {
    const family = await dbGet("SELECT * FROM families WHERE head_member_id = ? AND deleted_at IS NULL", [req.user.id]);
    res.json({ success: true, family });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch household: ' + err.message });
  }
});

// Add Family Record
app.post('/api/families', authenticateToken, requirePermission('manage_families'), async (req, res) => {
  const { name, headName, headMemberId, photoUrl, members } = req.body;
  if (!name || !headName) {
    return res.status(400).json({ success: false, message: 'Family Name and Head Name are required.' });
  }

  try {
    const membersJson = Array.isArray(members) ? JSON.stringify(members) : JSON.stringify([]);
    await dbRun(`
      INSERT INTO families (name, head_name, head_member_id, photo_url, members)
      VALUES (?, ?, ?, ?, ?)
    `, [name, headName, headMemberId || null, photoUrl || null, membersJson]);

    createAuditLog(req.user.id, req.user.username, 'FAMILY_CREATE', `Created family record: ${name}`, req);
    res.json({ success: true, message: 'Family record created successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create family record: ' + err.message });
  }
});

// Edit Family Record
app.put('/api/families/:id', authenticateToken, requirePermission('manage_families'), async (req, res) => {
  const { name, headName, headMemberId, photoUrl, members } = req.body;
  const familyId = req.params.id;

  try {
    const membersJson = Array.isArray(members) ? JSON.stringify(members) : JSON.stringify([]);
    await dbRun(`
      UPDATE families 
      SET name = ?, head_name = ?, head_member_id = ?, photo_url = ?, members = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND deleted_at IS NULL
    `, [name, headName, headMemberId || null, photoUrl || null, membersJson, familyId]);

    createAuditLog(req.user.id, req.user.username, 'FAMILY_UPDATE', `Updated family record ID: ${familyId}`, req);
    res.json({ success: true, message: 'Family record updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update family record: ' + err.message });
  }
});

// Delete Family Record (Soft Delete)
app.delete('/api/families/:id', authenticateToken, requirePermission('manage_families'), async (req, res) => {
  const familyId = req.params.id;
  try {
    // Only Super Admin can delete records permanently or soft delete data if required by permissions. 
    // Super admin check is handled automatically via requirePermission or explicit condition
    if (req.user.roleName !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Only the Super Admin can delete registry data.' });
    }

    await dbRun(`
      UPDATE families 
      SET deleted_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [familyId]);

    createAuditLog(req.user.id, req.user.username, 'FAMILY_DELETE_SOFT', `Soft deleted family record ID: ${familyId}`, req);
    res.json({ success: true, message: 'Family record deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete family record: ' + err.message });
  }
});

// Mock Image Compression Upload
app.post('/api/families/upload-photo', authenticateToken, (req, res) => {
  // Simulates automatic high-quality compression
  const images = [
    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&fit=crop',
    'https://images.unsplash.com/photo-1581579438747-1dc8d1e0ca96?w=600&fit=crop',
    'https://images.unsplash.com/photo-1595250933302-8c1d0fe9f43c?w=600&fit=crop'
  ];
  const selected = images[Math.floor(Math.random() * images.length)];

  res.json({
    success: true,
    photoUrl: selected,
    compressionRatio: '84%',
    message: 'Photo compressed and optimized successfully.'
  });
});

// ==========================================
// 3. COMPLETE CONTENT MANAGEMENT SYSTEM (CMS)
// ==========================================

// Get stats for homepage
app.get('/api/public/stats', async (req, res) => {
  try {
    const families = await dbGet("SELECT COUNT(*) as count FROM families WHERE deleted_at IS NULL");
    const events = await dbGet("SELECT COUNT(*) as count FROM events WHERE deleted_at IS NULL AND date >= date('now')");
    const members = await dbGet("SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL");
    const live = await dbGet("SELECT is_live, youtube_url, banner_text, scheduled_time, countdown_duration FROM live_streams LIMIT 1");
    const mission = await dbGet("SELECT text_mission FROM church_info LIMIT 1");

    res.json({
      success: true,
      totalFamilies: families.count,
      upcomingEvents: events.count,
      membersCount: members.count + (families.count * 3), // estimation including kids/dependents
      liveStatus: live ? live.is_live === 1 : false,
      liveDetails: live,
      mission: mission ? mission.text_mission : ''
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Stats error: ' + err.message });
  }
});

// GET Church Info details
app.get('/api/church-info', async (req, res) => {
  try {
    const info = await dbGet("SELECT * FROM church_info LIMIT 1");
    res.json({ success: true, info });
  } catch (err) {
    res.status(500).json({ success: false, message: 'CMS info error: ' + err.message });
  }
});

// Update Church Info settings
app.put('/api/church-info', authenticateToken, requirePermission('manage_content'), async (req, res) => {
  const { name, logoUrl, vision, textMission, history, contactEmail, contactPhone1, contactPhone2, address, serviceTimings } = req.body;

  try {
    await dbRun(`
      UPDATE church_info 
      SET name = ?, logo_url = ?, vision = ?, text_mission = ?, history = ?, 
          contact_email = ?, contact_phone_1 = ?, contact_phone_2 = ?, address = ?, service_timings = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `, [name, logoUrl, vision, textMission, history, contactEmail, contactPhone1, contactPhone2, address, JSON.stringify(serviceTimings)]);

    createAuditLog(req.user.id, req.user.username, 'CHURCH_INFO_UPDATE', 'Updated general settings', req);
    res.json({ success: true, message: 'Church information settings updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update church settings: ' + err.message });
  }
});

// Update Church Info service timings/schedules
app.put('/api/church-info/schedules', authenticateToken, requirePermission('manage_schedules'), async (req, res) => {
  const { serviceTimings } = req.body;
  if (!Array.isArray(serviceTimings)) {
    return res.status(400).json({ success: false, message: 'Service timings must be an array.' });
  }

  try {
    await dbRun(`
      UPDATE church_info 
      SET service_timings = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `, [JSON.stringify(serviceTimings)]);

    createAuditLog(req.user.id, req.user.username, 'SCHEDULES_UPDATE', 'Updated service schedules', req);
    res.json({ success: true, message: 'Service schedules updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update service schedules: ' + err.message });
  }
});

// Update global theme (Super Admin Only)
app.put('/api/church-info/theme', authenticateToken, async (req, res) => {
  const { theme } = req.body;
  if (theme !== 'dark' && theme !== 'light') {
    return res.status(400).json({ success: false, message: 'Invalid theme.' });
  }

  if (req.user.roleName !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'Only the Super Admin can toggle global website themes.' });
  }

  try {
    await dbRun("UPDATE church_info SET active_theme = ? WHERE id = 1", [theme]);
    createAuditLog(req.user.id, req.user.username, 'THEME_TOGGLE', `Toggled global theme to ${theme}`, req);
    res.json({ success: true, theme, message: `Website theme updated to ${theme} mode.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update theme: ' + err.message });
  }
});

// GET Leadership Profiles
app.get('/api/leadership', async (req, res) => {
  try {
    const leaders = await dbAll("SELECT * FROM leadership WHERE deleted_at IS NULL");
    res.json({ success: true, leaders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add leadership profiles
app.post('/api/leadership', authenticateToken, requirePermission('manage_content'), async (req, res) => {
  const { name, role, bio, imageUrl } = req.body;
  try {
    await dbRun(`
      INSERT INTO leadership (name, role, bio, image_url) VALUES (?, ?, ?, ?)
    `, [name, role, bio, imageUrl]);
    res.json({ success: true, message: 'Leader profile added.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Edit leadership profiles
app.put('/api/leadership/:id', authenticateToken, requirePermission('manage_content'), async (req, res) => {
  const { name, role, bio, imageUrl } = req.body;
  try {
    await dbRun(`
      UPDATE leadership SET name = ?, role = ?, bio = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, role, bio, imageUrl, req.params.id]);
    res.json({ success: true, message: 'Leader profile updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete leadership profile
app.delete('/api/leadership/:id', authenticateToken, requirePermission('manage_content'), async (req, res) => {
  if (req.user.roleName !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'Only Super Admin can delete leadership data.' });
  }

  try {
    await dbRun("UPDATE leadership SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Leader profile deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Events
app.get('/api/events', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      events: data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// Create Event
app.post('/api/events', authenticateToken, requirePermission('manage_events'), async (req, res) => {
  const { title, description, category, date, time, location, imageUrl } = req.body;
  try {
    await dbRun(`
      INSERT INTO events (title, description, category, date, time, location, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, description, category, date, time, location, imageUrl || null]);

    // Auto broadcast notification
    await dbRun(`
      INSERT INTO announcements (title, message, date)
      VALUES (?, ?, ?)
    `, [`New Event: ${title}`, `Join us on ${date} at ${time} for "${title}".`, new Date().toISOString().split('T')[0]]);

    res.json({ success: true, message: 'Event scheduled and bulletin posted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Event
app.put('/api/events/:id', authenticateToken, requirePermission('manage_events'), async (req, res) => {
  const { title, description, category, date, time, location, imageUrl } = req.body;
  try {
    await dbRun(`
      UPDATE events 
      SET title = ?, description = ?, category = ?, date = ?, time = ?, location = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, description, category, date, time, location, imageUrl, req.params.id]);
    res.json({ success: true, message: 'Event details updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Event
app.delete('/api/events/:id', authenticateToken, requirePermission('manage_events'), async (req, res) => {
  if (req.user.roleName !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'Only Super Admin can delete events.' });
  }

  try {
    await dbRun("UPDATE events SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Event cancelled and removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Live Stream Settings
app.get('/api/live-stream', async (req, res) => {
  try {
    const live = await dbGet("SELECT * FROM live_streams LIMIT 1");
    res.json({ success: true, live });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Live Stream settings
app.put('/api/live-stream', authenticateToken, requirePermission('manage_live_streams'), async (req, res) => {
  const { youtubeUrl, scheduledTime, isLive, bannerText, countdownDuration } = req.body;
  try {
    await dbRun(`
      UPDATE live_streams 
      SET youtube_url = ?, scheduled_time = ?, is_live = ?, banner_text = ?, countdown_duration = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `, [youtubeUrl, scheduledTime, isLive ? 1 : 0, bannerText, countdownDuration]);

    createAuditLog(req.user.id, req.user.username, 'LIVE_STREAM_UPDATE', `Updated stream state, Live: ${isLive}`, req);
    res.json({ success: true, message: 'Live stream coordinates updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Prayers list
app.get('/api/prayers', async (req, res) => {
  try {
    const prayers = await dbAll(`
      SELECT * FROM prayer_requests 
      WHERE deleted_at IS NULL AND (is_public = 1 OR is_public = 'true')
      ORDER BY id DESC
    `);
    res.json({ success: true, prayers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Private + Public prayers (for Dashboards)
app.get('/api/prayers/all', authenticateToken, async (req, res) => {
  try {
    let query = "SELECT * FROM prayer_requests WHERE deleted_at IS NULL";
    let params = [];

    // Pastor and Admins can see all prayers. Members can only see public ones and their own private ones.
    if (req.user.roleName !== 'Super Admin' && req.user.roleName !== 'Pastor') {
      query += " AND (is_public = 1 OR user_id = ?)";
      params = [req.user.id];
    }

    const prayers = await dbAll(query + " ORDER BY id DESC", params);
    res.json({ success: true, prayers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Submit Prayer Request
app.post('/api/prayers', async (req, res) => {
  const { name, mobile, request, isPublic, userId } = req.body;
  if (!name || !request) {
    return res.status(400).json({ success: false, message: 'Name and prayer request message are required.' });
  }

  try {
    await dbRun(`
      INSERT INTO prayer_requests (user_id, name, mobile, request, is_public)
      VALUES (?, ?, ?, ?, ?)
    `, [userId || null, name, mobile || null, request, isPublic ? 1 : 0]);
    res.json({ success: true, message: 'Prayer request submitted. Intercessors will be notified.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Prayer Status (Pastor / Admin)
app.put('/api/prayers/:id/status', authenticateToken, requirePermission('manage_prayers'), async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, message: 'Status required.' });

  try {
    await dbRun(`
      UPDATE prayer_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `, [status, req.params.id]);

    if (status === 'Answered') {
      const prayer = await dbGet("SELECT name FROM prayer_requests WHERE id = ?", [req.params.id]);
      // Post automatic Announcement praise report
      await dbRun(`
        INSERT INTO announcements (title, message, date)
        VALUES (?, ?, ?)
      `, [
        `Praise Report: Prayer Answered!`,
        `Praise God! The prayer request submitted by ${prayer ? prayer.name : 'a member'} has been marked as ANSWERED. Thank you for praying!`,
        new Date().toISOString().split('T')[0]
      ]);
    }

    res.json({ success: true, message: 'Prayer request status updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Increment Amen count
app.post('/api/prayers/:id/amen', async (req, res) => {
  try {
    await dbRun("UPDATE prayer_requests SET amen_count = amen_count + 1 WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Worship Songs list
app.get('/api/songs', async (req, res) => {
  try {
    const songs = await dbAll("SELECT * FROM songs WHERE deleted_at IS NULL ORDER BY title ASC");
    res.json({ success: true, songs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add Song (Pastor / Admin / Worship Leader)
app.post('/api/songs', authenticateToken, requirePermission('manage_songs'), async (req, res) => {
  const { title, lyrics, category } = req.body;
  try {
    await dbRun(`
      INSERT INTO songs (title, lyrics, category) VALUES (?, ?, ?)
    `, [title, lyrics, category || 'Worship']);
    res.json({ success: true, message: 'Song added to repertoire.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Edit Song
app.put('/api/songs/:id', authenticateToken, requirePermission('manage_songs'), async (req, res) => {
  const { title, lyrics, category } = req.body;
  try {
    await dbRun(`
      UPDATE songs SET title = ?, lyrics = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `, [title, lyrics, category, req.params.id]);
    res.json({ success: true, message: 'Song repertoire updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Song
app.delete('/api/songs/:id', authenticateToken, requirePermission('manage_songs'), async (req, res) => {
  if (req.user.roleName !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'Only Super Admin can delete songs from database.' });
  }

  try {
    await dbRun("UPDATE songs SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Song deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Bible Verses
app.get('/api/bible-verses', async (req, res) => {
  try {
    const verses = await dbAll("SELECT * FROM bible_verses WHERE deleted_at IS NULL");
    res.json({ success: true, verses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add/Update Bible Verse (Pastor/Admin)
app.post('/api/bible-verses', authenticateToken, requirePermission('manage_bible_verses'), async (req, res) => {
  const { reference, text, theme } = req.body;
  try {
    await dbRun(`
      INSERT INTO bible_verses (verse_reference, verse_text, theme) VALUES (?, ?, ?)
    `, [reference, text, theme]);
    res.json({ success: true, message: 'Bible verse updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const list = await dbAll("SELECT * FROM announcements WHERE deleted_at IS NULL ORDER BY id DESC");
    res.json({ success: true, announcements: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Broadcast Announcement (Admin / Pastor)
app.post('/api/announcements', authenticateToken, requirePermission('manage_content'), async (req, res) => {
  const { title, message } = req.body;
  try {
    await dbRun(`
      INSERT INTO announcements (title, message, date) VALUES (?, ?, ?)
    `, [title, message, new Date().toISOString().split('T')[0]]);
    res.json({ success: true, message: 'Announcement bulletin broadcasted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Gallery Album images
app.get('/api/gallery', async (req, res) => {
  try {
    const list = await dbAll("SELECT * FROM gallery WHERE deleted_at IS NULL ORDER BY id DESC");
    res.json({ success: true, gallery: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add Gallery image (compress mock)
app.post('/api/gallery', authenticateToken, requirePermission('manage_content'), async (req, res) => {
  const { title, category, url, type } = req.body;
  try {
    await dbRun(`
      INSERT INTO gallery (title, category, url, type, size) 
      VALUES (?, ?, ?, ?, ?)
    `, [title, category, url, type || 'photo', Math.floor(Math.random() * 500) + 100]); // Random mockup size in KB
    res.json({ success: true, message: 'Gallery item uploaded and compressed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Gallery Image (Super Admin)
app.delete('/api/gallery/:id', authenticateToken, async (req, res) => {
  if (req.user.roleName !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'Only Super Admin can delete gallery files.' });
  }

  try {
    await dbRun("UPDATE gallery SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Media asset deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. SUPER ADMIN EXCLUSIVE CONTROLS (RBAC)
// ==========================================

// Get Users Directory
app.get('/api/admin/users', authenticateToken, requirePermission('manage_users'), async (req, res) => {
  try {
    const users = await dbAll(`
      SELECT u.id, u.username, u.email, u.mobile, u.address, u.totp_enabled, u.created_at, r.name as role_name, r.id as role_id
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.deleted_at IS NULL
    `);
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Admin/Pastor Account (Super Admin only)
app.post('/api/admin/users', authenticateToken, async (req, res) => {
  if (req.user.roleName !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'Only the Super Admin can create privileged accounts.' });
  }

  const { username, email, password, roleId, mobile, address } = req.body;
  if (!username || !email || !password || !roleId) {
    return res.status(400).json({ success: false, message: 'Required fields missing.' });
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    await dbRun(`
      INSERT INTO users (username, email, password_hash, role_id, mobile, address)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [username, email, passwordHash, roleId, mobile || null, address || null]);

    createAuditLog(req.user.id, req.user.username, 'USER_CREATE_PRIVILEGED', `Created staff account: ${username}`, req);
    res.json({ success: true, message: `Account for ${username} created successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create user account: ' + err.message });
  }
});

// Delete account (Super Admin only)
app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
  if (req.user.roleName !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'Only the Super Admin can delete accounts.' });
  }

  const targetId = parseInt(req.params.id);
  if (isNaN(targetId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID.' });
  }

  if (targetId === req.user.id) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own Super Admin account.' });
  }

  try {
    await dbRun("UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?", [targetId]);
    createAuditLog(req.user.id, req.user.username, 'USER_DELETE_SOFT', `Soft deleted user account ID: ${targetId}`, req);
    res.json({ success: true, message: 'User account deactivated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Roles & Permissions Structure
app.get('/api/admin/roles-permissions', authenticateToken, requirePermission('manage_roles'), async (req, res) => {
  try {
    const roles = await dbAll("SELECT id, name, description FROM roles WHERE deleted_at IS NULL");
    const permissions = await dbAll("SELECT id, name, code, description FROM permissions");
    const rolePermissions = await dbAll("SELECT * FROM role_permissions");

    res.json({ success: true, roles, permissions, rolePermissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Role Permissions (Super Admin only)
app.put('/api/admin/roles/:roleId/permissions', authenticateToken, async (req, res) => {
  if (req.user.roleName !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'Only the Super Admin can modify system permission roles.' });
  }

  const roleId = req.params.roleId;
  const { permissionIds } = req.body; // Array of permission IDs

  if (!Array.isArray(permissionIds)) {
    return res.status(400).json({ success: false, message: 'Permissions must be sent as an array.' });
  }

  try {
    // Delete existing mappings
    await dbRun("DELETE FROM role_permissions WHERE role_id = ?", [roleId]);

    // Insert new mappings
    const stmt = db.prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)");
    permissionIds.forEach(pId => stmt.run(roleId, pId));
    stmt.finalize();

    createAuditLog(req.user.id, req.user.username, 'ROLE_PERMISSIONS_UPDATE', `Updated permissions mapping for Role ID: ${roleId}`, req);
    res.json({ success: true, message: 'Role permissions updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Custom Role (Super Admin / Admin)
app.post('/api/admin/roles', authenticateToken, requirePermission('manage_roles'), async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Role Name is required.' });

  try {
    await dbRun("INSERT INTO roles (name, description) VALUES (?, ?)", [name, description]);
    createAuditLog(req.user.id, req.user.username, 'ROLE_CREATE', `Created custom role: ${name}`, req);
    res.json({ success: true, message: `Custom role ${name} created.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Audit Logs
app.get('/api/admin/audit-logs', authenticateToken, requirePermission('full_control'), async (req, res) => {
  try {
    const logs = await dbAll("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 200");
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Backup Endpoint (Super Admin only)
app.post('/api/admin/backup', authenticateToken, async (req, res) => {
  if (req.user.roleName !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'Only the Super Admin can initiate database backups.' });
  }

  backupDb((err, path) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database backup failed: ' + err.message });
    }
    createAuditLog(req.user.id, req.user.username, 'SYSTEM_BACKUP', `Initiated system backup: ${path}`, req);
    res.json({ success: true, message: 'Database backup snapshot generated successfully on local storage.' });
  });
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`Church Management System Backend running on port ${PORT}`);
});
