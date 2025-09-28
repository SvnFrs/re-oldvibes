import { Vibe } from "../schema/vibe.schema";
import { Wishlist, type IWishlist } from "../schema/wishlist.schema";
import type { VibeResponse } from "../types/vibe.types";
import type {
  CreateWishlistInput,
  WishlistResponse,
  UserWishlistGroup,
} from "../types/wishlist.types";

export class WishlistModel {
  async create(wishlistData: CreateWishlistInput): Promise<IWishlist> {
    const wishlist = new Wishlist({
      ...wishlistData,
    });

    return await wishlist.save();
  }

  async getVibeByIdWishlist(
    vibeId: string,
    userId?: string
  ): Promise<VibeResponse | null> {
    const vibe = await Vibe.findById(vibeId)
      .populate("userId", "username name profilePicture isVerified")
      .populate("comments")
      .lean();

    if (!vibe) return null;

    // Check if this vibe is in user's wishlist
    let isWishlist = false;
    if (userId) {
      const wishlistItem = await Wishlist.findOne({
        vibeId: vibeId,
        userId: userId,
      }).lean();
      isWishlist = !!wishlistItem;
    }

    return this.formatVibeResponse(vibe, userId, isWishlist);
  }

  async deleteWishlist(vibeId: string, userId: string): Promise<boolean> {
    // First find the wishlist item to get its ID
    const wishlistItem = await Wishlist.findOne({
      vibeId: vibeId,
      userId: userId,
    }).lean();

    if (!wishlistItem) {
      return false; // Wishlist item not found
    }

    // Delete using the found wishlist ID
    const result = await Wishlist.findOneAndDelete({
      _id: wishlistItem._id,
    });

    return !!result;
  }

  async getAllWishlists(userId: string): Promise<UserWishlistGroup[]> {
    const wishlists = await Wishlist.find({
      userId: userId,
    })
      .populate("userId", "username name profilePicture isVerified")
      .populate("vibeId")
      .sort({ createdAt: -1 })
      .lean();

    // Group wishlists by userId
    const groupedWishlists = wishlists.reduce((acc, wishlist) => {
      const userId = wishlist.userId._id.toString();

      if (!acc[userId]) {
        acc[userId] = {
          userId,
          wishlist_vibes: [],
        };
      }

      acc[userId].wishlist_vibes.push({
        id: wishlist._id.toString(),
        vibeId: wishlist.vibeId,
        createdAt: wishlist.createdAt,
        updatedAt: wishlist.updatedAt,
      });

      return acc;
    }, {} as Record<string, UserWishlistGroup>);

    return Object.values(groupedWishlists);
  }

  async getAllVibesWithWishlist(
    userId: string,
    page: number = 1,
    limit: number = 12
  ): Promise<VibeResponse[]> {
    const skip = (page - 1) * limit;

    const vibes = await Vibe.find({})
      .populate("userId", "username name profilePicture isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Vibe.countDocuments({});

    const wishlists = await Wishlist.find({}).lean();

    const vibesWithWishlist = vibes.map((vibe) => {
      const wishlist = wishlists.find(
        (wishlist) =>
          wishlist.vibeId.toString() === vibe._id.toString() &&
          wishlist.userId.toString() === userId
      );

      return {
        id: vibe._id.toString(),
        userId: vibe.userId._id.toString(),
        user: {
          username: (vibe.userId as any).username,
          name: (vibe.userId as any).name,
          profilePicture: (vibe.userId as any).profilePicture,
          isVerified: (vibe.userId as any).isVerified,
        },
        itemName: vibe.itemName,
        description: vibe.description,
        price: vibe.price,
        tags: vibe.tags,
        mediaFiles: vibe.mediaFiles,
        status: vibe.status,
        category: vibe.category,
        condition: vibe.condition,
        location: vibe.location,
        likesCount: vibe.likes?.length || 0,
        commentsCount: vibe.commentsCount || 0,
        views: vibe.views || 0,
        isWishlist: !!wishlist,
        expiresAt: vibe.expiresAt,
        createdAt: vibe.createdAt,
        updatedAt: vibe.updatedAt,
      };
    });

    return vibesWithWishlist;
  }

  private formatWishlistResponse(
    wishlist: any,
    userId?: string
  ): WishlistResponse {
    return {
      id: wishlist._id.toString(),
      userId: wishlist.userId._id.toString(),
      vibeId: wishlist.vibeId._id.toString(),
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };
  }

  private formatVibeResponse(
    vibe: any,
    userId?: string,
    isWishlist?: boolean
  ): VibeResponse {
    return {
      id: vibe._id.toString(),
      userId: vibe.userId._id.toString(),
      user: {
        username: vibe.userId.username,
        name: vibe.userId.name,
        profilePicture: vibe.userId.profilePicture,
        isVerified: vibe.userId.isVerified,
      },
      itemName: vibe.itemName,
      description: vibe.description,
      price: vibe.price,
      tags: vibe.tags,
      mediaFiles: vibe.mediaFiles,
      status: vibe.status,
      category: vibe.category,
      condition: vibe.condition,
      location: vibe.location,
      likesCount: vibe.likes?.length || 0,
      commentsCount: vibe.commentsCount || 0,
      views: vibe.views,
      isLiked: userId ? vibe.likes?.includes(userId) : undefined,
      isWishlist: isWishlist,
      expiresAt: vibe.expiresAt,
      createdAt: vibe.createdAt,
      updatedAt: vibe.updatedAt,
    };
  }
}
