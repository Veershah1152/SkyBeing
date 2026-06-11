import mongoose from "mongoose/lib/index.js";

const blogSchema = new mongoose.Schema({
    title:     { type: String, required: true, trim: true },
    slug:      { type: String, unique: true, lowercase: true, trim: true },
    excerpt:   { type: String, default: "" },
    content:   { type: String, default: "" },
    coverImage:{ type: String, default: "" },
    author:    { type: String, default: "Admin" },
    tags:      [{ type: String }],
    status:    { type: String, enum: ["draft", "published"], default: "draft" },
    views:     { type: Number, default: 0 },
}, { timestamps: true });

// Auto-generate slug from title before save
blogSchema.pre("save", function (next) {
    if (this.isModified("title") && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-") + "-" + Date.now();
    }
    next();
});

export const Blog = mongoose.model("Blog", blogSchema);
