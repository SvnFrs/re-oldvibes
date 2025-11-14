import mongoose from "mongoose";
import { SupportQuestion, type ISupportQuestion } from "../schema/support.schema";

export type SupportFilters = {
  q?: string;
  tags?: string[];
  category?: string;
  isPublished?: boolean;
  page?: number;
  limit?: number;
};

export class SupportModel {
  async create(data: {
    question: string;
    answer: string;
    tags?: string[];
    category?: string;
    isPublished?: boolean;
    userId?: string;
  }): Promise<ISupportQuestion> {
    const doc = new SupportQuestion({
      question: data.question,
      answer: data.answer,
      tags: data.tags || [],
      category: data.category || "general",
      isPublished: data.isPublished ?? false,
      createdBy: data.userId ? new mongoose.Types.ObjectId(data.userId) : undefined,
      updatedBy: data.userId ? new mongoose.Types.ObjectId(data.userId) : undefined,
    });
    return await doc.save();
  }

  async update(id: string, update: Partial<{
    question: string;
    answer: string;
    tags: string[];
    category: string;
    isPublished: boolean;
    userId: string;
  }>): Promise<ISupportQuestion | null> {
    const payload: any = { ...update };
    if (update.userId) payload.updatedBy = new mongoose.Types.ObjectId(update.userId);
    return await SupportQuestion.findByIdAndUpdate(id, payload, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const res = await SupportQuestion.findByIdAndDelete(id);
    return !!res;
  }

  async getById(id: string): Promise<ISupportQuestion | null> {
    return await SupportQuestion.findById(id);
  }

  async list(filters: SupportFilters): Promise<{
    items: ISupportQuestion[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      q,
      tags,
      category,
      isPublished,
      page = 1,
      limit = 20,
    } = filters;

    const query: any = {};
    if (typeof isPublished === "boolean") query.isPublished = isPublished;
    if (category) query.category = category;
    if (tags && tags.length) query.tags = { $in: tags };
    if (q) query.$text = { $search: q };

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      SupportQuestion.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SupportQuestion.countDocuments(query),
    ]);

    return { items, total, page, limit };
  }
}
