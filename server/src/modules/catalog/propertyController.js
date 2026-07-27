const propertyRepository = require("../../repositories/PropertyRepository");
const apartmentUnitRepository = require("../../repositories/ApartmentUnitRepository");
const userRepository = require("../../repositories/UserRepository");
const areaRepository = require("../../repositories/AreaRepository");
const cloudinary = require("../../config/cloudinary");
const { withGeneratedIds } = require("../../utils/dbUtils");

const formatProperty = (p) => {
  if (!p) return p;
  
  let extraImages = [];
  try { extraImages = typeof p.extra_images === 'string' ? JSON.parse(p.extra_images) : p.extra_images || []; } catch(e) {}
  
  let apartmentSizes = [];
  try { apartmentSizes = typeof p.apartment_sizes === 'string' ? JSON.parse(p.apartment_sizes) : p.apartment_sizes || []; } catch(e) {}

  let progressImages = [];
  try { progressImages = typeof p.progress_images === 'string' ? JSON.parse(p.progress_images) : p.progress_images || []; } catch(e) {}

  let mapLocation = { lat: null, lng: null };
  try { mapLocation = typeof p.map_location === 'string' ? JSON.parse(p.map_location) : p.map_location || {lat:null, lng:null}; } catch(e) {}

  return {
    ...p,
    _id: p.id,
    mainImage: p.main_image,
    extraImages,
    totalUnits: p.total_units,
    landSize: p.land_size,
    handoverTime: p.handover_time,
    parkingArea: p.parking_area,
    mapLocation,
    displayOrder: p.display_order,
    apartmentSizes,
    totalPrice: p.total_price,
    totalSqft: p.total_sqft,
    progressVideoUrl: p.progress_video_url,
    progressImages,
  };
};






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
      mapLocation,
      displayOrder,
      apartmentSizes,
      area,
      status,
      totalPrice,
      totalSqft,
      progressVideoUrl,
    } = req.body;

    if (!name || !address || !description) {
      return res
        .status(400)
        .json({ message: "Property name, address, and description are required." });
    }

    let main_image = null;
    let main_image_public_id = null;
    if (req.files?.mainImage?.[0]) {
      main_image = req.files.mainImage[0].path;
      main_image_public_id = req.files.mainImage[0].filename;
    }

    let extra_images = [];
    let extra_image_public_ids = [];
    if (req.files?.extraImages) {
      extra_images = req.files.extraImages.map((f) => f.path);
      extra_image_public_ids = req.files.extraImages.map((f) => f.filename);
    }

    let progress_images = [];
    let progress_image_public_ids = [];
    if (req.files?.progressImages) {
      progress_images = req.files.progressImages.map((f) => f.path);
      progress_image_public_ids = req.files.progressImages.map((f) => f.filename);
    }

    let parsedSizes = [];
    if (apartmentSizes) {
      try {
        parsedSizes = typeof apartmentSizes === "string" ? JSON.parse(apartmentSizes) : apartmentSizes;
      } catch {
        parsedSizes = [];
      }
    }

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

    const property = await propertyRepository.create({
      name,
      address,
      main_image,
      main_image_public_id,
      extra_images: JSON.stringify(extra_images),
      extra_image_public_ids: JSON.stringify(extra_image_public_ids),
      total_units: totalUnits ? Number(totalUnits) : 0,
      floors: floors ? Number(floors) : 0,
      land_size: landSize || "",
      handover_time: handoverTime || "",
      parking_area: parkingArea || "",
      description: description || "",
      map_location: JSON.stringify(parsedMapLocation),
      display_order: displayOrder !== undefined ? Number(displayOrder) : 999,
      apartment_sizes: JSON.stringify(parsedSizes),
      area_id: area || null,
      status: status || "Ongoing",
      total_price: totalPrice ? Number(totalPrice) : 0,
      total_sqft: totalSqft ? Number(totalSqft) : 0,
      progress_video_url: progressVideoUrl || "",
      progress_images: JSON.stringify(progress_images),
      progress_image_public_ids: JSON.stringify(progress_image_public_ids),
    });

    if (property.total_units > 0 && property.floors > 0) {
      const unitsPerFloor = Math.floor(property.total_units / property.floors);
      const unitsArray = [];

      for (let f = 1; f <= property.floors; f++) {
        for (let u = 1; u <= unitsPerFloor; u++) {
          const columnLine = String.fromCharCode(64 + u);
          const unitName = `${columnLine}-${f}`;

          unitsArray.push({
            property_id: property.id,
            floor: f,
            column_line: columnLine,
            unit_name: unitName,
            status: "Unsold",
          });
        }
      }

      if (unitsArray.length > 0) {
        await apartmentUnitRepository.db('apartment_units').insert(withGeneratedIds(unitsArray));
      }
    }

    res.status(201).json({ message: "Property created successfully.", property });
  } catch (error) {
    console.error("createProperty error:", error);
    res.status(500).json({ message: "Failed to create property." });
  }
};




