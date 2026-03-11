const Property = require("../models/Property");
const cloudinary = require("../config/cloudinary");

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

// ─────────────────────────────────────────────
// @desc   Get a single property by ID
// @route  GET /api/properties/:id
// @access Public
// ─────────────────────────────────────────────
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }
    res.status(200).json({ property });
  } catch (error) {
    console.error("getPropertyById error:", error);
    res.status(500).json({ message: "Failed to fetch property." });
  }
};

// ─────────────────────────────────────────────
// @desc   Update a property by ID
// @route  PUT /api/properties/:id
// @access Private (admin)
// ─────────────────────────────────────────────
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

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

    if (name) property.name = name;
    if (address) property.address = address;
    if (totalUnits !== undefined) property.totalUnits = Number(totalUnits);
    if (floors !== undefined) property.floors = Number(floors);
    if (landSize !== undefined) property.landSize = landSize;
    if (handoverTime !== undefined) property.handoverTime = handoverTime;
    if (parkingArea !== undefined) property.parkingArea = parkingArea;

    if (apartmentSizes) {
      try {
        property.apartmentSizes = JSON.parse(apartmentSizes);
      } catch {
        // keep existing if parse fails
      }
    }

    // Handle new main image
    if (req.files?.mainImage?.[0]) {
      // Optional: Delete old main image from Cloudinary
      if (property.mainImagePublicId) {
        try {
          await cloudinary.uploader.destroy(property.mainImagePublicId);
        } catch (err) {
          console.error("Cloudinary mainImage deletion error:", err);
        }
      }
      property.mainImage = req.files.mainImage[0].path;
      property.mainImagePublicId = req.files.mainImage[0].filename;
    }

    // Handle extra images (Replace old ones)
    if (req.files?.extraImages) {
      // Optional: Delete old extra images from Cloudinary
      if (property.extraImagePublicIds && property.extraImagePublicIds.length > 0) {
        for (const publicId of property.extraImagePublicIds) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error("Cloudinary extraImage deletion error:", err);
          }
        }
      }
      property.extraImages = req.files.extraImages.map((f) => f.path);
      property.extraImagePublicIds = req.files.extraImages.map((f) => f.filename);
    }

    await property.save();

    res.status(200).json({ message: "Property updated successfully.", property });
  } catch (error) {
    console.error("updateProperty error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    res.status(500).json({ message: "Failed to update property." });
  }
};

// ─────────────────────────────────────────────
// @desc   Delete a single property by ID
// @route  DELETE /api/properties/:id
// @access Private (admin)
// ─────────────────────────────────────────────
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    // Delete Main Image from Cloudinary
    if (property.mainImagePublicId) {
      try {
        await cloudinary.uploader.destroy(property.mainImagePublicId);
      } catch (err) {
        console.error("Cloudinary mainImage deletion error:", err);
      }
    }

    // Delete Extra Images from Cloudinary
    if (property.extraImagePublicIds && property.extraImagePublicIds.length > 0) {
      for (const publicId of property.extraImagePublicIds) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Cloudinary extraImage deletion error:", err);
        }
      }
    }

    await Property.findByIdAndDelete(id);

    res.status(200).json({ message: "Property deleted successfully." });
  } catch (error) {
    console.error("deleteProperty error:", error);
    res.status(500).json({ message: "Failed to delete property." });
  }
};

module.exports = { createProperty, getProperties, getPropertyById, updateProperty, deleteProperty };
