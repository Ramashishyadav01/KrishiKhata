const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id, role) => {
  return jwt.sign({ id, userId: id, role }, process.env.JWT_SECRET || 'khetkhata_super_secret_jwt_key_2026_farm_management', {
    expiresIn: '30d',
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, mobile, password, confirmPassword } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide full name' });
    }

    const cleanMobile = mobile ? mobile.toString().trim() : '';
    if (!cleanMobile || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      return res.status(400).json({ success: false, message: 'Invalid mobile number. Must be a 10-digit Indian mobile number.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ mobile: cleanMobile });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Mobile number already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Public registration ALWAYS assigns Operator ('operator') role for security
    // req.body.role is explicitly ignored
    const user = await User.create({
      name: name.trim(),
      mobile: cleanMobile,
      password: hashedPassword,
      role: 'operator',
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ success: false, message: 'Please provide mobile number and password' });
    }

    const cleanMobile = mobile.toString().trim();
    const user = await User.findOne({ mobile: cleanMobile });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid mobile number or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid mobile number or password' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'User account is inactive. Please contact admin.' });
    }

    res.json({
      success: true,
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, mobile, email, password, role } = req.body;
    
    // If requesting admin role, check if an admin already exists
    if (role === 'admin') {
      const adminExists = await User.exists({ role: 'admin' });
      if (adminExists) {
        return res.status(403).json({
          success: false,
          message: 'Only one Admin account is allowed in KrishiKhata.',
        });
      }
    }

    const existing = await User.findOne({ mobile });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this mobile already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default to operator for newly created users
    const userRole = role === 'admin' ? 'admin' : 'operator';

    const user = await User.create({
      name: name ? name.trim() : '',
      mobile: mobile ? mobile.toString().trim() : '',
      email: email ? email.trim() : undefined,
      password: hashedPassword,
      role: userRole,
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.message && error.message.includes('Only one Admin account is allowed')) {
      return res.status(403).json({ success: false, message: 'Only one Admin account is allowed in KrishiKhata.' });
    }
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (targetUser.role === 'admin' && status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'The Admin account cannot be deactivated.',
      });
    }

    targetUser.status = status;
    await targetUser.save();

    res.json({
      success: true,
      user: {
        id: targetUser._id,
        name: targetUser.name,
        mobile: targetUser.mobile,
        email: targetUser.email,
        role: targetUser.role,
        status: targetUser.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (targetUser.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'The Admin account cannot be deleted.',
      });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
