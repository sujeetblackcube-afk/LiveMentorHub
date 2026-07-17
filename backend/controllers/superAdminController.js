import  SuperAdmin  from '../models/SuperAdmin.js';
import pkg from 'sequelize';
const { Op } = pkg;
import { uploadBufferToCloudinary } from '../utils/cloudinary.js';

// Get super admin profile
const getProfile = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming middleware sets req.user

    const superAdmin = await SuperAdmin.findByPk(userId, {
      attributes: ['userId', 'name', 'email', 'mobile', 'profileImage', 'address']
    });

    if (!superAdmin) {
      return res.status(404).json({ message: 'Super admin not found' });
    }

    res.status(200).json(superAdmin);
  } catch (error) {
    console.error('Error fetching super admin profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update super admin profile
const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, email, mobile, address } = req.body;

    const superAdmin = await SuperAdmin.findByPk(userId);
    if (!superAdmin) {
      return res.status(404).json({ message: 'Super admin not found' });
    }

    // Update fields
    superAdmin.name = name || superAdmin.name;
    superAdmin.email = email || superAdmin.email;
    superAdmin.mobile = mobile || superAdmin.mobile;
    superAdmin.address = address || superAdmin.address;

    // Handle profile image upload if provided
    if (req.file) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer, 'admin profile', 'image');
        superAdmin.profileImage = result.secure_url;
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', uploadError);
        return res.status(500).json({ message: 'Error uploading image to Cloudinary' });
      }
    }

    await superAdmin.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: {
        userId: superAdmin.userId,
        name: superAdmin.name,
        email: superAdmin.email,
        mobile: superAdmin.mobile,
        profileImage: superAdmin.profileImage,
        address: superAdmin.address
      }
    });
  } catch (error) {
    console.error('Error updating super admin profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export { getProfile, updateProfile };
