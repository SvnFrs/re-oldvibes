import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ 
  model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp" 
});

export interface ModerationResult {
  isClean: boolean;
  reason?: string;
  confidence: number;
  categories?: string[];
}

/**
 * Check if a comment is appropriate using Gemini AI
 * @param comment - The comment text to check
 * @param vibeItemName - The item name of the vibe being commented on
 * @returns ModerationResult with isClean flag and reason if inappropriate
 */
export async function moderateComment(
  comment: string,
  vibeItemName: string
): Promise<ModerationResult> {
  try {
    const prompt = `You are a content moderator for a secondhand marketplace app called "Old Vibes". 
    
Your task is to analyze a user comment and determine if it violates community guidelines.

**Item being commented on:** "${vibeItemName}"
**User comment:** "${comment}"

Check for the following violations:
1. **Inappropriate Language**: Profanity, hate speech, harassment, threats, sexual content
2. **Spam**: Repeated text, external links, promotional content not related to the item
3. **Off-Topic**: Comment completely unrelated to the item "${vibeItemName}"
4. **Scams**: Requests for payment outside the platform, phishing attempts
5. **Personal Information**: Phone numbers, email addresses, social media handles

Respond in valid JSON format only (no markdown, no code blocks):
{
  "isClean": true/false,
  "reason": "brief explanation if not clean (max 50 words)",
  "confidence": 0.0-1.0,
  "categories": ["category1", "category2"] (if violated)
}

If the comment is appropriate and relevant, set isClean to true.
If it violates any guideline, set isClean to false and provide a clear reason.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();
    
    // Remove markdown code blocks if present
    let jsonText = text;
    if (text.startsWith("```json")) {
      jsonText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    } else if (text.startsWith("```")) {
      jsonText = text.replace(/```\n?/g, "").trim();
    }
    
    const moderationResult: ModerationResult = JSON.parse(jsonText);
    
    // Validate the response structure
    if (typeof moderationResult.isClean !== "boolean") {
      throw new Error("Invalid moderation response: missing isClean field");
    }
    
    return moderationResult;
  } catch (error) {
    console.error("Error moderating comment with Gemini:", error);
    
    // Fallback: If AI fails, perform basic checks
    return basicModeration(comment, vibeItemName);
  }
}

/**
 * Fallback basic moderation using simple rules
 */
function basicModeration(comment: string, vibeItemName: string): ModerationResult {
  const lowerComment = comment.toLowerCase();
  
  // Basic profanity filter
  const profanityWords = [
    "fuck", "shit", "damn", "bitch", "asshole", "bastard",
    // Add more based on your requirements
  ];
  
  const hasProfanity = profanityWords.some(word => lowerComment.includes(word));
  
  if (hasProfanity) {
    return {
      isClean: false,
      reason: "Comment contains inappropriate language",
      confidence: 0.8,
      categories: ["inappropriate_language"],
    };
  }
  
  // Check for URLs (spam)
  const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\w+\.(com|net|org|io))/gi;
  if (urlPattern.test(comment)) {
    return {
      isClean: false,
      reason: "Comment contains external links",
      confidence: 0.9,
      categories: ["spam"],
    };
  }
  
  // Check for email/phone (personal info)
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phonePattern = /(\d{3}[-.]?\d{3}[-.]?\d{4})|(\+\d{1,3}\s?\d+)/;
  
  if (emailPattern.test(comment) || phonePattern.test(comment)) {
    return {
      isClean: false,
      reason: "Comment contains personal contact information",
      confidence: 0.95,
      categories: ["personal_information"],
    };
  }
  
  // If passes basic checks, consider it clean
  return {
    isClean: true,
    confidence: 0.7,
  };
}

/**
 * Batch moderate multiple comments (for admin review)
 */
export async function moderateCommentBatch(
  comments: Array<{ text: string; vibeItemName: string }>
): Promise<ModerationResult[]> {
  const results = await Promise.all(
    comments.map(({ text, vibeItemName }) => moderateComment(text, vibeItemName))
  );
  return results;
}
