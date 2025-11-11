import { Banner, type IBanner } from "../schema/banner.schema";
import type { BannerInput, BannerResponse, BannerFilters } from "../types/banner.types";
import mongoose from "mongoose";

export class BannerModel {
  /**
   * Get next display order for active banners
   * If banner is active, return count of active banners + 1
   * If banner is inactive, return 0 (will be hidden from display)
   */
  async getNextDisplayOrder(isActive: boolean): Promise<number> {
    if (!isActive) {
      return 0; // Inactive banners don't need display order
    }
    
    // Count active banners
    const activeBannerCount = await Banner.countDocuments({ isActive: true });
    return activeBannerCount + 1;
  }

  /**
   * Create a new banner
   */
  async createBanner(bannerData: BannerInput): Promise<IBanner> {
    const isActive = bannerData.isActive ?? true;
    
    // Auto-calculate display order based on active status
    const displayOrder = isActive 
      ? await this.getNextDisplayOrder(true)
      : 0;

    const banner = new Banner({
      ...bannerData,
      displayOrder,
      isActive,
    });

    return await banner.save();
  }

  /**
   * Get list of banners with optional filters (for public use with date filtering)
   */
  async getBanners(filters?: BannerFilters): Promise<BannerResponse[]> {
    const query: any = {};

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    // Only show banners that are currently active based on dates
    const now = new Date();
    const dateConditions: any[] = [
      {
        $or: [
          { startDate: { $exists: false } },
          { startDate: null },
          { startDate: { $lte: now } },
        ],
      },
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      },
    ];

    if (filters?.search) {
      query.$and = [
        ...dateConditions,
        {
          $or: [
            { title: { $regex: filters.search, $options: "i" } },
            { description: { $regex: filters.search, $options: "i" } },
          ],
        },
      ];
    } else {
      query.$and = dateConditions;
    }

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const banners = await Banner.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return banners.map((banner) => this.formatBannerResponse(banner));
  }

  /**
   * Get all banners for admin (without date filtering)
   */
  async getAllBanners(filters?: BannerFilters): Promise<BannerResponse[]> {
    const query: any = {};

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters?.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const banners = await Banner.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return banners.map((banner) => this.formatBannerResponse(banner));
  }

  /**
   * Get active banners for homepage (public endpoint)
   */
  async getActiveBanners(): Promise<BannerResponse[]> {
    const now = new Date();
    const query = {
      isActive: true,
      $and: [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: null },
            { startDate: { $lte: now } },
          ],
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: now } },
          ],
        },
      ],
    };

    const banners = await Banner.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    return banners.map((banner) => this.formatBannerResponse(banner));
  }

  /**
   * Get banner by ID
   */
  async getBannerById(bannerId: string): Promise<BannerResponse | null> {
    const banner = await Banner.findById(bannerId).lean();

    if (!banner) return null;

    return this.formatBannerResponse(banner);
  }

  /**
   * Update banner by ID
   */
  async updateBanner(
    bannerId: string,
    bannerData: Partial<BannerInput>
  ): Promise<BannerResponse | null> {
    // Get current banner to check if isActive changed
    const currentBanner = await Banner.findById(bannerId);
    if (!currentBanner) return null;

    const updateData: any = { ...bannerData };

    // Remove displayOrder from updateData as it's auto-calculated
    delete updateData.displayOrder;

    // If isActive status is being changed, recalculate display order
    if (bannerData.isActive !== undefined) {
      const newIsActive = bannerData.isActive;
      const oldIsActive = currentBanner.isActive;

      if (newIsActive !== oldIsActive) {
        if (newIsActive) {
          // Banner is being activated - count active banners excluding this one
          const activeBannerCount = await Banner.countDocuments({
            isActive: true,
            _id: { $ne: new mongoose.Types.ObjectId(bannerId) },
          });
          updateData.displayOrder = activeBannerCount + 1;
        } else {
          // Banner is being deactivated - set display order to 0
          updateData.displayOrder = 0;
        }
      } else if (!newIsActive) {
        // Banner remains inactive - ensure display order is 0
        updateData.displayOrder = 0;
      }
      // If banner remains active, keep its current display order (don't update it)
    } else if (!currentBanner.isActive) {
      // If banner is inactive and isActive is not being changed, ensure display order is 0
      updateData.displayOrder = 0;
    }

    updateData.updatedAt = new Date();

    const banner = await Banner.findByIdAndUpdate(
      bannerId,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!banner) return null;

    return this.formatBannerResponse(banner);
  }

  /**
   * Delete banner by ID
   */
  async deleteBanner(bannerId: string): Promise<boolean> {
    const result = await Banner.findByIdAndDelete(bannerId);
    return !!result;
  }

  /**
   * Format banner document to response format
   */
  private formatBannerResponse(banner: any): BannerResponse {
    return {
      id: banner._id.toString(),
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      displayOrder: banner.displayOrder,
      isActive: banner.isActive,
      startDate: banner.startDate,
      endDate: banner.endDate,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    };
  }
}

