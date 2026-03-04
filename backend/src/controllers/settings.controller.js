import { asyncHandler } from "../utils/asyncHandler.js";
import { SiteSettings } from "../models/settings.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Ensure a settings document exists (singleton)
const getOrCreateSettings = async () => {
    let settings = await SiteSettings.findOne();
    if (!settings) {
        settings = await SiteSettings.create({});
    }
    return settings;
};

// Public route to check maintenance mode
export const getMaintenanceStatus = asyncHandler(async (req, res) => {
    const settings = await getOrCreateSettings();
    return res.status(200).json(
        new ApiResponse(200, {
            isMaintenanceMode: settings.isMaintenanceMode,
            maintenanceMessage: settings.maintenanceMessage
        }, "Maintenance status fetched successfully")
    );
});

// Admin ONLY route to update maintenance settings
export const updateMaintenanceSettings = asyncHandler(async (req, res) => {
    const { isMaintenanceMode, maintenanceMessage, razorpayKey, razorpaySecret, razorpayWebhookSecret } = req.body;

    let settings = await getOrCreateSettings();

    if (typeof isMaintenanceMode !== 'undefined') {
        settings.isMaintenanceMode = isMaintenanceMode;
    }
    if (typeof maintenanceMessage !== 'undefined') {
        settings.maintenanceMessage = maintenanceMessage;
    }
    if (typeof razorpayKey !== 'undefined') {
        settings.razorpayKey = razorpayKey;
    }
    if (typeof razorpaySecret !== 'undefined') {
        settings.razorpaySecret = razorpaySecret;
    }
    if (typeof razorpayWebhookSecret !== 'undefined') {
        settings.razorpayWebhookSecret = razorpayWebhookSecret;
    }

    await settings.save();

    return res.status(200).json(
        new ApiResponse(200, settings, "Maintenance settings updated successfully")
    );
});
