import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
    getMaintenanceStatus,
    updateMaintenanceSettings,
    // Categories
    getCategories, addCategory, updateCategory, deleteCategory,
    // Sub-categories
    getSubCategories, addSubCategory, updateSubCategory, deleteSubCategory,
    // Tax
    getTaxRates, addTaxRate, updateTaxRate, deleteTaxRate,
    // Shipping charges
    getShippingCharges, addShippingCharge, updateShippingCharge, deleteShippingCharge,
    // Shipping companies
    getShippingCompanies, addShippingCompany, updateShippingCompany, deleteShippingCompany,
    // Testimonials
    getTestimonials, addTestimonial, updateTestimonial, deleteTestimonial,
} from "../controllers/settings.controller.js";

const router = Router();

// ── Public routes ──────────────────────────────────────────────────────────────
router.get("/maintenance", getMaintenanceStatus);
router.get("/testimonials", getTestimonials); // also public (for storefront)

// ── Admin-only middleware ──────────────────────────────────────────────────────
router.use(verifyJWT, verifyAdmin);

// Maintenance / payment settings
router.put("/maintenance", updateMaintenanceSettings);

// ── Categories ─────────────────────────────────────────────────────────────────
router.get("/categories", getCategories);
router.post("/categories", addCategory);
router.put("/categories", updateCategory);
router.delete("/categories/:name", deleteCategory);

// ── Sub-categories ─────────────────────────────────────────────────────────────
router.get("/subcategories", getSubCategories);
router.post("/subcategories", addSubCategory);
router.put("/subcategories/:id", updateSubCategory);
router.delete("/subcategories/:id", deleteSubCategory);

// ── Tax rates ──────────────────────────────────────────────────────────────────
router.get("/tax-rates", getTaxRates);
router.post("/tax-rates", addTaxRate);
router.put("/tax-rates/:id", updateTaxRate);
router.delete("/tax-rates/:id", deleteTaxRate);

// ── Shipping charges ───────────────────────────────────────────────────────────
router.get("/shipping-charges", getShippingCharges);
router.post("/shipping-charges", addShippingCharge);
router.put("/shipping-charges/:id", updateShippingCharge);
router.delete("/shipping-charges/:id", deleteShippingCharge);

// ── Shipping companies ─────────────────────────────────────────────────────────
router.get("/shipping-companies", getShippingCompanies);
router.post("/shipping-companies", addShippingCompany);
router.put("/shipping-companies/:id", updateShippingCompany);
router.delete("/shipping-companies/:id", deleteShippingCompany);

// ── Testimonials (admin CRUD) ──────────────────────────────────────────────────
router.post("/testimonials", addTestimonial);
router.put("/testimonials/:id", updateTestimonial);
router.delete("/testimonials/:id", deleteTestimonial);

export default router;
