import type { Request, Response } from "express";
import { SupportModel } from "../models/support.models";

const supportModel = new SupportModel();

// Public: list published support questions
export const getPublicSupport = async (req: Request, res: Response) => {
  try {
    const { q, tags, category, page = "1", limit = "20" } = req.query as Record<string, string>;
    const tagList = tags ? tags.split(",").filter(Boolean) : [];
    const result = await supportModel.list({
      q,
      tags: tagList,
      category,
      isPublished: true,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
    });
    res.json({
      items: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    console.error("List public support error:", error);
    res.status(500).json({ message: "Error listing support questions", error });
  }
};

// Admin: list all (with filters)
export const getAdminSupport = async (req: Request, res: Response) => {
  try {
    const { q, tags, category, isPublished, page = "1", limit = "20" } = req.query as Record<string, string>;
    const tagList = tags ? tags.split(",").filter(Boolean) : [];
    const result = await supportModel.list({
      q,
      tags: tagList,
      category,
      isPublished: typeof isPublished === "string" ? isPublished === "true" : undefined,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
    });
    res.json({
      items: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    console.error("List admin support error:", error);
    res.status(500).json({ message: "Error listing support questions", error });
  }
};

export const createSupport = async (req: Request, res: Response) => {
  try {
    const { question, answer, tags = [], category = "general", isPublished = false } = req.body || {};
    if (!question || !answer) {
      return res.status(400).json({ message: "question and answer are required" });
    }
    const created = await supportModel.create({
      question,
      answer,
      tags,
      category,
      isPublished,
      userId: (req as any).user?._id || (req as any).user?.id,
    });
    res.status(201).json({ message: "Created", item: created });
  } catch (error) {
    console.error("Create support error:", error);
    res.status(500).json({ message: "Error creating support question", error });
  }
};

export const updateSupport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await supportModel.update(id, { ...req.body, userId: (req as any).user?._id || (req as any).user?.id });
    if (!updated) return res.status(404).json({ message: "Support question not found" });
    res.json({ message: "Updated", item: updated });
  } catch (error) {
    console.error("Update support error:", error);
    res.status(500).json({ message: "Error updating support question", error });
  }
};

export const deleteSupport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = await supportModel.delete(id);
    if (!ok) return res.status(404).json({ message: "Support question not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete support error:", error);
    res.status(500).json({ message: "Error deleting support question", error });
  }
};

export const getSupportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await supportModel.getById(id);
    if (!item) return res.status(404).json({ message: "Support question not found" });
    res.json({ item });
  } catch (error) {
    console.error("Get support by id error:", error);
    res.status(500).json({ message: "Error getting support question", error });
  }
};
