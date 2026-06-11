import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Blog } from "../models/blog.model.js";
import { uploadFile as uploadOnCloudinary } from "../utils/fileStorage.js";
import fs from "fs";

// ── Public: list all published blogs ─────────────────────────────────────────
export const getPublishedBlogs = asyncHandler(async (req, res) => {
    const blogs = await Blog.find({ status: "published" }).sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, blogs, "Blogs fetched"));
});

// ── Public: get single blog (increments views) ────────────────────────────────
export const getBlogBySlug = asyncHandler(async (req, res) => {
    const blog = await Blog.findOneAndUpdate(
        { slug: req.params.slug, status: "published" },
        { $inc: { views: 1 } },
        { new: true }
    );
    if (!blog) return res.status(404).json(new ApiResponse(404, null, "Blog not found"));
    res.status(200).json(new ApiResponse(200, blog, "Blog fetched"));
});

// ── Admin: list all blogs ─────────────────────────────────────────────────────
export const getAllBlogs = asyncHandler(async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, blogs, "All blogs fetched"));
});

// ── Admin: create blog ────────────────────────────────────────────────────────
export const createBlog = asyncHandler(async (req, res) => {
    const { title, excerpt, content, author, tags, status } = req.body;
    if (!title) return res.status(400).json(new ApiResponse(400, null, "Title is required"));

    let coverImage = "";
    if (req.file) {
        const uploaded = await uploadOnCloudinary(req.file);
        coverImage = uploaded?.secure_url || "";
    }

    const blog = await Blog.create({
        title, excerpt, content, author: author || "Admin",
        coverImage,
        tags: tags ? JSON.parse(tags) : [],
        status: status || "draft",
    });
    res.status(201).json(new ApiResponse(201, blog, "Blog created"));
});

// ── Admin: update blog ────────────────────────────────────────────────────────
export const updateBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json(new ApiResponse(404, null, "Blog not found"));

    const { title, excerpt, content, author, tags, status } = req.body;
    if (title) { blog.title = title; blog.slug = undefined; } // trigger pre-save slug regen
    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (content  !== undefined) blog.content  = content;
    if (author)  blog.author  = author;
    if (status)  blog.status  = status;
    if (tags)    blog.tags    = JSON.parse(tags);

    if (req.file) {
        const uploaded = await uploadOnCloudinary(req.file);
        blog.coverImage = uploaded?.secure_url || blog.coverImage;
    }

    await blog.save();
    res.status(200).json(new ApiResponse(200, blog, "Blog updated"));
});

// ── Admin: delete blog ────────────────────────────────────────────────────────
export const deleteBlog = asyncHandler(async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json(new ApiResponse(200, null, "Blog deleted"));
});
