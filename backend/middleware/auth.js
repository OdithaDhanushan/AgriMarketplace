const crypto = require('node:crypto');
const User = require('../models/User');

const TOKEN_SECRET = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'production' ? null : crypto.randomBytes(32)
);

const base64UrlEncode = (value) => Buffer.from(value).toString('base64url');
const base64UrlDecode = (value) => Buffer.from(value, 'base64url').toString('utf8');

const signToken = (payload) => {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const claims = base64UrlEncode(JSON.stringify({ ...payload, iat: now, exp: now + 60 * 60 * 24 * 7 }));
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(`${header}.${claims}`).digest('base64url');
  return `${header}.${claims}.${signature}`;
};

const verifyToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', TOKEN_SECRET).update(`${header}.${payload}`).digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))) {
      return null;
    }

    const decoded = JSON.parse(base64UrlDecode(payload));
    if (!decoded.userId || decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};

exports.signToken = signToken;
exports.verifyToken = verifyToken;

exports.requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const payload = verifyToken(match[1]);
  if (!payload) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }

  try {
    const user = await User.findById(payload.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed.' });
  }
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to perform this action.' });
  }

  return next();
};
