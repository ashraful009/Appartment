const Property = require("../models/Property");

// ─────────────────────────────────────────────
// @desc   Create a new property / building
// @route  POST /api/properties
// @access Private (admin)
// ─────────────────────────────────────────────
const createProperty = async (req, res) => {
  try {
    const {
      name,
      address,
      totalUnits,
      floors,
      landSize,
      handoverTime,
      parkingArea,
      apartmentSizes, // JSON string from FormData
    } = req.body;

    if (!name || !address) {
      return res
        .status(400)
        .json({ message: "Property name and address are required." });
    }

    // Main image (single field upload)
    let mainImage         = null;
    let mainImagePublicId = null;
    if (req.files?.mainImage?.[0]) {
      mainImage         = req.files.mainImage[0].path;
      mainImagePublicId = req.files.mainImage[0].filename;
    }

    // Extra images (array field upload)
    let extraImages         = [];
    let extraImagePublicIds = [];
    if (req.files?.extraImages) {
      extraImages         = req.files.extraImages.map((f) => f.path);
      extraImagePublicIds = req.files.extraImages.map((f) => f.filename);
    }

    // apartmentSizes is sent as a JSON string from FormData
    let parsedSizes = [];
    if (apartmentSizes) {
      try {
        parsedSizes = JSON.parse(apartmentSizes);
      } catch {
        parsedSizes = [];
      }
    }

    const property = await Property.create({
      name,
      address,
      mainImage,
      mainImagePublicId,
      extraImages,
      extraImagePublicIds,
      totalUnits:    totalUnits    ? Number(totalUnits)    : 0,
      floors:        floors        ? Number(floors)        : 0,
      landSize:      landSize      || "",
      handoverTime:  handoverTime  || "",
      parkingArea:   parkingArea   || "",
      apartmentSizes: parsedSizes,
    });

    res.status(201).json({ message: "Property created successfully.", property });
  } catch (error) {
    console.error("createProperty error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    res.status(500).json({ message: "Failed to create property." });
  }
};

// ─────────────────────────────────────────────
// @desc   Get all properties
// @route  GET /api/properties
// @access Public
// ─────────────────────────────────────────────
const getProperties = async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.status(200).json({ properties });
  } catch (error) {
    console.error("getProperties error:", error);
    res.status(500).json({ message: "Failed to fetch properties." });
  }
};

module.exports = { createProperty, getProperties };
