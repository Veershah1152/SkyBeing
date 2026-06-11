import mongoose from "mongoose/lib/index.js";
const { Schema } = mongoose;

const visitSchema = new Schema({
    ip: { type: String, default: "unknown" },
    userAgent: { type: String, default: "" },
    page: { type: String, default: "/" },
    country: { type: String, default: "Unknown" },
    date: { type: String, required: true },      // YYYY-MM-DD for bucketing
    hour: { type: Number, default: 0 },           // 0-23
    sessionId: { type: String, default: "" },     // random token per browser session
}, { timestamps: true });

// Index for fast date-range queries
visitSchema.index({ date: 1 });
visitSchema.index({ ip: 1, date: 1 });
visitSchema.index({ sessionId: 1, date: 1 });

export const Visit = mongoose.model("Visit", visitSchema);
