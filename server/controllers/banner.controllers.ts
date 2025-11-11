import type { Request, Response } from "express";
import mongoose from "mongoose";
import { BannerModel } from "../models/banner.model";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import type { BannerInput, BannerFilters } from "../types/banner.types";

const bannerModel = new BannerModel();

/**
 * Get active banners for homepage (public endpoint)
 * GET /banner/public
 */
export const getActiveBanners = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const banners = await bannerModel.getActiveBanners();

    res.json({
      banners,
      count: banners.length,
    });
  } catch (error) {
    console.error("Get active banners error:", error);
    res.status(500).json({ message: "Error fetching banners", error });
  }
};

/**
 * Get all banners with optional filters (admin/staff only)
 * GET /banner
 */
export const getBanners = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      isActive,
      search,
      limit: limitParam,
      offset: offsetParam,
    } = req.query;

    const filters: BannerFilters = {};

    if (isActive !== undefined) {
      filters.isActive = isActive === "true";
    }

    if (search && typeof search === "string") {
      filters.search = search;
    }

    if (limitParam) {
      const limit = parseInt(limitParam as string, 10);
      if (!isNaN(limit) && limit > 0) {
        filters.limit = limit;
      }
    }

    if (offsetParam) {
      const offset = parseInt(offsetParam as string, 10);
      if (!isNaN(offset) && offset >= 0) {
        filters.offset = offset;
      }
    }

    const banners = await bannerModel.getAllBanners(filters);

    res.json({
      banners,
      count: banners.length,
    });
  } catch (error) {
    console.error("Get banners error:", error);
    res.status(500).json({ message: "Error fetching banners", error });
  }
};

/**
 * Get banner by ID (admin/staff only)
 * GET /banner/:id
 */
export const getBannerById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Banner ID is required" });
      return;
    }

    const banner = await bannerModel.getBannerById(id);

    if (!banner) {
      res.status(404).json({ message: "Banner not found" });
      return;
    }

    res.json({ banner });
  } catch (error) {
    console.error("Get banner by ID error:", error);
    res.status(500).json({ message: "Error fetching banner", error });
  }
};

/**
 * Create a new banner (admin/staff only)
 * POST /banner
 */
export const createBanner = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const file = req.file as Express.MulterS3.File;

    if (!file) {
      res.status(400).json({
        message: "Image file is required",
      });
      return;
    }

    // Get banner data from request body
    const { title, description, linkUrl, isActive, startDate, endDate } = req.body;

    // Validate required fields
    if (!title) {
      res.status(400).json({
        message: "Title is required",
      });
      return;
    }

    // Validate title length
    if (title.length > 200) {
      res.status(400).json({
        message: "Title must be less than 200 characters",
      });
      return;
    }

    // Validate description length
    if (description && description.length > 500) {
      res.status(400).json({
        message: "Description must be less than 500 characters",
      });
      return;
    }

    // Use AWS S3 file location as imageUrl
    const imageUrl = file.location;

    // Parse isActive from string to boolean
    const bannerIsActive = isActive === "true" || isActive === true;

    // Parse dates if provided
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;
    if (startDate) {
      parsedStartDate = new Date(startDate);
    }
    if (endDate) {
      parsedEndDate = new Date(endDate);
    }

    const bannerData: BannerInput = {
      title,
      description,
      imageUrl,
      linkUrl,
      isActive: bannerIsActive,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
    };

    const newBanner = await bannerModel.createBanner(bannerData);

    res.status(201).json({
      message: "Banner created successfully",
      banner: {
        id: (newBanner._id as mongoose.Types.ObjectId).toString(),
        title: newBanner.title,
        imageUrl: newBanner.imageUrl,
        displayOrder: newBanner.displayOrder,
        isActive: newBanner.isActive,
        createdAt: newBanner.createdAt,
      },
    });
  } catch (error) {
    console.error("Create banner error:", error);
    res.status(500).json({ message: "Error creating banner", error });
  }
};

/**
 * Update banner by ID (admin/staff only)
 * PUT /banner/:id
 */
export const updateBanner = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const file = req.file as Express.MulterS3.File | undefined;

    if (!id) {
      res.status(400).json({ message: "Banner ID is required" });
      return;
    }

    const { title, description, linkUrl, isActive, startDate, endDate } = req.body;

    // Build update data
    const updateData: Partial<BannerInput> = {};

    if (title !== undefined && title !== null && title !== "") {
      // Validate title length
      if (title.length > 200) {
        res.status(400).json({
          message: "Title must be less than 200 characters",
        });
        return;
      }
      updateData.title = title;
    }

    if (description !== undefined) {
      // Validate description length
      if (description && description.length > 500) {
        res.status(400).json({
          message: "Description must be less than 500 characters",
        });
        return;
      }
      updateData.description = description || "";
    }

    if (linkUrl !== undefined) {
      updateData.linkUrl = linkUrl || "";
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive === "true" || isActive === true;
    }

    // If new image is uploaded, use it (file upload is optional for update)
    if (file) {
      updateData.imageUrl = file.location;
    }

    // Parse dates if provided
    if (startDate !== undefined) {
      updateData.startDate = startDate ? new Date(startDate) : undefined;
    }
    if (endDate !== undefined) {
      updateData.endDate = endDate ? new Date(endDate) : undefined;
    }

    const updatedBanner = await bannerModel.updateBanner(id, updateData);

    if (!updatedBanner) {
      res.status(404).json({ message: "Banner not found" });
      return;
    }

    res.json({
      message: "Banner updated successfully",
      banner: updatedBanner,
    });
  } catch (error) {
    console.error("Update banner error:", error);
    res.status(500).json({ message: "Error updating banner", error });
  }
};

/**
 * Delete banner by ID (admin/staff only)
 * DELETE /banner/:id
 */
export const deleteBanner = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Banner ID is required" });
      return;
    }

    const deleted = await bannerModel.deleteBanner(id);

    if (!deleted) {
      res.status(404).json({ message: "Banner not found" });
      return;
    }

    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Delete banner error:", error);
    res.status(500).json({ message: "Error deleting banner", error });
  }
};

