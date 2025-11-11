import mongoose, { Document, Schema } from "mongoose";

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  feedbackType: "bug" | "feature" | "suggestion" | "other";
  feedbackDescription: string;
  feedbackImages: string[];
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    feedbackType: {
      type: String,
      enum: ["bug", "feature", "suggestion", "other"],
      required: true,
    },
    feedbackDescription: { type: String, required: true, maxlength: 1000 },
    feedbackImages: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export const Feedback = mongoose.model<IFeedback>("Feedback", feedbackSchema);

