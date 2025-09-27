import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string; // Optional - null for Google users
  name: string;
  username: string;
  role: "admin" | "staff" | "user" | "guest";
  profilePicture?: string;
  bio?: string;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  isVerified: boolean;
  isEmailVerified: boolean;
  isActive: boolean;
  // OAuth fields
  googleId?: string; // Only Google users have this
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function(this: IUser) {
        // Password required only if no googleId (local users)
        return !this.googleId;
      },
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-zA-Z0-9_]+$/,
    },
    role: {
      type: String,
      enum: ["admin", "staff", "user", "guest"],
      default: "user",
    },
    profilePicture: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 150,
      default: "",
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // OAuth fields
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values but ensures uniqueness when present
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better performance
// userSchema.index({ email: 1 });
// userSchema.index({ username: 1 });
// userSchema.index({ role: 1 });

export const User = mongoose.model<IUser>("User", userSchema);