const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token ||
                  req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token is invalid or expired' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

const vetOrAdmin = (req, res, next) => {
  if (!['admin', 'vet'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Vet or Admin access required' });
  }
  next();
};

module.exports = { auth, adminOnly, vetOrAdmin };