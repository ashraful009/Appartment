const areaRepository = require("../repositories/AreaRepository");
const { isDuplicateKeyError } = require("../utils/dbUtils");

// ─────────────────────────────────────────────
// @desc   Create a new area
// @route  POST /api/areas
// @access Private (admin)
// ─────────────────────────────────────────────
const createArea = async (req, res) => {
  try {
    const { country, city, name } = req.body;

    if (!country || !country.trim() || !city || !city.trim() || !name || !name.trim()) {
      return res.status(400).json({ message: "Country, city, and area names are required." });
    }

    // Check for duplicate (case-insensitive)
    const existing = await areaRepository.db('areas')
      .whereRaw('LOWER(??) = LOWER(?)', ['country', country.trim()])
      .andWhereRaw('LOWER(??) = LOWER(?)', ['city', city.trim()])
      .andWhereRaw('LOWER(??) = LOWER(?)', ['name', name.trim()])
      .first();

    if (existing) {
      return res.status(409).json({ message: "An area with this exact country, city, and name already exists." });
    }

    const area = await areaRepository.create({
      country: country.trim(),
      city: city.trim(),
      name: name.trim()
    });

    res.status(201).json({ message: "Area created successfully.", area });
  } catch (error) {
    console.error("createArea error:", error);
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ message: "An area with this exact country, city, and name already exists." });
    }
    res.status(500).json({ message: "Failed to create area." });
  }
};

// ─────────────────────────────────────────────
// @desc   Get all areas (sorted alphabetically)
// @route  GET /api/areas
// @access Public (used in dropdowns)
// ─────────────────────────────────────────────
const getAreas = async (req, res) => {
  try {
    const areas = await areaRepository.db('areas').orderBy([
      { column: 'country', order: 'asc' },
      { column: 'city', order: 'asc' },
      { column: 'name', order: 'asc' }
    ]);
    res.status(200).json({ success: true, areas });
  } catch (error) {
    console.error("getAreas error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch areas." });
  }
};

// ─────────────────────────────────────────────
// @desc   Delete an area by ID
// @route  DELETE /api/areas/:id
// @access Private (admin)
// ─────────────────────────────────────────────
const deleteArea = async (req, res) => {
  try {
    const area = await areaRepository.findById(req.params.id);
    if (!area) {
      return res.status(404).json({ message: "Area not found." });
    }

    await areaRepository.delete(req.params.id);
    res.status(200).json({ message: "Area deleted successfully." });
  } catch (error) {
    console.error("deleteArea error:", error);
    res.status(500).json({ message: "Failed to delete area." });
  }
};

module.exports = {
  createArea,
  getAreas,
  deleteArea,
};
