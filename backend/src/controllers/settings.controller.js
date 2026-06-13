import { asyncHandler } from "../utils/asyncHandler.js";
import { SiteSettings } from "../models/settings.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose/lib/index.js";

// ── Singleton helper ───────────────────────────────────────────────────────────
const getOrCreateSettings = async () => {
    let settings = await SiteSettings.findOne();
    if (!settings) {
        settings = await SiteSettings.create({});
    }
    return settings;
};

// ── Public: maintenance mode status ───────────────────────────────────────────
export const getMaintenanceStatus = asyncHandler(async (req, res) => {
    const settings = await getOrCreateSettings();
    return res.status(200).json(
        new ApiResponse(200, {
            isMaintenanceMode: settings.isMaintenanceMode,
            maintenanceMessage: settings.maintenanceMessage
        }, "Maintenance status fetched successfully")
    );
});

// ── Admin: update maintenance / payment settings ───────────────────────────────
export const updateMaintenanceSettings = asyncHandler(async (req, res) => {
    const { isMaintenanceMode, maintenanceMessage, razorpayKey, razorpaySecret, razorpayWebhookSecret } = req.body;

    let settings = await getOrCreateSettings();

    if (typeof isMaintenanceMode !== "undefined") settings.isMaintenanceMode = isMaintenanceMode;
    if (typeof maintenanceMessage !== "undefined") settings.maintenanceMessage = maintenanceMessage;
    if (typeof razorpayKey !== "undefined") settings.razorpayKey = razorpayKey;
    if (typeof razorpaySecret !== "undefined") settings.razorpaySecret = razorpaySecret;
    if (typeof razorpayWebhookSecret !== "undefined") settings.razorpayWebhookSecret = razorpayWebhookSecret;

    await settings.save();
    return res.status(200).json(new ApiResponse(200, settings, "Settings updated successfully"));
});

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════

export const getCategories = asyncHandler(async (req, res) => {
    const settings = await getOrCreateSettings();
    return res.status(200).json(new ApiResponse(200, settings.categories, "Categories fetched"));
});

export const addCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name?.trim()) throw new ApiError(400, "Category name is required");
    const settings = await getOrCreateSettings();
    if (settings.categories.includes(name.trim())) throw new ApiError(409, "Category already exists");
    settings.categories.push(name.trim());
    await settings.save();
    return res.status(201).json(new ApiResponse(201, settings.categories, "Category added"));
});

export const updateCategory = asyncHandler(async (req, res) => {
    const { oldName, newName } = req.body;
    if (!oldName?.trim() || !newName?.trim()) throw new ApiError(400, "Both oldName and newName required");
    const settings = await getOrCreateSettings();
    const idx = settings.categories.indexOf(oldName.trim());
    if (idx === -1) throw new ApiError(404, "Category not found");
    settings.categories[idx] = newName.trim();
    settings.markModified("categories");
    await settings.save();
    return res.status(200).json(new ApiResponse(200, settings.categories, "Category updated"));
});

export const deleteCategory = asyncHandler(async (req, res) => {
    const { name } = req.params;
    const settings = await getOrCreateSettings();
    const before = settings.categories.length;
    settings.categories = settings.categories.filter(c => c !== decodeURIComponent(name));
    if (settings.categories.length === before) throw new ApiError(404, "Category not found");
    await settings.save();
    return res.status(200).json(new ApiResponse(200, settings.categories, "Category deleted"));
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUBCATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════

export const getSubCategories = asyncHandler(async (req, res) => {
    const settings = await getOrCreateSettings();
    return res.status(200).json(new ApiResponse(200, settings.subcategories, "Sub-categories fetched"));
});

export const addSubCategory = asyncHandler(async (req, res) => {
    const { name, parentCategory } = req.body;
    if (!name?.trim()) throw new ApiError(400, "Sub-category name is required");
    const settings = await getOrCreateSettings();
    settings.subcategories.push({ name: name.trim(), parentCategory: parentCategory?.trim() || "" });
    await settings.save();
    return res.status(201).json(new ApiResponse(201, settings.subcategories, "Sub-category added"));
});

export const updateSubCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, parentCategory } = req.body;
    const settings = await getOrCreateSettings();
    const sub = settings.subcategories.id(id);
    if (!sub) throw new ApiError(404, "Sub-category not found");
    if (name?.trim()) sub.name = name.trim();
    if (typeof parentCategory !== "undefined") sub.parentCategory = parentCategory.trim();
    await settings.save();
    return res.status(200).json(new ApiResponse(200, settings.subcategories, "Sub-category updated"));
});

