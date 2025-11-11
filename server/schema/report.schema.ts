import mongoose, { Document, Schema } from "mongoose";

export interface IReport extends Document {
  userId: mongoose.Types.ObjectId;
  vibeId: mongoose.Types.ObjectId;
  reportType: "spam" | "inappropriate" | "abusive" | "other";
  reportDescription: string;
  reportImages: string[];
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vibeId: { type: Schema.Types.ObjectId, ref: "Vibe", required: true },
    reportType: {
      type: String,
      enum: ["spam", "inappropriate", "abusive", "other"],
      required: true,
    },
    reportDescription: { type: String, required: true, maxlength: 1000 },
    reportImages: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export const Report = mongoose.model<IReport>("Report", reportSchema);

