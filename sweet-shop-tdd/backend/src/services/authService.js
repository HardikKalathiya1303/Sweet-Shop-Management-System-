const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { generateToken } = require('../utils/tokenGenerator');

const registerUser = async (email, password, role = 'user') => {
  const existingUser = await User.findOne({ email });
  
  if (existingUser) {
    throw new Error('User already exists');
  }

  if (!email || !email.includes('@')) {
    throw new Error('Invalid email format');
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const hashedPassword = await hashPassword(password);

  const user = new User({
    email,
    password: hashedPassword,
    role
  });

  await user.save();

  const token = generateToken(user._id, user.email, user.role);

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role
    }
  };
};

module.exports = { registerUser };