import mongoose, { Document, Schema } from "mongoose";

export interface IBanner extends Document {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 500 },
    imageUrl: { type: String, required: true },
    linkUrl: { type: String, trim: true },
    displayOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Index for active banners with display order
bannerSchema.index({ isActive: 1, displayOrder: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

export const Banner = mongoose.model<IBanner>("Banner", bannerSchema);

