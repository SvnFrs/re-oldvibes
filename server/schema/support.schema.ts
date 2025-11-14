import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISupportQuestion extends Document {
  question: string;
  answer: string;
  tags: string[];
  category?: string;
  isPublished: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SupportQuestionSchema = new Schema<ISupportQuestion>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    // Tags remain an array of strings; we will NOT include them inside the text index definition to avoid the array text index error.
    tags: { type: [String], default: [] },
    category: { type: String, default: "general" },
    isPublished: { type: Boolean, default: false, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Text index ONLY on question & answer to avoid array field issue.
SupportQuestionSchema.index({ question: "text", answer: "text" });
// Separate compound index for filtering by tags & category.
SupportQuestionSchema.index({ tags: 1, category: 1, updatedAt: -1 });

export const SupportQuestion: Model<ISupportQuestion> =
  mongoose.models.SupportQuestion ||
  mongoose.model<ISupportQuestion>("SupportQuestion", SupportQuestionSchema);