const getProperties = async (req, res) => {
  try {
    const properties = await propertyRepository.db('properties')
      .orderBy('display_order', 'asc')
      .orderBy('updated_at', 'desc');
    return res.status(200).json({ success: true, properties: properties.map(formatProperty) });
  } catch (error) {
    console.error("getProperties error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch properties." });
  }
};




const getPublicProperties = async (req, res) => {
  try {
    const {
      page: rawPage,
      limit: rawLimit,
      country,
      city,
      area,
      status,
      minPrice,
      maxPrice,
      minSqft,
      maxSqft,
      noPaginate,
    } = req.query;

    const query = propertyRepository.db('properties')
      .leftJoin('areas', 'properties.area_id', 'areas.id')
      .select('properties.*', 'areas.name as area_name', 'areas.city as area_city', 'areas.country as area_country');

    if (area) {
      query.where('properties.area_id', area);
    } else if (country || city) {
      if (country) query.where('areas.country', country);
      if (city) query.where('areas.city', city);
    }

    if (status) query.where('properties.status', status);

    if (minPrice || maxPrice) {
      if (minPrice) query.where('properties.total_price', '>=', Number(minPrice) - 500000);
      if (maxPrice) query.where('properties.total_price', '<=', Number(maxPrice) + 500000);
    }

    if (minSqft || maxSqft) {
      if (minSqft) query.where('properties.total_sqft', '>=', Number(minSqft));
      if (maxSqft) query.where('properties.total_sqft', '<=', Number(maxSqft));
    }

    query.orderBy('properties.display_order', 'asc').orderBy('properties.updated_at', 'desc');

    if (noPaginate === "true") {
      const properties = await query;
      return res.status(200).json({
        success: true,
        properties: properties.map(formatProperty),
        totalProperties: properties.length,
      });
    }

    const page = parseInt(rawPage, 10) || 1;
    const limit = parseInt(rawLimit, 10) || 6;
    const skip = (page - 1) * limit;

    const properties = await query.clone().offset(skip).limit(limit);
    const countResult = await propertyRepository.db.from(query.clone().as('t')).count('id as total').first();
    const total = parseInt(countResult.total, 10);

    return res.status(200).json({
      success: true,
      properties: properties.map(formatProperty),
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProperties: total,
    });
  } catch (error) {
    console.error("getPublicProperties error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch properties." });
  }
};




const getPropertyById = async (req, res) => {
  try {
    const property = await propertyRepository.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    if (property.area_id) {
      const area = await areaRepository.findById(property.area_id);
      if (area) {
        property.area = area;
      }
    }

    res.status(200).json({ property: formatProperty(property) });
  } catch (error) {
    console.error("getPropertyById error:", error);
    res.status(500).json({ message: "Failed to fetch property." });
  }
};




const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await propertyRepository.findById(id);

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
      mapLocation,
      displayOrder,
      apartmentSizes,
      area,
      status,
      totalPrice,
      totalSqft,
      progressVideoUrl,
    } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (address) updates.address = address;
    if (description !== undefined) updates.description = description;
    if (totalUnits !== undefined) updates.total_units = Number(totalUnits);
    if (floors !== undefined) updates.floors = Number(floors);
    if (landSize !== undefined) updates.land_size = landSize;
    if (handoverTime !== undefined) updates.handover_time = handoverTime;
    if (parkingArea !== undefined) updates.parking_area = parkingArea;
    if (displayOrder !== undefined) updates.display_order = Number(displayOrder);
    if (area !== undefined) updates.area_id = area || null;
    if (status !== undefined) updates.status = status;
    if (totalPrice !== undefined) updates.total_price = totalPrice ? Number(totalPrice) : 0;
    if (totalSqft !== undefined) updates.total_sqft = totalSqft ? Number(totalSqft) : 0;
    if (progressVideoUrl !== undefined) updates.progress_video_url = progressVideoUrl;

    if (mapLocation !== undefined) {
      try {
        updates.map_location = typeof mapLocation === "string" ? mapLocation : JSON.stringify(mapLocation);
      } catch {}
    }

    if (apartmentSizes) {
      try {
        updates.apartment_sizes = typeof apartmentSizes === "string" ? apartmentSizes : JSON.stringify(apartmentSizes);
      } catch {}
    }

    if (req.files?.mainImage?.[0]) {
      if (property.main_image_public_id) {
        try { await cloudinary.uploader.destroy(property.main_image_public_id); } catch (err) {}
      }
      updates.main_image = req.files.mainImage[0].path;
      updates.main_image_public_id = req.files.mainImage[0].filename;
    }

    if (req.files?.extraImages) {
      if (property.extra_image_public_ids && property.extra_image_public_ids.length > 0) {
        for (const publicId of property.extra_image_public_ids) {
          try { await cloudinary.uploader.destroy(publicId); } catch (err) {}
        }
      }
      updates.extra_images = JSON.stringify(req.files.extraImages.map((f) => f.path));
      updates.extra_image_public_ids = JSON.stringify(req.files.extraImages.map((f) => f.filename));
    }

    if (req.files?.progressImages) {
      if (property.progress_image_public_ids && property.progress_image_public_ids.length > 0) {
        for (const publicId of property.progress_image_public_ids) {
          try { await cloudinary.uploader.destroy(publicId); } catch (err) {}
        }
      }
      updates.progress_images = JSON.stringify(req.files.progressImages.map((f) => f.path));
      updates.progress_image_public_ids = JSON.stringify(req.files.progressImages.map((f) => f.filename));
    }

    const updatedProperty = await propertyRepository.update(id, updates);

    res.status(200).json({ message: "Property updated successfully.", property: updatedProperty });
  } catch (error) {
    console.error("updateProperty error:", error);
    res.status(500).json({ message: "Failed to update property." });
  }
};




