const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { db } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'church_covenant_jwt_secret_token_key_9988';

// Rate limiter for security
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per window
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: { success: false, message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper functions for DB queries
function getUserWithRole(userId) {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT u.*, r.name as role_name 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.id = ? AND u.deleted_at IS NULL
    `, [userId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function getUserPermissions(roleId) {
  return new Promise((resolve, reject) => {
    if (!roleId) return resolve([]);
    db.all(`
      SELECT p.code 
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ?
    `, [roleId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(row => row.code));
    });
  });
}

// Authentication Token Validator Middleware
async function authenticateToken(req, res, next) {
  // Try cookie first, then auth header
  let token = req.cookies ? req.cookies.token : null;
  
  if (!token && req.headers['authorization']) {
    const authHeader = req.headers['authorization'];
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Session expired or not authenticated. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserWithRole(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or account deactivated.' });
    }

    const permissions = await getUserPermissions(user.role_id);

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
      roleId: user.role_id,
      roleName: user.role_name,
      totpEnabled: user.totp_enabled === 1,
      totpVerified: decoded.totpVerified === true,
      permissions: permissions
    };

    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Authentication token is invalid or expired. Please sign in again.' });
  }
}

// Permission checking middleware
function requirePermission(permissionCode) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Authenticated user required.' });
    }

    // Super Admin has automatic full control access bypass
    if (req.user.roleName === 'Super Admin' || req.user.permissions.includes('full_control')) {
      return next();
    }

    // Check specific permission code
    if (req.user.permissions.includes(permissionCode)) {
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      message: `Access denied. You do not have the required permissions (${permissionCode}) to perform this action.` 
    });
  };
}

// System Audit Logger helper
function createAuditLog(userId, username, action, details, req) {
  const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : 'system';
  
  db.run(`
    INSERT INTO audit_logs (user_id, username, action, details, ip_address)
    VALUES (?, ?, ?, ?, ?)
  `, [userId, username, action, details, ipAddress], (err) => {
    if (err) {
      console.error('Failed to write audit log:', err.message);
    }
  });
}

module.exports = {
  authenticateToken,
  requirePermission,
  createAuditLog,
  authLimiter,
  generalLimiter
};
