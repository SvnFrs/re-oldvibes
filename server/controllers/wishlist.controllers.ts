import type { Request, Response } from "express";
import { WishlistModel } from "../models/wishlist.models";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import type { CreateWishlistInput } from "../types/wishlist.types";

const wishlistModel = new WishlistModel();

export const createWishlist = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const wishlistData: CreateWishlistInput = req.body;

    const newWishlist = await wishlistModel.create(wishlistData);

    res.status(201).json({
      message: "Wishlist created",
      wishlist: {
        id: newWishlist._id,
      },
    });
  } catch (error) {
    console.error("Create wishlist error:", error);
    res.status(500).json({ message: "Error creating wishlist", error });
  }
};

export const getAllWishlists = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const wishlists = await wishlistModel.getAllWishlists(userId);
    res.json({ wishlists, count: wishlists.length });
  } catch (error) {
    console.error("Get all wishlists (admin) error:", error);
    res.status(500).json({ message: "Error fetching all wishlists", error });
  }
};

export const getAllVibesWithWishlist = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const vibes = await wishlistModel.getAllVibesWithWishlist(userId);
    res.json({ vibes, count: vibes.length });
  } catch (error) {
    console.error("Get all vibes with wishlist (admin) error:", error);
    res
      .status(500)
      .json({ message: "Error fetching all vibes with wishlist", error });
  }
};

export const getVibeByIdWishlist = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { vibeId, userId } = req.params;

    if (!vibeId) {
      res.status(400).json({ message: "Vibe ID is required" });
      return;
    }

    const vibe = await wishlistModel.getVibeByIdWishlist(vibeId, userId);

    if (!vibe) {
      res.status(404).json({ message: "Vibe not found" });
      return;
    }

    res.json({ vibe });
  } catch (error) {
    console.error("Get vibe error:", error);
    res.status(500).json({ message: "Error fetching vibe", error });
  }
};

export const deleteWishlist = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { vibeId, userId } = req.params;

    if (!vibeId || !userId) {
      res.status(400).json({ message: "Wishlist ID is required" });
      return;
    }

    // Allow admin/staff to delete any vibe
    const deleted = await wishlistModel.deleteWishlist(vibeId, userId);

    if (!deleted) {
      res.status(404).json({ message: "Wishlist not found" });
      return;
    }

    res.json({ message: "Wishlist deleted successfully" });
  } catch (error) {
    console.error("Delete wishlist error:", error);
    res.status(500).json({ message: "Error deleting wishlist", error });
  }
};
