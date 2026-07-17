import Banner from "../models/Banner.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";

export const addBanner = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    // Required validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Banner title is required",
      });
    }

    // Handle image upload
    let imagePath = null;
    if (req.file) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer, 'banners', 'image');
        imagePath = result.secure_url;
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', uploadError);
        return res.status(500).json({ message: 'Error uploading image to Cloudinary' });
      }
    }

    // Create banner
    const banner = await Banner.create({
      title,
      description,
      image: imagePath,
      status: status || 'active',
    });

    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Add Banner Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getBanners = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    const banners = await Banner.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error("Get Banners Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getBannerCount = async (req, res) => {
  try {
    const count = await Banner.count();
    return res.status(200).json({
      success: true,
      message: "Banner count fetched successfully",
      data: { count },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByPk(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // Image is hosted on Cloudinary, so local deletion is skipped.

    await banner.destroy();

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Delete Banner Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Multer configuration for banner image uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const uploadBannerImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