export const deleteSubCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const settings = await getOrCreateSettings();
    const sub = settings.subcategories.id(id);
    if (!sub) throw new ApiError(404, "Sub-category not found");
    sub.deleteOne();
    await settings.save();
    return res.status(200).json(new ApiResponse(200, settings.subcategories, "Sub-category deleted"));
});

// ═══════════════════════════════════════════════════════════════════════════════
// TAX RATES
// ═══════════════════════════════════════════════════════════════════════════════

export const getTaxRates = asyncHandler(async (req, res) => {
    const settings = await getOrCreateSettings();
    return res.status(200).json(new ApiResponse(200, settings.taxRates, "Tax rates fetched"));
});

export const addTaxRate = asyncHandler(async (req, res) => {
    const { name, rate, appliedTo } = req.body;
    if (!name?.trim() || rate === undefined) throw new ApiError(400, "Name and rate are required");
    const settings = await getOrCreateSettings();
    settings.taxRates.push({ name: name.trim(), rate: Number(rate), appliedTo: appliedTo?.trim() || "All Categories" });
    await settings.save();
    return res.status(201).json(new ApiResponse(201, settings.taxRates, "Tax rate added"));
});

export const updateTaxRate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, rate, appliedTo } = req.body;
    const settings = await getOrCreateSettings();
    const tax = settings.taxRates.id(id);
    if (!tax) throw new ApiError(404, "Tax rate not found");
    if (name?.trim()) tax.name = name.trim();
    if (rate !== undefined) tax.rate = Number(rate);
    if (appliedTo?.trim()) tax.appliedTo = appliedTo.trim();
    await settings.save();
    return res.status(200).json(new ApiResponse(200, settings.taxRates, "Tax rate updated"));
});

export const deleteTaxRate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const settings = await getOrCreateSettings();
    const tax = settings.taxRates.id(id);
    if (!tax) throw new ApiError(404, "Tax rate not found");
    tax.deleteOne();
    await settings.save();
    return res.status(200).json(new ApiResponse(200, settings.taxRates, "Tax rate deleted"));
});

// ═══════════════════════════════════════════════════════════════════════════════
// SHIPPING CHARGES
// ═══════════════════════════════════════════════════════════════════════════════

export const getShippingCharges = asyncHandler(async (req, res) => {
    const settings = await getOrCreateSettings();
    return res.status(200).json(new ApiResponse(200, settings.shippingCharges, "Shipping charges fetched"));
});

export const addShippingCharge = asyncHandler(async (req, res) => {
    const { name, cost, minDays, maxDays, active } = req.body;
    if (!name?.trim() || cost === undefined) throw new ApiError(400, "Name and cost are required");
    const settings = await getOrCreateSettings();
    settings.shippingCharges.push({ name: name.trim(), cost: Number(cost), minDays: minDays || "", maxDays: maxDays || "", active: active !== false });
    await settings.save();
    return res.status(201).json(new ApiResponse(201, settings.shippingCharges, "Shipping charge added"));
});

export const updateShippingCharge = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, cost, minDays, maxDays, active } = req.body;
    const settings = await getOrCreateSettings();
    const charge = settings.shippingCharges.id(id);
    if (!charge) throw new ApiError(404, "Shipping charge not found");
    if (name?.trim()) charge.name = name.trim();
    if (cost !== undefined) charge.cost = Number(cost);
    if (minDays !== undefined) charge.minDays = minDays;
    if (maxDays !== undefined) charge.maxDays = maxDays;
    if (typeof active !== "undefined") charge.active = active;
    await settings.save();
    return res.status(200).json(new ApiResponse(200, settings.shippingCharges, "Shipping charge updated"));
});

