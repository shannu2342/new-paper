const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) =>
  jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '12h'
  });

const seedAdmin = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  const existing = await User.findOne({});
  if (existing) {
    return res.status(400).json({ message: 'Admin already exists' });
  }
  const allowedRoles = ['editor', 'publisher', 'admin', 'super_admin'];
  const normalizedRole = allowedRoles.includes(role) ? role : 'super_admin';
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, passwordHash, role: normalizedRole });
  const token = signToken(user);
  return res.json({ token, user: { username: user.username, role: user.role } });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = signToken(user);
  return res.json({ token, user: { username: user.username, role: user.role } });
};

const me = async (req, res) => {
  const user = await User.findById(req.user.id).select('username role');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  return res.json(user);
};

module.exports = { seedAdmin, login, me };
