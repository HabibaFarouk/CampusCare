const jwt = require('jsonwebtoken');

// Verify JWT and attach payload to req.user
const tokenBlacklist = new Set(); 

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];

        // Check if token was revoked (Logout)
        if (tokenBlacklist.has(token)) {
            return res.status(401).json({ error: 'Token has been revoked. Please login again.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        
        req.user = {
            id: decoded.id || decoded.userId,
            role: String(decoded.role || 'USER').toUpperCase()
        };

        next();
    } catch (err) {
        const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
        return res.status(401).json({ error: message });
    }
};
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