export const deleteShippingCharge = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const settings = await getOrCreateSettings();
    const charge = settings.shippingCharges.id(id);
    if (!charge) throw new ApiError(404, "Shipping charge not found");
    charge.deleteOne();
    await settings.save();
    return res.status(200).json(new ApiResponse(200, settings.shippingCharges, "Shipping charge deleted"));
});

// ═══════════════════════════════════════════════════════════════════════════════
// SHIPPING COMPANIES
// ═══════════════════════════════════════════════════════════════════════════════

export const getShippingCompanies = asyncHandler(async (req, res) => {
    const settings = await getOrCreateSettings();
    return res.status(200).json(new ApiResponse(200, settings.shippingCompanies, "Shipping companies fetched"));
});

export const addShippingCompany = asyncHandler(async (req, res) => {
    const { name, trackingUrl, active } = req.body;
    if (!name?.trim()) throw new ApiError(400, "Company name is required");
    const settings = await getOrCreateSettings();
    settings.shippingCompanies.push({ name: name.trim(), trackingUrl: trackingUrl || "", active: active !== false });
    await settings.save();
    return res.status(201).json(new ApiResponse(201, settings.shippingCompanies, "Shipping company added"));
});

export const updateShippingCompany = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, trackingUrl, active } = req.body;
    const settings = await getOrCreateSettings();
    const company = settings.shippingCompanies.id(id);
    if (!company) throw new ApiError(404, "Shipping company not found");
    if (name?.trim()) company.name = name.trim();
    if (trackingUrl !== undefined) company.trackingUrl = trackingUrl;
    if (typeof active !== "undefined") company.active = active;
    await settings.save();
    return res.status(200).json(new ApiResponse(200, settings.shippingCompanies, "Shipping company updated"));
});

export const deleteShippingCompany = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const settings = await getOrCreateSettings();
    const company = settings.shippingCompanies.id(id);
    if (!company) throw new ApiError(404, "Shipping company not found");
    company.deleteOne();
    await settings.save();
    return res.status(200).json(new ApiResponse(200, settings.shippingCompanies, "Shipping company deleted"));
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTIMONIALS
// ═══════════════════════════════════════════════════════════════════════════════

export const getTestimonials = asyncHandler(async (req, res) => {
    const settings = await getOrCreateSettings();
    // Public endpoint — return only active ones if ?active=true passed
    const { active } = req.query;
    const list = active === "true"
        ? settings.testimonials.filter(t => t.active)
        : settings.testimonials;
    return res.status(200).json(new ApiResponse(200, list, "Testimonials fetched"));
});

export const addTestimonial = asyncHandler(async (req, res) => {
    const { name, rating, text } = req.body;
    if (!name?.trim()) throw new ApiError(400, "Name is required");
    const settings = await getOrCreateSettings();
    settings.testimonials.push({ name: name.trim(), rating: Number(rating) || 5, text: text?.trim() || "", active: true });
    await settings.save();
    return res.status(201).json(new ApiResponse(201, settings.testimonials, "Testimonial added"));
});

export const updateTestimonial = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, rating, text, active } = req.body;
    const settings = await getOrCreateSettings();
    const testimonial = settings.testimonials.id(id);
    if (!testimonial) throw new ApiError(404, "Testimonial not found");
    if (name?.trim()) testimonial.name = name.trim();
    if (rating !== undefined) testimonial.rating = Number(rating);
    if (text !== undefined) testimonial.text = text.trim();
    if (typeof active !== "undefined") testimonial.active = active;
    await settings.save();
    return res.status(200).json(new ApiResponse(200, settings.testimonials, "Testimonial updated"));
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const settings = await getOrCreateSettings();
    const testimonial = settings.testimonials.id(id);
    if (!testimonial) throw new ApiError(404, "Testimonial not found");
    testimonial.deleteOne();
    await settings.save();
    return res.status(200).json(new ApiResponse(200, settings.testimonials, "Testimonial deleted"));
});
