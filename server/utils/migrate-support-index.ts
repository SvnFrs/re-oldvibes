import mongoose from "mongoose";

export async function migrateSupportIndexes() {
  try {
    const collectionName = mongoose.connection.modelNames().find((n) => n === "SupportQuestion")
      ? mongoose.connection.model("SupportQuestion").collection.name
      : "supportquestions"; // fallback pluralization

    const coll = mongoose.connection.db.collection(collectionName);
    const indexes = await coll.listIndexes().toArray();

    // Find any text index that still includes 'tags':'text'
    const legacyIndexes = indexes.filter((idx: any) => {
      if (!idx.key) return false;
      const keyEntries = Object.entries(idx.key);
      const isText = keyEntries.some(([, v]) => v === "text");
      const hasTagsText = Object.prototype.hasOwnProperty.call(idx.key, "tags") && idx.key["tags"] === "text";
      return isText && hasTagsText;
    });

    for (const legacy of legacyIndexes) {
      try {
        await coll.dropIndex(legacy.name);
        console.log(`🧹 Dropped legacy support text index '${legacy.name}' (contained tags array).`);
      } catch (err) {
        console.warn(`⚠️ Failed to drop legacy index '${legacy.name}':`, err);
      }
    }

    // Ensure defined Mongoose indexes are in place.
    const model = mongoose.connection.model("SupportQuestion");
    await model.syncIndexes();
    console.log("✅ SupportQuestion indexes synced.");
  } catch (error) {
    console.warn("⚠️ SupportQuestion index migration skipped (", error, ")");
  }
}
