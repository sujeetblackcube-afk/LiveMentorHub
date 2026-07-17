import express from "express";
import {
  addBanner,
  getBanners,
  getBannerCount,
  deleteBanner,
  uploadBannerImage
} from "../controllers/bannerController.js";
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Add a new banner
router.post("/", uploadBannerImage.single('image'), addBanner);

// Get all banners
router.get("/", getBanners);

// Get banner count
router.get("/count", getBannerCount);

// Delete a banner
router.delete("/:id", deleteBanner);

export default router;
