import mongoose, { Document, Schema } from "mongoose";

export interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId;
  vibeId: mongoose.Types.ObjectId;
  expiresAt: Date; // 24-hour expiry
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vibeId: { type: Schema.Types.ObjectId, ref: "Vibe", required: true },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  },
  { timestamps: true }
);

// Index for expiry and automatic cleanup
wishlistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Wishlist = mongoose.model<IWishlist>("Wishlist", wishlistSchema);
