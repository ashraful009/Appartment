const cloudinary = require("../config/cloudinary");
const Document   = require("../models/Document");

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/documents
// Upload a new document file to Cloudinary and persist the record.
// Requires: title in req.body, file in req.file (via uploadDocumentFile middleware)
// ─────────────────────────────────────────────────────────────────────────────
const uploadDocument = async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    if (!title) {
      return res.status(400).json({ message: "Document title is required." });
    }

    // multer-storage-cloudinary sets these on req.file after upload
    const fileUrl  = req.file.path;       // Cloudinary secure_url
    const publicId = req.file.filename;   // Cloudinary public_id

    const document = await Document.create({
      user:     req.user._id,
      title,
      fileUrl,
      publicId,
    });

    res.status(201).json({
      success:  true,
      message:  "Document uploaded successfully.",
      document,
    });
  } catch (error) {
    console.error("uploadDocument error:", error);
    res.status(500).json({ success: false, message: "Failed to upload document." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/documents
// Retrieve all documents belonging to the logged-in user, newest first.
// ─────────────────────────────────────────────────────────────────────────────
const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user._id })
      .sort({ uploadedAt: -1 })
      .lean();

    res.status(200).json({ success: true, documents });
  } catch (error) {
    console.error("getMyDocuments error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch documents." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/documents/:id
// Delete a document from Cloudinary and remove the MongoDB record.
// Only the owning user OR an admin may delete.
// ─────────────────────────────────────────────────────────────────────────────
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    // ── Ownership / admin guard ───────────────────────────────────────────
    const isOwner = document.user.toString() === req.user._id.toString();
    const isAdmin = req.user.roles?.includes("admin");

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorised to delete this document." });
    }

    // ── Delete from Cloudinary first ─────────────────────────────────────
    // Use resource_type: "raw" so PDFs and other non-image files are handled.
    await cloudinary.uploader.destroy(document.publicId, {
      resource_type: "raw",
    });

    // ── Delete the MongoDB record ────────────────────────────────────────
    await document.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Document deleted successfully." });
  } catch (error) {
    console.error("deleteDocument error:", error);
    res.status(500).json({ success: false, message: "Failed to delete document." });
  }
};

module.exports = { uploadDocument, getMyDocuments, deleteDocument };
