const jwt = require('jsonwebtoken');

// Verify JWT and attach payload to req.user
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'JWT secret not configured' });

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Expecting token payload to contain user id and role
    if (!payload || (!payload.id && !payload.userId)) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    // Normalize id and role onto req.user
    req.user = {
      id: payload.id || payload.userId,
      role: payload.role || payload.user_role || payload.userRole,
      ...payload
    };

    next();
  } catch (err) {
    next(err);
  }
}

// authorize accepts allowed roles, e.g. authorize('WORKER','ADMIN')
function authorize(...allowedRoles) {
  const normalized = allowedRoles.map(r => String(r).toUpperCase());

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const userRole = String(req.user.role).toUpperCase();
    if (!normalized.includes(userRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

module.exports = { authenticate, authorize };