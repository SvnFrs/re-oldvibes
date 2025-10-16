import mongoose, { Document, Schema } from "mongoose";

export interface IInteraction extends Document {
  userId: mongoose.Types.ObjectId;
  vibeId: mongoose.Types.ObjectId;
  interactionType: "view" | "like" | "comment" | "share" | "wishlist" | "chat" | "offer";
  duration?: number; // For view interactions (in seconds)
  metadata?: {
    tags?: string[];
    category?: string;
    location?: string;
  };
  timestamp: Date;
  createdAt: Date;
}

const interactionSchema = new Schema<IInteraction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    vibeId: { type: Schema.Types.ObjectId, ref: "Vibe", required: true, index: true },
    interactionType: {
      type: String,
      enum: ["view", "like", "comment", "share", "wishlist", "chat", "offer"],
      required: true,
    },
    duration: Number,
    metadata: {
      tags: [String],
      category: String,
      location: String,
    },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// // Compound indexes for efficient queries
// interactionSchema.index({ userId: 1, interactionType: 1, timestamp: -1 });
// interactionSchema.index({ vibeId: 1, interactionType: 1 });
// interactionSchema.index({ userId: 1, timestamp: -1 });

// // TTL index to auto-delete old interactions after 90 days (optional)
// interactionSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export const Interaction = mongoose.model<IInteraction>("Interaction", interactionSchema);
