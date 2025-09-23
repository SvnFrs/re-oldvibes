import type { Request, Response, NextFunction } from "express";

export const validateVibeCreation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { itemName, description, price, category, condition } = req.body;

  if (!itemName || !description || !price || !category || !condition) {
    return res.status(400).json({
      message: "Missing required fields",
      required: ["itemName", "description", "price", "category", "condition"],
    });
  }

  if (price < 0) {
    return res.status(400).json({ message: "Price must be positive" });
  }

  next();
};

export const validateProfileUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, bio } = req.body;

  if (name && (typeof name !== "string" || name.trim().length === 0)) {
    return res.status(400).json({ message: "Name must be a non-empty string" });
  }

  if (bio && (typeof bio !== "string" || bio.length > 150)) {
    return res
      .status(400)
      .json({ message: "Bio must be 150 characters or less" });
  }

  next();
};

export const validateCommentCreation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { content, parentCommentId } = req.body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return res.status(400).json({ message: "Comment content is required" });
  }

  if (content.trim().length > 500) {
    return res.status(400).json({
      message: "Comment content must be 500 characters or less",
    });
  }

  if (parentCommentId && typeof parentCommentId !== "string") {
    return res.status(400).json({ message: "Invalid parent comment ID" });
  }

  req.body.content = content.trim();
  next();
};

export const validateCommentUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { content } = req.body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return res.status(400).json({ message: "Comment content is required" });
  }

  if (content.trim().length > 500) {
    return res.status(400).json({
      message: "Comment content must be 500 characters or less",
    });
  }

  req.body.content = content.trim();
  next();
};
