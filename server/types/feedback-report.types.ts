export interface FeedbackInput {
  feedbackType: "bug" | "feature" | "suggestion" | "other";
  feedbackDescription: string;
  feedbackImages?: string[];
}

export interface FeedbackResponse {
  id: string;
  userId: string;
  feedbackType: "bug" | "feature" | "suggestion" | "other";
  feedbackDescription: string;
  feedbackImages: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportInput {
  vibeId: string;
  reportType: "spam" | "inappropriate" | "abusive" | "other";
  reportDescription: string;
  reportImages?: string[];
}

export interface ReportResponse {
  id: string;
  userId: string;
  vibeId: string;
  reportType: "spam" | "inappropriate" | "abusive" | "other";
  reportDescription: string;
  reportImages: string[];
  createdAt: Date;
  updatedAt: Date;
}
