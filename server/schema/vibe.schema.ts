import mongoose, { Document, Schema } from "mongoose";

export interface IVibe extends Document {
  userId: mongoose.Types.ObjectId;
  itemName: string;
  description: string;
  price: number;
  tags: string[];
  mediaFiles: {
    type: "image" | "video";
    url: string;
    thumbnail?: string;
  }[];
  status: "pending" | "approved" | "rejected" | "sold" | "archived";
  moderationNotes?: string;
  moderatedBy?: mongoose.Types.ObjectId;
  category: string;
  condition: "new" | "like-new" | "good" | "fair" | "poor";
  location?: string;
  locationData?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  likes: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  commentsCount: number;
  views: number;
  engagementScore: number; // Cached score for performance
  expiresAt: Date; // 24-hour expiry
  createdAt: Date;
  updatedAt: Date;
}

const vibeSchema = new Schema<IVibe>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    itemName: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 500 },
    price: { type: Number, required: true, min: 0 },
    tags: [{ type: String, trim: true }],
    mediaFiles: [
      {
        type: { type: String, enum: ["image", "video"], required: true },
        url: { type: String, required: true },
        thumbnail: String,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "sold", "archived"],
      default: "pending",
    },
    moderationNotes: String,
    moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    category: { type: String, required: true },
    condition: {
      type: String,
      enum: ["new", "like-new", "good", "fair", "poor"],
      required: true,
    },
    location: String,
    locationData: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    commentsCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0 },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  },
  { timestamps: true },
);

// Index for expiry and automatic cleanup
vibeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Geospatial index for location-based queries
vibeSchema.index({ locationData: "2dsphere" });

// Performance indexes
vibeSchema.index({ status: 1, engagementScore: -1 });
vibeSchema.index({ category: 1, status: 1 });
vibeSchema.index({ tags: 1, status: 1 });

export const Vibe = mongoose.model<IVibe>("Vibe", vibeSchema);
