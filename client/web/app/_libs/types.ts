export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
}

// Error Handling
export interface ApiErrorData {
  message: string;
  status: number;
  errors: string[];
  timestamp: string;
}

export class ApiError extends Error {
  public status: number;
  public errors: string[];
  public timestamp: string;

  constructor(message: string, status: number, errors: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
  }
}

export type User = {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
  deletedAt?: string;
  isTempBanned?: boolean;
  tempBanReason?: string;
  tempBanAt?: string;
  badBehaviorCount?: number;
};

export type Staff = {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
};

export type MediaFile = {
  url: string;
  type: string;
};

export type Vibe = {
  id: string;
  itemName: string;
  user?: User;
  price: number;
  category: string;
  condition: string;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  tags?: string[];
  location?: string;
  mediaFiles?: MediaFile[];
  status: string;
  views?: number;
  likesCount?: number;
  commentsCount?: number;
};

export type Comment = {
  id: string;
  content: string;
  user: {
    id: string;
    username: string;
    name: string;
    profilePicture?: string;
    isVerified: boolean;
  };
  vibeId: string;
  likesCount: number;
  createdAt: string;
  isActive: boolean;
};

export type Feedback = {
  id: string;
  userId:
    | string
    | {
        _id: string;
        username?: string;
        name?: string;
        profilePicture?: string;
      };
  feedbackType: "bug" | "feature" | "suggestion" | "other";
  feedbackDescription: string;
  feedbackImages: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type UserInfo = {
  id: string;
  username: string;
  name: string;
  profilePicture?: string;
};

export type Report = {
  id: string;
  userId:
    | string
    | {
        _id: string;
        username?: string;
        name?: string;
        profilePicture?: string;
      };
  vibeId:
    | string
    | {
        _id: string;
        itemName?: string;
        description?: string;
        mediaFiles?: MediaFile[];
        userId?: string | { _id: string; username?: string; name?: string };
      };
  reportType: "spam" | "inappropriate" | "abusive" | "other";
  reportDescription: string;
  reportImages: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type VibeInfo = {
  id: string;
  itemName: string;
  description: string;
  mediaFiles: MediaFile[];
  userId?: string | { _id: string; username?: string; name?: string };
};

export type BannerItem = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type BannerInputForm = {
  title: string;
  description?: string;
  imageUrl: string;
  displayOrder?: number;
  isActive?: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
};