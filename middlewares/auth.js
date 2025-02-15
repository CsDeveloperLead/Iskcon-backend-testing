const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const verifyHMAC = async (req, res, next) => {
  const { signature, payload, token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  const user = await Admin.findById(decoded.id)
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }
  req.user = user;

  if (!signature || !payload) {
    return res.status(400).json({ message: 'Missing signature or payload' });
  }

  const hmac = crypto.createHmac('sha256', process.env.HMAC_SECRET).update(payload).digest('hex');

  if (hmac !== signature) {
    return res.status(401).json({ message: 'Invalid HMAC signature' });
  }

  const xyz = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));

  req.body = {
    ...req.body,
    ...xyz
  }
 
  // req.body = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
  next();
};

module.exports = { verifyHMAC };