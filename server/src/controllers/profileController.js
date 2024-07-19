import User from '../models/User.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, shippingAddress } = req.body;
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.shippingAddress = shippingAddress || user.shippingAddress;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
