const Property = require("../models/Property");
const ApartmentUnit = require("../models/ApartmentUnit");
const User = require("../models/User");
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
      description,
      mapLocation,    // JSON string or object from FormData
      displayOrder,
      apartmentSizes, // JSON string from FormData
    } = req.body;

    if (!name || !address || !description) {
      return res
        .status(400)
        .json({ message: "Property name, address, and description are required." });
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

    // mapLocation is sent as a JSON string from FormData
    let parsedMapLocation = { lat: null, lng: null };
    if (mapLocation) {
      try {
        parsedMapLocation = typeof mapLocation === "string"
          ? JSON.parse(mapLocation)
          : mapLocation;
      } catch {
        parsedMapLocation = { lat: null, lng: null };
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
      description:   description   || "",
      mapLocation:   parsedMapLocation,
      displayOrder:  displayOrder  !== undefined ? Number(displayOrder) : 999,
      apartmentSizes: parsedSizes,
    });

    // Pre-generate apartment units
    if (property.totalUnits > 0 && property.floors > 0) {
      const unitsPerFloor = Math.floor(property.totalUnits / property.floors);
      const unitsArray = [];

      for (let f = 1; f <= property.floors; f++) {
        for (let u = 1; u <= unitsPerFloor; u++) {
          const columnLine = String.fromCharCode(64 + u); // 65 is 'A'
          const unitName = `${columnLine}-${f}`;

          unitsArray.push({
            propertyId: property._id,
            floor: f,
            columnLine,
            unitName,
            status: "Unsold",
          });
        }
      }

      if (unitsArray.length > 0) {
        await ApartmentUnit.insertMany(unitsArray);
      }
    }

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

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get ALL properties — ADMIN (no pagination, complete list for management)
// @route  GET /api/admin/properties
// @access Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getProperties = async (req, res) => {
  try {
    // No filters (admins see drafts/unpublished too), no skip/limit
    const properties = await Property.find({})
      .sort({ displayOrder: 1, updatedAt: -1 });
    return res.status(200).json({ success: true, properties });
  } catch (error) {
    console.error("getProperties error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch properties." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get paginated properties — PUBLIC home page
// @route  GET /api/properties/public?page=1&limit=6
// @access Public
// Note:   No filter sidebar — only pagination + displayOrder sort.
//         Add { isPublished: true } filter here once that field is added to the schema.
// ─────────────────────────────────────────────────────────────────────────────
const getPublicProperties = async (req, res) => {
  try {
    const page  = parseInt(req.query.page,  10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const skip  = (page - 1) * limit;

    const filter = {}; // extend with { isPublished: true } when schema supports it

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .sort({ displayOrder: 1, updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Property.countDocuments(filter),
    ]);

    return res.status(200).json({
      success:         true,
      properties,
      currentPage:     page,
      totalPages:      Math.ceil(total / limit),
      totalProperties: total,
    });
  } catch (error) {
    console.error("getPublicProperties error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch properties." });
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
      description,
      mapLocation,    // JSON string or object from FormData
      displayOrder,
      apartmentSizes, // JSON string from FormData
    } = req.body;

    if (name) property.name = name;
    if (address) property.address = address;
    if (description !== undefined) property.description = description;
    if (totalUnits !== undefined) property.totalUnits = Number(totalUnits);
    if (floors !== undefined) property.floors = Number(floors);
    if (landSize !== undefined) property.landSize = landSize;
    if (handoverTime !== undefined) property.handoverTime = handoverTime;
    if (parkingArea !== undefined) property.parkingArea = parkingArea;
    if (displayOrder !== undefined) property.displayOrder = Number(displayOrder);

    if (mapLocation !== undefined) {
      try {
        property.mapLocation = typeof mapLocation === "string"
          ? JSON.parse(mapLocation)
          : mapLocation;
      } catch {
        // keep existing if parse fails
      }
    }

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

// ─────────────────────────────────────────────
// @desc   Get all apartment units for a specific property
// @route  GET /api/admin/properties/:id/units
// @access Private (admin)
// ─────────────────────────────────────────────
const getPropertyUnits = async (req, res) => {
  try {
    const { id } = req.params;
    const units = await ApartmentUnit.find({ propertyId: id })
      .populate("actionBy", "name roles phone")
      .sort({ floor: 1, columnLine: 1 });

    const isAdmin = req.user?.roles?.includes("admin");

    const maskedUnits = units.map((u) => {
      const unitObj = u.toObject();
      if (!isAdmin) {
        delete unitObj.customerName;
        delete unitObj.customerPhone;
      }
      return unitObj;
    });

    res.status(200).json({ success: true, units: maskedUnits });
  } catch (error) {
    console.error("getPropertyUnits error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch property units." });
  }
};

// ─────────────────────────────────────────────
// @desc   Update unit action (Sold / Booked / Unsold)
// @route  PUT /api/units/:unitId/action
// @access Private (admin, seller)
// ─────────────────────────────────────────────
const updateUnitAction = async (req, res) => {
  try {
    const { unitId } = req.params;
    const { actionType, customerName, customerPhone, actionRoleContext } = req.body;

    // ── Validate actionRoleContext (required for Sold/Booked) ────────────────
    const VALID_ACTION_ROLES = ["admin", "seller", "Director", "GM", "AGM", "Accountent"];
    if (actionType !== "Unsold") {
      if (!actionRoleContext || !VALID_ACTION_ROLES.includes(actionRoleContext)) {
        return res.status(400).json({
          success: false,
          message: `actionRoleContext is required and must be one of: ${VALID_ACTION_ROLES.join(", ")}.`,
        });
      }
      if (!req.user.roles.includes(actionRoleContext)) {
        return res.status(403).json({
          success: false,
          message: `You do not hold the '${actionRoleContext}' role and cannot act in that context.`,
        });
      }
    }

    if (!["Sold", "Booked", "Unsold"].includes(actionType)) {
      return res.status(400).json({ success: false, message: "Invalid action type." });
    }

    const unit = await ApartmentUnit.findById(unitId);
    if (!unit) {
      return res.status(404).json({ success: false, message: "Unit not found." });
    }

    unit.status = actionType;

    if (actionType === "Unsold") {
      // ── Clear all customer data ──────────────────────────────────────────
      unit.actionBy          = null;
      unit.actionTimestamp   = null;
      unit.customerName      = null;
      unit.customerPhone     = null;
      unit.customerId        = null;
      unit.actionRoleContext = null;
    } else {
      // ── Strict fallback to logged in user details ────────────────────────
      const finalCustomerName = customerName || req.user.name;
      const finalCustomerPhone = customerPhone || req.user.phone;

      // ── Record who performed the action ──────────────────────────────────
      unit.actionBy          = req.user._id;
      unit.actionTimestamp   = Date.now();
      unit.customerName      = finalCustomerName;
      unit.customerPhone     = finalCustomerPhone;
      unit.actionRoleContext = actionRoleContext  || null;

      // ── Auto-conversion: link registered user + promote to 'customer' ────
      if (finalCustomerPhone) {
        const existingUser = await User.findOne({ phone: finalCustomerPhone });

        if (existingUser) {
          // Attach the strong ObjectId reference to the unit
          unit.customerId = existingUser._id;

          // Promote to 'customer' and strip the base 'user' role.
          // Using a filtered Set makes this idempotent — safe to call multiple times.
          const updatedRoles = [...new Set([...existingUser.roles, "customer"])].filter(
            (r) => r !== "user"
          );
          if (JSON.stringify(updatedRoles.sort()) !== JSON.stringify([...existingUser.roles].sort())) {
            existingUser.roles = updatedRoles;
            await existingUser.save();
            console.info(
              `[unitAction] User ${existingUser._id} (${existingUser.phone}) promoted to 'customer' (user role removed).`
            );
          }

        }
      }
    }

    await unit.save();
    await unit.populate("actionBy", "name roles phone");

    res.status(200).json({ success: true, message: "Unit updated successfully.", unit });
  } catch (error) {
    console.error("updateUnitAction error:", error);
    res.status(500).json({ success: false, message: "Failed to update unit action." });
  }
};

module.exports = {
  createProperty,
  getProperties,        // admin — all records, no pagination
  getPublicProperties,  // public home page — paginated
  getPropertyById,
  updateProperty,
  deleteProperty,
  getPropertyUnits,
  updateUnitAction,
};