const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await propertyRepository.findById(id);

    if (!property) return res.status(404).json({ message: "Property not found." });

    if (property.main_image_public_id) {
      try { await cloudinary.uploader.destroy(property.main_image_public_id); } catch (err) {}
    }

    if (property.extra_image_public_ids && property.extra_image_public_ids.length > 0) {
      for (const publicId of property.extra_image_public_ids) {
        try { await cloudinary.uploader.destroy(publicId); } catch (err) {}
      }
    }

    if (property.progress_image_public_ids && property.progress_image_public_ids.length > 0) {
      for (const publicId of property.progress_image_public_ids) {
        try { await cloudinary.uploader.destroy(publicId); } catch (err) {}
      }
    }

    await propertyRepository.delete(id);
    res.status(200).json({ message: "Property deleted successfully." });
  } catch (error) {
    console.error("deleteProperty error:", error);
    res.status(500).json({ message: "Failed to delete property." });
  }
};




const getPropertyUnits = async (req, res) => {
  try {
    const { id } = req.params;
    const units = await apartmentUnitRepository.db('apartment_units')
      .where({ property_id: id })
      .leftJoin('users as actionBy', 'apartment_units.action_by', 'actionBy.id')
      .select('apartment_units.*', 'actionBy.name as action_by_name', 'actionBy.roles as action_by_roles', 'actionBy.phone as action_by_phone')
      .orderBy('floor', 'asc')
      .orderBy('column_line', 'asc');

    const isAdmin = req.user?.roles?.includes("admin");

    const maskedUnits = units.map((u) => {
      
      if (u.action_by) {
        u.actionBy = { id: u.action_by, name: u.action_by_name, roles: u.action_by_roles, phone: u.action_by_phone };
      } else {
        u.actionBy = null;
      }
      
      if (!isAdmin) {
        delete u.customer_name;
        delete u.customer_phone;
      }
      return u;
    });

    res.status(200).json({ success: true, units: maskedUnits });
  } catch (error) {
    console.error("getPropertyUnits error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch property units." });
  }
};




const updateUnitAction = async (req, res) => {
  try {
    const { unitId } = req.params;
    const { actionType, customerName, customerPhone, actionRoleContext } = req.body;

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

    const unit = await apartmentUnitRepository.findById(unitId);
    if (!unit) return res.status(404).json({ success: false, message: "Unit not found." });

    const updates = { status: actionType };

    if (actionType === "Unsold") {
      updates.action_by = null;
      updates.action_timestamp = null;
      updates.customer_name = null;
      updates.customer_phone = null;
      updates.customer_id = null;
      updates.action_role_context = null;
    } else {
      const finalCustomerName = customerName || req.user.name;
      const finalCustomerPhone = customerPhone || req.user.phone;

      updates.action_by = req.user.id;
      updates.action_timestamp = apartmentUnitRepository.db.fn.now();
      updates.customer_name = finalCustomerName;
      updates.customer_phone = finalCustomerPhone;
      updates.action_role_context = actionRoleContext || null;

      if (finalCustomerPhone) {
        const existingUser = await userRepository.findOne({ phone: finalCustomerPhone });
        if (existingUser) {
          updates.customer_id = existingUser.id;

          const currentRoles = existingUser.roles || [];
          const updatedRoles = [...new Set([...currentRoles, "customer"])].filter((r) => r !== "user");
          
          if (JSON.stringify(updatedRoles.sort()) !== JSON.stringify([...currentRoles].sort())) {
            await userRepository.update(existingUser.id, { roles: updatedRoles });
            console.info(`[unitAction] User ${existingUser.id} (${existingUser.phone}) promoted to 'customer' (user role removed).`);
          }
        }
      }
    }

    const updatedUnit = await apartmentUnitRepository.update(unitId, updates);
    res.status(200).json({ success: true, message: "Unit updated successfully.", unit: updatedUnit });
  } catch (error) {
    console.error("updateUnitAction error:", error);
    res.status(500).json({ success: false, message: "Failed to update unit action." });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPublicProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getPropertyUnits,
  updateUnitAction,
};
