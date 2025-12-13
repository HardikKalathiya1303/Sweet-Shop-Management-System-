const { registerUser, loginUser } = require('../services/authService');

const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const result = await registerUser(email, password, role);

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
};

module.exports = { register, login };