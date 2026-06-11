import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { DogPage } from "../models/dogPage.model.js";

// ── Helper: get or seed the single config document ────────────────────────────
const getOrCreateConfig = async () => {
    let config = await DogPage.findOne();
    if (!config) {
        config = await DogPage.create({});
    }
    return config;
};

// ── GET /api/dog-page  (public) ───────────────────────────────────────────────
const getDogPageConfig = asyncHandler(async (req, res) => {
    const config = await getOrCreateConfig();
    return res.status(200).json(new ApiResponse(200, config, "Dog page config fetched"));
});

// ── PUT /api/dog-page  (admin only) ──────────────────────────────────────────
const updateDogPageConfig = asyncHandler(async (req, res) => {
    const { hero, categories, features, cta, homeSection } = req.body;

    const config = await getOrCreateConfig();

    if (hero !== undefined)        config.hero        = { ...config.hero.toObject?.() ?? config.hero, ...hero };
    if (categories !== undefined)  config.categories  = categories;
    if (features !== undefined)    config.features    = features;
    if (cta !== undefined)         config.cta         = { ...config.cta.toObject?.() ?? config.cta, ...cta };
    if (homeSection !== undefined) config.homeSection = { ...config.homeSection.toObject?.() ?? config.homeSection, ...homeSection };

    await config.save();

    return res.status(200).json(new ApiResponse(200, config, "Dog page config updated"));
});

export { getDogPageConfig, updateDogPageConfig };
