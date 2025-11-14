import mongoose, { Schema, Document } from "mongoose";

export interface IAppeal extends Document {
  userId: mongoose.Types.ObjectId;
  type: "ban_appeal" | "general_inquiry" | "bug_report" | "other";
  subject: string;
  message: string;
  status: "pending" | "reviewed" | "resolved" | "rejected";
  adminResponse?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  relatedBanId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appealSchema = new Schema<IAppeal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["ban_appeal", "general_inquiry", "bug_report", "other"],
      required: true,
      default: "general_inquiry",
    },
    subject: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "rejected"],
      default: "pending",
      index: true,
    },
    adminResponse: {
      type: String,
      maxlength: 2000,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    relatedBanId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
appealSchema.index({ userId: 1, createdAt: -1 });
appealSchema.index({ status: 1, createdAt: -1 });
appealSchema.index({ type: 1, status: 1 });

export const Appeal = mongoose.model<IAppeal>("Appeal", appealSchema);
