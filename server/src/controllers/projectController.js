const projectRepository = require("../repositories/ProjectRepository");

// Parse a "YYYY-MM" month-picker value into a Date at the 1st of that month.
const parseMonthYear = (value) => {
  if (!value) return null;
  const d = new Date(`${value}-01T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    List projects (running + completed), optionally filtered by status
// @route   GET /api/projects?status=     (members/investors)
// @route   GET /api/admin/projects        (admin)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getProjects = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const projects = await projectRepository.db('projects')
        .where(filter)
        .orderBy('created_at', 'desc');
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server error fetching projects." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a project
// @route   POST /api/admin/projects   (multipart: field "mainImage")
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
const createProject = async (req, res) => {
  try {
    const { name, description, status, expectedCompleteDate } = req.body;
    if (!name) return res.status(400).json({ message: "Project name is required." });

    const cover_image = req.files?.mainImage?.[0]?.path || req.file?.path || "";

    const project = await projectRepository.create({
      name,
      description: description || "",
      status: status === "completed" ? "completed" : "running",
      expected_complete_date: parseMonthYear(expectedCompleteDate),
      cover_image,
    });

    res.status(201).json({ message: "Project created.", project });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Server error creating project." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update a project
// @route   PUT /api/admin/projects/:id   (multipart: field "mainImage")
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
const updateProject = async (req, res) => {
  try {
    const project = await projectRepository.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });

    const { name, description, status, expectedCompleteDate } = req.body;
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status === "completed" ? "completed" : "running";
    if (expectedCompleteDate !== undefined)
      updates.expected_complete_date = parseMonthYear(expectedCompleteDate);

    const cover_image = req.files?.mainImage?.[0]?.path || req.file?.path;
    if (cover_image) updates.cover_image = cover_image;

    const updatedProject = await projectRepository.update(req.params.id, updates);
    res.status(200).json({ message: "Project updated.", project: updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Server error updating project." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a project
// @route   DELETE /api/admin/projects/:id
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
const deleteProject = async (req, res) => {
  try {
    const project = await projectRepository.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });
    
    await projectRepository.delete(req.params.id);
    res.status(200).json({ message: "Project deleted." });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Server error deleting project." });
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};
